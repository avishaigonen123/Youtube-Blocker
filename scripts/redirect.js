document.addEventListener('DOMContentLoaded', () => {
    console.log("Redirect page loaded");
    const noYouTubeButton = document.getElementById('noYouTubeButton');
    const setTimeButton = document.getElementById('setTimeButton');
    const hourSlider = document.getElementById('hourSlider');
    const minuteSlider = document.getElementById('minuteSlider');
    const customTime = document.getElementById('customTime');
    const hourValue = document.getElementById('hourValue');
    const minuteValue = document.getElementById('minuteValue');

    if (!noYouTubeButton || !setTimeButton || !hourSlider || !minuteSlider || !customTime || !hourValue || !minuteValue) {
        console.error("One or more elements are not found in the DOM.");
        return;
    }

    noYouTubeButton.addEventListener('click', () => {
        console.log("User chose not to enter YouTube.");
    //.    alert("You chose not to enter YouTube.");
        window.close();
    });

    setTimeButton.addEventListener('click', () => {
        console.log("Set time button clicked");
        let selectedTime;
        if (customTime.value) {
            selectedTime = customTime.value;
        } else {
            selectedTime = (parseInt(hourSlider.value) * 60) + parseInt(minuteSlider.value);
        }

        if (selectedTime) {
            const allowedTime = parseInt(selectedTime) * 60000; // Convert minutes to milliseconds
            chrome.storage.local.set({ allowedTime: allowedTime, startTime: Date.now(), totalWatchTime: 0 }, () => {
                console.log(`Allowed time set to ${selectedTime} minutes (${allowedTime} milliseconds).`);
            //    alert("You have set YouTube allowed time for " + selectedTime + " minutes.");
                chrome.storage.local.get('lastURL', (result) => {
                    const lastURL = result.lastURL || 'https://www.youtube.com';
                    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                        redirectToLastURL(tabs[0].id, lastURL);
                    });
                });
            });
        } else {
            console.log("Invalid time input.");
            alert('Please select a valid time.');
        }
    });

    hourSlider.addEventListener('input', () => {
        hourValue.textContent = `${hourSlider.value} hours`;
        minuteValue.textContent = `${minuteSlider.value} minutes`;
        customTime.value = '';
    });

    minuteSlider.addEventListener('input', () => {
        minuteValue.textContent = `${minuteSlider.value} minutes`;
        hourValue.textContent = `${hourSlider.value} hours`;
        customTime.value = '';
    });

    customTime.addEventListener('input', () => {
        if (customTime.value) {
            hourSlider.value = 0;
            minuteSlider.value = 0;
            hourValue.textContent = `0 hours`;
            minuteValue.textContent = `0 minutes`;
        }
    });

    // Initialize storage values if not already set
    chrome.storage.local.get(['allowedTime', 'startTime', 'totalWatchTime'], (result) => {
        console.log("Initial storage values:", result);
        if (typeof result.allowedTime === 'undefined') {
            chrome.storage.local.set({ allowedTime: 0 });
        }
        if (typeof result.startTime === 'undefined') {
            chrome.storage.local.set({ startTime: 0 });
        }
        if (typeof result.totalWatchTime === 'undefined') {
            chrome.storage.local.set({ totalWatchTime: 0 });
        }
    });
});

function redirectToLastURL(tabId, url) {
    console.log("Redirecting to last URL:", url);
    chrome.tabs.update(tabId, { url: url });
}
