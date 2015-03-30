// not working
window.addEventListener("load", function() {
    chrome.extension.sendMessage({
        type: "dom-loaded", 
        data: {
            myProperty: "value"
        }
    });
}, true);