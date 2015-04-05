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
		case 'content':
			console.log("content");
			checkContent();
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
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
	console.log("background.js request", request);
	console.log("background.js sender", sender);
	if (request.stepUrl && request.stepUrl.length) {
		chrome.tabs.getCurrent(function (tab) {
			console.log("about to change url maybe", tab)
			chrome.tabs.update(tab, {url: request.stepUrl});
		});
	}

	if (request.command === "save-content") {
		console.log("request.command", request.command);
		saveContent();
	}
});

function saveContent() {
	console.log("called saveContent()");
	chrome.tabs.query({active: true}, function (tabs) {
		console.log("these are currently active tabs", tabs);
		chrome.tabs.sendMessage(tabs[0].id, {
			tabInfo: {
				url: tabs[0].url,
				title: tabs[0].title,
				favicon: tabs[0].faviconUrl
			}
		}, function (response) {
			console.log("response after sending getstuff to contentJS", response);
			$.ajax({
				type: "POST",
				url: 'http://localhost:1337/api/link',
				data: response.pageToSave,
				success: function (res) {
					console.log("this is what happened after page got posted?", res);
				}
			});
		});
	});
}


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