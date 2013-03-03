/*
* Coupons at Checkout - Chrome Browser Extension
* Copyright (c) 2012 CouponFollow, LLC.  All rights reserved.  Patent Pending.
* Copying this source code in any manner is strictly prohibited.  
*/

"use strict";
var keywords = ["discount", "promo", "coupon", "voucher", "redemption", "redeem", "ccode",
    "offer|code", "key|code", "referral|code", "gift|code", "source|code", "cert|code", 
    "submit|code", "system|code", "claim|code"];
var cartKeywords = ["cart", "checkout", "basket", "order", "merchant.mvc", "shopping|bag",
    "jockey|bag", "macys|bag", "process", "register", "shipping", "commerce", 
    "promotion", "customer"];
var panelWidth = 405;
var panelHeight = 120;
var codeSelector = '#tab-coupons tr.coderow';
var couponInputSelector = 'input[data-catc="coupon_input"]';
var url = document.location.href.toLowerCase();
var domain = getDomain(url);
var input = null;

// Check inner frames for our panel iframe
if (domain === "couponfollow.com" && url.indexOf('/checkout/chrome/success') === -1) {

    // If we are on our iframe panel then invoke our event handler
    onCouponFollowFrame();

} else if (window === window.top) {

    chrome.extension.onMessage.addListener(

    function (request, sender, sendResponse) {
        log('pasteCoupon: coupon code = ' + request.couponCode);
        $(couponInputSelector).val(request.couponCode);
        $('#cf-panel').hide();
    });

    // Add to history
    chrome.extension.sendRequest({
        call: 'setHistory',
        arg: domain
    });

    // Test current page for cart page
    var isCartPage = isCart();

    if (isCartPage) {

        log('shopping cart page detected');

        input = getCouponInput();

        if (input) {

            // Set our attribute so that we can find the input from the background page
            setCouponInputCustomAttribute(input);

            chrome.extension.sendRequest({
                call: 'getHighlight'
            }, function (response) {
                setHighlight(response);
            });
        }

    }

}

// Adds custom attribute to the coupon input element
function setCouponInputCustomAttribute(input) {
    input.attr('data-catc', 'coupon_input');
}

// The event handler for our iframe panel
function onCouponFollowFrame() {

    // Iterate over all coupon codes to add paste coupon event handlers
    $(codeSelector).each(function (index) {

        // Adds the paste coupon event handler to the couponfollow image button
        $(this).click(function (event) {
            pasteCoupon(event);
        });

    });

};

// Paste coupon event handler: asks the add-on object to do the job
function pasteCoupon(event) {

    var data = {
        id: $(event.target).parents('tr').attr('data-id'),
        nt: $('#tab-coupons').attr('data-nt'),
        couponCode: $(event.target).parents('tr').attr('data-code') //$(event.target).text()
    };

    log('pasteCoupon: data-nt = ' + data.nt);
    log('pasteCoupon: couponCode = ' + data.couponCode);

    chrome.extension.sendRequest({
        call: "pasteCoupon",
        arg: data
    });

};

// Test the current URL for a shopping cart URL
function isCart() {

    for (var i = 0; i < cartKeywords.length; i++) {
        var cartKeyword = cartKeywords[i];
        var cartParts = cartKeyword.split('|');
        if (cartParts.length == 1) {
            if ((url.indexOf(cartParts[0]) != -1)) {
                log('isCartPage => FOUND: ' + cartKeyword);
                return true;
            } else {
                log('isCartPage => NOT Found: ' + cartKeyword);
            }
        }
        else if (cartParts.length > 1) {
            if ((url.indexOf(cartParts[0]) != -1) && (url.indexOf(cartParts[1]) != -1)) {
                log('isCartPage => FOUND: ' + cartParts[0] + ' and ' + cartParts[1]);
                return true;
            } else {
                log('isCartPage => NOT Found: ' + cartParts[0] + ' and ' + cartParts[1]);
            }
        }
    }

    return false;
}

// Finds the coupon input element on the cart page
function getCouponInput() {

    var input = null;
    var matchedInputs = null;

    // Iterate over all the input text elements on the page
    var inputs = $('input:text,input[type=text]');

    // If there are any input elements then we proceed
    if (inputs.size()) {

        // Iterate over our keywords trying to find a match
        $.each(keywords, function (index, keyword) {

            log('Looking for ' + keyword);

            var parts = keyword.split('|');

            if (parts.length == 1) {

                // Find an input element according our algorithm
                matchedInputs = inputs.filter(

                function (index) {
                    return ((($(this).attr("id")) && ($(this).attr("id").toLowerCase().indexOf(keyword) != -1)) ||
                            (($(this).attr("name")) && ($(this).attr("name").toLowerCase().indexOf(keyword) != -1)));
                }).first();

                // If input is matched then exit
                if (matchedInputs.size()) {
                    input = matchedInputs;
                    return false;
                }

            } else {

                // Find an input element according our algorithm
                matchedInputs = inputs.filter(

                function (index) {
                    return ((($(this).attr("id")) && ($(this).attr("id").toLowerCase().indexOf(parts[0]) != -1)) ||
                            (($(this).attr("name")) && ($(this).attr("name").toLowerCase().indexOf(parts[0]) != -1))) &&
                            ((($(this).attr("id")) && ($(this).attr("id").toLowerCase().indexOf(parts[1]) != -1)) ||
                            (($(this).attr("name")) && ($(this).attr("name").toLowerCase().indexOf(parts[1]) != -1)));
                }).first();

                // If input is matched then exit
                if (matchedInputs.size()) {
                    input = matchedInputs;
                    return false;
                }

            }

            //Final check for exact match on "code"
            matchedInputs = inputs.filter(

            function (index) {
                return ((($(this).attr("id")) && ($(this).attr("id").toLowerCase() == "code")) ||
                        (($(this).attr("name")) && ($(this).attr("name").toLowerCase() == "code")));
            }).first();

            // If input is matched then exit
            if (matchedInputs.size()) {
                input = matchedInputs;
                return false;
            }

            return true;

        });

    }

    return input;
}

