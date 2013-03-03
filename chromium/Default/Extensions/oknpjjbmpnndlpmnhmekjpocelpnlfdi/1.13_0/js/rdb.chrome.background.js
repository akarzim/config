/*jslint browser: true */
/*global rdb: true, $: true, chrome: true, Keanu: true */
rdb.chrome.background = (function () {
    "use strict";

    var site_name = "www.readability.com",
        baseUrl         = 'http://' + site_name,
        secureBaseUrl   = 'https://' + site_name,
        firstRunUrl     = baseUrl + '/account/extension/complete/',
        syncUrl         = baseUrl + '/account/extension/sync',
        accountToolsUrl = baseUrl + '/account/tools',
        ajax_sync_url   = baseUrl + '/extension/ajax/sync',
        addonsUrl       = baseUrl + '/addons',
        // Sync variables
        version = '1.13',
        // Sent to our site after token exchange as json string
        sync_profile = {
            platform: 'chrome',
            version:  version,
            os:       rdb.extensions.get_os()
        },
        //
        // Default options, will be stored in local_storage
        options = {
            // Shortcuts
            read_now_shortcut:       "192",    // `
            read_later_shortcut:     "16_192", // Shift + `
            kindle_shortcut:         "16_17_75" // Shift + Ctrl + k
        },
        //
        //
        readabilityToken,

        inject_lock = (function () {
            var lockMillis = 1000,
                lockTimeout;

            function clearLock() {
                lockTimeout = clearTimeout(lockTimeout);
            }

            function setLock(millis) {
                lockTimeout = setTimeout(clearLock, millis);
            }

            return function (func, millis) {
                if (typeof lockTimeout === 'undefined') {
                    setLock(millis || lockMillis);
                    func();
                } else {
                    rdb.extensions.log("Lock timeout");
                }
            };
        }());


    // Inject a file from the chrome extension into the current document
    function inject_script(file) {
        // Pass all script injections through a rate limited lock
        inject_lock(function () {
            chrome.tabs.getSelected(null, function (tab) {
                rdb.extensions.log(file + " for " + tab.url);
            });
            // Inject the rdb.chrome namespace first
            chrome.tabs.executeScript(undefined, {'file': 'js/rdb.chrome.js'});
            chrome.tabs.executeScript(undefined, {'file': file});
        });
    }


    function token_request_handler(request, sender, sendResponse) {
        $.get(ajax_sync_url, function (response) {
            sendResponse({
                'readabilityToken': response.readabilityToken,
                'version':          sync_profile.version
            });
        }, 'json');
    }


    function save_request_handler(request, sender, sendResponse) {
        inject_script('js/save.js');
    }


    function read_request_handler(request, sender, sendResponse) {
        inject_script('js/read.js');
    }


    function kindle_request_handler(request, sender, sendResponse) {
        inject_script('js/send-to-kindle.js');
    }


    function options_request_handler(request, sender, sendResponse) {
        var response_object = {},
            key;
        for (key in options) {
            response_object[key] = localStorage[key];
        }
        sendResponse(response_object);
    }


    // Receive the token from content script
    function token_sync_handler(request, sender, sendResponse) {
        if (request.readabilityToken) {
            readabilityToken = request.readabilityToken;
            localStorage['rdb.readabilityToken'] = readabilityToken;
        }

        inject_script('js/sync.js');
    }


    function sync_profile_handler(request, sender, sendResponse) {
        sendResponse(sync_profile);
    }


    function request_handler(request, sender, sendResponse) {
        // Map messages to their appropriate handler
        var message_handlers = {
            'read':                     read_request_handler,
            'save':                     save_request_handler,
            'kindle':                   kindle_request_handler,
            'token_request':            token_request_handler,
            'token_sync':               token_sync_handler,
            'sync_profile_request':     sync_profile_handler,
            'options_request':          options_request_handler
        };

        message_handlers[request.message](request, sender, sendResponse);
    }


    function get_tab_by_urls(options) {
        chrome.windows.getAll({'populate': true}, function (windows) {
            var window_index, win, tab_index, tab, tab_url;
            for (window_index in windows) {
                win = windows[window_index];
                for (tab_index in win.tabs) {
                    tab = win.tabs[tab_index];
                    tab_url = tab.url.toLowerCase();
                    if (
                        // Check for single url passed
                        options.url && (
                            tab_url === options.url.toLowerCase() || tab_url.replace(/\/$/, '')
                        )
                    ) {
                        options.callback(tab);
                        return;
                    } else if (
                        options.urls && (
                            options.urls.indexOf(tab_url) >= 0 ||
                            options.urls.indexOf(tab_url.replace(/\/$/, '')) >= 0
                        )
                    ) {
                        options.callback(tab);
                        return;
                    }
                }
            }

            if (options.force) {
                chrome.tabs.create({}, options.callback);
            }
            return;
        });
    }

    function init() {
        var first_run_complete = Boolean(localStorage['rdb.first_run_complete']),
            stored_version = localStorage['rdb.version'],
            key,
            existing_value;

        readabilityToken = localStorage['rdb.readabilityToken'];

        // Add event listeners
        chrome.extension.onRequest.addListener(request_handler);

        for (key in options) {
            existing_value = localStorage[key];

            if ( // If the option hasn't been set in localStorage yet
                typeof existing_value === 'undefined'
            ) {
                localStorage[key] = options[key];
            }
        }

        // Only runs the first time the extension is installed
        if (!first_run_complete) {
            get_tab_by_urls({
                urls:     [addonsUrl, accountToolsUrl, baseUrl, secureBaseUrl],
                force:    true,
                callback: function (tab) {
                    chrome.tabs.update(tab.id, {'url': firstRunUrl, 'selected': true});
                }
            });

            localStorage['rdb.version'] = version;
            localStorage['rdb.first_run_complete'] = 1;

        } else if (stored_version !== version) {
            localStorage['rdb.version'] = version;
        }
    }

    return {
        init: init
    };
}());

rdb.chrome.background.init();
