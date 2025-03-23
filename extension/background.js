import {GoogleGenerativeAI , system_prompt} from './dist/geneartive-ai-bundle.js';

let genModel = null;

// Initialize the model
async function initializeModel() {
    try {
        const result = await chrome.storage.sync.get(['GEMINI_API_KEY']);
        const GEMINI_API_KEY = result.GEMINI_API_KEY;
        if (!GEMINI_API_KEY) {t
            throw new Error('API key not found');
        }
        const genai = new GoogleGenerativeAI(GEMINI_API_KEY);
        genModel = genai.getGenerativeModel({
            model: "gemini-2.0-flash-lite-preview-02-05",
            systemInstruction: system_prompt
        });
        console.log("[background.js] Gemini model iniialized successfully");
    } catch (e) {
        console.log("[background.js] Error initializing model:", e);
    }
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === "fetchInference") {
        console.log("[background.js] Message received:", request);
        
        (async () => {
            try {
                if (!genModel) {
                    await initializeModel();
                }

                const prompt = JSON.stringify(request.data);
                console.log("[background.js] Prompt:", prompt);
                const result = await genModel.generateContent(prompt);
                const response = await result.response;
                let text = response.text();

                // Remove Markdown code block formatting if present
                if (text.startsWith('```json') && text.endsWith('```')) {
                    text = text.slice(7, -3).trim();
                }

                try {
                    // Parse the JSON response directly
                    const parsedResponse = JSON.parse(text);
                    console.log("[background.js] Parsed response:", parsedResponse);
                    
                    // Validate the response format
                    if (Array.isArray(parsedResponse) && 
                        parsedResponse.every(item => 
                            item.hasOwnProperty('input_text') && 
                            item.hasOwnProperty('predicted_label') &&
                            (item.predicted_label === "true" || item.predicted_label === "false")
                        )) {
                        console.log("[background.js] Inference successful:", parsedResponse);
                        sendResponse(parsedResponse);
                    } else {
                        throw new Error("Invalid response format");
                    }
                } catch (parseError) {
                    console.error("[background.js] Error parsing model response:", parseError);
                    console.error("[background.js] Raw response:", text);
                    sendResponse([]);
                }

            } catch (error) {
                console.error("[background.js] Inference error:", error);
                sendResponse([]); // Return empty array on error
            }
        })();
        
        return true; // Keep the message channel open for sendResponse
    }
});

// Initialize on install and startup
chrome.runtime.onStartup.addListener(initializeModel);

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    console.log("[background.js]: Tab updated:", tab.url);
    
    // Get the current user settings from storage before sending message
    chrome.storage.sync.get(['FILTER_ENABLED', 'USER_CATEGORY', 'BATCH_SIZE'], (result) => {
      // Default to enabled if not set
      const filterEnabled = result.FILTER_ENABLED !== false;
      // Default batch size to 15 if not set
      const batchSize = result.BATCH_SIZE || 15;
      
      chrome.tabs.sendMessage(tabId, {
        action: "tabUpdated",
        url: tab.url,
        filterEnabled: filterEnabled,
        userCategory: result.USER_CATEGORY,
        batchSize: batchSize
      }).catch(err => {
        console.log("caught an error in sending message to the tab : " , err);
      });
    });
  }
});

//! store your api key running this permanently in your browser:

// chrome.storage.sync.set({ GEMINI_API_KEY: 'your_api_key_here' }, () => {
//     console.log('API key saved to Chrome storage');
// });