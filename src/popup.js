function getSiteName() {
    var x = document.getElementsByName('site');
    var i, e;
    for (i=0; i<x.length; i++) {
        e = x[i];
        //console.log(e);
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

    var sitename = getSiteName();

    chrome.extension.sendMessage(
        { sitename: sitename,
          text: text },
        function(response) {;});
}


document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('gotoSite').addEventListener('click', gotoDictSite);
});
