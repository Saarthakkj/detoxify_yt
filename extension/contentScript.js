document.requestStorageAccess().then(() => {
    // Access granted
    console.log("Access granted");
}).catch(() => {
    // Access denied
    console.error('Storage access denied');
});

// Add this at the top with other global variables
let userCategory = null;
let processedElements = new WeakSet();

//call the filterVideos function
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    userCategory = message.searchString ; 
    console.log("[contentscript.js]: Message received:", message);
    if (message.action === "filter") {
        console.log("[contentscript.js]: Filter action received with string:",userCategory);
        filterVideos();
        // Acknowledge receipt
        sendResponse({status: "received"});
    }
    return true; // Keep the message channel open for sendResponse
});


async function sendPostRequest(data) {
    try {
        //console.log("Sending data to background.js:", data);
        // Send message to background.js and wait for response
        const t_dash_vector = await chrome.runtime.sendMessage({
            type: "fetchInference",
            data: data
        });

        //console.log("Received response from background.js:", t_dash_vector);
        return t_dash_vector; // Directly return the array
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



// Add this helper function for waiting for elements to load
const waitForElements = (selector, timeout = 10000) => {
    return new Promise((resolve, reject) => {
        const startTime = Date.now();

        const checkElements = () => {
            //("selector " , selector);
            const elements = document.querySelectorAll(selector);
            //console.log("elements "  , elements);
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
const removeShorts = () => {
    let shortelements = document.getElementsByClassName('ytd-rich-section-renderer');
    for(let i = 0; i < shortelements.length; i++){

        //console.log("shorts[i] : " , shortelements[i]);
        shortelements[i].style.display= 'none';
    }
};

// Wait for both thumbnail and title to be available
const waitForThumbnail = (element) => {
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

const waitForTitle = (element)=>{
    return new Promise((resolve) =>{
        const checkTitle = () =>{
            const title = element.querySelector('#video-title');
            if(title){
                resolve(title);
            }else{
                setTimeout(checkTitle , 100); 
            }
        };
        checkTitle(); 
    });
}

// removing function for each element (that waits for thumbnails and titlte to load) and then remove every element passed through it
const processElement = async (element) => {
    try {
        // Wait for thumbnail and title to load
        const thumbnail = await waitForThumbnail(element);
        const titleElement = await waitForTitle(element);

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

// Set up observer for new content
const observer = new MutationObserver(async (mutations) => {
    for (const mutation of mutations) {
        if (mutation.addedNodes.length) {            
            if (mutation.addedNodes.length > 0) {
                //console.log("[contentscript.js]: New elements detected in observer :", mutation.addedNodes.length);
                filterVideos(mutation.addedNodes); 
            }
        }
    }
});


// Function to filter videos based on the search string
const filterVideos = async (elements) => {
    try {
        if (!userCategory) {
            console.log("user category not configured");
            return;
        }
        // for first call : 
        if(!elements || !Array.isArray(elements)){
            // console.log("no elements passed , creating own elements");
            elements = await waitForElements('ytd-rich-item-renderer');
        }

        // Replace lazily loaded elements with their active counterparts
        for (let i = 0; i < elements.length; i++) {
            if (isLazilyLoaded(elements[i])) {
                const activeElement = await getActiveElement(elements[i]);
                if (activeElement) {
                    elements[i] = activeElement; // Replace the lazy-loaded element
                } else {
                    elements.splice(i, 1); // Remove the element if no active counterpart is found
                    i--; // Adjust the index after removal
                }
            }
        }

        // Filter out already processed elements
        elements = elements.filter(el => !processedElements.has(el));
        if (elements.length === 0) return; // Exit if no new elements

        // Mark elements as processed
        elements.forEach(el => processedElements.add(el));

        //elements only contains video titles (not shorts) ;

        // console.log(elements);
        
        // Remove Shorts first
        removeShorts();

        try {
            // console.log("elements ;" , elements) ;
            let titleVector = await scrapperTitleVector(elements);
            let t_vector = titleVector.map((title) => ({ "text": title }));
            // console.log("api request sent....", t_vector);

            
            const tries = 3;
            let t_dash_vector = []; 
            console.log("t_vector sent: ", t_vector);
            let n_try = 0;
            let apiresponse = false;
            //try 3 times for the filtering (server overload issues in gemini)
            while(n_try++ < tries && !apiresponse){
                try{
                    t_dash_vector  = await sendPostRequest(t_vector).then(data =>{return data});
                    apiresponse = true;
                }
                catch(error){
                    console.log("error in sending data to bg failed , filterVideos function " , error);
                }
            }
            
            console.log("t dash vector : " , t_dash_vector);
            let i = 0 ;
            if (t_dash_vector) {
                for(; i < elements.length; i++) {
                    const titleElement = elements[i].querySelector("#video-title");
                    if (!titleElement) continue;

                    // // Decode HTML entities in the video title
                    // const decoder = document.createElement('div');
                    // decoder.innerHTML = titleElement.innerHTML;
                    // const video_title = decoder.textContent.trim();
                    
                    //? optimise this O(n) function: 
                    const t_dash_item = t_dash_vector.find(item => 
                        item.input_text === titleElement.textContent.trim()
                    );
                    console.log("t_dash_item.predicted_label  , ",  t_dash_item.predicted_label , " string : " , userCategory) ; 

                    console.log("elements i " , elements[i]); 

                    if (t_dash_item && t_dash_item.predicted_label !== userCategory) {
                        await processElement(elements[i]);
                    }
                }
            }
            // console.log("stopping at index : " , i); 


        } catch (error) {
            console.error("Error in filterContent:", error);
        }

        // Start observing the content container
        const contentContainer = document.querySelector('#content');
        if (contentContainer) {
            const config = {
                childList: true, 
                subtree: true
            }; 

            //config : childList -> watch for changes in direct children of content
            //config : subTree -> watching for changes in sub tree of the childerns


            observer.observe(contentContainer,config );
            console.log("[contentscript.js]: Observer started");
        }



        

        

        // Clean up previous observer after 24 hours (or adjust as needed)
        setTimeout(() => {
            observer.disconnect();
            console.log("[contentscript.js]: Observer disconnected");
        }, 24 * 60 * 60 * 1000); // 24 hours

    } catch (error) {
        console.error("[contentscript.js] Error in filterVideos:", error);
    }
};

// Check if an element is lazily loaded
const isLazilyLoaded = (element) => {
    // Check for attributes or properties that indicate lazy loading
    return element.hasAttribute('is-responsive-grid') || 
            element.hasAttribute('is-shelf-item') ;
};

// Get the active, fully-loaded counterpart of a lazily loaded element
const getActiveElement = async (element) => {
    return new Promise((resolve) => {
        const checkActive = () => {
            // Get the title of the lazy-loaded element
            const titleElement = element.querySelector('#video-title');
            if (!titleElement) {
                resolve(null); // No title found, skip this element
                return;
            }

            const title = titleElement.textContent.trim();

            // Find the active element with the same title
            const activeElement = Array.from(document.querySelectorAll('ytd-rich-item-renderer'))
                .find(el => {
                    const activeTitleElement = el.querySelector('#video-title');
                    return activeTitleElement && activeTitleElement.textContent.trim() === title;
                });

            if (activeElement && 
                activeElement.querySelector('ytd-thumbnail img') && 
                activeElement.querySelector('#video-title')) {
                resolve(activeElement);
            } else {
                setTimeout(checkActive, 100);
            }
        };
        checkActive();
    });
};

console.log("[contentscript.js]: [contentscript.js.js]: script ended....");
