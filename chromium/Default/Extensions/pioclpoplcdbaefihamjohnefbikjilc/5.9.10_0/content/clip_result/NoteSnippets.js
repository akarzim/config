function NoteSnippets(attachmentPoint, baseUrl, userId, shardId, client) {
  "use strict";

  var noteList;
  var totalCount = 0;
  var hasNotebookName = false;

  function setNotes(_noteList, _totalCount) {
    if (_noteList) {
      noteList = _noteList;
    }
    totalCount = _totalCount;

    if (!noteList) {
      return;
    }
    start();
  }

  function start() { 
    var relatedNotes = document.querySelector("#relatedNotes");
    if (relatedNotes) {
      renderBlocks(noteList);
    }
  }

  function show() {
    document.querySelector("#relatedNotes").className += " expanded";
  }

  function renderBlocks(notes) {
    var relatedNotes = attachmentPoint;
    if (relatedNotes) {
      relatedNotes.innerHTML = "";

      var table = document.createElement("table");
      var tr, tr2;
      for (var i in notes) {
        if (i % 3 == 0) {
          tr = document.createElement("tr");
          tr2 = document.createElement("tr");
          table.appendChild(tr);
          table.appendChild(tr2);
        }
        var td = document.createElement("td");
        var td2 = document.createElement("td");
        td.appendChild(renderBlock(notes[i], i));
        var notebookName = renderNotebookName(notes[i]);
        if (notebookName) {
          td2.appendChild(notebookName);
        }
        td2.className = "notebookNameTd";
        tr.appendChild(td);
        tr2.appendChild(td2);
      }

      // If there were no nots at all.
      if (!tr) {
        return;
      }

      while(tr.children.length < 3) {
        var td = document.createElement("td");
        var td2 = document.createElement("td");
        td.innerHTML = "&nbsp;";
        tr.appendChild(td);
        tr2.appendChild(td2);
      }
      relatedNotes.appendChild(table);

      if (totalCount && totalCount > notes.length) {
        relatedNotes.appendChild(getContinuation());
      }
      if (notes.length > 3) {
        var g1 = relatedNotes.parentNode.querySelector(".notesGradientTop");
        if (!g1) {
          var gradientTop = document.createElement("div");
          gradientTop.className = "notesGradientTop";
          relatedNotes.parentNode.appendChild(gradientTop);
        }

        var g2 = relatedNotes.parentNode.querySelector(".notesGradient");
        if (!g2) {
          var gradient = document.createElement("div");
          gradient.className = "notesGradient";
          relatedNotes.parentNode.appendChild(gradient);
        }
      }
    }
  }

  function getContinuation() {
    var left = totalCount - noteList.length;
    var message;
    if (left == 1) {
      message = Browser.i18n.getMessage("popup_oneMoreNoteLink");
    }
    else {
      message = Browser.i18n.getMessage("popup_moreNotesLink", [left]);
    }
    var div = document.createElement("div");
    div.className = "moreOnServer";
    div.addEventListener("click", function() {
      Browser.sendToExtension({name: "main_recordActivity"});
      parent.postMessage({name: "content_openSiteNotes", baseUrl: baseUrl}, "*");
    });
    div.innerHTML = message;
    return div;
  }

  function getDateString(date) {
    var lang = navigator.language;
    var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    var months = ["Jan", "Feb", "March", "April", "May", "June", "July", "Aug", "Sept", "Oct", "Nov", "Dec"];
    var today = new Date();

    // See here: http://en.wikipedia.org/wiki/Date_format_by_country
    var formatINTL = "%day %monthName %year";
    var formatUS = "%monthName %day, %year";
    var formatCN = "%year\u5E74%month\u6708%day\u65E5";
    var formatJP = "%year\u5E74%monthName%day\u65E5";

    // If this note is from today, we'll just return that.
    if ((date.getMonth() === today.getMonth()) && (date.getDate() === today.getDate()) &&
        (date.getFullYear() === today.getFullYear())) {
      return Browser.i18n.getMessage("Today");
    }

    // If this note is from the last week, (but not the day seven days ago with the same name as today, which would be
    // ambiguous), then we return just the name of the day.
    if (today.valueOf() - date.valueOf() <= (1000 * 60 * 60 * 24 * 7)) {
      if (today.getDay() !== date.getDay()) {
        return Browser.i18n.getMessage(days[date.getDay()]);
      }
    }

    var format = formatINTL;
    var day = date.getDate();
    if (lang.match(/en-us/i)) {
      format = formatUS;
      if ((day == 1) || (day == 21) || (day == 31)) day = day + "st";
      else if ((day == 2) || (day == 22)) day = day + "nd";
      else if ((day == 3) || (day == 23)) day = day + "rd";
      else day = day + "th";
    }
    if (lang.match(/^zh/i)) {
      format = formatCN;
    } else if (lang.match(/^ja/i)) {
      format = formatJP;
    }
    format = format.replace(/%day/, day);
    format = format.replace(/%year/, date.getFullYear());
    format = format.replace(/%monthName/, Browser.i18n.getMessage(months[date.getMonth()]));
    format = format.replace(/%month/, date.getMonth() + 1);
    return format;
  }

  function renderBlock(note, offset) {
    var img;
    var card = document.createElement("div");
    card.className = "noteBlock";
    card.addEventListener("click", function() {
      Browser.sendToExtension({name: "main_recordActivity"});
      var noteClient = client;
      if (note.notebookName || note.contact) { // only has notebook name if it's in the library and unjoined
        noteClient = "WEB";
      }
      var url = GlobalUtils.getNoteURI(noteClient, baseUrl, {shardId: note.shardId || shardId, noteGuid: note.guid,
        inBusinessNotebook: note.inBusinessNotebook, notebookGuid: note.notebookGuid,
        linkedNotebookGuid: note.linkedNotebookGuid, shareKey: note.shareKey },
        "view", userId);
      if (noteClient == "WEB") {
        Browser.sendToExtension({name: "main_openWindow", width: 800, height: 600, url: url}); // open in new window
      }
      else if (client == "DESKTOP") {
        window.location.assign(url);
      }
    });

    if (note.thumbsquare) {
      var size = 110;
      if (devicePixelRatio >= 1.5) size *= 2; // Retina version.
      img = document.createElement("img");
      if (note.snippet) {
        size = 60;
        if (devicePixelRatio >= 1.5) size *= 2; // Retina version.
        img.className = "smallimage";
      }
      if (note.inBusinessNotebook) {
        note.thumbsquare = note.thumbsquare.replace("/thm", "/business/dispatch/thm");
      }
      img.src = baseUrl + note.thumbsquare + "?size=" + size;
    }

    var snippetBlock = document.createElement("div");
    snippetBlock.className = "snippet";

    if (note.snippet) {
      var snippet = document.createElement("p");
      snippet.innerHTML = note.snippet;
      snippet.className = "snippettext";
      if (note.thumbsquare) {
        snippet.className += " mixed";
      }
    }

    var title = document.createElement("h1");
    title.textContent = note.title;

    var date = document.createElement("p");
    var dateObj = new Date(note.updated);
    date.textContent = getDateString(dateObj);
    date.className = "date";

    snippetBlock.appendChild(title);
    snippetBlock.appendChild(date);
    if (note.snippet) {
      snippetBlock.appendChild(snippet);
    }
    if (note.thumbsquare) {
      snippetBlock.appendChild(img);
    }

    card.appendChild(snippetBlock);

    return card;
  }

  function renderNotebookName(note) {
    if (note.contact || note.notebookName) {
      hasNotebookName = true;
      var notebookName = document.createElement("div");
      // use different icons if we're showing a person's name vs a notebook name
      if (note.contact) {
        notebookName.className = "contactName";
      } else {
        notebookName.className = "notebookName";
      }
      notebookName.innerText = note.contact || note.notebookName;
      notebookName.title = notebookName.innerText; // user can hover over to see the full text if it's over the limit
      return notebookName;
    }
    return null;
  }

  function hasAtLeastOneNotebookName() {
    return hasNotebookName;
  }

  setNotes();

  this.setNotes = setNotes;
  this.show = show;
  this.renderBlocks = renderBlocks;
  this.hasAtLeastOneNotebookName = hasAtLeastOneNotebookName;

  Object.preventExtensions(this);
}
Object.preventExtensions(NoteSnippets);
