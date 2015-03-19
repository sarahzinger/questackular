chrome.extension.onConnect.addListener(function(port) {
	console.log("this connected!");
	port.onMessage.addListener(function(message) {
		console.log('message received', message);
		port.postMessage('Howdy');
	});
});