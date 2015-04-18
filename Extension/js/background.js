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
	if (request.stepUrl && request.stepUrl.length) {
		chrome.tabs.getCurrent(function (tab) {
			chrome.tabs.update(tab, {url: request.stepUrl});
		});
	}

	if (request.command === "save-content") {	
		saveContent();
	}

	if (request.command === "select-on") {
		highlighting(true);
		
	}

	if (request.command === "select-off") {
		highlighting(false);
	}

	if (request.getHighlightStatus) {
		sendResponse({highlighting: localStorage.highlighting});
	}

});

function highlighting(onOrOff) {
	chrome.tabs.query({active: true}, function (tabs) {
		
		chrome.tabs.sendMessage(tabs[0].id, {
			highlight: onOrOff
		}, function (response) {
			console.log("response after sending getstuff to contentJS", response);
		});
	});
}

function saveContent() {
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
					alert("You just saved " + res.title + ", at URL " + res.url);
				}
			});
		});
	});
}