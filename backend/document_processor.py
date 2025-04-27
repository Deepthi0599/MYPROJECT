import os
import openai
from llama_index.core import VectorStoreIndex, SimpleDirectoryReader
import pinecone
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize Pinecone (Make sure to use your Pinecone API Key)
pinecone.init(api_key=os.getenv("PINECONE_API_KEY"), environment="us-west1-gcp")

# Embedding generation function using OpenAI's model
def generate_embeddings(texts):
    try:
        response = openai.Embedding.create(
            model="text-embedding-ada-002",
            input=texts
        )
        return [embedding['embedding'] for embedding in response['data']]
    except Exception as e:
        raise Exception(f"Error generating embeddings: {e}")

# Load and chunk documents using LlamaIndex
def load_and_chunk_documents(directory: str):
    try:
        documents = SimpleDirectoryReader(directory).load_data()
        index = GPTListIndex.from_documents(documents)  # Use GPTListIndex instead of GPTSimpleVectorIndex
        return index
    except Exception as e:
        raise Exception(f"Error loading and chunking documents: {e}")


# Query the index with the query embedding
def query_index(query, index):
    query_embedding = generate_embeddings([query])[0]
    return index.query(query_embedding)
