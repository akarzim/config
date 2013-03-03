
function Popup() {
  "use strict";

  var now;
  var started;
  var finishedLoading;
  var loginCheckTimeout;
  var loginPending;
  var username;
  var authenticationToken, bizAuthenticationToken;
  var displayName;
  var clipView;
  var bootstrapInfo;
  var notebookLoadingInterval;
  var smartFilingInfo;
  var userSelectedNotebook;
  var userSelectedTags;
  var startedSmartFilingRequest;
  var defaultNB;
  var relatedNotes;
  var persSmartFilingInfo, bizSmartFilingInfo;
  var containingNotebooks = {};
  var loggedInUsers;
  var jsonRpc, bizRpc;
  var extensionPort;
  var tagControl;
  var uniqueUsernameCheckPending;
  var validateCaptchaTimeout;
  var persTagsRequested = false;
  var bizTagsRequested = false;

  // ************* These variables don't reset just because we switch accounts. ************************************

  var background = Browser.extension.getBackgroundPage().extension;
  var pageInfo; // This contains some of the state of the page we're clipping.
  var tab = null; // The tab object for which this popup is running (the one we'd be clipping from).

  // Lookup for the errors we can get back from our login call.
  var loginErrorMessageMap = {
    "UNKNOWN": ["EDAMError_1"],
    "DATA_REQUIRED": ["loginForm_usernameError_8"],
    "INVALID_AUTH": ["loginForm_usernameError_8"],
    "HTTP/503": ["Error_HTTP_Transport", ['503']],
    "NETWORK": ["Error_Network_Unavailable"],
    "TOO_MANY_FAILURES": ["EDAMError_3_User_tooManyFailuresTryAgainLater"],
    "TIMEOUT": ["popup_loginCheckTimeout"],
    "ACCOUNT_DEACTIVATED": ["EDAMError_3_User_active"]
  };

  var specialLoginErrorMessageMap = {
    "PASSWORD_REQUIRED": ["loginForm_passwordError_5"],
    "USERNAME_REQUIRED": ["loginForm_usernameError_5"],
    "INVALID_USERNAME": ["loginForm_usernameInvalidError"],
    "INVALID_PASSWORD": ["loginForm_passwordInvalidError"]
  };

  var limits = {
    TITLE_MAX_LEN: 200
  };

  // Sbuset of all "reset" functionality that should run after a new user logs in.
  function loginReset() {
    smartFilingInfo = null;
    userSelectedNotebook = false;
    startedSmartFilingRequest = false;
    persTagsRequested = false;
    bizTagsRequested = false;

    // default notebook guid as returned from our notebook lookup.
    defaultNB = null;

    // List of guids of related notes, if we have it.
    relatedNotes = null;
    persSmartFilingInfo = null;
    bizSmartFilingInfo = null;
    containingNotebooks = {};
    document.querySelector("#notebookControl").innerHTML = "";
    setNotebookTypeIcon(null);
    document.querySelector("#userSwitcher").className = "hidden";
    document.querySelector("#switcherContainer").className = "";
    document.querySelector("#password").value = "";

    userSelectedTags = false;
    if (tagControl) {
      userSelectedTags = tagControl.userInteracted();
      tagControl.setDisabled(false);
    }

    // This only gets reset if the user hasn't changed it.
    if (!tagControl || !tagControl.userInteracted()) {
      tagControl = new TagEntryBox();

      tagControl.setTabIndex(9);
      document.querySelector("#tagControlContainer").innerHTML = "";
      document.querySelector("#tagControlContainer").appendChild(tagControl);
    }

    // Unset smart filing style for notebooks.
    var nbc = document.querySelector("#notebookControl");
    if (nbc) nbc.className = nbc.className.replace(/(^|\s+)notebookSelectSmartSelection(\s+|$)/, " ");
  }

  // Reset EVERYTHING.
  function reset() {

    loginReset();

    // Once our startup function has been called, this will bw set to true to avoid duplicate startup.
    started = false;
    
    // Set to true once the page has finished loading so we can ignore further info about it.
    finishedLoading = false;

    // We set this to false while we're checking logins and set it to true when we get back a result, this lets us
    // throw an error if checking a login takes too long.
    loginCheckTimeout;

    // Id of a setTimeout() call while we're waiting for a login request to come back.
    loginPending = 0;

    // The username for the currently logged-in/logging-in user, and his auth token.
    username = null;

    // True when we're looking at the "clip" UI.
    clipView = false;

    authenticationToken = null;
    bizAuthenticationToken = null;
    displayName = null;
    extensionPort = null;
    bootstrapInfo = new BootstrapInfo();
    notebookLoadingInterval = null;
    loggedInUsers = [];
  }

  // Localize the page. We have to do this before we add event handlers as at least one of the handlers is attached to
  // an element that shows up as part of localization (.newFeatureOptionsPseudoLink).
  GlobalUtils.localize(document.body);

  // Register event handlers.
  document.querySelector("#loginControl").addEventListener("click", login);
  document.querySelector("form[name=loginForm]").addEventListener("keyup", loginFromKeyboard);
  document.querySelector("select#clipAction").addEventListener("change", updatePreview);
  document.querySelector("select#notebookControl").addEventListener("change", updateNotebookControl);
  document.querySelector("#username").addEventListener("keyup", storeUsername);
  document.querySelector("#username").addEventListener("blur", storeUsername);
  document.querySelector("#clipSubmitControl").addEventListener("click", submitNote);
  document.querySelector("#logoImg").addEventListener("click", openWebClient);
  document.querySelector("#headerRegister").addEventListener("click", getRegistrationLinks);
  document.querySelector("#useSearchHelper").addEventListener("click", setSearchHelper);
  document.querySelector("body").addEventListener("keyup", nudge);
  document.querySelector("body").addEventListener("keyup", checkSubmit);
  document.querySelector("div.newFeatureOverlay").addEventListener("click", disableNewFeatureOverlay);
  document.querySelector(".newFeatureOptionsPseudoLink").addEventListener("click", openOptionsPage);
  document.querySelector("#safariOptionsLink").addEventListener("click", openOptionsPage);
  document.querySelector("#switchText").addEventListener("click", switchService);
  document.querySelector("#searchHelperIcon").addEventListener("click", toggleSearchInfo);
  document.querySelector("#searchHelperDescription").addEventListener("click", toggleSearchInfo);
  document.querySelector("#currentUser").addEventListener("click", toggleSwitchUser);
  document.querySelector("#cancelSwitchControl").addEventListener("click", cancelSwitchUser);
  document.querySelector("#oldFreeLogin").addEventListener("click", keepOldFree);
  document.querySelector("#newFreeLogin").addEventListener("click", keepNewFree);
  document.querySelector("#registerControl").addEventListener("click", submitRegistration);
  document.querySelector("#headerLogin").addEventListener("click", cancelRegistration);
  document.querySelector("#cancelRegisterControl").addEventListener("click", cancelRegistration);
  document.querySelector("#registrationForm").addEventListener("keyup", registerFromKeyboard);
  document.querySelector("#registrationView").addEventListener("click", setClickHandlerForLinks);
  // The following validations are delayed 200ms because if the user decides to cancel registration in the middle of
  // filling out the form, clicking on the Cancel button takes the focus away from the textbox and trigger an error
  // message from the validation, which causes the form to suddenly expand and the Cancel button jumps away from the
  // cursor.
  document.querySelector("#regEmail").addEventListener("blur", function() { setTimeout(testEmailUniqueness, 300) });
  document.querySelector("#regEmail").addEventListener("focus", function() { clearError("regEmail") });
  document.querySelector("#regUsername").addEventListener("keyup", testUsernameUniquenessTimeout);
  document.querySelector("#regUsername").addEventListener("blur", function() {setTimeout(testUsernameUniqueness, 300)});
  document.querySelector("#regUsername").addEventListener("focus", function() { clearError("regUsername") });
  document.querySelector("#regPassword").addEventListener("blur", function() { setTimeout(validatePassword, 300) });
  document.querySelector("#regPassword").addEventListener("focus", function() { clearError("regPassword") });
  document.querySelector("#regCaptcha").addEventListener("blur", function() { validateCaptchaTimeout = setTimeout(validateCaptcha, 300) });
  document.querySelector("#regCaptcha").addEventListener("focus", function() { clearError("regCaptcha") });
  window.addEventListener("click", closeSwitchUser);

  var mac = navigator.userAgent.match(/Mac OS X/);
  if (mac) {
    Browser.addKeyboardHandlers({
      // cmd + ctrl + a, for user switching.
      "17 + 65 + 91": keyboardUserSwitch
    });
  }
  else {
    Browser.addKeyboardHandlers({
      // ctrl + alt + a, for user switching.
      "17 + 18 + 65": keyboardUserSwitch
    });
  }

  function keyboardUserSwitch(evt) {
    if (document.querySelector("#switchFreeView").className == "view"
        && document.querySelector("#registrationView").className == "view") {
      if (document.querySelector("#registrationView").className == "")
        document.querySelector("#registrationView").className = "view";
      if (loggedInUsers && loggedInUsers.length > 1) {
        for (var i = 0; i < loggedInUsers.length; i++) {
          if (loggedInUsers[i] == displayName) {
            if (loggedInUsers.length - 1 == i) {
              switchUser(loggedInUsers[0]);
            }
            else {
              switchUser(loggedInUsers[i+1]);
            }
            return;
          }
        }
      }
    }
  }

  if (SAFARI) {
    // Capturing keydown events and preventing the default behavior keeps Safari from playing the system "beep" sound
    // that you get when you hit end-of-line while typing when you try and 'nudge' the article.
    document.querySelector("body").addEventListener("keydown", function(evt){

      // Allow default behavior in form elements.
      if (evt && evt.srcElement && evt.srcElement.nodeName) {
        var srcNodeName = evt.srcElement.nodeName.toLowerCase();
        if (srcNodeName == "input" || srcNodeName == "textarea") {
          return;
        }
      }

      // We only want to trap the keys for which we have specified our own behavior. Specidfically we want to make sure
      // the ESC key works to dismiss the popover.
      if (evt.keyCode && 
        ((evt.keyCode >=37 && evt.keyCode <= 40) || // Arrow keys.
        (evt.keyCode == 13)) // enter key.
      ) {
        evt.preventDefault();
      }
    }, true);

    // This is non-resizable in Safari because the resizing of the window doesn't keep up.
    document.querySelector("textarea[name=\"comment\"]").className = "safari";
  }

  // We used to handle this with CSS that would just use the "focus" pseudoclass, but the problem with that was the
  // most common way for this element to lose focus is for the user to click the "clip" button. The way the browser
  // handles the focus loss is to recompute the CSS for the page, which discards the height element below, and resizes
  // the element, *before* it computes the element that's receiving the "click" event. This means that the comment
  // field resizes, which moves the "clip" button out from under the mouse cursor, which means the note doesn't get
  // clipped.
  // We added the 50ms delay to the blur resizing so that the click handler for the button gets called before we resize
  // the comment field, and rthen everything works as expected.
  document.querySelector("textarea[name=comment]").addEventListener("focus", function(){
    this.style.height = "44px";
  });

  /* Second change: a 50ms delay doesn't reliably fire late enough to get our button click to work. We simply don't
   * contract this block on blur for the time being.
  document.querySelector("textarea[name=comment]").addEventListener("blur", function(e){
    var self = this;
    setTimeout(function(){
      self.style.height = null;
    }, 50);
  });
  */

  function checkSubmit(evt) {
    
    var ignoreTypes = ["input", "textarea", "a", "select"];

    if (!evt) return;
    if (!evt.srcElement) return;
    if (!evt.keyCode) return;
    if (clipView) {
      if (evt.keyCode == 13) {
        if (ignoreTypes.indexOf(evt.srcElement.nodeName.toLowerCase()) == -1) {
          submitNote();
        }
      }
    }
  }

  function toggleSearchInfo() {
    var desc = document.querySelector("#searchHelperDescription");
    if (desc.style.display == "block") {
      desc.style.display = "none";
    }
    else {
      desc.style.display = "block";
    }
  }

  function closeSwitchUser(evt) {
    var el = document.querySelector("#userSwitcher");
    if (el && el.className == "visible") {
      if (evt && evt.srcElement) {
        var current = evt.srcElement;
        while (current) {
          if (current.id == "switcherContainer") {
            return; 
          }
          current = current.parentNode;
        }
      }
      toggleSwitchUser();
    }
  }

  function openAccountSettings() {
    var url = background.getOption("secureProto") + bootstrapInfo.get("serviceHost") + "/Settings.action";
    background.msgHandlerOpenTab({url:url}, null, dismissPopup);
  }

  function openOptionsPage() {
    var url = Browser.extension.getURL("options.html");
    background.msgHandlerOpenTab({url:url}, null, dismissPopup);
  }

  function disableNewFeatureOverlay() {
    document.querySelector(".newFeatureOverlay").style.display = "none";
    try {
      Persistent.set("suppressSmartFilingDiscoveryNotice", true);
    }
    catch(err) {
      log.warn("Couldn't save setting to " + suppressSmartFilingDiscoveryNotice + ": " + err);
    }
  }

  function nudge(evt) {
    // We won't do anything unless we're pretty sure we're correct.
    if (!evt) return;
    if (!evt.srcElement) return;
    if (!evt.keyCode) return;
    if (background.getOption("selectionNudging") == "DISABLED") return;

    var clipAction = document.querySelector("#clipAction");
    if (clipAction.options[clipAction.selectedIndex].value !== "CLIP_ACTION_ARTICLE") {
      // We only allow this for "article" selections.
      return;
    }
    
    var skipTypes = ["input", "select", "textarea"];
    for (var i = 0; i < skipTypes.length; i++) {
      if (evt.srcElement.nodeName.toLowerCase() == skipTypes[i]) {
        return;
      }
    }

    var key = evt.keyCode;
    // Note: the keys in here are all coerced to strings!
    var keyMap = {
      37: "left",
      38: "up",
      39: "right",
      40: "down"
    }

    if (keyMap[key]) {
      Browser.sendToTab(tab, {name: "preview_nudge", args: {direction: keyMap[key]}});
    }
  }

  function buildNote() {
    var note = {};
    if (pageInfo && pageInfo.favIconUrl) {
      note.favIconUrl = pageInfo.favIconUrl;
    }
    var title = document.querySelector("#clipView input[name=title]").value;
    if (title) note.title = title.trim();
    if (!note.title) note.title = Browser.i18n.getMessage("quickNote_untitledNote");
    var comment = document.querySelector("textarea[name=comment]").value.trim();
    if (comment) note.comment = comment;
    var notebookControl = document.querySelector("select#notebookControl");

    // We won't bother trying to set a notebook if we haven't gotten any back from the server. In this case the
    // submitter will pick a notebook (which should be the last used notebook or the user's default.
    if (notebookControl.selectedIndex !== -1) {
      // If the first notebook is shared, then we haven't received the user's notebook list yet, and have only received
      // his shared notebooks. This means that the selectedIndex will be wrong, and we will act as if the list was
      // empty, letting the submitter pick a notebook.
      if (!notebookControl.options[0].value.match(/^shared_/)) {
        var notebookGuid = notebookControl.options[notebookControl.selectedIndex].value;
        if (notebookGuid) note.notebookGuid = notebookGuid;
      }
    }
    var tagNames = tagControl.getSelectedTags();
    if (tagNames.length) {
      note.tagNames = tagNames;
    }
    if (relatedNotes) {
      note.relatedNotes = relatedNotes;
    }
    if (pageInfo && pageInfo.pdf) {
      note.pdf = pageInfo.pdf
    }
    return note;
  }

  function replaceElement(oldEl, newEl) {
    newEl.parentNode.removeChild(newEl);
    oldEl.parentNode.insertBefore(newEl, oldEl);
    oldEl.parentNode.removeChild(oldEl);
    newEl.style.display = "block";
  }

  function submitNote() {
    var note = buildNote();
    var clipTypeControl = document.querySelector("select#clipAction");
    var clipType = clipTypeControl.options[clipTypeControl.selectedIndex].value;
    var msg = {attrs: note, tab: tab};

    switch(clipType) {
      case "CLIP_ACTION_FULL_PAGE":
        background.msgHandlerClipFullPage(msg, null, dismissPopup);
        break;
      case "CLIP_ACTION_SELECTION":
        background.msgHandlerClipSelection(msg, null, dismissPopup);
        break;
      case "CLIP_ACTION_ARTICLE":
        background.msgHandlerClipArticle(msg, null, dismissPopup);
        break;
      case "CLIP_ACTION_URL":
        background.msgHandlerClipUrl(msg, null, dismissPopup);
        break;
      case "CLIP_ACTION_PDF":
        background.msgHandlerClipPdf(msg, null, dismissPopup);
        break;
    }
  }

  function setSearchHelper() {
    background.setOption("useSearchHelper", this.checked);
  }

  function openWebClient() {
    var url = background.getOption("secureProto") + bootstrapInfo.get("serviceHost") + "/Home.action";
    background.msgHandlerOpenTab({name: "main_openTab", url: url}, null, dismissPopup);
  }

  function openPasswordChangePage() {
    // need to logout of web client in the case of user switching. otherwise the
    // second user will be directed to the first user's password change page.
    // but don't log out the user in the clipper.
    background.msgHandlerLogoutWebClient(function() {
      var url = background.getOption("secureProto") + bootstrapInfo.get("serviceHost")
        + "/Login.action?username=" + encodeURIComponent(username)
        + "&targetUrl=%2FChangePassword.action%3Fv1%3Dtrue";
      background.msgHandlerOpenTab({name: "main_openTab", url: url}, null, dismissPopup);
    });
  }

  function dismissPopup() {
    if (SAFARI) {
      safariClear();
      var popover = safari.extension.popovers["clipper"]; // Safari 6.
      if (!popover) popover = safari.extension.popovers[0]; // Safari 5.1.
      popover.hide();
    }
    else {
      // Work around for window.close() being unreliable. From here:
      // http://stackoverflow.com/questions/3950981/closing-popup-window-created-by-google-chrome-extension
      if (extensionPort) {
        extensionPort.disconnect();
        extensionPort = null;
      }
      chrome.tabs.getSelected(null, function(tab) {
        chrome.tabs.update(tab.id, { selected: true } )
      });
    }
  }

  function storeUsername() {
    if (typeof this.value !== "undefined") {
      Persistent.set("popup_savedUsername", this.value);
    }
  }

  // Keyboard event handler for the login form.
  function loginFromKeyboard(evt) {
    if (evt && evt.keyCode && evt.keyCode == 13) {
      // Only handles username and password fields. Otherwise, the the default form handling will get it.
      if (evt.srcElement.id == "username" || evt.srcElement.id == "password") {
        login();
      }
    }
  }

  // Keyboard event handler for the registration form
  function registerFromKeyboard(evt) {
    if (evt && evt.keyCode && evt.keyCode == 13) {
      var fieldIds = Array.prototype.slice.
        call(document.querySelectorAll("#registrationForm input:not([type=button])")).
        map(function(field) {return field.id});
      if (fieldIds.indexOf(evt.srcElement.id) > -1) {
        submitRegistration();
      }
    }
  }

  Browser.addMessageHandlers({
    popup_pageInfoReadyToGo: start,
    popup_dismiss: dismissPopup,
    popup_receivePageInfo: msgHandlerReceivePageInfo
  });

  // funs when the 'login' button is clicked.
  function login() {

    // We don't want to duplicate our login requests.
    if (loginPending) {
      return;
    }

    clearAllErrors();
    username = document.getElementById("username").value;
    var password = document.getElementById("password").value;
    var remember = document.querySelector("#rememberMe").checked;
    var request = {
      username: username,
      password: password,
      remember: remember
    };
    background.setOption("useSearchHelper", document.querySelector("#useSearchHelper").checked);
    background.msgHandlerLogin({data:request}, null, responseHandlerLogin);

    // Show some activity UI if login takes a while. We don't want flickery graphics if it's fast though, so we wait
    // half a second before displaying this.
    loginPending = setTimeout(function() {
      hideView("login");
      showWaiting(Browser.i18n.getMessage("loggingIn"));
    }, 500);
  }

  // Looks up the old free user when two free users have been logged in.
  function getInactiveFreeUser() {
    for (var i = 0; i < loggedInUsers.length; i++) {
      if (userType(loggedInUsers[i]) == "FREE" && loggedInUsers[i] != displayName) {
        return loggedInUsers[i];
      }
    }
    return "";
  }

  function keepOldFree() {
    var u = getInactiveFreeUser();
    function callback() {
      switchUser(u);
    }
    // We skip the POST to the web client here because we'll immediately send a new login message for the old account
    // that will override the old login credentials anyway.
    background.msgHandlerLogout({doPost: false}, null, callback);
  }

  function keepNewFree() {
    var u = displayName;
    function callback() {
      switchUser(u);
    }
    // We skip the POST to the web client on this logout, because it will actually log out the new free user, as the
    // web client doesn't support user switching yet.
    background.msgHandlerLogout({user: getInactiveFreeUser(), doPost: false}, null, callback);
  }

  function showSwitchFree() {
    hideView("clip");
    hideView("login");
    hideView("waiting");
    document.querySelector("#freeAccountLimit").innerHTML = 
      Browser.i18n.getMessage("freeAccountLimit", getInactiveFreeUser());
    document.querySelector("#newFreeLogin").innerText = Browser.i18n.getMessage("switchFreeAccount", displayName);
    document.querySelector("#switchFreeView").className = "";
  }

  function handleLoginSuccess() {
    loggedInUsers = background.getLoggedInUserNames();

    var freeCount = 0;
    for (var i = 0; i < loggedInUsers.length; i++) {
      if (userType(loggedInUsers[i]) == "FREE") {
        freeCount++;
      }
    }

    clearAllErrors();
    hideView("login");

    // Unfocus the now hidden login form so the user can't keep submitting it with the enter key.
    try {
      document.activeElement.blur();
    }
    catch (e) {
      // No active element or similar.
    }

    if (freeCount > 1) {
      showSwitchFree();
      return;
    }

    loginReset();
    initJsonRpc(); // Reset for new user.
    JsonQueue.initShard(/^"?S=([^:]+)/.exec(authenticationToken)[1]);
    jsonRpc.initWithAuthToken(authenticationToken, function() {
      if (bizAuthenticationToken) {
        JsonQueue.initShard(/^"?S=([^:]+)/.exec(bizAuthenticationToken)[1]);
        bizRpc.initWithAuthToken(bizAuthenticationToken, completeStartup);
      }
      else {
        completeStartup();
      }
    });
  }

  function responseHandlerLogin(response) {
    if (loginPending) {
      clearTimeout(loginPending);
      loginPending = 0;
    }
    if (response.displayName) {
      displayName = response.displayName;
    }
    if (response.authenticationToken) {
      authenticationToken = response.authenticationToken;
      bizAuthenticationToken = null; // need to reset when you're switching from business user to non-business user
      if (response.bizAuthenticationToken) {
        bizAuthenticationToken = response.bizAuthenticationToken;
        if (!Persistent.get(response.displayName + "_turnedOffSearchHelper")) {
          background.setOption("useSearchHelper", true);
        }
      }
      handleLoginSuccess();
      return;
    }

    // Login error handling.
    var error = null;
    if (response.error) {
      error = response.error;
    }

    // Turn the login screen back on in case it was turned off to show our activity/waiting UI.
    showLogin();

    // Special login errors:
    if (specialLoginErrorMessageMap[error]) {
      clearAllErrors();
      if (error.match(/USERNAME/)) {
        // Special China error for this message, as it will only show for chinese users.
        if (error == "INVALID_USERNAME" && bootstrapInfo.getName().match(/china/i))
          setError("username", "loginForm_usernameInvalidChinaError");
        else
          setError("username", specialLoginErrorMessageMap[error][0]);
      }
      else if (error.match(/PASSWORD/))
        setError("password", specialLoginErrorMessageMap[error][0]);

      return;
    }

    // special error for when we changed auth tokens
    if (error == "EXPIRED_PASSWORD") {
      if (/^en/i.test(navigator.language)) {
        showGlobalError("Your password has expired. Please reset it now. <input id='resetPassword' type='button' value='OK'/>", null, true);
      } else {
        showGlobalError("Password update needed. <input id='resetPassword' type='button' value='OK'/>", null, true);
      }
      document.querySelector("#resetPassword").addEventListener("click", openPasswordChangePage);
      return;
    }

    // Other errors.
    var messageKey = loginErrorMessageMap["UNKNOWN"];
    var messageParams = null;
    if (loginErrorMessageMap[error]) {
      messageKey = loginErrorMessageMap[error][0];
      if (loginErrorMessageMap[error][1]) {
        messageParams = loginErrorMessageMap[error][1];
      }
    }
    else {
      log.error("Got error " + error + ", but no message to show.");
    }

    if (messageParams) {
      showGlobalError(messageKey, messageParams);
    }
    else {
      showGlobalError(messageKey);
    }
  }

  function logout(evt) {
    doLogout(false);
  }

  function logoutAll(evt) {
    doLogout(true);
  }

  function doLogout(all) {
    hideView("waiting");
    hideView("clip");
    hideView("login");
    var msg = {};
    if (all) {
      msg.all = true;
    }
    background.msgHandlerLogout(msg);
    if (loggedInUsers && loggedInUsers.length > 1 && !all) {
      reset();
      init();
    }
    else {
      setTimeout(dismissPopup, 250);
    }
  }

  function showGlobalError(messageKey, substitutions, haveString) {
    hideView("waiting");
    var message;
    if (substitutions) message = Browser.i18n.getMessage(messageKey, substitutions);
    else message = Browser.i18n.getMessage(messageKey);
    if (!message) {
      if (haveString) {
        message = messageKey;
      } else {
        message = "UNKNOWN ERROR";
      }
    }
    var messageControl = document.querySelector("#globalErrorMessage");
    messageControl.innerHTML = message;
    messageControl.style.display = "block";
  }

  function clearAllErrors() {
    var messageControl = document.querySelector("#globalErrorMessage");
    messageControl.textContent = "";
    messageControl.style.display = "none";

    // Also clears login errors.
    clearError("username");
    clearError("password");
    // and registration errors
    clearError("regEmail");
    clearError("regUsername");
    clearError("regPassword");
    clearError("regCaptcha");
  }

  function clearRegFields() {
    var textboxes = document.querySelectorAll("#registrationForm input:not([type=button])");
    for (var i = 0; i < textboxes.length; i++) {
      textboxes[i].value = "";
    }
  }

  function setLogo() {
    var logo = document.querySelector("#logoImg");
    if (bootstrapInfo.getName().match(/china/i)) {
      logo.src = "images/web-clipper-logo-china.png";
      if (devicePixelRatio >= 2) logo.src = "images/web-clipper-logo-china@2x.png" 
      logo.width = "91";
      logo.height = "45";
    }
    else {
      logo.src = "images/web-clipper-logo.png";
      if (devicePixelRatio >= 2) logo.src = "images/web-clipper-logo@2x.png" 
      logo.width = "191";
      logo.height = "36";
    }
  }

  function switchService() {
    if (bootstrapInfo.getLength() > 1) {
      var idx = bootstrapInfo.getIndex();
      idx = (idx + 1) % 2; // @TODO: If we ever support more than two services, this will need to change.
      bootstrapInfo.setIndex(idx);
    }
    initJsonRpc(); // We need a new one of these with new URLs.
    showLogin();
  }

  function showLogin() {
    // Because this function can get called as a result of a bootstrap call or switching services.
    bootstrapInfo = new BootstrapInfo();
    setLogo();
    hideView("waiting");
    hideView("clip");
    hideView("switchFree");
    hideView("registration");

    document.querySelector("#cancelSwitchControl").value = "";
    if (loggedInUsers && loggedInUsers.length) {
      document.querySelector("#cancelSwitchControl").value = Browser.i18n.getMessage("cancelAddAnotherAccount");
      document.querySelector("#cancelSwitchControl").style.display = "";

      var free = false;
      for (var i = 0; i < loggedInUsers.length; i++) {
        if (userType(loggedInUsers[i]) == "FREE") {
          free = true;
          break;
        }
      }
      var msg;
      if (free) {
        msg = Browser.i18n.getMessage("switchPremiumMessage");
      }
      else {
        msg = Browser.i18n.getMessage("switchAnyMessage");
      }
      document.querySelector("#loginSwitchMessageBlock").innerHTML = msg;
      document.querySelector("#loginSwitchMessageBlock").style.display = "block";
    }
    else {
      document.querySelector("#cancelSwitchControl").style.display = "none";
      document.querySelector("#loginSwitchMessageBlock").style.display = "none";
    }

    if (bootstrapInfo.getLength() > 1) {
      var text = document.querySelector("#switchText");
      if (text.firstChild && text.firstChild.nodeType == Node.TEXT_NODE) {
        text.removeChild(text.firstChild);
      }
      var img = document.querySelector("#switchImg");
      if (bootstrapInfo.getName().match(/china/i)) {
        // String here is hardcoded on purpose.
        text.insertBefore(document.createTextNode("Evernote International\u7528\u6237"), img);
      }
      else {
        // String here is hardcoded on purpose.
        text.insertBefore(document.createTextNode("\u6211\u662F\u5370\u8C61\u7B14\u8BB0\u7528\u6237"), img);
      }
      document.querySelector("#switchService").style.display = "";
    }
    else {
      document.querySelector("#switchService").style.display = "none";
    }

    document.querySelector("#headerNoUser").style.display = "block";
    document.querySelector("#headerRegister").style.display = "";
    document.querySelector("#headerLogin").style.display = "none";
    document.querySelector("#loginView").className = "";
  }

  function hideView(view) {
    document.querySelector("#" + view + "View").className = "view";
    if (view == "login" || view == "registration") {
      document.querySelector("#headerNoUser").style.display = "none";
    }
    else if (view == "clip") {
      clipView = false;
      document.querySelector("#headerUser").style.display = "none";
    }
  }

  function toggleSwitchUser() {
    var switcher = document.querySelector("#switcherContainer");
    var us = document.querySelector("#userSwitcher");
    if (switcher.className == "switcherVisible") {
      switcher.className = "";
      us.className = "hidden";
    }
    else {
      switcher.className = "switcherVisible";
      us.className = "visible";
    }
  }

  function switchUser(evt) {
    var user = "";
    if (this && this.dataset && this.dataset.username) {
      user = this.dataset.username;
    }
    else if (typeof evt == "string") {
      user = evt;
    }
    if (user) {
      background.setCurrentUser(user);
      closeSwitchUser();
      reset();
      init();
    }
  }

  function addAccount(evt) {
    closeSwitchUser();
    document.querySelector("#username").value = "";
    document.querySelector("#password").value = "";
    showLogin();
  }

  function cancelSwitchUser(evt) {
    closeSwitchUser();
    reset();
    init();
  }

  function getUserNameList() {
    var ul = document.createElement("ul");
    var li = document.createElement("li");
    li.innerText = Browser.i18n.getMessage("addAnotherAccount");
    li.addEventListener("click", addAccount, true);
    ul.appendChild(li);

    for (var i = 0; i < loggedInUsers.length; i++) {
      if (loggedInUsers[i] == displayName) {
        continue;
      }
      li = document.createElement("li");
      li.innerText = Browser.i18n.getMessage("switchToAccount", [loggedInUsers[i]]);
      li.dataset.username = loggedInUsers[i];
      if (mac) {
        li.title = "Ctrl + Cmd + A";
      }
      else {
        li.title = "Ctrl + Alt + A";
      }
      li.addEventListener("click", switchUser, true);
      ul.appendChild(li);
    }

    li = document.createElement("li");
    li.innerText = " ";
    li.className = "divider";
    ul.appendChild(li);

    li = document.createElement("li");
    li.innerText = Browser.i18n.getMessage("signOutAccount", [displayName]);
    li.addEventListener("click", logout, true);
    li.className = "bottom";
    ul.appendChild(li);

    if (loggedInUsers.length > 1) {
      li = document.createElement("li");
      li.innerText = Browser.i18n.getMessage("signOutAll");
      li.addEventListener("click", logoutAll, true);
      li.className = "bottom";
      ul.appendChild(li);
    }

    return ul;
  }

  function userType(_username) {
    var userInfo = background.getUserInfo(_username);
    if (!userInfo || !userInfo.premiumInfo) {
      return "FREE";
    }
    if (userInfo.premiumInfo.businessId) {
      return "BUSINESS";
    }
    if (userInfo.premiumInfo.premium) {
      return "PREMIUM";
    }
    return "FREE";
  }

  function showClip() {
    var uType = userType(displayName);
    var iconEl = document.querySelector("#acctIcon");
    if(uType == "PREMIUM" || uType == "BUSINESS") {
      iconEl.src = "images/user-icon-premium.png";
    }
    else {
      iconEl.src = "images/user-icon-free.png";
    }
    if (devicePixelRatio >= 2) iconEl.src =  iconEl.src.replace(/(\.png)$/, "@2x$1");

    document.querySelector("#password").value = "";
    document.querySelector("#userSwitcher").innerHTML = "";
    document.querySelector("#userSwitcher").appendChild(getUserNameList());
    document.querySelector("#currentUsername").innerHTML = displayName;

    clipView = true;
    hideView("waiting");
    hideView("login");
    hideView("switchFree");
    document.querySelector("#headerUser").style.display = "block";
    document.querySelector("#clipView").className = "";
    
    if (tab.title && (tab.title != tab.url)) {
      var titleField = document.querySelector("#clipView input[name=title]");
      // Don't update the title if it's already set.
      if (titleField && !titleField.value) {
        titleField.value = truncate(tab.title, limits.TITLE_MAX_LEN);
      }
    }
  }

  function showWaiting(message) {
    hideView("login");
    hideView("clip");
    hideView("switchFree");
    if (message) {
      document.querySelector("#waitingText").textContent = message;
    }
    else {
      document.querySelector("#waitingText").textContent = Browser.i18n.getMessage("popup_waiting");
    }
    document.querySelector("#waitingView").className = "";
  }

  function start(request, sender, sendResponse) {
    // We'll only start up once.
    if (started) return;

    // This is the failure case where we hit our timeout waiting on the page.
    if (!request) {
      started = true;
      hideView("login");
      hideView("clip");
      hideView("waiting");
      showGlobalError("popup_couldntStart");
      return;
    }

    // If we already have pageInfo, we've already done all this.
    if (!pageInfo && !request.nonAdobe) {
      // We need at least one of these to verify we're hearing from the correct tab.
      if (!request.tabId && !request.url) {
        return;
      }

      // Tab ID is more reliable, so we want to check that.
      if (request.tabId && request.tabId !== tab.id) {
        return;
      }

      // But we can't always get that, so we'll also try a URL.
      if (request.url && request.url !== tab.url) {
        return;
      }
    }

    // We've got our failures out of the way, let's see if the user's logged in.
    checkLogin();
    started = true;
  }

  function completeStartup() {
    // Get page info.
    Browser.sendToTab(tab, {name: "getInfo"});
  }

  function populateBizNotebooks() {
    var cache = Persistent.get("userCache");
    if (cache && cache[username] && cache[username]["bizNotebooks"]) {
      initializeBizNotebooks(cache[username]["bizNotebooks"].list);
    }

    background.msgHandlerRequestBizNotebooks({rpc: bizRpc, auth: bizAuthenticationToken}, null,
      populateBizNotebooksFromNetwork);
  }

  function populateBizNotebooksFromNetwork(response) {
    // See if this matches our cached notebooks.
    var changed = false;
    var nb = response.list;
    // sort notebooks in alphabetical order
    nb.sort(function(a,b) { return a.name.toLowerCase() > b.name.toLowerCase(); });
    var cache = Persistent.get("userCache");
    if (cache && cache[username] && cache[username]["bizNotebooks"]) {
      var cached = cache[username]["bizNotebooks"];
      if (cached.list.length == nb.length) {
        for (var i = 0; i < cached.list.length; i++) {
          if ((cached.list[i].guid !== nb[i].guid) || (cached.list[i].name !== nb[i].name)
              || (cached.list[i].restrictions.noCreateNotes !== nb[i].restrictions.noCreateNotes)) {
            changed = true;
            break;
          }
        }
      }
      else {
        changed = true;
      }
    }
    else {
      changed = true;
    }
    // If nothing's changed, we're done.
    if (!changed) return;

    // Update our cached values.
    if (!cache) cache = {};
    if (!cache[username]) cache[username] = {};
    cache[username]["bizNotebooks"] = response;
    Persistent.set("userCache", cache);

    var select = document.querySelector("#notebookControl");
    var biz = document.querySelector("optgroup[type='biz']");
    if (biz) {
      // Get our currently selected notebook.
      var savedOption;
      if (select.selectedIndex > -1 && select[select.selectedIndex].value.match(/^biz_/)) {
        savedOption = select[select.selectedIndex].value;
      }
      select.removeChild(biz);
      initializeBizNotebooks(nb);
      // reselect previously selected option
      if (savedOption && userSelectedNotebook) {
        biz = document.querySelector("optgroup[type='biz']");
        var bnb = biz.querySelectorAll("option");
        for (var i = 0; i < bnb.length; i++) {
          if (bnb[i].value === savedOption) {
            bnb[i].selected = true;
            break;
          }
        }
      }
    }
    else {
      initializeBizNotebooks(nb);
    }
  }

  function populateLinkedNotebooks() {
    var cache = Persistent.get("userCache");
    if (cache && cache[username] && cache[username]["linkedNotebooks"]) {
      initializeLinkedNotebooks(cache[username]["linkedNotebooks"]);
    }
    // The background page needs to be notified that it can initialize (or reinitialize) its RPC object with new auth.
    // When that's done, we can request our linked notebooks from it.
    background.msgHandlerJsonRpcInit({name: "main_JsonRpcInit"}, {tab: tab}, requestLinkedNotebooks);
  }

  function populateTags() {
    var cache = Persistent.get("userCache");
    if (cache && cache[username] && cache[username]["tags"]) {
      tagControl.setAutoCompleteList(cache[username]["tags"]);
    }
    var requestingUser = username;
    function populateTagsFromNetworkWithUsername(data, error) {
      populateTagsFromNetwork(requestingUser, data, error);
    }
    if (!persTagsRequested) {
      jsonRpc.client.NoteStore.listTags(populateTagsFromNetworkWithUsername, authenticationToken);
      persTagsRequested = true;
    }
  }

  function populateTagsFromNetwork(fromUser, data, error) {
    if (error) {
      log.warn("Error retrieving tags: " + JSON.stringify(error));
    }

    if (data && data.list) {
      var tags = [];
      for (var i = 0; i < data.list.length; i++) {
        if (data.list[i].name) {
          tags.push(data.list[i].name);
        }
      }

      var cache = Persistent.get("userCache");
      if (!cache) cache = {};
      if (!cache[fromUser]) cache[fromUser] = {};
      cache[fromUser]["tags"] = tags;
      Persistent.set("userCache", cache);

      if (fromUser == username) {
        tagControl.setAutoCompleteList(tags);
      }
      else {
        console.warn("Got tag result for user " + fromUser + ", when current user is " + username);
      }
    }
  }

  function populateBizTags() {
    var cache = Persistent.get("userCache");
    if (cache && cache[username] && cache[username]["bizTags"]) {
      tagControl.setAutoCompleteList(cache[username]["bizTags"]);
    }
    var requestingUser = username;
    function populateTagsFromNetworkWithUsername(data, error) {
      populateBizTagsFromNetwork(requestingUser, data, error);
    }
    if (!bizTagsRequested) {
      bizRpc.client.NoteStore.listTags(populateTagsFromNetworkWithUsername, bizAuthenticationToken);
      bizTagsRequested = true;
    }
  }

  function populateBizTagsFromNetwork(fromUser, data, error) {
    if (error) {
      log.warn("Error retrieving business tags: " + JSON.stringify(error));
    }

    if (data && data.list) {
      var tags = [];
      for (var i = 0; i < data.list.length; i++) {
        if (data.list[i].name) {
          tags.push(data.list[i].name);
        }
      }

      var cache = Persistent.get("userCache");
      if (!cache) cache = {};
      if (!cache[fromUser]) cache[fromUser] = {};
      cache[fromUser]["bizTags"] = tags;
      Persistent.set("userCache", cache);

      if (fromUser == username) {
        tagControl.setAutoCompleteList(tags);
      }
      else {
        console.warn("Got tag result for user " + fromUser + ", when current user is " + username);
      }
    }
  }

  function updateNotebookControl() {
    userSelectedNotebook = true;
    var nbguid = this.options[this.selectedIndex].value;
    background.msgHandlerSetLastNotebook({name: "main_setLastNotebook", username: username, notebook: nbguid});
    this.className = this.className.replace(/ notebookSelectSmartSelection/, "");
    setNotebookTypeIcon(nbguid);
    this.blur();
    setTagsList(nbguid);
  }

  function setNotebookTypeIcon(notebookGuid) {
    if (/^shared_/.test(notebookGuid)) {
      document.querySelector("#multiplayerIcon").style.display = "inline-block";
      document.querySelector("#businessIcon").style.display = "none";
    }
    else if (/^biz_/.test(notebookGuid)) {
      document.querySelector("#businessIcon").style.display = "inline-block";
      document.querySelector("#multiplayerIcon").style.display = "none";
    }
    else {
      document.querySelector("#businessIcon").style.display = "none";
      document.querySelector("#multiplayerIcon").style.display = "none";
    }
  }

  function setTagsList(notebookGuid) {
    if (/^biz_/.test(notebookGuid)) {
      populateBizTags();
    }
    else {
      populateTags();
    }
  }

  function updatePreview() {
    if (typeof this.selectedIndex !== "undefined") {
      document.querySelector("#clipSubmitControl").value = this.options[this.selectedIndex].textContent;
      requestPreview(this.options[this.selectedIndex].value);
    }
    else {
      log.warn("Got update preview request from non-select element.");
    }
    // for some reason, the dropdown retains focus, so we need to explicitly unfocus it
    document.querySelector("#clipAction").blur();
  }

  function requestPreview(type) {
    // Chrome should probably change to match Safari here.
    var action;
    var args = {};
    switch(type) {
      case "CLIP_ACTION_ARTICLE": 
        action = "preview_article";
        args.showHelp = (background.getOption("selectionNudging") == "ENABLED");
        break;
      case "CLIP_ACTION_SELECTION": 
        action = "preview_selection";
        break;
      case "CLIP_ACTION_FULL_PAGE": 
        action = "preview_fullPage";
        break;
      case "CLIP_ACTION_URL": 
        action = "preview_url";
        break;
      case "CLIP_ACTION_PDF":
        action = "preview_fullPage";
        break;
    }

    Browser.sendToTab(tab, {name: action, args: args});

    // Select the appropriate option in our select box.
    var clipButton = document.querySelector("#clipSubmitControl");
    var opt = document.querySelector("select#clipAction option[value=" + type + "]");
    var sel = document.querySelector("select#clipAction");
    for (var i = 0; i < sel.options.length; i++) {
      if (sel.options[i] == opt) {
        sel.selectedIndex = i;
        clipButton.value = sel.options[i].textContent;
        break;
      }
    }
  }

  function setEnabledPreviewTypes() {
    var opt;
    opt = document.querySelector("select#clipAction option[value=CLIP_ACTION_ARTICLE]");
    if (opt) {
      if (pageInfo.article) opt.disabled = false;
      else opt.disabled = true;
      if (pageInfo.pdf) opt.disabled = true;
    }
    opt = document.querySelector("select#clipAction option[value=CLIP_ACTION_FULL_PAGE]");
    if (opt) {
      if (pageInfo.documentIsFrameset) opt.disabled = true;
      else opt.disabled = false;
      if (pageInfo.pdf) opt.disabled = true;
    }
    opt = document.querySelector("select#clipAction option[value=CLIP_ACTION_SELECTION]");
    if (opt) {
      if (pageInfo.selection) opt.disabled = false;
      else opt.disabled = true;
      if (pageInfo.pdf) opt.disabled = true;
    }
    opt = document.querySelector("select#clipAction option[value=CLIP_ACTION_URL]");
    if (opt) {
      opt.disabled = false;
    }
    opt = document.querySelector("select#clipAction option[value=CLIP_ACTION_PDF]");
    if (opt) {
      if (pageInfo.pdf) opt.disabled = false;
      else opt.disabled = true;
    }
  }

  // Fills our local (non-shared) notebooks from cache, and fires off the request to update them from the network if we
  // need to.
  function populateNotebooks() {
    var cache = Persistent.get("userCache");
    if (cache && cache[username] && cache[username]["notebooks"]) {
      fillNotebooks(cache[username]["notebooks"]);
      selectLastNotebook();
    }

    var requestingUser = username;
    function populateNotebooksFromNetworkWithUsername(data) {
      populateNotebooksFromNetwork(requestingUser, data);
    }
    jsonRpc.client.NoteStore.listNotebooks(populateNotebooksFromNetworkWithUsername, authenticationToken);
  }

  function fillNotebooks(data) {
    if (!data || !data.list) {
      return;
    }

    data.list.sort(function(a, b){
      a = a.name;
      b = b.name;
      if (!a) a = "";
      if (!b) b = "";
      if (a.toLowerCase() == b.toLowerCase()) return 0;
      return ((a.toLowerCase() < b.toLowerCase()) ? -1 : 1);
    });
    // We attach these at the front (and therefore in reverse order) instead od the end of the control so that we
    // don't need to worry about timing problems getting back linked notebooks, which are attached at the end.
    var select = document.querySelector("#notebookControl");
    for (var i = data.list.length - 1; i >= 0; i--) {
      var opt = document.createElement("option");
      opt.value = data.list[i].guid;
      opt.textContent = truncate(data.list[i].name, 50);
      select.insertBefore(opt, select.firstChild);
      if (data.list[i].defaultNotebook) {
        defaultNB = data.list[i].guid;
      }
    }
  }

  function populateNotebooksFromNetwork(fromUser, data) {
    if (!data) {
      return;
    }

    if (username != fromUser) {
      console.warn("Got notebooks for non-current user. Discarding.");
      return;
    }

    // See if this matches our cached notebooks.
    var changed = false;
    var cache = Persistent.get("userCache");
    try {
      var cachedNBs = cache[username]["notebooks"];
      if (cachedNBs.list.length === data.list.length) {
        for (var i = 0; i < data.list.length; i++) {
          if ((cachedNBs.list[i].guid !== data.list[i].guid) || (cachedNBs.list[i].name !== data.list[i].name)) {
            changed = true;
            break;
          }
        }
      }
      else {
        changed = true;
      }
    }
    catch (e) {
      changed = true;
    }

    // If nothing's changed, we're done.
    if (!changed) return;

    // Update our cached values.
    if (!cache) cache = {};
    if (!cache[username]) cache[username] = {};
    cache[username]["notebooks"] = data;
    Persistent.set("userCache", cache);

    // Get our currently selected notebook.
    var select = document.querySelector("#notebookControl");
    var selected = null;
    if (userSelectedNotebook) {
      selected = select.options[select.selectedIndex].value;
    }

    // Don't remove items in optgroups.
    while (select.options.length && select.options[0].parentNode.nodeName.toLowerCase() == "select") {
      select.removeChild(select.options[0]);
    }

    fillNotebooks(data);

    // Reselect the same item we had a second ago.
    if (selected) {
      for (var i = 0; i < select.options.length; i++) {
        if (select.options[i].value == selected) {
          select.selectedIndex = i;
          break;
        }
      }
    }
    else {
      selectLastNotebook();
    }
  }

  function getSmartFilingInfo() {
    // These indicate that we'll need to get called again, so we just return early and get called again later.
    if (typeof pageInfo.recommendationText == "undefined") {
      return;
    }

    if (startedSmartFilingRequest) return;
    startedSmartFilingRequest = true;

    var setting = background.getOption("smartFilingEnabled");
    if (!setting != "NONE") {
      var resultSpec = {
        includeTitle: true,
        includeUpdated: true,
        includeAttributes: true,
        includeLargestResourceMime: true,
        includeNotebookGuid: true
      };
      if (pageInfo.recommendationText) {
        var cache = Persistent.get("userCache");
        if (!cache) {
          cache = {};
        }
        if (!cache[username]) {
          cache[username] = {};
        }
        if (cache[username].filingRecommendations) {
          cache[username].filingRecommendations = LRUCache.cast(cache[username].filingRecommendations);
        } else {
          cache[username].filingRecommendations = new LRUCache(5, 30 * 60 * 1000);
        }
        var cached = cache[username].filingRecommendations.get(tab.url);
        var filingRecommendationRequest = {text: pageInfo.recommendationText, query: pageInfo.query,
                                           url: tab.url, relatedNotesResultSpec: resultSpec};
        if (cached && cached.content && cached.content.pers) {
          receivePersSmartFilingInfo(cached.content.pers);
        } else {
          cache[username].filingRecommendations.startEntry(tab.url);
          Persistent.set("userCache", cache);
          JsonQueue.handleExpensiveOpRequest(jsonRpc.shardId,
            jsonRpc.client.NoteStoreExtra.getFilingRecommendations,
            receivePersSmartFilingInfo, authenticationToken,
            filingRecommendationRequest);
        }
        if (bizAuthenticationToken) {
          if (cached && cached.content && cached.content.biz) {
            receiveBizSmartFilingInfo(cached.content.biz);
          } else {
            cache[username].filingRecommendations.startEntry(tab.url);
            Persistent.set("userCache", cache);
            filingRecommendationRequest.relatedNotesResultSpec.maxResults = 10;
            JsonQueue.handleExpensiveOpRequest(bizRpc.shardId,
              bizRpc.client.NoteStoreExtra.getFilingRecommendations,
              receiveBizSmartFilingInfo, bizAuthenticationToken,
              filingRecommendationRequest);
          }
        }
      }
      else {
        receiveSmartFilingInfo();
      }
    }

    if (setting == "NONE" || setting == "TAGS") {
      // We're guaranteed not to get a smart filing match for our notebook, so we'll clear the "loading" tag now.
      finishNotebookLoading();
    }
  }

  function requestLinkedNotebooks() {

    if (!bootstrapInfo.get("enableSharedNotebooks")) {
      return;
    }
    background.msgHandlerGetWritableLinkedNotebooks(null, null, msgHanderReceiveWritableLinkedNotebooks);
  }

  function msgHandlerReceivePageInfo(response) {
    var existantPageInfo = Boolean(pageInfo);
    if (!existantPageInfo) {
      // We don't bother setting this a second time.
      pageInfo = response.info;
    }

    // Clear our notebook list before we fill it.
    var select = document.querySelector("#notebookControl");
    if (select) { select.innerHTML = ""; }
    select.addEventListener("change", tagsEnable);

    // don't do this if this is a pdf since it takes too long to extract the text
    // and just doing the same thing will send blank stuff to the server and 
    // always return 0 related notes.
    if (pageInfo.pdf) {
      finishNotebookLoading();
    } else {
      getSmartFilingInfo();
    }

    // We want to get these *after* smart filing info, so that waiting for these requests to complete doesn't block the
    // samrt filing request, because most of the time these requests won't be important, they'll just be duplicates of
    // the cached data. We ask for them in order of importance.
    populateNotebooks();
    if (bizAuthenticationToken) {
      populateBizNotebooks();
    }
    populateLinkedNotebooks();

    // Now we know enough about the page to preview it.
    setEnabledPreviewTypes();
    if (!existantPageInfo) {
      pickClipType();
    }
    showClip();
  }

  function pickClipType() {

    var forceType = "";
    var preference = background.getOption("clipAction");
    if (preference) {
      var opt = document.querySelector("select#clipAction option[value=CLIP_ACTION_" + preference + "]");
      if (opt) {
        if (!opt.disabled) {
          forceType = preference;
        }
      }
    }

    // Pick a default.
    var type = "CLIP_ACTION_URL";
    if (pageInfo) {
      if (pageInfo.selection) {
        type = "CLIP_ACTION_SELECTION";
      }
      else if (pageInfo.pdf) {
        type = "CLIP_ACTION_PDF";
      }
      else if (pageInfo.article) {
        type = "CLIP_ACTION_ARTICLE";
      }
      else {
        type = "CLIP_ACTION_FULL_PAGE";
      }
    }

    if ((type == "CLIP_ACTION_PDF" && forceType == "URL") ||
        (type != "CLIP_ACTION_SELECTION" && forceType)) {
      type = "CLIP_ACTION_" + forceType;
    }

    var opt = document.querySelector("select#clipAction option[value=" + type + "]");
    if (opt) {
      opt.selected = true;
    }

    // set the value of the dropdown.
    updatePreview.call(document.querySelector("select#clipAction"));
  }

  function receiveSmartFilingInfo(data) {
    if (data) {
      smartFilingInfo = data;
      populateSmartFilingInfo(data);
    }
    else {
      console.warn("error getting smart filing info.");
    }
    finishNotebookLoading();
  }

  function receivePersSmartFilingInfo(data, exception) {
    if (data) {
      persSmartFilingInfo = data;
      if (data && !data.relatedNotes) {
        persSmartFilingInfo.relatedNotes = { list: [] };
      }

      var cache = Persistent.get("userCache");
      if (cache && cache[username] && cache[username].filingRecommendations) {
        cache[username].filingRecommendations = LRUCache.cast(cache[username].filingRecommendations);
        cache[username].filingRecommendations.updateEntry({
          key: tab.url,
          content: {
            pers: persSmartFilingInfo
          }
        });
        Persistent.set("userCache", cache);
      }

      if ((bizAuthenticationToken && bizSmartFilingInfo) || !bizAuthenticationToken) {
        receiveSmartFilingInfo(filterThroughHeuristic());
      }
    } else {
      console.error(exception);
    }
  }

  function receiveBizSmartFilingInfo(data, exception) {
    if (data) {
      if (!data.relatedNotes || data.relatedNotes.list.length == 0) {
        data.relatedNotes = { list: [] };
      }
      else {
        // get their containing notebooks
        for (var i = 0; i < data.containingNotebooks.list.length; i++) {
          var notebookDesc = data.containingNotebooks.list[i];
          containingNotebooks[notebookDesc.guid] = { joined: notebookDesc.hasSharedNotebook,
            name: notebookDesc.notebookDisplayName, contact: notebookDesc.contactName };
        }
      }
      bizSmartFilingInfo = data;

      var cache = Persistent.get("userCache");
      if (cache && cache[username] && cache[username].filingRecommendations) {
        cache[username].filingRecommendations = LRUCache.cast(cache[username].filingRecommendations);
        cache[username].filingRecommendations.updateEntry({
          key: tab.url,
          content: {
            biz: bizSmartFilingInfo
          }
        });
        Persistent.set("userCache", cache);
      }

      if (persSmartFilingInfo) {
        receiveSmartFilingInfo(filterThroughHeuristic());
      }
    }
    else {
      console.error(exception);
    }
  }

  function filterThroughHeuristic() {
    // combine related notes
    if (bizAuthenticationToken) {
      var persRelatedNotes = persSmartFilingInfo.relatedNotes.list;
      var bizRelatedNotes = bizSmartFilingInfo.relatedNotes.list;
      var slotsLeftForBC = Math.max(3 - persRelatedNotes.length, 2);
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
          var linkedGuid = background.getLinkedNotebookGuidOfBizNotebook(bizRelatedNotes[i].notebookGuid);
          if (linkedGuid) {
            bizRelatedNotes[i].linkedNotebookGuid = linkedGuid;
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
      var allNotes = persRelatedNotes.slice(0, 3 - bizNotes.length);
      for (var i = 0; i < bizNotes.length; i++) {
        allNotes.push(bizNotes[i]);
      }
      if (allNotes.length > 0) {
        persSmartFilingInfo.relatedNotes = { javaClass: "java.util.ArrayList", list: allNotes };
      }
      else {
        persSmartFilingInfo.relatedNotes = null;
      }
    }

    // pick a notebook
    if (bizAuthenticationToken && background.getOption("smartFilingBizNBEnabled")) {
      if (bizSmartFilingInfo.notebook && !bizSmartFilingInfo.notebook.restrictions.noCreateNotes) {
        persSmartFilingInfo.notebook = bizSmartFilingInfo.notebook;
        // pick a set of recommended tags
        persSmartFilingInfo.tags = bizSmartFilingInfo.tags;
      }
    }
    return persSmartFilingInfo;
  }

  function selectSmartFilingNotebook(data) {
    if (userSelectedNotebook) return;
    if ((background.getOption("smartFilingEnabled") == "ALL") ||
      (background.getOption("smartFilingEnabled") == "NOTEBOOKS")) {
      if (data.notebook) {
        var select = document.querySelector("#notebookControl");
        var nbguid = data.notebook.guid;
        if (data.notebook.businessNotebook) {
          nbguid = "biz_" + nbguid;
        }
        for (var i = 0; i < select.options.length; i++) {
          if (select.options[i].value == nbguid) {
            select.selectedIndex = i;
            tagsEnable.apply(select);
            break;
          }
        }

        // Make it look shiny.
        select.className += " notebookSelectSmartSelection";
        setNotebookTypeIcon(nbguid);
      }
    }
  }

  function populateSmartFilingInfo(data) {
    if (!data) {
      return;
    }
  
    if (data.relatedNotes) {
      try {
        relatedNotes = null;
        var related = [];
        for (var i = 0; i < data.relatedNotes.list.length; i++) {
          related.push(data.relatedNotes.list[i]);
        }
        relatedNotes = related;
      }
      catch (e) {
        log.warn("Couldn't get realtedNoteGuids: " + JSON.stringify(e));
      }
    }

    var showFeatureDiscovery = false;

    if (((background.getOption("smartFilingEnabled") == "ALL") ||
      (background.getOption("smartFilingEnabled") == "NOTEBOOKS")) &&
        data.notebook) {
      selectSmartFilingNotebook(data);
      showFeatureDiscovery = true;
    }

    if (!userSelectedTags) {
      if ((background.getOption("smartFilingEnabled") == "ALL") ||
        (background.getOption("smartFilingEnabled") == "TAGS")) {
        if (data.tags && data.tags.list && (data.tags.list.length > 0)) {
          for (var i = 0; i < data.tags.list.length; i++) {
            tagControl.addTag(data.tags.list[i].name);
          }
        }
      }
    }

    if (showFeatureDiscovery) {
      if (!Persistent.get("suppressSmartFilingDiscoveryNotice")) {
        disableNewFeatureOverlay();
        document.querySelector(".newFeatureOverlay").style.display = "block";
      }
    }
  }

  function tagsEnable(evt) {
    var shared = false;
    if (this && this.nodeName && this.nodeName.toLowerCase() == "select") {
      shared = this.options[this.selectedIndex].value.match(/^shared_/);
    }
    else if (evt && evt.srcElement && evt.srcElement.value) {
      shared = evt.srcElement.value.match(/^shared_/);
    }
    tagControl.setDisabled(shared);
  }

  function msgHanderReceiveWritableLinkedNotebooks(request, sender, sendResponse){
    updateLinkedNotebooksFromNetwork(request);
  }

  function updateLinkedNotebooksFromNetwork(data) {
    var books = data.books;
    var requestingUser = data.username;
    if (requestingUser != username) {
      // This causes inexplicable errors in Safari.
      // console.log("Got linked notebooks for user: " + requestingUser + " (current user: " + username + ")");
    }
    var cache = Persistent.get("userCache");
    if (!cache) cache = {};
    if (!cache[username]) cache[username] = {};
    cache[username]["linkedNotebooks"] = books;
    Persistent.set("userCache", cache);

    if (books.count == 0) {
      return;
    }

    var select = document.querySelector("#notebookControl");
    var linked = select.querySelector("optgroup[type='linked']");
    if (linked) {
      var savedOption = null;
      if (select.selectedIndex != -1 && select.options[select.selectedIndex].value.match(/^shared_/)) {
        savedOption = select.options[select.selectedIndex].value;
      }
      select.removeChild(linked);
      initializeLinkedNotebooks(books);
      if (savedOption && userSelectedNotebook) {
        linked = select.querySelector("optgroup[type='linked']");
        for (var i = 0; i < linked.children.length; i++) {
          var opt = linked.children[i];
          if (opt.value === savedOption) {
            opt.selected = true;
            break;
          }
        }
      }
    }
    else {
      initializeLinkedNotebooks(books);
    }
  }

  function initializeLinkedNotebooks(books) {
    if (books.count == 0) {
      return;
    }

    var select = document.querySelector("#notebookControl");

    var group = document.createElement("optgroup");
    group.label = Browser.i18n.getMessage("linkedNotebooksOptGroupTitle");
    group.setAttribute("type", "linked");

    var bookArray = [];
    for (var i in books) {
      if (books[i].name) { // Keeps us from including 'count'.
        bookArray.push(books[i]);
      }
    }

    // Sort alpahbetically by user then name.
    bookArray.sort(function(a, b) {
      var aOwner = a.owner ? a.owner.toLowerCase() : "";
      var bOwner = b.owner ? b.owner.toLowerCase() : "";
      var aName = a.name ? a.name.toLowerCase() : "";
      var bName = b.name ? b.name.toLowerCase() : "";

      if (aOwner == bOwner) {
        if (aName == bName) return 0;
        return ((aName < bName) ? -1 : 1);
      }
      else {
        return ((aOwner < bOwner) ? -1 : 1);
      }
    });

    for (var i = 0; i < bookArray.length; i++) {
      var opt = document.createElement("option");
      opt.textContent =
        truncate(Browser.i18n.getMessage("linkedNotebookOptionText", [bookArray[i].name, bookArray[i].owner]), 50);
      opt.value = "shared_" + bookArray[i].guid;
      group.appendChild(opt);
    }
    select.appendChild(group);

    selectLastNotebook();
    tagsEnable.apply(select);
  }

  function initializeBizNotebooks(books) {
    if (books && books.length > 0) {
      var group = document.createElement("optgroup");
      group.setAttribute("type", "biz");
      group.label = Browser.i18n.getMessage("bizNotebooksOptGroupTitle");
      for (var b in books) {
        var book = books[b];
        if (!book.restrictions.noCreateNotes) { // writeable
          var option = document.createElement("option");
          option.value = "biz_" + book.guid;
          var optionText = book.name;
          if (book.contact && book.contact.username != username) {
            optionText += Browser.i18n.getMessage("bizNotebookOptionText", [book.contact.name]);
          }
          option.innerText = truncate(optionText, 50);
          group.appendChild(option);
        }
      }
      // insert it between personal non-linked notebooks and linked notebooks, at the end if linked notebooks haven't
      // come in yet.
      document.querySelector("#notebookControl").insertBefore(group,
        document.querySelector("#notebookControl > optgroup[type='linked']"));
      tagsEnable.apply(document.querySelector("#notebookControl"));
    }
  }

  function selectLastNotebook() {
    if (userSelectedNotebook) return; // Never override a user selection.
    var sel = document.querySelector("#notebookControl");
    var preferredNotebooks = Persistent.get("recentNotebooks");
    if ((preferredNotebooks && preferredNotebooks[username]) || defaultNB) {

      var guid = null;
      if (preferredNotebooks && preferredNotebooks[username]) {
        guid = preferredNotebooks[username];
      }

      for (var i = 0; i < sel.options.length; i++) {
        if ((sel.options[i].value === guid) || (sel.options[i].value === defaultNB)) {
          sel.selectedIndex = i;

          // If we just found the last selected notebook, we're done. Otherwise, we found the default notebook, and
          // we'll keep looking for the last selected one (as long as it's not null). We can't just look for the the
          // last selected notebook isntead of the default notebook in case it's been deleted (or was a shared
          // notebook, etc).
          if ((guid === null) || (sel.options[i].value === guid)) {
            break;
          }
        }
      }
    }

    if (smartFilingInfo) {
      selectSmartFilingNotebook(smartFilingInfo);
    }
  }

  function checkLogin() {
    loginCheckTimeout = setTimeout(checkLoginFailed, 31000);
    background.msgHandlerIsAuthenticated(null, null, responseHandlerCheckLogin);
  }

  function checkLoginFailed() {
    showGlobalError("popup_loginCheckTimeout");
  }

  function responseHandlerCheckLogin(response) {
    if (loginCheckTimeout) {
      clearTimeout(loginCheckTimeout);
      loginCheckTimeout = null;
    }
    if (response) {
      username = response.username;
      authenticationToken = response.authenticationToken;
      bizAuthenticationToken = null;
      if (response.bizAuthenticationToken) {
        bizAuthenticationToken = response.bizAuthenticationToken;
      }
      if (response.displayName) {
        displayName = response.displayName;
      }
      handleLoginSuccess();
    }
    else {
      background.bootstrap(showLogin);
    }
  }

  function truncateEnd(string, maxLength) {
    if (!string) return "";
    if (string.length <= maxLength) {
      return string;
    }
    return string.substr(0, Math.max(maxLength - 3,0)) + "\u2026";
  }

  function truncate(string, maxLength) {
    if (!string) return "";
    if (string.length <= maxLength) return string;

    var front = string.substr(0, maxLength / 2);
    var back = string.substr(-(maxLength / 2), maxLength / 2);
    front = front.replace(/\s+$/, "");
    back = back.replace(/^\s+/, "");

    // maxLength was even, trim one char.
    while ((front.length + back.length) >= (maxLength - 2)) {
      back = back.substr(1);
    }
 
    // char 2026 is an elipsis.
    return front + " \u2026 " + back;
  }

  function checkUrl() {
    var match, scheme, banned;
    if (tab.url) { // Won't be set in Safari for file:// urls.
      match = tab.url.match(/^(.*?):/);
      scheme = match[1].toLowerCase();
      if (scheme != "http" && scheme != "https") banned = true;
      else if (tab.url.match(/^https?:\/\/extensions.apple.com/i)) banned = true;
    }
    else {
      banned = true;
    }
    if (banned) {
      hideView("login");
      hideView("clip");
      showGlobalError("popup_unsupportedScheme");
    }
    else {
      handleLoadingTab();
    }
  }

  function checkPageReady() {

    hideView("login");
    hideView("clip");

    // If we've already got page info, this is the result of a user-switch, so we don't request it again.
    if (pageInfo) {
      start(true);
      return;
    }

    if (SAFARI) {
      Browser.sendToTab(tab, { name: "areYouNonAdobePdf" });
    }
    // See PageInfo.js for the reasoning behind the versioned content_ready message.
    Browser.sendToTab(tab, {name: "content_ready_5_9_10"});
    setTimeout(start, 5000);
  }

  function tabUpdateListener(tabId, changeInfo, t) {
    if (started) return;
    if (t.status == "complete") {
      checkPageReady();
    }
  }

  function handleLoadingTab() {
    if (started) return;
    showWaiting();
    if (tab.status == "loading") { // Only possible in Chrome.
      chrome.tabs.onUpdated.addListener(tabUpdateListener);
    }
    else {
      checkPageReady();
    }
  }

  function tickNotebookLoading() {
    var el = document.querySelector("#notebookActivity");
    var newText = "";
    switch (el.textContent) {
      case "":
        newText = ".";
        break;
      case ".":
        newText = "..";
        break;
      case "..":
        newText = "...";
        break;
      default:
        newText = "";
    }
    el.textContent = newText;
  }

  function clear() {
    Browser.sendToTab(tab, {name: "preview_clear"});
  }

  function finishNotebookLoading() {
    if (notebookLoadingInterval) {
      clearInterval(notebookLoadingInterval);
      notebookLoadingInterval = null;
    }
    document.querySelector("#notebookPlaceholder").style.display = "none";
    var notebookControl = document.querySelector("#notebookControl");
    notebookControl.style.display = "";
    if (notebookControl.selectedIndex >= 0) {
      var selectedNotebookGuid = notebookControl.options[notebookControl.selectedIndex].value;
      setNotebookTypeIcon(selectedNotebookGuid);
      setTagsList(selectedNotebookGuid);
    }
    var d = new Date();
    var elapsed = d.valueOf() - now.valueOf();
  }

  function initJsonRpc() {
    jsonRpc = new JsonRpc(null,
      [
        "NoteStoreExtra.getFilingRecommendations",
        "NoteStore.listTags",
        "NoteStore.listNotebooks"
      ]);
    if (bizAuthenticationToken) {
      bizRpc = new JsonRpc(null, ["NoteStoreExtra.getFilingRecommendations", "NoteStore.listNotebooks",
        "NoteStore.listTags"]);
    }
  }

  function init() {

    // We need this so the extension knows when this window's been dismissed (by virtue of this connection dying).
    if (!SAFARI) {
      try {
        extensionPort = chrome.extension.connect({name: "popupClosed"});
      }
      catch(e) {
        console.log("Couldn't connect to extension");
      }
    }

    // We'll run this to figure out which tab we're working on.
    var getCurrentWindowCallback = function(win) {
      var getSelectedTabCallback = function(t) {
        tab = t;
        checkUrl();
      }
      chrome.tabs.getSelected(win.id, getSelectedTabCallback);
    }

    // We need this so the extension knows when this window's been dismissed (by virtue of this conenction dying).
    if (!SAFARI) {
      chrome.extension.connect({name: "popupClosed"});
    }

    // Load saved username.
    var savedUsername = Persistent.get("popup_savedUsername");
    if (savedUsername) {
      document.querySelector("#username").value = savedUsername;
    }

    setLogo();

    notebookLoadingInterval = setInterval(tickNotebookLoading, 500);

    now = new Date();

    // Record user activity of opening popup.
    background.msgHandlerRecordActivity();

    // Kick off the series of events that will start us running.
    if (SAFARI) {
      document.querySelector("#safariOptionsLink").style.display = "";
      tab = safari.application.activeBrowserWindow.activeTab;
      checkUrl();
    }
    else {
      // If tab's already defined, we've switched user accounts, otherwise we'll need to look it up.
      if (!tab) {
        chrome.windows.getLastFocused(getCurrentWindowCallback);
      }
      else {
        checkUrl();
      }
    }
  }

  // The error and prefill parameters are used if we're getting a new captcha after the user entered a wrong captcha.
  // We want to show the error and the email/username/password that the user entered.
  function getRegistrationLinks(error, prefill) {
    var code = "clipper_chr";
    if (SAFARI) {
      code = "clipper_saf";
    }
    var form = new FormData();
    form.append("code", code);
    var request = new XMLHttpRequest();
    var baseUrl = background.getOption("secureProto") + bootstrapInfo.get("serviceHost");
    request.open("POST", baseUrl + "/CreateUserJSON.action?", true);
    request.onreadystatechange = function (){
      if (request.readyState == 4 && request.status == 200) {
        document.querySelector("#globalErrorMessage").style.display = "none";
        showRegistration(JSON.parse(request.responseText), error, prefill);
      } else if (request.status == 0)
        showGlobalError("Error_Network_Unavailable");
    };
    request.send(form);
  }

  function showRegistration(links, error, prefill) {
    hideView("login");
    clearAllErrors();
    clearRegFields();

    var baseUrl = background.getOption("secureProto") + bootstrapInfo.get("serviceHost");
    document.querySelector("#registrationForm").action = baseUrl + links.submit;
    // add timestamp to avoid caching problems
    document.querySelector("#captchaImg").src = baseUrl + links.captcha + "&timestamp=" + new Date().getTime();
    document.querySelector("#registrationView").className = "";
    if (loggedInUsers.length == 0) { // normal account creation
      document.querySelector("#headerNoUser").style.display = "";
      document.querySelector("#headerLogin").style.display = "";
      document.querySelector("#headerRegister").style.display = "none";
      document.querySelector("#cancelRegisterControl").style.display = "none";
    }
    else { // account switching
      document.querySelector("#headerNoUser").style.display = "none";
      document.querySelector("#cancelRegisterControl").style.display = "";
    }

    document.querySelector("#regTerms").innerHTML = Browser.i18n.getMessage("registration_terms",
      [baseUrl + "/tos", baseUrl + "/privacy"]);

    if (error && typeof error == "string")
      setError("regCaptcha", error);
    if (prefill) {
      document.querySelector("#regEmail").value = prefill.email;
      document.querySelector("#regUsername").value = prefill.username;
      document.querySelector("#regPassword").value = prefill.password;
    }
  }

  function cancelRegistration() {
    clearAllErrors();
    hideView("registration");
    if (loggedInUsers.length > 0) { // registering an account during account switching
      // log user back into web client since the registration API logs the user out.
      background.msgHandlerIsAuthenticated(null, null, function(auth) {
        document.querySelector("#username").value = auth.username;
        document.querySelector("#password").value = auth.password;
        document.querySelector("#rememberMe").checked = auth.remember;
        login();
      });
      showClip();
    }
    else { // normal account creation
      showLogin();
    }
  }

  function submitRegistration() {
    clearTimeout(validateCaptchaTimeout);
    var e = validateEmail();
    var u = validateUsername();
    var p = validatePassword();
    var c = validateCaptcha();
    if (e && u && p && c) {
      var code = "clipper_chr";
      if (SAFARI) {
        code = "clipper_saf";
      }
      var form = new FormData();
      form.append("email", document.querySelector("#regEmail").value);
      form.append("username", document.querySelector("#regUsername").value);
      form.append("password", document.querySelector("#regPassword").value);
      form.append("captcha", document.querySelector("#regCaptcha").value);
      form.append("code", code);
      form.append("terms", true);
      form.append("create", true);

      var request = new XMLHttpRequest();
      request.open("POST", document.querySelector("#registrationForm").action, true);
      request.onreadystatechange = function() {
        if (request.readyState == 4 && request.status == 200) {
          document.querySelector("#globalErrorMessage").style.display = "none";
          var result = JSON.parse(request.responseText);
          if (result.success) {
            handleRegistrationSuccess();
          }
          else {
            handleRegistrationFailure(result);
          }
        }
        else if (request.status == 0)
          showGlobalError("Error_Network_Unavailable");
      };
      request.send(form);
    }
  }

  function handleRegistrationSuccess() {
    // login the user and let them immediately start clipping. no confirmation email needed
    document.querySelector("#username").value = document.querySelector("#regUsername").value;
    document.querySelector("#password").value = document.querySelector("#regPassword").value;
    document.querySelector("#rememberMe").checked = true;
    hideView("registration");
    login();
  }

  function handleRegistrationFailure(result) {
    var baseUrl = background.getOption("secureProto") + bootstrapInfo.get("serviceHost");
    for (var eid in result.errors) {
      var error = result.errors[eid];
      var field = error["field-name"];
      var message = error["message"].replace("href='", "href='" + baseUrl);
      if (field == "email") {
        setError("regEmail", message);
      }
      else if (field == "captcha") {
        getRegistrationLinks(message,
          {email: document.querySelector("#regEmail").value,
          username: document.querySelector("#regUsername").value,
          password: document.querySelector("#regPassword").value});
      }
      else if (field == "password") {
        setError("regPassword", message);
      }
      else if (field == "username") {
        setError("regUsername", message);
      }
    }
  }

  function validateEmail() {
    var emailRegex = new RegExp("^[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+(\.[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+)*@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*\.([A-Za-z]{2,})$");
    var email = document.querySelector("#regEmail").value.trim();
    if (email.length > 0 && !emailRegex.test(email)) {
      setError("regEmail", "regForm_invalid_email");
      return false;
    }
    else if (email.length == 0) {
      setError("regEmail", "regForm_email_required");
      return false;
    }
    clearError("regEmail");
    return true;
  };

  function testEmailUniqueness() {
    if (validateEmail()) { // don't check if the username has invalid format
      var email = document.querySelector("#regEmail").value.trim();
      var xhr = new XMLHttpRequest();
      var baseUrl = background.getOption("secureProto") + bootstrapInfo.get("serviceHost");
      xhr.open("GET", baseUrl + "/RegistrationCheck.action?email=" + encodeURIComponent(email) + "&checkEmail=true", true);
      xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
          document.querySelector("#globalErrorMessage").style.display = "none";
          if (xhr.status == 200)
            clearError("regEmail");
          else if (xhr.status == 400)
            setError("regEmail", "regForm_invalid_email");
          else if (xhr.status == 409)
            setError("regEmail", "regForm_taken_email");
          else if (xhr.status == 500)
            setError("regEmail", "EDAMError_1");
          else if (xhr.status == 0)
            showGlobalError("Error_Network_Unavailable");
        }
      };
      xhr.send();
    }
  }

  function validateUsername() {
    document.querySelector("#regUsername").value = document.querySelector("#regUsername").value.toLowerCase();
    var usernameRegex = new RegExp("^[a-z0-9]([a-z0-9_-]{0,62}[a-z0-9])?$");
    var username = document.querySelector("#regUsername").value.trim();
    if (username.length == 0 || !usernameRegex.test(username)) {
      setError("regUsername", "regForm_invalid_username");
      return false;
    }
    clearError("regUsername");
    return true;
  };

  // Only check username uniqueness 800ms after the user has stopped typing since checking is expensive.
  function testUsernameUniquenessTimeout(evt) {
    if (evt.keyCode != 9) { // don't check if the user tabs into the textbox
      if (uniqueUsernameCheckPending) {
        clearTimeout(uniqueUsernameCheckPending);
        uniqueUsernameCheckPending = 0;
      }
      uniqueUsernameCheckPending = setTimeout(testUsernameUniqueness, 800);
    }
  }

  function testUsernameUniqueness() {
    if (validateUsername()) { // don't check if the username has invalid format
      var username = document.querySelector("#regUsername").value.trim();
      var xhr = new XMLHttpRequest();
      var baseUrl = background.getOption("secureProto") + bootstrapInfo.get("serviceHost");
      xhr.open("GET", baseUrl + "/RegistrationCheck.action?username=" + username + "&checkUsername=true", true);
      xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
          document.querySelector("#globalErrorMessage").style.display = "none";
          if (xhr.status == 200)
            setUsernameSuccess();
          else if (xhr.status == 400)
            setError("regUsername", "regForm_invalid_username");
          else if (xhr.status == 409)
            setError("regUsername", "regForm_taken_username");
          else if (xhr.status == 412)
            setError("regUsername", "regForm_deactivated_username", [baseUrl + "/AccountReactivation.action"]);
          else if (xhr.status == 500)
            setError("regUsername", "EDAMError_1");
          else if (xhr.status == 0)
            showGlobalError("Error_Network_Unavailable");
        }
      };
      xhr.send();
    }
  }

  function validatePassword() {
    var regex = new RegExp("^[A-Za-z0-9!#$%&'()*+,./:;<=>?@^_`{|}~\\[\\]\\\\-]{6,64}$");
    var pw = document.querySelector("#regPassword").value;
    if (pw.length == 0) {
      setError("regPassword", "regForm_password_required");
      return false;
    }
    else if (!regex.test(pw)) {
      setError("regPassword", "regForm_invalid_password");
      return false;
    }
    clearError("regPassword");
    return true;
  };

  function validateCaptcha() {
    var captcha = document.querySelector("#regCaptcha").value.trim();
    if (captcha.length == 0) {
      setError("regCaptcha", "regForm_invalid_captcha");
      return false;
    }
    clearError("regCaptcha");
    return true;
  };

  // domId is the id of the input element that the error message pertains to
  // The message parameter can be the name of the message in the i18n files, or the message itself
  // assumes that the DOM element that holds the error message has the id that's the domId + "Error"
  function setError(domId, message, placeholders) {
    if (domId == "regUsername") {
      document.querySelector("#regUsernameSuccess").style.display = "none";
    }

    // add error class only if it doesn't already have an error
    if (document.querySelector("#" + domId).className.indexOf("error") == -1)
      document.querySelector("#" + domId).className += " error";
    document.querySelector("#" + domId + "Error").style.display = "block";
    var m = Browser.i18n.getMessage(message, placeholders);
    if (m == "")
      document.querySelector("#" + domId + "Error").innerHTML = message;
    else
      document.querySelector("#" + domId + "Error").innerHTML = m;
  }

  function setUsernameSuccess() {
    document.querySelector("#regUsernameSuccess").style.display = "block";
  }

  // domId parameter is the same deal as in setError
  function clearError(domId) {
    var className = document.querySelector("#" + domId).className.replace(/\s*error\s*/g, "");
    document.querySelector("#" + domId).className = className
    document.querySelector("#" + domId + "Error").style.display = "none";

    if (domId == "regUsername") {
      document.querySelector("#regUsernameSuccess").style.display = "none";
    }
  }

  // This is necessary because Safari doesn't do anything when you click on a link in the popup that has the target
  // attribute set to "_blank" (works in Chrome though). Also can't just add a click handler to the <A> links
  // themselves because the localization of urls happens after the event handlers are assigned.
  function setClickHandlerForLinks(evt) {
    if (evt.srcElement.tagName == "A") {
      background.msgHandlerOpenTab({ url: evt.srcElement.href });
      return false;
    }
  }

  reset();
  init();

  this.clear = clear;

  Object.preventExtensions(this);
};
Object.preventExtensions(Popup);

