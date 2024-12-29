// This ensures the script runs after the DOM is fully loaded
document.addEventListener("DOMContentLoaded", () => {
    // Grab the button by its ID
    const searchButton = document.getElementById("searchButton");

    // Add an event listener for the 'click' event
    searchButton.addEventListener("click", () => {
        console.log("[PRAKHAR]: [popup.js]: button clicked....");

        // Grab the search input field by its ID
        const searchInput = document.getElementById("searchInput");
        const searchString = searchInput.value;

        console.log("[PRAKHAR]: [popup.js]: searchString....", searchString);

        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.tabs.sendMessage(tabs[0].id, {action: "filter", searchString: searchString});
        });
    });
});