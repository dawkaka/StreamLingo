// Add a listener for the webNavigation.onCompleted event
chrome.webNavigation.onCompleted.addListener(function (details) {
    chrome.scripting.executeScript({
        target: { tabId: details.tabId },
        files: ['content.js']
    });
});
