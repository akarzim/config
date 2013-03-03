// Each logged in user should get his own UsageMetrics object.
function UsageMetrics(serviceUrl, authFunction) {
  "use strict";

  var INTERVAL_MINUTES = 15;

  // Timestamp of the 15 minute interval last sent to the server. We will not record events in this block or before.
  var lastSent = 0;
  var activityBlocks = {};

  // Gets the timestamp for the first second of the 15 minute block that we're currently in.
  function getTimeBlock() {
    var now = new Date();
    var minutes = Math.floor(now.getMinutes() / INTERVAL_MINUTES) * INTERVAL_MINUTES;
    now.setMinutes(minutes);
    now.setSeconds(0);
    now.setMilliseconds(0);
    return Math.round(now.getTime() / 1000);
  }

  function recordActivity(callback) {
    var time = getTimeBlock();
    if (lastSent >= time) {
      if (callback) callback();
      return;
    }
    activityBlocks[time] = true;
    send(callback);
  }

  function send(callback) {
    if (!navigator.onLine) {
      if (callback) callback();
      return;
    }
    var count = 0;
    var newLastSent = 0;
    for (var i in activityBlocks) {
      var num = parseInt(i);
      count++;
      if (num > newLastSent) {
        newLastSent = num;
      }
    }

    if (count > 0) {
      sendRequest(count, newLastSent, callback);
    }
    else {
      if (callback) callback();
    }
  }

  function sendRequest(count, newLastSent, callback) {
    var authInfo;
    var rpc;

    function resultCallback(data, error) {
      if (data) {
        activityBlocks = [];
        if (newLastSent > lastSent) {
          lastSent = newLastSent;
        }
      }
      if (callback) callback();
    }

    function sendCallback() {
      rpc.client.NoteStore.getSyncStateWithMetrics(resultCallback, authInfo.authenticationToken, {"sessions": count});
    }

    function authCallback(_authInfo) {
      authInfo = _authInfo;
      if (authInfo && authInfo.authenticationToken) {
        rpc = new JsonRpc(null, ["NoteStore.getSyncStateWithMetrics"], serviceUrl);
        rpc.initWithAuthToken(authInfo.authenticationToken, sendCallback);
      }
      else {
        console.warn("Tried to send UsageMetrics, but not logged in.");
        if (callback) callback();
      }
    }

    authFunction(authCallback, true);
  }

  function getJson() {
    var json = {};
    json.lastSent = lastSent;
    json.activityBlocks = {};
    // Deep copy.
    for (var i in activityBlocks) {
      json.activityBlocks[i] = activityBlocks[i];
    }
    return json;
  }

  function importFromJson(json) {
    try {
      lastSent = json.lastSent;
      activityBlocks = json.activityBlocks;
    }
    catch(e) {
      lastSent = 0;
      activityBlocks = {};
      console.warn("Failed to import saved UsageMetrics from JSON object.");
    }
  }

  this.recordActivity = recordActivity;
  this.send = send;
  this.getJson = getJson;
  this.importFromJson = importFromJson;

  Object.preventExtensions(this);
}

Object.preventExtensions(UsageMetrics);

// Takes a URL to make requests against, and a function that can be called to get back auth info. Currently, the spec
// for what should be passed to authFunction and what gets passed to authFunction's callback is exactly equivalent to
// Auth.isAuthenticated(), which is:
// Auth.isAuthenticated(callback, autoRenew)
//  callback: a function to call when we've decided whether a user is authenticated, this function will be passed an
//  object with the following properties:
//    username: the username used to perform the authentication (which can be an email address).
//    authenticationToken: the authentication token returned by a successful login on the server.
//    displayName: the username as it should be displayed in the UI (should not be an email address, may be the same as
//    username.  
//  NOTE: if authentication fails, NULL is passed to 'callback', not an object with null property values.
//
//  autoRenew: a boolean indicating whether the authFunction should attempt to automatically renew a stale auth token.
function UsageMetricsManager(serviceUrl, authFunction) {

  var usageMetrics = {};

  function restoreMetrics() {
    try {
      var saved = Persistent.get("usageMetrics");
      for (var i in saved) {
        usageMetrics[i] = new UsageMetrics(serviceUrl, authFunction);
        usageMetrics[i].importFromJson(saved[i]);
      }
    }
    catch (e) {
      console.warn("Failure restoring usage metrics. Setting blank.");
      usageMetrics = {};
    }
  }

  function saveMetrics() {
    var saved = {};
    for (var i in usageMetrics) {
      saved[i] = usageMetrics[i].getJson();
    }

    Persistent.set("usageMetrics", saved);
  }

  function recordActivity() {
    var name = "";
    function checkAuthCallback(auth) {
      if (auth) {
        name = auth.displayName;
      }
      if (name) {
        var usage = usageMetrics[name];
        if (!usage) {
          usage = new UsageMetrics(serviceUrl, authFunction);
          usageMetrics[name] = usage;
        }
        usage.recordActivity(saveMetrics);
      }
    }
    authFunction(checkAuthCallback, true);
  }

  restoreMetrics();
  this.recordActivity = recordActivity;

  Object.preventExtensions(this);
}
Object.preventExtensions(UsageMetricsManager);
