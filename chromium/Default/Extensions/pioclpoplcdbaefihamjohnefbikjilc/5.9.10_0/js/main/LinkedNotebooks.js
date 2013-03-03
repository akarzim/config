// Pass this function an already-initialized JsonRpc object.
// @TODO: or pass it 'null' and we'll initialize one here.

function LinkedNotebooks(authToken, jsonRpc, callback) {
  "use strict";

  var TIMEOUT = 10000;

  // A counter keeping track of the number of notebooks for which all our initializations have completed. We'll fire off
  // our callback when this number is equal to notebookList.length.
  var initializedNotebookCount = 0;

  // A list of all of our linked notebooks. Each notebook is of type Struct: LinkedNotebook.
  // See: http://www.evernote.com/about/developer/api/ref/Types.html#Struct_LinkedNotebook
  var notebookList = [];

  // A list of all our writable notebooks. each entry is a triple where item 0 is an index into notebookList, item 1 is
  // the authentication token required to access this notebook, and item 2 is a Struct: SharedNotebook.
  // see: http://www.evernote.com/about/developer/api/ref/Types.html#Struct_SharedNotebook
  var writableNotebookList = [];
  var bizNotebooks = {};

  // Map of shard IDs to JsonRpc objects set up for talking to those shards.
  var shardJsonRpcs = {};

  // We'll store timeouts here for various operations that might get stuck.
  var notebookListTimeout = null;

  // Notebook guids that have been authenticated/initialized. We keep these to prevent duplicate auth/init calls.
  var authenticatedNotebooks = {};
  var initializedNotebooks = {};

  function receiveNotebookList(data) {

    if (notebookListTimeout) {
      clearTimeout(notebookListTimeout);
      notebookListTimeout = null;
    }

    if (data && data.list && data.list.length) {
      notebookList = data.list;
      for (var i = 0; i < notebookList.length; i++) {
        initShardForNotebook(notebookList[i]);
      }

      // We've initialized all our RPC objects now, authenticate to the notebooks.
      for (var i = 0; i < notebookList.length; i++) {
        authenticateNotebook(notebookList[i]);
      }

    }
    // If there aren't any, we still need to fire our callback.
    else {
      if (callback) callback();
    }
  }

  function initShardForNotebook(book) {
    if (!book || !book.shardId) {
      log.warn("No shard found for notebook, not initializing.");
      return;
    }
    if (!shardJsonRpcs[book.shardId]){
      shardJsonRpcs[book.shardId] = new JsonRpc(book.shardId, [
        "NoteStore.getSharedNotebookByAuth",
        "NoteStore.authenticateToSharedNotebook",
        "NoteStore.listLinkedNotebooks"]);
      shardJsonRpcs[book.shardId].initWithAuthToken(authToken);
    }
  }

  function receiveNotebookData(guid, auth, data) {
    // Don't duplicate results.
    if (initializedNotebooks[guid]) return;
    initializedNotebooks[guid] = true;

    if (!auth) {
      log.warn("Received no data for notebook " + guid);
    }

    if (!data) {
      log.warn("Received no auth for notebook " + guid);
    }

    if (auth && data) {
      // @TODO: This is slow and has O(N^2) properties considering it gets called for each notebook. It'd be nice to make
      // it faster but it's probably not top priority at the moment given all the back and forth we have to do with the
      // server just to build this list.
      for (var i = 0; i < notebookList.length; i++) {
        if (data.shareKey && notebookList[i].shareKey === data.shareKey) {
          if (notebookList[i].businessId > 0) { // get business notebooks
            bizNotebooks[data.notebookGuid] = notebookList[i];
          }
          if (!data.notebookModifiable) {
            break;
          }
          if (notebookList[i].businessId == 0) { // don't include the business notebooks
            writableNotebookList.push([i, auth, data]);
          }
          break;
        }
      }
    }

    incrementInitializedNotebooks();
  }

  function incrementInitializedNotebooks() {
    // Keep track of how many notebooks we're waiting for. When we have all of them, fire our callback.
    initializedNotebookCount++;
    if (initializedNotebookCount == notebookList.length && callback)  {
      callback();
    }
  }

  function receiveAuthData(guid, data, error) {

    // Don't duplicate results.
    if (authenticatedNotebooks[guid]) return;
    authenticatedNotebooks[guid] = true;

    if (!data) {
      // log.warn("Got empty auth data (this can happen for non-writable notebooks). Counting as initialized.");
      incrementInitializedNotebooks();
      return;
    }
    var matches = data.authenticationToken.match(/^"?S=([^:]+)/);
    var shardId;
    if (!matches || !matches[1]) {
      log.warn("Auth token doesn't contain shard info. Token: " + data.authenticationToken);
      incrementInitializedNotebooks();
      return;
    }
    else {
      shardId = matches[1];
    }
    if (!shardJsonRpcs[shardId]) {
      log.warn("Got auth indicating shard '" + shardId + "' but don't have a corresponding JsonRpc object.");
      incrementInitializedNotebooks();
      return;
    }

    // Because the responses to these requests don't give back any state that can relate them back to the request that
    // prompted them, and we might have multiple requests in flight at the same time, we use a closure to pass our
    // authentication token along to the function that receives these responses.
    shardJsonRpcs[shardId].client.NoteStore.getSharedNotebookByAuth(function (nbData) {
      receiveNotebookData(guid, data.authenticationToken, nbData);
    }, data.authenticationToken);

    setTimeout(function(){receiveNotebookData(guid)}, TIMEOUT);

  }

  function authenticateNotebook(book) {
    var t = shardJsonRpcs[book.shardId];
    if (!t) {
      log.warn("No RPC object for shard: " + book.shardId);
      incrementInitializedNotebooks();
      return;
    }
    if (!book) {
      log.warn("Can't authenticate null notebook.");
      incrementInitializedNotebooks();
      return;
    }
    if (!book.shareKey) {
      // Public notebook (won't be writable).
      incrementInitializedNotebooks();
      return;
    }
    t.client.NoteStore.authenticateToSharedNotebook(function(data, error){receiveAuthData(book.guid, data, error)},
                                                    book.shareKey, t.authToken);
    setTimeout(function(){receiveAuthData(book.guid)}, TIMEOUT);
  }

  // Returns (some representation of) all known writable notebooks.
  function getWritableLinkedNotebooks() {
    var notebooks = {};
    notebooks.count = 0;
    for (var i = 0; i < writableNotebookList.length; i++) {
      var guid = writableNotebookList[i][2].notebookGuid;
      var shareKey = writableNotebookList[i][2].shareKey;
      var name = notebookList[writableNotebookList[i][0]].shareName;
      var owner = notebookList[writableNotebookList[i][0]].username;
      var auth = writableNotebookList[i][1];

      if (notebooks[guid]) {
        log.warn("Already have entry for notebook " + guid + ", which implies duplicate. Will be overwritten.");
      }
      else {
        notebooks.count++;
      }
      notebooks[guid] = {};
      notebooks[guid].name = name;
      notebooks[guid].owner = owner;
      notebooks[guid].auth = auth;
      notebooks[guid].guid = guid;
      notebooks[guid].shareKey = shareKey;
    }
    return notebooks;
  }

  // @TODO: This is stupidly slow, but it really doesn't currently matter.
  function getWritableLinkedNotebookByGuid(guid) {
    guid = guid.replace(/^shared_/, "");
    var nbs = getWritableLinkedNotebooks();
    if (nbs[guid]) {
      return nbs[guid];
    }
    return null;
  }

  function getBusinessNotebookByGuid(guid) {
    return bizNotebooks[guid];
  }

  // startup. Done at instantiation.
  jsonRpc.client.NoteStore.listLinkedNotebooks(receiveNotebookList, jsonRpc.authToken);
  var notebookListTimeout = setTimeout(receiveNotebookList, TIMEOUT);

  // Public API:
  this.getWritableLinkedNotebooks = getWritableLinkedNotebooks;
  this.getWritableLinkedNotebookByGuid = getWritableLinkedNotebookByGuid;
  this.getBusinessNotebookByGuid = getBusinessNotebookByGuid;

  Object.preventExtensions(this);
}

Object.preventExtensions(LinkedNotebooks);

