function JclipSubmitter(authObject, pendingNote){
  "use strict";
  // We can only have either a linkedNotebook or a standard notebook or a biz
  // notebook
  var linked = false;
  var biz = false;

  if (!pendingNote) {
    log.error("Tried to created JclipSubmitter with no pendingNote object. Bailing out early.");
    return;
  }

  if (pendingNote.linkedNotebook) {
    linked = true;
  }
  else if (pendingNote.bizNotebook) {
    biz = true;
  }

  // Contains our authentication token. This is either supplied as part of pendingNote (for linked notebooks), or we'll
  // look it up before we submit our request. auth is the token for the shard we're clipping to. if we're clipping to
  // the biz shard via the context menu, we'll also need to get related notes from the personal shard, so use
  // secondAuth to store the token for the personal shard.
  var auth, bizAuth, submitAuth;

  // This will be the shard we're talking to.
  var shardId, bizShardId, submitShardId;

  // JsonRpc object that handles the actual submission.
  var submitter, rpc, bizRpc;

  var personalRelatedNotesResponse, bizRelatedNotesResponse, tempBizRelatedNotesResponse;
  var submissionResponse;
  var bizNotebooks = {};
  var bizNotebookCount = 0;

  var bootstrapInfo = new BootstrapInfo();

  // We need to be able to use stage.evernote.com (or wherever is specified), and we need to know if notifications are
  // enabled.
  var urlBase = extension.getOption("secureProto") + bootstrapInfo.get("serviceHost");
  var notify = extension.getOption("clipNotificationEnabled");

  var username = authObject.getUserInfo().authResult.user.username;
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
  var cached = cache[username].filingRecommendations.get(pendingNote.url);

  // Our default timeout length for notifications is 6 seconds.
  var notificationTimeoutMs = 6000;
  
  // We'll give up after this many retries for a single note.
  var maxSubmissionsPerNote = 10;

  // try to get the content of the page to get related notes, if there aren't
  // already related notes
  var tempContainer = document.createElement("div");
  tempContainer.innerHTML = pendingNote.content;
  pendingNote.recommendationText = pendingNote.title + " "
    + tempContainer.textContent;
  var relatedResultSpec = {
    includeTitle: true,
    includeUpdated: true,
    includeAttributes: true,
    includeLargestResourceMime: true,
    includeNotebookGuid: true,
    maxResults: 3
  };
  var siteResultSpec = {
    maxResults: 0
  };
  var similarNotesRequest = {
    relatedNotesMetadataResultSpec: relatedResultSpec,
    sameSiteNotesMetadataResultSpec: siteResultSpec
  };

  // A linkedNotebook should provide its own auth token. A standard notebook
  // does not necessarily, so we'll look one up in the user's cookies.
  try {
    authObject.getAuthTokens(receiveAuthTokens, true);
  } catch(e) {
    console.error("Error getting auth token(s) from object: " + JSON.stringify(e));
  }

  function receiveAuthTokens(tokens) {
    auth = tokens.authenticationToken;
    if (tokens.bizAuthenticationToken) {
      bizAuth = tokens.bizAuthenticationToken;
    }
    // setup the credentials for submitting
    if (linked) {
      submitAuth = pendingNote.linkedNotebook.auth;
    }
    else if (biz) {
      submitAuth = bizAuth;
    }
    else {
      submitAuth = auth;
    }

    if (auth) {
      // set up shard ids
      shardId = /^"?S=(s\d+)/.exec(auth)[1];
      if (bizAuth) {
        bizShardId = /^"?S=(s\d+)/.exec(bizAuth)[1];
      }
      submitShardId = /^"?S=(s\d+)/.exec(submitAuth)[1];
      start();
    }
    else {
      applicationLayerErrorHandler({msg: "authenticationToken"});
    }
  }

  function start() {
    // PDF
    if (pendingNote.pdf) {
      // get related notes
      var worker = new Worker("js/main/PdfTextExtractor.js");
      worker.addEventListener("message", function(evt) {
        if (evt.data.type == "recommendationText") {
          pendingNote.recommendationText = evt.data.message;
          rpc = new JsonRpc(null, ["NoteStoreExtra.getFilingRecommendations",
            "NoteStore.findNotesMetadata"]);
          JsonQueue.initShard(shardId);
          rpc.initWithAuthToken(auth, getPersonalRelatedNotes);
          if (bizAuth) {
            bizRpc = new JsonRpc(null, ["NoteStoreExtra.getFilingRecommendations"]);
            JsonQueue.initShard(bizShardId);
            bizRpc.initWithAuthToken(bizAuth, getBizRelatedNotes);
          }
          worker.terminate();
        }
        else if (evt.data.type == "warning") {
          console.warn(evt.data.message);
        }
        else if (evt.data.type == "error") {
          console.error(evt.data.message);
        }
        else if (evt.data.type == "info") {
          console.info(evt.data.message);
        }
        else {
          console.log(evt.data.message);
        }
      }, false);
      worker.postMessage({ pdf: pendingNote.pdf.binary });
      new BinaryAttachmentSubmission(urlBase, submitShardId, submitAuth,
        pendingNote, handleSubmissionResponse);
    }
    else {
      submitter = new JsonRpc(null, ["NoteStoreExtra.clipNote",
        "NoteStoreExtra.clipNoteAndFindSimilar", "NoteStore.getNote"]);
      JsonQueue.initShard(submitShardId);
      if (!pendingNote.relatedNotes || pendingNote.relatedNotes.length == 0) {
        if (linked) {
          rpc = new JsonRpc(null, ["NoteStoreExtra.getFilingRecommendations",
            "NoteStore.findNotesMetadata"]);
          if (bizAuth) {
            bizRpc = new JsonRpc(null, ["NoteStoreExtra.getFilingRecommendations"]);
          }
        }
        else if (biz) {
          rpc = new JsonRpc(null, ["NoteStoreExtra.getFilingRecommendations",
            "NoteStore.findNotesMetadata"]);
          bizRpc = new JsonRpc(null, ["NoteStore.getNotebook"]);
        }
        else {
          if (bizAuth) {
            bizRpc = new JsonRpc(null, ["NoteStoreExtra.getFilingRecommendations"]);
          }
        }
        if (rpc) {
          JsonQueue.initShard(shardId);
        }
        if (bizRpc) {
          JsonQueue.initShard(bizShardId);
        }
      } else {
        // need this to determine if the user already has food notes
        rpc = new JsonRpc(null, ["NoteStore.findNotesMetadata"]);
        JsonQueue.initShard(shardId);
      }

      submitter.initWithAuthToken(submitAuth, function() {
        if (bizRpc) {
          bizRpc.initWithAuthToken(bizAuth, function() {
            if (rpc) {
              rpc.initWithAuthToken(auth, submit);
            }
            else {
              submit();
            }
          });
        }
        else {
          if (rpc) {
            rpc.initWithAuthToken(auth, submit);
          }
          else {
            submit();
          }
        }
      });
    }
  }

  function submit() {

    if (!pendingNote.status) {
      applicationLayerErrorHandler({msg: "malformedNote"});
      return;
    }

    // A different submitter is working on this.
    if (pendingNote.status.blocked === true) {
      return;
    }

    // If we've retired this note too many times, we give up.
    if (pendingNote.status.submitAttempts >= maxSubmissionsPerNote) {
      clearNote();
      applicationLayerErrorHandler({msg: "tooManyRetries"});
      return;
    }

    // Sanitize our title, because the service throws unexpected exceptions for certain inputs.
    if (pendingNote.title.match(/^\s*$/)) pendingNote.title = Browser.i18n.getMessage("quickNote_untitledNote");

    // make the comment part of the content because the server doesn't accept emoji when it's part of the comment, but
    // does if it's part of the content
    if (pendingNote.noteFiling && pendingNote.noteFiling.comment) {
      pendingNote.content = pendingNote.noteFiling.comment.replace(/\n/g, "<br/>") + "<hr/>" + pendingNote.content;
      delete pendingNote.noteFiling.comment;
    }

    // Otherwise we'll submit it.
    pendingNote.status.submitAttempts++;
    pendingNote.status.blocked = true;
    // We will use this call for saving to linked notebooks even if we don't have related notes, because otherwise
    // we'll get permission errors trying to find similar notes in soemone else's account.
    if (pendingNote.relatedNotes || linked) {
      if (linked && !pendingNote.relatedNotes) {
        // get related notes from personal and business shards
        getPersonalRelatedNotes();
        if (bizRpc) {
          getBizRelatedNotes();
        }
      }
      submitter.client.NoteStoreExtra.clipNote(handleSubmissionResponse,
        submitAuth, pendingNote.noteFiling, pendingNote.title, pendingNote.url,
        pendingNote.content);
    }
    else {
      JsonQueue.handleExpensiveOpRequest(submitShardId,
        submitter.client.NoteStoreExtra.clipNoteAndFindSimilar,
        handleSubmissionResponse, submitAuth, pendingNote.noteFiling,
        pendingNote.title, pendingNote.url, pendingNote.content,
        similarNotesRequest);
      if (submitAuth == auth) { // have personal notes, need biz notes
        if (bizAuth) {
          getBizRelatedNotes();
        }
      }
      else if (submitAuth == bizAuth) { // have biz notes, need personal notes
        getPersonalRelatedNotes();
      }
    }
  }

  function receivePersonalRelatedNotes(response, exception) {
    if (response) {
      personalRelatedNotesResponse = response;

      cache[username].filingRecommendations.updateEntry({
        key: pendingNote.url,
        content: {
          pers: response
        }
      });
      Persistent.set("userCache", cache);

      if (!bizAuth || (bizAuth && bizRelatedNotesResponse)) {
        receivedAllNotes();
      }
    } else {
      console.log(exception);
    }
  }

  function receiveBizRelatedNotes(response, exception) {
    if (response) {
      bizRelatedNotesResponse = response;

      cache[username].filingRecommendations.updateEntry({
        key: pendingNote.url,
        content: {
          biz: response
        }
      });
      Persistent.set("userCache", cache);

      if (personalRelatedNotesResponse) {
        receivedAllNotes();
      }
    } else {
      console.log(exception);
    }
  }

  function receivedAllNotes() {
    var notes;
    if (bizRelatedNotesResponse) {
      if (!personalRelatedNotesResponse.relatedNotes) {
        personalRelatedNotesResponse.relatedNotes = { list: [] };
      }
      if (!bizRelatedNotesResponse.relatedNotes) {
        bizRelatedNotesResponse.relatedNotes = { list: [] };
      }
      if (bizRelatedNotesResponse.containingNotebooks) {
        var books = bizRelatedNotesResponse.containingNotebooks.list;
        for (var b = 0; b < books.length; b++) {
          var book = books[b];
          bizNotebooks[book.guid] = { joined: book.hasSharedNotebook,
            name: book.notebookDisplayName, contact: book.contactName };
        }
      }
      notes = combineNotes(personalRelatedNotesResponse.relatedNotes.list,
        bizRelatedNotesResponse.relatedNotes.list);
    }
    else {
      notes = personalRelatedNotesResponse.relatedNotes;
    }
    if (submissionResponse) {
      submissionResponse.relatedNotes = notes;
      handleComplete(submissionResponse, null);
    }
    else {
      Browser.sendToTab(pendingNote.originatingTab, {
        name: "content_relatedNotesReady", relatedNotes: notes
      });
    }
  }

  function handleSubmissionResponse(response, exception) {
    if (exception) {
      handleComplete(null, exception);
    }
    else {
      submissionResponse = response;
      if (typeof submissionResponse === "string") {
        submissionResponse = { noteGuid: submissionResponse };
      }
      if (!Persistent.get(authObject.getUserInfo().authResult.user.id + "_foodPromoShown")) {
        if (submissionResponse.recipeClassification) {
          handleRecipeClassification(submissionResponse.recipeClassification);
        } else {
          getRecipeClassification(submissionResponse.noteGuid);
        }
      }
      if (response.relatedNotes) { // if response is from clipNoteAndFindSimilar
        if (submitAuth == auth) {
          personalRelatedNotesResponse = { relatedNotes: response.relatedNotes };
        }
        else if (submitAuth == bizAuth) {
          if (response.relatedNotes.list.length > 0) {
            var containingNotebooks = [];
            for (var i = 0; i < response.relatedNotes.list.length; i++) {
              var notebookGuid = response.relatedNotes.list[i].notebookGuid;
              if (containingNotebooks.indexOf(notebookGuid) < 0) {
                containingNotebooks.push(notebookGuid);
              }
            }
            bizNotebookCount = containingNotebooks.length;
            for (var i = 0; i < bizNotebookCount; i++) {
              bizRpc.client.NoteStore.getNotebook(addBizNotebook, bizAuth,
                containingNotebooks[i]);
            }
            tempBizRelatedNotesResponse = { relatedNotes: response.relatedNotes };
          }
          else {
            bizRelatedNotesResponse = { relatedNotes: response.relatedNotes };
          }
        }
      }
      if (pendingNote.relatedNotes || (personalRelatedNotesResponse
          && (!bizAuth || (bizAuth && bizRelatedNotesResponse)))) {
        handleComplete(submissionResponse, null);
      }
    }
  }

  function addBizNotebook(response) {
    if (response) {
      bizNotebooks[response.guid] = { joined: (response.sharedNotebooks != null),
        name: response.name, contact: response.contact.name };
      if (bizNotebookCount === Object.keys(bizNotebooks).length) {
        bizRelatedNotesResponse = tempBizRelatedNotesResponse;
        if (personalRelatedNotesResponse) {
          receivedAllNotes();
        }
      }
    }
  }

  function combineNotes(persRelatedNotes, bizRelatedNotes) {
    // combine related notes with heuristic
    var slotsLeft = Math.max(3 - persRelatedNotes.length, 2);
    var numBiz = Math.min(bizRelatedNotes.length, slotsLeft);
    var notes = persRelatedNotes.slice(0, 3 - numBiz);
    for (var i = 0; i < numBiz; i++) {
      bizRelatedNotes[i].inBusinessNotebook = true;
      if (!bizNotebooks[bizRelatedNotes[i].notebookGuid].joined) {
        bizRelatedNotes[i].notebookName = bizNotebooks[bizRelatedNotes[i].notebookGuid].name;
        bizRelatedNotes[i].contact = bizRelatedNotes[i].attributes.lastEditedBy
          || bizRelatedNotes[i].attributes.author || bizNotebooks[bizRelatedNotes[i].notebookGuid].contact;
      }
      else {
        var linkedGuid = Browser.extension.getBackgroundPage().extension
          .getLinkedNotebookGuidOfBizNotebook(bizRelatedNotes[i].notebookGuid);
        if (linkedGuid) {
          bizRelatedNotes[i].linkedNotebookGuid = linkedGuid;
        }
      }
      bizRelatedNotes[i].shardId = bizShardId;
      notes.push(bizRelatedNotes[i]);
    }

    if (notes.length > 0) {
      return { list: notes };
    }
    return null;
  }

  function handleComplete(response, exception) {
    // clipNote will return a plain guid, but clipNoteAndFindSimilar returns a structure with a noteGuid property. We
    // normalize this here. Also release the json queue because if it's a result of NoteStoreExtras.clipNote, it won't
    // have passed through handleAPIResponses.
    if (typeof response === "string") {
      response = {noteGuid: response};
    }

    pendingNote.status.blocked = false;
    if (!exception) pendingNote.status.success = true;

    if (exception) {
      if (exception.code === 0 && exception.message === "") {
        // Looks like a transport error.
        httpErrorHandler();
      }
      else {
        applicationLayerErrorHandler(exception);
      }
    }
    else {
      delete response.javaClass;
      successHandler(response);
    }
    extension.setBadge();
  }

  function raiseNotification(message) {
    // New stuff.
    message.title = pendingNote.title ? pendingNote.title : "";
    message.lookupKey = pendingNote.lookupKey;
    if (pendingNote.originatingTab) {
      Browser.sendToTab(pendingNote.originatingTab, {name:"content_showClipResult", message: message});
    }
  }

  function httpErrorHandler(){
    var d = new Date();
    pendingNote.status.lastFailureTime = d.getTime();
    var msg = { success: false, errorType: "http", discardMessage: false };

    // All errors clear notes if we can't notify the user that they failed.
    notify ? raiseNotification(msg) : clearNote();
  }

  // Takes the response text from an XMLHttpRequest.
  // Returns true if there were errors, false if not.
  function applicationLayerErrorHandler(exception) {

    var d = new Date();
    if (!pendingNote.status) pendingNote.status = {};
    pendingNote.status.lastFailureTime = d.getTime();

    if (exception.msg) {
      log.warn("Application layer exception: " + exception.msg);
    }
    else {
      log.warn("Application layer exception: ");
      log.warn(exception);
    }

    if (exception && exception.trace) {
      if (exception.trace.match(/EDAMNotFoundException/) && exception.trace.match(/identifier:Note\.notebookGuid/)) {
        // Unkonwn/deleted notebook.
        exception.msg = "unknownNotebook";
      }
      else if (exception.trace.match(/EDAMUserException/) && exception.trace.match(/QUOTA_REACHED/)) {
        exception.msg = "quotaExceeded";
      }
    }
    else if (exception && exception instanceof EDAMUserException) {
      if (exception.errorCode == 7 && exception.parameter == "Accounting.uploadLimit") {
        exception.msg = "quotaExceeded";
      }
      else if (exception.errorCode == 6 && exception.parameter == "Note.size") {
        exception.msg = "noteSizeExceeded";
      }
    }
    else if (exception && exception instanceof EDAMNotFoundException) {
      if (exception.identifier == "Note.notebookGuid") {
        exception.msg = "unknownNotebook";
      }
    }

    var msg = { success: false, errorType: exception.msg, discardMessage: false };

    // Could do more, so far they don't.
    switch (exception.msg) {
      case "authenticationToken":
      case "tooManyRetries":
      case "FIGURE_OUT_QUOTA_MESSAGE_HERE:":
      default:
    }

    // All errors clear notes if we can't notify the user that they failed.
    notify ? raiseNotification(msg) : clearNote();
  }

  function successHandler(message) {
    var msg = { success: true};
    for (var i in message) {
      msg[i] = message[i];
    }
    msg.shardId = submitShardId;
    // This gets special-cased because I don't think it's possible to use the 'view' or 'edit' actions on linked notes.
    if (linked) {
      msg.linked = true;
      msg.shareKey = pendingNote.linkedNotebook.shareKey;
      msg.linkedNotebookGuid = pendingNote.linkedNotebook.guid;
    }
    else if (biz) {
      msg.inBusinessNotebook = true;
      msg.notebookGuid = pendingNote.bizNotebook.guid;
      msg.linkedNotebookGuid = pendingNote.bizNotebook.linkedGuid;
    }

    notify ? raiseNotification(msg) : clearNote();
  }

  // Clears this note from the main submission list by calling the 'clear' event handler in the main extension. We don't
  // actually pass a message here because messages don't get delivered to the same window that sent them.
  function clearNote() {
    extension.msgHandlerGetNoteByKeyAndClear({name: "main_getNoteByKeyAndClear", lookupKey: pendingNote.lookupKey},
      null, function(){});
  }

  function getPersonalRelatedNotes() {
    if (cached && cached.content && cached.content.pers) {
      receivePersonalRelatedNotes(cached.content.pers);
    } else {
      cache[username].filingRecommendations.startEntry(pendingNote.url);
      JsonQueue.handleExpensiveOpRequest(shardId,
        rpc.client.NoteStoreExtra.getFilingRecommendations,
        receivePersonalRelatedNotes, auth, {text: pendingNote.recommendationText,
        url: pendingNote.url, relatedNotesResultSpec: relatedResultSpec});
    }
  }

  function getBizRelatedNotes() {
    if (cached && cached.content && cached.content.biz) {
      receiveBizRelatedNotes(cached.content.biz);
    } else {
      cache[username].filingRecommendations.startEntry(pendingNote.url);
      JsonQueue.handleExpensiveOpRequest(bizShardId,
        bizRpc.client.NoteStoreExtra.getFilingRecommendations,
        receiveBizRelatedNotes, bizAuth, {text: pendingNote.recommendationText,
        url: pendingNote.url, relatedNotesResultSpec: relatedResultSpec});
    }
  }

  function handleRecipeClassification(recipeClassification) {
    function receiveFoodNotes(response, exception) {
      if (response) {
        Persistent.set(authObject.getUserInfo().authResult.user.id + "_foodPromoShown", true);
        if (!response.totalNotes) {
          Browser.sendToTab(pendingNote.originatingTab, { name: "showFoodPromo" });
        }
      } else {
        console.error(exception);
      }
    }

    if (recipeClassification == "001" || recipeClassification == "002") {
      rpc.client.NoteStore.findNotesMetadata(receiveFoodNotes, auth,
        { words: "contentClass:evernote.food.*" }, 0, 0, {});
    }
  }

  // detect if clipped note is a recipe and show the Evernote Food promo if
  // necessary
  function getRecipeClassification(noteGuid) {
    function receiveRecipeClassification(note, exception) {
      if (note.attributes && note.attributes.classifications) {
        if (note.attributes.classifications.map) {
          handleRecipeClassification(note.attributes.classifications.map.recipe);
        }
      }
    }

    submitter.client.NoteStore.getNote(receiveRecipeClassification, submitAuth,
      noteGuid, false, false, false, false);
  }

  Object.preventExtensions(this);
}

Object.preventExtensions(JclipSubmitter);
