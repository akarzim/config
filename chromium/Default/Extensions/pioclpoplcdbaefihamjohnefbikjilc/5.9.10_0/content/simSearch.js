var searchEngine, searchHelper;

var searchEngines = {
  Baidu: {
    "regexp": /^https?:\/\/([^.\/]+\.)?baidu\.(com|cn)\/s/i,
    "queryParam": "wd",
    "insertBefore": [
      "#container table[class^='result']", // Normal results.
      "#container .nors" // error or no results found.
    ]
  },
  Bing: {
    "regexp": /^https?:\/\/([^.\/]+\.)?bing\.com\/search/i,
    "queryParam": "q",
    "insertBefore": ["#results"]
  },
  Daum: {
    "regexp": /^https?:\/\/search\.daum\.net\/search/i,
    "css": "daumsearchhelper.css",
    "queryParam": "q",
    "insertBefore": [
      "#splinkColl+div+hr+[id$='Coll']", "#mArticle [id$='Coll']", "#noResult"
    ]
  },
  Google: {
    "regexp": GlobalUtils.buildGoogleRegEx(),
    "queryParam": "q",
    "insertBefore": [
      "#rhs_block"
    ]
  },
  Naver: {
    "regexp": /^https?:\/\/search\.naver\.com\/search\.naver/i,
    "queryParam": "query",
    "insertBefore": [
      ".section:not(.ad_power) > .section_head", "#notfound p"
    ]
  },
  Yahoo: {
    "regexp": /^https?:\/\/([^.\/]+\.)*yahoo(\.com|\.co\.jp)\/s(earch|\?)/i,
    "queryParam": "p",
    "insertBefore": [
      "[start$='1']", // US/standard yahoo.com
      ".zrpmsg", // no results
      "#WS2m", // yahoo.co.jp
      "#WS2al p"
    ]
  },
  // This is different enough that it gets its own entry.
  YahooCN: {
    "regexp": /^https?:\/\/([^.\/]+\.)*yahoo\.cn\/s(earch|\?)/i,
    "queryParam": "q",
    "insertBefore": [
      ".record",
      ".tip_query" // no results
    ]
  },
  Yandex: {
    "regexp": /^https?:\/\/([^.\/]+\.)?yandex\.com\/yandsearch/,
    "queryParam": "text",
    "insertBefore": [".b-serp2-list__portion", ".b-serp-item__wrapper"]
  },
  YandexRU: {
    "regexp": /^https?:\/\/([^.\/]+\.)?yandex\.ru\/yandsearch/,
    "css": "yandexrusearchhelper.css",
    "queryParam": "text",
    "insertBefore": [".b-serp-list", ".b-serp-item__wrapper", ".b-error"]
  }
};

// Determine if we're on a search page and load required stylesheets and set up
// the search helper if so.
function checkSimSearch() {
  var href = document.location.href;
  var mainStyleSheet = "searchhelper.css";

  function addStyleSheet(sheetName) {
    if (!sheetName) return;
    var css = document.createElement("link");
    css.type = "text/css";
    css.rel = "stylesheet";
    css.href = Browser.extension.getURL("css/" + sheetName);
    document.head.appendChild(css);
  }

  for (var engine in searchEngines) {
    if (searchEngines[engine].regexp.test(href)){
      addStyleSheet(mainStyleSheet);
      addStyleSheet(searchEngines[engine].css);
      searchEngine = engine;
      break;
    }
  }

  if (searchEngine) {
    searchHelper = new SearchHelper();
  }
}

