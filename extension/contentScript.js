/*
 * TODO : reduce the complexity of removing all (n) elements from (n^2) to (n) : n -> batchsize : preserving indices before preprocessing elements and operating on it
 */

document
    .requestStorageAccess()
    .then(() => {
        console.log("Access granted");
    })
    .catch(() => {
        console.error("Storage access denied");
    });

var search_removing_counts = 0;

var tags = {
    Home: ["YTD-RICH-ITEM-RENDERER", "YTD-RICH-SECTION-RENDERER"],
    Watch: ["YTD-COMPACT-VIDEO-RENDERER", ""],
    Search: [
        ["YTD-VIDEO-RENDERER", "YT-LOCKUP-VIEW-MODEL", "YTD-CHANNEL-RENDERER"],
        ["YTD-REEL-SHELF-RENDERER", "YTD-SHELF-RENDERER"],
    ],
};

function determineUrlType(url) {
    console.log(" url : ", url);
    if (url.indexOf("youtube.com/watch?v=") !== -1) {
        return "Watch";
    } else if (url.indexOf("youtube.com/results?search_query=") !== -1) {
        return "Search";
    } else if (url === "https://www.youtube.com/") {
        return "Home";
    } else {
        return "Other";
    }
}

//assigns oberserver , takes url in the args
function observer_assigner(url) {
    var urlType = determineUrlType(url);
    console.log("User is on:", urlType);
    console.log("is filter enabled : ", window.filterEnabled);
    if (!window.filterEnabled) return;
    if (determineUrlType(url) === "Watch") {
        console.log("handle  watching");
        handleWatching_video();
        return;
    }
    console.log("filter enabled");
    if (determineUrlType(url) === "Search") {
        console.log("setting up an isrelevant alert");
        isrelevantpage();
    }
    window.observerRunning = true;

    if (window.userCategory && !(determineUrlType(url) === "Watch")) {
        console.log("intialising with saved category");
        initializeWithSavedCategory(tags[determineUrlType(url)]);
    } else if (!(determineUrlType(url) === "Watch")) {
        console.log("intialising without  saved category");
        setupObserver(tags[determineUrlType(url)]);
    }
}
function dialoguebox_adding() {
    console.log("search removing counts : ", search_removing_counts);

    // Create the dialog box
    const dialog = document.createElement("div");
    dialog.style.position = "fixed";
    dialog.style.top = "50%";
    dialog.style.left = "50%";
    dialog.style.transform = "translate(-50%, -50%)";
    dialog.style.backgroundColor = "#ffffff"; // White background
    dialog.style.padding = "24px"; // Slightly increased for balance
    dialog.style.borderRadius = "12px"; // Softer, modern rounding
    dialog.style.boxShadow = "0 8px 16px rgba(0, 0, 0, 0.2)"; // Deeper shadow for techy depth
    dialog.style.width = "320px"; // Slightly wider for better text fit
    dialog.style.fontFamily = "'Inter', 'Helvetica Neue', sans-serif"; // Techy font
    dialog.style.zIndex = "9999";

    // Create and style the message
    const message = document.createElement("p");
    message.innerHTML = "<span style='color: #000000;'>[Detoxify]</span> Are you sure you want to stay on this page?";
    message.style.fontSize = "16px";
    message.style.fontWeight = "500"; // Medium weight for emphasis
    message.style.color = "#333333"; // Dark gray for readability
    message.style.textAlign = "center"; // Centered for minimalism
    message.style.marginBottom = "24px"; // Increased spacing
    dialog.appendChild(message);

    // Create a container for buttons
    const buttonContainer = document.createElement("div");
    buttonContainer.style.display = "flex";
    buttonContainer.style.justifyContent = "space-between"; // Evenly spaced buttons
    buttonContainer.style.gap = "12px"; // Consistent spacing

    // Create and style the Yes button
    const yesButton = document.createElement("button");
    yesButton.textContent = "Yes";
    yesButton.style.padding = "10px 0"; // Vertical padding only, width handled by flex
    yesButton.style.width = "100%"; // Full width within container
    yesButton.style.border = "1px solid #000000"; // Black border
    yesButton.style.borderRadius = "6px"; // Slightly larger rounding
    yesButton.style.cursor = "pointer";
    yesButton.style.backgroundColor = "#000000"; // Black background
    yesButton.style.color = "#ffffff"; // White text
    yesButton.style.fontSize = "14px";
    yesButton.style.fontWeight = "500";
    yesButton.style.transition = "background-color 0.2s ease"; // Smooth hover effect
    yesButton.onmouseover = () => (yesButton.style.backgroundColor = "#333333"); // Dark gray on hover
    yesButton.onmouseout = () => (yesButton.style.backgroundColor = "#000000"); // Back to black
    yesButton.onclick = () => {
        window.filterEnabled = false;
        chrome.storage.sync.set({ FILTER_ENABLED: false });
        document.body.removeChild(dialog);
    };

    // Create and style the No button
    const noButton = document.createElement("button");
    noButton.textContent = "No";
    noButton.style.padding = "10px 0";
    noButton.style.width = "100%"; // Full width within container
    noButton.style.border = "1px solid #000000"; // Black border
    noButton.style.borderRadius = "6px";
    noButton.style.cursor = "pointer";
    noButton.style.backgroundColor = "#ffffff"; // White background
    noButton.style.color = "#000000"; // Black text
    noButton.style.fontSize = "14px";
    noButton.style.fontWeight = "500";
    noButton.style.transition = "background-color 0.2s ease"; // Smooth hover effect
    noButton.onmouseover = () => (noButton.style.backgroundColor = "#f5f5f5"); // Light gray on hover
    noButton.onmouseout = () => (noButton.style.backgroundColor = "#ffffff"); // Back to white
    noButton.onclick = () => {
        window.location.href = "https://www.youtube.com";
    };

    // Append buttons to the container, then container to dialog
    buttonContainer.appendChild(yesButton);
    buttonContainer.appendChild(noButton);
    dialog.appendChild(buttonContainer);

    // Append dialog to the body
    document.body.appendChild(dialog);
}


