// This represents a Notebook. It does *not* represent a "shared" or "linked" notebook. This should only be used for
// Notebooks owned by the current user.

// http://www.evernote.com/about/developer/api/ref/Types.html#Struct_Notebook
function Notebook (initObj){
  "use strict";

  this.guid = null;
  this.name = null;
  this.updateSequenceNum = null;
  this.defaultNotebook =  null;
  this.serviceCreated = null;
  this.serviceUpdated = null;
  this.publishing = null;
  this.published = null;
  this.stack = null;
  this.sharedNotebookIds = null;

  // That's all the fields we get.
  Object.preventExtensions(this);

  // We can pass in other duck-typed notebook-like objects, which is convenient for backwards compatibility.
  for (var i in initObj) {
    if (typeof this[i] !== "undefined") {
      this[i] = initObj[i];
    }
  }
}

Object.preventExtensions(Notebook);
