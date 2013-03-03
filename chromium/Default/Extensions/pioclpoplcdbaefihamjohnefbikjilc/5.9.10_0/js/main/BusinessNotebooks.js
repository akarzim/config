function BusinessNotebooks(token, books) {
  var auth = token;
  var notebooks = books;

  function getBizNotebookByGuid(guid) {
    guid = guid.replace(/^biz_/, "");
    for (var n = 0; n < notebooks.length; n++) {
      if (notebooks[n].guid === guid) {
        notebooks[n].auth = auth;
        return notebooks[n];
      }
    }
    return null;
  }

  this.getBizNotebookByGuid = getBizNotebookByGuid;
}