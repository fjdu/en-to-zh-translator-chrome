chrome.extension.onMessage.addListener(
    function(request,sender,sendResponse) {
        console.log(request.url);
        chrome.tabs.create({ url: request.url});
    }
);
