from fastapi import FastAPI, HTTPException, Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import torch
from transformers import BertTokenizer, BertForSequenceClassification
import os

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Model loading
tokenizer = BertTokenizer.from_pretrained('curlyoreki/detoxifying_yt')
model = BertForSequenceClassification.from_pretrained('curlyoreki/detoxifying_yt')

label_mapping = {
    0: "other",
    1: "chess",
    2: "coding", 
    3: "math"
}

class TextInput(BaseModel):
    text: str

@app.head("/")
@app.get("/")
async def root():
    return {"status": "ok", "message": "Detoxify API is running"}

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "model_loaded": model is not None,
        "tokenizer_loaded": tokenizer is not None
    }

@app.get("/model-info")
async def model_info():
    return {
        "model_name": "curlyoreki/detoxifying_yt",
        "labels": label_mapping,
        "max_sequence_length": 128
    }

@app.get("/test-predict")
async def test_predict():
    test_texts = [
        TextInput(text="How do I implement a binary search tree?"),
        TextInput(text="What's the best opening in chess?"),
        TextInput(text="Can someone help me solve this quadratic equation?")
    ]
    return await predict(test_texts)

@app.post("/predict")
async def predict(inputs: List[TextInput]):
    try:
        texts = [item.text for item in inputs]
        encoded_inputs = tokenizer(texts, padding=True, truncation=True, max_length=128, return_tensors='pt')
        
        with torch.no_grad():
            outputs = model(**encoded_inputs)
        
        probabilities = torch.nn.functional.softmax(outputs.logits, dim=-1)
        predicted_classes = torch.argmax(probabilities, dim=-1)
        
        results = []
        for idx, pred_class in enumerate(predicted_classes):
            probs = {label: float(prob) for label, prob in zip(label_mapping.values(), probabilities[idx])}
            results.append({
                "prediction": label_mapping[int(pred_class)],
                "probabilities": probs
            })
            
        return results
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 10000))
    uvicorn.run(app, host="0.0.0.0", port=port)