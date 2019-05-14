
function getHeader(needle, haystack = []) {
    for(let straw of haystack) {
        if(straw.name.toLowerCase() === needle.toLowerCase()) {
            return straw.value;
        }
    }
}

function redirect() {
    chrome.tabs.create({ 
        url: chrome.extension.getURL("index.html") 
    });
}

chrome.webRequest.onBeforeRequest.addListener(
    function(details) {
        if(/.x3p$/i.test(details.url)) {
            localStorage.setItem("openfile", details.url);
            return { redirectUrl: chrome.runtime.getURL("index.html") };
        }
    },
    {
        urls: ["file://*/*"],
        types: ["main_frame"]
    },
    ["blocking"]
);

chrome.webRequest.onHeadersReceived.addListener(
    function(details) {
        var contentType = getHeader("content-type", details.responseHeaders);

        if(details.frameId === 0 && contentType === "application/x-x3p") {
            localStorage.setItem("openfile", details.url);
            return { redirectUrl: chrome.runtime.getURL("index.html") };
        }   
    }, 
    {
        urls: ['<all_urls>'],
        types: ['main_frame']
    }, 
    ['blocking', 'responseHeaders', 'extraHeaders']
);

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

chrome.runtime.onInstalled.addListener(() => {
    chrome.extension.isAllowedFileSchemeAccess(allowed => {
        if(!allowed) chrome.tabs.create({ url: chrome.extension.getURL("setup.html") });
    });
});