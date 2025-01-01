// This ensures the script runs after the DOM is fully loaded
document.addEventListener("DOMContentLoaded", () => {
    // Grab the button by its ID
    const searchButton = document.getElementById("searchButton");

    // Add an event listener for the 'click' event
    searchButton.addEventListener("click", () => {
        console.log("[PRAKHAR]: [popup.js]: button clicked....");

        // Grab the search input field by its ID
        // const searchInput = document.getElementById("searchInput");
        // const searchString = searchInput.value;
        const category = document.querySelector('input[name="category"]:checked').value;

        console.log("[PRAKHAR]: [popup.js]: category....", category);

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
});