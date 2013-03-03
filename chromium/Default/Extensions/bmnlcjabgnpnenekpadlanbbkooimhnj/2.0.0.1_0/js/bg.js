
chrome.runtime.onStartup.addListener(function() {	
	/* Initialize storage log on startup */	
	var data = {}
	data['log'] = "";
	chrome.storage.local.set(data);
});


chrome.runtime.onInstalled.addListener(function(details) {	
	/* Initialize storage log on install or update */	
	var data = {}
	data['log'] = "";
	chrome.storage.local.set(data);
});