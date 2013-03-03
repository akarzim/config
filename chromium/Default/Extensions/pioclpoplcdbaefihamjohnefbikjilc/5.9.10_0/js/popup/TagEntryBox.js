function TagEntryBox() {
  "use strict";

  // We're just a special div.
  var self = document.createElement("div");
  self.className = "tagEntryBox";

  var userInteraction = false;
  var maxTags = 20;

  var tagTrie = new TagTrie();

  // Various text placeholders.
  var placeholders = {
    "ADD": "quickNote_addTags",
    "DISABLED": "quickNote_tagsDisabled",
    "BLANK": "",
    "FULL": "tagNamesNotInRange"
  };

  var mouseInAutoComplete = false;

  // Add our child elements.
  var existingTagContainer = document.createElement("div");
  var tagEntryField = document.createElement("input");
  var clearAllControl = document.createElement("img");
  var autoCompleteBox = document.createElement("div");

  existingTagContainer.className = "existingTagContainer";

  autoCompleteBox.className = "autoComplete";
  var autoCompleteVisible = false;
  var autoCompleteSelection = null;

  clearAllControl.className = "removeTags";
  tagEntryField.type = "text";
  tagEntryField.maxLength = "50";
  tagEntryField.placeholder = Browser.i18n.getMessage(placeholders["ADD"]);

  clearAllControl.title = Browser.i18n.getMessage("clearTagsToolTip");
  clearAllControl.src = "images/clear_icon.png";
  if (devicePixelRatio >= 2) clearAllControl.src = "images/clear_icon@2x.png";
  clearAllControl.width = "15";
  clearAllControl.height = "15";

  var lastTextValue = "";
  
  tagEntryField.addEventListener("keyup", handleTextEntry);
  tagEntryField.addEventListener("blur", blurTextEntry);
  clearAllControl.addEventListener("click", clearAll);

  autoCompleteBox.addEventListener("click", function(evt){evt.stopPropagation();});

  // We want to be able to detect when the user is scrolling this.
  autoCompleteBox.addEventListener("mouseover", function(evt){mouseInAutoComplete = true});
  autoCompleteBox.addEventListener("mouseout", function(evt){mouseInAutoComplete = false});

  self.addEventListener("click", focusEntry);

  // We attach a click handler to the whole window, so that if anyone clicks on it, and we don't capture that, then
  // we'll close the autocomplete box.
  window.addEventListener("click", hideAutoComplete);
  window.addEventListener("keyup", hideAutoCompleteFromEsc);

  self.appendChild(existingTagContainer);
  existingTagContainer.appendChild(tagEntryField);
  self.appendChild(clearAllControl);
  self.appendChild(autoCompleteBox);

  // The list of tags we've added.
  var tags = [];
  var tagMap = {};

  // The elements we have for displaying tags.
  var tagElements = {};

  // The list of tags we'll autocomplete from.
  var autoCompleteTags = [];

  function focusEntry(evt) {
    tagEntryField.focus();
  }

  function clearAll() {
    for (var i = tags.length - 1; i >= 0; i--) {
      clearTag(null, tags[i]);
    }
  }

  function blurTextEntry(evt) {
    if (!autoCompleteVisible || !mouseInAutoComplete) {
      resetPlaceholder();
    }
  }

  function resetPlaceholder() {
    // Simualte the user pressing enter.
    handleTextEntry.call(tagEntryField, {keyCode: 9, nonUserEvent: true});
    if (tags.length == maxTags) {
      tagEntryField.placeholder = Browser.i18n.getMessage(placeholders["FULL"]);
      tagEntryField.className = "wide";
      tagEntryField.disabled = true;
    }
    else {
      tagEntryField.placeholder = Browser.i18n.getMessage(placeholders["ADD"]);
      tagEntryField.className = "";
      tagEntryField.disabled = false;
    }
    hideAutoComplete();
  }

  function createTag(tagName) {
    var span = document.createElement("span");
    span.className = "autoTag";
    var img = document.createElement("img");
    img.width = "10";
    img.height = "10";
    img.src = "images/tag_lozenge_dismiss.png";
    if (devicePixelRatio >= 2) img.src = "images/tag_lozenge_dismiss@2x.png";

    img.addEventListener("click", function(evt){clearTag(evt, tagName)});
    span.textContent = tagName;
    span.appendChild(img);
    tagElements[tagName.toLowerCase()] = span;
    tags.push(tagName);
    tagMap[tagName.toLowerCase()] = true;
    existingTagContainer.insertBefore(span, tagEntryField);
    clearAllControl.style.display = "inline";
  }

  function clearTag(evt, tagName) {
    if (!tagName) return;
    var tagIndex = tags.indexOf(tagName);
    if (tagIndex == -1) return;

    userInteraction = true; // there's currently no other way to clear a tag other than user interaction.
    var element = tagElements[tagName.toLowerCase()];
    if (element) {
      element.parentNode.removeChild(element);
      delete tagElements[tagName.toLowerCase()];
    }
    tags.splice(tagIndex, 1);
    delete tagMap[tagName.toLowerCase()];

    if (tags.length < maxTags) {
      tagEntryField.disabled = false;
      tagEntryField.placeholder = Browser.i18n.getMessage(placeholders["ADD"]);
      tagEntryField.className = "";
    }
    tagEntryField.focus();
    if (tags.length == 0) {
      clearAllControl.style.display = "none";
    }
  }

  function selectAutoComplete(evt) {
    userInteraction = true;
    addTag(evt.srcElement.textContent, true);
    tagEntryField.value = "";
    hideAutoComplete();
  }

  function setAutoCompleteList(tagList) {
    autoCompleteTags = tagList;
    hideAutoComplete();
    tagTrie = new TagTrie();
    for (var i = 0; i < autoCompleteTags.length; i++) {
      var tagEntry = document.createElement("div");
      tagEntry.textContent = autoCompleteTags[i];
      tagEntry.addEventListener("click", selectAutoComplete);
      tagEntry.addEventListener("mouseover", hoverAutoComplete);
      tagTrie.insert(autoCompleteTags[i], tagEntry);
    }
  }

  function hoverAutoComplete() {
    var original = autoCompleteSelection;
    if (original) {
      original.className = original.className.replace(/\s*selected/, "");
    }
    this.className += " selected";
    autoCompleteSelection = this;
  }

  function getSelectedTags() {
    var t = [];
    for (var i in tags) {
      t.push(tags[i]);
    }
    return t;
  }

  function addTag(tag, focusEntryField) {
    // Can't add blank tag.
    if (!tag) return;
    tag = tag.trim();
    // Already have this tag.
    if (tagMap[tag.toLowerCase()]) return;

    createTag(tag);

    if (tags.length == maxTags) {
      tagEntryField.value = "";
      tagEntryField.disabled = true;
      tagEntryField.placeholder = Browser.i18n.getMessage(placeholders["FULL"]);
      tagEntryField.className = "wide";
    }

    else if (focusEntryField) {
      tagEntryField.focus();
      tagEntryField.placeholder = "";
    }
  }

  function setTabIndex(index) {
    tagEntryField.tabIndex = index;
  }

  function showAutoComplete() {
    autoCompleteVisible = true;
    var offsets = getOffsets(tagEntryField);
    var textHeight = window.getComputedStyle(tagEntryField).height.replace(/[^0-9.-]/g, "");
    autoCompleteBox.style.left = offsets[0] + "px";
    autoCompleteBox.style.top = offsets[1] + parseInt(textHeight) + 2 + "px";
    autoCompleteBox.style.display = "block";
  }

  function updateAutoComplete(val) {

    val = val.toLowerCase();
    var matches = tagTrie.getMatching(val);

    if (matches.length) {
      var list = document.createDocumentFragment();
      matches = matches.sort(function(a, b){if (a[0] === b[0]) return 0; if (a[0] < b[0]) return -1; return 1;});
      var matchCount = 0;
      for (var i = 0; i < matches.length; i++) {
        if (!tagMap[matches[i][0]]) {
          if (matchCount % 2) {
            matches[i][1].className = "striped";
          }
          else {
            matches[i][1].className = "unstriped";
          }
          list.appendChild(matches[i][1]);
          matchCount++;
        }
      }

      // Delete all existing nodes and then add the new ones.
      while (autoCompleteBox.hasChildNodes()) {
        autoCompleteBox.removeChild(autoCompleteBox.lastChild);
      }
      autoCompleteBox.appendChild(list);

      if (matchCount) showAutoComplete();
      else hideAutoComplete();
    }
    else {
      hideAutoComplete();
    }
  }

  function hideAutoComplete() {
    mouseInAutoComplete = false;
    autoCompleteVisible = false;
    autoCompleteSelection = null;
    autoCompleteBox.style.display = "none";
    /*
    for (var i = 0; i < autoCompleteBox.children.length; i++) {
      var c = autoCompleteBox.children[i];
      c.className = "";
      c.style.display = "none";
    }
    */
  }

  function getOffsets(element) {
    var left = element.offsetLeft;
    var top = element.offsetTop;
    return [left, top];
  }

  function incrementAutoSelect(backwards) {
    var current = autoCompleteSelection;

    // Set the initial state.
    if (!current) {
      current = autoCompleteBox.firstChild;
      if (current) {
        current.className += " selected";
        autoCompleteSelection = current;
      }
      return;
    }

    var original = current; // We'll clear this if we find a replacement.
    if (!backwards) {
      current = current.nextSibling;
    }
    else {
      current = current.previousSibling;
    }

    if (!current) current = original;

    // We found another node.
    if (current) {
      original.className = original.className.replace(/\s*selected/, "");
      current.className = " selected";
      autoCompleteSelection = current;
      current.scrollIntoViewIfNeeded(false);
    }
  }

  function hideAutoCompleteFromEsc(evt) {
    if(evt.keyCode) {
      if (evt.keyCode == 27) {
        if (autoCompleteVisible) {
          hideAutoComplete();
          tagEntryField.focus();
        }
      }
    }
  }

  function handleTextEntry (evt) {

    // If after the *last* keystroke we were already empty, then we'll try and remove the last tag from the list.
    if (lastTextValue == "") {
      // Backspace.
      if (evt.keyCode == 8) {
        if (tags.length) {
          clearTag(null, tags[tags.length - 1]);
        }
      }
    }

    // In case the user types, for example ", " before starting a new tag, we'll strip leading whitespace.
    var autoCompleteVal = this.value.replace(/^\s*/, "");
    if (autoCompleteVal != "") {
      updateAutoComplete(autoCompleteVal);
    }
    else {
      hideAutoComplete();
    }

    hideAutoCompleteFromEsc(evt);

    // And we'll store the new value of the field.
    lastTextValue = this.value;
    var refocus = true;

    // We don't want to re-grab focus in this case (9 is TAB).
    if (evt.keyCode == 9) {
      refocus = false;
    }

    // Otherwise, 'tab' and 'enter' have the same behavior.
    if (evt.keyCode == 9 || evt.keyCode == 13) {
      if (autoCompleteVisible && autoCompleteSelection) {
        this.value = autoCompleteSelection.textContent;
      }
      this.value = this.value + ",";
    }

    // Up and down arrows for autocomplete.
    if (evt.keyCode == 38 || evt.keyCode == 40) {
      if (autoCompleteVisible) {
        var backwards = (evt.keyCode == 38);
        incrementAutoSelect(backwards);
      }
    }

    if (this.value.match(/,/)) {
      var tagList = this.value.split(/\s*,\s*/);
      for (var i = 0; i < tagList.length - 1; i++) {
        addTag(tagList[i], refocus);
        if (evt && !evt.nonUserEvent) {
          userInteraction = true;
        }
        hideAutoComplete();
      }
      this.value = tagList[tagList.length - 1].trim();
    }

    // Don't let this pass up the tree. It's wrapped in an 'if' because sometimes we send this function fake events.
    if (evt.stopPropagation) evt.stopPropagation();
  }

  function setDisabled(disabled) {
    var style;
    var className;
    var clearAllControlStyle;
    if (disabled) {
      tagEntryField.disabled = true;
      tagEntryField.placeholder = Browser.i18n.getMessage(placeholders["DISABLED"]);
      style = "none";
      clearAllControlStyle = "none";
      className = "wide";
    }
    else {
      tagEntryField.disabled = false;
      resetPlaceholder();
      style = "inline-block";
      clearAllControlStyle = "inline";
      className = "";
      if (tagEntryField.placeholder == Browser.i18n.getMessage(placeholders["FULL"])) {
        className = "wide";
      }
    }
    var tags = self.getElementsByTagName("span");
    for (var i = 0; i < tags.length; i++) {
      tags[i].style.display = style;
    }
    tagEntryField.className = className;
    if (clearAllControlStyle == "none" || tags.length) {
      // Always hide this on disable, but only show it if the tag list isn't empty.
      clearAllControl.style.display = clearAllControlStyle;
    }
  }

  function userInteracted() {
    return userInteraction;
  }

  self.setAutoCompleteList = setAutoCompleteList;
  self.getSelectedTags = getSelectedTags;
  self.addTag = addTag;
  self.setTabIndex = setTabIndex;
  self.setDisabled = setDisabled;
  self.userInteracted = userInteracted;

  Object.preventExtensions(self);
  return self;
}
Object.preventExtensions(TagEntryBox);


function TagTrie() {
  "use strict";

  var trie = {};

  var matching = [];

  function insert(tag, data) {
    if (!tag) return;
    tag = tag.toLowerCase();
    var current = trie;
    for (var i = 0; i < tag.length; i++) {
      if (!current[tag[i]]) {
        current[tag[i]] = {};
      }
      current = current[tag[i]];
    }
    current.name = tag;
    current.value = data;
  }

  function fillMatching(current) {
    if (current.name && current.value) {
      matching.push([current.name, current.value]);
    }
    for (var i in current) {
      if (i !== "name" && i !== "value") {
        fillMatching(current[i]);
      }
    }
  }

  function getMatching(tag) {
    matching = [];
    if (!tag) return matching;
    tag = tag.toLowerCase();
    var current = trie;

    for (var i = 0; i < tag.length; i++) {
      if (!current[tag[i]]) {
        return matching;
      }
      current = current[tag[i]];
    }
    fillMatching(current);
    return matching;
  }

  this.insert = insert;
  this.getMatching = getMatching;

  this.trie = trie;

  Object.preventExtensions(this);
}
Object.preventExtensions(TagTrie);
