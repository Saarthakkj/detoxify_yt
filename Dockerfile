# Use an official Python runtime as a parent image
FROM python:3.12-slim

# Set working directory in the container
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first to leverage Docker cache
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy model files and application code
COPY bert-yt_classifier/ /app/bert-yt_classifier/
COPY app.py .
COPY testing.py .

# Make port 8000 available to the world outside this container
EXPOSE 8000

# Run the API server when the container launches
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"] 