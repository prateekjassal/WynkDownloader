console.log("WynkDL is running");
chrome.pageAction.onClicked.addListener(initiateSongDownload);

var tabs_urls = {};
var headers = {};
var header_cid = 'x-bsy-cid';
var header_iswap = 'x-bsy-iswap';
var header_utkn = 'x-bsy-utkn';

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
	var newURL = changeInfo.url;
	if(null != newURL) {
		console.log("URL changed");
		if(newURL.indexOf("https://music.wynk.in") != 0)
			chrome.pageAction.hide(tabId);
	}
});

chrome.webRequest.onSendHeaders.addListener(function(details)
 {
	if (details.method == "GET")
	{
		 // Deactivate download icon for old song if a new request is in process
		chrome.pageAction.hide(details.tabId);
		console.log(details);
		var tabId = details.tabId;
		var songURL = details.url;
		updateHeaders(details.requestHeaders);
		tabs_urls.tabId = songURL;
		// console.log(tabs_urls);
		chrome.pageAction.show(details.tabId);
		// console.log("Activating action")
	}
}, {
    urls: ["https://sapi.wynk.in/music/v1/cscgw/*"]
}, ["requestHeaders"]);

/**
Download song from a particular tab
*/
function initiateSongDownload()
{
	// Get current tab, retrieve its title as the default file name
	chrome.tabs.query({currentWindow: true, active: true}, function(tab) 
	{
		var tabId = tab[0].id;
		var title = tab[0].title+'.mp3';
		var url = tabs_urls.tabId;
		getSongDownloadURL(title, url);
	});
}

function getSongDownloadURL(title, url) {
	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function() {
    	if (this.readyState == 4 ){
			if(this.status == 200) {
				// console.log("Response: "+xhr.responseText);
    			data = JSON.parse(xhr.responseText)
    		if(null != data.url)
    			chrome.downloads.download({url: data.url, saveAs: true, filename: title});
    		else
    			handleError();	
			} else {
				handleError();
			} 
    	}
	};
	xhr.open('GET', url, true);
	xhr.setRequestHeader(header_cid, headers[header_cid]);
	xhr.setRequestHeader(header_iswap, headers[header_iswap]);
	xhr.setRequestHeader(header_utkn, headers[header_utkn]);
	xhr.send();
}

function handleError() {
	alert("Failed to download song, try playing it again and retry");
}

function updateHeaders(requestHeaders) 
{
	// Headers needed - x-bsy-cid, x-bsy-iswap, x-bsy-utkn
	for (var i = 0; i < requestHeaders.length; ++i) 
	{
		switch(requestHeaders[i].name)
		{
			case header_cid:
				headers[header_cid] = requestHeaders[i].value;
				break;
			case header_iswap:
				headers[header_iswap] = requestHeaders[i].value;
				break;
			case header_utkn:
				headers[header_utkn] = requestHeaders[i].value;
				break;
			default:
		}
	}
}





