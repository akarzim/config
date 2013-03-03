/*jslint browser: true */
/*global rdb: true */
rdb = typeof rdb === 'undefined' ? {} : rdb;

rdb.extensions = (function () {
    "use strict";
    var debug = "0" === "1",
        site_name = "www.readability.com",
        baseUrl = 'http://' + site_name,
        secureBaseUrl = 'https://' + site_name,
        //
        browser_string = 'chrome',
        //
        constants = {
            DISABLED_PREF: '0'
        };


    function get_os() {
        var oses = {
                'Win'   : 'windows',
                'Mac'   : 'darwin',
                'Linux' : 'linux',
                'X11'   : 'unix'
            };

        for (var os_key in oses){
            if(navigator.appVersion.indexOf(os_key) != -1){
                return oses[os_key];
            }
        }

        return undefined;
    }


    var log = (function(){
        // Firefox specific log
        if(browser_string === 'firefox'){
            return function (message, force){
                if(debug || force){
                    Application.console.log( '[readability] ' + message );
                }
            };
        }

        return function (message, force){
            if(debug || force){
                console.log(message);
            }
        };

    }());


    var url_is_valid = (function(){
        var invalid_list = [
                /^file:/,
                /^about:blank/,
                /^about:home/,
                /^https?:\/\/localhost/,
                /^https?:\/\/127\.0\.0\.1/,
                /^https?:\/\/10\.\d{1,3}\.\d{1,3}\.\d{1,3}/
            ];

        return function(given_url){
            var url = given_url ? given_url.toLowerCase() : document.location.href.toLowerCase(),
                i, regex;

            for(i = 0; i < invalid_list.length; i++){
                regex = invalid_list[i];
                if(regex.test(url)){
                    return false;
                }
            }
            return true;
        };
    }());


    // Returns true if a given url is hosted on our site
    function url_is_local(given_url){
        var url = given_url ? given_url.toLowerCase() : document.location.href.toLowerCase();

        // Return true if the baseUrl or secureBaseUrl is at the beginning of the url
        return (url.indexOf(baseUrl) === 0 || url.indexOf(secureBaseUrl) === 0);
    }


    function get_netloc(url){
        var netloc = url.indexOf('http') >= 0 ? url.split('/')[2] : url.split('/')[0];
        return netloc;
    }


    var site_in_blacklist = (function (){
        var site_blacklist = 'mail.google.com;topsy.com'.toLowerCase().split(';');

        return function(given_url){
            var url = given_url ? given_url.toLowerCase() : document.location.href.toLowerCase(),
                netloc = get_netloc(url);

            return site_blacklist.indexOf(netloc) >= 0;
        };
    }());


    function page_is_valid(given_url){
        var url = typeof(given_url) === 'undefined' ? document.location.href : given_url,
            is_valid;

        is_valid = (
            url_is_valid(url) &&
            !site_in_blacklist(url) &&
            !url_is_local(url)
        );

        if(!is_valid){
            log('Url ' + url + ' is not valid.');
        }

        return is_valid;
    }


    function display_shortcut_as_ul(el, shortcut){
        // Clear the current shortcut
        el.html('');
        // Display disabled shortcut
        if(
            typeof shortcut === 'undefined' ||
            shortcut === '' ||
            shortcut === rdb.extensions.constants.DISABLED_PREF
        ){
            el.append($('<li class="disabled"><span>disabled<span></li>'));
        }
        else {
            var shortcut_array = Keanu.shortcut_to_keyarray(shortcut),
                which, li, span;

            for(var i = 0; i < shortcut_array.length; i++){
                which = shortcut_array[i];
                li = $('<li>');
                span = $('<span>');

                span.append(Keanu.transform_which(which));
                li.append(span);

                if(i < shortcut_array.length -1){
                    li.append(' + ');
                }

                if(Keanu.is_modifier(which)){
                    li.addClass('modifier');
                }

                el.append(li);
            }
        }
    }


    // Public interface
    return {
        constants:         constants,
        log:               log,
        get_os:            get_os,
        page_is_valid:     page_is_valid,
        // Granular validation tests
        site_in_blacklist: site_in_blacklist,
        url_is_valid:      url_is_valid,
        url_is_local:      url_is_local,
        // Helpers
        display_shortcut_as_ul: display_shortcut_as_ul
    };
}());

if(typeof exports !== 'undefined'){
    exports.extensions = rdb.extensions;
}
