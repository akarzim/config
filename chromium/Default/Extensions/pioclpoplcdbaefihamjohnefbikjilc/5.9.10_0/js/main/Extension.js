function Extension() {
  "use strict";

  // Testing only.
  var startTimer, endTimer;

  var recentNotebooksKey = "recentNotebooks";

  var contextMenuInitializing = false;
  var pdfInContextMenu = true;

  // This is the maximum length of time to keep a failed note around.
  var maxNotePendingTime  = 1000 * 60 * 60 * 24 * 7; // 7 days in milliseconds.

  // This is a map of GUIDs to PendingNote objects.
  // @TODO: Refactor the logic around this list into a separate class instead of being spread through here and
  // JclipSubmitter.
  var pendingNotes = {};
  var downloadedPdfs = {};

  // Set the badge on our icon to the appropriate number.
  // @TODO: As we don't persist pendingNotes across restarts, this is currently always 0.
  setBadge();

  // All our members get initialized in startUp(), which isn't called until we've passed a version check. This prevents
  // us from doing any initialization work for them until we know that we can work.
  var linkedNotebooks;
  var bizNotebooks;
  var notebooks;
  var updatingLinkedNotebooks = false;
  var linkedNotebookCallbacks = []; // Called when we have a new set of linked notebooks.
  var bootstrapInfo;

  // This gets set to 'true' once startUp() has been called, which we'll do only once.
  var started = false;

  // Main JsonRpc connection object. Currently not initialized until a popup page checks our login state.
  // @TODO: Keep this in a relevant state regardless of popups.
  var mainJsonRpc = null;

  var auth;

  // A mapping of usernames to UsageMetrics objects. Whenever we get a request to log a user activity, we'll look up
  // the currently active user in this map (and create an entry if there isn't one), and use that user to send the
  // session info. Note: We will discard session tracking info if there is no logged-in user.
  // @TODO: Save/restore this data in localStorage.
  var usageMetricsManager;

  // @TODO: make useful or remove.
  window.addEventListener("offline", function(e) {log.log("Went offline.");});

  window.addEventListener("online", function(evt){
    log.log("Went online.");

    // @TODO: We may want to do these one at a time instead of simultaneously.
    for (var i in pendingNotes) {
      // We only do notes that haven't failed (or succeeded) before.
      if (!pendingNotes[i].status.success &&
          !pendingNotes[i].status.blocked && pendingNotes[i].status.submitAttempts === 0) {
        processClip(i);
      }
    }
  });

  // This is a hack to get around a chrome bug where popup windows don't fire onunload events.
  // See here: http://code.google.com/p/chromium/issues/detail?id=31262#c13
  if (!SAFARI) {
    chrome.extension.onConnect.addListener(function(port){
      if (port.name === "popupClosed") {
        port.onDisconnect.addListener(function (){
          clearAllPreviews();
        });
      }
    });
  }

  function showIntro() {
    var introShown = "introShown";
    if (!Persistent.get(introShown)) {
      var introPageUrl = bootstrapInfo.get("marketingUrl") + "/webclipper/guide/";
      Persistent.set(introShown, true);
      openTab(introPageUrl);
    }
  }

  function purgeExpiredFailedNotes() {
    for (var i in pendingNotes) {
      if (!pendingNotes[i].status) {
        log.warn("Deleting pendingNote with no status.");
        delete pendingNotes[i];
      }
      else if (pendingNotes[i].status.lastFailureTime && 
        ((pendingNotes[i].status.lastFailureTime + maxNotePendingTime) < d.getTime())) {
        var d = new Date();
        var title = pendingNotes[i].title;
        log.warn("Deleting note '" + title + "', as it's been in a failed state too long.");
        delete pendingNotes[i];
      }
    }
  }

  // This doesn't run until we've performed a version check and have verified that we're not obsolete, *except* in the
  // case that we're offline at startup, in which case we'll assume that we're probably ok.
  function startUp (versionOk) {
    if (!versionOk) {
      log.warn("Version out of date!");
      return;
    }

    if (started) {
      // Already done.
      return;
    }
    started = true;

    bootstrapInfo = new BootstrapInfo();
    auth = new Auth();
    initUsageMetrics();
    initContextMenu();
    initBrowserIcon();
    showIntro();
  }

  function initContextMenu() {
    if (!SAFARI) {
      if (contextMenuInitializing) return;
      contextMenuInitializing = true;

      // If the background page gets reloaded we want to clear out old entries.
      chrome.contextMenus.removeAll(function() {
        if (options.get("useContextMenu")) {
          setupContextMenusChrome();
        }
      });
    }
  }

  function contextMenuActionFailed() {
    alert(Browser.i18n.getMessage("contextMenuPleaseLogin"));
  }

  var safariCMCommands = {
    clipPage:"EN_safariContextClipPage",
    clipSelection: "EN_safariContextClipSelection",
    clipImage: "EN_safariContextClipImage",
    clipPDF: "EN_safariContextClipPDF",
    clipUrl: "EN_safariContextClipUrl",
    newNote: "EN_safariContextNewNote"
  }

  if (SAFARI) {
    safari.application.addEventListener("contextmenu", setupContextMenusSafari, false);
    safari.application.addEventListener("command", handleSafariContextCommand, false);
  }

  function handleSafariContextCommand(evt) {
    var tab = safari.application.activeBrowserWindow.activeTab;
    var info = evt.userInfo;
    switch (evt.command) {
      case safariCMCommands.clipPage :
        contextMenuClipPage(info, tab);
        break;
      case safariCMCommands.clipSelection :
        contextMenuClipSelection(info, tab);
        break;
      case safariCMCommands.clipImage :
        contextMenuClipImage(info, tab);
        break;
      case safariCMCommands.clipPDF :
        contextMenuClipPDF(info, tab);
        break;
      case safariCMCommands.clipUrl :
        contextMenuClipUrl(info, tab);
        break;
      case safariCMCommands.newNote :
        contextMenuNewNote(info, tab);
        break;
    }
  }

  function setupContextMenusSafari(evt) {
    if (!options.get("useContextMenu")) return;

    var info = evt.userInfo;
    if (info && info.url) {
      if (!info.url.match(/^https?/i)) {
        return;
      }
      if (info.url.match(/^https?:\/\/extensions.apple.com/i)) {
        return;
      }
    }

    evt.contextMenu.appendContextMenuItem(safariCMCommands.clipPage,
      Browser.i18n.getMessage("safariContextClipPage"),
    safariCMCommands.clipPage);
    if (evt.userInfo && evt.userInfo.selection) {
      evt.contextMenu.appendContextMenuItem(safariCMCommands.clipSelection,
        Browser.i18n.getMessage("safariContextClipSelection"), safariCMCommands.clipSelection);
    }
    if (evt.userInfo && evt.userInfo.node && evt.userInfo.node.toLowerCase() == "img") {
      evt.contextMenu.appendContextMenuItem(safariCMCommands.clipImage,
        Browser.i18n.getMessage("safariContextClipImage"), safariCMCommands.clipImage);
    }
    if (evt.userInfo && evt.userInfo.pdf) {
      evt.contextMenu.appendContextMenuItem(safariCMCommands.clipPDF,
        Browser.i18n.getMessage("safariContextClipPDF"), safariCMCommands.clipPDF);
    }
    evt.contextMenu.appendContextMenuItem(safariCMCommands.clipUrl,
      Browser.i18n.getMessage("safariContextClipUrl"), safariCMCommands.clipUrl);
    // Do we want this? It's cluttery.
    evt.contextMenu.appendContextMenuItem(safariCMCommands.newNote, Browser.i18n.getMessage("safariContextNewNote"),
    safariCMCommands.newNote);
  }


  function contextMenuClipPage(info, tab) {
    usageMetricsManager.recordActivity(auth.isAuthenticated);
    function checkAuthCallback(auth) {
      if (auth) clipFullPageFromTab(tab);
      else contextMenuActionFailed();
    }
    auth.isAuthenticated(checkAuthCallback, true);
  }

  function contextMenuClipSelection(info, tab) {
    usageMetricsManager.recordActivity(auth.isAuthenticated);
    function checkAuthCallback(auth) {
      if (auth) clipSelectionFromTab(tab, false, info.selectionText);
      else contextMenuActionFailed();
    }
    auth.isAuthenticated(checkAuthCallback, true);
  }

  function contextMenuClipImage(info, tab) {
    usageMetricsManager.recordActivity(auth.isAuthenticated);
    function checkAuthCallback(auth) {
      if (info.srcUrl) {
        if (auth) clipImage(info.srcUrl, tab);
        else contextMenuActionFailed();
      }
    }
    auth.isAuthenticated(checkAuthCallback, true);
  }

  function contextMenuClipPDF(info, tab) {
    usageMetricsManager.recordActivity(auth.isAuthenticated);
    function checkAuthCallback(auth) {
      if (auth) clipPdfFromTab(tab, false);
      else contextMenuActionFailed();
    }
    auth.isAuthenticated(checkAuthCallback, true);
  }

  function contextMenuClipUrl(info, tab) {
    usageMetricsManager.recordActivity(auth.isAuthenticated);
    function checkAuthCallback(auth) {
      if (auth) clipUrlFromTab(tab);
      else contextMenuActionFailed();
    }
    auth.isAuthenticated(checkAuthCallback, true);
  }

  function contextMenuNewNote(info, tab) {
    usageMetricsManager.recordActivity(auth.isAuthenticated);
    function checkAuthCallback(auth) {
      if (auth) {
        var url = options.get("secureProto") + bootstrapInfo.get("serviceHost") + "/edit?newNote";
        openTab(url);
      } else {
        contextMenuActionFailed();
      }
    }
    auth.isAuthenticated(checkAuthCallback, true);
  }

  function setupContextMenusChrome() {
    contextMenuInitializing = false;

    var allowableUrls = ["http://*/*", "https://*/*"];

    chrome.contextMenus.create({
      title : Browser.i18n.getMessage("contextMenuClipPage"),
      contexts : ["page", "image"],
      documentUrlPatterns : allowableUrls,
      onclick : contextMenuClipPage
    });

    chrome.contextMenus.create({
      title : Browser.i18n.getMessage("contextMenuClipSelection"),
      contexts : ["selection"],
      documentUrlPatterns : allowableUrls,
      onclick : contextMenuClipSelection
    });

    chrome.contextMenus.create({
      title : Browser.i18n.getMessage("contextMenuClipImage"),
      contexts : ["image"],
      targetUrlPatterns : allowableUrls,
      onclick : contextMenuClipImage
    });

    chrome.contextMenus.create({
      id: "pdf",
      title : Browser.i18n.getMessage("contextMenuClipPDF"),
      contexts : ["all"],
      documentUrlPatterns : allowableUrls,
      onclick : contextMenuClipPDF,
    });

    chrome.contextMenus.create({
      title : Browser.i18n.getMessage("contextMenuClipUrl"),
      contexts : ['all'],
      documentUrlPatterns : allowableUrls,
      onclick : contextMenuClipUrl
    });

    // Gotta keep 'em separator...
    chrome.contextMenus.create({type: 'separator', contexts: ['all']});

    chrome.contextMenus.create({
      title: Browser.i18n.getMessage("contextMenuNewNote"),
      contexts: ['all'],
      onclick: contextMenuNewNote
    });
  }

  function initBrowserIcon() {
    auth.isAuthenticated(function(authed) {
      if (!authed) {
        Browser.setTitle(Browser.i18n.getMessage("signInPrompt"));
        Browser.setIcon("images/web-clipper-sign-in");
      }
    }, true);
  }

  // Kicks off processing of our note and stores it locally for retrieval. If you supply a string instead of an object,
  // then we look up our note by key, which assumes we've tried this before.
  function processClip(note) {
    if (!note) {
      log.error("processClip received null input, not doing anything.");
      return;
    }
    var key;
    if (typeof(note) === "string") {
      var n = pendingNotes[note];
      if (!n) {
        log.warn("Tried to process note by key: " + note + " but couldn't find it. Abandoning.");
        return;
      }
      key = note;
      note = n;
    }
    else {
      // It's imporant to note that we haven't verified that 'note' is actually valid in any way.
      try {
        key = UUID.generateGuid();
        pendingNotes[key] = note;
        note.lookupKey = key;
      }
      catch (e) {
        log.error("Couldn't save new pendingNote, deleting and skipping.");
        delete pendingNotes[key];
        return;
      }
    }

    if (linkedNotebooks && !updatingLinkedNotebooks) {
      if (note.bizNotebook) {
        note.bizNotebook.linkedGuid = getLinkedNotebookGuidOfBizNotebook(note.bizNotebook.guid);
      }
    }

    setBadge();

    var submitter = new JclipSubmitter(auth, note);
  }

  function setBadge() {
      var count = 0;
      for (var i in pendingNotes) {

        // Make sure our note actually looks like a note.
        if (pendingNotes[i] && pendingNotes[i].status) {
          // We only count notes that are currently in flight or have never been sent (which is the case if we've been
          // offline since they were created).
          if (pendingNotes[i].status.blocked || pendingNotes[i].status.submitAttempts === 0){
            count++;
          }
        }
        else {
          log.warn("Note was null or had no status, skipping and deleting. " + JSON.stringify(pendingNotes[i]));
          delete pendingNotes[i];
        }
      }

      if (SAFARI) {
        for (var i = 0; i < safari.extension.toolbarItems.length; i++) {
          safari.extension.toolbarItems[i].badge = count;
        }
      }
      else {
        chrome.browserAction.setBadgeBackgroundColor({color: [255, 255, 0, 255]});
        if (count == 0) {
          chrome.browserAction.setBadgeText({text: ("")});
        }
        else {
          chrome.browserAction.setBadgeText({text: count.toString()});
        }
      }

  }

  // Initializes our main JsonRpc object. We only do this after receiving a message telling us to, because we want to
  // make sure a user has logged in, as we need their cookies for this to succeed. Calling this a second time will
  // replace the existing object. The original object's callback will not get called if it hasn't already.
  // @TODO: I think the comment above is no longer accurate. Verify.
  function JsonRpcInit(callback) {
    function receiveAuthToken(tokens) {
      try {
        var token = tokens.authenticationToken;
        JsonQueue.initShard(/^"?S=([^:]+)/.exec(token)[1]);
        mainJsonRpc.initWithAuthToken(token, callback);
      }
      catch (e) {
        log.error("Failed initWithAuthToken: " + JSON.stringify(e));
      }
    }
    try {
      // @TODO: Move everything around this object into LinkedNotebooks.
      mainJsonRpc = new JsonRpc(null, ["NoteStore.listLinkedNotebooks"]);
      try {
        auth.getAuthTokens(receiveAuthToken, true);
      }
      catch (e) {
        console.error("Failure getting auth token. " + JSON.stringify(e));
      }
    }
    catch (e) {
      log.error("Error running JsonRpcInit: " + JSON.stringify(e));
    }
  }

  function isForbiddenUrl(url) {
    url = (url + "").toLowerCase();
    // Can't clip the chrome web store (I don't know why. This was here when I got here.)
    if (url.match(/^https?:\/\/chrome.google.com\/(extensions|webstore)/)) return true;

    // Can only clip http/https pages.
    // @TODO: When we have client-side resource resolution for clips, this doesn't need to be true.
    if (!url.match(/^https?:\/\//)) return true;

    // Default case.
    return false;
  }

  // Returns true if the URL is illegal.
  function alertIfIllegalUrl(url) {
    if (isForbiddenUrl(url)) {
      alert(Browser.i18n.getMessage("illegalUrlClipFailure"));
      return true;
    }
    return false;
  }

  // @TODO: set 'keepStyle' appropriately.
  function clipFullPageFromTab(tab, note) {
    if (alertIfIllegalUrl(tab.url)) return;
    if (!note) {
      var notebooks = resolveNotebook();
      note = new PendingNote({}, notebooks, tab);
    }
    Browser.sendToTab(tab, {name: "clipFullPage", note: note, keepStyle: options.get("clipStyle"),
      notify: options.get("clipNotificationEnabled")});
  }

  function clipSelectionFromTab(tab, note, selectionText) {
    if (alertIfIllegalUrl(tab.url)) return;
    if (!note) {
      var notebooks = resolveNotebook();
      note = new PendingNote({}, notebooks, tab);
    }
    Browser.sendToTab(tab, {name: "clipSelection", note: note,
      keepStyle: options.get("clipStyle"), selectionText: selectionText,
      notify: options.get("clipNotificationEnabled")});
  }

  function clipArticleFromTab(tab, note) {
    if (alertIfIllegalUrl(tab.url)) return;
    if (!note) {
      var notebooks = resolveNotebook();
      note = new PendingNote({}, notebooks, tab);
    }
    Browser.sendToTab(tab, {name: "clipArticle", note: note, keepStyle: options.get("clipStyle"),
      notify: options.get("clipNotificationEnabled")});
  }

  function clipUrlFromTab(tab, attrs) {
    if (alertIfIllegalUrl(tab.url)) return;

    var title = null;
    var comment = null;
    var relatedNotes = null;
    var attrsFavIconUrl = null;
    if (attrs) {
      title = attrs.title;
      comment = attrs.comment;
      relatedNotes = attrs.relatedNotes;
      attrsFavIconUrl = attrs.favIconUrl;
    }

    var favIcon = (tab.favIconUrl) ? tab.favIconUrl : attrsFavIconUrl;
    var content = GlobalUtils.createUrlClipContent(title, tab.url, favIcon);
    var n = {title: title, comment: comment, content: content, url: tab.url, relatedNotes: relatedNotes};

    if (attrs && attrs.tagNames && attrs.tagNames.length) {
      n.tagNames = attrs.tagNames;
    }

    if (!n.title) {
      if (tab.title)
        n.title = tab.title;
      else 
        n.title = Browser.i18n.getMessage("quickNote_untitledNote");
    }

    var notebooks = resolveNotebook(attrs ? attrs.notebookGuid : null);
    var note = new PendingNote(n, notebooks);
    note.originatingTab = tab;
    processClip(note);
    if (options.get("clipNotificationEnabled")) {
      Browser.sendToTab(tab, {name: "content_startClip", attrs: note});
    }
  }

  function clipPdfFromTab(tab, note) {
    if (alertIfIllegalUrl(tab.url)) return;

    if (!note) {
      var notebooks = resolveNotebook();
      note = new PendingNote({}, notebooks, tab);
      note.pdf = tab.url;
    }
    Browser.sendToTab(tab, { name: "clipPdf", note: note,
      notify: options.get("clipNotificationEnabled") });
  }

  function clipImage(srcUrl, tab) {
    var notebooks = resolveNotebook(null);
    var content = "<img src=\"" + srcUrl + "\"/>";
    var note = new PendingNote({title: tab.title, content: content, url: tab.url}, notebooks);
    note.originatingTab = tab;
    processClip(note);
    if (options.get("clipNotificationEnabled")) {
      Browser.sendToTab(tab, {name: "content_startClip", attrs: note});
    }
  }

  // TODO: remove when ClipNote is gone.
  function resolveNotebook(notebookGuid) {
    // We need to find the appropriate notebook for the note we're clipping.
    var linkedNotebook = null;
    var standardNotebook = null;
    var bizNotebook = null;

    if (!notebookGuid) {
      var username = auth.getCurrentUsername();
      if (username) {
        var notebooks = Persistent.get(recentNotebooksKey);
        if (notebooks && notebooks[username]) {
          notebookGuid = notebooks[username];
        }
      }
      else {
        log.warn("Tried to look up notebook, but no username.");
      }
    }
    if (notebookGuid) {
      var guid = notebookGuid;
      // @TODO: This is sort of wrong. If linkedNotebooks is null (or doesn't contain the requested notebook), which is 
      // the case until someone has invoked the popup, and the results have come back, or if the list of linked
      // notebooks the user has access to has changed, then we will use the user's default notebook, even if they'd
      // previously saved a linked notebook to use. This comes up if a user attempts to clip from the context menu 
      // without first invoking the popup, and their default notebook is a linked notebook. We will save this note in 
      // the wrong spot in this case until they invoke the popup. There is also a race condition when invoking the
      // popup if you had previously clipped to a linked notebook, and try and clip before the request for linked
      // notebooks has completed.
      if (guid.match(/shared/)) {
        if (linkedNotebooks) {
          linkedNotebook = linkedNotebooks.getWritableLinkedNotebookByGuid(guid);
        }
        if (!linkedNotebook) {
          guid = null; // clear and use default. Fix as per 'todo' above.
        }
      }
      else if (guid.match(/biz/)) {
        bizNotebook = getBizNotebookByGuid(guid);
        if (!bizNotebook) {
          guid = null;
        }
      }
    }

    if (!linkedNotebook && !standardNotebook && !bizNotebook) {
      standardNotebook = new Notebook();
      standardNotebook.guid = guid;
    }

    return { "notebook": standardNotebook, "linkedNotebook": linkedNotebook, "bizNotebook": bizNotebook };
  }

  function getBizNotebookByGuid(guid) {
    if (bizNotebooks) {
      return bizNotebooks.getBizNotebookByGuid(guid);
    }
    return null;
  }

  function getLinkedNotebookGuidOfBizNotebook(bizNotebookGuid) {
    if (linkedNotebooks) {
      if (linkedNotebooks.getBusinessNotebookByGuid(bizNotebookGuid)) {
        return linkedNotebooks.getBusinessNotebookByGuid(bizNotebookGuid).guid;
      }
    }
    return null;
  }

  Browser.addMessageHandlers({

    // Authentication.
    LOGOUT: msgHandlerLogout,
    main_login: msgHandlerLogin,
    main_isAuthenticated: msgHandlerIsAuthenticated,

    // Clip content.
    CLIP_CONTENT_TOO_BIG: msgHandlerClipContentTooBig,

    // Callbacks from content scripts.
    clipComplete: msgHandlerPageClipSuccess,
    main_getTextResource: msgHandlerGetTextResource,
    injectScript: msgHandlerInjectScript,
    main_performNoteSearch: msgHandlerPerformNoteSearch,
    simSearch_getNotesRelatedToSearchQuery: msgHandlerGetNotesRelatedToSearchQuery,
    simSearch_receivePageInfo: msgHandlerReceivePageInfo,
    togglePDFContextMenuOption: msgHandlerTogglePDFContextMenuOption,
    downloadPdf: msgHandlerDownloadPdf,
    clipPdf: msgHandlerClipPdf,

    // These are generally called once a note has been submitted for the purpose of showing a confirmation or error
    // message. msgHandlerGetNoteByKeyAndClear will remove the note from our list of pending notes, such as when a 
    // note has been submitted successfully. msgHandlerGetNoteByKeyAndKeep will leave the note in our list of pending
    // notes, in case we'll want to try resubmitting it later. msgHandlerGetNoteByKeyAndRetry will retry immediately.
    main_getNoteByKeyAndClear: msgHandlerGetNoteByKeyAndClear,
    main_getNoteByKeyAndKeep: msgHandlerGetNoteByKeyAndKeep,
    main_getNoteByKeyAndRetry: msgHandlerGetNoteByKeyAndRetry,

    main_setLastNotebook: msgHandlerSetLastNotebook,
    main_getWritableLinkedNotebooks: msgHandlerGetWritableLinkedNotebooks,
    main_JsonRpcInit: msgHandlerJsonRpcInit,
    main_setOption: msgHandlerSetOption,
    main_getConfig: msgHandlerGetConfig,
    main_openTab: msgHandlerOpenTab,
    main_openWindow: msgHandlerOpenWindow,
    main_restart: msgHandlerRestart,
    
    main_recordActivity: msgHandlerRecordActivity,

    main_incrementUser: msgHandlerIncrementUser,

    // For Safari content scripts that can't get this directly.
    main_getL10n: msgHandlerGetL10n,

    // Simply receives this message and then sends it back out again. This is useful to get around the property where
    // a window can't send a message to itself. You can proxy it through here and the original window will receive
    // it. This lets you (for example) send a message between iframes located in the same window.
    bounce: msgHandlerBounce,
    insertCSS: msgHandlerInsertCSS
  });

  function msgHandlerGetL10n(request, sender, sendResponse) {
    Browser.sendToTab(sender.tab, {name: "l10nData", data: Browser.i18n._getL10nData()});
    if (sendResponse) sendResponse();
  }

  function msgHandlerSetOption(request, sender, sendResponse) {
    for (var i in request.options) {
      options.set(i, request.options[i]);
    }
    if (sendResponse) sendResponse();
  }

  function msgHandlerBounce(request, sender, sendResponse) {
    if (sender.tab) {
      // Save this info, because the receiver might want it. It's in an odd place now but that's the best we can do.
      request.message.tab = sender.tab;
      Browser.sendToTab(sender.tab, request.message);
    }
  }

  function msgHandlerRestart(request, sender, sendResponse) {
    console.log("Got restart message...");
    Browser.removeMessageHandlers();
    window.location.reload();
  }

  function msgHandlerIsAuthenticated(request, sender, sendResponse) {
    function sendMsg(msg) {
      if (request.type == "simSearch") {
        Browser.sendToTab(sender.tab, {name: "simSearch_isAuthenticated", auth: msg});
      }
      else if (request.type == "clipResult") {
        Browser.sendToTab(sender.tab, {name: "clipResult_isAuthenticated", auth: msg});
      }
      else if (request.type == "options") {
        Browser.sendToTab(sender.tab, {name: "options_isAuthenticated", auth: msg});
      } else if (request.type == "pdfTooltip") {
        var pdfTooltipShown = Persistent.get(msg.userId + "_pdfTooltipShown");
        // always set it to true. there's a bug in Safari where setting a
        // localStorage value in a content script doesn't make it to the
        // background's localStorage until you restart the browser. so set it
        // in the same context
        Persistent.set(msg.userId + "_pdfTooltipShown", true);
        Browser.sendToTab(sender.tab, {name: "pdfTooltip_isAuthenticated",
          auth: msg, pdfTooltipShown: pdfTooltipShown});
      }
    }
    if (sender && sender.tab) {
      auth.isAuthenticated(sendMsg, true);
    }
    else {
      auth.isAuthenticated(sendResponse, true);
    }
  }

  function initUsageMetrics() {
    if (!usageMetricsManager && auth) {
      usageMetricsManager = new UsageMetricsManager(options.get("secureProto") + bootstrapInfo.get("serviceHost"),
                                                    auth.isAuthenticated);
    }
  }

  function msgHandlerLogin(request, sender, sendResponse) {
    if (request.fromUrl && request.fromUrl.match(/^https?:\/\/stage(-corp)?\./)) {
      if (!options.get("useStage")) {
        return;
      }
    }

    auth.login(!Boolean(request.fromUrl), request.data.username,
      request.data.password, request.data.remember, sendResponse);
  }

  function msgHandlerLogout(request, sender, sendResponse) {
    if (request.fromUrl && request.fromUrl.match(/^https?:\/\/stage(-corp)?\./)) {
      if (!options.get("useStage")) {
        return;
      }
    }
    if (request.all) {
      auth.logoutAll(request.doPost);
      if (sendResponse) sendResponse();
    }
    else if (request.user) {
      auth.logoutUser(request.user, sendResponse, request.doPost);
    }
    else {
      auth.logout(sendResponse, request.doPost);
    }
  }

  function msgHandlerLogoutWebClient(callback) {
    var x = new XMLHttpRequest();
    var baseUrl = options.get("secureProto") + bootstrapInfo.get("serviceHost");
    x.open("GET", baseUrl + "/Logout.action", true);
    x.onreadystatechange = function() {
      if (x.readyState == 4) {
        callback();
      }
    };
    x.send();
  }

  function msgHandlerSetLastNotebook(request, sender, sendResponse) {
    var username = request.username;
    var notebookGuid = request.notebook;
    var rn = Persistent.get(recentNotebooksKey);
    if (!rn) rn = {};
    if (!username) username = "default";
    rn[username] = notebookGuid;
    Persistent.set(recentNotebooksKey, rn);
  }

  function msgHandlerClipContentTooBig(request, sender, sendResponse) {
    alert(Browser.i18n.getMessage("fullPageClipTooBig"));
    if (sendResponse) sendResponse();
  }

  function msgHandlerGetNoteByKeyAndClear(request, sender, sendResponse) {
    msgHandlerGetNoteByKeyAndKeep(request, sender, sendResponse);
    delete pendingNotes[request.lookupKey];
    setBadge();
  }

  function msgHandlerGetNoteByKeyAndRetry(request, sender, sendResponse) {
    var pending;
    if (request && request.lookupKey) {
      pending = pendingNotes[request.lookupKey];
    }
    if (pending && sender.tab) {
      Browser.sendToTab(sender.tab, {name: "content_startClip", attrs: pending});
    }

    setBadge();
    processClip(request.lookupKey);
    if (sendResponse) sendResponse(null);
  }

  function msgHandlerGetNoteByKeyAndKeep(request, sender, sendResponse) {
    var note = null;
    if (request.lookupKey) {
      note = pendingNotes[request.lookupKey];
    }
    if (sendResponse) sendResponse(note);
  }

  function clearAllPreviews() {
    if (SAFARI) return;
    function clearAllWindows(windows) {
      var i, j;
      for (i = 0; i < windows.length; i++) {
        if (windows[i].tabs) {
          for (j = 0; j < windows[i].tabs.length; j++) {
            // We explicitly ignore chrome-specific URLs, as trying to access them throws errors.
            if (!windows[i].tabs[j].url.match(/^chrome.*:\/\//)) {
              if (chrome.tabs.sendMessage) {
                chrome.tabs.sendMessage(windows[i].tabs[j].id, {name: "preview_clear"});
              }
              else {
                chrome.tabs.sendRequest(windows[i].tabs[j].id, {name: "preview_clear"});
              }
            }
          }
        }
      }
    }
    chrome.windows.getAll({populate: true}, clearAllWindows);
  }

  function msgHandlerClipFullPage(request, sender, sendResponse) {
    startTimer = new Date();
    clipFullPageFromTab(request.tab, request.attrs);
    clearAllPreviews();
    if (sendResponse) sendResponse();
  }

  function msgHandlerClipSelection(request, sender, sendResponse) {
    clipSelectionFromTab(request.tab, request.attrs);
    clearAllPreviews();
    if (sendResponse) sendResponse();
  }

  function msgHandlerClipArticle(request, sender, sendResponse) {
    clipArticleFromTab(request.tab, request.attrs);
    clearAllPreviews();
    if (sendResponse) sendResponse();
  }

  function msgHandlerClipUrl(request, sender, sendResponse) {
    clipUrlFromTab(request.tab, request.attrs);
    clearAllPreviews();
    if (sendResponse) sendResponse();
  }

  function msgHandlerClipPdf(request, sender, sendResponse) {
    if (request.tab) {
      clipPdfFromTab(request.tab, request.attrs);
    } else {
      clipPdfFromTab(sender.tab, request.attrs);
    }
    clearAllPreviews();
    if (sendResponse) sendResponse();
  }

  function executeAllLinkedNotebookCallbacks() {
    updatingLinkedNotebooks = false;
    for (var i = 0; i < linkedNotebookCallbacks.length; i++) {
      // This is in a try/catch block because I ran into an issue where if any callback throws an exception, then we'd
      // fail out of this function, and the list of callbacks would never get cleared, and so we'd be broken forever.
      // Now we should continue through the rest of the list and clear our callbacks, even if one fails.
      try {
        linkedNotebookCallbacks[i]();
      }
      catch (e) {
        log.error("Linked Notebook callback exception: " + JSON.stringify(e));
      }
    }
    linkedNotebookCallbacks = [];
  }

  function msgHandlerGetWritableLinkedNotebooks(request, sender, sendResponse) {

    var currentUser = "";
    if (auth) {
      currentUser = auth.getCurrentUsername();
    }
    if (!currentUser) {
      console.log("Couldn't look up current user.");
    }
    var callback = function() {
      var nb = linkedNotebooks.getWritableLinkedNotebooks();
      if (sendResponse) sendResponse({books: nb, username: currentUser});
    }

    linkedNotebookCallbacks.push(callback);
    if (updatingLinkedNotebooks) {
      return;
    }
    updatingLinkedNotebooks = true;

    function receiveAuthToken(tokens) {
      linkedNotebooks = new LinkedNotebooks(tokens.authenticationToken,
        mainJsonRpc, executeAllLinkedNotebookCallbacks);
    }

    try {
      auth.getAuthTokens(receiveAuthToken, true);
    }
    catch (e) {
      console.error("Failure getting auth token. " + JSON.stringify(e));
    }
  }

  function msgHandlerJsonRpcInit(request, sender, sendResponse) {
    JsonRpcInit(sendResponse);
  }

  function msgHandlerRequestBizNotebooks(request, sender, sendResponse) {
    function receiveNotebooks(response) {
      if (response) {
        bizNotebooks = new BusinessNotebooks(request.auth, response.list);
        sendResponse(response);
      }
    }

    request.rpc.client.NoteStore.listNotebooks(receiveNotebooks, request.auth);
  }

  function msgHandlerInjectScript(request, sender, sendResponse) {
    if (SAFARI) {
      console.warn("Can't currently inject scripts in Safari.");
      return;
    }
    else {
      var details = {file: request.script};
      chrome.tabs.executeScript(sender.tab.tabid, details, sendResponse);
    }
  }

  function msgHandlerPageClipSuccess(request, sender, sendResponse) {
    var notebookGuid = request.note.notebookGuid;
    if (!notebookGuid) {
      if (request.note.notebook) {
        notebookGuid = request.note.notebook.guid;
      }
      else if (request.note.bizNotebook) {
        notebookGuid = "biz_" + request.note.bizNotebook.guid;
      }
      else if (request.note.linkedNotebook) {
        notebookGuid = "shared_" + request.note.linkedNotebook.guid;
      }
    }
    var notebooks = resolveNotebook(notebookGuid);
    // check note size
    var noteSize = request.note.content.length + request.note.title.length
      + request.note.url.length;
    if (request.note.pdf) {
      if (downloadedPdfs[request.note.pdf]) {
        request.note.pdf = downloadedPdfs[request.note.pdf];
        noteSize += request.note.pdf.binary.byteLength;
      }
    }
    var info = auth.getUserInfo();
    if (info && info.premiumInfo && info.premiumInfo.premium) {
      if (noteSize > EDAM_NOTE_SIZE_MAX_PREMIUM) {
        Browser.sendToTab(sender.tab, { name: "content_showClipResult",
          message: { errorType: "noteSizeExceeded" } });
        return;
      }
    }
    else {
      if (noteSize > EDAM_NOTE_SIZE_MAX_FREE) {
        Browser.sendToTab(sender.tab, { name: "content_showClipResult",
          message: { errorType: "noteSizeExceeded" } });
        return;
      }
    }

    var note = new PendingNote(request.note, notebooks, sender.tab);
    processClip(note);
    if (sendResponse) sendResponse();
  }

  function msgHandlerDownloadPdf(request, sender, sendResponse) {
    var client = new XMLHttpRequest();
    client.timeout = 60 * 1000; // Give up after 1 minute.
    client.responseType = "arraybuffer";
    client.open("GET", request.url, true);
    client.onreadystatechange = function() {
      if (client.readyState == client.DONE) {
        if (client.status == 200) {
          downloadedPdfs[request.url] = {
            binary: client.response,
            hexHash: SparkMD5.ArrayBuffer.hash(client.response), // needed to embed attachment in note
            mime: "application/pdf",
            url: request.url
          };
          Browser.sendToTab(sender.tab, { name: "finishPdfDownload" });
        }
      }
    };
    client.send();
  }

  function msgHandlerGetNotesRelatedToSearchQuery(request, sender, sendResponse) {
    Browser.sendToTab(sender.tab, {name: "getInfo", sendToTab: true});
  }

  function msgHandlerReceivePageInfo(request, sender, sendResponse) {
    var rpc, bizRpc;
    var personalRelatedNotes, bizRelatedNotes;
    var containingNotebooks = {};
    var authInfo;
    var baseUrl;
    var cached;

    function sendRelatedNotes() {
      var filteredNotes;
      if (request.info.searchEngine === "Google" || !authInfo.bizAuthenticationToken) {
        filteredNotes = filterThroughGoogleHeuristic();
        Browser.sendToTab(sender.tab, {name: "simsearch_receiveRelatedNotes", relatedNotes: filteredNotes[0],
          type: "account", isBizUser: Boolean(authInfo.bizAuthenticationToken) });
        if (authInfo.bizAuthenticationToken) {
          Browser.sendToTab(sender.tab, {name: "simsearch_receiveRelatedNotes", relatedNotes: filteredNotes[1],
            type: "library" });
        }
      }
      else {
        filteredNotes = filterThroughOtherHeuristic();
        Browser.sendToTab(sender.tab, {name: "simsearch_receiveRelatedNotes", relatedNotes: filteredNotes,
          type: "all" });
      }
    }

    /*
      Heuristic to combine related personal and business notes.
      Google:
        A: personal notes
        B: business notes in notebooks that the user has joined
        C: business notes in notebooks that the user has not joined
        Show all A in the top section
        if B and C are not empty, then show 2 from B and 1 from C in the bottom section
        if only one of B and C are not empty, then fill up all spots with that category in the bottom section.
      Other Search Engines:
    */
    function filterThroughGoogleHeuristic() {
      if (authInfo.bizAuthenticationToken) {
        // separate B and C
        var joinedNotes = [];
        var unjoinedNotes = [];
        var i = 0;
        while (i < bizRelatedNotes.length) {
          if (joinedNotes.length >= 3 && unjoinedNotes.length >= 3) {
            break;
          }
          bizRelatedNotes[i].inBusinessNotebook = true;
          bizRelatedNotes[i].shardId = bizRpc.shardId;
          if (!containingNotebooks[bizRelatedNotes[i].notebookGuid].joined) {
            bizRelatedNotes[i].notebookName = containingNotebooks[bizRelatedNotes[i].notebookGuid].name;
            bizRelatedNotes[i].contact = bizRelatedNotes[i].attributes.lastEditedBy
              || bizRelatedNotes[i].attributes.author || containingNotebooks[bizRelatedNotes[i].notebookGuid].contact;
            unjoinedNotes.push(bizRelatedNotes[i]);
          }
          else {
            joinedNotes.push(bizRelatedNotes[i]);
            if (getLinkedNotebookGuidOfBizNotebook(bizRelatedNotes[i].notebookGuid)) {
              bizRelatedNotes[i].linkedNotebookGuid = getLinkedNotebookGuidOfBizNotebook(bizRelatedNotes[i].notebookGuid);
            }
          }
          i++;
        }

        // combine B and C according to heuristic
        var slotsLeft = Math.max(3 - joinedNotes.length, 1);
        var numC = Math.min(slotsLeft, unjoinedNotes.length);
        bizRelatedNotes = joinedNotes.slice(0, 3 - numC);
        for (var c = 0; c < numC; c++) {
          bizRelatedNotes.push(unjoinedNotes[c]);
        }

        var filteredNotes = [];
        if (personalRelatedNotes.length > 0) {
          filteredNotes[0] = personalRelatedNotes;
        }
        if (bizRelatedNotes.length > 0) {
          filteredNotes[1] = bizRelatedNotes;
        }
        return filteredNotes;
      }
      else if (personalRelatedNotes.length > 0) {
        return [personalRelatedNotes];
      }
      return [];
    }

    function filterThroughOtherHeuristic() {
      var slotsLeftForBC = Math.max(3 - personalRelatedNotes.length, 2);
      // separate biz notes into B and C
      var joinedNotes = [];
      var unjoinedNotes = [];
      for (var i = 0; i < bizRelatedNotes.length; i++) {
        if (joinedNotes.length >= slotsLeftForBC && unjoinedNotes.length >= slotsLeftForBC) {
          break;
        }
        bizRelatedNotes[i].inBusinessNotebook = true;
        bizRelatedNotes[i].shardId = bizRpc.shardId;
        if (containingNotebooks[bizRelatedNotes[i].notebookGuid].joined) {
          joinedNotes.push(bizRelatedNotes[i]);
          if (getLinkedNotebookGuidOfBizNotebook(bizRelatedNotes[i].notebookGuid)) {
            bizRelatedNotes[i].linkedNotebookGuid = getLinkedNotebookGuidOfBizNotebook(bizRelatedNotes[i].notebookGuid);
          }
        }
        else {
          bizRelatedNotes[i].notebookName = containingNotebooks[bizRelatedNotes[i].notebookGuid].name;
          bizRelatedNotes[i].contact = bizRelatedNotes[i].attributes.lastEditedBy
            || bizRelatedNotes[i].attributes.author || containingNotebooks[bizRelatedNotes[i].notebookGuid].contact;
          unjoinedNotes.push(bizRelatedNotes[i]);
        }
      }
      var numB = Math.min(slotsLeftForBC, joinedNotes.length);
      var slotsLeftForC = Math.max(slotsLeftForBC - numB, 1);
      var numC = Math.min(slotsLeftForC, unjoinedNotes.length);
      var bizNotes = joinedNotes.slice(0, slotsLeftForBC - numC);
      for (var i = 0; i < numC; i++) {
        bizNotes.push(unjoinedNotes[i]);
      }
      var allNotes = personalRelatedNotes.slice(0, 3 - bizNotes.length);
      for (var i = 0; i < bizNotes.length; i++) {
        allNotes.push(bizNotes[i]);
      }
      if (allNotes.length > 0) {
        return allNotes;
      }
      else {
        return null;
      }
    }

    function receivePersonalSmartFilingInfo(response, exception) {
      if (response) {
        if (response.relatedNotes) {
          personalRelatedNotes = response.relatedNotes.list;
        }
        else {
          personalRelatedNotes = [];
        }

        cache[authInfo.username].simsearch.updateEntry({
          key: request.info.query,
          content: {
            pers: response
          }
        });
        Persistent.set("userCache", cache);

        if ((authInfo.bizAuthenticationToken && bizRelatedNotes && linkedNotebooks
            && !updatingLinkedNotebooks && haveUpToDateLinkedNotebooks())
            || !authInfo.bizAuthenticationToken) {
          sendRelatedNotes();
        }
      }
      else {
        cache[authInfo.username].simsearch.removeEntry(request.info.query);
        Persistent.set("userCache", cache);
        console.error(exception);
      }
    }

    function receiveBizSmartFilingInfo(response, exception) {
      if (response) {
        if (response.relatedNotes) {
          // get info about containing notebooks
          for (var i = 0; i < response.containingNotebooks.list.length; i++) {
            var notebookDesc = response.containingNotebooks.list[i];
            containingNotebooks[notebookDesc.guid] = { joined: notebookDesc.hasSharedNotebook,
              name: notebookDesc.notebookDisplayName, contact: notebookDesc.contactName };
          }
          bizRelatedNotes = response.relatedNotes.list;
        }
        else {
          bizRelatedNotes = [];
        }

        cache[authInfo.username].simsearch.updateEntry({
          key: request.info.query,
          content: {
            biz: response
          }
        });
        Persistent.set("userCache", cache);

        if (personalRelatedNotes && linkedNotebooks && !updatingLinkedNotebooks && haveUpToDateLinkedNotebooks()) {
          sendRelatedNotes();
        }
      }
      else {
        cache[authInfo.username].simsearch.removeEntry(request.info.query);
        Persistent.set("userCache", cache);
        console.error(exception);
      }
    }

    function receiveLinkedNotebooks() {
      updatingLinkedNotebooks = false;
      if (personalRelatedNotes && bizRelatedNotes) {
        sendRelatedNotes();
      }
    }

    function haveUpToDateLinkedNotebooks() {
      for (var i = 0; i < bizRelatedNotes.length; i++) {
        if (containingNotebooks[bizRelatedNotes[i].notebookGuid].joined) {
          if (linkedNotebooks.getBusinessNotebookByGuid(bizRelatedNotes[i].notebookGuid) == null) {
            linkedNotebooks = new LinkedNotebooks(authInfo.authenticationToken, rpc, receiveLinkedNotebooks);
            return false;
          }
        }
      }
      return true;
    }

    function getFilingRecommendationRequest() {
      var resultSpec = {
        includeTitle: true,
        includeUpdated: true,
        includeAttributes: true,
        includeLargestResourceSize: true,
        includeLargestResourceMime: true,
        includeNotebookGuid: true
      };
      var recReq = { url: request.info.url, text: request.info.recommendationText, query: request.info.query,
        relatedNotesResultSpec: resultSpec};
      return recReq;
    }

    function getRelatedPersonalNotes() {
      if (cached) {
        if (cached.content && cached.content.pers) {
          receivePersonalSmartFilingInfo(cached.content.pers);
        }
        // it's possible to have an entry for this search query, but without
        // a filing recommendation. this means that the request for that search
        // query hasn't finished yet, so this is likely a duplicate request
        // that should be dropped.
        return;
      }
      cache[authInfo.username].simsearch.startEntry(request.info.query);
      JsonQueue.handleExpensiveOpRequest(rpc.shardId, rpc.client.NoteStoreExtra.getFilingRecommendations,
        receivePersonalSmartFilingInfo, authInfo.authenticationToken, getFilingRecommendationRequest());
    }

    function getRelatedBizNotes() {
      if (cached) {
        if (cached.content && cached.content.biz) {
          receiveBizSmartFilingInfo(cached.content.biz);
        }
        // it's possible to have an entry for this search query, but without
        // a filing recommendation. this means that the request for that search
        // query hasn't finished yet, so this is likely a duplicate request
        // that should be dropped.
        return;
      }
      cache[authInfo.username].simsearch.startEntry(request.info.query);
      JsonQueue.handleExpensiveOpRequest(bizRpc.shardId, bizRpc.client.NoteStoreExtra.getFilingRecommendations,
        receiveBizSmartFilingInfo, authInfo.bizAuthenticationToken, getFilingRecommendationRequest());
      if (!linkedNotebooks) {
        updatingLinkedNotebooks = true;
        linkedNotebooks = new LinkedNotebooks(authInfo.authenticationToken, rpc, receiveLinkedNotebooks);
      }
    }

    function requestNotes(ai) {
      authInfo = ai;
      // finish setting up the cache
      if (!cache[authInfo.username]) {
        cache[authInfo.username] = {};
      }
      if (cache[authInfo.username].simsearch) {
        cache[authInfo.username].simsearch = LRUCache.cast(cache[authInfo.username].simsearch);
      } else {
        cache[authInfo.username].simsearch = new LRUCache(5, 30 * 60 * 1000);
      }
      cached = cache[authInfo.username].simsearch.get(request.info.query);

      baseUrl = options.get("secureProto") + bootstrapInfo.get("serviceHost");
      rpc = new JsonRpc(null, ["NoteStoreExtra.getFilingRecommendations", "NoteStore.listLinkedNotebooks"], baseUrl);
      JsonQueue.initShard(/^"?S=([^:]+)/.exec(authInfo.authenticationToken)[1]);
      rpc.initWithAuthToken(authInfo.authenticationToken, getRelatedPersonalNotes);

      if (authInfo.bizAuthenticationToken) {
        bizRpc = new JsonRpc(null, ["NoteStoreExtra.getFilingRecommendations"], baseUrl);
        JsonQueue.initShard(/^"?S=([^:]+)/.exec(authInfo.bizAuthenticationToken)[1]);
        bizRpc.initWithAuthToken(authInfo.bizAuthenticationToken, getRelatedBizNotes);
      }
    }

    // start setting up the cache
    var cache = Persistent.get("userCache");
    if (!cache) {
      cache = {};
    }
    auth.isAuthenticated(requestNotes, true);
  }

  function msgHandlerPerformNoteSearch(request, sender, sendResponse) {
    var resultSpec = request.resultSpec;
    var noteFilter = request.noteFilter;
    var authInfo;
    var rpc, bizRpc;
    var personalNotes, bizNotes;

    var maxNotes = 30;
    if (request.maxNotes) {
      maxNotes = request.maxNotes;
    }

    function respond(data, error) {
      data.name = "noteSearchResult";
      Browser.sendToTab(sender.tab, data);
    }

    function receivePersonalNotes(data) {
      personalNotes = data;
      if ((authInfo.bizAuthenticationToken && bizNotes) || !authInfo.bizAuthenticationToken) {
        respond(combineNotes());
      }
    }

    function receiveBizNotes(data) {
      bizNotes = data;
      if (personalNotes) {
        respond(combineNotes());
      }
    }

    function combineNotes() {
      if (authInfo.bizAuthenticationToken) {
        var notes = personalNotes.notes.list.slice(0);
        for (var n = 0; n < bizNotes.notes.list.length; n++) {
          bizNotes.notes.list[n].inBusinessNotebook = true;
          bizNotes.notes.list[n].shardId = bizRpc.shardId;
          if (getLinkedNotebookGuidOfBizNotebook(bizNotes.notes.list[n].notebookGuid)) {
            bizNotes.notes.list[n].linkedNotebookGuid = getLinkedNotebookGuidOfBizNotebook(bizNotes.notes.list[n].notebookGuid);
          }
          notes.push(bizNotes.notes.list[n]);
        }
        notes.sort(function(a, b) { return b.updated - a.updated }); // sort in descending chronological order
        notes = notes.slice(0, maxNotes);
        personalNotes.notesSize = Math.min(personalNotes.notesSize + bizNotes.notesSize, maxNotes);
        personalNotes.totalNotes += bizNotes.totalNotes;
        personalNotes.notes.list = notes;
      }
      return personalNotes;
    }

    function performSearch() {
      JsonQueue.handleExpensiveOpRequest(rpc.shardId, rpc.client.NoteStoreExtra.findNotesWithSnippet,
        receivePersonalNotes, authInfo.authenticationToken, noteFilter, 0, maxNotes, resultSpec);
      if (authInfo.bizAuthenticationToken) {
        JsonQueue.handleExpensiveOpRequest(bizRpc.shardId, bizRpc.client.NoteStoreExtra.findNotesWithSnippet,
          receiveBizNotes, authInfo.bizAuthenticationToken, noteFilter, 0, maxNotes, resultSpec);
      }
    }

    function requestNotes(_auth) {
      authInfo = _auth;
      if (!authInfo || !authInfo.authenticationToken) {
        respond(null);
        return;
      }

      var serviceUrl = options.get("secureProto") + bootstrapInfo.get("serviceHost");
      rpc = new JsonRpc(null, ["NoteStoreExtra.findNotesWithSnippet"], serviceUrl);
      JsonQueue.initShard(/^"?S=([^:]+)/.exec(authInfo.authenticationToken)[1]);
      rpc.initWithAuthToken(authInfo.authenticationToken, function() {
        if (authInfo.bizAuthenticationToken) {
          bizRpc = new JsonRpc(null, ["NoteStoreExtra.findNotesWithSnippet"], serviceUrl);
          JsonQueue.initShard(/^"?S=([^:]+)/.exec(authInfo.bizAuthenticationToken)[1]);
          bizRpc.initWithAuthToken(authInfo.bizAuthenticationToken, performSearch);
        }
        else {
          performSearch();
        }
      });
    }

    auth.isAuthenticated(requestNotes, true);
    if (sendResponse) sendResponse();
  }

  function msgHandlerGetTextResource(request, sender, sendResponse) {

    var xhr;
    var response = {};
    response.name = "content_textResource";

    function handleResource(evt) {
      if (xhr.readyState == xhr.DONE) {
        if (xhr.status == 200) {
          response.responseText = xhr.responseText;
        }
        else {
          response.responseText = null;
        }

        Browser.sendToTab(sender.tab, response);
      }
    }

    response.href = null;
    if (request && request.href) {
      response.href = request.href;
      xhr = new XMLHttpRequest();
      xhr.open("GET", request.href);
      xhr.onreadystatechange = handleResource;
      xhr.send();
    }

    if (sendResponse) sendResponse();
  }

  function msgHandlerOptionsUpdated(request, sender, sendResponse) {
    // There is a race condition here, as we don't know whether the Options object will get this message and update
    // itself before we try and check its value here. We wait a little bit before checking to hopefully avoid this. It's
    // not ideal, but it's probably good enough.
    setTimeout(function() {
      initContextMenu();
    }, 500);

    if (sendResponse) sendResponse();
  }

  function msgHandlerGetConfig(request, sender, sendResponse) {
    var response = {name: "config"};
      if (request.options) {
        response.options = {};
        for (var i in request.options) {
          response.options[i] = options.get(i);
        }
      }
      if (request.bootstrapInfo) {
        response.bootstrapInfo = {};
        for (var i in request.bootstrapInfo) {
          if (bootstrapInfo) // Sarafi 5.1 somehow seems to miss this sometimes.
            response.bootstrapInfo[i] = bootstrapInfo.get(i);
        }
      }
    Browser.sendToTab(sender.tab, response);
    if (sendResponse) sendResponse(response);
  }

  function getOption(opt) {
    return options.get(opt);
  }

  function setOption(opt, val) {
    options.set(opt, val);
  }

  function getBootstrapInfo(key) {
    if (!bootstrapInfo) return "";
    return bootstrapInfo.get(key);
  }

  function msgHandlerOpenTab(request, sender, sendResponse) {
    openTab(request.url);
    if (sendResponse) sendResponse();
  }

  function openTab(url) {
    if (SAFARI) {
      safari.application.activeBrowserWindow.openTab().url = url;
    }
    else {
      chrome.tabs.create({url: url, selected: true});
    }
  }

  function msgHandlerOpenWindow(request, sender, sendResponse) {
    var width = 600;
    var height = 600;
    var url = "";
    if (request.width) width = request.width;
    if (request.height) height = request.height;
    if (request.url) url = request.url;
    if (url) {
      var params = {url: url, width: width, height: height};
      if (SAFARI) {
        var win = safari.application.openBrowserWindow();
        win.activeTab.url = url;
      }
      else {
        chrome.windows.create(params);
      }
    }
    if (sendResponse) sendResponse();
  }

  function msgHandlerIncrementUser(request, sender, sendResponse) {
    if (!auth) return;
    var users = auth.getLoggedInUserNames();
    if (users.length <= 1) {
      return;
    }
    var current = auth.getCurrentUsername();
    var next = 0;
    for (var i = 0; i < users.length; i++) {
      if (users[i] == current) {
        next = i + 1;
        break;
      }
    }
    if (next == users.length) next = 0;
    auth.setCurrentUser(users[next]);
    Browser.sendToTab(sender.tab, {name: "content_userChanged", username: users[next]});
  }

  function msgHandlerRecordActivity(request, sender, sendResponse) {
    try {
      usageMetricsManager.recordActivity();
    }
    catch (e) {
      console.warn("Failed to record user activity.");
    }
    if (sendResponse) sendResponse();
  }

  function msgHandlerTogglePDFContextMenuOption(request, sender, sendResponse) {
    if (!SAFARI) {
      if (request.show != pdfInContextMenu) {
        pdfInContextMenu = request.show;
        if (request.show) {
          initContextMenu();
        }
        else {
          chrome.contextMenus.remove("pdf");
        }
      }
    }
  }

  function msgHandlerInsertCSS(request, sender, sendResponse) {
    Browser.insertCSS(request.filename);
  }

  // Main startup.
  function start() {
    var bootstrapper = new Bootstrapper();
    bootstrapper.bootstrap(startUp);
  }

  function getLoggedInUserNames() {
    if (!auth) return [];
    return auth.getLoggedInUserNames();
  }

  function setCurrentUser(user) {
    if (!auth) return false;
    return auth.setCurrentUser(user);
  }

  function bootstrap(callback) {
    function intermediate() {
      try {
        bootstrapInfo = new BootstrapInfo();
        if (callback) callback();
      }
      catch(e) {
        console.log(e);
      }
    }
    var bootstrapper = new Bootstrapper();
    bootstrapper.bootstrap(intermediate);
  }

  function getUserInfo(username) {
    if (auth) return auth.getUserInfo(username);
    return {};
  }

  // Public API:

  this.setOption = setOption;
  this.getOption = getOption;
  this.getBootstrapInfo = getBootstrapInfo;
  this.start = start;
  this.bootstrap = bootstrap;
  this.getLoggedInUserNames = getLoggedInUserNames;
  this.setCurrentUser = setCurrentUser;
  this.getUserInfo = getUserInfo;

  // You can't send requests to your own window, so we make these available to call explicitly.
  this.msgHandlerGetNoteByKeyAndClear = msgHandlerGetNoteByKeyAndClear;
  this.setBadge = setBadge;

  // @TODO: Add all our required message handlers here as callable functions!
  this.msgHandlerIsAuthenticated = msgHandlerIsAuthenticated;
  this.msgHandlerLogin = msgHandlerLogin;
  this.msgHandlerClipFullPage = msgHandlerClipFullPage;
  this.msgHandlerClipSelection = msgHandlerClipSelection;
  this.msgHandlerClipArticle = msgHandlerClipArticle;
  this.msgHandlerClipUrl = msgHandlerClipUrl;
  this.msgHandlerClipPdf = msgHandlerClipPdf;
  this.msgHandlerLogout = msgHandlerLogout;
  this.msgHandlerLogoutWebClient = msgHandlerLogoutWebClient;
  this.msgHandlerOpenTab = msgHandlerOpenTab;
  this.msgHandlerJsonRpcInit = msgHandlerJsonRpcInit;
  this.msgHandlerSetLastNotebook = msgHandlerSetLastNotebook;
  this.msgHandlerGetWritableLinkedNotebooks = msgHandlerGetWritableLinkedNotebooks;
  this.msgHandlerRequestBizNotebooks = msgHandlerRequestBizNotebooks;
  this.getBizNotebookByGuid = getBizNotebookByGuid;
  this.getLinkedNotebookGuidOfBizNotebook = getLinkedNotebookGuidOfBizNotebook;
  this.msgHandlerRestart = msgHandlerRestart;
  this.msgHandlerRecordActivity = msgHandlerRecordActivity;

  Object.preventExtensions(this);
}

Object.preventExtensions(Extension);

// Loaded by background.html
var extension = new Extension();
extension.start();

