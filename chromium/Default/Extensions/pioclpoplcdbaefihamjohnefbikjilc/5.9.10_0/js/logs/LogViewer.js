function LogViewer() {
  "use strict";

  // Our FileSystem object.
  var fs;
  var dirReader;
  var logSelectorId = "logSelector";
  var followControlId = "logFollow";
  var exportControlId = "exportButton";
  var logViewId = "logViewer";

  // Localize the page.
  GlobalUtils.localize(document.body);
  GlobalUtils.localize(document.getElementsByTagName("title")[0]);

  // List of entries (which should all be files) that we'll populate on startup.
  var entries = [];

  // When we export, we iterate the lsit of entries asynchronously, and store our progress here.
  var currentExportIndex = 0;
  var currentExportString = "";
  var exporting = false;

  // Startup.
  webkitRequestFileSystem(PERSISTENT, Log.maLogSize, start, handleInitFailure);

  function start(fileSystem) {
    fs = fileSystem;
    dirReader = fs.root.createReader();
    getLogFiles();
  }

  function handleInitFailure(fileError) {
    log.error("Failed to init FileSystem.");
    enabled = false;
  }

  function getLogFiles() {
    dirReader.readEntries(getDirEntries, dirReadFailure);
  }

  function getDirEntries(entryList) {
    if (entryList.length) {
      for (var i = 0; i < entryList.length; i++) {
        entries.push(entryList[i]); // concat doesn't work because entryList isn't a normal array.
      }
      getLogFiles();
    }
    else {
      init();
      return; // We're done.
    }
  }

  function dirReadFailure() {
    log.error("Error reading log directory.");
    init(); // We'll start up with whatever we've got so far.
  }

  function init() {
    populateSelectBox();
    showSelectedLog();
  }

  function populateSelectBox() {
    var i = 0;
    for (i = 0; i < entries.length; i++) {
      var option = document.createElement("option");
      option.value = entries[i].name;
      option.textContent = entries[i].name;
      document.getElementById(logSelectorId).appendChild(option);
    }
    document.getElementById(logSelectorId).selectedIndex = i - 1;
  }

  function showSelectedLog() {
    var index = document.getElementById(logSelectorId).selectedIndex;
    if (index == -1) {
      return; // No files.
    }
    entries[index].file(readLog, readLogFailed);
  }

  var followInterval = 0;
  function followLog() {
    if (followInterval) {
      clearInterval(followInterval);
      followInterval = 0;
    }

    if (this.checked) {
      followInterval = setInterval(showSelectedLog, 2000);
    }
  }

  function scrollToBottom() {
    scroll(0, document.body.offsetHeight);
  }

  function readLog(file) {
    var reader = new FileReader();
    reader.onloadend = showLog;
    reader.readAsText(file);
  }

  function readLogFailed() {
    log.error("readLogFailed.");
    exporting = false; // reset this.
  }

  function showLog(evt) {
    var pre = document.createElement("pre");
    pre.textContent = this.result;
    document.getElementById(logViewId).innerHTML = "";
    document.getElementById(logViewId).appendChild(pre);
    if (document.getElementById(followControlId).checked) {
      scrollToBottom();
    }
  }

  function startExportLogs(){
    if (exporting) return;
    exporting = true;
    exportLogs();
  }

  function exportLogs() {
    if (entries.length) {
      if (currentExportIndex == entries.length) {
        deliverLogs();
      }
      else {
        currentExportString += entries[currentExportIndex].name + "\n";
        entries[currentExportIndex].file(readLogForExport, readLogFailed);
      }
    }
  }

  function readLogForExport(file) {
    var reader = new FileReader();
    reader.onloadend = getLogForExport;
    reader.readAsText(file);
  }

  function getLogForExport(evt) {
    currentExportString += this.result + "\n\n";
    currentExportIndex++;
    exportLogs();
  }

  function deliverLogs() {
    var logFile = currentExportString;
    var builder = new WebKitBlobBuilder();
    builder.append(logFile);
    var file = builder.getBlob();
    var blobUrl = window.webkitURL.createObjectURL(file);
    window.location.href = blobUrl;

    console.log(logFile);
    currentExportString = "";
    currentExportIndex = 0;
    exporting = false;
  }

  // Event handler for page elements.
  document.getElementById(logSelectorId).addEventListener("change", showSelectedLog);
  document.getElementById(followControlId).addEventListener("change", followLog);
  document.getElementById(exportControlId).addEventListener("click", startExportLogs);

  Object.preventExtensions(this);
}
Object.preventExtensions(LogViewer);

// used from logs.html

// Standard error handling function that will log exceptions in the background page.
window.addEventListener("error", function(e) {log.error(JSON.stringify(e));});

var logViewer = null;
document.addEventListener("DOMContentLoaded", function() {
  logViewer = new LogViewer();
});