function isrelevantpage() {
    console.log("initialising setInterval  page");
    setInterval(() => {
        if (search_removing_counts > 20) {
            dialoguebox_adding();
        }
        console.log("search removing counts : ", search_removing_counts);
    }, (interval = 1000));
}

async function handleWatching_video() {
    console.log("inside watching video ");
    const video_text = document.querySelector("title").innerHTML;
    const response = await sendPostRequest(video_text, window.userCategory);
    console.log("response from bckground.js : ", response[0].predicted_label);
    if (response[0].predicted_label !== "true") {
        console.log("sendingMessage to background.js ");
        dialoguebox_adding(); 
    }
}
// Add to your script
function ensureObserverHealthy() {
    if (!observer || !window.observerRunning) {
        console.log(`[Detoxify Observer not running, restarting`);
        window.observerRunning = true;
        setupObserver();
    }

    // console.log("contents container : " , document.querySelector('#contents'));
    // console.log("content container : " , document.querySelector('#content'));
}
async function initializeWithSavedCategory([filterVideostag, removeShortstag]) {
    console.log("[inside initializeWithSavedCategory]: tags are:", [
        filterVideostag,
        removeShortstag,
    ]);
    try {
        const result = await chrome.storage.sync.get([
            "USER_CATEGORY",
            "GEMINI_API_KEY",
            "FILTER_ENABLED",
            "BATCH_SIZE",
        ]);
        // Set default batch size if not set
        window.batchSize = result.BATCH_SIZE || 15;
        if (result.USER_CATEGORY && result.GEMINI_API_KEY) {
            console.log(
                "[contentscript.js]: Found saved category:",
                result.USER_CATEGORY
            );
            window.userCategory = result.USER_CATEGORY;

            // Set filter enabled state (default to enabled if not set)
            window.filterEnabled = result.FILTER_ENABLED !== false;
            console.log(
                "[contentscript.js]: Filter enabled state:",
                window.filterEnabled
            );

            // Only start observer and process elements if filtering is enabled
            if (window.filterEnabled) {
                try {
                    // Handle initial shorts first - flatten arrays if needed
                    let shortsTagsToUse = removeShortstag;

                    if (shortsTagsToUse !== "") {
                        // If removeShortstag is an array of arrays, flatten it
                        if (
                            Array.isArray(removeShortstag) &&
                            removeShortstag.length > 0 &&
                            Array.isArray(removeShortstag[0])
                        ) {
                            shortsTagsToUse = removeShortstag.flat();
                            console.log(
                                "[contentscript.js]: Flattened shorts tags:",
                                shortsTagsToUse
                            );
                        }

                        const initialShorts = await waitForElements(shortsTagsToUse);
                        if (initialShorts && initialShorts.length > 0) {
                            console.log(
                                "[contentscript.js]: Removing initial shorts sections:",
                                initialShorts.length
                            );
                            await removeShorts(initialShorts, shortsTagsToUse);
                        }
                    } else {
                        console.log("shorts tag detected : ", shortsTagsToUse);
                    }

                    // Similar handling for video tags
                    let videoTagsToUse = filterVideostag;

                    // If filterVideostag is an array of arrays, flatten it
                    if (
                        Array.isArray(filterVideostag) &&
                        filterVideostag.length > 0 &&
                        Array.isArray(filterVideostag[0])
                    ) {
                        videoTagsToUse = filterVideostag.flat();
                        console.log(
                            "[contentscript.js]: Flattened video tags:",
                            videoTagsToUse
                        );
                    }

                    const allInitialElements = await waitForElements(videoTagsToUse);
                    if (allInitialElements && allInitialElements.length > 0) {
                        console.log(
                            "[contentscript.js]: Processing initial elements:",
                            allInitialElements.length
                        );
                        await filterVideos(allInitialElements, videoTagsToUse);
                    }
                } catch (error) {
                    console.error(
                        "[contentscript.js]: Error processing initial elements:",
                        error
                    );
                }

                //after dealing with initial elements, call the setupObserver:
                console.log("calling setupObserver");
                setupObserver([filterVideostag, removeShortstag]);
            } else {
                console.log(
                    "[contentscript.js]: Filtering is disabled, not starting observer"
                );
            }
        }
    } catch (error) {
        console.error(
            "[contentscript.js]: Error initializing with saved category:",
            error
        );
    }
}

