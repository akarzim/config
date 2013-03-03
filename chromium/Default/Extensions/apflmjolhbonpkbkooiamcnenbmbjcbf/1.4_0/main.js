// Copyright 2009 Google Inc. All Rights Reserved.

/**
 * Badge color when user is signed out.
 *
 * @type {Object}
 * @private
 */
var SIGNED_OUT_BADGE_COLOR_ = {color: [190, 190, 190, 230]};

/**
 * Badge color when user is signed in.
 *
 * @type {Object}
 * @private
 */
var SIGNED_IN_BADGE_COLOR_ = {color: [208, 0, 24, 255]};

/**
 * Badge color when we highlight unread count changes.
 *
 * @type {Object}
 * @private
 */
var HIGHLIGHT_BADGE_COLOR_ = { color: [255, 50, 50, 255]};

/**
 * Duration of unread count highlight.
 *
 * @type {number}
 * @private
 */
var BADGE_FADE_DURATION_MS_ = 1000;

var requestTimeout;
var loadingAnimation;
var badgeFadeAnimation;
var isSignedOut;

/**
 * Base class for animations. Subclasses should implement {@link #paintFrame}.
 *
 * @constructor
 */
function Animation() {
  this.timerId_ = 0;
  this.msPerFrame = 100;
}

/** Starts the animation, if not started already. */
Animation.prototype.start = function() {
  if (this.timerId_) {
    return;
  }

  this.timerId_ = window.setInterval(
      this.paintFrame.bind(this), this.msPerFrame);
};

/** Stops the animation, if not stopped already. */
Animation.prototype.stop = function() {
  if (!this.timerId_) {
    return;
  }

  window.clearInterval(this.timerId_);
  this.timerId_ = 0;
};

/**
 * A "loading" animation displayed while we wait for the first response
 * (animates the badge text with a dot that cycles from left to right.)
 *
 * @constructor
 * @extends {Animation}
 */
function LoadingAnimation() {
  Animation.call(this);
  this.maxCount_ = 8;  // Total number of states in animation
  this.current_ = 0;  // Current state
  this.maxDot_ = 4;  // Max number of dots in animation
}
goog.inherits(LoadingAnimation, Animation);

/**
 * Paints the badge text area while loading the data.
 */
LoadingAnimation.prototype.paintFrame = function() {
  lastCountText = 'loading-animation';

  var text = '';
  for (var i = 0; i < this.maxDot_; i++) {
    text += (i == this.current_) ? '.' : ' ';
  }

  chrome.browserAction.setBadgeBackgroundColor(SIGNED_OUT_BADGE_COLOR_);
  chrome.browserAction.setBadgeText({text: text});
  this.current_++;
  if (this.current_ == this.maxCount_) {
    this.current_ = 0;
  }
};

/**
 * Animation which pulses the badge color gradually.
 * @param {Object} fromColor color to pulse from and to eventually return to.
 * @param {Object} toColor color to pulse to.
 * @constructor
 */
function BadgeFadeAnimation(fromColor, toColor) {
  Animation.call(this);
  this.msPerFrame = 33;
  this.fromColor_ = fromColor;
  this.toColor_ = toColor;
}
goog.inherits(BadgeFadeAnimation, Animation);

/**
 * @override
 */
BadgeFadeAnimation.prototype.start = function() {
  Animation.prototype.start.call(this);

  this.startTime_ = new Date().getTime();
};

/**
 * Fade the badge text area according to badge fade duration.
 */
BadgeFadeAnimation.prototype.paintFrame = function() {
  var now = new Date().getTime();
  var progress = (now - this.startTime_) / BADGE_FADE_DURATION_MS_;

  if (progress >= 1.0) {
    chrome.browserAction.setBadgeBackgroundColor(this.fromColor_);
    this.stop();
    return;
  }

  var currentColor = {color: []};
  if (progress < .5) {
    progress = progress / .5;
    for (var i = 0; i < 4; i++) {
      currentColor.color[i] = Math.floor(
          this.fromColor_.color[i] * (1.0 - progress) +
          this.toColor_.color[i] * progress);
    }
  } else {
    progress = (progress - .5) / .5;
    for (var i = 0; i < 4; i++) {
      currentColor.color[i] = Math.floor(
          this.toColor_.color[i] * (1.0 - progress) +
          this.fromColor_.color[i] * progress);
    }
  }

  chrome.browserAction.setBadgeBackgroundColor(currentColor);
};

