chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    if (changeInfo.status === 'complete') {
        // Inject the content-script.js file into the webpage
        chrome.tabs.executeScript(tabId, { file: 'content.js' });
    }
});