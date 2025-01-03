import requests
import json
import time

url = "http://127.0.0.1:8000/predict"

# Multiple titles to test
data = [
    {"text": "I love solving math problems!"},
    {"text": "Magnus Carlsen's brilliant chess strategy"}
]
    


try:
    t = time.time()
    response = requests.post(url, json=data)
    response.raise_for_status()
    results = response.json()
    
    # Create list of predictions
    predictions = [{"category": result['predicted_label']} for result in results]
    print(json.dumps(predictions, indent=2))
    t2 = time.time()
    print(f"Time taken: {t2 - t} seconds")

except requests.exceptions.RequestException as e:
    print(f"Error making request: {e}")
except Exception as e:
    print(f"Unexpected error: {e}")