chrome.extension.onMessage.addListener(

    function(request,sender,sendResponse) {

        console.log(request.site, request.text);

        if (request.sitename === 'zdic') {

            document.getElementById('q').value = request.text;
            document.getElementById("zdicForm").submit();

        } else {

            chrome.tabs.create({ url: format_query_url(request.sitename, request.text) });

        }
    }
);
