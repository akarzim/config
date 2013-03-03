// Copyright 2012 Google Inc. All Rights Reserved.

/**
 * Array for storing update interval.
 */
var UPDATE_INTERVAL_MINUTES = [5, 10, 15, 30];

// Saves options to localStorage.
function saveOptions() {
  var formNode = $('options-form');

  var clickBehaviorNode = formNode['click-behavior'];
  for (var i = 0, clickBehaviorOptionNode;
       clickBehaviorOptionNode = clickBehaviorNode[i];
       i++) {
    if (clickBehaviorOptionNode.checked) {
      setClickBehavior(clickBehaviorOptionNode.value);
    }
  }

  var refreshIntervalNode = formNode['refresh-interval'];
  var refreshInterval =
      refreshIntervalNode.children[refreshIntervalNode.selectedIndex].value;
  setRefreshInterval(refreshInterval);

  // Update status to let user know options were saved.
  var buttonNode = $('save-button');
  buttonNode.innerHTML = chrome.i18n.getMessage('savedMessage');
  buttonNode.disabled = true;
  setTimeout(function() {
    buttonNode.innerHTML = chrome.i18n.getMessage('saveButton');
    buttonNode.disabled = false;
  }, 750);
}

function restoreOptions() {
  var formNode = $('options-form');

  var clickBehavior = getClickBehavior();
  var clickBehaviorNode = formNode['click-behavior'];
  for (var i = 0, clickBehaviorOptionNode;
       clickBehaviorOptionNode = clickBehaviorNode[i];
       i++) {
    clickBehaviorOptionNode.checked =
        clickBehaviorOptionNode.value == clickBehavior;
  }

  var refreshInterval = getRefreshInterval();
  var refreshIntervalNode = formNode['refresh-interval'];
  for (var i = 0, refreshValueNode;
       refreshValueNode = refreshIntervalNode[i];
       i++) {
    if (refreshValueNode.value == refreshInterval) {
      refreshValueNode.selected = 'true';
      break;
    }
  }
}

function initForm() {
  var formNode = $('options-form');

  // For creating drop down menu dynamically on page load.
  var refreshIntervalNode = formNode['refresh-interval'];
  for (var i = 0, interval; interval = UPDATE_INTERVAL_MINUTES[i]; i++) {
    refreshIntervalNode.options[refreshIntervalNode.options.length] =
        new Option(chrome.i18n.getMessage('minutes', interval.toString()),
            interval * 60000);
  }

  // Call to messages.json for implementing i18n.
  if (chrome.i18n.getMessage('direction') == 'rtl') {
    document.querySelector('body').style.direction = 'rtl';
  }

  document.getElementsByTagName('title').innerHTML =
      chrome.i18n.getMessage('title');
  $('options-header').innerHTML = chrome.i18n.getMessage('title');
  $('click-action').innerHTML = chrome.i18n.getMessage('clickAction');
  $('show-module').innerHTML = chrome.i18n.getMessage('showModule');
  $('show-reader').innerHTML = chrome.i18n.getMessage('showReader');
  $('interval-text').innerHTML = chrome.i18n.getMessage('intervalText');

  var saveButtonNode = $('save-button');
  saveButtonNode.onclick = saveOptions;
  saveButtonNode.innerHTML = chrome.i18n.getMessage('saveButton');
}

initForm();
restoreOptions();
