from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel
from transformers import BertTokenizer, BertForSequenceClassification
import torch

# Initialize the FastAPI app
app = FastAPI()

# Define a data model for incoming requests
class TextInput(BaseModel):
    text: str

# Load the fine-tuned model and tokenizer
model_path = "bert-yt_classifier/checkpoint-1460"  # Update this to your checkpoint path
tokenizer = BertTokenizer.from_pretrained(model_path)
model = BertForSequenceClassification.from_pretrained(model_path)
model.eval()

# Define a prediction endpoint
@app.post("/predict")
async def predict(inputs: list[TextInput]):
    results = []
    for input in inputs:
        # Tokenize input text
        inputs = tokenizer(
            input.text,
            padding=True,
            truncation=True,
            max_length=128,
            return_tensors="pt"
        )
        
        # Perform inference
        with torch.no_grad():
            output = model(**inputs)
        
        # Process the model's outputs
        logits = output.logits
        probabilities = torch.nn.functional.softmax(logits, dim=-1)
        predicted_class = torch.argmax(probabilities, dim=-1).item()
        
        # Example class mapping
        label_mapping = {0: "other", 1: "chess", 2: "coding", 3: "math"}
        predicted_label = label_mapping.get(predicted_class, "Unknown")
        
        results.append({
            "input_text": input.text,
            "predicted_label": predicted_label
        })
    
    return results
