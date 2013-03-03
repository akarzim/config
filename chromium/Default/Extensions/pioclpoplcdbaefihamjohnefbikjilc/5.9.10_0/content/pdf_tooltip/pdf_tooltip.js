function msgHandlerGetConfig(request, sender, sendResponse) {
  if (request && request.bootstrapInfo && request.bootstrapInfo.name) {
    if (/china/i.test(request.bootstrapInfo.name)) {
      document.querySelector("#logo").className = "china";
    }
  }
}

Browser.addMessageHandlers({
  config: msgHandlerGetConfig
});

window.addEventListener("DOMContentLoaded", function() {
  GlobalUtils.localize(document.body);
  document.querySelector("#tryItOut").addEventListener("click", function() {
    window.parent.postMessage({ name: "clipPdf" }, "*");
  });
  document.querySelector("#closeBtn").addEventListener("click", function() {
    window.parent.postMessage({ name: "closePdfTooltip"}, "*");
  });
});

Browser.sendToExtension({
  name: "main_getConfig",
  bootstrapInfo: { serviceHost: null, name: null }
});