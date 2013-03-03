var assert = require('assert');

extensions = require("../js/rdb.extensions.js").extensions;

// url_is_valid tests
assert.equal(extensions.url_is_valid("http://127.0.0.1"), false);
assert.equal(extensions.url_is_valid("https://127.0.0.1"), false);
assert.equal(extensions.url_is_valid("http://10.0.0.5"), false);
assert.equal(extensions.url_is_valid("https://10.0.0.5"), false);
assert.equal(extensions.url_is_valid("http://10.0.0.5/something"), false);
assert.equal(extensions.url_is_valid("https://10.0.0.5/something"), false);
assert.equal(extensions.url_is_valid("http://localhost"), false);
assert.equal(extensions.url_is_valid("http://localhost/something"), false);
assert.equal(extensions.url_is_valid("https://localhost"), false);
assert.equal(extensions.url_is_valid("https://localhost/something"), false);

assert.equal(extensions.url_is_valid("http://127something.com"), true);
assert.equal(extensions.url_is_valid("https://127something.com"), true);
assert.equal(extensions.url_is_valid("http://10.something.com"), true);
assert.equal(extensions.url_is_valid("https://10.something.com"), true);

console.log("All tests passed");
