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
from Db import get_db, PDFData
from fastapi import Depends
from sqlalchemy.orm import Session

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

# Function to create a vector store for a specific file
def create_vector_store(text_chunks, filename):
    embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001")
    vector_store = FAISS.from_texts(text_chunks, embedding=embeddings)
    vector_store.save_local(f"faiss_index_{filename}")

# Endpoint to upload and process PDFs
@app.post("/upload/")
async def upload_pdfs(files: list[UploadFile], db: Session = Depends(get_db)):
    try:
        filenames = []
        for file in files:
            # Extract text from the PDF
            raw_text = extract_text_from_pdfs([file])
            
            # Split text into chunks
            text_chunks = split_text_into_chunks(raw_text)
            
            # Create a vector store for this specific file
            create_vector_store(text_chunks, file.filename)
            
            # Save file information to the database
            pdf_data = PDFData(file_name=file.filename)
            db.add(pdf_data)
            db.commit()
            db.refresh(pdf_data)
            filenames.append(file.filename)
        
        return JSONResponse({"message": "PDFs processed successfully!", "files": filenames})
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
    


@app.post("/quiz/")
async def generate_quiz(pdf_name: str = Form(...)):
    print(pdf_name)
    try:
        # Load the embeddings for the specific PDF
        embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001")
        vector_store = FAISS.load_local(f"faiss_index_{pdf_name}", embeddings, allow_dangerous_deserialization=True)
        print(pdf_name)
        # Retrieve documents from the vector store
        docs = vector_store.similarity_search("Generate a quiz")  # Query for quiz generation
        print(pdf_name)
        # If no relevant documents are found, return an error
        if not docs:
            return JSONResponse({"error": f"No relevant documents found for {pdf_name}."}, status_code=404)
        
        # Quiz generation prompt template
        quiz_prompt = """
        Generate a quiz from the following context. The quiz should contain multiple-choice questions
        with 4 options each, and clearly indicate the correct answer.\n\n
        Context:\n {context}\n
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