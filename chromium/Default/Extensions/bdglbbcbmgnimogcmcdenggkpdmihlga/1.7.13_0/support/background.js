// Support code (c) 2011 All Rights Reserved.
// If you want to review the code please contact me at aproject180@gmail.com
// If you don't wish to support me you may disable it in the settings. 

(function(){
  
var stored = localStorage;
var user_blacklist   = stored.p180_blacklist  ? JSON.parse(stored.p180_blacklist)  : {};
var server_blacklist = stored.p180_blacklist2 ? JSON.parse(stored.p180_blacklist2) : {};
var next_impression  = +new Date;

if (typeof stored.support == "undefined")
  stored.support = "true";

if (typeof stored.healthy == "undefined")
  stored.healthy = "true";

if (typeof stored.install_date == "undefined")
  stored.install_date = +new Date;

p180_whitelist = {};
p180_blacklist = {};

if (stored.support == "true") {
  var script1 = document.createElement("script");
  script1.src = "support/lists/whitelist.js";
  document.documentElement.appendChild(script1);

  var script2 = document.createElement("script");
  script2.src = "support/lists/blacklist.js";
  document.documentElement.appendChild(script2);
}

stored.day || (stored.day = new Date(+new Date+stored.timezone).getUTCDate());
stored.impressions || (stored.impressions = "0");

function check_day() {
  var day = new Date(+new Date+stored.timezone).getUTCDate();
  if (stored.day != day) {
    stored.day = day;
    stored.impressions = "0";
  }
}

check_day();
setInterval(check_day, 5*60*1000);

function health_check() {
  if (stored.support != "true") return;
  ajax( "http://www.spdbit.com/health_check.js?ts=" + (+new Date),
    function (response) { // all keys and values should use double quotes!
      stored.healthy = "true";
      try { 
        response = JSON.parse(response);
        if (response.reset) 
          server_blacklist = {};
        if (response.blacklist) 
          for (var i = response.blacklist.length; i--;) 
              server_blacklist[response.blacklist[i]] = 1;
        if (response.whitelist) 
          for (var i = response.whitelist.length; i--;) 
              delete server_blacklist[response.whitelist[i]];
        stored.p180_blacklist2 = JSON.stringify(server_blacklist);
      } catch (e) {}
    }, function() {
      stored.healthy = "false";
  });
}

health_check();
setInterval(health_check, 5*60*1000); /// 5*60*1000

function ajax(url, onSuccess, onError) {
  var xhr = new XMLHttpRequest();
  xhr.onload = function () {
    if (xhr.status == 200)
      onSuccess(xhr.responseText);
    else 
      onError(xhr.responseText);
  };
  xhr.onerror = function () {
    onError();
  };
  xhr.open('GET', url, true);
  xhr.send(null);
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function get_domain(host) {
  var parts = host.split('.');
  var domain = parts[parts.length-2] + "." + parts[parts.length-1];
  if (/^com?$/.test(parts[parts.length-2])) // .co.<TLD> / .com.<TLD>
    domain = parts[parts.length-3] + "."  + domain;
  return domain;
}

function onRequest(request, sender, sendResponse) {
  if (request == "get-impressions") {
    sendResponse(stored.impressions);
  } else if (request == "inc-impressions") {
    stored.impressions = (++stored.impressions);
  } else if (request.name == "is-enabled") {
    var domain = get_domain(request.data);
    var enabled = (stored.support == "true" && stored.healthy == "true");
    var not_too_young = +new Date - stored.install_date > 48*60*60*1000;
    var on_whitelist = p180_whitelist[domain];
    var not_blacklisted = !user_blacklist[domain] && !p180_blacklist[domain] && !server_blacklist[domain];
    var chance = Math.random() < 0.75;
    var elapsed_enough = (+new Date > next_impression);
    var response = (elapsed_enough && enabled && not_too_young && not_blacklisted && on_whitelist && chance);
    if (response) next_impression = +new Date + getRandomInt(2*1000, 10*1000);
    sendResponse({enabled: response, next_impression: next_impression});
  } else if (request.name == "set-next-impression") {
    next_impression = request.data;
  } else if (request.name == "set-impressions") {
    stored.impressions = request.data;
  } else if (request.name == "blacklist-add") {
    user_blacklist[request.data] = 1;
    stored.p180_blacklist = JSON.stringify(user_blacklist);
  } 
}

chrome.extension.onMessage.addListener(onRequest);

window.onRequest = onRequest;

})();