var serializeFrame; // frame_loader.js will call this.
(function(){
  // All of our data from child frames.
  var serializedFrames = {};

  // This keeps track of frames for which we've registered an identifier.
  var registeredFrames = {};

  function getFrames(){
    return document.querySelectorAll("iframe");
  }
  
  function registeredFrameLength() {
    var count = 0;
    for (var i in registeredFrames) count++;
    return count;
  }

  // Give all of our frames an ID.
  function identify() {
    var frames = getFrames();
    for (var i = 0; i < frames.length; i++) {
      var id;
      if (frames[i].dataset.en_id) {
        id = frames[i].dataset.en_id;
        if (registeredFrames[id]) {
          continue;
        }
      }
      else {
        id = (Math.floor(Math.random() * 100000000)).toString();
        frames[i].dataset.en_id = id;
      }
      frames[i].contentWindow.postMessage({name: "EN_youAre", id: id}, "*");
    }
  }

  function serialized(str) {
    window.parent.postMessage({name: "EN_serialized", data: str, id: document.body.dataset.en_id}, "*");
  }

  function handleSerialized(evt) {
    if (window == window.parent) {
      return; // Top-level windows use a content script serializer.
    }

    serializedFrames[evt.data.id] = evt.data.data;
    var serializedCount = 0;
    for (var i in serializedFrames) serializedCount++;
    if (serializedCount == registeredFrameLength()) {
      var hs = new HtmlSerializer();
      hs.serialize(document.documentElement, null, true, serialized, serializedFrames);
    }
  }

  // Listen for incoming messages from/in frames.
  window.addEventListener("message", function(evt) {
    if (evt.data && evt.data.name && evt.data.name == "EN_serialized") {
      handleSerialized(evt);
    }
    else if (evt.data && evt.data.name && evt.data.name == "EN_youAre") {
      if (!document.body.dataset.en_id || (document.body.dataset.en_id != evt.data.id)) {
        document.body.dataset.en_id = evt.data.id;
        evt.source.postMessage({name: "EN_iAm", id: evt.data.id}, "*");
      }
    }
    else if (evt.data && evt.data.name && evt.data.name == "EN_iAm") {
      registeredFrames[evt.data.id] = evt.source;
    }
    else if (evt.data && evt.data.name && evt.data.name == "EN_frameReady") {
      identify();
    }
    if (evt.data && evt.data.name && evt.data.name == "content_textResource") {
      var frames = getFrames();
      for (var i = 0; i < frames.length; i++) {
        frames[i].contentWindow.postMessage(evt.data, "*");
      }
    }
  }, false);

  if (window != window.parent) {
    // We're in a frame, and have (apparently) finished loading. So we'll kick our parent.
    window.parent.postMessage({"name": "EN_frameReady"}, "*");
  }

  serializeFrame = function() {
    // If this isn't a leaf node, then it'll wait for its children to finish and then serialize itself.
    if (getFrames().length == 0) {
      var hs = new HtmlSerializer();
      hs.serialize(document.documentElement, null, true, serialized);
    }
  }
})();
