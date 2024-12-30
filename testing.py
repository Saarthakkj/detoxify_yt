import requests
import time

# Use your Render URL
url = "https://detoxify-yt.onrender.com"  # Update this with your actual Render URL

def test_basic():
    max_retries = 3
    retry_delay = 5  # seconds
    
    for attempt in range(max_retries):
        try:
            # Test root endpoint
            response = requests.get(url, timeout=30)
            print("\nRoot endpoint test:")
            print(f"Status: {response.status_code}")
            print(f"Response: {response.text}")  # Print raw text first
            
            if response.status_code == 200:
                print(f"Response JSON: {response.json()}")
            
            # Only proceed with prediction test if root endpoint works
            if response.status_code == 200:
                test_data = [{"text": "How do I learn Python programming?"}]
                predict_response = requests.post(
                    f"{url}/predict",
                    json=test_data,
                    headers={"Content-Type": "application/json"},
                    timeout=30
                )
                print("\nPredict endpoint test:")
                print(f"Status: {predict_response.status_code}")
                print(f"Response: {predict_response.json()}")
                break
            
        except requests.exceptions.RequestException as e:
            print(f"\nAttempt {attempt + 1} failed: {e}")
            if attempt < max_retries - 1:
                print(f"Retrying in {retry_delay} seconds...")
                time.sleep(retry_delay)
            else:
                print("Max retries reached. Service might be down or still starting up.")
        except Exception as e:
            print(f"Unexpected error: {e}")
            break

if __name__ == "__main__":
    print("Testing Render deployment...")
    test_basic()