// Initialize counters
var removeShortsCount = 0;
var filterVideosCount = 0;

var contentContainer = null;

// Initialize observer at the top level
let observer = null;

// Add at the top of your file, after your other global variables
window.URL = null; // Initialize the URL variable

// Function to setup observer
function setupObserver([filterVideostag, removeShortstag]) {
    console.log("reached inside setup observer");

    observer = new MutationObserver(async (mutations) => {
        try {
            for (const mutation of mutations) {
                for (const node of mutation.addedNodes) {
                    // Handle shorts - check if node's tagName matches any in the removeShortstag array
                    const isShort = Array.isArray(removeShortstag)
                        ? removeShortstag.includes(node.tagName)
                        : node.tagName === removeShortstag;

                    if (isShort) {
                        console.log("[Observer] Processing shorts section", node);
                        await removeShorts([node], removeShortstag);
                    }

                    // Handle videos - check if node's tagName matches any in the filterVideostag array
                    const isVideo = Array.isArray(filterVideostag)
                        ? filterVideostag.includes(node.tagName)
                        : node.tagName === filterVideostag;

                    if (isVideo) {
                        observer.collectedItemNodes.push(node);

                        // Process when we have enough videos
                        while (observer.collectedItemNodes.length >= window.batchSize) {
                            const batchToProcess = observer.collectedItemNodes.splice(
                                0,
                                window.batchSize
                            );
                            console.log(
                                `[Observer] Processing video batch of ${window.batchSize}`
                            );
                            await filterVideos(batchToProcess, filterVideostag);
                        }
                    }
                }
            }
        } catch (error) {
            console.error("Error in MutationObserver callback:", error);
        }
    });

    // Add collections to observer instance
    observer.collectedItemNodes = [];

    // Start observing
    contentContainer = document.querySelector("#content");
    if (contentContainer) {
        observer.observe(contentContainer, {
            childList: true,
            subtree: true,
        });
    }
    console.log("observer connected ? : ", observer);
    setInterval(ensureObserverHealthy, 1000);

    function scanEntirePage(tags) {
        // Process existing shorts
        const [filterVideosTags, removeShortsTags] = tags;
        const existingShorts = document.querySelectorAll(
            Array.isArray(removeShortsTags)
                ? removeShortsTags.map((tag) => tag).join(",")
                : removeShortsTags
        );

        if (existingShorts.length > 0) {
            console.log(`Found ${existingShorts.length} existing shorts to remove`);
            removeShorts(Array.from(existingShorts), removeShortsTags);
        }
    }

    // Call this after observer setup, using window.url instead of message.url
    if (window.URL) {
        scanEntirePage(tags[determineUrlType(window.URL)]);
    } else {
        console.log("[contentscript.js]: No URL available for scanEntirePage");
    }
}

