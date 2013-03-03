// This class manages authentication of a user and is queryable locally or via message passing.

function Auth() {

  var bootstrapInfo = new BootstrapInfo();

  // This is where we can find 'userStore' online.
  var rpcUrl = extension.getOption("secureProto") + bootstrapInfo.get("serviceHost") + "/json";
  var rpc = {}; // Actual RPC objects.

  // These are only used in flight while we perform a login.
  var username = null;
  var password = null;
  var remember = false;

  // Map of display names to user info objects.
  var userInfo = {};
  var currentUser = null;

  // Number of seconds we're *AHEAD* of the server.
  var authTimeOffset = 0;

  // List of callbacks to call after a login attempt.
  var callbacks = [];

  // timeout object to give up on failed logins;
  var timeout = 0;

  // This is set while operations are in progress so that we won't have confusing overlapping requests.
  var busy = false;

  // Don't change this or it will break people's saved login info.
  var cryptKey = "asrogugybevladrvbowergblkdvnafyuversouvhsdflvaeruabsdubseruvy";

  function xorcrypt(string) {
    if (!string) return;
    var effectiveCryptKey = cryptKey;
    var encString = "";
    while (effectiveCryptKey.length < string.length) {
      effectiveCryptKey += cryptKey;
    }
    effectiveCryptKey = effectiveCryptKey.substr(0, string.length);
    for (var i = 0; i < string.length; i++) {
      var key = effectiveCryptKey.charCodeAt(i);
      var val = string.charCodeAt(i);
      var xored = key ^ val;
      encString += String.fromCharCode(xored);
    }
    return encString;
  }

  function loadSavedAuth() {
    var savedAuth = Persistent.get("savedAuthInfo");

    // Single-user 5.5 and older format.
    if (!savedAuth || savedAuth.username || savedAuth.password) {
      savedAuth = {};
      Persistent.set("savedAuthInfo", {});
    }

    userInfo = {};
    currentUser = "";
    if (!savedAuth.currentUser || !savedAuth.userInfo) {
      // Nothing saved.
      return;
    }

    currentUser = savedAuth.currentUser;

    for (var i in savedAuth.userInfo) {
      try {
        userInfo[i] = savedAuth.userInfo[i];
        if (userInfo[i].password) {
          userInfo[i].password = xorcrypt(userInfo[i].password);
        }
      }
      catch (e) {
        log.warn("Couldn't restore credentials for user " + i);
      }
    }

    if (!userInfo[currentUser]) {
      console.warn("No entry for saved user, picking another.");
      for (var i in userInfo) {
        currentuser = i;
        saveAuth();
        break;
      }
    }
  }

  function saveAuth() {
    var info = {};
    for (var i in userInfo) {
      // deep-copy.
      var copy = JSON.parse(JSON.stringify(userInfo[i]));
      if (copy.password) {
        copy.password = xorcrypt(copy.password);
      }
      if (copy.remember) {
        info[i] = copy;
      }
    }
    Persistent.set("savedAuthInfo", {userInfo: info, currentUser: currentUser});
  }

  function loginWebClient(username, password, remember) {
    // Throw an XMLHttpRequest at the service and see if we can't log in there, too.
    var form = new FormData();
    form.append("username", username);
    form.append("password", password);

    // We do this in Safari even if remember isn't set, because Safari won't bother to save session cookies in this
    // case, probably as some sort of privacy feature, making the cookie persistent seems to keep us logged in.
    if (remember || SAFARI) {
      form.append("rememberMe", "true");
    }
    form.append("login", "Sign in");
    var login = new XMLHttpRequest();
    var baseUrl = extension.getOption("secureProto") + bootstrapInfo.get("serviceHost");
    login.open("POST", baseUrl + "/Login.action", true);
    login.onreadystatechange = function (){};
    login.send(form);
  }

  function login(doWebClient, _username, _password, _remember, callback) {
    function loginHandler(response, exception) {
      if (response && doWebClient) {
        loginWebClient(_username, _password, _remember, response.user.shardId);
      }
      handleLogin(response, exception);
    }

    if (callback) callbacks.push(callback);
    if (busy) return;
    busy = true;
    username = _username;
    password = _password;
    remember = _remember;

    getRpc().client.UserStore.authenticate(loginHandler, username, password,
      "en-jsclipper-new", "d1734067cf6f8cd6");

    // We let this run for 30 seconds, and then we will kill it.
    timeout = setTimeout(loginTimeout, 30000);
  }

  function loginTimeout() {
    for (var i = 0; i < callbacks.length; i++) {
      runCallback(i, {authenticationToken: null, error: "TIMEOUT"});
    }
    callbacks = [];
    busy = false;
  }

  function runCallback(idx, arg) {
    try {
      callbacks[idx](arg);
    }
    catch (e) {
      log.warn("Got error running login callback: " + JSON.stringify(e));
    }
  }

  function failLogin(exception) {
    var error = resolveError(exception);
    currentUser = username;

    function postLogout() {
      for (var i = 0; i < callbacks.length; i++) {
        runCallback(i, {authenticationToken: null, displayName: currentUser, error: error});
      }
      callbacks = [];
      busy = false; // Not busy any more.
    }

    // If we had a network failure, we don't want to lose the user's credentials.
    if (error == "NETWORK") {
      postLogout();
    }
    // But if the error was something else, we want to clear everything out and start over. The common case is that
    // a user has changed his password somewhere else.
    else {
      logoutUser(currentUser, postLogout);
    }
  }

  function getCurrentUserInfo() {
    if (!currentUser) return {};
    if (!userInfo[currentUser]) return {};
    return userInfo[currentUser];
  }

  function getCurrentUserAuthResult() {
    var info = getCurrentUserInfo();
    if (info.authResult) {
      return info.authResult;
    }
    return {};
  }

  function getCurrentUserBizAuthResult() {
    var info = getCurrentUserInfo();
    if (info.bizAuthResult) {
      return info.bizAuthResult;
    }
    return {};
  }

  function handleLogin(result, exception) {
    // If we've already cancelled this event, we'll do nothing here.
    if (!busy) return;
    if (timeout) clearTimeout(timeout);

    // Successful login.
    if (result) {
      var lookupName = username;
      if (result.user && result.user.username) {
        lookupName = result.user.username;
      }
      // Save user info.
      currentUser = lookupName;
      userInfo[lookupName] = {};
      userInfo[lookupName].displayName = lookupName;
      userInfo[lookupName].username = username;
      userInfo[lookupName].password = password;
      userInfo[lookupName].authResult = result;
      userInfo[lookupName].remember = remember;
      userInfo[lookupName].premiumInfo = result.user.premiumInfo;
      authTimeOffset = (new Date().getTime()) - result.currentTime;

      if (result.user && result.user.accounting &&
          (result.user.accounting.businessId != null && result.user.accounting.businessId != undefined) &&
          (result.user.accounting.businessName != null && result.user.accounting.businessName != undefined)) {
        userInfo[lookupName].premiumInfo.businessId = result.user.accounting.businessId;
        getRpc().client.UserStore.authenticateToBusiness(handleBusinessLogin, result.authenticationToken);
      }
      else {
        if (remember) {
          saveAuth();
        }

        for (var i = 0; i < callbacks.length; i++) {
          runCallback(i, {authenticationToken: result.authenticationToken, displayName: currentUser, error: false});
        }
        callbacks = [];
        busy = false; // Not busy any more.
      }
      Browser.setTitle(Browser.i18n.getMessage("BrowserActionTitle"));
      Browser.setIcon("images/web-clipper");
    }
    // Failure to login. Reset everything.
    else {
      failLogin(exception);
    }
  }

  function handleBusinessLogin(result, exception) {
    if (result) {
      if (userInfo[currentUser]) {
        userInfo[currentUser].bizAuthResult = result;
      }
      else {
        log.warn("Got business login for unknown user. Discarding.");
      }

      if (remember) {
        saveAuth();
      }

      for (var i = 0; i < callbacks.length; i++) {
        runCallback(i, {authenticationToken: userInfo[currentUser].authResult.authenticationToken,
          bizAuthenticationToken: result.authenticationToken, displayName: currentUser, error: false});
      }
      callbacks = [];
      busy = false; // Not busy any more.
    }
    else {
      failLogin(exception);
    }
  }

  function resolveError(exception) {
    // The dewfault unknown error.
    if (!exception) {
      return "UNKNOWN";
    }

    // If we have a useful code, we'll resolve a name from that.
    if (typeof exception.code === "number") {
      var code = exception.code;
      switch (code) {
        case 0: return "NETWORK";
        case 503: return "HTTP/503";
        case 490: break; // The case we usually see for app-layer exceptions.

        default:
      }
    }

    // Otherwise, we'll try parsing some text.
    var fields = ["name", "trace"];
    for (var i = 0; i < fields.length; i++) {
      if (exception[fields[i]]) {
        var field = exception[fields[i]];
        var match = field.match(/errorCode:(\w+)/);
        if (match) {
          switch (match[1]) {
            case "DATA_REQUIRED": 
              if (field.match(/parameter:password/)) return "PASSWORD_REQUIRED";
              if (field.match(/parameter:username/)) return "USERNAME_REQUIRED";
              return "DATA_REQUIRED";
            case "INVALID_AUTH":
              if (field.match(/parameter:password/)) return "INVALID_PASSWORD";
              if (field.match(/parameter:username/)) return "INVALID_USERNAME";
              return "INVALID_AUTH";
            case "PERMISSION_DENIED":
              if (field.match(/parameter:.*tooManyFailures/)) return "TOO_MANY_FAILURES";
              if (field.match(/parameter:.*User.active/)) return "ACCOUNT_DEACTIVATED";
              return "PERMISSION_DENIED";
            case "AUTH_EXPIRED":
              if (field.match(/parameter:password/)) return "EXPIRED_PASSWORD";
              return "AUTH_EXPIRED";
            default:
              log.error("Found unhandled error condition: " + match[1] + " while logging in.");
              return "UNKNOWN";
          }
        }
      }
    }

    // Still nothing?
    return "UNKNOWN";
  }

  function autoRenewAuth(callback) {
    function autoRenewClosure(result){
      autoRenewHandler(callback, result);
    }
    var info = getCurrentUserInfo();
    if (info) {
      login(true, info.username, info.password, info.remember, autoRenewClosure);
    }
    else {
      log.error("Can't auto-renew with no current user.");
    }
  }

  function autoRenewHandler(callback, result) {
    if (!result) {
      log.error("Blank result from auto-renew call.");
      callback(null);
    }
    else if (result.error) {
      log.warn("Got error trying to autoRenew auth: " + JSON.stringify(result.error));
      callback(null);
    }
    else if (!result.authenticationToken) {
      log.error("Auto-renew was missing both error and auth token.");
      callback(null);
    }
    else {
      var tokens = { authenticationToken: result.authenticationToken };
      if (result.bizAuthenticationToken) {
        tokens.bizAuthenticationToken = result.bizAuthenticationToken;
      }
      callback(tokens);
    }
  }

  function authFresh() {
    var authResult = getCurrentUserAuthResult();
    if (!authResult.expiration) return false;
    var now = new Date().getTime();
    now -= authTimeOffset;

    // We'll say that our auth is stale if we're within three minutes of having it expire. This avoids the problem of
    // finding that it's fresh but expiring in a second or two and having it expire by the time a clip is actually
    // made).
    if (now > (authResult.expiration - (3 * 60 * 1000))) return false;
    return true;
  }

  function isAuthenticated(callback, autoRenew) {
    // We let this function be called by 'getAuthTokens' so that we can rely on it's auto-renew behavior.
    // We declare it here as a closure to keep 'callback' in scope.
    function getAuthClosure(authTokens) {
      if (authTokens && authTokens.authenticationToken && authFresh()) {
        var authToken = authTokens.authenticationToken;
        var info = getCurrentUserInfo();
        var callbackArgs = { username: info.username, authenticationToken: authToken, displayName: currentUser,
          userId: info.authResult.user.id, shardId: info.authResult.user.shardId, password: info.password,
          remember: info.remember };
        if (info.bizAuthResult) {
          callbackArgs["bizAuthenticationToken"] = info.bizAuthResult.authenticationToken;
        }
        if (info.premiumInfo && info.premiumInfo.premium) {
          callbackArgs["premium"] = true;
        }
        callback(callbackArgs);
      }
      else {
        callback(false);
      }
    }

    if (autoRenew) {
      try {
        getAuthTokens(getAuthClosure, true);
      }
      catch (e) {
        log.error("Couldn't get auth token: " + JSON.stringify(e));
      }
      return;
    }

    // Auto-renew not specified, we'll simply return what we have now.
    try {
      if (getCurrentUserAuthResult().authenticationToken && authFresh()) {
        var info = getCurrentUserInfo();
        var callbackArgs = { username: info.username, authenticationToken: authToken, displayName: currentUser,
          userId: info.authResult.user.id, shardId: info.authResult.user.shardId, password: info.password,
          remember: info.remember };
        if (info.bizAuthResult) {
          callbackArgs["bizAuthenticationToken"] = info.bizAuthResult.authenticationToken;
        }
        if (info.premiumInfo && info.premiumInfo.premium) {
          callbackArgs["premium"] = true;
        }
        callback(callbackArgs);
      }
      else {
        callback(false);
      }
    }
    catch (e) {
      log.error("Error running isAuthenticated callback. " + JSON.stringify(e));
    }
  }

  function logoutAll(doPost) {
    while (currentUser) {
      logout(null, doPost);
    }
  }

  function logoutUser(user, callback, doPost) {
    setCurrentUser(user, true);
    logout(callback, doPost);
  }

  function logout(callback, doPost) {
    // We want to do the post unless someone explictly asks us not to, an ommitted parameter defaults to true. This
    // keeps us from double-submitting logout requests when we're just trying to keep in sync with the web client.
    if (doPost !== false) doPost = true;

    if (doPost) {
      // We don't want to send the logout request unless we're logged in. Normally it's not helpful (but not 
      // destructive, either), but on the registration page, it causes registration to fail.
      if (getCurrentUserAuthResult().authenticationToken && authFresh()) {
        var login = new XMLHttpRequest();
        var baseUrl = extension.getOption("secureProto") + bootstrapInfo.get("serviceHost");
        login.open("GET", baseUrl + "/Logout.action", true);
        login.onreadystatechange = function (){};
        login.send();
      }
    }

    delete userInfo[currentUser];
    currentUser = "";
    for (var i in userInfo) {
      currentUser = i;
      break;
    }
    saveAuth();

    authTimeOffset = 0;
    if (callback) {
      try {
        callback();
      }
      catch (e) {
        log.error("Error running logout callback. " + JSON.stringify(e));
      }
    }

    if (Object.keys(userInfo).length == 0) {
      Browser.setTitle(Browser.i18n.getMessage("signInPrompt"));
      Browser.setIcon("images/web-clipper-sign-in");
    }
  }

  // Returns the current authentication token, or potentially tries to renew the authentication token and return the new
  // one.
  // If called with 'callback', the resulting auth token will be passed to 'callback'.
  // If called without 'autoRenew, the resulting auth token will also be returned directly.
  // It is an error to specify 'autoRenew' without also specifying a callback.
  // if 'autoRenew' is specified, 'null' will be returned, you must rely on 'callback' for your auth token.
  function getAuthTokens(callback, autoRenew) {
    if (autoRenew) {
      if (!callback) {
        throw ("You must specify a callback to use autoRenew.");
        return;
      }
      // We don't need to do any renewal.
      if (authFresh()) {
        try {
          var info = getCurrentUserInfo();
          var tokens = {
            authenticationToken: info.authResult.authenticationToken
          };
          if (info.bizAuthResult) {
            tokens.bizAuthenticationToken = info.bizAuthResult.authenticationToken;
          }
          callback(tokens);
        }
        catch (e) {
          console.error("Couldn't run auth callback. " + JSON.stringify(e));
        }
        return;
      }

      var cuInfo = getCurrentUserInfo();
      if (cuInfo.username && cuInfo.password) {
        autoRenewAuth(callback);
        return;
      }
      else {
        if (callback) {
          try {
            callback(null);
          }
          catch (e) {
            console.error("Couldn't run auth callback. " + JSON.stringify(e));
          }
        }
        return null;
      }
    }

    // 'autoRenew' not specified, so we're guaranteed not to need to hit the network, we can return a value now.
    if (getCurrentUserAuthResult().authenticationToken) {
      var tokens = {
        authenticationToken: getCurrentUserAuthResult().authenticationToken
      };
      if (getCurrentUserBizAuthResult().authenticationToken) {
        tokens.bizAuthenticationToken = getCurrentUserBizAuthResult().authenticationToken;
      }
      if (callback) {
        try {
          callback(tokens);
        }
        catch (e) {
          console.error("Couldn't run auth callback. " + JSON.stringify(e));
        }
      }
      return tokens;
    }
    if (callback) {
      try {
        callback(null);
      }
      catch (e) {
        console.error("Couldn't run auth callback. " + JSON.stringify(e));
      }
    }
    return null;
  }

  function getCurrentUsername() {
    return getCurrentUserInfo().username;
  }
  
  function setCurrentUser(user, forLogout) {
    if (userInfo[user]) {
      currentUser = user;
      var info = getCurrentUserInfo();
      if (!forLogout) {
        loginWebClient(info.username, info.password, info.remember);
      }
      return true;
    }
    return false;
  }

  function getRpcForUrl(url) {
    if (rpc[url]) {
      return rpc[url];
    }
    var rpcObj = new JsonRpc(null, ["UserStore.authenticate",
                                    "UserStore.authenticateToBusiness"]);
    rpcObj.initWithUrl(url);
    rpc[url] = rpcObj;
    return rpcObj;
  }

  function getRpcUrl() {
    return extension.getOption("secureProto") + bootstrapInfo.get("serviceHost") + "/json";
  }

  function getRpc(){
    return getRpcForUrl(getRpcUrl());
  }

  function getLoggedInUserNames() {
    var names = [];
    for (var i in userInfo) {
      names.push(i);
    }
    names.sort(function(a, b){
      var _a = a.toLowerCase();
      var _b = b.toLowerCase();
      if (a < b) return -1;
      if (a > b) return 1;
      return 0;
    });
    return names;
  }

  function getUserInfo(username) { 
    if (!username) username = currentUser;
    var info = userInfo[ username];
    if (info) return info;
    return {};
  }

  // Load our saved auth info.
  loadSavedAuth();

  // Public API:
  this.getAuthTokens = getAuthTokens;
  this.isAuthenticated = isAuthenticated;
  this.login = login;
  this.logout = logout;
  this.logoutUser = logoutUser;
  this.logoutAll = logoutAll;
  this.xorcrypt = xorcrypt;
  this.getUserInfo = getUserInfo;
  this.getCurrentUsername = getCurrentUsername;
  this.getLoggedInUserNames = getLoggedInUserNames;
  this.setCurrentUser = setCurrentUser;

  Object.preventExtensions(this);
}
Object.preventExtensions(Auth);
