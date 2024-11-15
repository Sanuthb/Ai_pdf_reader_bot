from fastapi import FastAPI, UploadFile, Form
from fastapi.responses import JSONResponse
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

load_dotenv()

# Configure Google Generative AI with API Key
api_key = os.getenv("GOOGLE_API_KEY")
if not api_key:
    raise EnvironmentError("GOOGLE_API_KEY is not set in the environment.")
genai.configure(api_key=api_key)

app = FastAPI()

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

# Function to create a vector store
def create_vector_store(text_chunks):
    embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001")
    vector_store = FAISS.from_texts(text_chunks, embedding=embeddings)
    vector_store.save_local("faiss_index")

# Function to extract images from PDF files
def extract_images_from_pdfs(files):
    images = []
    for file in files:
        pdf_bytes = file.file.read()
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")
        for page_num in range(len(doc)):
            page = doc.load_page(page_num)
            for img_index, img in enumerate(page.get_images(full=True)):
                xref = img[0]
                base_image = doc.extract_image(xref)
                image_bytes = base_image["image"]
                image = Image.open(io.BytesIO(image_bytes))
                images.append((f"Page {page_num + 1} - Image {img_index + 1}", image))
    return images

# Endpoint to upload and process PDFs
@app.post("/upload/")
async def upload_pdfs(files: list[UploadFile]):
    try:
        # Extract text from PDFs
        raw_text = extract_text_from_pdfs(files)
        
        # Split text into chunks
        text_chunks = split_text_into_chunks(raw_text)
        
        # Create vector store
        create_vector_store(text_chunks)
        filenames = [file.filename for file in files]
        
        return JSONResponse({"message": "PDFs processed successfully!", "files": filenames})
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)

# Endpoint to extract images from PDFs
@app.post("/extract-images/")
async def extract_images(files: list[UploadFile]):
    try:
        images = extract_images_from_pdfs(files)
        if not images:
            return JSONResponse({"message": "No images found in the uploaded PDFs."})
        
        # Return image data as base64 (optional)
        image_data = [
            {"name": img[0], "image_bytes": img[1].tobytes()} for img in images
        ]
        return JSONResponse({"message": "Images extracted successfully!", "images": image_data})
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)

# Endpoint to handle conversational queries
@app.post("/ask/")
async def ask_question(question: str = Form(...)):
    try:
        embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001")
        vector_store = FAISS.load_local("faiss_index", embeddings)
        docs = vector_store.similarity_search(question)
        
        # Create a conversational chain
        prompt_template = """
        Answer the question as detailed as possible from the provided context.
        If the answer is not in the context, say "Answer is not available in the context."
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