var popup;

function start() {
  if (SAFARI) {
  var popover = safari.extension.popovers["clipper"]; // Safari 6.
  if (!popover) popover = safari.extension.popovers[0]; // Safari 5.1.
    if (!popover.visible) return;
  }
  popup = new Popup();
}

function safariClear() {
  var popover = safari.extension.popovers["clipper"]; // Safari 6.
  if (!popover) popover = safari.extension.popovers[0]; // Safari 5.1.
  if (popover && !popover.visible) {
    if (popup) popup.clear();
    if (interval) {
      clearInterval(interval);
      interval = null;
    }
  }
}

// Safari keeps a persistent popover window. To duplicate the behavior of chrome, we listen for its invocation event
// and reload the window ourself in that case.
if (SAFARI) {
  safari.application.addEventListener("popover", function() {
    window.location.reload();
  }, true);

  var interval = setInterval(safariClear, 100);

  window.addEventListener("unload", function(){"unload!"});
  window.addEventListener("beforeunload", function(){"beforeunload!"});
}

// Stupid hack that causes the popup to get focus so we receive keyboard events.
// This gets around this bug in Chrome 18: http://code.google.com/p/chromium/issues/detail?id=111660
// If this gets fixed, we can simply run the addEventListener line in the 'else' block.
if (!SAFARI && !document.location.search) {
  document.location.search = "?hack";
}
else {
  document.addEventListener("DOMContentLoaded", start);
}


// Run in popup.html.
window.addEventListener("error", function(e) {log.error(JSON.stringify(e));});
if (SAFARI) {
  var timeout;

  function setHeightTimeout() {
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(adjustHeight, 300);
  }
  function adjustHeight() {
    var nh = document.querySelector("#main").getBoundingClientRect().height;
    var popover = safari.extension.popovers["clipper"]; // Safari 6.
    if (!popover) popover = safari.extension.popovers[0]; // Safari 5.1.
    if (popover && popover.height != nh) {
      popover.height = nh;
    }
    timeout = null;
  }

  window.addEventListener("DOMContentLoaded", function() {
    document.querySelector("#main").className = "safari";
    document.querySelector("html").className = "safari";

    document.body.addEventListener("DOMSubtreeModified", setHeightTimeout);
    document.body.addEventListener("mousedown", setHeightTimeout);
    document.body.addEventListener("mouseup", setHeightTimeout);
  });
}
