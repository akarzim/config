window.addEventListener("error", function(e) {console.error(e)});

var message = null;
var title = null;
var siteNotes = null;
var relatedSnippets = null;
var attrs = null;
var doneWaiting = false;

var relatedShown = false;
var isError = false;
var siteNotesRequested = false;

var options, bootstrapInfo, baseUrl, auth;

var configComplete = false;
var waitingOnConfig = [];

window.addEventListener("DOMContentLoaded", function() {
  GlobalUtils.localize(document.body);
  Browser.sendToExtension({name: "main_isAuthenticated", type: "clipResult"});

  document.addEventListener("keyup", function(e){
    if (e && e.keyCode && e.keyCode == 27) {
      dismiss(); // ESC
    }
  });

  window.addEventListener("click", function(e){
    if (e && e.srcElement && e.srcElement.nodeName.toLowerCase() == "html") {
      dismiss();
    }
  });

  addHandlers();
  showClipping();
});

window.addEventListener("webkitAnimationEnd", function(evt) {
  if (/expand/i.test(evt.animationName) || /contract/i.test(evt.animationName)) {
    sendHeight(window.getComputedStyle(document.body).height);
  }
  if (evt.animationName == "foodPromoExpand") {
    // vertically center the iOS and Android buttons since the height of the
    // food promo can vary depending on language.
    var h = window.getComputedStyle(document.querySelector("#foodPromo")).height;
    document.querySelector("#downloadButtons").style.height = h;
    document.querySelector("#downloadButtons").style.lineHeight = h;
  }
});
window.addEventListener("webkitAnimationStart", function(evt) {
  if (/expand/i.test(evt.animationName) && evt.animationName != "foodPromoExpand") {
    sendHeight("460px");
  }
});

var notificationHeadline = "#notificationHeadline";
var notificationDetails = "#notificationDetails";
var successActions = "#successActions";
var errorActions = "#errorActions";
var successIcon = "#successIcon";
var errorIcon = "#errorIcon";
var activeIcon = "#activeIcon";
var clippingIcon = "#clippingIcon";

// Keeps track of the number of prerequisite events that have completed so that we can perform our completion actions
// only once all of them have finished.
// Currently we wait for the clip to complete, and the site notes search to finish.
var prereqsComplete = 0;
var startupComplete = false;
function finishedPrereq() {
  if (startupComplete) return;
  prereqsComplete++;
  if (prereqsComplete >=1) {
    startupComplete = true;
    handleComplete();
  }
}

Browser.addMessageHandlers({
  content_showClipResult: msgHandlerShowClipResult,
  content_siteNotesReady: msgHandlerSiteNotesReady,
  content_waitComplete: waitComplete,
  content_getAttributes: startWithAttributes,
  content_dismissClipResult: dismiss,
  config: msgHandlerConfig,
  clipResult_isAuthenticated: msgHandlerIsAuthenticated,
  content_relatedNotesReady: msgHandlerRelatedNotesReady,
  showFoodPromo: msgHandlerShowFoodPromo
});


function msgHandlerConfig(request, sender, sendResponse) {
  if (configComplete) return;
  configComplete = true;
  options = request.options;
  bootstrapInfo = request.bootstrapInfo;
  baseUrl = options.secureProto + bootstrapInfo.serviceHost;

  if (options.showRelatedNotes) {
    document.querySelector("#hideRelatedControl").innerHTML = Browser.i18n.getMessage("hideRelatedNotes");
    document.querySelector("#hideRelated img").className = "";
  }
  else {
    document.querySelector("#hideRelatedControl").innerHTML = Browser.i18n.getMessage("showRelatedNotes");
    document.querySelector("#hideRelated img").className = "reversed";
  }

  relatedSnippets = new NoteSnippets(document.querySelector("#relatedNotesContainer"), baseUrl, auth.userId,
    auth.shardId, options.client);
  siteSnippets = new NoteSnippets(document.querySelector("#siteNotesContainer"), baseUrl, auth.userId,
    auth.shardId, options.client);

  parent.postMessage({name: "content_getAttributes"}, "*");

  for (var i = 0; i < waitingOnConfig.length; i++) {
    var call = waitingOnConfig[i];
    call[0].apply(this, call[1]);
  }
}

