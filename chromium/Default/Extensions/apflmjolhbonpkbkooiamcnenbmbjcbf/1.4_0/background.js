// Copyright 2012 Google Inc. All Rights Reserved.

// Kick off auto-refreshing
startRequest();

// Also monitor tabs for a Reader tab, and use its unread count if
// possible (can't use chrome.tabs.onUpdated since it doesn't fire for
// title changes)
window.setInterval(function() {
  getReaderTab(function(tab) {
    if (tab && tab.title) {
      isSignedOut = false;
      var match = TITLE_UNREAD_COUNT_RE.exec(tab.title);
      if (match && match[1]) {
        updateUnreadCount(parseInt(match[1], 10), match[2] == '+');
      } else {
        // For handling the case if the count in reader tab goes to 0
        // which will remove the count from the extension.
        updateUnreadCount(null, false);
      }
      scheduleRequest();
    }
  });
}, 2000);
