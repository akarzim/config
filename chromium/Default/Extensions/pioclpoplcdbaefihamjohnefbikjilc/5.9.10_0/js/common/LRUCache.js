/*
* Least recently used cache to hold (for example) filing recommendations. Each
* element is an Object with a key, time, and content. key can be a
* search query (for simsearch) or a url (for filing recommendations). time is
* the time in milliseconds of the request. content is the filing recommendation
* itself.
*
* n is the max number of filing recommendations it can hold
* t is the max age of the recommendations in the cache, in milliseconds
*/
var LRUCache = function(n, t) {
  "use strict";

  var cache = {};
  var queue = []; // holds the keys in chronological order

  function startEntry(key) {
    validateCache();

    if (!cache[key]) {
      if (queue.length == n) {
        // cache is at capacity. remove the least recently used element
        removeOldest();
      }
      cache[key] = {
        time: new Date().getTime()
      };
      queue.push(key);
    }
  }

  function updateEntry(obj) {
    var key = obj.key;
    delete obj.key;

    if (!cache[key]) {
      startEntry(key);
    }
    cache[key].content = mergeObjects(cache[key].content, obj.content);
  }

  function removeEntry(key) {
    delete cache[key];
    var i = queue.indexOf(key);
    if (i > -1) {
      queue = queue.slice(0, i).concat(q.slice(i + 1));
    }
  }

  function get(key) {
    validateCache();
    return cache[key];
  }

  function removeOldest() {
    var key = queue.shift();
    delete cache[key];
  }

  // check that all elements are younger than t and remove the elements the
  // ones that are older
  function validateCache() {
    var numToRemove = 0;
    for (var i in queue) {
      var key = queue[i];
      if (cache[key].time < (new Date().getTime() - t)) {
        numToRemove++;
      } else {
        break; // if this one isn't old, the ones after it won't be old either
      }
    }

    for (var i = 0; i < numToRemove; i++) {
      removeOldest();
    }
  }

  function mergeObjects(a, b) {
    var merged = {};
    if (!a) {
      a = {};
    }
    if (!b) {
      b = {};
    }
    var aProps = Object.getOwnPropertyNames(a);
    var bProps = Object.getOwnPropertyNames(b);
    for (var i = 0; i < aProps.length; i++) {
      merged[aProps[i]] = a[aProps[i]];
    }
    for (var i = 0; i < bProps.length; i++) {
      merged[bProps[i]] = b[bProps[i]];
    }
    return merged;
  }

  this.__defineGetter__("n", function(){
    return n;
  });

  this.__defineGetter__("t", function() {
    return t;
  });

  this.__defineGetter__("cache", function() {
    return cache;
  });

  this.__defineGetter__("queue", function() {
    return queue;
  })

  this.__defineSetter__("cache", function(c) {
    cache = c;
  });

  this.__defineSetter__("queue", function(q) {
    queue = q;
  })

  this.startEntry = startEntry;
  this.updateEntry = updateEntry;
  this.removeEntry = removeEntry;
  this.get = get;

  Object.preventExtensions(this);
};

// Takes a cache that JSON.parse produced, which has the type Object and casts
// it to an LRUCache
LRUCache.cast = function(obj) {
  var copy = new LRUCache(obj.n, obj.t);
  copy.cache = obj.cache;
  copy.queue = obj.queue;
  return copy;
}

Object.preventExtensions(LRUCache);