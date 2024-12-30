import requests

url = "http://127.0.0.1:8000/predict"
data = {"text": "I love solving math problems!"}

response = requests.post(url, json=data)
print(response.json())