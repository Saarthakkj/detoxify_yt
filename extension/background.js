import { GoogleGenerativeAI } from "@google/generative-ai";
// const { system_prompt } = require('./utils.js');

let genModel = null;

// Initialize the model
async function initializeModel() {
    try {
        // Store API key in chrome.storage.local
        const { GEMINI_API_KEY } = await chrome.storage.local.get('GEMINI_GENERATIVE_LANGUAGE_CLIENT_API');
        
        if (!GEMINI_API_KEY) {
            throw new Error('API key not found');
        }

        const genai = new GoogleGenerativeAI(GEMINI_API_KEY);
        genModel = genai.getGenerativeModel({
            model: "gemini-1.5-pro",
            systemInstruction: system_prompt 
        });
        console.log("[background.js] Gemini model initialized successfully");
    } catch (e) {
        console.error("[background.js] Error initializing model:", e);
    }
}

// Listen for messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === "fetchInference") {
        console.log("[background.js] Message received:", request);
        
        (async () => {
            try {
                if (!genModel) {
                    await initializeModel();
                }
                
                const result = await genModel.generateContent(request.data);
                const response = await result.response;
                const text = response.text();
                
                console.log("[background.js] Inference successful:", text);
                sendResponse({ success: true, data: text });
            } catch (error) {
                console.error("[background.js] Inference error:", error);
                sendResponse({ success: false, error: error.message });
            }
        })();
        
        return true;
    }
});

// Initialize on install and startup
chrome.runtime.onInstalled.addListener(initializeModel);
chrome.runtime.onStartup.addListener(initializeModel);

// const keepAlive = () => setInterval(chrome.runtime.getPlatformInfo, 20e3);
// chrome.runtime.onStartup.addListener(keepAlive);
// keepAlive();