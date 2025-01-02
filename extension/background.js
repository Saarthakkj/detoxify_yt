chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === "fetchInference") {
        // Make API call to fast api
        fetch('https://detoxify-yt.onrender.com/predict', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(request.data)
        })
        .then(response => response.json())
        .then(data => {
            sendResponse(data);
        })
        .catch(error => {
            console.error('Error:', error);
            sendResponse({error: error.message});
        });
        
        return true; // Required to use sendResponse asynchronously
    }
});