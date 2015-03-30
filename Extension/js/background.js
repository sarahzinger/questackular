chrome.extension.onConnect.addListener(function (port) {
	console.log("this connected!");
	port.onMessage.addListener(function (message) {
		console.log('message received', message);
		port.postMessage('Howdy');
	});
});

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
	console.log("message", message);
	console.log("sender", sender);
	console.log("sendeResponse", sendeResponse);
    chrome.tabs.update(sender.tab.id, {url: message.stepUrl});
});