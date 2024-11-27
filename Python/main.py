from fastapi import FastAPI, UploadFile, Form
from fastapi.responses import JSONResponse, StreamingResponse
from PyPDF2 import PdfReader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_google_genai import GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI
from langchain_community.vectorstores import FAISS
from langchain.prompts import PromptTemplate
from langchain.chains.question_answering import load_qa_chain
from PIL import Image
import fitz  
import io
import os
from dotenv import load_dotenv
import google.generativeai as genai
from fastapi.middleware.cors import CORSMiddleware
from Db import get_db, PDFData
from fastapi import Depends
from sqlalchemy.orm import Session  
from fastapi.staticfiles import StaticFiles
from fastapi import HTTPException
import shutil


load_dotenv()

# Configure Google Generative AI with API Key
api_key = os.getenv("GOOGLE_API_KEY")
if not api_key:
    raise EnvironmentError("GOOGLE_API_KEY is not set in the environment.")
genai.configure(api_key=api_key)

app = FastAPI()

app.mount("/temp_images", StaticFiles(directory="temp_images"), name="temp_images")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  
    allow_credentials=True,
    allow_methods=["*"],  
    allow_headers=["*"],  
)

# Function to extract text from PDF files
def extract_text_from_pdfs(files):
    text = ""
    for file in files:
        pdf_reader = PdfReader(file.file)
        for page in pdf_reader.pages:
            text += page.extract_text()
    return text

# Function to split text into chunks
def split_text_into_chunks(text):
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=10000, chunk_overlap=1000)
    return text_splitter.split_text(text)

# Function to create a vector store for a specific file
def create_vector_store(text_chunks, filename):
    embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001")
    vector_store = FAISS.from_texts(text_chunks, embedding=embeddings)
    vector_store.save_local(f"faiss_index_{filename}")


# Function to summarize text
def summarize_text(text):
    model = ChatGoogleGenerativeAI(model="gemini-pro", temperature=0.3)
    prompt_template = """
    Summarize the following text into a concise paragraph:
    {text}
    Summary:
    """
    prompt = PromptTemplate(template=prompt_template, input_variables=["text"])
    chain = load_qa_chain(model, chain_type="stuff", prompt=prompt)
    response = chain.invoke({"input_documents": [{"page_content": text}]})
    return response["output_text"]


# Endpoint to upload and process PDFs
@app.post("/upload/")
async def upload_pdfs(files: list[UploadFile], db: Session = Depends(get_db)):
    try:
        results = []
        for file in files:
            file_content = await file.read()

            # Extract text from the PDF
            raw_text = extract_text_from_pdfs([file])
            
            # Split text into chunks
            text_chunks = split_text_into_chunks(raw_text)
            
            # Create a vector store for this specific file
            create_vector_store(text_chunks, file.filename)
            
            # Load the vector store
            embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001")
            vector_store = FAISS.load_local(f"faiss_index_{file.filename}", embeddings, allow_dangerous_deserialization=True)
            
            # Perform a similarity search to retrieve all chunks for summarization
            docs = vector_store.similarity_search("Summarize this document")
            
            # Generate summary using the same model and prompt approach as in the `ask` endpoint
            prompt_template = """
            Summarize the following context into a in depth paragraphs:
            Context:\n {context}\n
            Summary:
            """
            prompt = PromptTemplate(template=prompt_template, input_variables=["context"])
            model = ChatGoogleGenerativeAI(model="gemini-pro", temperature=0.3)
            chain = load_qa_chain(model, chain_type="stuff", prompt=prompt)
            response = chain.invoke({"input_documents": docs, "question": "Summarize this document"})
            summary = response["output_text"]
            
            # Save file information to the database
            pdf_data = PDFData(
                file_name=file.filename, 
                file_content=file_content
            )            
            db.add(pdf_data)
            db.commit()
            db.refresh(pdf_data)
            
            # Append results
            results.append({
                "file_name": file.filename,
                "summary": summary
            })
        
        return JSONResponse({"message": "PDFs processed successfully!", "results": results})
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)

# Endpoint to handle conversational queries
@app.post("/ask/")
async def ask_question(question: str = Form(...), pdf_name: str = Form(...)):
    try:
        # Load vector store for the specific PDF
        embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001")
        vector_store = FAISS.load_local(f"faiss_index_{pdf_name}", embeddings, allow_dangerous_deserialization=True)
        
        # Perform similarity search
        docs = vector_store.similarity_search(question)
        
        # Create a conversational chain
        prompt_template = """
        Answer the question as detailed as possible from the provided context.If  
        the answer is not in the context  then fetch the answer from Gemain AI.
        Context:\n {context}\n
        Question:\n {question}\n
        Answer:
        """
        prompt = PromptTemplate(template=prompt_template, input_variables=["context", "question"])
        model = ChatGoogleGenerativeAI(model="gemini-pro", temperature=0.3)
        chain = load_qa_chain(model, chain_type="stuff", prompt=prompt)
        response = chain.invoke({"input_documents": docs, "question": question})
        
        return JSONResponse({"answer": response["output_text"]})
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)
    


