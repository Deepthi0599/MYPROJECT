from fastapi import FastAPI, HTTPException, File, UploadFile
from pymongo import MongoClient
import os
import openai
from llama_index.core import GPTListIndex, SimpleDirectoryReader
from pydantic import BaseModel
from datetime import datetime

# Initialize FastAPI app
app = FastAPI()

# MongoDB connection setup
MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017/")
client = MongoClient(MONGODB_URI)
db = client.chat_database
chats_collection = db.chats  # MongoDB collection to store chat history

# Directory to store uploaded documents
UPLOAD_DIR = "uploaded_documents"

# OpenAI API key (ensure you have this set up or load from environment variables)
openai.api_key = 'your-openai-api-key'


# Function to load and chunk documents using LlamaIndex
def load_and_chunk_documents(directory: str):
    try:
        # Use SimpleDirectoryReader to load and chunk documents from the specified directory
        documents = SimpleDirectoryReader(directory).load_data()
        # Use GPTListIndex to index the documents
        index = GPTListIndex.from_documents(documents)
        return index
    except Exception as e:
        raise Exception(f"Error loading and chunking documents: {e}")


# Endpoint to handle document uploads
@app.post("/upload/")
async def upload_document(file: UploadFile = File(...)):
    try:
        # Ensure the upload directory exists
        if not os.path.exists(UPLOAD_DIR):
            os.makedirs(UPLOAD_DIR)

        # Save the uploaded file to the server
        file_path = os.path.join(UPLOAD_DIR, file.filename)
        with open(file_path, "wb") as f:
            f.write(await file.read())

        # After uploading, load and chunk the document using LlamaIndex
        index = load_and_chunk_documents(UPLOAD_DIR)

        # Returning a success message
        return {"message": f"File {file.filename} uploaded and processed successfully."}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Endpoint to handle querying documents
from fastapi import FastAPI, HTTPException, Query

@app.get("/query/")
async def query_document(query: str):
    try:
        # Load and chunk the documents (you may want to store the index for faster access)
        index = load_and_chunk_documents(UPLOAD_DIR)

        # Query the index for the answer
        response = index.query(query)

        # Store the chat history in MongoDB
        chat_data = {
            "message": query,
            "response": response,
            "timestamp": datetime.utcnow()  # Adding timestamp for when the chat happened
        }
        chats_collection.insert_one(chat_data)

        # Return the answer from the query
        return {"answer": response}

    except Exception as e:
        raise HTTPException(status_code=500, detail="An error occurred while processing your query.")


# Optional health check endpoint
@app.get("/health/")
async def health_check():
    return {"status": "ok"}


# Optional endpoint to get chat history from MongoDB
@app.get("/chat-history/")
async def get_chat_history():
    try:
        # Retrieve all chat data from MongoDB
        chats = chats_collection.find().sort("timestamp", -1)  # Sort by timestamp (latest first)
        chat_list = [{"message": chat["message"], "response": chat["response"], "timestamp": chat["timestamp"]} for chat
                     in chats]

        return {"chat_history": chat_list}

    except Exception as e:
        raise HTTPException(status_code=500, detail="Error retrieving chat history.")
