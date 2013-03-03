if (typeof Browser == "undefined") {
  var Browser = {};

  Browser.runIfInTopFrame = function(func) {
    "use strict";
    // Chrome.
    if (!SAFARI) {
      // There's a race condition or something that can cause or SAFARI flag not to be set sometimes, even when it 
      // should be, in iframes. We fall back  and check that we're actually in Chrome.
      if (navigator.userAgent.match(/chrome/i)) {
        func();
      }
    }
    else {
      // Run in *all* frames.
      if (true || window === window.parent) {
        // Run in the main window.
        func();
      }
      else {
        // And in any extension frames.
        var start = chrome.extension.getURL("");
        if (document.location.href.substr(0, start.length) == start) {
          func();
        }
      }
    }
  }

  Browser.messageListeners = [];

  function initBrowser() {
    "use strict";
    Browser.i18n = chrome.i18n;
    Browser.extension = chrome.extension;
    Browser.EVERNOTE_VERSION = "5.9.10";
    Browser.agent = null;
    Browser.keyCombos = {};
    Browser.currentKeys = {};

    Browser.sendToTab = function (tab, msg) {
      if (SAFARI) {
        try {
          tab.page.dispatchMessage(msg.name, msg);
        }
        catch (e) {
          // For certain pages, like Safari's "top sites" default in new tabs, this just doesn't work, so we simply
          // trap the error.
        }
      }
      else {
        if (chrome.tabs.sendMessage) {
          chrome.tabs.sendMessage(tab.id, msg);
        }
        else {
          chrome.tabs.sendRequest(tab.id, msg);
        }
      }
    }

    Browser.sendToExtension = function(msg) {
      if (SAFARI) safari.self.tab.dispatchMessage(msg.name, msg);
      else {
        if (chrome.extension.sendMessage) {
          chrome.extension.sendMessage(msg);
        }
        else {
          chrome.extension.sendRequest(msg);
        }
      }
    }

    Browser.getAgent = function() {
      if (Browser.agent) return Browser.agent;
      // X-Evernote-Agent: 
      // Evernote Webclipper/<version> (<locale>); <OS Name>/<OS version>; <Browser name>/<Browser version>;

      var os = "Unknown/1.0";
      var matcher = /^Mozilla\/\d+(\.\d+)*\s+\(.*?([^;()]*(Windows|OS X|Linux)[^;()]*).*?\)/i;
      var matches = matcher.exec(navigator.userAgent);
      if (matches && matches[2]) os = matches[2].trim();
      os = os.replace(/\s+(\S*\d)/, "/$1");

      var agent = "Evernote Webclipper/" + Browser.EVERNOTE_VERSION + " (" + navigator.language + "); " + os + "; ";
      var ver = "0.0";
      if (SAFARI) {
        ver = navigator.userAgent.replace(/^.*Version\/([0-9.]+).*$/, "$1");
        if (ver == navigator.userAgent) ver = "0.0";
        agent += "Safari/" + ver;
      }
      else {
        ver = navigator.userAgent.replace(/^.*Chrome\/([0-9.]+).*$/, "$1");
        if (ver == navigator.userAgent) ver = "0.0";
        agent += "Chrome/" + ver;
      }
      agent += ";";
      Browser.agent = agent;
      return Browser.agent;
    }

    Browser.removeMessageHandlers = function() {
      // Currently this doesn't do anything useful except on safari.
      if (!SAFARI) {
        return;
      }
      var addTo = null;
      if (safari.application) {
        // We're in an extension page.
        addTo = safari.application;
      }
      else {
        // We're in a content script.
        addTo = safari.self;
      }

      for (var i = 0; i < Browser.messageListeners.length; i++) {
        addTo.removeEventListener("message", Browser.messageListeners[i], false);
        console.log("Removing message listener: ");
        console.log(Browser.messageListeners[i]);
      }
      Browser.messageListeners = [];
    }

    Browser.addMessageHandlers = function(handlers, forceFrames) {
      if (SAFARI) {
        if (document.location.href == "about:blank") return;

        // Prevent running in frames.
        if (!forceFrames && (window && window.parent != window)) {
          // Except frames that are extension pages.
          var start = chrome.extension.getURL("");
          if (document.location.href.substr(0, start.length) != start) {
            return;
          }
        }

        var addTo = null;
        if (!safari) {
          console.warn("No 'safari' object.");
          return;
        }
        if (safari.application) {
          // We're in an extension page.
          addTo = safari.application;
        }
        else {
          // We're in a content script.
          addTo = safari.self;
        }

        var listener = function (request) {
          if (request.name && handlers[request.name]) {
            handlers[request.name](request.message, {tab: request.target}, null);
          }
        };

        Browser.messageListeners.push(listener);

        addTo.addEventListener("message", listener, false);
      }
      else {
        var listener = function(request, sender, sendResponse) {
          if (!sender || sender.id !== chrome.i18n.getMessage("@@extension_id")) {
            log.warn("Got request from unexpected sender. Ignoring.");
            return;
          }
          if (request.name && handlers[request.name]) {
            handlers[request.name](request, sender, sendResponse);
          }
          if (sendResponse) return true;
        };

        if (chrome.extension.onMessage) {
          chrome.extension.onMessage.addListener(listener);
        }
        else {
          chrome.extension.onRequest.addListener(listener);
        }
      }
    }

    Browser.addKeyboardHandlers = function(_keyCombos) {
      for (var i in _keyCombos) {
        Browser.keyCombos[i] = _keyCombos[i];
      }
    }

    Browser.handleKeys = function() {

      // Get the right key ordering.
      var keyList = [];
      for (var i in Browser.currentKeys) {
        keyList.push(parseInt(i));
      }
      keyList.sort();
      var keyKey = keyList.join(" + ");

      if (Browser.keyCombos[keyKey]) {
        Browser.keyCombos[keyKey]();
      }

      Browser.currentKeys = {};
    }

    Browser.setIcon = function(path) {
      if (SAFARI) {
        for (var i in safari.extension.toolbarItems) {
          var toolbarItem = safari.extension.toolbarItems[i];
          if (toolbarItem.identifier == "clipper") {
            toolbarItem.image = safari.extension.baseURI + path + "-16x16.png";
          }
        }
      } else {
        chrome.browserAction.setIcon({ path: {
          "19": chrome.extension.getURL(path + "-19x19.png"),
          "38": chrome.extension.getURL(path + "-19x19@2x.png")
        }});
      }
    };

    Browser.setTitle = function(title) {
      if (SAFARI) {
        for (var i in safari.extension.toolbarItems) {
          var toolbarItem = safari.extension.toolbarItems[i];
          if (toolbarItem.identifier == "clipper") {
            toolbarItem.toolTip = title;
          }
        }
      } else {
        chrome.browserAction.setTitle({ title: title });
      }
    }

    Browser.insertCSS = function(styleFile) {
      if (SAFARI) {
        safari.extension.addContentStyleSheetFromURL(safari.extension.baseURI
          + styleFile);
      } else {
        chrome.tabs.insertCSS(null, { file: styleFile });
      }
    }

    window.addEventListener("keydown", function(evt) {
      Browser.currentKeys[evt.keyCode] = evt;
    });
    window.addEventListener("keyup", function(evt) {
      Browser.handleKeys();
      delete Browser.currentKeys[evt.keyCode];
    });


    Object.preventExtensions(Browser);
  }

  Browser.runIfInTopFrame(initBrowser);
}
