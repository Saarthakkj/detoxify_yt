import { GoogleGenerativeAI } from '@google/generative-ai';
import system_prompt from "./utils.js";
import 'dotenv/config';

const gemini = process.env.GEMINI_GENERATIVE_LANGUAGE_CLIENT_API;

const genai = new GoogleGenerativeAI(
    gemini
);

const genModel = genai.getGenerativeModel({
    model : "gemini-1.5-flash" , 
    systemInstruction : system_prompt
});



chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log("[background.js] reached inside listener");
    if (request.type === "fetchInference") {
        console.log("[background.js] reached inside listener");

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
        

        
        const prompt = JSON.stringify(request.data) ;
        console.log("[background.js] prompt : " , prompt);

        genModel.generateContent(prompt).then(async response =>{

            if(!response){
                const errorText = await response.text();
                throw new Error(`Server error (${response.status}): ${errorText}`);
            }
            return response.json();
        }).then(data => {
                sendResponse({ success: true, data: data });
        }).catch(error => {
                console.error("Fetch error:", error);
                sendResponse({ success: false, error: error.message });
        });





        return true; // Keep the message channel open for async response
    }
});
