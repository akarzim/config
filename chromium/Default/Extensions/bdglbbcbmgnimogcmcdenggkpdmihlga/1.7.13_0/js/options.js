
var bgPage = chrome.extension.getBackgroundPage();

function byId(id) { return document.getElementById(id); }

window.addEventListener("DOMContentLoaded", function() {
    byId('btn').onclick  = OnClick;
    byId("form").addEventListener("change", Save, true); // event capturing for the rescue!
}, false);


function LoadWindow()
{
    UpdateWindow();
    document.getElementById("waitTime").value = bgPage.options.WaitTime;
    document.getElementById("timeOut").value = bgPage.options.Timeout;
    document.getElementById("scanMode").value = bgPage.options.ScanMode;
    document.getElementById("threads").value = bgPage.options.threads;
    document.getElementById("dontsupport").checked = (localStorage.support == "false");///
}

function clean(html)
{
	html = html.replace("&", "&amp;");
	html = html.replace("<", "&lt;");
	html = html.replace(">", "&gt;");
	html = html.replace('"', "&quot;");
	html = html.replace("'", "&#39;");

	return html;
}

function UpdateWindow()
{
    document.getElementById("status").innerHTML = bgPage.status;
    document.getElementById("progressBar").style.width = bgPage.percentDone + "%";
    //document.getElementById("progressBar").style.backgroundColor = (bgPage.problemCount == 0) ? "green" : "red";
    document.getElementById("problems").style.backgroundColor = (!bgPage.areScanning || !bgPage.problemCount) ? "transparent" : "red";
    document.getElementById("percent").innerHTML = (!bgPage.areScanning) ? "&mdash;" : bgPage.percentDone + "%";
    document.getElementById("btn").innerText = (!bgPage.areScanning) ? "Scan Now" : "Stop Scan";
    document.getElementById("problems").innerHTML = (!bgPage.areScanning) ? "&mdash;" : "<span>" + bgPage.problemCount + "</span>";
    document.getElementById("lastScan").innerHTML = bgPage.GetPrettyDate(bgPage.options.LastScan);
    document.getElementById("nextScan").innerHTML = (bgPage.options.WaitTime == 0) ? "Manual Operation" : bgPage.GetPrettyDate(bgPage.options.NextScan);

    if(bgPage.areScanning)
    {
        var title = bgPage.bookmarks[bgPage.scanCounter].title;
        if(title == ""){title = "No Title";}

        document.getElementById("url").innerHTML = "(<a href='" + bgPage.bookmarks[bgPage.scanCounter].url + "' target='_blank'>" + clean(bgPage.bookmarks[bgPage.scanCounter].path + title) + "</a> )";
    }
    else
    {
        document.getElementById("url").innerHTML = "";
    }
}

function OnClick()
{
    if(bgPage.scanCounter == 0)
    {
        bgPage.StartScan();
    }
    else
    {
        bgPage.StopScan();
    }
}

function Save()
{
    var waitTime = parseInt(document.getElementById("waitTime").value, 10);
    var timeOut  = parseInt(document.getElementById("timeOut").value, 10);
    var scanMode = parseInt(document.getElementById("scanMode").value, 10);
    var threads  = parseInt(document.getElementById("threads").value, 10);

    if(bgPage.options.WaitTime != waitTime && waitTime != 0)
    {
        bgPage.options.NextScan = new Date().getTime() + (86400000 * waitTime); // days
    }

    bgPage.options.WaitTime = waitTime;
    bgPage.options.Timeout  = timeOut;
    bgPage.options.ScanMode = scanMode;
    bgPage.options.threads  = threads;
    

    localStorage["options"] = JSON.stringify(bgPage.options);
    localStorage.support = !(document.getElementById("dontsupport").checked);///

    document.getElementById("saving").style.display = "";
    setTimeout(function() {
        document.getElementById('saving').style.display = 'none';
     }, 800);


    UpdateWindow();
    bgPage.CheckTime(); // try to start the timer if wait was 0
}

chrome.extension.onRequest.addListener(UpdateWindow);
window.onload = LoadWindow;
