/*jslint browser: true */
/*global rdb: true, $: true, chrome: true */
rdb.chrome.popup = (function () {
    "use strict";

    function init() {
        var save_button   = $('#save'),
            read_button   = $('#read'),
            kindle_button = $('#kindle'),
            // Keyboard shortcut spans
            save_shortcut   = save_button.find('.keyboard-shortcut'),
            read_shortcut   = read_button.find('.keyboard-shortcut'),
            kindle_shortcut = kindle_button.find('.keyboard-shortcut');


        save_button.bind('click', function () {
            chrome.extension.sendRequest({message: 'save'});
            window.close();
        });

        read_button.bind('click', function () {
            chrome.extension.sendRequest({message: 'read'});
            window.close();
        });

        kindle_button.bind('click', function () {
            chrome.extension.sendRequest({message: 'kindle'});
            window.close();
        });

        rdb.chrome.get_options_handler(function (options_handler) {
            rdb.extensions.display_shortcut_as_ul(
                save_shortcut,
                options_handler.get_option_by_key('read_later_shortcut'),
                ''
            );

            rdb.extensions.display_shortcut_as_ul(
                read_shortcut,
                options_handler.get_option_by_key('read_now_shortcut'),
                ''
            );

            rdb.extensions.display_shortcut_as_ul(
                kindle_shortcut,
                options_handler.get_option_by_key('kindle_shortcut'),
                ''
            );
        });
    }

    return {
        init: init
    };
}());

rdb.chrome.popup.init();