function startWithAttributes(request, sender, sendResponse) {
  if (!attrs) attrs = {};
  if (request.attrs !== true) {
    for (var i in request.attrs) {
      attrs[i] = request.attrs[i];
    }
  }
  if (attrs.title) title = attrs.title;
  if (message) {
    notesAndAttrsReady();
  }

  if (startupComplete) return;
  else if (doneWaiting) showSyncing();
  else showClipping();
}

function hideOverlay() {
  Persistent.set("suppressRelatedNotesDiscoveryNotice", true);
  var overlay = document.querySelector(".newFeatureOverlay");
  overlay.className += " hidden";
  overlay.addEventListener("webkitAnimationEnd", function() { overlay.style.display = "none"; }, false);
  document.removeEventListener("click", hideOverlay);
}

function msgHandlerSiteNotesReady(request, sender, sendResponse) {
  if (!configComplete) {
    waitingOnConfig.push([msgHandlerSiteNotesReady, [request, sender, sendResponse]]);
    return;
  }

  if (siteNotes) {
    return; // Ignore duplicate messages.
  }

  if (request && request.notes) {
    siteNotes = request.notes;
    // if we call this after the note has been clipped, siteNotes will
    // include this note, which we don't want, so remove the first one.
    // if we're clipping into a shared notebook, it won't be in this list, so
    // don't remove it in that case
    if (attrs && attrs.notebookGuid) {
      if (!/^shared_/.test(attrs.notebookGuid)) {
        if (message && message.success) {
          siteNotes.notes.list.shift();
          siteNotes.totalNotes--;
        }
      }
    }
    siteSnippets.setNotes(siteNotes.notes.list, siteNotes.totalNotes);
  }
}

function msgHandlerRelatedNotesReady(request, sender, sendResponse) {
  if (!attrs) attrs = {};
  if (request.relatedNotes) {
    attrs.relatedNotes = request.relatedNotes.list;
    relatedSnippets.setNotes(attrs.relatedNotes);
    if (relatedSnippets.hasAtLeastOneNotebookName()) {
      var elementsSelector = "#relatedNotesContainer, #siteNotesContainer, #slider, #relatedNotesScrollable, #relatedNotes";
      var elements = document.querySelectorAll(elementsSelector);
      for (var e = 0; e < elements.length; e++) {
        if (/hasNotebookName/.test(elements[e].className)) {
          break;
        }
        elements[e].className = (elements[e].className + " hasNotebookName");
      }
    }
    relatedShown = false;
    showRelated();
  }
}

function notesAndAttrsReady() {
  var relatedButton = document.getElementById("relatedNotesButton");
  if (relatedButton) {
    var relatedButtonWidth = relatedButton.getBoundingClientRect().width;
    if (relatedButtonWidth) {
      var siteSearchButton = document.getElementById("siteSearchButton");
      if (siteSearchButton) {
        // The exact starting value to use here depends on all the CSS rules for this page. Any time the style of the
        // page changes, we should cause an overflow here to verify that we're still using the right max-width.
        siteSearchButton.style.maxWidth = (413 - relatedButtonWidth) + "px";
      }
    }
  }

  // We've already finished our 'waiting' state, we'll showRelated here instead.
  if (doneWaiting) {
    showRelated();
  }
  finishedPrereq();
}

function waitComplete() {
  doneWaiting = true;
  showSyncing();
}

function setTitle(_title, msgName) {
  if (!_title) {
    _title = Browser.i18n.getMessage("quickNote_untitledNote");
  }
  _title = _title.replace(/&/g, "&amp;");
  _title = _title.replace(/</g, "&lt;");
  _title = _title.replace(/>/g, "&gt;");
  setHeadline(Browser.i18n.getMessage(msgName, [_title]));
}

function showSyncing() {
  showActiveIcon();
  setTitle(title, "contentclipper_syncing");
  if (attrs && attrs.relatedNotes) {
    showRelated();
  }
}

function showClipping() {
  document.querySelector(errorActions).style.display = "none";
  document.querySelector(successActions).style.display = "none";
  showClippingIcon();
  if (title) setTitle(title, "contentclipper_clipping");
  else setTitle(title, "contentclipper_clipping_no_title");
}

