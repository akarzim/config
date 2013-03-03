
// To be creted/used by the options page.
function OptionsController() {
  "use strict";

  window.addEventListener("DOMContentLoaded", requestOpts);
  Browser.addMessageHandlers({
    config: init,
    options_isAuthenticated: msgHandlerIsAuthenticated
  });

  // The following are maps of HTML element IDs to Options keys for which they correspond. If you add a new option, add
  // the input element's ID and the corresponding option to the appropriate map below.

  var checkboxValues = {
    smartFilingBizNBEnabled: "smartFilingBizNBEnabled",
    clipNotificationEnabled: "clipNotificationEnabled",
    clipStyle: "clipStyle",
    useContextMenu: "useContextMenu",
    useSearchHelper: "useSearchHelper",
    simulateCheckVersionFailure: "simulateCheckVersionFailure",
    simulateSimplifiedChinese: "simulateSimplifiedChinese",
    useStage: "useStage"
  };

  var selectValues = {
    clipAction: "clipAction",
    selectionNudging: "selectionNudging",
    smartFilingEnabled: "smartFilingEnabled",
    client: "client"
  };

  var textValues = {
    insecureProto: "insecureProto",
    secureProto: "secureProto",
    overrideServiceURL: "overrideServiceURL"
  };

  function requestOpts() {
    var opt = {};
    for (var i in checkboxValues) opt[i] = false;
    for (var i in selectValues) opt[i] = false;
    for (var i in textValues) opt[i] = false;
    Browser.sendToExtension({name: "main_getConfig", options: opt});
  }

  // Starts up the options page, which is mostly localizing the page, setting the current state from 'options', and
  // registering event handlers on all our form elements.
  function init(request) {
    if (!request.options) return;

    // Localize the page.
    GlobalUtils.localize(document.body);
    GlobalUtils.localize(document.getElementsByTagName("title")[0]);
    document.body.style.display = "";
    if (request.options["client"] == "DESKTOP") {
      document.querySelector("#clientSelectionDescription").style.display = "block";
    }

    // Bind handlers for everything.
    // Simultaneously set defaults, since we're iterating through everything anyway.

    for (var i in checkboxValues) {
      var el = document.getElementById(i);
      el.checked = request.options[checkboxValues[i]];
      el.addEventListener("change", checkboxChanged);
    }

    for (var i in selectValues) {
      var el = document.getElementById(i);
      var intendedValue = request.options[selectValues[i]];
      for (var i = 0; i < el.options.length; i++) {
        if (el.options[i].value == intendedValue) {
          el.selectedIndex = i;
          break;
        }
      }
      el.addEventListener("change", selectChanged);
    }

    for (var i in textValues) {
      var el = document.getElementById(i);
      el.value = request.options[textValues[i]];
      el.addEventListener("change", textboxChanged);
    }
  }

  function checkboxChanged(e) {
    var optionName = checkboxValues[this.id];
    if (optionName) {
      showSavingProgress();
      var options = {};
      options[optionName] = this.checked;
      if (optionName == "useSearchHelper") {
        Browser.sendToExtension({name: "main_isAuthenticated", type: "options"});
      }
      Browser.sendToExtension({name: "main_setOption", options: options});
    }
  }

  function selectChanged(e) {
    var optionName = selectValues[this.id];
    if (optionName) {
      showSavingProgress();
      var options = {};
      options[optionName] = this.options[this.selectedIndex].value;
      Browser.sendToExtension({name: "main_setOption", options: options});
      if (optionName == "client") {
        if (this.options[this.selectedIndex].value == "DESKTOP") {
          document.querySelector("#clientSelectionDescription").style.display = "block";
        }
        else {
          document.querySelector("#clientSelectionDescription").style.display = "none";
        }
      }
    }
  }

  function textboxChanged(e) {
    var optionName = textValues[this.id];
    if (optionName) {
      showSavingProgress();
      var options = {};
      options[optionName] = this.value;
      console.log("Sending options change:");
      console.log(options);
      Browser.sendToExtension({name: "main_setOption", options: options});
    }
  }

  function showSavingProgress() {
    window.setTimeout(function() { document.querySelector("#savingContainer").className = "invisible"; }, 2000);
    document.querySelector("#savingContainer").className = "visible";
  }

  // Code for managing the secret developer options.
  window.addEventListener("keydown", konami);
  var konamiSequence = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65];
  var konamiPosition = 0;
  var konamiElement = "developerContainer";

  function konami (e) {
    if (event.keyCode == konamiSequence[konamiPosition]) {
      konamiPosition++;
    }
    else {
      konamiPosition = 0;
    }

    if (konamiPosition == konamiSequence.length) {
      konamiPosition = 0;
      if (document.getElementById(konamiElement).style.display == "none") {
        document.getElementById(konamiElement).style.display = "block";
      }
      else {
        document.getElementById(konamiElement).style.display = "none";
      }
    }
  }

  function msgHandlerIsAuthenticated(response) {
    if (response && response.auth) {
      Persistent.set(response.auth.displayName + "_turnedOffSearchHelper", true);
    }
  }

  Object.preventExtensions(this);
}
Object.preventExtensions(OptionsController);

