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


function sendPostRequest(data) {
    return new Promise((resolve, reject) => {
        if (!data || !Array.isArray(data)) {
            reject(new Error('Invalid data format'));
            return;
        }

        chrome.runtime.sendMessage({
            type: "fetchInference",
            data: data
        }, function(response) {
            console.log("response received in content script  , sendPostRequest function : " , response);
            if (chrome.runtime.lastError) {
                console.error("Runtime error:", chrome.runtime.lastError);
                reject(chrome.runtime.lastError);
                return;
            }

            if (!response) {
                reject(new Error('No response received'));
                return;
            }

            if (!response.success) {
                // If it's a 502 error, we might want to retry
                if (response.error && response.error.includes('502')) {
                    reject(new Error('Server temporarily unavailable. Please try again later.'));
                    return;
                }
                reject(new Error(response.error));
                return;
            }

            resolve(response.data);
        });
    });
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
    // console.log("[PRAKHAR]: [contentScript.js]: elements found....", elements[1].querySelector("#video-title"));
    // console.log("[PRAKHAR]: [contentScript.js]: thumbnails found....", thumbnails[1].src);

    let shortelements = Array.from(document.querySelectorAll('ytd-rich-section-renderer'));
    for(let i = 0; i < shortelements.length; i++){
        // console.log("shorts[i] : " , shortelements[i]);
        shortelements[i].style.display= 'none';
    }


    // console.log("changing first video's thumbnail "  );
    // thumbnails[1].src = chrome.runtime.getURL('cross.png');
    // elements[1].querySelector("#video-title").innerHTML = 'not allowed to watch';

   
    
    if (elements.length === 0) {
        elements = Array.from(document.querySelectorAll('ytd-compact-video-renderer'));
    }

    const filterContent = async (elements) => {
        try {
            let titleVector = await scrapperTitleVector(elements);
            // console.log("[contentScript.js]: titleVector found....", titleVector);
            
            let t_vector = titleVector.map((title) => ({ "text": title }));
            // t_vector = await JSON.stringify(t_vector);
            console.log("api request sent....", t_vector);

            let t_dash_vector = []; 
            try{
                t_dash_vector  = await sendPostRequest(t_vector);
            }
            catch(error){
                console.log("error in sending data to bg failed , filterVideos function " , error);
            }

            console.log("t dash vector ", t_dash_vector);
            
            if (t_dash_vector) {
                for(let i = 0; i < t_dash_vector.length; i++) {
                    // console.log("t_dash_vector[i] : " , t_dash_vector[i]);
                    if(t_dash_vector[i].predicted_label !== searchString && thumbnails[i] && elements[i]) {
                        // console.log("t_dash_vector[i] where label is different : " , t_dash_vector[i] ,"this is the elements array : " ,  elements[i]);
                        // elements[i].innerHTML = '';
                        thumbnails[i].src = chrome.runtime.getURL('cross.png');
                        elements[i].cssText += 'pointer-events: none;'; //for making the video unclickable
                        // elements[i].querySelector("#video-title").cssText += 'pointer-events: none';
                        elements[i].querySelector("#video-title").innerHTML = 'not allowed to watch' ; 
                    }
                }
            }
        } catch (error) {
            console.error("Error in filterContent:", error);
        }
    };

    // Initial filtering
    await filterContent(elements);

    // Set up observer for new content
    const observer = new MutationObserver(async (mutations) => {
        for (const mutation of mutations) {
            if (mutation.addedNodes.length) {
                const newElements = Array.from(mutation.addedNodes)
                    .filter(node => node.tagName === 'ytd-rich-item-renderer');
                
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

