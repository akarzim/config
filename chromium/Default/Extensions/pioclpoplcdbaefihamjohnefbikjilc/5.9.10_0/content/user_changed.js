window.addEventListener("DOMContentLoaded", function() {
  var name = document.location.search;
  if (name) {
    name = name.replace(/\?/, "");
    name = decodeURIComponent(name);
    document.querySelector("#status > div").innerHTML += Browser.i18n.getMessage("accountChangedTo", [name]);
    parent.postMessage("en_clipper_frame_loaded", "*");
  }
});
