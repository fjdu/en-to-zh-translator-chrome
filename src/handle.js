// Listen to keyup event.
window.onerror = function(){
   return true;
}

document.addEventListener('keyup', keyDownHandler, false);


function getSelectionText() {
    // From http://stackoverflow.com/questions/5379120/get-the-highlighted-selected-text
    var text = "";
    if (window.getSelection) {
        text = window.getSelection().toString();
    } else if (document.selection && document.selection.type != "Control") {
        text = document.selection.createRange().text;
    }
    //console.log(text);
    return text;
}


function getSelectionPosition() {
    var oRect = null;

    if (window.getSelection) {
        var s = window.getSelection();
        var oRange = s.getRangeAt(0); //get the text range
        oRect = oRange.getBoundingClientRect();
        //console.log('window.getSelection');
    } else if (document.selection && document.selection.type != "Control") {
        var oRange = document.selection.createRange();
        oRect = oRange.getBoundingClientRect();
        //console.log('document.selection');
    }
    //console.log('Rect of selection', oRect.left, oRect.right, oRect.bottom, oRect.top);
    return oRect;
}


function format_query_url(site, text) {
    switch (site) {
        case 'dict.cn':
            text = text.replace(/\s+/mg, '%20');
            return 'http://dict.cn/' + text;
        case 'YoudaoHttp':
            text = text.replace(/\s+/mg, '+');
            return 'http://dict.youdao.com/search?q=' + text;
        case 'Youdao':
            text = text.replace(/\s+/mg, '+');
            return 'https://dict.youdao.com/search?q=' + text;
        case 'Google':
            text = text.replace(/\s+/mg, '%20');
            return 'https://translate.google.com/#auto/zh-CN/' + text;
    }
}


function format_html_dict_cn(data, url) {
    var el = document.createElement( 'html' );
    el.innerHTML = data;

    var ph_el = el.getElementsByClassName( 'phonetic' )

    var basic_el = el.getElementsByClassName( 'layout dual' );
    if (basic_el.length == 0) {
        basic_el = el.getElementsByClassName( 'layout detail' );
    }
    if (basic_el.length == 0) {
        basic_el = el.getElementsByClassName( 'basic clearfix' );
    }

    var ph = '', basic = '';

    if (ph_el.length != 0) {
        //console.log(ph_el);
        ph = ph_el[0].innerHTML;
    } else {
        ph = '';
    }

    if (basic_el.length != 0) {
        //console.log(basic_el);
        basic = basic_el[0].innerHTML;
    } else {
        basic = 'Not found';
    }

    return '<a href="' + url + '" target="_blank">' + url + '</a><p>' + ph + '<p>' + basic;
}


function format_html_google(data, url) {
    // Does not work yet.
    var el = document.createElement( 'html' );
    el.innerHTML = data;

    var basic = '';

    var basic_el = el.getElementsByClassName( 'gt-baf-table' );
    //console.log(basic_el);
    if (basic_el.length == 0) {
        basic_el = el.getElementsByClassName( 'short_text' );
    }
    if (basic_el.length == 0) {
        basic_el = el.getElementsByClassName( 'gt-cc-l-i' );
    }

    if (basic_el.length != 0) {
        //console.log(basic_el);
        basic = basic_el[0].innerHTML;
    } else {
        basic = 'Not found';
    }

    return '<a href="' + url + '" target="_blank">' + url + '</a><p>' + basic;
}



function format_html_youdao(data, url) {
    var el = document.createElement( 'html' );
    el.innerHTML = data;

    var basic = '';

    var basic_el = el.getElementsByClassName( 'trans-container' );
    if (basic_el.length == 0) {
        basic_el = el.getElementsByClassName( 'trans-container tab-content' );
    }
    if (basic_el.length == 0) {
        basic_el = el.getElementsByClassName( 'pr-container more-collapse' );
    }

    if (basic_el.length != 0) {
        //console.log(basic_el);
        basic = basic_el[0].innerHTML;
    } else {
        basic = 'Not found';
    }

    return '<a href="' + url + '" target="_blank">' + url + '</a><p>' + basic;
}


