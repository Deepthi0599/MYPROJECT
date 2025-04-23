# Use a Python base image
FROM python:3.9-slim

# Install build dependencies for compiling C++ code (e.g., for hnswlib)
RUN apt-get update && apt-get install -y \
    build-essential \
    g++ \
    cmake \
    libopenblas-dev \
    libomp-dev \
    && rm -rf /var/lib/apt/lists/*

# Set the working directory
WORKDIR /app

# Copy the requirements and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt


# Copy the FastAPI app into the container
COPY ./backend /app/backend

# Expose the FastAPI port
EXPOSE 8000

# Ensure you're using the correct entry point
CMD ["uvicorn", "backend.app:app", "--host", "0.0.0.0", "--port", "8000"]
