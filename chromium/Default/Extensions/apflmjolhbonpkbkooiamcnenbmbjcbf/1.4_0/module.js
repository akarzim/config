// Copyright 2012 Google Inc. All Rights Reserved.

function init() {
  if (getClickBehavior() != 'module' ||
      chrome.extension.getBackgroundPage().isSignedOut) {
    openReader();
    return;
  }

  var readerLinkNode = $('open-reader-link');
  readerLinkNode.onclick = openReader;
  readerLinkNode.innerHTML = chrome.i18n.getMessage('openReaderLink');

  var refreshLinkNode = $('refresh-link');
  refreshLinkNode.innerHTML = chrome.i18n.getMessage('refreshLink');
  refreshLinkNode.onclick = refresh;

  $('loading').innerHTML = chrome.i18n.getMessage('loadingText');

  document.querySelector('#outer-container').style.display = 'block'
  // Call to messages.json for implementing i18n.
  if (chrome.i18n.getMessage('direction') == 'rtl') {
    document.querySelector('#outer-container').style.direction = 'rtl'
  }

  setIframeUrl();

  // Refresh unread count too, but give the module loading precedence
  window.setTimeout(startRequest.bind(this, false), 1000);
};

/**
 * Opens the Google reader page of the user.
 */
function openReader() {
  getReaderTab(function(tab) {
    if (tab) {
      // Try to reuse an existing Reader tab
      chrome.tabs.update(tab.id, {selected: true});
    } else {
      chrome.tabs.create({url: READER_URL});
    }

    // Either way, we don't need the popup anymore
    window.close();
  });
}

/**
 * Sets the url of the iGoogle gadget to be shown in the pop up.
 */
function setIframeUrl() {
  $('module').src = 'https://www.google.com/reader/igoogle-module' +
      '?notifier=true&hl=' + navigator.language;
}

function refresh() {
  startRequest(false);
  document.getElementById('module').src = 'about:blank';
  setIframeUrl();
}

init();
