/*global window: true, top: true, chrome: true, rdb: true, Keanu: true, */
/*jslint browser: true, devel: true */
rdb.chrome.onload = (function () {
    "use strict";
    var // Variables to keep the keyboard shortcuts from accidently activating
        shortcutLock = false,
        shortcutLockTimeout,
        // Map of shortcut keys to callables
        shortcut_map = {
            "read_later_shortcut": function () {
                chrome.extension.sendRequest({message: 'save'});
            },
            "read_now_shortcut": function () {
                chrome.extension.sendRequest({message: 'read'});
            },
            "kindle_shortcut": function () {
                chrome.extension.sendRequest({message: 'kindle'});
            }
        };
        

    function windowFocusHandler() {
        // Lock the shortcuts from triggering when the window has just been
        // entered. This is to prevent erroneous keyboard shortcut triggers
        // when tabbing between windows and tabs.
        clearTimeout(shortcutLockTimeout);
        // Set the lock on shortcuts
        shortcutLock = true;
        // 
        shortcutLockTimeout = setTimeout(function () {
            rdb.extensions.log("Clearing shortcut lock");
            shortcutLock = false;
        }, 1500);
    }


    function init() {
        rdb.extensions.log("Readability init starting");
        // Add the global flag that the extension is installed
        if (rdb.extensions.url_is_local(document.location.href)) {
            var addon_script  = document.createElement('script');

            addon_script.setAttribute('type', 'text/javascript');
            addon_script.setAttribute('charset', 'UTF-8');
            addon_script.innerHTML = ['(function(){',
                    'window.readabilityAddonInstalled = true;',
                '}())'].join('');

            document.body.appendChild(addon_script);
        }

        if (
            // Don't attach to iframes
            window === top &&
            rdb.extensions.page_is_valid(document.location.href)
        ) {
            window.onfocus = windowFocusHandler;

            rdb.extensions.log("Requesting options handler");
            // Start listening for options
            rdb.chrome.get_options_handler(function (options_handler) {
                rdb.extensions.log("Received options handler");
                function check_shortcut(shortcut) {
                    if (
                        // Only listen to events emitted from the BODY
                        event.target.tagName === "BODY" &&
                        // Don't fire the shortcut event if we are locked
                        !shortcutLock
                    ) {
                        var shortcut_key = options_handler.get_option_by_value(shortcut);

                        if (shortcut_key && shortcut_map[shortcut_key]) {
                            rdb.extensions.log("Calling shortcut " + shortcut);
                            shortcut_map[shortcut_key]();
                        }
                    }
                    else if (shortcutLock) {
                        rdb.extensions.log("Not firing, shortcut lock");
                    }
                }

                // Start listening for keyboard shortcuts
                Keanu.listen(check_shortcut);
            });
        }
    }

    return {
        init: init
    };
}());

rdb.chrome.onload.init();