function SearchHelper() {
  var insertedElement;

  var options;
  var bootstrapInfo;
  var baseUrl;
  var auth;
  var useSimSearchInThisSession = true;

  function resolveAttachmentSelector(selector) {
    if (typeof selector == "string") {
      return document.querySelector(selector);
    }
    for (var i = 0; i < selector.length; i++) {
      var el = document.querySelector(selector[i]);
      if (el) return el;
    }
    return null;
  }

  function getAttachmentElement() {
    return resolveAttachmentSelector(searchEngines[searchEngine].insertBefore);
  }

  function msgHandlerIsAuthenticated(request, sender) {
    if (request && request.auth && request.auth.username) {
      auth = request.auth;
      search(true);
    }
    else {
      search(false);
    }
  }

  function msgHandlerConfig(request, sender) {
    options = request.options;
    bootstrapInfo = request.bootstrapInfo;
    baseUrl = options.secureProto + bootstrapInfo.serviceHost;
    if (searchEngine != "Google" || (searchEngine == "Google" && document.location.hash == "")) { // omnibox
      startSearch();
    }
  }

  function startSearch() {
    if (options.useSearchHelper && useSimSearchInThisSession) {
      Browser.sendToExtension({name: "main_isAuthenticated", type: "simSearch"});
    }
  }

  function hasQuery() {
    var param = searchEngines[searchEngine].queryParam;
    var searchBox = document.querySelector("input[name='" + param + "']");
    if (searchBox.value && searchBox.value.trim() != "") {
      return true;
    }
    return false;
  }

  function search(loggedIn) {
    var iframe = document.querySelector("#evernoteSimSearchResults");
    if (iframe && iframe.getAttribute("extension") != Browser.i18n.getMessage("@@extension_id")) {
      // the other extension has already started running this
      return;
    }
    var alreadyRanSimSearch = false;
    if (insertedElement && insertedElement.parentNode) {
      insertedElement.parentNode.removeChild(insertedElement);
      alreadyRanSimSearch = true;
    }
    if (!hasQuery()) {
      return;
    }

    // insert the iframe. the iframe's content will run scripts to fetch related notes from the extension
    insertedElement = document.createElement("iframe");
    var url = "content/sim_search_results.html?locale=" + bootstrapInfo["name"] + "&baseUrl=" + baseUrl;
    if (loggedIn) {
      url += "&userId=" + auth.userId + "&shardId=" + auth.shardId + "&client=" + options.client;
    }
    insertedElement.id = "evernoteSimSearchResults";
    insertedElement.setAttribute("extension", Browser.i18n.getMessage("@@extension_id"));
    var el = getAttachmentElement();

    // Sometimes (especially in Safari 5) we'll have the iframe ready before we have an attachment point. In that case,
    // we'll wait around for it to show up and attach then. For Yandex in all browsers, must wait for it to add its
    // search results before we can add simsearch or else it'll get overwritten
    function lateAttachmentHandler(evt) {
      if ((searchEngine == "Yandex")
          && !/b-serp2-list__portion/.test(evt.srcElement.className)) {
        return;
      }

      el = getAttachmentElement();
      if (el) {
        el.parentNode.insertBefore(insertedElement, el);
        insertedElement.src = Browser.extension.getURL(url);
        resizeIrameWidth();
        document.removeEventListener("DOMNodeInserted", lateAttachmentHandler);
      }
    }

    // In Yandex, the first query will have the search results ready, but every subsequent query will not be ready yet,
    // but will still have a non-null el. So try to insert it, then attach a late handler for the subsequent searches.
    if ((el && searchEngine != "Yandex")
        || (searchEngine == "Yandex" && !alreadyRanSimSearch)) {
      el.parentNode.insertBefore(insertedElement, el);
      insertedElement.src = Browser.extension.getURL(url);
      resizeIrameWidth();
    } else {
      document.addEventListener("DOMNodeInserted", lateAttachmentHandler);
    }
  }

  function msgHandlerSetIframeHeight(height) {
    insertedElement.style.height = height + "px";
    if (height == 0) {
      insertedElement.style.display = "none";
    }
    else {
      insertedElement.style.display = "block";
    }
  }

  function resizeIrameWidth() {
    var iframe = document.querySelector("#evernoteSimSearchResults");
    var rhs = document.querySelector("#rhs");
    if (iframe && rhs) {
      var curr = parseFloat(window.getComputedStyle(rhs).width);
      iframe.style.width = Math.min(Math.max(curr - 30, 280), 456) + "px";
    }
  }

  // message routes messages for HTML5 cross document messaging
  function router(evt) {
    if (new RegExp(evt.origin, "i").test(Browser.extension.getURL(""))) {
      if (evt.data.name == "simSearch_sendHeight") {
        msgHandlerSetIframeHeight(evt.data.height);
      }
      else if (evt.data.name == "temporarilyDisableSimSearch") {
        useSimSearchInThisSession = false;
      }
    }
  }

  Browser.addMessageHandlers({
    simSearch_isAuthenticated: msgHandlerIsAuthenticated,
    config: msgHandlerConfig,
  });

  if (searchEngine == "Google") {
    // Google doesn't change the hash in the url when the user changes the case of the search query or when Google
    // Instant is on, but it still refreshes the page, so run simsearch when the right side of the page gets
    // loaded
    document.addEventListener("DOMNodeInserted", function(evt) { if(evt.srcElement.id == "ires") startSearch() });
    window.addEventListener("resize", resizeIrameWidth);
  }
  else if (searchEngine == "Yandex") {
    // Yandex doesn't use the hash in the URL (only query params), so simsearch won't get triggered on the hashchange
    // event. We trigger when the user submits a new query.
    document.querySelector(".b-form-button__input").addEventListener("click", startSearch);
  }
  else {
    window.addEventListener("hashchange", function() {
      startSearch();
    });
  }

  window.addEventListener("message", router, false);

  Browser.sendToExtension(
    {name: "main_getConfig", 
    options: {
      secureProto: null,
      useSearchHelper: null,
      client: null
    },
    bootstrapInfo: {
      serviceHost: null,
      name: null
    }
  });

  Object.preventExtensions(this);
}
Object.preventExtensions(SearchHelper);