function format_html(data, dict_site, url) {
    switch (dict_site) {
        case 'dict.cn':
            return format_html_dict_cn(data, url);
        case 'Youdao':
            return format_html_youdao(data, url);
        case 'Google':
            return format_html_google(data, url);
    }
}


function handleMouseDown (e) {
    var mouseX = e.clientX;
    var mouseY = e.clientY;
    var rect = this.bubbleDOM.getBoundingClientRect();

    console.log('Mouse x,y', mouseX, mouseY);
    console.log('rect x0,x1,y0,y1', rect.left, rect.right, rect.bottom, rect.top);

    if (mouseX < rect.left || mouseX > rect.right || mouseY > rect.bottom || mouseY < rect.top) {
        this.bubbleDOM.style.visibility = 'hidden';
        //this.removeChild(bubbleDOM);
        document.removeEventListener('mousedown', handleMouseDown);

        // Turn on the major event listner again.
        document.addEventListener('keyup', keyDownHandler, false);
    }
}


function isWordsList(text) {
    return true;
}


function keyDownHandler(e) {
    if (this.bubbleDOM && this.bubbleDOM.style.visibility == 'visible') {
        // Do not send query, because a query window is already visible.
        return;
    }

    var key = e.which || e.keyCode;

    if (key == 17) { // The ascii code for the 'control' key is 17.

        var text = getSelectionText();

        if (!isWordsList(text)) {
            return;
        }

        var dict_site = 'dict.cn';
        if (location.protocol === 'https:') {
            // dict.cn is faster, but does not support https.
            dict_site = 'Youdao';
        }

        if (text != '') {
            //alert('Control key up and text selected:\n' + format_query_url('dict.cn', text));
            query_url = format_query_url(dict_site, text);

            // Turn off the event listner temporarily to avoid multiple query and rendering instants.
            document.removeEventListener('keyup', keyDownHandler);

            $.ajax({
                url: query_url,
                timeout: 2000, // 2 seconds
                success: 
                    function render_result(data) {
                    
                        word_html = format_html(data, dict_site, query_url);
                        //console.log(word_html);
                    
                        // Add bubble to the top of the page.
                        var bubbleDOM = document.createElement('div');
                        bubbleDOM.setAttribute('class', 'selection_bubble');
                        document.body.appendChild(bubbleDOM);
                    
                        var rect_sel = getSelectionPosition();
                        renderBubble(rect_sel.left, rect_sel.top, word_html);
                        
                        // Close the bubble when we click on the screen.
                        document.addEventListener('mousedown', handleMouseDown, false);
                        document.bubbleDOM = bubbleDOM;

                        function renderBubble(x, y, selection) {
                            var maxheight = 320;
                            var maxwidth  = 256;

                            var w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0)
                            var h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0)

                            if (x + maxwidth > w) {
                                x = w - maxheight;
                                if (x < 0) {
                                    x = 0;
                                }
                            }

                            if (y + maxheight > h) {
                                y = h - maxheight;
                                if (y < 0) {
                                    y = 0;
                                }
                            }

                            bubbleDOM.innerHTML  = selection;
                            bubbleDOM.style.top  = y + 'px';
                            bubbleDOM.style.left = x + 'px';
                            bubbleDOM.style['max-height'] = maxheight + 'px';
                            bubbleDOM.style['max-width']  = maxwidth  + 'px';
                            bubbleDOM.style['overflow']   = 'auto';
                            bubbleDOM.style.visibility    = 'visible';
                        }
                    
                    },
                error:
                    function(a, e, c) {
                        console.log(e);
                        document.addEventListener('keyup', keyDownHandler, false);
                    }
            });
        }
    }
}


