import selenium
from selenium import webdriver
import pandas as pd
from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.chrome.service import Service


def scrapeYT(): # Our function for scraping   
    servicee = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service = servicee)
    driver.get("youtube.com")
    try:
        elem = WebDriverWait(driver , 30).until(EC.presence_of_element_located((By.CLASS_NAME , "style-scope ytd-rich-grid-render" )))
    finally: 
        print("loaded")

scrapeYT()


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
    