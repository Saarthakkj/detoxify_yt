document.requestStorageAccess().then(() => {
    console.log("Access granted");
}).catch(() => {
    console.error('Storage access denied');
});

// Add to your script
function ensureObserverHealthy() {
    if (!observer || !window.observerRunning) {
        console.log(`[Detoxify Observer not running, restarting`);
        window.observerRunning = true;
        setupObserver();
    }
    else{
        // console.log(`[Detoxify  Observer is healthy`);
    }

    // console.log("contents container : " , document.querySelector('#contents'));
    // console.log("content container : " , document.querySelector('#content'));
}
async function initializeWithSavedCategory() {
    try {
        const result = await chrome.storage.sync.get(['USER_CATEGORY', 'GEMINI_API_KEY', 'FILTER_ENABLED', 'BATCH_SIZE']);
        // Set default batch size if not set
        window.batchSize = result.BATCH_SIZE || 15;
        if (result.USER_CATEGORY && result.GEMINI_API_KEY) {
            console.log("[contentscript.js]: Found saved category:", result.USER_CATEGORY);
            window.userCategory = result.USER_CATEGORY;
            
            // Set filter enabled state (default to enabled if not set)
            window.filterEnabled = result.FILTER_ENABLED !== false;
            console.log("[contentscript.js]: Filter enabled state:", window.filterEnabled);
            
            // Only start observer and process elements if filtering is enabled
            if (window.filterEnabled) {
                // Start observer immediately
                if (!window.observerRunning) {
                    window.observerRunning = true;
                    setupObserver();
                }
                
                try {
                    //? Handle initial shorts first
                    const initialShorts = await waitForElements('YTD-RICH-SECTION-RENDERER');
                    if (initialShorts && initialShorts.length > 0) {
                        console.log("[contentscript.js]: Removing initial shorts sections:", initialShorts.length);
                        await removeShorts(initialShorts);
                    }
                
                    //? no batch size for initial elements (after that observer logic will take care) : 
                    const allInitialElements = await waitForElements('YTD-RICH-ITEM-RENDERER');
                    if (allInitialElements && allInitialElements.length > 0) {
                        console.log("[contentscript.js]: Processing initial elements:", allInitialElements.length);
                        await filterVideos(allInitialElements);
                    }
                } catch (error) {
                    console.error("[contentscript.js]: Error processing initial elements:", error);
                }
            } else {
                console.log("[contentscript.js]: Filtering is disabled, not starting observer");
            }
        }
    } catch (error) {
        console.error("[contentscript.js]: Error initializing with saved category:", error);
    }
}

// Add both event listeners for initialization
window.addEventListener('load', initializeWithSavedCategory);
document.addEventListener('DOMContentLoaded', initializeWithSavedCategory);

// Store initial URL
let lastUrl = location.href;

// Create observer for YouTube's Single Page Application (SPA) navigation
const navigationObserver = new MutationObserver(() => {
    const url = location.href;
    if (url !== lastUrl) {
        // URL has changed
        lastUrl = url;
        console.log('[contentscript.js]: YouTube navigation detected, reinitializing...');
        
        // Reset tracking sets for processed content
        processedElements = new WeakSet();
        processedSections = new WeakSet();
        
        // Reinitialize filtering
        initializeWithSavedCategory();
    }
});

// Start observing for navigation changes
navigationObserver.observe(document, { subtree: true, childList: true });

// Initialize counters
var removeShortsCount = 0;
var filterVideosCount = 0;

var processedSections = new WeakSet();
// let userCategory = null;
var processedElements = new WeakSet();

var contentContainer = null ;

// Initialize observer at the top level
let observer = null;

