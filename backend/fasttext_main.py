from fastapi import FastAPI , HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List
import logging
from pydantic import BaseModel
import os
from dotenv import load_dotenv
from contextlib import asynccontextmanager
import fasttext as ft
import importlib



importlib.reload(ft) #for loading updated version of fasttext (changed by me)

logging.basicConfig(level = logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

auth_token = os.getenv("HUGGING_FACE_TOKEN")
if auth_token is None:
    logger.error("huggingface token not set in env variables")
    raise RuntimeError("HUGGIG_FACE_TOKEN environment variable is not set")

model = None

@asynccontextmanager
async def lifespan(app : FastAPI):
    #load the ml model 
    global model 
    try :
        model_path = "curlyoreki/detoxifying_fasttext"
        model = ft.load_model(model_path)
        logger.info("[Fasttext_main.py] model loaded successfully")
    except Exception as e:
        logger.error(f"[Fasttext_main.py] Error loading model: {e}")
        raise RuntimeError(f"[Fasttext_main.py] Failed to load the model : {str(e)}")
    
    yield
    
    model.clear()
    

app = FastAPI(lifespan=lifespan)



class TextInput(BaseModel):
    text: str


@app.post("/predict")
async def predict(inputs : List[TextInput]):
    try : 
        results = []
        for input in inputs : 
            label , prob = model.predict(input)
        

        results.append({
            "input_text" : input.text,
            "predicted_label" : label,
            "probability" : prob
        })

        return results
    except Exception as e:
        logger.error(f"Error in Prediction Fasttext response: {e}")
        raise HTTPException(
            status_code = 500 , 
            detail = f"[Fasttext_main.py] Error processing request  : {str(e)}"
        )


@app.get("/health")
async def health_check():
    return {"status" : "healthy"}


