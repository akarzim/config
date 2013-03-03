// Copyright 2009 Google Inc. All Rights Reserved.

var CLICK_BEHAVIOR_KEY = 'click-behavior';
var REFRESH_INTERVAL_KEY = 'refresh-interval';

function getClickBehavior() {
  return localStorage[CLICK_BEHAVIOR_KEY] || 'module';
}

function setClickBehavior(value) {
  localStorage[CLICK_BEHAVIOR_KEY] = value;
}

function getRefreshInterval() {
  return parseInt(localStorage[REFRESH_INTERVAL_KEY] || '300000', 10);
}

function setRefreshInterval(value) {
  localStorage[REFRESH_INTERVAL_KEY] = value;
}
