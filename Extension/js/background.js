chrome.browserAction.setBadgeText({text: "Questackular!"});

// useful but not using currently
chrome.omnibox.onInputChanged.addListener(function (text, suggest) {
	console.log("omnibox inputchanged listener text", text);
	console.log("omnibox inputchanged listener suggest", suggest);

	suggest([{
			content: text + " red-divs", description: "change divs to red!"
		}, {
			content: text + " blue-divs", description: "change divs to blue!"
		}]);
});
chrome.omnibox.onInputEntered.addListener(function (text) {
	alert("you just typed" + "'" + text + "'");
	switch(text) {
		case 'red-divs': redDivs();
		break;
		case 'blue-divs': blueDivs();
		break;
	}
	return true;
});

// listening for an event (one-time request) COMING from the popup
chrome.runtime.onMessage.addListener(function (reqest, sender, sendResponse) {
	console.log("background.js message", message);
	console.log("background.js sender", sender);
	console.log("background.js sendResponse", sendResponse);
	switch(reqest.type) {
		case 'red-divs': redDivs();
		break;
		case 'blue-divs': blueDivs();
		break;
	}
	return true;
});

// listening for an event (long-lived connections) coming from DEVTOOLS
chrome.extension.onConnect.addListener(function (port) {
	port.onMessage.addListener(function (message) {
		switch(port.name) {
			case "red-divs-port": redDivs();
			break;
			case "blue-divs-port": blueDivs();
			break;
		}
	});
});

function redDivs() {
	chrome.tabs.getSelected(null, function (tab) {
		chrome.tabs.sendMessage(tab.id, {type: 'red-div', color: "#F00"});
	});
	chrome.browserAction.setBadgeText({text: "red!"});
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