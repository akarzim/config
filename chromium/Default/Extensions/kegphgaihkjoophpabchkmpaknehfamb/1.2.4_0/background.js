/*
 * Coupons at Checkout Browser Extension
 * Copyright (c) 2012 CouponFollow, LLC.  All rights reserved.
 * Copying this source code in any manner is strictly prohibited.  
 */

"use strict";

var history = [];

// Initialize add-on
setTimeout(function () {
    
    var currVersion = getVersion();
    var prevVersion = localStorage['version']
    
    if (currVersion != prevVersion) {
        
        if (typeof prevVersion == 'undefined') {
            onInstall();
        } else {
            onUpdate();
        }
        
        localStorage['version'] = currVersion;
    }
    
    chrome.extension.onRequest.addListener(requestHandler);
    
}, 500);

function onInstall() {
    chrome.tabs.create({url: 'http://couponfollow.com/checkout/chrome/success'});
}

function onUpdate() {
    //chrome.tabs.create({url: 'http://couponfollow.com/checkout/chrome/updated'});
}

function getVersion() {
    return chrome.app.getDetails().version;
}

function requestHandler(request, sender, sendResponse) {

    log('requestHandler: call = ' + request.call);

    if (request.call == "pasteCoupon") {

        pasteCoupon(request.arg);

    } else if (request.call == "setHistory") {

        setHistory(request.arg);

    } else if (request.call == "getHistory") {

        getHistory(request.arg, sendResponse);

    } else if (request.call == "getHighlight") {

        getHighlight(sendResponse);

    } else {

        sendResponse({});

    }

}

function pasteCoupon(data, sendResponse) {

    if (data.nt == 1) {

        chrome.tabs.create({
            url: 'http://couponfollow.com/code/go/' + data.id,
            active: false
        });

    }

    chrome.tabs.getSelected(null, function (tab) {
        chrome.tabs.sendMessage(tab.id, data);
    });
}

function setHistory(domain) {

    chrome.tabs.getSelected(null, function (tab) {

        log('setHistory: tab.id = ' + tab.id);
        log('setHistory: domain = ' + domain);

        // Initialize if undefined
        if (!history[tab.id]) {
            history[tab.id] = [];
        }

        // Add current domain to browsing history
        if (!contains(history[tab.id], domain)) {

            if (history[tab.id].length == 3) {
                history[tab.id].shift();
            }

            history[tab.id].push(domain);

        }

        log('setHistory: history = ' + history[tab.id].join(','));

    });

}

function getHistory(data, sendResponse) {

    chrome.tabs.getSelected(null, function (tab) {

        log('getHistory: tab.id = ' + tab.id);
        log('getHistory: point.left = ' + data.point.left);
        log('getHistory: point.top = ' + data.point.top);

        history[tab.id].pop();

        var toSend = {
            history: history[tab.id].join(','),
            point: data.point
        };

        log('getHistory: history = ' + toSend.history);

        sendResponse(toSend);

    });
}

function getHighlight(sendResponse) {

    log('getHighlight: highlight = ' + localStorage["highlight"]);

    if (!localStorage["highlight"]) {
        localStorage["highlight"] = "true";
    }

    sendResponse({
        highlight: localStorage["highlight"]
    });

}

// Utility method for Array contains object
function contains(a, obj) {
    var i = a.length;
    while (i--) {
        if (a[i] === obj) {
            return true;
        }
    }
    return false;
}

function log(message) {
    //console.log('CATC > ' + message);
}