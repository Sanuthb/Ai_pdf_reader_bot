import streamlit as st
from PyPDF2 import PdfReader
from langchain.text_splitter import RecursiveCharacterTextSplitter
import os
from langchain_google_genai import GoogleGenerativeAIEmbeddings
import google.generativeai as genai
from langchain_community.vectorstores import FAISS
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.chains.question_answering import load_qa_chain
from langchain.prompts import PromptTemplate
from dotenv import load_dotenv
import fitz
from PIL import Image
import io

load_dotenv()
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

def get_pdf_text(pdf_docs):
    text = ""
    for pdf in pdf_docs:
        pdf_reader = PdfReader(pdf)
        for page in pdf_reader.pages:
            text += page.extract_text()
    return text

def get_text_chunks(text):
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=10000,
        chunk_overlap=1000
    )
    chunks = text_splitter.split_text(text)
    return chunks

def get_vector_store(text_chunks):
    embeddings = GoogleGenerativeAIEmbeddings(
        model="models/embedding-001"
    )
    vector_store = FAISS.from_texts(
        text_chunks,
        embedding=embeddings
    )
    vector_store.save_local("faiss_index")

def get_conversational_chain():
    prompt_template = """
    Answer the question as detailed as possible from the provided context. If the answer is not in
    the context, say "answer is not available in the context." Don't provide incorrect answers.\n\n
    Context:\n {context}\n
    Question: \n{question}\n
    Answer:
    """
    model = ChatGoogleGenerativeAI(
        model="gemini-pro",
        temperature=0.3
    )
    prompt = PromptTemplate(
        template=prompt_template,
        input_variables=["context", "question"]
    )
    chain = load_qa_chain(
        model,
        chain_type="stuff",
        prompt=prompt
    )
    return chain

def generate_quiz(docs):
    quiz_prompt = """
    Generate a quiz from the following content. The quiz should contain multiple-choice questions
    with 4 options each, and clearly indicate the correct answer.\n\n
    Context:\n {context}\n
    Quiz:
    """
    model = ChatGoogleGenerativeAI(
        model="gemini-pro",
        temperature=0.3
    )
    prompt = PromptTemplate(
        template=quiz_prompt,
        input_variables=["context"]
    )
    chain = load_qa_chain(
        model,
        chain_type="stuff",
        prompt=prompt
    )
    response = chain.invoke({"input_documents": docs, "question": "Generate a quiz"})
    return response["output_text"]

def user_input(user_question):
    embeddings = GoogleGenerativeAIEmbeddings(
        model="models/embedding-001"
    )
    new_db = FAISS.load_local("faiss_index", embeddings, allow_dangerous_deserialization=True)
    docs = new_db.similarity_search(user_question)
    chain = get_conversational_chain()
    response = chain.invoke(
        {"input_documents": docs, "question": user_question}
    )
    st.write("Reply: ", response["output_text"])

def extract_images_from_pdf(pdf_docs):
    images = []
    for pdf in pdf_docs:
        pdf_bytes = pdf.read()
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

def main():
    st.set_page_config("Chat and Quiz PDF with Images")
    st.header("Chat with PDF, Generate Quizzes, and Display Images using Gemini💁")

    user_question = st.text_input("Ask a Question from the PDF Files")

    if user_question:
        user_input(user_question)

    with st.sidebar:
        st.title("Menu:")
        
        pdf_docs = st.file_uploader("Upload PDF Files & Click the Button", accept_multiple_files=True)
        if pdf_docs:
            pdf_names = [pdf.name for pdf in pdf_docs]

        if st.button("Submit & Process"):
            with st.spinner("Processing..."):
                raw_text = get_pdf_text(pdf_docs)
                text_chunks = get_text_chunks(raw_text)
                get_vector_store(text_chunks)
                st.success("Processing completed!")

        # Selection and quiz generation
        selected_quiz_pdfs = st.multiselect("Select PDFs for Quiz Generation", options=pdf_docs, format_func=lambda x: x.name)
        if st.button("Generate Quiz"):
            with st.spinner("Generating quiz..."):
                if selected_quiz_pdfs:
                    raw_text = get_pdf_text(selected_quiz_pdfs)
                    text_chunks = get_text_chunks(raw_text)
                    get_vector_store(text_chunks)
                    embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001")
                    new_db = FAISS.load_local("faiss_index", embeddings, allow_dangerous_deserialization=True)
                    docs = new_db.similarity_search("quiz")
                    quiz = generate_quiz(docs)
                    st.write("Quiz:", quiz)
                else:
                    st.warning("Please select at least one PDF for quiz generation.")

        # Selection and image extraction
        selected_image_pdfs = st.multiselect("Select PDFs for Image Extraction", options=pdf_docs, format_func=lambda x: x.name)
        if st.button("Show Images"):
            with st.spinner("Extracting images..."):
                if selected_image_pdfs:
                    images = extract_images_from_pdf(selected_image_pdfs)
                    if images:
                        st.success("Images extracted successfully!")
                        for img_name, img in images:
                            st.subheader(img_name)
                            st.image(img, use_column_width=True)
                    else:
                        st.warning("No images found in the selected PDF(s).")
                else:
                    st.warning("Please select at least one PDF for image extraction.")

if __name__ == "__main__":
    main()
