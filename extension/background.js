chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log("background script : " , request);
    if (request.type === "fetchInference") {
        console.log("request data : " , request.data); 
        fetch("http://127.0.0.1:8000/predict", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(request.data)
        })
        .then(response => response.json())
        .then(data => {
            console.log("API Response:", data);
            sendResponse(data);
        })
        .catch(error => {
            console.error("Error:", error);
            sendResponse({ error: error.message });
        });

        return true; // Keep the message port open
    }
});