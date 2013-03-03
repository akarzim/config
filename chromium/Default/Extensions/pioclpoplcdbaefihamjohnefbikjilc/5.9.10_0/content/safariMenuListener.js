document.addEventListener("contextmenu", function (evt) {

  var selection = false;
  if (window.getSelection().rangeCount) {
    var range = window.getSelection().getRangeAt(0);
    if (!range.collapsed) {
      selection = true;
    }
  }

  var pdf = false;
  if (document.querySelector("embed[type='application/pdf']")) {
    pdf = true;
  }

  safari.self.tab.setContextMenuEventUserInfo(evt, {
    node: evt.target.nodeName,
    selection: selection,
    srcUrl: evt.target.src,
    url: document.location.href,
    pdf: pdf
  });
}, false);