function msgHandlerShowClipResult(request, sender, sendResponse) {
  if (!configComplete) {
    waitingOnConfig.push([msgHandlerShowClipResult, [request, sender, sendResponse]]);
    return;
  }

  // We can get this message without first finishing our "waiting" state on a rety of a failed clip, so we clear it
  // here (it should normally be cleared already).
  doneWaiting = true;
  message = request.message;
  if (!attrs || !attrs.relatedNotes
      || (attrs.relatedNotes && attrs.relatedNotes.length == 0)) {
    if (!attrs) attrs = {};
    if (message.relatedNotes) {
      attrs.relatedNotes = message.relatedNotes.list;
      relatedSnippets.setNotes(attrs.relatedNotes);
      if (relatedSnippets.hasAtLeastOneNotebookName()) {
        var elementsSelector = "#relatedNotesContainer, #siteNotesContainer, #slider, #relatedNotesScrollable, #relatedNotes";
        var elements = document.querySelectorAll(elementsSelector);
        for (var e = 0; e < elements.length; e++) {
          if (/hasNotebookName/.test(elements[e].className)) {
            break;
          }
          elements[e].className = (elements[e].className + " hasNotebookName");
        }
      }
      relatedShown = false;
    }
  }

  notesAndAttrsReady();
  finishedPrereq();
}

function addHandlers() {
  document.querySelector("#hideRelated").addEventListener("click", function() {
    Browser.sendToExtension({name: "main_recordActivity"});
    var rn = document.querySelector("#relatedNotes");
    var img = document.querySelector("#hideRelated img");
    var text = document.querySelector("#hideRelatedControl");
    if (rn.className.match("expanded")) {
      rn.className  = (rn.className.replace("expanded", "") + " contracted");
      img.className = "reversing";
      text.textContent = Browser.i18n.getMessage("showRelatedNotes");
      Browser.sendToExtension({name: "main_setOption", options: {showRelatedNotes: false}});
    }
    else {
      rn.className = (rn.className.replace("contracted", "") + " expanded");
      img.className = "unreversing";
      text.textContent = Browser.i18n.getMessage("hideRelatedNotes");
      Browser.sendToExtension({name: "main_setOption", options: {showRelatedNotes: true}});
    }
    return false;
  });

  document.querySelector("#closeResultControl").addEventListener("click", function() {
    dismiss();
  });

  document.querySelector("#relatedNotesButton").addEventListener("click", handleRelatedNotesClick);
}

function handleSiteSearchClick() {
  Browser.sendToExtension({name: "main_recordActivity"});
  var className = document.querySelector("#relatedNotesButton").className;
  document.querySelector("#relatedNotesButton").className = className.replace(/(^|\s+)selected($|\s+)/, "");
  document.querySelector("#siteSearchButton").className = "selected";
  document.querySelector("#slider").className = document.querySelector("#slider").className
    .replace(/show\w+/g, "") + " showRight";
  if (!siteNotesRequested) {
    parent.postMessage({name: "content_frameReady"}, "*");
    siteNotesRequested = true;
  }
}

function handleRelatedNotesClick() {
  Browser.sendToExtension({name: "main_recordActivity"});
  document.querySelector("#slider").className = document.querySelector("#slider").className
    .replace(/show\w+/g, "") + " showLeft";
  var className = document.querySelector("#siteSearchButton").className;
  document.querySelector("#siteSearchButton").className = className.replace(/(^|\s+)selected($|\s+)/, "");
  document.querySelector("#relatedNotesButton").className = "selected";
}

function handleComplete() {
  if (message && message.lookupKey && message.success) {
    Browser.sendToExtension({name: "main_getNoteByKeyAndClear", lookupKey: message.lookupKey});
    handleSuccess();
  }
  else {
    handleFailure();
  }
}

function sendHeight(h) {
  parent.postMessage({name: "content_receiveFrameHeight", height: h}, "*");
}

function handleSuccess() {
  clear();
  showSuccessIcon();
  setTitle(message.title, "desktopNotification_clipUploaded");

  document.querySelector(successActions).style.display = "block";
  if (message.linked) {
    document.querySelector("#viewClip").addEventListener("click", function(e){doSharedNoteSuccessAction("view", e)});
    document.querySelector("#editClip").style.display = "none";
    document.querySelector("#editClip").previousElementSibling.style.display = "none"
  }
  else {
    document.querySelector("#viewClip").addEventListener("click", function(e){doNoteSuccessAction("view", e)});
    document.querySelector("#editClip").addEventListener("click", function(e){doNoteSuccessAction("edit", e)});
  }
  showRelated();
}

