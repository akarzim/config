/*
 * shardId: the ID of the shard we should connect to. Usually the same shard as the user's account, except for linked
 * notebooks.
 * authToken: authentication token
 * pendingNote: the same pendingNote object that we pass to a JClipSubmitter object.
 */

function BinaryAttachmentSubmission(baseUrl, shardId, authToken, pendingNote, callback) {
  // We'll initialize these when we're sure we have work to do with them.
  var noteStoreTransport = null;
  var noteStoreProtocol = null;
  var noteStore = null;

  function startCreateNote() {
    pendingNote.status.submitAttempts++;
    pendingNote.status.blocked = true;

    initThrift();

    noteStore.createNote(authToken, buildNote(), {
      onSuccess: handleCreateNoteSuccess,
      onFailure: handleCreateNoteFailure
    });
  }

  function initThrift() {
    if (!noteStoreTransport) {
      if (SAFARI) {
        noteStoreTransport = new Thrift.THTTPClient(baseUrl + "/edam/note/" + shardId,
          "Safari Clipper", 0);
      }
      else {
        noteStoreTransport = new Thrift.THTTPClient(baseUrl + "/edam/note/" + shardId,
          "Chrome Clipper", 0);
      }
    }
    if (!noteStoreProtocol) {
      noteStoreProtocol = new Thrift.TBinaryProtocol(noteStoreTransport, false, false)
    }
    if (!noteStore) {
      noteStore = new NoteStoreClient(noteStoreProtocol, noteStoreProtocol);
    }
  }

  function buildNote() {
    var note = new Note();
    pendingNote.title = pendingNote.title.trim();
    if (pendingNote.title == "") {
      pendingNote.title = Browser.i18n.getMessage("quickNote_untitledNote");
    }
    note.title = pendingNote.title;
    var comment = "";
    if (pendingNote.noteFiling && pendingNote.noteFiling.comment) {
      var encoder = document.createElement("div");
      encoder.innerText = pendingNote.noteFiling.comment;
      comment = encoder.innerHTML.replace(/<br>/g, "<br/>") + "<hr/>";
    }
    note.content = "<?xml version='1.0' encoding='utf-8'?>" +
      "<!DOCTYPE en-note SYSTEM \"http://xml.evernote.com/pub/enml2.dtd\">" +
      "<en-note>" +
      comment +
      "<en-media type=\"" + pendingNote.pdf.mime + "\" hash=\"" + pendingNote.pdf.hexHash + "\" />";
    note.content += "</en-note>";
    note.notebookGuid = (pendingNote.notebook || pendingNote.linkedNotebook || pendingNote.bizNotebook).guid;
    if (pendingNote.noteFiling.tagNameList) {
      note.tagNames = pendingNote.noteFiling.tagNameList;
    }
    note.resources = buildResourceList();
    note.attributes = new NoteAttributes({ source: EDAM_NOTE_SOURCE_WEB_CLIP, sourceURL: pendingNote.url });
    return note;
  }

  function buildResourceList() {
    var resources = [];
    var resource = new Resource();
    resource.attributes = new ResourceAttributes({ sourceURL: pendingNote.pdf.url });
    if (/.+\/(.+)/.test(pendingNote.pdf.url)) {
      var name = /.+\/(.+)/.exec(pendingNote.pdf.url)[1];
      resource.attributes.fileName = decodeURIComponent(name);
    }
    resource.data = new Data({ body: pendingNote.pdf.binary });
    resource.mime = pendingNote.pdf.mime;
    resource.recognition = new Data({ body: pendingNote.pdf.binary });
    resources.push(resource);
    return resources;
  }

  function handleCreateNoteSuccess(note) {
    var callbackArgs = { noteGuid: note.guid, recipeClassification: "000" };
    if (note.attributes && note.attributes.classifications) {
      if (note.attributes.classifications.map) {
        callbackArgs.recipeClassification = note.attributes.classifications.map.recipe;
      }
    }
    callback(callbackArgs);
  }

  function handleCreateNoteFailure(error) {
    callback(null, error);
  }

  startCreateNote();
}
