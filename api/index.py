from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import torch
from transformers import BertTokenizer, BertForSequenceClassification

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load model from Hugging Face Hub
MODEL_ID = "curlyoreki/detoxifying_yt"
tokenizer = BertTokenizer.from_pretrained(MODEL_ID)
model = BertForSequenceClassification.from_pretrained(MODEL_ID)
model.eval()

class TextInput(BaseModel):
    text: str

@app.get("/")
async def root():
    return {"message": "YouTube Content Classifier API"}

@app.post("/predict")
async def predict(inputs: list[TextInput]):
    try:
        results = []
        for input in inputs:
            encoded = tokenizer(
                input.text,
                padding=True,
                truncation=True,
                max_length=128,
                return_tensors="pt"
            )
            
            with torch.no_grad():
                output = model(**encoded)
            
            probabilities = torch.nn.functional.softmax(output.logits, dim=-1)
            predicted_class = torch.argmax(probabilities, dim=-1).item()
            
            label_mapping = {0: "other", 1: "chess", 2: "coding", 3: "math"}
            predicted_label = label_mapping.get(predicted_class, "Unknown")
            
            results.append({
                "input_text": input.text,
                "predicted_label": predicted_label,
                "confidence": float(probabilities[0][predicted_class])
            })
        
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    return {"status": "healthy"} 