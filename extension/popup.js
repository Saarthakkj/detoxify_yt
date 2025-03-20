// This ensures the script runs after the DOM is fully loaded
document.addEventListener("DOMContentLoaded", async () => {
    try {
        // Load saved API key, category, filter state, and batch size
        const result = await chrome.storage.sync.get(['GEMINI_API_KEY', 'USER_CATEGORY', 'FILTER_ENABLED', 'BATCH_SIZE']);
        
        // Handle API key visibility
        const apiKeyContainer = document.querySelector('.api-key-container');
        if (result.GEMINI_API_KEY) {
            apiKeyContainer.style.display = 'none';
        } else {
            apiKeyContainer.style.display = 'block';
        }

        // Restore saved category
        if (result.USER_CATEGORY) {
            // Set the value in the text input field
            const categoryInput = document.getElementById('userCategory');
            if (categoryInput) {
                categoryInput.value = result.USER_CATEGORY;
                // Update button text to indicate category can be changed
                const searchButton = document.getElementById("searchButton");
                searchButton.textContent = "Apply Filter";
            }
        }

        // Restore saved filter toggle state
        const filterToggle = document.getElementById('filterToggle');
        // Default to enabled if not set
        filterToggle.checked = result.FILTER_ENABLED !== false;
        
        // Update toggle label based on state
        updateToggleLabel(filterToggle.checked);
        
        // Restore saved batch size
        const batchSizeSlider = document.getElementById('batchSizeSlider');
        const batchSizeValue = document.getElementById('batchSizeValue');
        // Default to 15 if not set
        const savedBatchSize = result.BATCH_SIZE || 15;
        batchSizeSlider.value = savedBatchSize;
        batchSizeValue.textContent = savedBatchSize;
    } catch (error) {
        console.error('[popup.js] Error loading saved data:', error);
    }

    // Function to update toggle label text
    function updateToggleLabel(isEnabled) {
        const toggleLabel = document.querySelector('.toggle-label');
        toggleLabel.textContent = isEnabled ? 'Filter Enabled' : 'Filter Disabled';
    }

    // Filter toggle change handler
    const filterToggle = document.getElementById('filterToggle');
    filterToggle.addEventListener('change', async () => {
        const isEnabled = filterToggle.checked;
        
        // Update the label
        updateToggleLabel(isEnabled);
        
        // Save the toggle state
        try {
            await chrome.storage.sync.set({ FILTER_ENABLED: isEnabled });
            console.log('[popup.js] Filter state updated to:', isEnabled);
            
            // Send message to content script to update filter state
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                chrome.tabs.sendMessage(tabs[0].id, {
                    action: "updateFilterState",
                    filterEnabled: isEnabled
                });
                console.log("[popup.js]: Filter state message sent:", isEnabled);
            });
        } catch (error) {
            console.error('[popup.js] Error saving filter state:', error);
        }
    });

    // Search button click handler
    const searchButton = document.getElementById("searchButton");
    searchButton.addEventListener("click", async () => {
        const categoryInput = document.getElementById('userCategory');
        const category = categoryInput.value.trim();
        
        if (!category) {
            alert('Please enter a category');
            return;
        }

        const isFilterEnabled = document.getElementById('filterToggle').checked;
        
        // Save the selected category and filter state
        try {
            await chrome.storage.sync.set({ 
                USER_CATEGORY: category,
                FILTER_ENABLED: isFilterEnabled
            });
            console.log('[popup.js] Category updated to:', category);
            console.log('[popup.js] Filter state updated to:', isFilterEnabled);
        } catch (error) {
            console.error('[popup.js] Error saving settings:', error);
        }

        // Query for active tab and execute content script
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.scripting.executeScript({
                target: { tabId: tabs[0].id },
                files: ['contentScript.js']
            }, () => {
                chrome.tabs.sendMessage(tabs[0].id, {
                    action: "filter", 
                    searchString: category,
                    filterEnabled: isFilterEnabled,
                    reinitializeObserver: true // Add flag to reinitialize observer
                });
                console.log("[popup.js]: Content script injected and message sent with reinitialize flag");
            });
        });
    });

    // Add event listener to category input to enable the Apply Filter button
    const categoryInput = document.getElementById('userCategory');
    categoryInput.addEventListener('input', () => {
        if (categoryInput.value.trim()) {
            searchButton.classList.add('active');
        } else {
            searchButton.classList.remove('active');
        }
    });
    
    // Add event listener for batch size slider
    const batchSizeSlider = document.getElementById('batchSizeSlider');
    const batchSizeValue = document.getElementById('batchSizeValue');
    
    batchSizeSlider.addEventListener('input', async () => {
        const batchSize = parseInt(batchSizeSlider.value);
        batchSizeValue.textContent = batchSize;
        
        // Save the batch size to storage
        try {
            await chrome.storage.sync.set({ BATCH_SIZE: batchSize });
            console.log('[popup.js] Batch size updated to:', batchSize);
            
            // Send message to content script to update batch size in real-time
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                chrome.tabs.sendMessage(tabs[0].id, {
                    action: "updateBatchSize",
                    batchSize: batchSize
                });
                console.log("[popup.js]: Batch size message sent:", batchSize);
            });
        } catch (error) {
            console.error('[popup.js] Error saving batch size:', error);
        }
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

