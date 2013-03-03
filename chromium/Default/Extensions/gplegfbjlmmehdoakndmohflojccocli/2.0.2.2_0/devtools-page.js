//Copyright 2012 Google Inc.  All Rights Reserved.
'use strict';

// Create the visible DevTools panel/tab.
fetchDevToolsAPI(function(is_remote) {
  var gwt = '';
  var locale = localStorage.getItem('localeId');
  if (!locale) {
    var default_locale = chrome.i18n.getMessage('@@ui_locale');
    locale = default_locale ? default_locale : 'en_US';
  }
  if (localStorage.getItem('enableDevMode')) {
    gwt = '?gwt.codesvr=localhost:9997&hl=' + locale;
  } else {
    gwt = '?hl=' + locale;
  }
  if (chromeDevTools && chromeDevTools.panels) {
    chromeDevTools.panels.create('PageSpeed',
        'pagespeed-devtools-icon.png', 'PagespeedChromium.html' + gwt);
  } else {
    alert('Chrome DevTools extension API is not available.');
  }
});
