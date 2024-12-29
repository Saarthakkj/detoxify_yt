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
            return titleElement.title.trim()
        }
        return null;
    });
    return titleVector;
};

const filterVideos = (searchString) => {

    const removeElements = () => {

        const elements = Array.from(document.querySelectorAll('ytd-rich-item-renderer'));
        console.log("[PRAKHAR]: [contentScript.js]: elements found....", elements);

        const element1 = elements.find(el => el.textContent.includes(searchString));
        if (element1) {
            console.log("[PRAKHAR]: [contentScript.js]: matching video found....", element1);

            const videoContainer = element1.closest('ytd-rich-item-renderer');
            if (videoContainer) {
                videoContainer.remove();
                console.log("[PRAKHAR]: [contentScript.js]: videoContainer removed....");
            }
        } else {
            console.log("[PRAKHAR]: [contentScript.js]: no matching video found....");
        }
    }

    removeElements();
    const titleVector = scrapperTitleVector();
    console.log("[PRAKHAR]: [contentScript.js]: titleVector found....", titleVector);

    const observer = new MutationObserver(()=> {
        removeElements();
        titleVector = scrapperTitleVector();
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