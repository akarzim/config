var JsonQueue = {};
(function() {
  "use strict";

  var shards = {};

  JsonQueue.initShard = function(shardId) {
    if (!shards[shardId]) {
      shards[shardId] = { expensiveOpInflight: false, queue: [] };
    }
  };

  JsonQueue.handleExpensiveOpRequest = function(shardId, func) {
    var params = Array.prototype.slice.call(arguments);
    params.shift();
    params.shift();

    // change callback
    for (var p in params) {
      if (typeof params[p] == "function") {
        var origFn = params[p];
        params[p] = function(response, exception) {
          JsonQueue.handleExpensiveOpComplete(shardId);
          origFn(response, exception);
        }
        break;
      }
    }

    if (shards[shardId].expensiveOpInflight) {
      // op needs to get in line
      shards[shardId].queue.push({func: func, args: params});
    }
    else {
      if (shards[shardId].queue.length > 0) {
        // get in line and let the others who've been waiting go
        shards[shardId].queue.push({func: func, args: params});
      }
      else {
        // run it immediately
        shards[shardId].expensiveOpInflight = true;
        func.apply(this, params);
      }
    }
  };

  JsonQueue.handleExpensiveOpComplete = function(shardId) {
    if (shards[shardId].queue.length > 0) {
      // process next op
      var op = shards[shardId].queue.shift();
      op.func.apply(this, op.args);
    }
    else {
      shards[shardId].expensiveOpInflight = false;
    }
  };

  Object.preventExtensions(JsonQueue);
})();