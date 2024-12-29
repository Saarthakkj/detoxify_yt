import requests

url = "https://detoxify-yt.vercel.app"  # Remove trailing slash

# Test data
data = [
    {"text": "I love solving math problems and calculus!"}, 
    {"text": "Magnus Carlsen just won another chess tournament"},
    {"text": "Let's learn Python programming today"},
]

headers = {
    "Content-Type": "application/json"
}

def test_endpoint():
    try:
        # First test the root endpoint
        root_response = requests.get(url)
        print(f"\nRoot endpoint test:")
        print(f"Status: {root_response.status_code}")
        print(f"Response: {root_response.json()}")

        # Then test the predict endpoint
        predict_response = requests.post(f"{url}/predict", json=data, headers=headers)
        predict_response.raise_for_status()
        results = predict_response.json()
        
        print("\nPredict endpoint test:")
        for idx, result in enumerate(results):
            print(f"\nText {idx + 1}: {data[idx]['text']}")
            print(f"Prediction: {result['prediction']}")
            print("Probabilities:")
            for label, prob in result['probabilities'].items():
                print(f"  {label}: {prob:.3f}")
            
    except requests.exceptions.RequestException as e:
        print(f"\nError making request: {e}")
        if hasattr(e, 'response') and e.response is not None:
            print(f"Status code: {e.response.status_code}")
            try:
                print(f"Response text: {e.response.json()}")
            except:
                print(f"Response text: {e.response.text}")
        else:
            print("No response received")

if __name__ == "__main__":
    print("Testing deployment...")
    test_endpoint()
