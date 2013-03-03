// This is intended to be the lightest-weight access to the HTTP API possible. It is intended to replace
// Evernote.Context and do less abstraction. It is based around the jsonrpc library from the jabsorb project.

// @TODO: We should be able to pass an exception handler to this function, and a list of callable remote procedures, so
// that we don't need to make a round-trip to the server to discover them.

// @param methodList: the list of callable methods on the server. If this is supplied, then we won't query the server
// for this information (which is obviously more effecient).
function JsonRpc(shardId, methodList, overrideBaseUrl) {
  "use strict";

  if (!methodList) {
    log.warn("No methodList provided to JsonRpc object. Consider providing this for performance reasons.");
  }

  // List of functions we need to run when initialization completes.
  var callbacks = [];

  // lame trinary variable combo.
  var initialized = false;
  var initializing = false;

  var shardRpcClient = null;
  var auth = null;

  var baseUrl;
  if (overrideBaseUrl) {
    baseUrl = overrideBaseUrl;
  }
  else {
    var bootstrapInfo = new BootstrapInfo();
    baseUrl = Browser.extension.getBackgroundPage().extension.getOption("secureProto") + 
      Browser.extension.getBackgroundPage().extension.getBootstrapInfo("serviceHost");
  }

  function executeCallbacks() {
    initialized = true;
    for (var i = 0; i < callbacks.length; i++) {
      callbacks[i]();
    }
  }

  function initWithUrl(url, callback) {

    // If initialization is complete, we'll just call this now.
    if (initialized && callback) {
      callback();
      return;
    }

    // Otherwise we need to save it for later.
    if (callback) {
      callbacks.push(callback);
    }

    // Fire off this request only if we haven't before.
    if (!initializing) {
      initClient(url);
    }
    
    // And keep us from doing it a second time.
    var initializing = true;
  }

  function initWithAuthToken(_auth, callback) {
    auth = _auth;
    var matches = auth.match(/^"?S=([^:]+)/);
    if (matches && !shardId) {
      shardId = matches[1];
    }
    initWithUrl(baseUrl + "/shard/" + shardId + "/json", callback);
  }

  function initClient(url) {
    if (methodList) {
      shardRpcClient = new JSONRpcClient(methodList, url);
      executeCallbacks();
    }
    else {
      shardRpcClient = new JSONRpcClient(executeCallbacks, url);
    }
  }

  // This will set up a JSONRpcCall object and when it's ready, call each callback.
  function initFromCookieAuth(cookie) {

    auth = cookie.value;
    if (!auth) {
      // @TODO: potentially not a warning.
      log.warn("Couldn't get an auth cookie for domain: " + baseUrl);
    }

    // Grab one from our cookie if it wasn't supplied.
    if (!shardId) {
      var matches = auth.match(/^"?S=([^:]+)/);
      if (matches) {
        shardId = matches[1];
      }
    }

    // If we still don't have one, then we're in trouble.
    if (!shardId) {
      log.warn("Couldn't get a shard to initialize to.");
    }

    initClient(baseUrl + "/shard/" + shardId + "/json");
  }

  function defaultExceptionHandler(exception) {
    log.error("JsonRpc Exception: " + JSON.stringify(exception));
  }

  function listify(list) {
    if (!list) {
      list = [];
    }
    return {list: list, javaClass: "java.util.ArrayList"};
  }

  JSONRpcClient.toplevel_ex_handler = defaultExceptionHandler;

  this.initWithUrl = initWithUrl;
  this.initWithAuthToken = initWithAuthToken;
  this.listify = listify;

  // read-only properties.
  this.__defineGetter__("authToken", function() {return auth;});
  this.__defineGetter__("client", function() {return shardRpcClient;});
  this.__defineGetter__("shardId", function() {return shardId;});

  Object.preventExtensions(this);
}

