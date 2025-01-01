document.requestStorageAccess().then(() => {
    // Access granted
    console.log("Access granted");
}).catch(() => {
    // Access denied
    console.error('Storage access denied');
});
// Test message listener
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log("[PRAKHAR]: Message received:", message);
    if (message.action === "filter") {
        console.log("[PRAKHAR]: Filter action received with string:", message.searchString);
        filterVideos(message.searchString);
        // Acknowledge receipt
        sendResponse({status: "received"});
    }
    return true; // Keep the message channel open for sendResponse
});

async function sendPostRequest(url, data) {
    if(data.length === 0) {
        return null;
    }
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        
        const result = await response.json();
        // console.log('Response:', result);
        return result;
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
}

// Function to scrape video titles from the page
let scrapperTitleVector = async (elements) => {
    let titleVector1 = elements.map((el) => {
        let titleElement = el.querySelector("#video-title");
        if (titleElement) {
            return titleElement.textContent.trim();
        }
        return null;
    });

    let filteredArray = titleVector1.filter((value) => value !== null);
    
    return filteredArray;
};

// Add this at the top with other global variables
let lastFilteredString = null;

// Function to filter videos based on the search string
const filterVideos = async (searchString) => {
    lastFilteredString = searchString; // Store the current filter string
    console.log("cross image " , chrome.runtime.getURL('cross.png'));
    let elements = Array.from(document.querySelectorAll('ytd-rich-item-renderer'));
    let thumbnails = Array.from(document.querySelectorAll('ytd-thumbnail img'));
    console.log("[PRAKHAR]: [contentScript.js]: elements found....", elements[1].querySelector("#video-title"));
    console.log("[PRAKHAR]: [contentScript.js]: thumbnails found....", thumbnails[1].src);
    if (elements.length === 0) {
        elements = Array.from(document.querySelectorAll('ytd-compact-video-renderer'));
    }

    const filterContent = async (elements) => {
        let titleVector = await scrapperTitleVector(elements);
        console.log("[contentScript.js]: titleVector found....", titleVector);
        
        let t_vector = titleVector.map((title) => ({ text: title }));
        console.log("api request sent....");
        let t_dash_vector = await sendPostRequest('https://detoxify-yt.onrender.com/predict', t_vector);
        console.log("[PRAKHAR]: [contentScript.js]: api response received....", t_dash_vector);
        
        if (t_dash_vector) {
            for(let i = 0; i < t_dash_vector.length; i++) {
                if(t_dash_vector[i].predicted_label !== searchString) {
                    if (elements[i] && elements[i].isConnected) {
                        try {
                            console.log(`Hiding video with label: ${t_dash_vector[i].predicted_label}`);
                            if (thumbnails[i]) {
                                thumbnails[i].src = chrome.runtime.getURL('cross.png');
                                elements[i].style.opacity = '0.5'; // Optional: dim the whole card
                            }
                            let titleElement = elements[i].querySelector("#video-title");
                            if (titleElement) {
                                titleElement.innerHTML = ''; // Clear only the title
                            }
                        } catch (error) {
                            console.error('Error modifying element:', error);
                        }
                    }
                }
            }
        }
    };

    // Initial filtering
    await filterContent(elements);

    // Set up observer for new content
    const observer = new MutationObserver(async (mutations) => {
        for (const mutation of mutations) {
            if (mutation.addedNodes.length) {
                const newElements = Array.from(mutation.addedNodes)
                    .filter(node => node.tagName === 'YTD-RICH-ITEM-RENDERER');
                
                if (newElements.length > 0) {
                    console.log("[PRAKHAR]: New elements detected:", newElements.length);
                    await filterContent(newElements);
                }
            }
        }
    });

    // Start observing the content container
    const contentContainer = document.querySelector('#contents');
    if (contentContainer) {
        observer.observe(contentContainer, {
            childList: true,
            subtree: true
        });
        console.log("[PRAKHAR]: Observer started");
    }

    // Clean up previous observer after 24 hours (or adjust as needed)
    setTimeout(() => {
        observer.disconnect();
        console.log("[PRAKHAR]: Observer disconnected");
    }, 24 * 60 * 60 * 1000); // 24 hours
};

console.log("[PRAKHAR]: [contentScript.js]: script ended....");

