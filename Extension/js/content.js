$(document).ready(function () {
	// debugger;
	chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
		// debugger;
		console.log("content script request", request);
		console.log("content script sender", sender);
		console.log("content script sendResponse", sendResponse);
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


	chrome.runtime
	
});