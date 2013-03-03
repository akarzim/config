var contentPreview;
var pageInfo;
var clipper;

function init() {
  "use strict";

  var domReady = false;
  var msgReady = false;
  var readyCheckTimeout;

  function togglePDFClipContextMenuOption() {
    var isPdf = false;
    var embed = document.querySelector("embed");
    if (embed) {
      if (/application\/pdf/i.test(embed.type)) {
        isPdf = true;
      }
    }
    Browser.sendToExtension({ name: "togglePDFContextMenuOption", show: isPdf });
  }

  function start() {
    if (!SAFARI) {
      togglePDFClipContextMenuOption();
    }
    pageInfo = new PageInfo();
    contentPreview = new ContentPreview();
    clipper = new Clipper();
    checkSimSearch();
  }

  // there is a Chrome bug where some page types won't have a head element so
  // it won't insert the CSS that's declared in the manifest files, so insert
  // them here
  function insertCSSIfNecessary() {
    if (!document.head) {
      Browser.sendToExtension({ name: "insertCSS",
        filename: "content/clip_result/iframe.css" });
      Browser.sendToExtension({ name: "insertCSS",
        filename: "css/contentpreview.css" });
    }
  }

  if (SAFARI) {
    // Don't call this from frames.
    if (window && window != window.parent) return;
    Browser.sendToExtension({name: "main_getL10n"});
  }
  else {
    msgReady = true;
    go();
  }

  Browser.addMessageHandlers({
    l10nData: msgHandlerL10n
  });

  var loadedDomHandler = function() {
    if (!domReady) {
      domReady = true;
      clearTimeout(readyCheckTimeout);
      insertCSSIfNecessary();
      go();
    }
  };

  if (document.readyState == "complete") {
    loadedDomHandler();
  }
  else {
    // Some pages don't fire DOMContentLoaded for some reason, so use
    // onreadystatechange if it'll work.
    // We have to use three different methods of determining whether a page has
    // loaded because of a bug in Chrome 25 where the normal load events
    // (DOMContentLoaded and onreadystatechanged) stopped working on PDF pages.
    // The third is to poll document.readyState to see when it changes.
    window.addEventListener("DOMContentLoaded", loadedDomHandler);
    document.onreadystatechange = function() {
      if (document.readyState == "complete") {
        loadedDomHandler();
      }
    };
    readyCheckTimeout = setTimeout(function() {
      if (document.readyState == "complete") {
        loadedDomHandler();
      }
    }, 100);

    // since Chrome doesn't have PDF has one of the contexts in its API, we
    // have to use this hack to make sure that the PDF clipping option only
    // shows up on PDF pages but not on non-PDF pages
    window.addEventListener("focus", function() {
      togglePDFClipContextMenuOption();
    });
  }

  function msgHandlerL10n(request, sender, sendResponse) {
    if (request.data) {
      Browser.i18n._setL10nData(request.data);
    }
    msgReady = true;
    go();
  }

  function go() {
    if (msgReady && domReady) {
      start();
    }
  }
}

Browser.runIfInTopFrame(init);
