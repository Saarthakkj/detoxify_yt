from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import torch
import logging
from transformers import BertTokenizer, BertForSequenceClassification
import os
from dotenv import load_dotenv

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Get the token from environment variables with a default value
auth_token = os.environ.get('HUGGING_FACE_TOKEN')
if not auth_token:
    logger.error("HUGGING_FACE_TOKEN not found in environment variables")
    raise RuntimeError("HUGGING_FACE_TOKEN environment variable is required")

# Initialize model and tokenizer at startup instead of module level
model = None
tokenizer = None

class TextInput(BaseModel):
    text: str

@app.post("/predict")
async def predict(inputs: List[TextInput]):
    try:
        results = []
        for input in inputs:
            # Tokenize input text
            # Pad and truncate the input to a maximum length of 128 tokens
            # and return a tensor for PyTorch
            encoded = tokenizer(
                input.text,
                padding=True,  
                truncation=True,  
                max_length=128,  
                return_tensors="pt"
            )
            
            # Perform inference
            with torch.no_grad():
                output = model(**encoded)
            
            # Process outputs
            probabilities = torch.nn.functional.softmax(output.logits, dim=-1)
            predicted_class = torch.argmax(probabilities, dim=-1).item()
            
            label_mapping = {0: "other", 1: "chess", 2: "coding", 3: "math"}
            predicted_label = label_mapping.get(predicted_class, "Unknown")
            
            results.append({
                "input_text": input.text,
                "predicted_label": predicted_label
            })
        
        return results
    except Exception as e:
        logger.error(f"Prediction error: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Error processing request: {str(e)}"
        )

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.on_event("startup")
async def startup_event():
    global model, tokenizer
    try:
        model_path = "curlyoreki/detoxifying_yt"
        tokenizer = BertTokenizer.from_pretrained(model_path, token=auth_token)
        model = BertForSequenceClassification.from_pretrained(model_path, token=auth_token)
        model.eval()
        logger.info("Model loaded successfully")
    except Exception as e:
        logger.error(f"Error loading model: {e}")
        raise RuntimeError(f"Failed to load the model: {str(e)}")
