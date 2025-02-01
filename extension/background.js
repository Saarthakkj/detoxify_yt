const { GoogleGenerativeAI } = require("@google/generative-ai");
const {system_prompt , padding} = require("./utils");
import load_dotenv from 'dotenv';

load_dotenv();
gemini = os.environ['GEMINI_GENERATIVE_LANGUAGE_CLIENT_API'];

genai.configure(api_key=gemini)

const genAI = new GoogleGenerativeAI("YOUR_API_KEY");

cache = caching.CachedContent.create(
    model='models/gemini-1.5-flash-001',
    system_instruction=system_prompt + padding
)


model = genAI.GenerativeModel.from_cached_content(cached_content=cache)
console.log(result.response.text());



chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === "fetchInference") {

        //! for render deployed model : 

        // fetch("https://detoxify-yt.onrender.com/predict", {
        //     method: 'POST',
        //     headers: {
        //         'Content-Type': 'application/json',
        //         'Accept': 'application/json'
        //     },
        //     body: JSON.stringify(request.data)
        // })
        // .then(async response => {
        //     // Check if response is ok, if not throw error with status
        //     if (!response.ok) {
        //         const errorText = await response.text();
        //         throw new Error(`Server error (${response.status}): ${errorText}`);
        //     }
        //     return response.json();
        // })
        // .then(data => {
        //     sendResponse({ success: true, data: data });
        // })
        // .catch(error => {
        //     console.error("Fetch error:", error);
        //     sendResponse({ success: false, error: error.message });
        // });

        //! for gemini api key : 

        
        
        







        return true; // Keep the message channel open for async response
    }
});
