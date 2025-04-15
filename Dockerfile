# Use a Python base image
FROM python:3.9-slim

# Set the working directory
WORKDIR /app

# Copy the requirements and install dependencies
COPY requirements.txt .
RUN pip install -r requirements.txt

# Copy the FastAPI app into the container
COPY . /app

# Expose the FastAPI port
EXPOSE 8000

# Ensure you're using the correct entry point
CMD ["uvicorn", "backend.app:app", "--host", "0.0.0.0", "--port", "8000"]
