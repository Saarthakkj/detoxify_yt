console.log("[PRAKHAR]: [contentScript.js]: script started....");

chrome.runtime.onMessage.addListener((message) => {
    if (message.action === "filter") {
        const searchString = message.searchString;
        filterVideos(searchString);
    }
});

const scrapperTitleVector = () => {
    const elements = Array.from(document.querySelectorAll('ytd-rich-item-renderer'));
    const titleVector = elements.map((el) => {
        const titleElement = el.querySelector("h3 a[title]");
        if (titleElement) {
            return titleElement.title.trim();
        }
        return null;
    });

    const filteredArray = titleVector.filter((value) => value !== null);
    return filteredArray;
};

const getTitlesAfterML = async (searchString) => {
    const response = await fetch("http://localhost:8000/predict", {
        method: "POST",
        body: JSON.stringify({ searchString }),
    });
    const data = await response.json();
    console.log("[PRAKHAR]: [contentScript.js]: data found to not destroy....", data);
    return data;
};

const filterVideos = (searchString) => {

    const removeElements = () => {

        let elements = Array.from(document.querySelectorAll('ytd-rich-item-renderer'));
        console.log("[PRAKHAR]: [contentScript.js]: elements found....", elements);
        if (elements.length === 0) {
            elements = Array.from(document.querySelectorAll('ytd-compact-video-renderer'));
            console.log("[PRAKHAR]: [contentScript.js]: elements changed....")
        }

        const element1 = elements.find(el => el.textContent.includes(searchString));

        // const elementArray = elements.filter((el) => {
        //     return !searchString.some(title => el.textContent.includes(title));
        // });

        // if (elementArray.length !== 0) {
        //     elementArray.forEach((el) => {
        //         el.remove();
        //     });
        // }

        if (element1) {
            console.log("[PRAKHAR]: [contentScript.js]: matching video found....", element1);

            element1.remove();
            console.log("[PRAKHAR]: [contentScript.js]: element1 removed....");
        } else {
            console.log("[PRAKHAR]: [contentScript.js]: no element1 found....");
        }
    }

    removeElements();
    // const titleVector = scrapperTitleVector();
    console.log("[PRAKHAR]: [contentScript.js]: titleVector found....", titleVector);

    const observer = new MutationObserver(()=> {
        removeElements();
        // titleVector = scrapperTitleVector();
        console.log("[PRAKHAR]: [contentScript.js]: titleVector found....", titleVector);
    })

    const targetNode = document.body;
    const config = { childList: true, subtree: true };
    observer.observe(targetNode, config);

    setTimeout(() => {
        observer.disconnect();
        console.log("[PRAKHAR]: [contentScript.js]: observer disconnected....");
    }, 10000);
};

console.log("[PRAKHAR]: [contentScript.js]: script ended....");