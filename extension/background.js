chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    // console.log("background script : ", request);
    if (request.type === "fetchInference") {
        // console.log("request data : ", request.data);
        
        (async () => {
            try {
                const response = await fetch("http://127.0.0.1:8000/predict", {
                    method: 'POST',
                    headers: {
                        "Content-Type" : "application/json"
                    },
                    body : JSON.stringify(data)
                });
                const data = await response.json();
                // console.log("API Response:", data);
                sendResponse(data);
            } catch (error) {
                console.error("Error:", error);
                sendResponse({ error: error.message });
            }
        })();
        
        return true;
    }
});