/**
 * @message : An object containing data sent from the sender. Attributes may include:
 *              - message.searchString: A string used for filtering content.
 *              - message.action: A string indicating the action to perform (e.g., "filter").
 *              - message.filterEnabled: A boolean indicating whether filtering is enabled.
 *              - message.reinitializeObserver: A boolean indicating whether the observer should be reinitialized.
 * @sender : An object containing information about the sender of the message.
 * @sendResponse : A function to call with a response to the message, to assure that addListener received the data accurately {compulsory ?}
 **/

// Modify the message listener
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.searchString) {
        window.userCategory = message.searchString;
    }

    console.log("[contentscript.js]: Message received:", message);

    if (message.action === "filter") {
        console.log("[contentscript.js]: Filter action received with string:",window.userCategory);

        // Store filter enabled state
        window.filterEnabled = message.filterEnabled !== false;
        // Store URL
        window.URL = message.url;
        console.log(
            "[contentscript.js]: Filter enabled state:",
            window.filterEnabled
        );

        // Check if we need to reinitialize the observer (category changed)
        if (message.reinitializeObserver) {
            console.log(
                "[contentscript.js]: Reinitializing observer due to category change"
            );
            // // Reset tracking sets for processed content
            // processedElements = new WeakSet();
            // processedSections = new WeakSet();

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
                observer_assigner(message.url);
            }
            // removeShorts({}, 'YTD-RICH-SECTION-RENDERER');
            // filterVideos({}, 'YTD-RICH-ITEM-RENDERER');
        } else {
            // If filtering is disabled, disconnect observer
            if (observer) {
                console.log(
                    "[contentscript.js]: Disconnecting observer as filtering is disabled"
                );
                observer.disconnect();
                observer = null;
            }
            window.observerRunning = false;

            //!  tags[determineUrlType(message.url)] -> is an important value that gives tags for any page
            // Show any hidden elements when filter is disabled
            restoreHiddenElements(tags[determineUrlType(message.url)]);
        }

        sendResponse({ status: "received" });
    } else if (message.action === "updateFilterState") {
        // Handle filter state updates without changing category
        window.filterEnabled = message.filterEnabled;
        if (message.url) window.URL = message.url;
        console.log(
            "[contentscript.js]: Filter state updated to:",
            window.filterEnabled
        );

        if (window.filterEnabled) {
            // Re-enable filtering
            if (!window.observerRunning) {
                window.observerRunning = true;
                observer_assigner(message.url);
            }
            // removeShorts({}, 'YTD-RICH-SECTION-RENDERER');
            // filterVideos({}, 'YTD-RICH-ITEM-RENDERER');
        } else {
            // Disable filtering
            if (observer) {
                observer.disconnect();
                observer = null;
            }
            window.observerRunning = false;
            restoreHiddenElements(tags[determineUrlType(message.url)]);
        }

        sendResponse({ status: "received" });
    } else if (message.action === "updateBatchSize") {
        // Handle batch size updates
        window.batchSize = message.batchSize;
        console.log("[contentscript.js]: Batch size updated to:", window.batchSize);
        sendResponse({ status: "received" });
    } else if (message.action === "tabUpdated") {
        // added to handle tab updates
        console.log(
            "[contentscript.js]: Tab updated message received with url:",
            message.url
        );

        // Store URL
        window.URL = message.url;

        // Update userCategory if available
        if (message.userCategory) {
            window.userCategory = message.userCategory;
            console.log(
                "[contentscript.js]: User category from tabUpdated:",
                window.userCategory
            );
        }

        // Update batchSize if available
        if (message.batchSize) {
            window.batchSize = message.batchSize;
            console.log(
                "[contentscript.js]: Batch size from tabUpdated:",
                window.batchSize
            );
        }

        // Make sure we have the filter state
        if (message.filterEnabled !== undefined) {
            window.filterEnabled = message.filterEnabled;
            console.log(
                "[contentscript.js]: Filter state from tabUpdated:",
                window.filterEnabled
            );
        } else {
            // If not provided, get it from storage as a fallback
            chrome.storage.sync.get(
                ["FILTER_ENABLED", "USER_CATEGORY", "BATCH_SIZE"],
                (result) => {
                    window.filterEnabled = result.FILTER_ENABLED !== false;
                    console.log(
                        "[contentscript.js]: Filter state from storage:",
                        window.filterEnabled
                    );

                    // Also set category and batch size if they weren't in the message
                    if (!window.userCategory && result.USER_CATEGORY) {
                        window.userCategory = result.USER_CATEGORY;
                        console.log(
                            "[contentscript.js]: User category from storage:",
                            window.userCategory
                        );
                    }

                    if (!window.batchSize) {
                        window.batchSize = result.BATCH_SIZE || 15;
                        console.log(
                            "[contentscript.js]: Batch size from storage:",
                            window.batchSize
                        );
                    }

                    observer_assigner(message.url);
                }
            );
            return true; // Keep message channel open for async operation
        }

        // Only call observer_assigner if we got settings directly from message
        observer_assigner(message.url);
    }
    return true;
});

