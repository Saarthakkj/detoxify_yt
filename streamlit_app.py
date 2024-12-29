import streamlit as st
import numpy as np
from transformers import BertTokenizer, BertForSequenceClassification
import torch

@st.cache_resource
def get_model():
    tokenizer = BertTokenizer.from_pretrained('curlyoreki/detoxifying_yt')
    model = BertForSequenceClassification.from_pretrained('curlyoreki/detoxifying_yt')
    return tokenizer, model

tokenizer, model = get_model()

user_input = st.text_area('Enter Text to Analyze')
button = st.button("Analyze")

label_mapping = {
    0: "other",
    1: "chess",
    2: "coding", 
    3: "math"
}

if user_input and button:
    inputs = tokenizer([user_input], padding=True, truncation=True, max_length=128, return_tensors='pt')
    
    with torch.no_grad():
        outputs = model(**inputs)
    
    probabilities = torch.nn.functional.softmax(outputs.logits, dim=-1)
    predicted_class = torch.argmax(probabilities, dim=-1)
    
    st.write("Prediction:", label_mapping[int(predicted_class)])
    
    st.write("\nProbabilities:")
    probs = probabilities[0].numpy()
    for label, prob in zip(label_mapping.values(), probs):
        st.write(f"{label}: {prob:.3f}")