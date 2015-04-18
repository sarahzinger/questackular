// useful but not using currently
chrome.omnibox.onInputChanged.addListener(function (text, suggest) {
	suggest([{
			content: "save", description: "save current tab's url to list of favorite links!"
		}]);
});

// listening for event from OMNIBOX!!!
chrome.omnibox.onInputEntered.addListener(function (text) {
	alert("you just typed " + "'" + text + "'");

	switch(text) {
		case 'save':
			console.log("save");
			saveContent();
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

	if (request.command === "select-on") {
		console.log("request.command", request.command);
		highlighting(true);
		
	}

	if (request.command === "select-off") {
		console.log("request.command", request.command);
		highlighting(false);
	}

});

function highlighting(onOrOff) {
	console.log("highlighting", onOrOff);
	chrome.tabs.query({active: true}, function (tabs) {
		console.log("these are currently active tabs", tabs);
		chrome.tabs.sendMessage(tabs[0].id, {
			highlight: onOrOff
		}, function (response) {
			console.log("response after sending getstuff to contentJS", response);
		});
	});
}

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
				url: "https://questackular.herokuapp.com/api/link",
				data: response.pageToSave,
				success: function (res) {
					console.log("this is what happened after page got posted?", res);
					alert("You just saved " + res.title + ", at URL " + res.url);
				}
			});
		});
	});
}