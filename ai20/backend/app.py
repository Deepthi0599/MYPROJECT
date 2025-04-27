from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
import shutil
import uuid
import logging
from typing import Optional
from dotenv import load_dotenv

from docx import Document

# LlamaIndex (v0.9.48) imports
from llama_index import VectorStoreIndex, ServiceContext, StorageContext
from llama_index.readers.file.base import SimpleDirectoryReader
from llama_index.vector_stores.chroma import ChromaVectorStore
from llama_index.embeddings.base import BaseEmbedding

from sentence_transformers import SentenceTransformer
import chromadb
from pymongo import MongoClient

# Load .env
load_dotenv()
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")

# Logger
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("backend.app")

# App setup
app = FastAPI()

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Constants
UPLOAD_DIR = "uploaded_docs"
CHROMA_DIR = "./chroma_db"
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
ALLOWED_EXTENSIONS = {'.pdf', '.txt', '.md', '.docx'}

os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(CHROMA_DIR, exist_ok=True)

# DB setup
chroma_client = chromadb.PersistentClient(path=CHROMA_DIR)
vector_store = ChromaVectorStore(chroma_collection=chroma_client.get_or_create_collection("documents"))

mongo_client = MongoClient(MONGO_URI)
db = mongo_client["docqa"]
chat_sessions = db["chat_sessions"]

# Embedding Model: Local
class LocalHuggingFaceEmbedding(BaseEmbedding):
    class Config:
        arbitrary_types_allowed = True  # allows SentenceTransformer inside

    def __init__(self, model_name: str = "all-MiniLM-L6-v2"):
        super().__init__()
        object.__setattr__(self, "model", SentenceTransformer(model_name))

    def _get_text_embedding(self, text: str) -> list[float]:
        return self.model.encode(text).tolist()

    def _get_query_embedding(self, query: str) -> list[float]:
        return self.model.encode(query).tolist()

    def _get_text_embeddings(self, texts: list[str]) -> list[list[float]]:
        return self.model.encode(texts).tolist()

    def _get_query_embeddings(self, queries: list[str]) -> list[list[float]]:
        return self.model.encode(queries).tolist()

    async def _aget_query_embedding(self, query: str) -> list[float]:
        return self._get_query_embedding(query)

embed_model = LocalHuggingFaceEmbedding()

# Pydantic models
class QuestionRequest(BaseModel):
    question: str
    session_id: Optional[str] = None

class UploadResponse(BaseModel):
    message: str
    file_id: str
    filename: str

def read_docx(file_path):
    doc = Document(file_path)
    text = "\n".join([para.text for para in doc.paragraphs])
    txt_path = file_path.replace(".docx", ".txt")
    with open(txt_path, "w", encoding="utf-8") as f:
        f.write(text)
    return txt_path

@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    logger.info("Received file: %s", file.filename)

    file_ext = os.path.splitext(file.filename)[1].lower()
    if file_ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(400, detail=f"File type not allowed. Only {', '.join(ALLOWED_EXTENSIONS)} files are supported")

    file.file.seek(0, 2)
    file_size = file.file.tell()
    file.file.seek(0)
    if file_size > MAX_FILE_SIZE:
        raise HTTPException(400, detail=f"File too large. Max size is {MAX_FILE_SIZE // (1024 * 1024)}MB")

    try:
        file_id = str(uuid.uuid4())
        file_path = os.path.join(UPLOAD_DIR, f"{file_id}{file_ext}")
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        if file_ext == ".docx":
            file_path = read_docx(file_path)
            logger.info("Converted DOCX to TXT: %s", file_path)

        documents = SimpleDirectoryReader(input_files=[file_path]).load_data()
        logger.info("Document loaded")

        service_context = ServiceContext.from_defaults(
            embed_model=embed_model
        )

        index = VectorStoreIndex.from_documents(
            documents,
            vector_store=vector_store,
            service_context=service_context,
            storage_context=StorageContext.from_defaults(vector_store=vector_store)
        )
        logger.info("Document indexed")

        return UploadResponse(
            message="Document uploaded and indexed successfully",
            file_id=file_id,
            filename=file.filename
        )

    except Exception as e:
        import traceback
        logger.error("Error processing file:\n%s", traceback.format_exc())
        raise HTTPException(500, detail=f"Error processing document: {str(e)}")

@app.post("/ask")
async def ask_question(payload: QuestionRequest):
    try:
        service_context = ServiceContext.from_defaults(embed_model=embed_model)

        index = VectorStoreIndex.from_vector_store(
            vector_store=vector_store,
            service_context=service_context
        )

        query_engine = index.as_query_engine(similarity_top_k=3)
        response = query_engine.query(payload.question)
        final_answer = response.response.strip()

        if not final_answer or final_answer.lower() in ["i don't know", "not found"]:
            final_answer = "I'm sorry, I don't know the answer based on the uploaded documents."

        return {"answer": final_answer}

    except Exception as e:
        logger.error(f"Error answering question: {str(e)}")
        raise HTTPException(500, detail="Error processing question")

@app.get("/")
async def root():
    return {"message": "API is live"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