// Function to restore hidden elements when filter is disabled
function restoreHiddenElements([filterVideostag, removeShootstag]) {
    console.log("[contentscript.js]: Restoring hidden elements");

    // Handle shorts sections
    if (Array.isArray(removeShootstag)) {
        removeShootstag.forEach((tag) => {
            const shortsSections = document.getElementsByTagName(tag);
            for (let i = 0; i < shortsSections.length; i++) {
                shortsSections[i].style.display = "";
            }
        });
    } else if (removeShootstag) {
        const shortsSections = document.getElementsByTagName(removeShootstag);
        for (let i = 0; i < shortsSections.length; i++) {
            shortsSections[i].style.display = "";
        }
    }

    // Handle video items
    if (Array.isArray(filterVideostag)) {
        filterVideostag.forEach((tag) => {
            const videoItems = document.getElementsByTagName(tag);
            for (let i = 0; i < videoItems.length; i++) {
                videoItems[i].style.display = "";
            }
        });
    } else if (filterVideostag) {
        const videoItems = document.getElementsByTagName(filterVideostag);
        for (let i = 0; i < videoItems.length; i++) {
            videoItems[i].style.display = "";
        }
    }
}

// setInterval(() => {
//     const timestamp = new Date().toISOString().substr(11, 8);
//     if (observer) {
//         console.log(`[${timestamp}] Observer is connected (${Math.random().toString(36).substr(2, 5)})`);
//     } else {
//         console.log(`[${timestamp}] Observer is NOT connected (${Math.random().toString(36).substr(2, 5)})`);
//     }
// }, 1000);

async function sendPostRequest(titles, input) {
    try {
        // console.log("these are titles " , titles , "input : " , input);
        let data = {
            titles: titles,
            input: input,
        };
        console.log("Sending data to background.js:", data);
        // Send message to background.js and wait for response
        const t_dash_vector = await chrome.runtime.sendMessage({
            type: "fetchInference",
            data: data,
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
        } else {
            //for "mix" elements - playlists etc
            let mixTitleElement = el.querySelector(".yt-core-attributed-string");
            if (mixTitleElement) {
                console.log(mixTitleElement);
                return mixTitleElement.textContent.trim();
            }
        }
        return null;
    });

    let filteredArray = titleVector1.filter((value) => value !== null);

    return filteredArray;
};

// Modify waitForElements to handle array of selectors
var waitForElements = (selector, timeout = 5000) => {
    if (!selector || selector === "") return [];

    try {
        return new Promise((resolve, reject) => {
            const startTime = Date.now();

            const checkElements = () => {
                let elements = [];

                // Handle array of selectors
                if (Array.isArray(selector)) {
                    selector.forEach((singleSelector) => {
                        const foundElements = document.getElementsByTagName(singleSelector);
                        if (foundElements.length > 0) {
                            elements = elements.concat(Array.from(foundElements));
                        }
                    });
                } else {
                    // Single selector
                    const foundElements = document.getElementsByTagName(selector);
                    if (foundElements.length > 0) {
                        elements = Array.from(foundElements);
                    }
                }

                if (elements.length > 0) {
                    resolve(elements);
                } else if (Date.now() - startTime >= timeout) {
                    console.log(
                        `timeout waiting for: ${Array.isArray(selector) ? selector.join(", ") : selector
                        }`
                    );
                    resolve([]);
                } else {
                    setTimeout(checkElements, 2500);
                }
            };
            checkElements();
        });
    } catch (error) {
        console.error("Error in waitForElements:", error);
        return [];
    }
};