// Function to setup observer
function setupObserver() {
    console.log('reached inside setup observer');
    if (observer) {
        console.log("observer already connected , so disconnecting it");
        observer.disconnect();

    }
    console.log('observer endpoint 1');
    
    observer = new MutationObserver(async (mutations) => {
        try {
            for (const mutation of mutations) {
                for (const node of mutation.addedNodes) {
                    // console.log('inside mutaitons' , mutations);
                    // Handle shorts immediately
                    if (node.tagName === 'YTD-RICH-SECTION-RENDERER'  && !processedSections.has(node)) {
                        processedSections.add(node);
                        console.log("[Observer] Processing shorts section" , node);
                        await removeShorts([node]); // Process sections immediately
                    }
                    
                    // // Handle grid renderers immediately
                    // if (node.tagName === 'YTD-RICH-GRID-RENDERER' && !processedSections.has(node)) {
                    //     processedSections.add(node);
                    //     console.log("[Observer] Processing grid renderer section" , node);
                    //     await removeGrids([node]); // Process grid renderers immediately
                    // }
                    
                    // Collect video nodes for batch processing
                    if (node.tagName === 'YTD-RICH-ITEM-RENDERER' && !processedElements.has(node)) {
                        observer.collectedItemNodes.push(node);
                        
                        // Process when we have enough videos based on batch size setting
                        if (observer.collectedItemNodes.length >= window.batchSize) {
                            const batchToProcess = observer.collectedItemNodes.splice(0, window.batchSize); // Take batch and remove them
                            processedElements.add(batchToProcess);
                            console.log(`[Observer] Processing video batch of ${window.batchSize}`);
                            await filterVideos(batchToProcess);     
                        }
                    }
                }
            }
        } catch (error) {
            console.error("Error in MutationObserver callback:", error);
        }
    });

    console.log("observer endpoint 2");
    // Add collections to observer instance
    observer.collectedItemNodes = [];

    // Start observing
    contentContainer = document.querySelector('#content');
    if(contentContainer){
        observer.observe(contentContainer, {
            childList: true,
            subtree: true
        });
    }
    
    console.log("[contentscript.js]: Observer started");
    console.log("observer endpoint 3");
    console.log("observer connected ? : " , observer);
    setInterval(ensureObserverHealthy , 1000);
}

// Modify the message listener
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.searchString) {
        window.userCategory = message.searchString;
    }

    console.log("[contentscript.js]: Message received:", message);

    if (message.action === "filter") {
        console.log("[contentscript.js]: Filter action received with string:", window.userCategory);
        
        // Store filter enabled state
        window.filterEnabled = message.filterEnabled !== false;
        console.log("[contentscript.js]: Filter enabled state:", window.filterEnabled);
        
        // Check if we need to reinitialize the observer (category changed)
        if (message.reinitializeObserver) {
            console.log("[contentscript.js]: Reinitializing observer due to category change");
            // Reset tracking sets for processed content
            processedElements = new WeakSet();
            processedSections = new WeakSet();
            
            // Disconnect existing observer if it exists
            if (observer) {
                observer.disconnect();
                observer = null;
            }
            
            window.observerRunning = false;
        }
        
        // Only setup observer and filter if filtering is enabled
        if (window.filterEnabled) {
            if (!window.observerRunning) {
                console.log("connecting observer"); 
                window.observerRunning = true;
                setupObserver();
            }
            removeShorts();
            filterVideos();
        } else {
            // If filtering is disabled, disconnect observer
            if (observer) {
                console.log("[contentscript.js]: Disconnecting observer as filtering is disabled");
                observer.disconnect();
                observer = null;
            }
            window.observerRunning = false;
            
            // Show any hidden elements when filter is disabled
            restoreHiddenElements();
        }
        
        sendResponse({status: "received"});
    } else if (message.action === "updateFilterState") {
        // Handle filter state updates without changing category
        window.filterEnabled = message.filterEnabled;
        console.log("[contentscript.js]: Filter state updated to:", window.filterEnabled);
        
        if (window.filterEnabled) {
            // Re-enable filtering
            if (!window.observerRunning) {
                window.observerRunning = true;
                setupObserver();
            }
            removeShorts();
            filterVideos();
        } else {
            // Disable filtering
            if (observer) {
                observer.disconnect();
                observer = null;
            }
            window.observerRunning = false;
            restoreHiddenElements();
        }
        
        sendResponse({status: "received"});
    } else if (message.action === "updateBatchSize") {
        // Handle batch size updates
        window.batchSize = message.batchSize;
        console.log("[contentscript.js]: Batch size updated to:", window.batchSize);
        sendResponse({status: "received"});
    }
    return true;
});



