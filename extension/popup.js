// This ensures the script runs after the DOM is fully loaded
document.addEventListener("DOMContentLoaded", async () => {
    // Grab the button by its ID
    const searchButton = document.getElementById("searchButton");

    // Add an event listener for the 'click' event
    searchButton.addEventListener("click", () => {
        console.log("[PRAKHAR]: [popup.js]: button clicked....");

        // Grab the search input field by its ID
        // const searchInput = document.getElementById("searchInput");
        // const searchString = searchInput.value;
        const category = document.querySelector('input[name="category"]:checked').value;

        console.log(" [popup.js]: category....", category);

        // Query for the currently active tab in the current window
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            // First check if we can inject the content script
            chrome.scripting.executeScript({
                target: { tabId: tabs[0].id },
                files: ['contentScript.js']
            }, () => {
                // After content script is injected, send the message
                chrome.tabs.sendMessage(tabs[0].id, {
                    action: "filter", 
                    searchString: category
                });
                console.log("[PRAKHAR]: [popup.js]: content script injected and message sent....");
            });
        });
    });

    try {
        const result = await chrome.storage.sync.get(['GEMINI_API_KEY']);
        const apiKeyContainer = document.querySelector('.api-key-container');
        
        if (result.GEMINI_API_KEY) {
            // Hide the API key input container if key exists
            apiKeyContainer.style.display = 'none';
        } else {
            // Show the container if no key exists
            apiKeyContainer.style.display = 'block';
        }
    } catch (error) {
        console.error('[popup.js] Error loading API key:', error);
    }
});

// Update the save API key event listener
document.getElementById('saveApiKey').addEventListener('click', async () => {
    const apiKey = document.getElementById('apiKey').value.trim();
    if (!apiKey) {
        alert('Please enter an API key');
        return;
    }

    try {
        await chrome.storage.sync.set({ GEMINI_API_KEY: apiKey });
        
        // Hide the API key container after successful save
        const apiKeyContainer = document.querySelector('.api-key-container');
        apiKeyContainer.style.display = 'none';
        
        // Send message to background script to reinitialize model
        await chrome.runtime.sendMessage({ 
            type: "reinitializeModel",
            apiKey: apiKey 
        });
        
        alert('API key saved successfully!');
    } catch (error) {
        console.error('[popup.js] Error saving API key:', error);
        alert('Error saving API key');
    }
});

