// Function to check if allowed time has been exceeded
console.log("check printing")
function checkTimeLimit() {
    console.log("Checking time limit");
    chrome.storage.local.get(['allowedTime', 'startTime', 'totalWatchTime'], (result) => {
        const { allowedTime, startTime, totalWatchTime } = result;
        const elapsedTime = Date.now() - startTime + totalWatchTime;

        console.log("Elapsed time:", elapsedTime, "Allowed time:", allowedTime);

        if (elapsedTime >= allowedTime && allowedTime > 0) {
            console.log("Time limit exceeded, redirecting");
            // Save the current URL and redirect to the redirect.html page
            chrome.storage.local.set({ lastURL: window.location.href }, () => {
                window.location.href = chrome.runtime.getURL("redirect.html");
            });
        }
    });
}

// Check time limit initially and set an interval to keep checking
document.addEventListener('DOMContentLoaded', () => {
    console.log("Content script loaded");
    checkTimeLimit();
    setInterval(checkTimeLimit, 1000); // Check every second
});

// Listen for messages from the background script
chrome.runtime.onMessage.addListener((message) => {
    if (message.action === 'checkTimeLimit') {
        console.log("Message received to check time limit");
        checkTimeLimit();
    }
});
