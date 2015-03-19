var port = chrome.extension.connect({name: "Sample Communication"});
port.postMessage("Hi Background");
port.onMessage.addListener(function(msg) {
	console.log('message received', msg);
});