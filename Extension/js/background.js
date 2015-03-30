chrome.extension.onConnect.addListener(function (port) {
	console.log("this connected!");
	port.onMessage.addListener(function (message) {
		console.log('message received', message);
		port.postMessage('Howdy');
	});
});

chrome.extension.onRequest.addListener(function (request, sender) {
	console.log("request", request);
	console.log("sender", sender);
    chrome.tabs.update(sender.tab.id, {url: request.redirect});
});