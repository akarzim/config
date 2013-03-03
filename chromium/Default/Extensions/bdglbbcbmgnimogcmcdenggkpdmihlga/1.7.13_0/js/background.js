var timerID = null;
var timeOutID = null;
var req = null;
var bookmarks = null;
var results = null;
var areScanning = false;
var scanCounter = 0;
var cancelScan = false;
var problemCount = 0;
var percentDone = 0;
var status = "Idle";
var options = GetOptions();
var areScanning = false;
var bookmarkUrls = {}; // for easy duplicate check
var duplicateCount = 0;
var currentIndex = 0; ///
var reqs = [];

window.onload = CheckTime;

// gets all or some options, filling in defaults when needed
function GetOptions() {
    var options;
    var defaultOptions = GetDefaultOptions();

    if (localStorage["options"] == null) {
        options = GetDefaultOptions();
        localStorage["options"] = JSON.stringify(options);
    } else {
        options = JSON.parse(localStorage["options"]);

        // fill in defaults for new options
        for (key in defaultOptions) {
            if (options[key] == undefined) {
                options[key] = defaultOptions[key];
            }
        }

        // old preferences
        if (options.Timeout == 0) {
            options.ScanMode = 0;
            options.Timeout = 5;
        }
    }

    return options;
}

// used to get defaults to help fill in missing pieces as I add more options
function GetDefaultOptions() {
    return {
        Timeout: 10,
        WaitTime: 30,
        NextScan: new Date().getTime(),
        LastScan: null,
        ScanMode: 2,
        threads: 10
    };
}

// used for the scheduler, is it time to scan yet?
function CheckTime() {
    clearTimeout(timerID);

    var now = new Date();

    if (options.WaitTime == 0) {
        return;
    }

    if (now.getTime() > options.NextScan) {
        StartScan();
        return;
    }

    timerID = setTimeout(CheckTime, 60000); // check every minute
}


// starts the scan process
function StartScan() {
    results = [];
    bookmarks = [];
    timeOutID = null;
    scanCounter = 0;
    currentIndex = 0; ///
    cancelScan = false;
    problemCount = 0;
    percentDone = 0;
    foundDups = 0;
    bookmarkUrls = {};
    reqs = [];
    req = new XMLHttpRequest();

    if (options.WaitTime > 0) {
        options.NextScan = new Date().getTime() + (86400000 * options.WaitTime); // days 
        localStorage["options"] = JSON.stringify(options);
    }

    chrome.bookmarks.getTree(function (marks) {
        duplicateCount = 0;

        FillBookmarks(marks[0], "");

        if (options.ScanMode > 0) {
            for (var i = 0; i < options.threads; i++) {
                reqs[i] = new XMLHttpRequest();
                CheckLinks(i);
            }
        } else {
            GenerateReport();
        }
    });
}

function StopScan() {
    cancelScan = true;

    scanCounter = 0;
    currentIndex = 0; ///
    percentDone = 0;
    problemCount = 0;
    status = "Scan cancelled";
    chrome.extension.sendRequest({});
    cancelScan = false;
    areScanning = false;
    setTimeout(function () { 
        status = 'Idle';
        chrome.extension.sendRequest({}); 
    }, 3000);

    for (var i = 0; i < options.threads; i++) {
        if (reqs[i]) {
            reqs[i].onreadystatechange = null;
            reqs[i].abort();
            reqs[i] = null;
        }
    }
}

// loops through the bookmarks and checks them.  Originally this was multi-threaded but I found that produced wildly unreliable results!
// also used to be "head", but some places like amazon would give me the finger, so alas I must do a "get"
function CheckLinks(req_index) {


    percentDone = Math.round((((scanCounter + 1) / bookmarks.length) * 100 * 10)) / 10;
    status = "Scanning";
    areScanning = true;

    if (scanCounter == bookmarks.length) {
        GenerateReport();
        return;
    }

    chrome.extension.sendRequest({}); // update UI

    if (currentIndex >= bookmarks.length) return; ///

    var timeOutID; ///
    var myIndex = currentIndex; ///
    var req = reqs[req_index]; /// new XMLHttpRequest();

    req.onreadystatechange = function () {
        if (req.readyState == 4) {
            clearTimeout(timeOutID);

            if (req.status != 200) {
                if (!results[req.status]) {
                    results[req.status] = [];
                }

                problemCount++;

                var statusText = req.status ? req.statusText : "Connection Error";

                results[req.status].push({
                    statusText: statusText,
                    bookmark: bookmarks[myIndex]
                });
            }
            req = req.onreadystatechange = timeOutID = null;
            scanCounter++;
            ///CheckLinks(req_index);
            setTimeout(CheckLinks.bind(null, req_index), 1);
        }
    }

    try {
        req.open("get", bookmarks[currentIndex].url, true);
        req.send(null);
        timeOutID = setTimeout(function () {
            req.abort();
        }, (options.Timeout * 1000));
    } catch (e) {} // do nothing, readystate already fired

    currentIndex++; ///
}

// fills the bookmark array with bookmarks, skipping folders
function FillBookmarks(node, path) {
    for (var i = 0; i < node.children.length; i++) {
        var child = node.children[i], url = child.url;
        if (url == null) {
            FillBookmarks(child, path + child.title + " > ");
        } else {
            // Only scan http/https, nothing else!
            if (/^ *https*:\/\//.test(url)) {
                child.path = path;
                bookmarks.push(child);

                if (bookmarkUrls[url] == null) {
                    bookmarkUrls[url] = [];
                }

                bookmarkUrls[url].push(child);

                if (bookmarkUrls[url].length > 1 && options.ScanMode != 1) {
                    duplicateCount++;
                }
            }
        }
    }
}

// generates the scan result
function GenerateReport() {
    percentDone = 100.0;
    status = "Scan complete";
    areScanning = false;

    options.LastScan = new Date().getTime();
    localStorage["options"] = JSON.stringify(options);

    chrome.extension.sendRequest({});
    setTimeout(function () {
        status = 'Idle';
        percentDone = 0;
        currentIndex = 0; ///
        scanCounter = 0;
        chrome.extension.sendRequest({});
    }, 5000);


    if (results.length == 0 && duplicateCount == 0) {
        return;
    }


    chrome.tabs.create({
        url: "report.html"
    }, null);
}

function GetPrettyDate(mSeconds) {
    if (mSeconds == null) {
        return "--";
    }

    var dt = new Date(mSeconds);
    return (dt.getMonth() + 1) + "/" + dt.getDate() + "/" + dt.getFullYear() + " " + dt.getHours() + ":" + Pad(dt.getMinutes());
}

function Pad(num) {
    if (num < 10) {
        return "0" + num;
    }

    return num;
}

// show thank you page upon first install
if (localStorage.thank_you_shown !== "true") {
    localStorage.thank_you_shown = "true";
    chrome.tabs.create({
        url: chrome.extension.getURL('thank_you.html'),
        selected: true
    });
}