// Instantiate a global instance. It's expected that this is only used on the options page.
var optionsController = new OptionsController();

// For options.html

// Use China-specific logo.
window.addEventListener("DOMContentLoaded", function() {
  if (SAFARI) {
    document.querySelector("#eventLogsBlock").style.display = "none";
  }

  function msgHandlerConfig(request) {
    if (!request.bootstrapInfo || !request.bootstrapInfo.name) {
      // Specifically we don't want to get the "options" message that the OptionsController requests.
      return;
    }

    var logo = document.querySelector("#logo");
    if (request.bootstrapInfo.name.match(/china/i)) {
      logo.src = "images/web-clipper-logo-china.png";
      if (devicePixelRatio >= 2) logo.src = "images/web-clipper-logo-china@2x.png" 
      logo.width = "91";
      logo.height = "45";
    }
    else {
      logo.src = "images/web-clipper-logo.png";
      if (devicePixelRatio >= 2) logo.src = "images/web-clipper-logo@2x.png" 
      logo.width = "191";
      logo.height = "36";
    }
    logo.style.display = "";

    // set the legal links
    var baseUrl = document.querySelector("#secureProto").value
      + request.bootstrapInfo.serviceHost;
    document.querySelector(".copyright").innerHTML = Browser.i18n.getMessage("copyright", [baseUrl]);
    document.querySelector("#legalLink").addEventListener("click", toggleLegal);
    document.querySelector("#legal .overlay").addEventListener("click", toggleLegal);
    document.querySelector("#legal .close").addEventListener("click", toggleLegal);
  }

  function toggleLegal() {
    var legal = document.querySelector("#legal");
    if (window.getComputedStyle(legal).display == "none") {
      legal.style.display = "block";
      legal.querySelector("#licenseContainer").scrollTop = 0;
    }
    else {
      legal.style.display = "none";
    }
  }

  Browser.addMessageHandlers({config: msgHandlerConfig});
  Browser.sendToExtension({name: "main_getConfig", bootstrapInfo: {"name": null, "serviceHost": null}});

  try {
    var msg = Browser.i18n.getMessage("options_buildId");
    var version = BUILD_VERSION;
    if (version === 0) {
      version = JSON.parse(localStorage["EVERNOTE_VERSION"]);
    }
    document.querySelector("#versionInfo").textContent = msg + " " + version;
  }
  catch(e){
    console.warn("Couldn't set build version.");
    console.log(e);
  }
});

// Standard error handling function that will log exceptions in the background page.
window.addEventListener("error", function(e) {log.error(JSON.stringify(e));});
