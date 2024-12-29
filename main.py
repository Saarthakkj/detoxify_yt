#parsing the json response : sample_response.json
import json

title_keyword = []
# Function to recursively iterate through a nested JSON object
def iterate_nested_json(data_list , title_keyword): 
    for data in data_list:
        # print("hello world")
        if isinstance(data, dict):  # Check if the data is a dictionary
            title_keyword_pair = []
            # print(data)
            for key, value in data.items():
                # print(key , value)
                if key == "title":
                    title_keyword_pair.append(value)
                if key == "discovery_input":
                    if isinstance(value  , dict):
                        for key , value in value.items():
                            if key == "keyword":
                                title_keyword_pair.append(value)
                                title_keyword.append(title_keyword_pair)
                                # print(title_keyword_pair)
                # print(f"Key: {key}")  # Print the key
                # iterate_nested_json(value)  # Recursively call for the value

with open('sample_response.json', 'r') as file:
    json_data = json.load(file)  # Load the JSON data
    iterate_nested_json(json_data , title_keyword)  # Call the function to iterate through the JSON


print(title_keyword)

title_keyword_df = []
with open('main_response.json', 'r') as file:
    json_data = json.load(file)  # Load the JSON data
    iterate_nested_json(json_data , title_keyword_df)  # Call the function to iterate through the JSON

print(title_keyword_df)


#THIS IS THE MAIN DIV : <div id = "contents" class = "style-scope ytd-rich-grid-render"
#sub divs that contain titles : 


''' 

all the HTML divs :

div that contain the video card : <ytd-rich-item-renderer class="style-scope ytd-rich-grid-renderer" items-per-row="4" lockup="true" rendered-from-rich-grid is-in-first-column>

<div id="dismissible" class="style-scope ytd-rich-grid-media">flex

<div id="details" class="style-scope ytd-rich-grid-media">flex


<div id="meta" class="style-scope ytd-rich-grid-media">

<h3 class="style-scope ytd-rich-grid-media">


<a id="video-title-link" class="yt-simple-endpoint focus-on-expand style-scope ytd-rich-grid-media" aria-label="Eric Maskin - An Introduction to Mechanism Design - Warwick Economics Summit 2014 by Warwick Economics Summit 17,458 views 10 years ago 1 hour, 4 minutes" title="Eric Maskin - An Introduction to Mechanism Design - Warwick Economics Summit 2014" href="/watch?v=XSVoeETsEcU&t=1525s">…</a>


'''


#dataset : https://www.kaggle.com/datasets/datasnaek/youtube-new?select=USvideos.csv
#dataset2 : https://www.kaggle.com/datasets/rsrishav/youtube-trending-video-dataset?select=US_youtube_trending_data.csv
    