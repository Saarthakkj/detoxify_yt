async function initializeWithSavedCategory() {
    try {
        const result = await chrome.storage.sync.get(['USER_CATEGORY', 'GEMINI_API_KEY']);
        if (result.USER_CATEGORY && result.GEMINI_API_KEY) {
            console.log("[contentscript.js]: Found saved category:", result.USER_CATEGORY);
            window.userCategory = result.USER_CATEGORY;
            
            // Start observer immediately if we have the category
            if (!window.observerRunning) {
                window.observerRunning = true;
                setupObserver();
            }
            
            // Get initial elements on the page
            const initialElements = await waitForElements('YTD-RICH-ITEM-RENDERER');
            if (initialElements && initialElements.length > 0) {
                console.log("[contentscript.js]: Found initial elements, starting filtering...");
                await filterVideos(initialElements);
            }

            // Handle initial shorts
            const initialShorts = await waitForElements('YTD-RICH-SECTION-RENDERER');
            if (initialShorts && initialShorts.length > 0) {
                console.log("[contentscript.js]: Found initial shorts, removing...");
                await removeShorts(initialShorts);
            }
        }
    } catch (error) {
        console.error("[contentscript.js]: Error initializing with saved category:", error);
    }
}

// Add this to ensure the script runs when YouTube loads initially
window.addEventListener('load', initializeWithSavedCategory);

// Keep the DOMContentLoaded listener for redundancy
document.addEventListener('DOMContentLoaded', initializeWithSavedCategory);

// Also call it when YouTube's navigation occurs (for SPA navigation)
let lastUrl = location.href;
new MutationObserver(() => {
    const url = location.href;
    if (url !== lastUrl) {
        lastUrl = url;
        console.log('[contentscript.js]: YouTube navigation detected, reinitializing...');
        initializeWithSavedCategory();
    }
}).observe(document, { subtree: true, childList: true });

document.requestStorageAccess().then(() => {
    console.log("Access granted");
}).catch(() => {
    console.error('Storage access denied');
});

// Initialize counters
var removeShortsCount = 0;
var filterVideosCount = 0;

var processedSections = new WeakSet();
// let userCategory = null;
var processedElements = new WeakSet();


// Initialize observer at the top level
let observer = null;

// Function to setup observer
function setupObserver() {
    if (observer) {
        observer.disconnect();
    }

    let collectedItemNodes = [];
    let collectedSectionNodes = [];

    observer = new MutationObserver(async (mutations) => {
        try {
            mutations.forEach(function(mutation) {
                // Collect nodes from this mutation
                mutation.addedNodes.forEach(function(node) {
                    if (node.tagName === 'YTD-RICH-ITEM-RENDERER') {
                        collectedItemNodes.push(node);
                    }
                    if (node.tagName === 'YTD-RICH-SECTION-RENDERER') {
                        collectedSectionNodes.push(node);
                    }
                });
            });

            // Process collected nodes outside the mutations.forEach loop
            if (collectedItemNodes.length > 15) {
                // console.log("[Observer] Processing video batch:", collectedItemNodes.length);
                await filterVideos(collectedItemNodes);
                // Clear processed nodes
                collectedItemNodes = [];
            }
            
            if (collectedSectionNodes.length > 0) {
                // console.log("[Observer] Processing shorts:", collectedSectionNodes.length);
                await removeShorts(collectedSectionNodes);
                // Clear processed nodes
                collectedSectionNodes = [];
            }
 
        } catch (error) {
            console.error("Error in MutationObserver callback:", error);
        }
    });

    // Start observing
    const contentContainer = document.querySelector('#contents');
    if (contentContainer) {
        observer.observe(contentContainer, {
            childList: true,
            subtree: true
        });
        console.log("[contentscript.js]: Observer started");
    }
}


// Modify the message listener
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.searchString) {
        window.userCategory = message.searchString;
    }

    console.log("[contentscript.js]: Message received:", message);

    if (message.action === "filter") {
        console.log("[contentscript.js]: Filter action received with string:", window.userCategory);
        if (!window.observerRunning) {
            window.observerRunning = true;
            setupObserver();
        }
        removeShorts();
        filterVideos();
        sendResponse({status: "received"});
    }
    return true;
});

// Clean up observer after 24 hours
setTimeout(() => {
    if (observer) {
        observer.disconnect();
        window.observerRunning = false;
        console.log("[contentscript.js]: Observer disconnected after timeout");
    }
}, 24 * 60 * 60 * 1000);

