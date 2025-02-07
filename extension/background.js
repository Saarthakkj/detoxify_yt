import { GoogleGenerativeAI, system_prompt } from './dist/generative-ai-bundle.js';

let genModel = null;

// Initialize the model
async function initializeModel() {
    try {
        // const result = await chrome.storage.sync.get(['GEMINI_API_KEY']);
        const GEMINI_API_KEY = result.GEMINI_API_KEY;
        if (!GEMINI_API_KEY) {
            throw new Error('API key not found');
        }

        const genai = new GoogleGenerativeAI(GEMINI_API_KEY);
        genModel = genai.getGenerativeModel({
            model: "gemini-1.5-flash",
            systemInstruction: system_prompt
        });
        console.log("[background.js] Gemini model initialized successfully");
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

                // Send the entire array of titles
                const prompt = JSON.stringify(request.data);
                const result = await genModel.generateContent(prompt);
                const response = await result.response;
                // ... existing code ...
                let text = response.text();

                // Remove Markdown code block formatting if present
                if (text.startsWith('```json') && text.endsWith('```')) {
                    text = text.slice(7, -3).trim();
                }

                // Split the string into an array of categories
                const categories = text
                    .replace(/[\[\]"]/g, '') // Remove brackets and quotes
                    .split(',') // Split by comma
                    .map(category => category.trim()); // Trim whitespace

                // Map the categories to the expected format
                const t_dash_vector = request.data.map((item, index) => ({
                    input_text: item.text,
                    predicted_label: categories[index] || 'other' // Default to 'other' if no category
                }));

                console.log("[background.js] Inference successful:", t_dash_vector);
                sendResponse(t_dash_vector);

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

//! store your api key running this permanently in your browser:

// chrome.storage.sync.set({ GEMINI_API_KEY: 'your_api_key_here' }, () => {
//     console.log('API key saved to Chrome storage');
// });