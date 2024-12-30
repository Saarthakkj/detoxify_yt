import requests

# Make sure to use the correct URL
url = "https://detoxify-yt.vercel.app"  # Base URL

# Test data - format matches TextInput model from FastAPI
data = [
    {"text": "I love solving math problems and calculus!"}, 
    {"text": "Magnus Carlsen just won another chess tournament"},
    {"text": "Let's learn Python programming today"}
]

headers = {
    "Content-Type": "application/json"
}

def test_endpoint():
    try:
        # Test each endpoint
        print("\nTesting all endpoints...")
        
        # Root endpoint
        root_response = requests.get(url)
        print("\nRoot endpoint test (/):")
        print(f"Status: {root_response.status_code}")
        print(f"Response: {root_response.json()}")
        
        # Health check endpoint
        health_response = requests.get(f"{url}/health")
        print("\nHealth check endpoint (/health):")
        print(f"Status: {health_response.status_code}")
        print(f"Response: {health_response.json()}")
        
        # Model info endpoint
        info_response = requests.get(f"{url}/model-info")
        print("\nModel info endpoint (/model-info):")
        print(f"Status: {info_response.status_code}")
        print(f"Response: {info_response.json()}")
        
        # Test-predict endpoint
        test_predict_response = requests.get(f"{url}/test-predict")
        print("\nTest predict endpoint (/test-predict):")
        print(f"Status: {test_predict_response.status_code}")
        print(f"Response: {test_predict_response.json()}")
        
        # Predict endpoint
        predict_response = requests.post(f"{url}/predict", json=data, headers=headers)
        predict_response.raise_for_status()
        results = predict_response.json()
        
        print("\nPredict endpoint test (/predict):")
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
