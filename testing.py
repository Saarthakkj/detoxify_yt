import requests

# Update with your new Vercel deployment URL
url = "https://your-new-vercel-url/predict"

data = [
    {"text": "I love solving math problems!"}, 
    {"text": "This is Magnus Carlsen queen."}
]

headers = {
    "Content-Type": "application/json"
}

try:
    response = requests.post(url, json=data, headers=headers)
    response.raise_for_status()
    results = response.json()
    
    for idx, result in enumerate(results):
        print(f"\nText {idx + 1}:")
        print(f"Prediction: {result['prediction']}")
        print("Probabilities:")
        for label, prob in result['probabilities'].items():
            print(f"  {label}: {prob:.3f}")
            
except requests.exceptions.RequestException as e:
    print(f"Error making request: {e}")
    if hasattr(e.response, 'text'):
        print(f"Response text: {e.response.text}")
