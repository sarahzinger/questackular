// chrome.browserAction.setBadgeText({text: "Questackular!"});

// useful but not using currently
chrome.omnibox.onInputChanged.addListener(function (text, suggest) {
	console.log("omnibox inputchanged listener text", text);
	console.log("omnibox inputchanged listener suggest", suggest);

	suggest([{
			content: "red-divs", description: "type 'red-divs' to change divs to red!"
		}, {
			content: "blue-divs", description: "type 'blue-divs' to change divs to blue!"
		}]);
});

// listening for event from OMNIBOX!!!
chrome.omnibox.onInputEntered.addListener(function (text) {
	alert("you just typed " + "'" + text + "'");
	switch(text) {
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

// listening for an event (one-time request) Ccoming from the POPUP
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
	console.log("background.js message", request);
	console.log("background.js sender", sender);
	console.log("background.js sendResponse", sendResponse);
	switch(request.type) {
		case 'red-divs': 
			console.log("red-divs received");
			redDivs();
		break;
		case 'blue-divs':
			console.log("blue-divs received"); 
			blueDivs();
		break;
	}
	return true;
});

// listening for an event (long-lived connections) coming from DEVTOOLS
// chrome.extension.onConnect.addListener(function (port) {
// 	port.onMessage.addListener(function (message) {
// 		switch(port.name) {
// 			case "red-divs-port": redDivs();
// 			break;
// 			case "blue-divs-port": blueDivs();
// 			break;
// 		}
// 	});
// });

// send red message to content script!
function redDivs() {
	chrome.tabs.query({active: true}, function (tabs) {
		console.log("tabs", tabs);
		chrome.tabs.sendMessage(tabs[0].id, {type: 'red-divs', color: "#F00"}, function (response) {
			console.log("response from content script?", response);
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

// not sure if working
// chrome.extension.onConnect.addListener(function (port) {
// 	console.log("this connected!");
// 	port.onMessage.addListener(function (message) {
// 		console.log('message received', message);
// 		port.postMessage('Howdy');
// 	});
// });

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