chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === "fetchInference") {
        fetch("https://detoxify-yt.onrender.com/predict", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(request.data)
        })
        .then(async response => {
            // Check if response is ok, if not throw error with status
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Server error (${response.status}): ${errorText}`);
            }
            return response.json();
        })
        .then(data => {
            sendResponse({ success: true, data: data });
        })
        .catch(error => {
            console.error("Fetch error:", error);
            sendResponse({ success: false, error: error.message });
        });

        return true; // Keep the message channel open for async response
    }
});
