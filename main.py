from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
import json

# Load the secrets from the file
with open('secrets.json') as f:
    secrets = json.load(f)

# Define the OAuth scopes required for YouTube
SCOPES = [secrets['google_api_key']]

# def authenticate():
#     # Use the client_secret.json file you downloaded
#     flow = InstalledAppFlow.from_client_secrets_file("client_secret.json", SCOPES)
#         credentials = flow.run_local_server(port=8080)
#     return build("youtube", "v3", credentials=credentials)

# youtube = authenticate()


def fetch_recommended_videos(youtube):
    response = youtube.activities().list(
        part="snippet,contentDetails",
        home=True,
        maxResults=10
    ).execute()

    for item in response["items"]:
        title = item["snippet"]["title"]
        print(f"Recommended Video: {title}")

fetch_recommended_videos(youtube)
