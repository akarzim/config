if (window == window.top) {
  function msgHandlerAreYouNonAdobePdf() {
    if (document.querySelector("#webkit-xml-viewer-source-xml")) {
      Browser.sendToExtension({name: "popup_pageInfoReadyToGo",
        url: document.location.href, nonAdobe: true});
    }
  }

  function getInfoRequestHandler() {
    if (document.querySelector("#webkit-xml-viewer-source-xml")) {
      var info = {
        pdf: document.location.href,
        recommendationText: document.title
      };
      Browser.sendToExtension({name: "popup_receivePageInfo", info: info});
    }
  }

  function PdfClipper() {
    Browser.addMessageHandlers({
      clipPdf: msgHandlerClipPdf,
      finishPdfDownload: msgHandlerFinishPdfDownload
    });

    function msgHandlerClipPdf(request, sender, sendResponse) {
      populate(request.note);
      // instead of clipping/downloading the pdf here and transmitting it to the
      // background, which takes a non-trivial amount of time, tell the
      // background to download it, then alert us when it has done.
      Browser.sendToExtension({name: "downloadPdf", url: request.note.pdf});
    }

    function msgHandlerFinishPdfDownload(request, sender, sendResponse) {
      complete("");
    }

    function populate(n) {
      if (n) {
        note = n;
      }
      else {
        note = {};
      }
      if (!note.url) {
        note.url = document.location.href;
      }
      if (!note.title) {
        note.title = document.title;
      }
    }

    function complete(str) {
      note.content = "<br><div style='position: relative'>" + str + "</div><br>";
      Browser.sendToExtension({name: "clipComplete", note: note});
    }

    Object.preventExtensions(this);
  }

  Browser.addMessageHandlers({
    areYouNonAdobePdf: msgHandlerAreYouNonAdobePdf,
    getInfo: getInfoRequestHandler
  });

  if (document.querySelector("#webkit-xml-viewer-source-xml")) {
    new PdfClipper();
    Browser.sendToExtension({name: "popup_pageInfoReadyToGo",
      url: document.location.href, nonAdobe: true});
  }
}