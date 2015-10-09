function getSiteName() {
    var x = document.getElementsByName('site');
    var i, e;
    for (i=0; i<x.length; i++) {
        e = x[i];
        console.log(e);
        if (e.checked) {
            return e.value;
        }
    }
    return null;
}


function getQueryText() {
    return document.getElementById('inputword').value;
}


function gotoDictSite() {
    var text = getQueryText();

    if (!isWordsList(text)) {
        return;
    }

    chrome.extension.sendMessage(
        { url: format_query_url(getSiteName(), text) },
        function(response) {;});
}


function translateSelection() {
    //var html = document.createElement( 'html' );
    //console.log(html);
    //html.innerHTML = '<html> <head> <script src="popup.js"></script> </head> <body> hehehehe </body> </html>';
    //console.log(html.innerHTML);
    //return;
    var text = getSelectionText();
    console.log(text);
    var dict_site = 'dict.cn';

    if (text != '') {
        //alert('Control key up and text selected:\n' + format_query_url('dict.cn', text));
        query_url = format_query_url(dict_site, text);
        chrome.browserAction.setPopup({popup: query_url});

        $.ajax({
            url: query_url,
            timeout: 4000, // 4 seconds
            success: 
                function render_result(data) {
                    newDoc = document.implementation.createHTMLDocument('Result');
                    newDoc.innerHTML = data;
                },
            error:
                function(a, e, c) {
                    console.log(e);
                }
        });
    }
    //newDoc = document.implementation.createHTMLDocument('Result');
}


document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('gotoSite').addEventListener('click', gotoDictSite);
});
