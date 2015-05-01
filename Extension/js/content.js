$(document).ready(function () {
	console.log("document is ready, content script logging!");
	var startSelect;
	chrome.runtime.sendMessage({getHighlightStatus: true}, function(response) {
		startSelect = response.highlighting;
	});


	function highlight(colour) {
	   
	    if (selected.rangeCount && selected.getRangeAt) {
	        range = selected.getRangeAt(0);
	    }

	    document.designMode = "on";
	    
	    document.body.spellcheck = false;

	    if (range) {
	        selected.removeAllRanges();
	        selected.addRange(range);
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
		console.log("startSelect", startSelect);
		var elem = document.elementFromPoint(v.clientX, v.clientY);
		var found = false;

		while (elem.parentNode) {
			if (elem.tagName.toLowerCase() === "a" || elem.tagName.toLowerCase() === "input" || elem.tagName.toLowerCase() === "textarea" || elem.tagName.toLowerCase() === "select") found = true;
			elem = elem.parentNode;
		}


		if (!found && (startSelect === "true" || startSelect === true)) {
			range, selected = window.getSelection();
			var selectedText = selected.toString();
		    highlight("#fcc");
		    aPage.title = document.title;
		    aPage.url = document.location.href;
		    if (selectedText.trim() !== "") aPage.highlighted.push(selectedText);
		    console.log(aPage);
		}
	});


	chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
		console.log("request", request);
		console.log("request.highlight", typeof request.highlight);
		if (request.highlight === "true" || request.highlight) {
			console.log("true?", request.highlight);
			startSelect = true;
		} else {
			console.log("false?", request.highlight);
			startSelect = false;
			document.designMode = "off";
		}

		if (request.tabInfo) {
			aPage.title = request.tabInfo.title || aPage.title;
			aPage.url = request.tabInfo.url || aPage.url;
			aPage.favicon = request.tabInfo.favicon;
			sendResponse({pageToSave: aPage});
		}

		return true;
	});
	
});