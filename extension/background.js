chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "runPython") {
        // Make API call to your Python backend server
        fetch('http://localhost:5000/process', {
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
