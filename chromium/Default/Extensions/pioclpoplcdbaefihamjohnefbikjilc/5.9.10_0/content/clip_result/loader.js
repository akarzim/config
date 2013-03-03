function ClipResult() {
  "use strict";

  var attrs = null;
  var iframe = null;
  var auth = null;
  var jsonRpc = null;

  document.addEventListener("keyup", function(e){
    // ESC
    if (e && e.keyCode && e.keyCode == 27) {
      Browser.sendToExtension({name: "bounce", message: {name: "content_dismissClipResult"}});
    }
  });

  document.addEventListener("click", function(e){
    if (SAFARI) {
      // Safari 5.1 generates click events for the parent document even when the click occured in an iframe. We try and
      // recognize those and ignore them for the purposes of dismissing our iframe.
      if (e.currentTarget && (e.currentTarget.nodeType == Node.DOCUMENT_NODE)) {
        var extUrl = Browser.extension.getURL("");
        var evtUrl = "";
        if (e.currentTarget.URL) evtUrl = e.currentTarget.URL;
        if (evtUrl.substr(0, extUrl.length) == extUrl) {
          return;
        }
      }
    }
    Browser.sendToExtension({name: "bounce", message: {name: "content_dismissClipResult"}});
  });

  window.addEventListener("message", function (msg) {
    if (!msg || !msg.data || !msg.data.name) {
      return;
    }

    var handlers = {
      content_hideClipResult: msgHandlerHideClipResult,
      content_getAttributes: msgHandlerGetAttributes,
      content_openSiteNotes: msgHandlerOpenSiteNotes,
      content_frameReady: msgHandlerFrameReady,
      content_receiveFrameHeight: msgHandlerReceiveFrameHeight
    }

    if (msg.data.name && handlers[msg.data.name]) {
      handlers[msg.data.name](msg.data, null, null);
    }
  });

  function removeIFrame(){
    iframe = document.querySelector("#evernoteClipperResult");
    if (iframe) {
      try {
        iframe.parentNode.removeChild(iframe);
      }
      catch (e) {
        log.log("couldn't remove clip result iframe.");
      }
    }
  }

  Browser.addMessageHandlers({
    content_startClip: msgHandlerStartClip,
    noteSearchResult: receiveSiteNotes
  });

  function startClip(_attrs) {
    // Reset everything.
    attrs = null;
    auth = null;
    jsonRpc = null;

    // Initialize our attributes.
    if (!_attrs || (_attrs === true)) {
      _attrs = {};
    }
    if (!_attrs.title) {
      _attrs.title = document.title;
    }
    if (!_attrs.url) {
      _attrs.url = document.location.href;
    }
    attrs = _attrs;

    removeIFrame();
    iframe = document.createElement("iframe");
    iframe.src = Browser.extension.getURL("content/clip_result/clip_result.html");
    iframe.id = "evernoteClipperResult";
    iframe.name = "evernoteClipperResult";
    try {
      if (document.body.nodeName.toLowerCase() == "frameset") {
        document.body.parentNode.insertBefore(iframe, null);
      }
      else {
        document.body.insertBefore(iframe, null);
      }
    }
    catch (e) {
      console.log("Couldn't insert related notes iframe, got error: " + JSON.stringify(e));
    }
  }

  function msgHandlerGetAttributes(data) {
    Browser.sendToExtension({name: "bounce", message: {name: "content_getAttributes", attrs: attrs}});
  }

  function msgHandlerHideClipResult(data) {
    var iframe = document.querySelector("#evernoteClipperResult");
    if (iframe) {
      iframe.addEventListener("webkitAnimationEnd", removeIFrame, false);
      iframe.className = "hide";
    }
  }

  function msgHandlerStartClip(request, sender, sendResponse) {
    startClip(request.attrs);
  }

  function msgHandlerFrameReady(request, sender, sendResponse) {
    Browser.sendToExtension({name: "main_performNoteSearch",
      resultSpec: {
        includeTitle: true,
        includeUpdated: true,
        includeAttributes: true,
        includeLargestResourceMime: true,
        includeLargestResourceSize: true,
        includeNotebookGuid: true
      },
      noteFilter: {
        order: 2, // NoteSortOrder.UPDATED
        words: buildSiteQuery()
      }
    });
  }

  function msgHandlerOpenSiteNotes(request, sender, sendResponse) {
    var href = request.baseUrl + "/Home.action#x=" + buildSiteQuery();
    Browser.sendToExtension({name: "main_openTab", url: href});
  }

  function msgHandlerReceiveFrameHeight(request, sender, sendResponse) {
    document.querySelector("#evernoteClipperResult").style.height = request.height;
  }

  function waitComplete() {
    Browser.sendToExtension({name: "bounce", message: {name: "content_waitComplete"}});
  }

  function buildSiteQuery() {
    var domain = document.location.href.replace(/^.*?:\/\/(.*?)\/.*$/, "$1");
    var strippedDomain = domain.replace(/^(www\.)?(.*)/i, "$2");
    var words = "any:";
    var prefixes = ["http://", "https://", "http://www.", "https://www."];
    for (var i = 0; i < prefixes.length; i++) {
      words += " sourceUrl:" + prefixes[i] + domain + "*";
    }
    return words;
  }

  function receiveSiteNotes(data, error) {
    Browser.sendToExtension({name: "bounce", message: {name: "content_siteNotesReady", notes: data}});
  }

  this.startClip = startClip;
  this.waitComplete = waitComplete;
  Object.preventExtensions(this);
}

Object.preventExtensions(ClipResult);
var clipResult;

// Don't load in frames.
if (window.parent === window) {
  var clipResult = new ClipResult();
}
