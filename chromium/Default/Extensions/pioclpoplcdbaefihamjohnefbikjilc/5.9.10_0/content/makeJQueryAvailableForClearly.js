// This script exists solely to make jQuery available to Clearly. It's a separate script that must run between
// injecting jQuery and injecting ClearlyComponent. This keeps us from having to modify these third-party libraries.
if (!window) throw new Error("No Window!");
if (!window.jQuery) throw new Error("No jQuery!");
window.jQueryForClearlyComponent = window.jQuery;
