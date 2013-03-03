/*jslint browser: true */
/*global rdb: true, $: true, Keanu: true, chrome: true */
rdb = typeof rdb === 'undefined' ? {} : rdb;

rdb.chrome = (function () {
    "use strict";
    var debug = "0" === "1",
        site_name = "www.readability.com",
        baseUrl = 'http://' + site_name,
        secureBaseUrl = 'https://' + site_name;

    function display_shortcut(el, shortcut, passed_disabled) {
        var disabled_string = passed_disabled || 'disabled',
            shortcut_array, which, li, span, i;

        // Clear the current shortcut
        el.html('');

        // Display disabled shortcut
        if (typeof shortcut === undefined || shortcut === rdb.extensions.constants.DISABLED_PREF) {
            el.append($('<li>')
                .html(disabled_string)
                .addClass('disabled'));
        } else {
            shortcut_array = Keanu.shortcut_to_keyarray(shortcut);

            for (i = 0; i < shortcut_array.length; i += 1) {
                which = shortcut_array[i];
                li = $('<li>');
                span = $('<span>');

                span.append(Keanu.transform_which(which));
                li.append(span);

                if (i < shortcut_array.length - 1) {
                    li.append(' + ');
                }

                if (Keanu.is_modifier(which)) {
                    li.addClass('modifier');
                }

                el.append(li);
            }
        }
    }

    // Inject a script from our servers into the page
    function inject_page_script(script_url) {
        if (
            !rdb.extensions.url_is_local() &&
                rdb.extensions.url_is_valid() &&
                !rdb.extensions.site_in_blacklist()
        ) {
            // Request the token before injecting the script
            chrome.extension.sendRequest({message: 'token_request'}, function (response) {
                var server_script = document.createElement('script'),
                    token_script  = document.createElement('script'),
                    inject_url    = document.location.protocol + '//' + site_name + script_url,
                    inject_token  = typeof (response.readabilityToken) === 'undefined' ? '' : response.readabilityToken;

                console.log(inject_url);

                token_script.setAttribute('type', 'text/javascript');
                token_script.setAttribute('charset', 'UTF-8');
                token_script.innerHTML = ['(function(){',
                    'window.readabilityExtensionType = "addon";',
                    'window.readabilityToken = "' + inject_token + '";',
                    'window.readabilityExtensionVersion = "' + response.version + '";',
                    'window.readabilityExtensionBrowser = "chrome";',
                    '}())'].join('');
                document.body.appendChild(token_script);

                server_script.setAttribute('type', 'text/javascript');
                server_script.setAttribute('charset', 'UTF-8');
                server_script.setAttribute('src', inject_url);
                document.body.appendChild(server_script);
            });
        }
    }

    //
    function get_options_handler(options_callback) {
        // Keep track of all the options internally here and update them as
        // they change.
        var options = {};

        // Receive any updated options
        function options_sync(request, sender, sendResponse) {
            var option_key;
            if (request.options) {
                for (option_key in request.options) {
                    if (request.options.hasOwnProperty(option_key)) {
                        options[option_key] = request.options[option_key];
                    }
                }
            }
        }

        function get_option_by_value(value) {
            var option_key;
            for (option_key in options) {
                if (options[option_key] === value) {
                    return option_key;
                }
            }
            return false;
        }

        function get_option_by_key(key) {
            var return_option;
            try {
                return_option = options[key];
            }
            catch (option_key_error) {
                return_option = undefined;
            }
            return return_option;
        }


        // Listen for messages from extension for changes to options
        chrome.extension.onRequest.addListener(
            function (request, sender, sendResponse) {
                // Message dispatch table
                var message_handlers = {
                    "options_sync": options_sync
                };
                message_handlers[request.message](request, sender, sendResponse);
            }
        );


        // Handle the incoming message from requesting options
        function options_request_response_handler(response) {
            var option_key;
            for (option_key in response) {
                if (response.hasOwnProperty(option_key)) {
                    options[option_key] = response[option_key];
                }
            }

            // Populate the callback with the public interface to the
            // options handler
            options_callback({
                get_option_by_value: get_option_by_value,
                get_option_by_key: get_option_by_key
            });
        }

        // Request all of the options from the background scope
        chrome.extension.sendRequest({message: 'options_request'}, options_request_response_handler);
    }

    return {
        "display_shortcut" : display_shortcut,
        "get_options_handler": get_options_handler,
        "inject_page_script" : inject_page_script
    };
}());
