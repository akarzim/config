function Options(){


  // These are the old values we'll try to keep at upgrade, and their possible settings.
  // These here are from version 5.5.
  var oldSettingsToKeep = {
    useContextMenu: [true, false],
    useSearchHelper: [true, false],
    smartFilingBizNBEnabled: [true, false],
    clipNotificationEnabled: [true, false],
    clipAction: ["ARTICLE", "FULL_PAGE", "URL"],
    selectionNudging: ["ENABLED", "DISABLED", "NO_HINTS"],
    smartFilingEnabled: ["ALL", "NONE", "TAGS", "NOTEBOOKS"],
    clipStyle: ["FULL", "NONE", "TEXT"]
  };

  var defaults = {
    insecureProto: "http://",
    secureProto: "https://",
    clipStyle: true,
    useContextMenu: true,
    useSearchHelper: false,
    smartFilingBizNBEnabled: true,
    clipNotificationEnabled: true,
    clipAction: "ARTICLE", // or "FULL_PAGE" or "URL".
    selectionNudging: "ENABLED", // or "DISABLED" or "NO_HINTS".
    simulateCheckVersionFailure: false,
    smartFilingEnabled: "ALL", // or "NONE" or "TAGS" or "NOTEBOOKS".
    client: "WEB",
    useStage: false,
    simulateSimplifiedChinese: false,
    showRelatedNotes: true,
    overrideServiceURL: ""
  };

  var optionsKey = "options";
  var options = {};

  function cleanUpOldOptions() {
    var keep = {};

    // Non-options state to check.
    var introShown = false;
    var suppressSmartFilingDiscoveryNotice = false;
    var suppressRelatedNotesDiscoveryNotice = false;
    var savedAuthInfo = false;

    // Main check.
    var version = Persistent.get("EVERNOTE_VERSION");
    if (version === Browser.EVERNOTE_VERSION) {
      return;
    }

    for (var key in oldSettingsToKeep) {
      try {
        var existing = get(key);

        // Map old to new options.
        if (key == "clipStyle") {
          if (existing == "FULL" || existing == "NONE" || existing == "TEXT") {
            if (existing == "NONE") existing = false;
            else existing = true;
            keep[key] = existing;
          }
        }
        else if (oldSettingsToKeep[key].indexOf(existing) !== -1) {
          keep[key] = existing;
        }
      }
      catch (e) {
        log.warn("error trying to restore old setting " + key + ", skipping.");
      }
    }

    // Don't re-show the intro page.
    if (Persistent.get("introShown")) introShown = true;

    // Don't reset the smart filing notice.
    if (Persistent.get("suppressSmartFilingDiscoveryNotice")) suppressSmartFilingDiscoveryNotice = true;
    if (Persistent.get("suppressRelatedNotesDiscoveryNotice")) suppressRelatedNotesDiscoveryNotice = true;

    // Retain the user's auth info. This gets checked carefully when read by Auth.js.
    savedAuthInfo = Persistent.get("savedAuthInfo");

    for (var i in localStorage) {
      delete localStorage[i];
    }

    importOptions();
    for (var i in keep) {
      set(i, keep[i]);
    }

    // Reset state that lives outside of "options".
    if (introShown) Persistent.set("introShown", introShown);
    if (savedAuthInfo) Persistent.set("savedAuthInfo", savedAuthInfo);
    if (suppressSmartFilingDiscoveryNotice)
      Persistent.set("suppressSmartFilingDiscoveryNotice", suppressSmartFilingDiscoveryNotice);
    if (suppressRelatedNotesDiscoveryNotice)
      Persistent.set("suppressRelatedNotesDiscoveryNotice", suppressRelatedNotesDiscoveryNotice);

    var version = Persistent.set("EVERNOTE_VERSION", Browser.EVERNOTE_VERSION);
  }

  function get(key) {
    if (typeof options[key] != "undefined") return options[key];
    return defaults[key];
  }

  function set(key, value) {
    options[key] = value;

    // Changing these keys triggers the extension to restart.
    var restartKeys = ["simulateSimplifiedChinese", "useStage", "insecureProto", "secureProto", "overrideServiceURL"];

    var restart = false;
    if (restartKeys.indexOf(key) != -1) {
      log.log("Will restart due to changing option " + key);
      restart = true;
      Persistent.clear("savedAuthInfo");
    }
    update(restart);
  }

  function clear(key) {
    delete options[key];
    update();
  }

  function update(restart) {
    Persistent.set(optionsKey, options);
    if (restart) {
      // Blow away our bootstrap index so this actually takes effect.
      Persistent.clear("BootstrapInfoIndex");
      Persistent.clear("BootstrapInfo");
      Browser.extension.getBackgroundPage().extension.msgHandlerRestart({name: "main_restart"});
    }
  }

  function importOptions(request, sender, sendResponse) {
    options = Persistent.get(optionsKey);
    if (!options) options = {};
    if (sendResponse) {
      try {
        sendResponse(null);
      }
      catch (e) {
        log.warn("Couldn't send response to importOptions, but probably not important.");
      }
    }
  }

  importOptions();

  // Bootstrapping from older versions of the options.
  cleanUpOldOptions();

  // Public API:
  this.get = get;
  this.set = set;
  this.clear = clear;

  Object.preventExtensions(this);
}

Object.preventExtensions(Options);

var options = new Options();
