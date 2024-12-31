
console.log("[PRAKHAR]: [contentScript.js]: script started....");

chrome.runtime.onMessage.addListener((message) => {
    if (message.action === "filter") {
        const searchString = message.searchString;
        filterVideos(searchString);
    }
});

const scrapperTitleVector = async () => {
    const elements = Array.from(document.querySelectorAll('ytd-rich-item-renderer'));
    const titleVector = elements.map((el) => {
        const titleElement = el.querySelector("h3 span");
        if (titleElement) {
            return titleElement.textContent.trim();
        }
        return null;
    });

    const filteredArray = titleVector.filter((value) => value !== null);
    // console.log("[PRAKHAR]: [contentScript.js]: filteredArray found....", filteredArray);
    // const response = await getTitlesAfterML(filteredArray);
    // console.log("[PRAKHAR]: [contentScript.js]: response found thru ML....", response);
    return filteredArray;
};

// const getTitlesAfterML = async (array) => {
//     const reqbody = array.map((title) => {
//         return {
//             "text": title,
//         }
//     });
//     const process = await python.run("testing.py", reqbody);
//     console.log("[PRAKHAR]: [contentScript.js]: process found....", process);
// };

const filterVideos = async (searchString) => {

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
    const titleVector = await scrapperTitleVector();
    console.log("[PRAKHAR]: [contentScript.js]: titleVector found....", titleVector);

    const observer = new MutationObserver(async () => {
        removeElements();
        titleVector = await scrapperTitleVector();
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