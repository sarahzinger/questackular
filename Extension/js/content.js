$(document).ready(function () {
	console.log("document is ready, content script logging!");

	function highlight(colour) {
	    console.log("range", range);
	    console.log("selection", selected);
	    if (selected.rangeCount && selected.getRangeAt) {
	        range = selected.getRangeAt(0);
	        console.log("new range", range);
	    }

	    document.designMode = "on";
	    if (range) {
	        selected.removeAllRanges();
	        console.log("a", selected);
	        selected.addRange(range);
	        console.log("b", selected);
	    }
	    
	    if (!document.execCommand("HiliteColor", false, colour)) {
	        document.execCommand("BackColor", false, colour);
	    }
	    document.designMode = "off";
	}

	var aPage = {
		highlighted: []
	}
	var range, selected;
	$(document).on("click", function (v) {
		var elem = document.elementFromPoint(v.clientX, v.clientY);
		var found = false;

		while (elem.parentNode) {
			if (elem.tagName.toLowerCase() === "a" || elem.tagName.toLowerCase() === "input" || elem.tagName.toLowerCase() === "textarea" || elem.tagName.toLowerCase() === "select") found = true;
			elem = elem.parentNode;
		}

		if (!found) {
			range, selected = window.getSelection();
			var selectedText = selected.toString();

		    console.log("selected rangeCount", selected.rangeCount);
		    console.log("selected", selected);
		    highlight("#fcc");
		    aPage.title = document.title;
		    aPage.url = document.location.href;
		    if (selectedText.trim() !== "") aPage.highlighted.push(selectedText);
		    console.log(aPage);
		}
	});


	chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
		console.log("content script request", request);
		console.log("content script sender", sender);

		if (request.tabInfo) {
			console.log("request.tabInfo", request.tabInfo);
			aPage.title = request.tabInfo.title || aPage.title;
			aPage.url = request.tabInfo.url || aPage.url;
			aPage.favicon = request.tabInfo.favicon;
			console.log("aPage", aPage);
			sendResponse({pageToSave: aPage});
		}

		switch(request.type) {
			case "red-divs":
				var divs = document.querySelectorAll("div");
				console.log("");
	            if(divs.length === 0) {
	                alert("There are no any divs in the page.");
	            } else {
	                for (var i=0; i < divs.length; i++) {
	                    divs[i].style.backgroundColor = request.color;
	                }
	            }
		    	break;
		    case "blue-divs":
				var divs = document.querySelectorAll("div");
	            if(divs.length === 0) {
	                alert("There are no any divs in the page.");
	            } else {
	                for(var i=0; i < divs.length; i++) {
	                    divs[i].style.backgroundColor = request.color;
	                }
	            }
		    	break;
		}
		return true;
	});
	
});