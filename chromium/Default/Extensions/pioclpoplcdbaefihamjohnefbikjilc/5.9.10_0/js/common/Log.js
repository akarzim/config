
var Log = {
  useConsole: true,
  maxLogSize: (1024 *1024 * 10) // 10MB
};

Object.preventExtensions(Log);

// This only works on Chrome.
function LogWriter() {
  "use strict";

  // Our FileSystem object.
  var fs;
  var enabled = true;

  var queue = [];

  var logFileListKey = "logFileList";
  var maxFilesToKeep = 10;
  var fileList = Persistent.get(logFileListKey);
  if (!fileList) fileList = [];

  var purgeRunning = false;

  if (!SAFARI) {
    webkitRequestFileSystem(PERSISTENT, Log.maxLogSize, start, handleInitFailure);
  }
  else {
    handleInitFailure();
  }

  function getDate(){
    var date = new Date;
    var y = (date.getFullYear()).toString();
    var m = (date.getMonth() + 1).toString();
    var d = (date.getDate()).toString();
    if (m.length == 1) m = "0" + m;
    if (d.length == 1) d = "0" + d;
    var dateString = y + "-" + m + "-" + d;
    return dateString;
  }

  function getFileName() {
    var date = getDate();
    return "evernote_web_clipper_log_" + date + ".log";
  }

  function composeMessage(severity, message) {
    var d = new Date();
    return d.toTimeString() + " (" + severity + ") " + message + "\r\n";
  }

  function updateFileList(filename) {
    if (fileList.indexOf(filename) == -1) {
      fileList.push(filename);
      Persistent.set(logFileListKey, fileList);

      if (fileList.length > maxFilesToKeep) {
        purgeExpiredFiles();
      }
    }
  }

  function deleteFailed(e) {
    purgeRunning = false;
    console.error("Failed to delete file!");

    // Try again later?
    setTimeout(purgeExpiredFiles, 1000 * 60 * 60);
  }

  function purgeExpiredFiles() {
    if (purgeRunning) return; // We don't need to do more than one of these simultaneously.
    if (fileList.length > maxFilesToKeep) {
      purgeRunning = true;
      fs.root.getFile(fileList[0], {create: false}, function(entry){deleteFileEntry(entry, name);}, deleteFailed);
    }
  }

  function deleteFileEntry(entry, filename) {
    entry.remove(cleanUpDeletedFile, deleteFailed);
  }

  function cleanUpDeletedFile() {
    var file = fileList.shift();
    Persistent.set(logFileListKey, fileList);
    purgeRunning = false;
    purgeExpiredFiles();
  }

  function start(fileSystem) {
    fs = fileSystem;
    purgeExpiredFiles();
    processQueue();
  }

  function handleInitFailure(fileError) {
    if (!SAFARI) {
      console.error("Failed to init FileSystem. Logs will not be saved.");
    }
    enabled = false;
  }

  function write(severity, message) {
    if (!enabled) return;
    queue.push([severity, message]);
    processQueue();
  }

  function processQueue() {
    if (fs && queue.length) {
      dequeue();
    }
  }

  // Error handler if we fail to get a file when dequeuing.
  function dequeueError() {
    console.warn("Error looking up file.");
    processQueue(); // Try the next item.
  }

  function dequeue() {
    var item = queue.shift();
    var severity = item[0];
    var message = item[1];
    var name = getFileName();
    updateFileList(name);
    fs.root.getFile(name, {create: true}, function(entry){getFileEntry(entry, severity, message)},
      dequeueError);
  }

  function getFileEntry(entry, severity, message) {
    entry.createWriter(function(writer){getFileWriter(writer, severity, message);}, dequeueError);
  }

  function getFileWriter(writer, severity, message) {
    writer.onwriteend = writeComplete;
    writer.onerror = writeComplete;

    writer.seek(writer.length);

    var bb = new WebKitBlobBuilder();
    bb.append(composeMessage(severity, message));
    writer.write(bb.getBlob('text/plain'));
  }

  // Event handler for a successful write.
  function writeComplete(evt) {
    processQueue();
  }

  // Event handler for failed successful write.
  function writeError(evt) {
    processQueue();
  }

  this.write = write;

  Object.preventExtensions(this);
}
Object.preventExtensions(LogWriter);


