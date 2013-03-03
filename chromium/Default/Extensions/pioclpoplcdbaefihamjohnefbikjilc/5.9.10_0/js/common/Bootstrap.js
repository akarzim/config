// Performs actual bootstrapping.
function Bootstrapper() {
  "use strict";

  var extension = Browser.extension.getBackgroundPage().extension;
  
  // Bootstrap our boostrapper.
  var simplifiedChinese = "zh-CN";
  var verbose = false;
  var lang = navigator.language;
  if (extension.getOption("simulateSimplifiedChinese")) {
    log.log("Will simulate Simplified Chinese.");
    verbose = true;
    lang = simplifiedChinese;
  }

  var callbacks = [];
  var busy = false;

  var versionOk = true;

  var info = new BootstrapInfo();

  // Select the correct startup order.
  var first = 0;
  if (lang === simplifiedChinese) first = 1;
  var second = first ? 0 : 1;
  var tried = 0;

  var bootstrapURLs = [
    "www.evernote.com",
    "app.yinxiang.com"
  ];

  var bootstrapStageURLs = [
    "stage.evernote.com",
    "stage-china.evernote.com"
  ];

  if (extension.getOption("useStage")) {
    log.log("Will bootstrap from stage servers.");
    bootstrapURLs = bootstrapStageURLs;
  }

  var jsonRpc;
  var timeout;

  function init(urlIndex) {
    jsonRpc = new JsonRpc(null, ["UserStore.checkVersion", "UserStore.getBootstrapInfo"]);
    var override = extension.getOption("overrideServiceURL").trim();
    if (override !== "") {
      bootstrapURLs = [override, override];
    }
    jsonRpc.initWithUrl(extension.getOption("secureProto") + bootstrapURLs[urlIndex] + "/json");

    var v = Persistent.get("EVERNOTE_VERSION").split(/\./);
    jsonRpc.client.UserStore.checkVersion(handleCheckVersion, "EvernoteChromeClipper", v[0], v[1]);

    tried++;
    timeout = setTimeout(getInfo, 3000);
  }

  function getInfo() {
    if (timeout) clearTimeout(timeout);
    jsonRpc.client.UserStore.getBootstrapInfo(startup, lang);
    timeout = setTimeout(startup, 3000);
  }

  function handleCheckVersion(check, exception) {
    if (exception) {

      // If we got (say) a 503, we didn't fail a version check. This is also true if we got a '0', which indicates a
      // network error.
      if (((typeof exception.code) == "number") && (exception.code != 200)) {
        log.warn("HTTP Error checking version. Assuming OK.");
        check = true;
      }

      // Catch anything else. Just log it.
      else {
        log.log("Error checking version: " + JSON.stringify(exception));
      }
    }

    if (check === true) {
      getInfo();
    }
    else {
      versionOk = false;
      alert(Browser.i18n.getMessage("checkVersionWarning"));
      runCallbacks(versionOk);
    }
  }

  function startup(data, error) {
    if (timeout) clearTimeout(timeout);
    if (data && data.profiles && data.profiles.list) {
      data = data.profiles.list;

      var index = 0;
      var name = info.getName();
      for (var i = 0; i < data.length; i++) {
        if (typeof(data[i].name) !== "undefined") {
          if (data[i].name === name) {
            index = i;
          }
        }
      }

      Persistent.set("BootstrapInfoIndex", index);
      Persistent.set("BootstrapInfo", data);
    }
    else {
      if (tried >= 2) {
        // We ran out of options.
        log.error("Couldn't contact either bootstrap server. Using what we've got...");
      }
      else {
        init(second);
        return; // Don't run our callbacks if we're trying again.
      }
    }

    runCallbacks(versionOk);
    busy = false;
  }

  // Runs all the callbacks for the last 'bootstrap' call, passing them "false" if our version is out of date, and true
  // otherwise.
  function runCallbacks(success) {
    //for (var i = 0; i < callbacks.length; i++) {
    for (var i = callbacks.length - 1; i >= 0; i--) {
      try {
        callbacks[i](success);
      }
      catch (e) {
        console.warn("Error running callback: " + JSON.stringify(e));
      }
      callbacks.pop();
    }
    callbacks = [];
  }

  function bootstrap(callback) {
    if (callback) callbacks.push(callback);

    // If we're offline we wont get anything.
    if (!navigator.onLine) {
      console.warn("Bootstrapping while offline, will use existing info.");
      runCallbacks(versionOk);
      return;
    }

    // If we're busy we'll just wait.
    if (!busy) {
      init(first);
      busy = true;
    }
  }

  this.bootstrap = bootstrap;
  Object.preventExtensions(this);
}
Object.preventExtensions(Bootstrapper);

// Makes boostrap info available to anyone who needs it.
function BootstrapInfo() {

  var extension = Browser.extension.getBackgroundPage().extension;

  var indexKey = "BootstrapInfoIndex";
  var dataKey = "BootstrapInfo";

  var defaults = {
    serviceHost: "www.evernote.com",
    marketingUrl: "http://www.evernote.com",
    supportUrl: "https://support.evernote.com",
    accountEmailDomain: "www.evernote.com",
    enableFacebookSharing: true,
    enableGiftSubscriptions: true,
    enableSharedNotebooks: true,
    enableSingleNoteSharing: true,
    enableSponsoredAccounts: true,
    enableSupportTickets: true,
    enableTwitterSharing: true
  };

  function get(key) {
    if (key == "name") {
      return getName();
    }
    if (key == "serviceHost") {
      var override = extension.getOption("overrideServiceURL");
      if (override) {
        override = override.trim();
      }
      if (override) {
        console.warn("Using overidden serviceHost: " + override);
        return override;
      }
    }
    if (typeof defaults[key] === "undefined") {
      log.error("Invalid Bootstrap Info Key: " + key);
      return false;
    }
    var idx = getIndex();
    var data = Persistent.get(dataKey);
    if (data && (data.length > idx) && data[idx].settings) {
      return data[idx].settings[key];
    }
    else return defaults[key];
  }

  function getName() {
    var idx = getIndex();
    var data = Persistent.get(dataKey);
    if (data && (data.length > idx) && typeof(data[idx].name) !== "undefined") {
      return data[idx].name;
    }
    return "";
  }

  function getIndex() {
    var idx = Persistent.get(indexKey);
    if (idx) return idx;
    return 0;
  }

  function setIndex(idx) {
    Persistent.set(indexKey, idx);

    // We clear out your saved auth info when this changes, so that we can't fail auto-renewal based on your old
    // credentials just because you switched services.
    var oldIndex = getIndex();
    if (idx !== oldIndex) {
      Persistent.clear("savedAuthInfo");
    }
  }

  function getLength() {
    var data = Persistent.get(dataKey);
    if (data && data.length) {
      return data.length;
    }
    else return 0;
  }

  this.getIndex = getIndex;
  this.setIndex = setIndex;
  this.getLength = getLength;
  this.get = get;
  this.getName = getName;

  Object.preventExtensions(this);
}
Object.preventExtensions(BootstrapInfo);