function showRelated() {
  if (relatedShown) return;
  relatedShown = true;

  if (!Persistent.get("suppressRelatedNotesDiscoveryNotice")) {
    Persistent.set("suppressRelatedNotesDiscoveryNotice", true);
    document.querySelector(".newFeatureOverlay").style.display = "";
    document.addEventListener("click", hideOverlay);
  }

  if (attrs && attrs.relatedNotes && attrs.relatedNotes.length) {
    document.querySelector("#hideRelated").style.display = "";
    relatedSnippets.setNotes(attrs.relatedNotes);
    if (relatedSnippets.hasAtLeastOneNotebookName()) {
      var elementsSelector = "#relatedNotesContainer, #siteNotesContainer, #slider, #relatedNotesScrollable, #relatedNotes";
      var elements = document.querySelectorAll(elementsSelector);
      for (var e = 0; e < elements.length; e++) {
        elements[e].className = (elements[e].className + " hasNotebookName");
      }
    }
    if (options.showRelatedNotes) {
      relatedSnippets.show();
    }

    // Disable the relatedNotes button if there are no related notes.
    if (!attrs.relatedNotes || attrs.relatedNotes.length == 0) {
      handleSiteSearchClick();
      document.querySelector("#relatedNotesButton").className = "disabled";
      document.querySelector("#relatedNotesButton").removeEventListener("click", handleRelatedNotesClick);
    }
    var url = "";
    if (attrs && attrs.url) {
      url = attrs.url.replace(/^https?:\/\/(.*?)\/.*/, "$1");
    }
    document.querySelector("#siteSearchButton").innerHTML = Browser.i18n.getMessage("clipsFromThisSite", url);
    document.querySelector("#siteSearchButton").addEventListener("click", handleSiteSearchClick);
  }
  document.querySelector("#footer").className = "expanded";
}

function handleFailure() {
  clear();
  showErrorIcon();
  isError = true;

  // Just so we don't get null pointers.
  if (!message) message = {};

  document.querySelector("#retryClip").addEventListener("click", function(e){doNoteFailureAction("retry", e)});
  document.querySelector("#cancelClip").addEventListener("click", function(e){doNoteFailureAction("cancel", e)});

  if (message.errorType == "quotaExceeded") {
    if (auth.premium) {
      setHeadline(Browser.i18n.getMessage("notification_quotaExceededPremium",
        [baseUrl + "/QuotaCheckout.action"]));
    }
    else {
      setHeadline(Browser.i18n.getMessage("notification_quotaExceededFree",
        [baseUrl + "/Checkout.action"]));
    }
    document.querySelector(errorActions).style.display = "block";
  }

  else if (message.errorType == "http") {
    setTitle(message.title, "desktopNotification_unableToSaveClip");
    document.querySelector(errorActions).style.display = "block";
  }

  else if (message.errorType == "tooManyRetries") {
    setTitle(message.title, "desktopNotification_clipProcessorTooManyRetries");
  }

  else if (message.errorType == "authenticationToken") {
    setTitle(message.title, "desktopNotification_clipProcessorSignInTitle");
    setDetails(Browser.i18n.getMessage("desktopNotification_clipProcessorSignInMessage"));
    document.querySelector(errorActions).style.display = "block";
  }

  else if (message.errorType == "unknownNotebook") {
      setTitle(message.title, "desktopNotification_unableToSaveClip");
      setDetails(Browser.i18n.getMessage("EDAMError_1_notebookGuid"));
  }

  else if (message.errorType == "noteSizeExceeded") {
    if (auth.premium) {
      setTitle(message.title, "noteSizeExceededPremium");
    }
    else {
      setHeadline(Browser.i18n.getMessage("noteSizeExceededFree", [baseUrl]));
    }
  }

  // Default.
  else {
    var err = "None Given.";
    if (message.errorType != "") {
      err = message.errorType;
    }
    setHeadline(Browser.i18n.getMessage("desktopNotification_unableToSaveClipUnknown"));
    setDetails(Browser.i18n.getMessage("desktopNotification_unableToSaveClipUnknownMessage", [err]));
    document.querySelector(errorActions).style.display = "block";
  }

  if (document.querySelector("#notificationHeadline a")) {
    document.querySelector("#notificationHeadline a").addEventListener("click",
      function(evt) {
        Browser.sendToExtension({name:"main_openTab", url: this.href});
        evt.preventDefault();
        return false;
      }
    );
  }

  document.querySelector("#footer").className = "expanded";
}