var lastCountText = 'start';

function updateUnreadCount(count, isMax) {
  chrome.browserAction.setIcon({path: 'icon-signed-in.png'});
  var countText = '';
  if (count > 0) {
    countText = count + '';
    if (isMax) {
      countText += '+';
    }
  }

  if (countText == lastCountText) {
    return;
  }

  lastCountText = countText;

  chrome.browserAction.setBadgeBackgroundColor(SIGNED_IN_BADGE_COLOR_);
  chrome.browserAction.setBadgeText({text: countText});
  badgeFadeAnimation =
      new BadgeFadeAnimation(SIGNED_IN_BADGE_COLOR_, HIGHLIGHT_BADGE_COLOR_);
  badgeFadeAnimation.start();
}

function showSignedOut() {
  lastCountText = '';
  chrome.browserAction.setIcon({path: 'icon-signed-out.png'});
  chrome.browserAction.setBadgeBackgroundColor(SIGNED_OUT_BADGE_COLOR_);
  chrome.browserAction.setBadgeText({text: '?'});
}

function startRequest(opt_noSchedule) {
  loadingAnimation.start();

  if (requestTimeout) {
    window.clearTimeout(requestTimeout);
  }
  requestTimeout = null;

  getUnreadCount(
    function(count, isMax) {
      isSignedOut = false;
      loadingAnimation.stop();
      updateUnreadCount(count, isMax);
      if (!opt_noSchedule) {
        scheduleRequest();
      }
    },
    function(opt_isSignedOut) {
      isSignedOut = true;
      loadingAnimation.stop();
      showSignedOut();
      if (!opt_noSchedule) {
        scheduleRequest(opt_isSignedOut);
      }
    }
  );
}

function getUnreadCount(onSuccess, onError) {
  var xhr = new XMLHttpRequest();
  var abortTimerId = window.setTimeout(function() {
    xhr.abort();
    onError();
  }, REQUEST_TIMEOUT_MS_);

  function handleSuccess(jsonText) {
    window.clearTimeout(abortTimerId);
    var json;

    try {
      json = JSON.parse(jsonText);
    } catch (e) {
      console.log('JSON parse exception: ' + e);
      handleError();
      return;
    }

    // Find the reading list unread count
    for (var i = 0, stream; stream = json.unreadcounts[i]; i++) {
      if (READING_LIST_RE_.test(stream.id)) {
        onSuccess(stream.count, stream.count >= json.max);
        return;
      }
    }

    // Fallthrough: we couldn't find the reading list unread count, assume it's
    // 0 (items with a 0 unread count are not output)
    onSuccess(0, false);
  }

  function handleError(opt_isSignedOut) {
    window.clearTimeout(abortTimerId);
    onError(opt_isSignedOut);
  }

  try {
    xhr.onreadystatechange = function() {
      if (xhr.readyState == 4) {
        if (xhr.status >= 400) {
          console.log(
              'Error response code: ' + xhr.status + '/' + xhr.statusText);
          handleError(xhr.status == 401);
        } else if (xhr.responseText) {
          handleSuccess(xhr.responseText);
        } else {
          console.log('No responseText!');
          handleError();
        }
      }
    }

    xhr.onerror = function(error) {
      console.log(error);
      handleError();
    }

    xhr.open('GET', REQUEST_URL_, true);
    xhr.send(null);
  } catch (e) {
    console.log('XHR exception: ' + e);
    handleError();
  }
}

function scheduleRequest(opt_isSignedOut) {
  if (requestTimeout) {
    window.clearInterval(requestTimeout);
  }

  var interval = getRefreshInterval();
  // Refresh more often while the user is signed out, so that we can pick up
  // the unread count faster
  if (opt_isSignedOut) {
    interval *= .1;
  }
  window.console.log('scheduling request in ' + interval + 'ms');
  requestTimeout = window.setTimeout(startRequest, interval);
}

function getReaderTab(callback) {
  chrome.tabs.getAllInWindow(undefined, function(tabs) {
    for (var i = 0, tab; tab = tabs[i]; i++) {
      if (tab.url && READER_URL_RE_.test(tab.url)) {
        callback(tab);
        return;
      }
    }

    callback(null);
  });
}

loadingAnimation = new LoadingAnimation();
