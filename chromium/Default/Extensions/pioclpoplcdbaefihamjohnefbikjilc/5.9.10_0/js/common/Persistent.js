// Persistent is a wrapper around localStorage that makes storing and retreiving JSON data more convenient.
// It is implemented like a 'static class' (or namespace), and cannot be instantiated.
// The definition is wrapped in an anonymous function for the purpose of scoping the "use strict" statement.

// IMPORTANT! There is no built-in method to keep different users of this library from having thier keys collide. These
// values are all global, so the suggestion is to use unique prefixes for anything you want to store here.
// This may change if we are able to replace localStorage with something like indexedDB.

var Persistent = {};
(function (){
  "use strict";

  Persistent.set = function(key, value) {
    if (document && document.location && document.location.href && !document.location.href.match(/^(safari|chrome)/i)) {
      window.console.warn("Not setting persistent value for " + key + " on non-extension page.");
      return;
    }
    if (typeof value === "undefined") {
      value = "";
    }
    // Try/catch because it's possible to run out of space.
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    }
    catch (e) {
      if (e.code && e.code === 22 && e.name && /quota/i.test(e.name)) {
        window.console.error("Failed to serialize value for '" + key + "' with length " + JSON.stringify(value).length +
                  ", not enough space.");
      }
      else {
        window.console.log("Failed to set localStorage because of this error:");
        window.console.log("code: ", e.code);
        window.console.log("name: ", e.name);
        window.console.log("message: ", e.message);
        window.console.log("stack: ", e.stack);
      }
    }
  }

  Persistent.get = function(key) {
    var value = null;
    try {
      value = JSON.parse(localStorage[key]);
    }
    catch (e) {
      // This is always just us looking up a value we hadn't initialized before, which is standard behavior.
      // console.warn("Couldn't deserialize localStorage value for key: " + key);
    }
    return value;
  }

  Persistent.clear = function(key) {
    if (!document.location.href.match(/^(safari|chrome)/i)) {
      window.console.warn("Not clearing persistent value for " + key + " on non-extension page.");
      return;
    }
    window.localStorage.removeItem(key);
  }
})();

Object.preventExtensions(Persistent);
