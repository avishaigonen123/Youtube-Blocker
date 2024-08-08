let allowedTime = 0;
let totalWatchTime = 0;
let startTime = null;

chrome.runtime.onInstalled.addListener(() => {
    console.log("Extension installed");
    chrome.storage.local.set({ allowedTime: 0, totalWatchTime: 0, startTime: null });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log("Message received:", request);
    if (request.action === 'setAllowedTime') {
        allowedTime = request.time;
        startTime = Date.now();
        totalWatchTime = 0;
        chrome.storage.local.set({ allowedTime, totalWatchTime, startTime });
    } else if (request.action === 'resetTime') {
        startTime = Date.now();
        totalWatchTime = 0;
        chrome.storage.local.set({ totalWatchTime, startTime });
    }
    sendResponse({ status: 'success' });
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url.includes('youtube.com')) {
        console.log("YouTube page loaded");
        checkAndRedirect(tabId, tab.url);
    }
});

function checkAndRedirect(tabId, url) {
    chrome.storage.local.get(['allowedTime', 'totalWatchTime', 'startTime'], (data) => {
        allowedTime = data.allowedTime;
        totalWatchTime = data.totalWatchTime;
        startTime = data.startTime;

        const currentTime = Date.now();
        const elapsedTime = currentTime - startTime + totalWatchTime;

        console.log("Elapsed time:", elapsedTime, "Allowed time:", allowedTime);

        if (elapsedTime >= allowedTime) {
            console.log("Time limit exceeded, redirecting");
            chrome.storage.local.set({ lastURL: url }, () => {
                chrome.tabs.update(tabId, { url: chrome.runtime.getURL("redirect.html") });
            });
        } else {
            chrome.storage.local.set({ totalWatchTime: elapsedTime, startTime: currentTime });
        }
    });
}

setInterval(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs.length > 0 && tabs[0].url.includes('youtube.com')) {
            checkAndRedirect(tabs[0].id, tabs[0].url);
        }
    });
}, 1000); // Check every second