@app.post("/quiz/")
async def generate_quiz(pdf_name: str = Form(...)):
    try:
        # Load the embeddings for the specific PDF
        embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001")
        vector_store = FAISS.load_local(f"faiss_index_{pdf_name}", embeddings, allow_dangerous_deserialization=True)
        # Retrieve documents from the vector store
        docs = vector_store.similarity_search("Generate a quiz")  # Query for quiz generation
        print(pdf_name)
        # If no relevant documents are found, return an error
        if not docs:
            return JSONResponse({"error": f"No relevant documents found for {pdf_name}."}, status_code=404)
        
        # Quiz generation prompt template
        quiz_prompt = """
        Generate a quiz from the following context. The quiz should contain multiple-choice questions with 4 options each. Clearly indicate the correct answer using the format: "Correct Answer: [option letter]". Avoid using any special formatting symbols like **. Use plain text formatting.

        Context:
        {context}

        Quiz:
        """
        prompt = PromptTemplate(template=quiz_prompt, input_variables=["context"])
        
        # Initialize the model
        model = ChatGoogleGenerativeAI(model="gemini-pro", temperature=0.3)
        
        # Create the chain for generating the quiz
        chain = load_qa_chain(model, chain_type="stuff", prompt=prompt)
        
        # Generate the quiz
        response = chain.invoke({"input_documents": docs, "question": "Generate a quiz"})
        
        return JSONResponse({"quiz": response["output_text"]})

    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)
    

# Endpoint to fetch data from the database
@app.get("/fetch_files/")
async def fetch_files(db: Session = Depends(get_db)):
    pdf_data = db.query(PDFData).all() 
    if not pdf_data:
        return JSONResponse({"message": "No PDF files found in the database.", "files": []})
    return {"files": [pdf.file_name for pdf in pdf_data]}

@app.post("/extract_images/")
async def extract_images(pdf_name: str = Form(...), db: Session = Depends(get_db)):
    try:
        # Retrieve the PDF data from the database
        pdf_data = db.query(PDFData).filter(PDFData.file_name == pdf_name).first()
        if not pdf_data:
            return JSONResponse({"error": f"PDF '{pdf_name}' not found in the database."}, status_code=404)

        # Read the PDF content
        pdf_bytes = io.BytesIO(pdf_data.file_content)
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")

        # Extract images from the PDF
        extracted_images = []
        for page_num in range(len(doc)):
            page = doc.load_page(page_num)
            for img_index, img in enumerate(page.get_images(full=True)):
                xref = img[0]
                base_image = doc.extract_image(xref)
                image_bytes = base_image["image"]
                image = Image.open(io.BytesIO(image_bytes))

                # Save the image temporarily
                image_path = f"temp_images/{pdf_name}_page_{page_num + 1}_img_{img_index + 1}.png"
                os.makedirs(os.path.dirname(image_path), exist_ok=True)
                image.save(image_path)
                extracted_images.append(image_path)

        if not extracted_images:
            return JSONResponse({"message": "No images found in the provided PDF."}, status_code=404)

        # Return the list of extracted image paths
        return JSONResponse({"images": extracted_images})

    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)


@app.delete("/delete_pdf/")
async def delete_pdf(pdf_name: str, db: Session = Depends(get_db)):
    try:
        # Check if the PDF exists in the database
        pdf_data = db.query(PDFData).filter(PDFData.file_name == pdf_name).first()
        if not pdf_data:
            raise HTTPException(status_code=404, detail=f"PDF '{pdf_name}' not found in the database.")

        # Construct the FAISS index file path
        faiss_index_path = os.path.abspath(f"faiss_index_{pdf_name}")
        if os.path.exists(faiss_index_path):
            try:
                os.remove(faiss_index_path)
            except PermissionError:
                shutil.rmtree(faiss_index_path)
        else:
            raise HTTPException(status_code=404, detail=f"FAISS index for '{pdf_name}' not found.")

        # Remove the PDF data from the database
        db.delete(pdf_data)
        db.commit()

        return JSONResponse({"message": f"PDF '{pdf_name}' and its FAISS index were deleted successfully."})

    except HTTPException as e:
        return JSONResponse({"error": e.detail}, status_code=e.status_code)
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)

