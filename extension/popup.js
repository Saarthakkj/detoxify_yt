// This ensures the script runs after the DOM is fully loaded
document.addEventListener("DOMContentLoaded", async () => {
    try {
        // Load saved API key and category
        const result = await chrome.storage.sync.get(['GEMINI_API_KEY', 'USER_CATEGORY']);
        
        // Handle API key visibility
        const apiKeyContainer = document.querySelector('.api-key-container');
        if (result.GEMINI_API_KEY) {
            apiKeyContainer.style.display = 'none';
        } else {
            apiKeyContainer.style.display = 'block';
        }

        // Restore saved category selection
        if (result.USER_CATEGORY) {
            const savedCategory = document.querySelector(`input[value="${result.USER_CATEGORY}"]`);
            if (savedCategory) {
                savedCategory.checked = true;
            }
        }
    } catch (error) {
        console.error('[popup.js] Error loading saved data:', error);
    }

    // Search button click handler
    const searchButton = document.getElementById("searchButton");
    searchButton.addEventListener("click", async () => {
        const selectedCategory = document.querySelector('input[name="category"]:checked');
        
        if (!selectedCategory) {
            alert('Please select a category');
            return;
        }

        const category = selectedCategory.value;
        
        // Save the selected category
        try {
            await chrome.storage.sync.set({ USER_CATEGORY: category });
        } catch (error) {
            console.error('[popup.js] Error saving category:', error);
        }

        // Query for active tab and execute content script
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.scripting.executeScript({
                target: { tabId: tabs[0].id },
                files: ['contentScript.js']
            }, () => {
                chrome.tabs.sendMessage(tabs[0].id, {
                    action: "filter", 
                    searchString: category
                });
                console.log("[popup.js]: Content script injected and message sent");
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

