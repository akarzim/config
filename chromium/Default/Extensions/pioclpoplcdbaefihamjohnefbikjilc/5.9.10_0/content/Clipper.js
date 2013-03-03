function Clipper() {
  var serializer = new HtmlSerializer();
  var note;
  var element, rangeObject, style, callback;

  Browser.addMessageHandlers({
    clipFullPage: msgHandlerClipFullPage,
    clipArticle: msgHandlerClipArticle,
    clipSelection: msgHandlerClipSelection,
    clipPdf: msgHandlerClipPdf,
    finishPdfDownload: msgHandlerFinishPdfDownload
  });

  function populate(n) {
    if (n) {
      note = n;
    }
    else note = {};
    if (!note.url) {
      note.url = document.location.href;
    }
    if (!note.title) {
      note.title = document.title;
    }
  }

  function kickoffSerializer(_element, _rangeObject, _style, _callback) {
    element = _element;
    rangeObject = _rangeObject;
    style = _style;
    callback = _callback;

    function handleFrames(frameData) {
      serializer.serialize(element, rangeObject, style, callback, frameData);
    }
    try {
      serializeFrames(handleFrames);
    }
    catch(e) {
      console.log("serializeFrames failed: " + e);
    }
  }

  function start(notify) {
    if (notify) clipResult.startClip(note);
  }

  function msgHandlerClipFullPage(request, sender, sendResponse) {
    populate(request.note);
    start(request.notify);
    kickoffSerializer(document.body, null, request.keepStyle, complete);
  }

  function msgHandlerClipArticle(request, sender, sendResponse) {
    populate(request.note);
    start(request.notify);

    var el;
    try {
      // ContentPreview should have already done this work, and potentially nudged it around somewhere.
      el = contentPreview.getArticleElement();
      if (el) {
        kickoffSerializer(el, null, request.keepStyle, complete);
        return;
      }
    }
    catch (e) {
      console.warn("Couldn't get preview from contentPreview. Trying pageInfo.");
    }

    try {
      function proxy(article) {
        kickoffSerializer(article, null, request.keepStyle, complete);
      }
      pageInfo.getDefaultArticle(proxy);
      return;
    }
    catch (e) {
      console.warn("Couldn't get article from pageInfo. Trying default.");
    }
    kickoffSerializer(document.body, null, request.keepStyle, complete);
  }

  function msgHandlerClipSelection(request, sender, sendResponse) {
    populate(request.note);
    start(request.notify);
    buildSelection(request.keepStyle, request.selectionText);
  }

  function msgHandlerClipPdf(request, sender, sendResponse) {
    populate(request.note);
    start(request.notify);
    // instead of clipping/downloading the pdf here and transmitting it to the
    // background, which takes a non-trivial amount of time, tell the
    // background to download it, then alert us when it has done.
    Browser.sendToExtension({name: "downloadPdf", url: request.note.pdf});
  }

  function msgHandlerFinishPdfDownload(request, sender, sendResponse) {
    complete("");
  }

  // @TODO: Duplicated in HtmlSerializer. Consolidate.
  function escapeHTML(str){ 
    str = str.replace(/&/g, "&amp;");
    str = str.replace(/</g, "&lt;");
    str = str.replace(/>/g, "&gt;");
    return str;
  }

  function buildSelection(keepStyle, selectionText) {
    if (selectionText) {
      if (document.querySelector("embed[type='application/pdf']")) {
        complete(selectionText);
        return;
      }
    }

    var str = "";
    try {
      var selection = window.getSelection();
      var range;
      if (selection) { 
        range = selection.getRangeAt(0);
        if (range) {
          // http://dvcs.w3.org/hg/domcore/raw-file/tip/Overview.html#ranges
          if (range.commonAncestorContainer.nodeType == Node.TEXT_NODE) {
            str = range.commonAncestorContainer.textContent.substring(range.startOffset, range.endOffset);
            complete(escapeHTML(str));
          }
          else {
            serializer.serialize(range.commonAncestorContainer, range, keepStyle, complete);
          }
          return;
        }
      }
    }
    catch(e) {
      complete("");
    }
  }

  function complete(str) {
    note.content = "<br><div style='position: relative'>" + str + "</div><br>";
    clipResult.waitComplete();
    Browser.sendToExtension({name: "clipComplete", note: note});
  }

  Object.preventExtensions(this);
}

Object.preventExtensions(Clipper);