// Function to restore hidden elements when filter is disabled
function restoreHiddenElements() {
    console.log("[contentscript.js]: Restoring hidden elements");
    
    // Restore shorts sections
    const shortsSections = document.getElementsByTagName('YTD-RICH-SECTION-RENDERER');
    for (let i = 0; i < shortsSections.length; i++) {
        shortsSections[i].style.display = '';
    }
    
    // Restore video items
    const videoItems = document.getElementsByTagName('YTD-RICH-ITEM-RENDERER');
    for (let i = 0; i < videoItems.length; i++) {
        videoItems[i].style.display = '';
    }
    
    // Reset processed tracking
    processedElements = new WeakSet();
    processedSections = new WeakSet();
}

// setInterval(() => {
//     const timestamp = new Date().toISOString().substr(11, 8);
//     if (observer) {
//         console.log(`[${timestamp}] Observer is connected (${Math.random().toString(36).substr(2, 5)})`);
//     } else {
//         console.log(`[${timestamp}] Observer is NOT connected (${Math.random().toString(36).substr(2, 5)})`);
//     }
// }, 1000);


async function sendPostRequest(data) {
    try {
        console.log("Sending data to background.js:", data);
        // Send message to background.js and wait for response
        const t_dash_vector = await chrome.runtime.sendMessage({
            type: "fetchInference",
            data: data
        });

        console.log("Received response from background.js:", t_dash_vector);
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
        else{
            //for "mix" elements - playlists etc
            let mixTitleElement = el.querySelector(".yt-core-attributed-string");
            if (mixTitleElement) {
                console.log(mixTitleElement) ;
                return mixTitleElement.textContent.trim();
            }
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
                    console.log(`timeout waiting for : ${selector}`)
                    setTimeout(checkElements, 100);
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
        elements = await waitForElements('YTD-RICH-SECTION-RENDERER');
        // const element2 = await waitForElements('YT-LOCKUP-VIEW-MODEL');
        // elements = element1.concat(element2);
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

// // for removing grid renderers from the page
// var removeGrids = async (elements) => {
//     if(!elements){
//         return ;
//         // console.log("no elements passed , creating own elements");
//         elements = await waitForElements('YTD-RICH-GRID-RENDERER');
//     }
//     try{
//         // Track how many times this function is called
//         window.removeGridsCount = (window.removeGridsCount || 0) + 1;
        
//         console.log("grid renderer elements : " , elements);
        
//         for(let i = 0; i < elements.length; i++){
//             elements[i].style.display = 'none'; 
//         }
//         console.log(`removeGrids called ${window.removeGridsCount} times`); // Log counter
//     }catch(error){
//         console.error("Error in removeGrids:", error);
//     }
// };


// removing function for each element (that waits for thumbnails and titlte to load) and then remove every element passed through it
var processElement = async (element) => {
    try {
        //! THE line in code :>
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

        console.log("elements : ", elements);

        // Filter out already processed elements
        elements = elements.filter(el => !processedElements.has(el));
        if (elements.length === 0) return; // Exit if no new elements

        // Mark elements as processed
        elements.forEach(el => processedElements.add(el));

        //elements only contains video titles (not shorts) ;

        console.log("elements after filtering : ", elements);
        

        try {
            // console.log("elements ;" , elements) ;
            let titleVector = await scrapperTitleVector(elements);
            console.log("title vector : ", titleVector);
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
                    t_dash_vector  = await sendPostRequest(t_vector).then(data =>{return data});
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
                        var titleElement = elements[i].querySelector("#video-title");
                        if (!titleElement) {
                            //for MIX  , playlists etc
                            titleElement = elements[i].querySelector(".yt-core-attributed-string")
                        };
                        if(!titleElement) continue;
                        
                        //? optimise this O(n) function: 
                        const t_dash_item = t_dash_vector.find(item => 
                            item.input_text === titleElement.textContent.trim()
                        );
                        if(!t_dash_item) continue;
                        // console.log("t_dash_item.predicted_label  , ",  t_dash_item.predicted_label , " string : " , window.userCategory) ; 

                        // console.log("t_dash_item : ",  t_dash_item ) ; 

                        if (t_dash_item && t_dash_item.predicted_label !== window.userCategory) {
                            try{
                                await processElement(elements[i]);
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