// Injects the couponfollow iframe 
function injectFrame($input, shouldHighlight) {

    // Inject only if not already injected
    if ($('#cf-panel').size() == 0) {

        $input.click(function (event) {
            showCouponsPanel(event);
        });

        log('injectCouponInput: coupon input click event handler attached');

        // Highlight the coupon input if configured
        if (shouldHighlight == "true") {

            var currentStyle = $input.attr('style');
            var newStyle = ' outline:none; border-radius:3px; -webkit-border-radius:3px; ' +
                '-moz-border-radius:3px; border:1px solid rgba(0,0,0, 0.2); ' +
                'box-shadow: 0 0 5px rgba(225, 25, 25, 1); -webkit-box-shadow: 0 0 5px rgba(225, 25, 25, 1); ' +
                '-moz-box-shadow: 0 0 5px rgba(225, 25, 25, 1); border:1px solid rgba(225,25,25, 0.8);';

            $input.attr('style', currentStyle + newStyle);

            log('injectCouponInput: coupon input highlighted');
        }

        // Preload the iframe so that there is no delay when shown
        // Get the coupons iframe URL taking into account the browsing history
        // Re-route the iframe loading through getHistory event handler
        // as we need to query the add-on object for the user browsing history
        chrome.extension.sendRequest({
            call: 'getHistory',
            arg: {
                point: {
                    top: 0,
                    left: 0
                }
            }
        }, function (response) {
            setHistory(response);
        });

    }

}

// The event handler that receives the user browsing history from the add-on object
// Also used to display the coupons panel afterwards
function setHistory(data) {
    log('setHistory: history = ' + data.history);

    // Get the coupons iframe URL taking into account the browsing history
    var frameURL = getCouponPage(data.history);

    // Define the CP iframe element
    var $frame = $('<iframe>', {
        id: 'couponfollowIfr',
        type: 'content',
        frameborder: '0',
        scrolling: 'no',
        src: frameURL,
        width: panelWidth + 'px',
        heigth: panelHeight + 'px',
        css: {
            display: 'block',
            visibility: 'visible'
        }
    });

    // Create the CF panel element as DIV and append to body
    $('<div>', {
        id: 'cf-panel',
        css: {
            display: 'none',
            position: 'absolute',
            'box-shadow': '4px 4px 2px #A8A8A8',
            'background-color': 'white',
            top: data.point.top + 'px',
            left: data.point.left + 'px',
            height: panelHeight + 'px',
            width: panelWidth + 'px',
            border: '1px solid grey',
            'z-index': '2147483647',
            overflow: 'hidden'
        }
    }).append($frame).appendTo('body');

    // Make sure it hides when user clicks anywhere else
    $(document).click(function () {
        $('#cf-panel').hide();
    });

    log('setHistory: hidden iframe created');
}

// Receives the highlight configuration option
function setHighlight(data) {
    log('setHighlight: highlight = ' + data.highlight);
    var $input = $(couponInputSelector);
    log('setHighlight: coupon input found = ' + $input.size());
    injectFrame($input, data.highlight);
}

// Returns the coupon iframe URL build based on browsing history
function getCouponPage(history) {
    var url1 = 'https://couponfollow.com/sites/' + domain + '/?ref=' + history;
    log('getCouponPage: url = ' + url1);
    return url1;
}

// Extracts the domain from the given URL
function getDomain(u) {
    var re = new RegExp('^(?:f|ht)tp(?:s)?\://([^/]+)', 'im');
    if (re.test(u)) {
        return u.match(re)[1].toString().replace(/www./i, '');
    } else {
        return '';
    }
}

// Show or hides the coupons panel
function showCouponsPanel(aEvent) {

    if ($('#cf-panel').size()) {
        if ($('#cf-panel:hidden').size()) {

            // Make sure it is displayed at current mouse pointer
            var point = calculateViewportCoordinates(aEvent);
            $('#cf-panel').css({
                top: point.top + 'px',
                left: point.left + 'px'
            });
            $('#cf-panel').show();

        } else {
            $('#cf-panel').hide();
        }
    }

    aEvent.stopPropagation();
}

// Utility method to calculate the coordinates where to display the coupons panel
function calculateViewportCoordinates(aEvent) {

    var point = {
        top: aEvent.pageY,
        left: aEvent.pageX
    };

    var inputOffset = input.offset();
    var offset = input.offset();
    var x = aEvent.pageX - (offset.left);
    var y = aEvent.pageY - (offset.top);
    
    var addX = (input.outerWidth() - x) - input.outerWidth(); //get total height - offset of click
    var addY = input.outerHeight() + 1 - y; //get total height - offset of click

    point.top = aEvent.pageY + addY;
    point.left = aEvent.pageX + addX;
    var endOfDivY = aEvent.clientY + panelHeight; // this.panelHeight
    var endOfDivX = aEvent.clientX + panelWidth; // + this.panelWidth;

    if (window.innerHeight < endOfDivY) {
        point.top = aEvent.pageY - panelHeight - input.height() - y + 3;
    }
    if (window.innerWidth < endOfDivX) {
        point.left = aEvent.pageX - x - panelWidth + input.outerWidth();
    }

    return point;

}

//For debugging purposes
function log(message) {
    //console.log('CATC > ' + message);
}