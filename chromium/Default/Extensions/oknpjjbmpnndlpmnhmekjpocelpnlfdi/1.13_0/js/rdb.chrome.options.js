/*jslint browser: true */
/*global rdb: true, $: true, chrome: true, Keanu: true */

rdb.chrome.options = (function () {
    "use strict";
    // Listen for incoming options changes
    function options_sync_handler(request, sender, sendResponse) {
        var key, el, shortcut;

        if (request.options) {
            for (key in request.options) {
                // See if we have an element whose property matches this option
                el = $('[data-property="' + key + '"]');
                shortcut = request.options[key];

                if (el && typeof shortcut !== 'undefined') {
                    rdb.extensions.display_shortcut_as_ul(el, shortcut);
                }
            }
        }
    }

    // Dispatch options to anyone listening
    function sync_options(options) {
        var window_index, win, tab_index, tab;

        chrome.windows.getAll({populate: true}, function (windows) {
            for (window_index in windows) {
                win = windows[window_index];
                for (tab_index in win.tabs) {
                    tab = win.tabs[tab_index];
                    chrome.tabs.sendRequest(
                        tab.id,
                        {message: "options_sync", options: options}
                    );
                }
            }
        });
    }


    function set_option(option, passed_value) {
        var options_object = {},
            value = passed_value || rdb.extensions.constants.DISABLED_PREF;

        // Store the option
        localStorage[option] = value;

        // Dispatch 
        options_object[option] = value;
        sync_options(options_object);
    }


    function shortcut_mouseup_handler(event) {
        event.preventDefault();

        var shortcut_bar = $(event.currentTarget),
            property = shortcut_bar.attr('data-property');

        shortcut_bar.parent().addClass('active');

        // Clicking the bar again should cancel
        shortcut_bar.unbind('mouseup', shortcut_mouseup_handler);

        Keanu.get_shortcut({
            max_keys: 4,
            on_update: function (shortcut) {
                if (shortcut) {
                    rdb.extensions.display_shortcut_as_ul(shortcut_bar, shortcut);
                }
            },
            on_set: function (shortcut) {
                if (shortcut) {
                    rdb.extensions.display_shortcut_as_ul(shortcut_bar, shortcut);
                    set_option(property, shortcut);
                }
                // If we get false back for shortcut, redisplay the original shortcut
                else {
                    rdb.extensions.display_shortcut_as_ul(shortcut_bar, localStorage[property]);
                }
            },
            on_complete: function () {
                shortcut_bar.parent().removeClass('active');
                setTimeout(function () {
                    shortcut_bar.bind('mouseup', shortcut_mouseup_handler);
                }, 200);
            }
        });
    }


    // Options init
    function init() {
        // Keyboard shortcut boxes
        $(".shortcut-bar").each(function () {
            var shortcut_bar = $(this),
                property = shortcut_bar.attr('data-property'),
                clear_button = shortcut_bar.parent().find('.clear-shortcut');

            shortcut_bar.bind('mouseup', shortcut_mouseup_handler);

            // Display the existing shortcut
            rdb.extensions.display_shortcut_as_ul(shortcut_bar, localStorage[property]);

            clear_button.bind('mouseup', function (event) {
                set_option(property, "0");
                rdb.extensions.display_shortcut_as_ul(shortcut_bar, localStorage[property]);
            });
        });

        // Add event listeners
        chrome.extension.onRequest.addListener(
            function (request, sender, sendResponse) {
                // Map messages to their appropriate handler
                var message_handlers = {
                    'options_sync': options_sync_handler
                };

                if (request.message && message_handlers[request.message]) {
                    message_handlers[request.message](request, sender, sendResponse);
                }
            }
        );
    }

    return {
        init: init
    };
}());

$(rdb.chrome.options.init);
