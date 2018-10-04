chrome.webRequest.onBeforeRequest.addListener(function(details) {
    var displayURL;

    if (/\.x3p$/i.test(details.url)) { // if the resource is a PDF file ends with ".pdf"
        displayURL = chrome.runtime.getURL("index.html") + "?file="+details.url;

        return { redirectUrl: displayURL };
        // stop the request and proceed to your custom display page
    }   
}, {urls: ['file://*/*'], types:["main_frame", "sub_frame"]}, ['blocking', 'requestBody']);

var redirect = () => chrome.tabs.create({ url: chrome.extension.getURL("index.html") });
chrome.browserAction.onClicked.addListener(redirect);

chrome.extension.isAllowedFileSchemeAccess(allowed => {
    if(!allowed) {
        chrome.browserAction.setBadgeText({
            text: "Setup"
        });

        var interval = () => {
            chrome.extension.isAllowedFileSchemeAccess(allowed => {
                if(allowed) {
                    chrome.browserAction.setBadgeText({text:""});
                    clearInterval(interval);
                }
            })
        };

        setInterval(interval, 1000);

        chrome.browserAction.onClicked.removeListener(redirect);
        chrome.browserAction.onClicked.addListener(() => {
            chrome.tabs.create({ url: chrome.extension.getURL("setup.html") })
        });
    } else chrome.browserAction.setBadgeText({ text: '' });
});