function LogDispatcher() {
  "use strict";

  var path = document.location.href.replace(/^.*?:\/\/\w+(\/.*?)(\?.*)?$/, "$1");

  function sendMsg(name, msg, err) {
    if (SAFARI) return; 
    Browser.sendToExtension({name: name, message: msg, path: path, error: err.stack});
  }

  function error(msg) {
    var err = new Error();
    sendMsg("log_error", msg, err);
  }

  function exception(msg) {
    var err = new Error();
    sendMsg("log_exception", msg, err);
  }

  function log(msg) {
    var err = new Error();
    sendMsg("log_log", msg, err);
  }

  function warn(msg) {
    var err = new Error();
    sendMsg("log_warn", msg, err);
  }

  this.error = error;
  this.exception = exception;
  this.log = log;
  this.warn = warn;

  Object.preventExtensions(this);
}
Object.preventExtensions(LogDispatcher);

function LogReceiver() {
  "use strict";

  var writer = new LogWriter();

  var myPath = document.location.href.replace(/^.*?:\/\/\w+(\/.*?)(\?.*)?$/, "$1");

  function getError(request, sender, sendResponse) {
    _error(request.message, request.path, {stack: request.error});
  }

  function getException(request, sender, sendResponse) {
    _exception(request.message, request.path, {stack: request.error});
  }

  function getLog(request, sender, sendResponse) {
    _log(request.message, request.path, {stack: request.error});
  }

  function getWarn(request, sender, sendResponse) {
    _warn(request.message, request.path, {stack: request.error});
  }

  Browser.addMessageHandlers({
    log_error: getError,
    log_exception: getException,
    log_log: getLog,
    log_warn: getWarn
  });

  function getMessage(message, path, err, noStack, exception) {
    path = path ? path : myPath;

    // We extract the filename from exceptions instead of using a stack.
    var file = null;
    if ((typeof message != "string") && exception) {
      if (message.filename) {
        file = message.filename.replace(/^(chrome|safari)-extension:\/\/\w+/, "");
      }
      message = JSON.stringify(message);
    }
    var msg = path + ": " + message;
    if (exception) {
      msg += " at " + file;
    }
    if (err) {
      if (!noStack) { // only add a new line if we're adding more than one line of stack info.
        msg += "\r\n";
      }
      msg += getCallStack(err, noStack);
    }
    return msg;
  }

  function getCallStack(err, topOnly) {
    if (!(err && err.stack)) {
      return "";
    }
    var stack = err.stack.split(/\n+/);
    if (stack.length > 2) {
      stack.shift(); // Just says "Error"
      stack.shift(); // The call into error/log/warn
    }
    for (var i = 0; i < stack.length; i++) {
      stack[i] = stack[i].replace(/^(.*\()(chrome|safari)-extension:\/\/\w+(\/.*)$/, "$1$3");
    }
    if (topOnly) {
      if (stack[0].match(/^\s+at\s+(chrome|safari)-extension/)) {
        stack[0] = stack[0].replace(/^\s+(at)\s+(chrome|safari)-extension:\/\/\w+(\/.*)$/, " $1 $3");
      }
      return stack[0];
    }
    return stack.join("\r\n");
  }

  function _error(message, path, err) {
    var msg = getMessage(message, path, err);
    if (Log.useConsole) {
      console.error(msg);
    }
    if (writer) writer.write("ERROR", msg);
  }

  function _exception(message, path) {
    var msg = getMessage(message, path, false, true, true);
    if (Log.useConsole) {
      console.error(msg);
    }
    if (writer) writer.write("EXCEPTION", msg);
  }

  function _log(message, path, err) {
    var msg = getMessage(message, path, err, true);
    if (Log.useConsole) {
      console.log(msg);
    }
    if (writer) writer.write("LOG", msg);
  }

  function _warn(message, path, err) {
    var msg = getMessage(message, path, err);
    if (Log.useConsole) {
      console.warn(msg);
    }
    if (writer) writer.write("WARN", msg);
  }

  function error(msg) {
    var e = new Error();
    _error(msg, null, e);
  }

  function exception(except) {
    _exception(except, null);
  }

  function log(msg) {
    var e = new Error();
    _log(msg, null, e);
  }

  function warn(msg) {
    var e = new Error();
    _warn(msg, null, e);
  }

  this.error = error;
  this.exception = exception;
  this.log = log;
  this.warn = warn;

  Object.preventExtensions(this);
}

Object.preventExtensions(LogReceiver);

var log;
if (document.location.href.match(/background.html$/)) {
  log = new LogReceiver();
}
else {
  log = new LogDispatcher();
}