// for removing yt shorts fro the page
var removeShorts = async (elements, tag) => {
    if (!elements || elements.length === 0) {
        // console.log("no elements passed , creating own elements");
        //tag = tag || 'YTD-RICH-SECTION-RENDERER';
        elements = await waitForElements(tag);
        console.log("elements : ", elements);
        // const element2 = await waitForElements('YT-LOCKUP-VIEW-MODEL');
        // elements = element1.concat(element2);
    }
    try {
        console.log("remove shorts elements : ", elements);
        removeShortsCount++;
        // let shortelements = document.getElementsByClassName('ytd-rich-section-renderer');
        // shortelements = Array.from(shortelements);
        // shortelements = shortelements.filter(shorties => !processedSections.has(shorties));
        // console.log("sectionrenderer elements : " , elements);
        // if (shortelements.length === 0) return;
        // shortelements.forEach(shorties => processedSections.add(shorties));

        for (let i = 0; i < elements.length; i++) {
            console.log("shorts[i] : ", elements[i]);
            elements[i].style.display = "none";
        }
        // console.log(`removeShorts called ${removeShortsCount} times`); // Log counter
    } catch (error) {
        console.error("Error in removeShorts:", error);
    }
};

// removing function for each element (that waits for thumbnails and titlte to load) and then remove every element passed through it
var processElement = async (element) => {
    try {
        //! THE line in code :>
        element.style.display = "none";
    } catch (error) {
        console.error("Error processing element function:", error);
    }
};

// Function to filter videos based on the search string
var filterVideos = async (elements, tag) => {
    try {
        filterVideosCount++; // Increment counter
        if (!window.userCategory) {
            console.log("search string not configured");
            return;
        }
        console.log(`filterVideos called ${filterVideosCount} times`); // Log counter

        // for first call :
        if (!elements || !Array.isArray(elements)) {
            // console.log("no elements passed , creating own elements");
            elements = await waitForElements(tag);
        }

        // console.log("elements : ", elements);

        // // Filter out already processed elements
        // elements = elements.filter(el => !processedElements.has(el));
        // if (elements.length === 0) return; // Exit if no new elements

        // // Mark elements as processed
        // elements.forEach(el => processedElements.add(el));

        //elements only contains video titles (not shorts) ;

        // console.log("elements after filtering : ", elements);

        try {
            // console.log("elements ;" , elements) ;
            let titleVector = await scrapperTitleVector(elements);
            console.log("title vector : ", titleVector);
            let t_vector = titleVector.map((title) => ({ text: title }));
            console.log("api request sent....", t_vector);

            const tries = 3;
            let t_dash_vector = [];
            // console.log("t_vector sent: ", t_vector);
            let n_try = 0;
            let apiresponse = false;
            //try 3 times for the filtering (server overload issues in gemini)
            while (n_try++ < tries && !apiresponse) {
                try {
                    t_dash_vector = await sendPostRequest(
                        t_vector,
                        window.userCategory
                    ).then((data) => {
                        return data;
                    });
                    apiresponse = true;
                } catch (error) {
                    console.error(
                        "error in sending data to bg failed , filterVideos function ",
                        error
                    );
                }
            }

            // console.log("t dash vector : " , t_dash_vector);
            let i = 0;
            if (t_dash_vector) {
                console.log("t dash vector ", t_dash_vector);
                for (; i < elements.length; i++) {
                    try {
                        var titleElement = elements[i].querySelector("#video-title");
                        if (!titleElement) {
                            //for MIX  , playlists etc
                            titleElement = elements[i].querySelector(
                                ".yt-core-attributed-string"
                            );
                        }
                        if (!titleElement) continue;

                        //? optimise this O(n) function:
                        const t_dash_item = t_dash_vector.find(
                            (item) => item.input_text === titleElement.textContent.trim()
                        );
                        if (!t_dash_item) continue;
                        // console.log("t_dash_item.predicted_label  , ",  t_dash_item.predicted_label , " string : " , window.userCategory) ;

                        // console.log("t_dash_item : ",  t_dash_item ) ;

                        if (t_dash_item && t_dash_item.predicted_label !== "true") {
                            search_removing_counts++;
                            try {
                                console.log("elements to be deleted : ", elements[i]);
                                processElement(elements[i]);
                            } catch (error) {
                                console.error("Error in processElement:", error);
                                continue;
                            }
                        }
                    } catch (error) {
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
