chrome.webRequest.onBeforeRequest.addListener(function(details) {
    var displayURL;

    if (/\.x3p$/i.test(details.url)) { // if the resource is a PDF file ends with ".pdf"
        displayURL = chrome.runtime.getURL("index.html") + "?file="+details.url;

        return { redirectUrl: displayURL };
        // stop the request and proceed to your custom display page
    }   
}, {urls: ['file://*/*'], types:["main_frame", "sub_frame"]}, ['blocking', 'requestBody']);

chrome.runtime.onMessage.addListener((request, sender, response) => {
    if(request.fix3p) response({ success: true});
});

var redirect = () => chrome.tabs.create({ url: chrome.extension.getURL("index.html") });
chrome.browserAction.onClicked.addListener(redirect);

chrome.extension.isAllowedFileSchemeAccess(allowed => {
    if(!allowed) {
        chrome.browserAction.setBadgeText({
            text: "Setup"
        });

        chrome.browserAction.onClicked.removeListener(redirect);
        chrome.browserAction.onClicked.addListener(() => {
            chrome.tabs.create({ url: chrome.extension.getURL("setup.html") })
        });
    }
});




