# Use an official Python runtime as a parent image
FROM python:3.12-slim

# Set working directory in the container
WORKDIR /app

# Copy requirements first to leverage Docker cache
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the model files
COPY bert-yt_classifier/checkpoint-1460 /app/bert-yt_classifier/checkpoint-1460

# Copy the API code
COPY app.py .

# Make port 8000 available to the world outside this container
EXPOSE 8000

# Define environment variable
ENV MODEL_PATH=bert-yt_classifier/checkpoint-1460

# Run the API server when the container launches
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"] 