from sqlalchemy import create_engine, Column, Integer, String, Text,LargeBinary
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Database URL from NeonDB (replace with your actual credentials)
DATABASE_URL = os.getenv("NEON_DB_URL")  

# SQLAlchemy Setup
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Models
class PDFData(Base):
    __tablename__ = "pdf_data"
    id = Column(Integer, primary_key=True, index=True)
    file_name = Column(String, index=True)
    file_content = Column(LargeBinary, nullable=True)  # Add this column


# Create tables
Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()