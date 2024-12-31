const express = require('express');
const { spawn } = require('child_process');
 
const app = express();
const port = 3000;

function runPythonScript(scriptPath, args, callback) {
    const pythonProcess = spawn('python', [scriptPath].concat(args));
 
    let data = '';
    pythonProcess.stdout.on('data', (chunk) => {
        data += chunk.toString(); // Collect data from Python script
    });
    console.log("[PRAKHAR]: [contentScript.js]: data found....", data);
 
    pythonProcess.stderr.on('data', (error) => {
        console.error(`stderr: ${error}`);
    });
 
    pythonProcess.on('close', (code) => {
        if (code !== 0) {
            console.log(`Python script exited with code ${code}`);
            callback(`Error: Script exited with code ${code}`, null);
        } else {
            console.log('Python script executed successfully');
            callback(null, data);
        }
    });
}

console.log("[PRAKHAR]: [contentScript.js]: script started....");

// Listen for messages from the popup.js
chrome.runtime.onMessage.addListener((message) => {
    if (message.action === "filter") {
        const searchString = message.searchString; // Get the search string from the message
        filterVideos(searchString); // Call the filter function with the search string
    }
});

// Function to scrape video titles from the page
const scrapperTitleVector = async () => {
    const elements = Array.from(document.querySelectorAll('ytd-rich-item-renderer')); // Select video elements
    const titleVector = elements.map((el) => {
        // console.log("[PRAKHAR]: [contentScript.js]: el found....", el);
        const titleElement = el.querySelector("#video-title"); // Find the title element
        // console.log("contentScript.js]: titleElement found....", titleElement);
        if (titleElement) {
            return titleElement.textContent.trim(); // Return trimmed title text
        }
        return null; // Return null if no title found
    });
    // console.log("[PRAKHAR]: [contentScript.js]: titleVector found....", titleVector);

    const filteredArray = titleVector.filter((value) => value !== null); // Filter out null values
    // console.log("[PRAKHAR]: [contentScript.js]: filteredArray found....", filteredArray);
    return filteredArray; // Return the array of titles
};

// Function to filter videos based on the search string
const filterVideos = async (searchString) => {

    const removeElements = () => {
        let elements = Array.from(document.querySelectorAll('ytd-rich-item-renderer')); // Get video elements
        // console.log("[PRAKHAR]: [contentScript.js]: elements found....", elements);
        // console.log();
        if (elements.length === 0) {
            elements = Array.from(document.querySelectorAll('ytd-compact-video-renderer')); // Fallback to compact video elements
            // console.log("[PRAKHAR]: [contentScript.js]: elements changed....")
        }
        
        //elements -> array of youtube titles in realtime scraping

        //this below code successfully scrapes the titles from elements array
        // const t = scrapperTitleVector(elements);
        // console.log("[PRAKHAR]: [contentScript.js]: t found....", t);


        //this removes the keyword from the vidos: 


        // if (element1) {
        //     console.log("[PRAKHAR]: [contentScript.js]: matching video found....", element1);
        //     element1.remove(); // Remove the matching element
        //     console.log("[PRAKHAR]: [contentScript.js]: element1 removed....");
        // } else {
        //     console.log("[PRAKHAR]: [contentScript.js]: no element1 found....");
        // }
    }

    removeElements(); // Initial call to remove elements
    const titleVector = await scrapperTitleVector(); // Get the titles after filtering
    console.log("[contentScript.js]: titleVector found....", titleVector);
    runPythonScript("python/testing.py", [titleVector], (error, result) => {
        if (error) {
            console.error(`Error: ${error}`);
        } else {
            console.log(`Result: ${result}`);
        }
    });

    


    //todo : understand below code
    // Set up a MutationObserver to watch for changes in the DOM
    // const observer = new MutationObserver(async () => {
    //     removeElements(); // Call to remove elements on mutation
    //     titleVector = await scrapperTitleVector(); // Update title vector
    //     console.log("[PRAKHAR]: [contentScript.js]: titleVector found....", titleVector);
    // })

    // const targetNode = document.body; // Target the body for observing changes
    // const config = { childList: true, subtree: true }; // Configuration for the observer
    // observer.observe(targetNode, config); // Start observing

    // Disconnect the observer after 10 seconds
    setTimeout(() => {
        observer.disconnect();
        console.log("[PRAKHAR]: [contentScript.js]: observer disconnected....");
    }, 10000);
};

console.log("[PRAKHAR]: [contentScript.js]: script ended....");