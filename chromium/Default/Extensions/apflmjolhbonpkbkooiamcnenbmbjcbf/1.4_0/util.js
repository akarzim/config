// Copyright 2010 Google Inc. All Rights Reserved.

/**
 * A wrapper method for document.getElementById.
 * @param {string} id The is of the element.
 * @return {HTMLElement} The html element for the given element id.
 */
function $(id) {
  return document.getElementById(id);
}

/**
 * Regular expression to check whether or not a tab is opened to Reader.
 *
 * @type {RegExp}
 * @private
 */
var READER_URL_RE_ = /^https?\:\/\/www.google.com\/reader\/view\//;


/**
 * Reader homepage URL
 *
 * @type {string}
 */
var READER_URL = 'https://www.google.com/reader/view/';

/**
 * Regular expression to extract the unread count out of a Reader tab title.
 *
 * @type {RegExp}
 */
var TITLE_UNREAD_COUNT_RE = /\s+\((\d+)(\+?)\)$/;

/**
 * Time in milliseconds that we wait for an unread count request to complete.
 *
 * @type {number}
 * @private
 */
var REQUEST_TIMEOUT_MS_ = 30 * 1000; // 30 seconds

/**
 * Unread count request URL (expected to return JSON)
 *
 * @type {string}
 * @private
 */
var REQUEST_URL_ =
    'http://www.google.com/reader/api/0/unread-count' +
    '?output=json&client=chromenotifier&refresh=true';

/**
 * Regular expression to match the user's reading list.
 *
 * @type {RegExp}
 * @private
 */
var READING_LIST_RE_ =
    new RegExp('user/[\\d]+/state/com\\.google/reading-list');
