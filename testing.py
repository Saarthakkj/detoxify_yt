import requests
import json

url = "https://detoxify-yt.onrender.com/predict"

# Multiple titles to test
data = [
    {"text": "I love solving math problems!"},
    {"text": "Magnus Carlsen's brilliant chess strategy"},
    {"text": "Learn Python programming basics"},
    {"text": "Differential equations made easy"}
]

try:
    response = requests.post(url, json=data)
    response.raise_for_status()
    results = response.json()
    
    # Create list of predictions
    predictions = [{"category": result['predicted_label']} for result in results]
    print(json.dumps(predictions, indent=2))

except requests.exceptions.RequestException as e:
    print(f"Error making request: {e}")
except Exception as e:
    print(f"Unexpected error: {e}")