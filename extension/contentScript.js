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


async function sendPostRequest(data) {
    try {
        // Since Chrome's messaging API returns a promise when used with await
        const response = await chrome.runtime.sendMessage({
            type: "fetchInference",
            data: data
        });

        // Check if response contains error
        if (response.error) {
            throw new Error(response.error);
        }

        // Return just the data, not the promise
        return response.data;
    } catch (error) {
        console.error("Error in sendPostRequest:", error);
        throw error; // Re-throw to be handled by the caller
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

// Add this helper function for waiting for elements to load
const waitForElements = (selector, timeout = 10000) => {
    return new Promise((resolve, reject) => {
        const startTime = Date.now();

        const checkElements = () => {
            const elements = document.querySelectorAll(selector);
            if (elements.length > 0) {
                resolve(Array.from(elements));
            } else if (Date.now() - startTime >= timeout) {
                reject(new Error(`Timeout waiting for ${selector}`));
            } else {
                setTimeout(checkElements, 100);
            }
        };

        checkElements();
    }); 
};

// for removing yt shorts fro the page
const removeShorts = (elements) => {
    let shortelements = Array.from(document.querySelectorAll('ytd-rich-section-renderer'));
    for(let i = 0; i < shortelements.length; i++){
        // console.log("shorts[i] : " , shortelements[i]);
        shortelements[i].style.display= 'none';
    }
};

// Function to filter videos based on the search string
const filterVideos = async (searchString) => {
    lastFilteredString = searchString; 
    try {
        // Wait for elements to load
        const elements = await waitForElements('ytd-rich-item-renderer');
        
        // Remove Shorts first
        removeShorts(elements);
        
        // removing function for each element (that waits for thumbnails and titlte to load) and then remove every element passed through it
        const processElement = async (element) => {
            // Wait for both thumbnail and title to be available
            const waitForThumbnail = () => {
                return new Promise((resolve) => {
                    const checkThumbnail = () => {
                        const thumbnail = element.querySelector('ytd-thumbnail img');
                        if (thumbnail && thumbnail.src) {
                            resolve(thumbnail);
                        } else {
                            setTimeout(checkThumbnail, 100);
                        }
                    };
                    checkThumbnail();
                });
            };

            try {
                const thumbnail = await waitForThumbnail();
                const titleElement = element.querySelector("#video-title");
                
                // Process thumbnail
                if (thumbnail) {
                    
                    thumbnail.src = chrome.runtime.getURL('cross.png');
                }
                
                // Process title
                if (titleElement) {
                    titleElement.innerHTML = 'not allowed to watch';
                }
                
                // Disable interactions
                element.style.pointerEvents = 'none';
                
            } catch (error) {
                console.error("Error processing element:", error);
            }
        };

        // Modify the filterContent function
        const filterContent = async (elements) => {
            removeShorts(elements);
            try {
                console.log("elements ;" , elements) ;
                let titleVector = await scrapperTitleVector(elements);
                let t_vector = titleVector.map((title) => ({ "text": title }));
                console.log("api request sent....", t_vector);

                

                let t_dash_vector = []; 
                console.log("t_vector sent: ", t_vector);
                try{
                    t_dash_vector  = await sendPostRequest(t_vector).then(data =>{return data});
                }
                catch(error){
                    console.log("error in sending data to bg failed , filterVideos function " , error);
                }
                console.log("t dash vector : " , t_dash_vector);
                
                if (t_dash_vector) {
                    for(let i = 0; i < elements.length; i++) {
                        const titleElement = elements[i].querySelector("#video-title");
                        if (!titleElement) continue;

                        // Decode HTML entities in the video title
                        const decoder = document.createElement('div');
                        decoder.innerHTML = titleElement.innerHTML;
                        const video_title = decoder.textContent.trim();

                        const t_dash_item = t_dash_vector.find(item => 
                            item.input_text === video_title
                        );

                        console.log("Comparing:", {
                            videoTitle: video_title,
                            matchedItem: t_dash_item,
                            searchString: lastFilteredString
                        });

                        if (t_dash_item && t_dash_item.predicted_label !== lastFilteredString) {
                            await processElement(elements[i]);
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
    } catch (error) {
        console.error("Error in filterVideos:", error);
    }
};

console.log("[PRAKHAR]: [contentScript.js]: script ended....");

