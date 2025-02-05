# AI PDF Reader - Technical Documentation

## Overview
The AI PDF Reader is a web application that enables users to upload and analyze PDF documents using AI capabilities. The project leverages Google's Gemini AI for intelligent text extraction and processing. The frontend is built using React with Vite, while the backend is powered by FastAPI and PostgreSQL.

## Tech Stack

### Frontend
The frontend is developed using React with Vite as the build tool, ensuring fast performance and development efficiency.
- **React 18**: Component-based UI development.
- **Vite**: A fast build tool for modern frontend applications.
- **React Router**: Client-side navigation.
- **Recoil**: State management.
- **Tailwind CSS**: Styling.
- **Clerk Authentication**: User authentication and management.
- **Axios**: API requests handling.

### Backend
The backend is implemented using FastAPI for handling API requests and AI-based text processing.
- **FastAPI**: High-performance API framework.
- **Pydantic**: Data validation and serialization.
- **SQLAlchemy**: ORM for database management.
- **PostgreSQL**: Database for storing user data and document metadata.
- **Faiss**: Vector search for efficient document retrieval.
- **LangChain**: AI integration for advanced text processing.
- **Google Gemini AI**: AI-based document analysis.
- **Uvicorn**: ASGI server for running FastAPI.

### AI & ML
- **Google Generative AI (Gemini)**: Used for PDF text analysis, summarization, and semantic search.
- **LangChain**: Framework for AI-driven document understanding.
- **FAISS**: Vector search for document embeddings.

## Installation & Setup
### Backend
```sh
# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows use `venv\Scripts\activate`

# Install dependencies
pip install -r requirements.txt

# Run FastAPI server
uvicorn backend.main:app --reload
```

### Frontend
```sh
cd frontend
npm install
npm run dev
```


## Authentication
User authentication is handled via **Clerk** on the frontend, ensuring secure access control.

## Future Enhancements
- **Chatbot Integration**: AI assistant for querying PDFs.
- **Advanced Summarization**: Gemini-powered summarization.
- **Real-time Collaboration**: Multi-user access to PDFs.

## Conclusion
The AI PDF Reader leverages modern web technologies and AI frameworks to deliver an efficient document analysis tool. With a scalable architecture, it is designed to handle real-world use cases involving AI-powered PDF processing.