function dismiss() {
  if (message && message.lookupKey) {
    Browser.sendToExtension({name: "main_getNoteByKeyAndClear", lookupKey: message.lookupKey});
  }
  if (parent) {
    parent.postMessage({name: "content_hideClipResult"}, "*");
  }
}

function doNoteFailureAction(action, evt) {
  var msgName = null;
  if (action === "cancel") {
    msgName = "main_getNoteByKeyAndClear";
  }
  else if (action == "retry") {
    msgName = "main_getNoteByKeyAndRetry";
  }

  if (msgName && message.lookupKey) {
    Browser.sendToExtension({name: msgName, lookupKey: message.lookupKey});
    // This is part of 'dismiss', but we don't want to clear the note as well.
    if (parent) {
      parent.postMessage({name: "content_hideClipResult"}, "*");
    }
  }
  else {
    log.warn("Can't look up message info so can't retry or cancel it.");
  }
  if (evt) evt.stopPropagation();
}

function doSharedNoteSuccessAction(action, evt) {
  if (action == "view") {
    var url = GlobalUtils.getNoteURI(options.client, baseUrl, message, action, auth.userId);
    if (options.client == "WEB") {
      Browser.sendToExtension({name: "main_openWindow", width: 800, height: 600, url: url});
    }
    else if (options.client == "DESKTOP") {
      window.location.assign(url); // don't open a browser window when opening the desktop client
    }
  }
  evt.stopPropagation();
}

function doNoteSuccessAction(action, evt) {
  Browser.sendToExtension({name: "main_recordActivity"});
  var url = GlobalUtils.getNoteURI(options.client, baseUrl, message, action, auth.userId);
  if (options.client == "WEB") {
    Browser.sendToExtension({name: "main_openWindow", width: 800, height: 600, url: url});
  }
  else if (options.client == "DESKTOP") {
    window.location.assign(url);
  }

  evt.stopPropagation();
}

function clear() {
  document.querySelector(notificationHeadline).innerHTML = "";
  document.querySelector(notificationDetails).innerHTML = "";
  document.querySelector(successActions).style.display = "none";
  document.querySelector(errorActions).style.display = "none";
}

function showSuccessIcon() {
  document.querySelector(errorIcon).style.display = "none";
  document.querySelector(activeIcon).style.display = "none";
  document.querySelector(clippingIcon).style.display = "none";
  document.querySelector(successIcon).style.display = "inline-block";
}

function showErrorIcon() {
  document.querySelector(successIcon).style.display = "none";
  document.querySelector(activeIcon).style.display = "none";
  document.querySelector(clippingIcon).style.display = "none";
  document.querySelector(errorIcon).style.display = "inline-block";
}

function showActiveIcon() {
  document.querySelector(errorIcon).style.display = "none";
  document.querySelector(successIcon).style.display = "none";
  document.querySelector(clippingIcon).style.display = "none";
  document.querySelector(activeIcon).style.display = "inline-block";
}

function showClippingIcon() {
  document.querySelector(errorIcon).style.display = "none";
  document.querySelector(successIcon).style.display = "none";
  document.querySelector(activeIcon).style.display = "none";
  document.querySelector(clippingIcon).style.display = "inline-block";
}

function setHeadline(headline) {
  document.querySelector(notificationHeadline).innerHTML = headline;
}

function setDetails(details) {
  document.querySelector(notificationDetails).innerHTML = details;
}

function msgHandlerIsAuthenticated(request, sender, sendResponse) {
  auth = request.auth;

  Browser.sendToExtension({
    name: "main_getConfig",
    options: {
      secureProto: null,
      showRelatedNotes: null,
      client: null
    },
    bootstrapInfo: {
      serviceHost: null,
      marketingUrl: null
    }
  });
}

function msgHandlerShowFoodPromo(request, sender, sendResponse) {
  document.querySelector("#foodPromo").style.display = "block";
}