async function sendPostRequest(titles , input) {

    try {
        const data = {"titles" : titles ,"input" :  input};
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
var scrapperTitleVector = async (elements) => {
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
var waitForElements = (selector, timeout = 1000) => {
    try {
        return new Promise((resolve, reject) => {
            const startTime = Date.now();

            const checkElements = () => {
                const elements = document.getElementsByTagName(selector);
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
    } catch(error) {
        console.error("Error in waitForElements:", error);
    }
};

// for removing yt shorts fro the page
var removeShorts = async (elements) => {
    if(!elements){
        // console.log("no elements passed , creating own elements");
        elements = await waitForElements('ytd-rich-section-renderer');
    }
    try{
        removeShortsCount++;
        // let shortelements = document.getElementsByClassName('ytd-rich-section-renderer'); 
        // shortelements = Array.from(shortelements);
        // shortelements = shortelements.filter(shorties => !processedSections.has(shorties));
        console.log("sectionrenderer elements : " , elements);
        // if (shortelements.length === 0) return; 
        // shortelements.forEach(shorties => processedSections.add(shorties));

        for(let i = 0; i < elements.length; i++){
            // console.log("shorts[i] : " , shortelements[i]);
            elements[i].style.display= 'none'; 
        }
        console.log(`removeShorts called ${removeShortsCount} times`); // Log counter
    }catch(error){
        console.error("Error in removeShorts:", error);
    }
};
// Wait for both thumbnail and title to be available
var waitForThumbnail = (element) => {
    try{
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
    }catch(error){
        console.error("Error in waitForThumbnail:", error);
    }
};

var waitForTitle = (element)=>{
    try{
        return new Promise((resolve) =>{
            const checkTitle = () => {
                const title = element.querySelector('#video-title');
                if(title){
                    resolve(title);
                }else{
                    setTimeout(checkTitle , 100); 
                }
            };
            checkTitle(); 
        });
    }catch(error){
        console.error("Error in waitForTitle:", error);
    }
}

// removing function for each element (that waits for thumbnails and titlte to load) and then remove every element passed through it
var processElement = async (element) => {
    try {
        //!bakchodi :>
        element.style.display = 'none'; 

    } catch (error) {
        console.error("Error processing element function:", error);
    }
};

// Function to filter videos based on the search string
var filterVideos = async (elements) => {
    try {
        filterVideosCount++; // Increment counter
        if (!window.userCategory) {
            console.log("search string not configured");
            return;
        }
        console.log(`filterVideos called ${filterVideosCount} times`); // Log counter

        // for first call : 
        if(!elements || !Array.isArray(elements)){
            // console.log("no elements passed , creating own elements");
            elements = await waitForElements('YTD-RICH-ITEM-RENDERER');
        }

        // Filter out already processed elements
        elements = elements.filter(el => !processedElements.has(el));
        if (elements.length === 0) return; // Exit if no new elements

        // Mark elements as processed
        elements.forEach(el => processedElements.add(el));

        //elements only contains video titles (not shorts) ;

        console.log(elements);
        

        try {
            // console.log("elements ;" , elements) ;
            let titleVector = await scrapperTitleVector(elements);
            let t_vector = titleVector.map((title) => ({ "text": title }));
            // console.log("api request sent....", t_vector);

            
            const tries = 3;
            let t_dash_vector = []; 
            // console.log("t_vector sent: ", t_vector);
            let n_try = 0;
            let apiresponse = false;
            //try 3 times for the filtering (server overload issues in gemini)
            while(n_try++ < tries && !apiresponse){
                try{
                    t_dash_vector  = await sendPostRequest(t_vector , window.userCategory).then(data =>{return data});
                    apiresponse = true;
                }
                catch(error){
                    console.error("error in sending data to bg failed , filterVideos function " , error);
                }
            }
            
            // console.log("t dash vector : " , t_dash_vector);
            let i = 0 ;
            if (t_dash_vector) {
                for(; i < elements.length; i++) {
                    try{
                        const titleElement = elements[i].querySelector("#video-title");
                        if (!titleElement) continue;
                        
                        //? optimise this O(n) function: 
                        const t_dash_item = t_dash_vector.find(item => 
                            item.input_text === titleElement.textContent.trim()
                        );
                        if(!t_dash_item) continue;
                        // console.log("t_dash_item.predicted_label  , ",  t_dash_item.predicted_label , " string : " , window.userCategory) ; 

                        // console.log("t_dash_item : ",  t_dash_item ) ; 

                        if (t_dash_item && t_dash_item.predicted_label !== "true") {
                            try{
                                processElement(elements[i]);
                            }catch(error){
                                console.error("Error in processElement:", error);
                                continue;
                            }
                        }
                    }catch(error){
                        console.error("Error in filterContent , inside for loop:", error);
                        continue;
                    }
                    continue;
                }
                // console.log("filtervideos for loop completed");
            }
            // console.log("stopping at index : " , i); 
        } catch (error) {
            console.error("Error in filterContent:", error);
        }
        // console.log(`filterVideos called ${filterVideosCount} times`); // Log counter

    } catch (error) {
        console.error("[contentscript.js] Error in filterVideos:", error);
    }
};

console.log("[contentscript.js]: [contentscript.js.js]: script ended....");
