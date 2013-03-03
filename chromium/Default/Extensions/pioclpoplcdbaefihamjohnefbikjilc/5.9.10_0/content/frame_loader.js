if (window == window.parent) {
  // I'm the top-level window.
  var frameData = {};
  var addedEventListeners = false;
  var timeout;

  function countSerializableFrames() {
    var frames = document.querySelectorAll("iframe");
    var count = 0;
    for (var i = 0; i < frames.length; i++) {
      if (frames[i].dataset && frames[i].dataset.en_id) count++;
    }
    return count;
  }

  function completedFrameCount() {
    var count = 0;
    for (var i in frameData) count++;
    return count;
  }

  // Clipper.js will call this.
  var serializeFrames = function(callback) {
    if (countSerializableFrames() == 0) {
      callback(null);
      return;
    }

    function handleBlocked() {
      console.warn("Some frames seem stuck, continuing with what we've got.");
      callback(frameData);
    }

    if (!addedEventListeners) {
      window.addEventListener("message", function(evt) {
        if (evt && evt.data && evt.data.name && evt.data.name == "EN_serialized") {
          frameData[evt.data.id] = evt.data.data;
          clearTimeout(timeout);
          if (completedFrameCount() == countSerializableFrames()) {
            callback(frameData);
          }
          else {
            timeout = setTimeout(handleBlocked, 2000);
          }
        }
        else if (evt && evt.data && evt.data.name && evt.data.name == "main_getTextResource") {
          Browser.sendToExtension({name: "main_getTextResource", href: evt.data.href});
        }
      }, false);
      addedEventListeners = true;
    }

    frameData = {};
    timeout = setTimeout(handleBlocked, 2000);
    // We will bounce this request up to the extension which will spam it out to every frame in this window, where all
    // non-top-level frames are listening for it.
    Browser.sendToExtension({name: "bounce", message: {name: "startSerialize"}});
  }

  // The extension background page will send us this mesage when it has retreived a stylesheet for us. We then post it
  // back to our own window, where frame.js will be listeneing for it. This lets it be handled by code running in the
  // page's javascript context, rather than the extension's content script context, which means we can comunicate with
  // frames properly using postMessage.
  Browser.addMessageHandlers({
    content_textResource: function(request, sender, sendResponse) {
      window.postMessage(request, "*");
    }
  });
}
else {
  // I'm a frame.
  Browser.addMessageHandlers({
    startSerialize: function(request, sender, sendResponse) {
      script = document.createElement("script");
      script.type = "text/javascript";
      script.textContent = "serializeFrame();";
      document.head.appendChild(script);
    }
  }, true);
}

var addedScripts = false;
// We listen for a page info message before we will modify the page source, this keeps us from annoying web developers
// who have our extension installed.
Browser.addMessageHandlers({
  getInfo: function(request, sender, sendResponse) {
    // We only need an HTML serializer in frames (the parent window will use a content script).
    if (window != window.parent) {
      if (!addedScripts) {
        if (document.head) {
          script = document.createElement("script");
          script.type = "text/javascript";
          script.src = Browser.extension.getURL("content/HtmlSerializer.js");
          document.head.appendChild(script);
        }
      }
    }
    // Stuff this into the actual page, so that postMessage works.
    if (!addedScripts) {
      if (document.head) {
        var script = document.createElement("script");
        script.type = "text/javascript";
        script.src = Browser.extension.getURL("content/frame.js");
        document.head.appendChild(script);
        addedScripts = true;
      }
    }
  }
}, true);

