// shows the pdf tooltip the first time the user lands on a pdf
if (window == window.parent) {
  function msgHandlerIsAuthenticated(request, sender, sendResponse) {
    if (request.auth && !request.pdfTooltipShown) {
      var tooltip = document.createElement("iframe");
      document.body.appendChild(tooltip);
      tooltip.id = "evernotePdfTooltip";
      tooltip.style.position = "absolute";
      tooltip.style.top = "30px";
      tooltip.style.right = "30px";
      tooltip.style.width = "310px";
      tooltip.style.height = "145px";
      tooltip.style.borderRadius = "8px";
      tooltip.style.border = "none";
      tooltip.style.boxShadow = "2px 2px 6px 1px #999";
      tooltip.src = Browser.extension.getURL("content/pdf_tooltip/pdf_tooltip.html?userId="
        + request.auth.userId);
    }
  }

  function removeTooltip() {
    var tooltip = document.querySelector("#evernotePdfTooltip");
    if (tooltip) {
      tooltip.parentElement.removeChild(tooltip);
    }
  }

  var domLoaded = false;

  function init() {
    if (!domLoaded) {
      domLoaded = true;

      Browser.addMessageHandlers({
        pdfTooltip_isAuthenticated: msgHandlerIsAuthenticated
      });
      window.addEventListener("message", function(evt) {
        if (new RegExp(evt.origin, "i").test(Browser.extension.getURL(""))) {
          if (evt.data.name == "clipPdf") {
            removeTooltip();
            Browser.sendToExtension(evt.data);
          } else if (evt.data.name == "closePdfTooltip") {
            removeTooltip();
          }
        }
      });

      var embed = document.querySelector("embed");
      if (embed && /application\/pdf/i.test(embed.type)) {
        Browser.sendToExtension({ name: "main_isAuthenticated", type: "pdfTooltip" });
      }
    }
  }

  document.addEventListener("DOMContentLoaded", init);
  document.onreadystatechange = function() {
    if (document.readyState == "complete") {
      init();
    }
  }
}