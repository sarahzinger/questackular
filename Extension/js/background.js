// chrome.browserAction.setBadgeText({text: "Questackular!"});

// useful but not using currently
chrome.omnibox.onInputChanged.addListener(function (text, suggest) {
	suggest([{
			content: "red-divs", description: "type 'red-divs' to change divs to red!"
		}, {
			content: "blue-divs", description: "type 'blue-divs' to change divs to blue!"
		}, {
			content: "save", description: "save current tab's url to list of favorite links!"
		}]);
});

// listening for event from OMNIBOX!!!
chrome.omnibox.onInputEntered.addListener(function (text) {
	alert("you just typed " + "'" + text + "'");

	switch(text) {
		case 'save':
			console.log("save");
			saveUrl();
			break;
		case 'red-divs': 
			console.log("red divs"); 
			redDivs();
			break;
		case 'blue-divs': 
			console.log("blue divs");
			blueDivs();
			break;
	}
	return true;
});

// listening for an event (one-time request) coming from the POPUP
// chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
// 	console.log("background.js message", request);
// 	console.log("background.js sender", sender);
// 	console.log("background.js sendResponse", sendResponse);
// 	// chrome.tabs.getCurrent(function (tab) {
// 	// 	chrome.tabs.update(tab, {url: request.stepUrl});
// 	// });

// 	switch(request.type) {
// 		case 'red-divs': 
// 			console.log("red-divs received");
// 			redDivs();
// 		break;
// 		case 'blue-divs':
// 			console.log("blue-divs received"); 
// 			blueDivs();
// 		break;
// 	}
// 	return true;
	
// });



// listening for an event (long-lived connections) coming from POPUP
chrome.runtime.onConnect.addListener(function (port) {
	console.log("port name is", port);
	port.onMessage.addListener(function (message) {
		console.log("port.onMessage.addListener", message);
		switch(message.type) {
			case "red-divs": 
				redDivs();
				break;
			case "blue-divs": 
				blueDivs();
				break;
		}
	});
});

// send red message to content script!
function redDivs() {
	chrome.tabs.query({active: true}, function (tabs) {
		console.log("tabs", tabs);
		chrome.tabs.sendMessage(tabs[0].id, {type: 'red-divs', color: "#F00"}, function (response) {
			// console.log("response from content script?", response);
		});
	});
	chrome.browserAction.setBadgeText({text: "red!"});
}
// send blue message to content script!
function blueDivs() {
	chrome.tabs.query({active: true}, function (tabs) {
		console.log("tabs", tabs);
		chrome.tabs.sendMessage(tabs[0].id, {type: 'blue-divs', color: "#1E90FF"}, function (response) {
			console.log("response from content script?", response);
		});
	});
	chrome.browserAction.setBadgeText({text: "blue!"});
}

var urlList = [];

function saveUrl() {
	console.log("saveUrl called");
	chrome.tabs.query({active: true}, function (tabs) {
		console.log("tabs", tabs);
		urlList.push(tabs[0].url);
		console.log("urlList", urlList);
		var a = JSON.stringify(urlList);
		console.log("JSON.stringify(urlList)", a);
		localStorage.links = a;
	});
}
// not working
// chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
//     switch(request.type) {
//         case "dom-loaded":
//             alert(request.data.myProperty);
//         break;
//     }
//     return true;
// });

// trying to make this work!
// chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
// 	console.log("background.js message", message);
// 	console.log("background.js sender", sender);
// 	console.log("background.js sendResponse", sendResponse);
// 	sendResponse({hello: "google.com"});
//     chrome.tabs.update(sender.tab.id, {url: message.stepUrl});
// });