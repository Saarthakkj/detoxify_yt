import requests

# Your Vercel deployment URL
VERCEL_URL = "https://detoxify2-gjz32iy9f-saarthaks-projects-f6b38fdf.vercel.app"

# Test root endpoint
print("Testing root endpoint...")
try:
    root_response = requests.get(VERCEL_URL)
    print(f"Root Status: {root_response.status_code}")
    print(f"Response: {root_response.json()}")
except Exception as e:
    print(f"Root check failed: {e}")

# Test predict endpoint
predict_url = f"{VERCEL_URL}/predict"
data = [
    {"text": "I love solving math problems!"}, 
    {"text": "This is Magnus Carlsen queen."}
]

print("\nTesting predict endpoint...")
try:
    predict_response = requests.post(predict_url, json=data)
    print(f"Predict Status: {predict_response.status_code}")
    print(f"Response: {predict_response.json()}")
except Exception as e:
    print(f"Prediction failed: {e}")
