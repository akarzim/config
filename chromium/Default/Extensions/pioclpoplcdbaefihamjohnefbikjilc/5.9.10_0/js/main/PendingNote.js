// A PendingNote is basically just a struct that represents a note we can submit, with a few extra fields attached for
// keeping track of submission progress. You can Optionally pass a ClipNote object or a Notebook to the constructor to
// initialize your PendingNote to make this more interoperable with existing code. The ability to pass a ClipNote will
// be deprecated when that construct goes away.

function PendingNote (data, notebooks, tab) {
  "use strict";
  this.content = null;
  this.title = null;
  this.url = null;
  this.pdf = null;
  this.recommendationText = null;

  // See evernote/web/util/NoteStoreExtra.java for all the fields you can store in here.
  this.noteFiling = {};
  this.noteFiling.createTags = true;
  this.notebook = null;
  this.linkedNotebook = null;
  this.bizNotebook = null;
  this.originatingTab = null;
  this.relatedNotes = null;
  this.siteNotes = null;

  // For keeping track of what we're doing with this note.
  this.status = {};
  this.status.submitAttempts = 0;
  this.status.blocked = false;
  this.status.lastFailureTime = null;
  this.status.success = false; // Set to true when we've successfully submitted this note.

  // This lets us request this same object from the background page. We can hand this token between different pages and
  // they'll still be able to interact with this note.
  this.lookupKey = null;

  if (tab) {
    this.originatingTab = tab;
  }

  if (notebooks["notebook"]) {
    this.notebook = notebooks["notebook"];
  }
  else if (notebooks["linkedNotebook"]) {
    this.linkedNotebook = notebooks["linkedNotebook"];
  }
  else if (notebooks["bizNotebook"]) {
    this.bizNotebook = notebooks["bizNotebook"];
  }

  // The format we'll need to submit this in doesn't really match the format of the underlying data structures so we do
  // some pre-processing.
  if (this.notebook) {
    this.noteFiling.notebookGuid = this.notebook.guid;
  }
  else if (this.linkedNotebook) {
    this.noteFiling.notebookGuid = this.linkedNotebook.guid;
  }
  else if (this.bizNotebook) {
    this.noteFiling.notebookGuid = this.bizNotebook.guid;
  }

  if (data) {
    if (data.content) this.content = data.content;
    if (data.title) this.title = data.title;
    if (data.url) this.url = data.url;
    if (data.comment) this.noteFiling.comment = data.comment;
    if (data.relatedNotes) this.relatedNotes = data.relatedNotes;

    if (data.tagNames && data.tagNames.length) {
      this.noteFiling.tagNameList = data.tagNames;
    }
    if (data.pdf) {
      this.pdf = data.pdf;
      this.pdf.binary = new Uint8Array(this.pdf.binary);
    }
  }

  if (!this.content && this.content !== "") {
    this.content = "";
  }
  if (!this.title && this.title !== "") {
    if (tab.title && tab.title != tab.url) {
      this.title = tab.title;
    } else {
      this.title = "";
    }
  }
  this.title = this.title.substring(0, EDAM_NOTE_TITLE_LEN_MAX);

  // Clear any tags from linked notebooks as we don't have permission to set them. also clear from business notebooks
  // that we don't have permission to set tags in
  if (this.linkedNotebook || (this.bizNotebook && this.bizNotebook.restrictions.noCreateTags)) {
    delete this.noteFiling.tagNameList;
  }
  
  Object.preventExtensions(this);
}
Object.preventExtensions(PendingNote);
