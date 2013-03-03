function PageInfo() {
  "use strict";

  // This is a map of hostnames (for hostnames that begin with 'www.', the 'www.' will be stripped off first, so don't
  // include it in your lookup string) to CSS selectors. When we try and locate an article in a page, we'll see if we
  // can find the doamin for the page in this list, and if so, we'll try and find an element that matches the given
  // selector. If no element is returned, we'll fall back to the heuristic approach.
  var specialCases = {
    "penny-arcade.com": ["div.contentArea > div.comic > img"],
    "aspicyperspective.com": ["div.entry-content"],
    "thewirecutter.com": ["div#content"],
    "katespade.com": ["div#pdpMain"],
    "threadless.com": ["section.product_section"],
    "yelp.com": ["div#bizBox"],
    "flickr.com": ["div#photo"],
    "instagr.am": ["div.stage > div.stage-inner"],
    "stackoverflow.com": ["div#mainbar"],
    "makeprojects.com": ["div#guideMain"],
    "cookpad.com": ["div#main #recipe"],
    "imgur.com": ["div.image"],
    "smittenkitchen.com": ["div.entry"],
    "allrecipes.com": ["div#content-wrapper"],
    "qwantz.com": ["img.comic"],
    "questionablecontent.net": ["img#strip"],
    "cad-comic.com": ["div#content"],
    "twitter.com": [".permalink", "div.content-main"],
    "blog.evernote.com": [".post"]
  }

  // this list of domains requires special handling in which we insert a div to
  // capture and cut out the section we want when the smallest box that holds
  // the article captures too much information. Each entry has the smallest box
  // (container) and a list of stuff in the container that we want to capture.
  var specialCasesInsertBox = {
    "blog.evernote.com": {
      container: "#page-wrap > section > article",
      include: "h2, .p-meta, .post-meta, .thumbnail, .art-content"
    },
    "kirei.biglobe.ne.jp": {
      container: "div#main",
      include: ".recipeTitle, .recepeMain, #howTo"
    },
    "nomnompaleo.com": {
      container: "section article.text",
      include: "header, section"
    },
    "foodnetwork.com": {
      container: "#fn-w",
      include: ".rcp-head, .tabnav, #recipe-lead, .w-inner, .body-text"
    }
  };

  var useFoundImage = [
    "xkcd.com"
  ]

  var searchEngines = {
    Baidu: {
      regex: /^https?:\/\/([^.\/]+\.)?baidu\.(com|cn)\/s/i,
      content: "#container",
      searchBox: "input[name=wd]",
      allowedElements: "h3.t a[data-click], .f font[size='-1']",
      bannedSubelements: "span.g, .m, .c",
      titleTrim: function(title) {
        var regex = /\u767E\u5EA6\u641C\u7D22_(.+)/;
        return regex.exec(title)[1];
      }
    },
    Bing: {
      regex: /^https?:\/\/([^.\/]+\.)?bing\.com\/search/i,
      content: "#results_container",
      searchBox: "input[name=q]",
      allowedElements: "div.sb_tlst a, div.sa_mc p"
    },
    Daum: {
      regex: /^https?:\/\/search\.daum\.net\/search/i,
      content: "#mArticle .inner_article",
      searchBox: "input[name=q]",
      allowedElements: ".coll_cont ul .wrap_tit a, .coll_cont ul .f_eb.desc",
      titleTrim: function(title) {
        var regex = /(.+)\s\u2013/;
        return regex.exec(title)[1];
      }
    },
    Google: {
      regex: GlobalUtils.buildGoogleRegEx(),
      content: "#rso",
      searchBox: "input[name=q][type=hidden]",
      allowedElements: "a.l, span.st", // css selector for the titles and snippets of search results
      bannedSubelements: "span.f" // css selector for nodes within allowed elements that we don't want
    },
    Naver: {
      regex: /^https?:\/\/search\.naver\.com\/search\.naver/i,
      content: "#content",
      searchBox: "input[name=query]",
      allowedElements: ".type01 dt a, " +
        ".type01 dd:not(.txt_inline):not(.txt_block):not(.review):not([style*='display:none'])",
      titleTrim: function(title) {
        var regex = /(.+)\s\u003A\u003A/;
        return regex.exec(title)[1];
      }
    },
    Yahoo: {
      regex: /^https?:\/\/([^.\/]+\.)*yahoo\.com\/s(earch|\?)/i,
      content: "#main",
      searchBox: "input[name=p]",
      allowedElements: ".yschttl.spt[id], .abstr"
    },
    YahooCN: {
      regex: /^https?:\/\/([^.\/]+\.)*yahoo\.cn\/s(earch|\?)/i,
      content: ".content",
      searchBox: "input[name=q]",
      allowedElements: "h3.title a, .desc",
      titleTrim: function(title) {
        var regex = /(.+)_\u7F51\u9875\u641C\u7D22/;
        return regex.exec(title)[1];
      }
    },
    YahooJP: {
      regex: /^https?:\/\/([^.\/]+\.)*yahoo\.co\.jp\/s(earch|\?)/i,
      content: "#WS2m ul",
      searchBox: "input[name=p]",
      allowedElements: "#WS2m .hd h3 a, #WS2m .bd p",
      bannedSubelements: "#WS2m .bd p.dlink",
      titleTrim: function(title) {
        var regex = /\u300C(.+)\u300D/;
        return regex.exec(title)[1];
      }
    },
    Yandex: {
      regex: /^https?:\/\/([^.\/]+\.)?yandex\.com\/yandsearch/,
      content: ".b-serp2-list.b-serp.i-bem.b-serp_js_inited.b-serp2-list_js_inited",
      searchBox: "input[name=text]",
      allowedElements: ".b-serp2-item__title-link, .b-serp2-item__text",
      bannedSubelements: ".b-serp2-item__from",
      titleTrim: function(title) {
        var regex = /(.+)\s+\u2014/;
        return regex.exec(title)[1];
      }
    },
    YandexRU: {
      regex: /^https?:\/\/([^.\/]+\.)?yandex\.ru\/yandsearch/,
      content: ".b-serp-list",
      searchBox: "input[name=text]",
      allowedElements: ".b-serp-item__wrapper .b-serp-item__title-link, .b-serp-item__text",
      bannedSubelements: ".b-serp-item__from",
      titleTrim: function(title) {
        var regex = /(.+)\s+\u2014/;
        return regex.exec(title)[1];
      }
    }
  }

  // These are the items we're trying to collect. This first block is trivial.
  var containsImages = Boolean(document.getElementsByTagName("img").length > 0);
  var documentWidth = document.width;
  var documentHeight = document.height;
  var url = document.location.href;
  var documentLength = document.body.textContent.length;

  // These take slightly more work and are initialized only when requested.
  var article = null;
  var articleBoundingClientRect = null;
  var selection = false; // This is easy to get, but is always "false" at load time until the user selects something.
  var selectionIsInFrame = false;
  var documentIsFrameset = false;
  var selectionFrameElement = null;
  var recommendationText = null;

  var clearlyInjected = false;

  // Internal state variables to keep us duplicating work.
  var hasCheckedArticle = false;

  // Hack to make Safari selection clipping work. Keeps track of the last text that was selected so that we'll still
  // have it even after the popup has appeared and erased it.
  var lastSelectionRanges = [];

  // determine if this page is a search engine page
  var searchEngine = null;
  for (var engine in searchEngines) {
    if (searchEngines[engine].regex.test(document.location.href)) {
      searchEngine = engine;
      break;
    }
  }

  // Experimental recognition of 'image' pages (like photo sites and comics).
  function findImage() {
    var imgs = document.getElementsByTagName("img");
    var biggest = null;
    var biggestArea = 0;
    for (var i = 0; i < imgs.length; i++) {
      var style = window.getComputedStyle(imgs[i]);
      var width = style.width.replace(/[^0-9.-]/g, "");
      var height = style.height.replace(/[^0-9.-]/g, "");
      var area = width * height;
      if (!biggest || area > biggestArea) {
        biggest = imgs[i];
        biggestArea = area;
      }
    }
    return biggest;
  }

  function getAncestors(node) {
    var an = [];
    while (node) {
      an.unshift(node);
      node = node.parentNode;
    }
    return an;
  }

  function getDeepestCommonNode(nodeList1, nodeList2) {
    var current = null;
    for (var i = 0; i < nodeList1.length; i++) {
      if (nodeList1[i] === nodeList2[i]) {
        current = nodeList1[i];
      }
      else {
        break;
      }
    }
    return current;
  }

  function getCommonAncestor(nodeList) {
    if (!nodeList.length) return null;

    if (nodeList.length == 1) return nodeList[0];
    var lastList = getAncestors(nodeList[0]);

    var node = null;
    for (var i = 1; i < nodeList.length; i++) {
      var list = getAncestors(nodeList[i]);
      node = getDeepestCommonNode(lastList, list);
      lastList = getAncestors(node);
    }
    return node;
  }

  function clearlyCallback(data, callback) {

    findImage();

    // See if we should special-case this.
    var host = getHostname();
    if (specialCasesInsertBox[host]) {
      var container = document.querySelector(specialCasesInsertBox[host].container);
      if (container) {
        var include = container.querySelectorAll(specialCasesInsertBox[host].include);
        if (include && include.length > 0) {
          var insertBefore = include[include.length - 1].nextElementSibling;
          article = document.createElement("div");
          for (var i = 0; i < include.length; i++) {
            article.appendChild(include[i]);
          }
          container.insertBefore(article, insertBefore);
        }
      }
    }

    if (!article && specialCases[host])
    {
      for (var i = 0; i < specialCases[host].length; i++) {
        var candidate = document.querySelector(specialCases[host][i]);
        if (candidate) {
          article = candidate;
          articleBoundingClientRect = article.getBoundingClientRect();
          break;
        }
      }
    }

    // Or see if it's a special case image page.
    else if (useFoundImage.indexOf(host) != -1) {
      article = findImage();
      if (article) 
        articleBoundingClientRect = article.getBoundingClientRect();
    }

    // If we're scanning a search engine's page, don't grab the whole page since they contain useless words that are
    // not related to the search query.
    if (!article) {
      if (searchEngine) {
        article = document.querySelector(searchEngines[searchEngine].content);
        // no search results -> don't want it to capture the entire page, shouldn't capture anything
        if (!article || article.textContent.trim() == "") {
          article = document.createElement("div");
          document.body.insertBefore(article, document.body.firstChild);
        }
        articleBoundingClientRect = article.getBoundingClientRect();
      }
    }

    // If it's not a special case, see if it's a single image.
    if (!article) {
      var imageTypes = ['jpeg', 'jpg', 'gif', 'png'];
      var urlExtension = document.location.href.replace(/^.*\.(\w+)$/, "$1");
      if (urlExtension && (imageTypes.indexOf(urlExtension) != -1)) {
        var candidate = document.querySelector("body > img");
        if (candidate) {
          article = candidate;
          articleBoundingClientRect = article.getBoundingClientRect();
        }
      }
    }

    // If we still didn't find an article, let's see if maybe it's in a frame. Cleary fails on frames so we try this
    // check before we use our clearly info.
    if (!article) {
      if (document.body.nodeName.toLowerCase() == "frameset") {
        documentIsFrameset = true;
        var frame = findBiggestFrame();
        if (frame && frame.contentDocument && frame.contentDocument.documentElement) {
          selectionFrameElement = frame;
          article = frame.contentDocument.documentElement;
          articleBoundingClientRect = article.getBoundingClientRect();
        }
      }
    }

    // If we didn't use any of our special case handling, we'll use whatever clearly found.
    if (!article) {
      if (data && data._elements && data._elements.length) {
        article = data._elements[0];
        if (data._elements.length > 1) {

          // This will include *all* clearly elements (and whatever else in in between them).
          article = getCommonAncestor(data._elements);

          // This includes *just the last (and therefore most important)* element from the clearly detection.
          // article = data._elements[data._elements.length - 1];
        }

        if (article.nodeType === Node.TEXT_NODE) {
          article = article.parentNode;
        }
      }
    }

    // If clearly found nothing (because it failed), then use the body of the document.
    if (!article) {
      article = document.body;
    }

    hasCheckedArticle = true;
    callback();
  }

  // This will try and determine the 'default' page article. It will only run once per page, but it's specifically
  // called only on demand as it can be expensive.
  function findArticle(callback) {

    function afterInject() {
      // If we'd previously computed an article element, but it's lost its parent or become invisible, then we'll try
      // and re-compute the article. This can happen if, for example the page dynamically udaptes itself (like showing 
      // the latest news article in a box that updates periodically). This doesn't guarantee that we clip something 
      // sane if this happens, (if the page re-writes itself while a clip is taking place, the results are 
      // indeterminate), but it will make such things less likely.
      if (article &&
          (!article.parentNode || !article.getBoundingClientRect || article.getBoundingClientRect().width == 0)) {
        article = null;
        hasCheckedArticle = false;
      }

      if (!hasCheckedArticle) {
        if (!window || !window.ClearlyComponent) 
        {
          console.warn("Couldn't find clearly!");
          clearlyCallback(null, callback);
        }
        else {
          window.ClearlyComponent.getContentElementAndHTML(window, function(data){clearlyCallback(data, callback)});
        }
      }
      // If the page is big enough, clearly is excruciatingly slow. We'll jsut get the whole page.
      // @TODO: Maybe clearly can get faster.
      else if (document.body.innerHTML.length > (1024 * 1024)) {
        console.warn("Page over 1mb, skipping article detection.");
        clearlyCallback(null, callback);
      }
      else {
        callback();
      }
    }

    // We may need to inject clearly code here. Currently we don't do this for Safari and just inject this script on
    // all pages because of the lack of granularity in Safari content script injection.
    if (!clearlyInjected) {
      if (searchEngine) {
        afterInject();
      }
      else {
        clearlyInjected = true;
        if (typeof SAFARI != "undefined" && SAFARI) {
          try {
            injectClearly();
            afterInject();
          }
          catch (e) {
            console.warn("failed injecting Clearly");
            console.error(e);
          }
        }
        else {
          if (chrome.extension.sendMessage) {
            chrome.extension.sendMessage({name: "injectScript", script: "third_party/clearly_component.js"}, afterInject);
          }
          else {
            chrome.extension.sendRequest({name: "injectScript", script: "third_party/clearly_component.js"}, afterInject);
          }
        }
      }
    }
    else {
      afterInject();
    }

  }

  function findBiggestFrame() {
    var frames = document.getElementsByTagName("frame");
    var candidate = null;
    var candidateSize = 0;
    for (var i = 0; i < frames.length; i++) {
      if (frames[i].width && frames[i].height) {
        var area = frames[i].width * frames[i].height;
        if (area > candidateSize) {
          candidate = frames[i];
          candidateSize = area;
        }
      }
    }
    return candidate;
  }

  function getHostname() {
    var match = document.location.href.match(/^.*?:\/\/(www\.)?(.*?)(\/|$)/);
    if (match) {
      return match[2];
    }
    return null;
  }

  function getDefaultArticle(callback) {
    findArticle(function(){callback(article)});
    // Article already exists, so we'll return it.
    if (article) return article;
  }

  if (typeof Browser != "undefined") {
    Browser.addMessageHandlers({
      getInfo: getInfoRequestHandler,

      // This is versioned to handle upgrades from older versions of the clipper. We don't want clipper version (for
      // example) 6 to be installed over version 5, and request pageInfo, and get back an inaccurate version 5 
      // message./ Instead, we only handle the message specifically for the version of the clipper that we were 
      // installed as. This means that when someone installs a new clipper, but existing windows are still running 
      // content scripts // from an older clipper, the new clipper popup will not get a response from them (because 
      // it will send a request with a newer version number). It can then handle that failure gracefully.
      content_ready_5_9_10: readyRequestHandler
    });
  }
  else {
    window.addEventListener("message", function(request) {
      if (request.data.name == "getInfo") {
        _getInfoRequestHandler(null, request.data, null, function(response) {
          // Update the web page title so the result can be accessed via
          // scripts
          document.title = response.recommendationText;
        });
      }
    })
  }

  function rememberTextSelection() {
    var s = getSelection();
    lastSelectionRanges = [];
    if (s) {
      for (var r = 0; r < s.rangeCount; r++) {
        var range = s.getRangeAt(r);
        lastSelectionRanges[r] = range;
      }
    }
  }

  if (typeof SAFARI != "undefined" && SAFARI) {
    window.addEventListener("mouseup", rememberTextSelection);
    Browser.addKeyboardHandlers({
      "65 + 91": rememberTextSelection
    });
  }

  // Looks for selections in the current document and descendent (i)frames.
  // Returns the *first* non-empty selection.
  function getSelection() {

    // First we check our main window and return a selection if that has one. 
    var selection = window.getSelection();
    if (selection && selection.rangeCount && !selection.isCollapsed) {
      return selection;
    }

    // Then we'll try our frames and iframes.
    var docs = [];
    var iframes = document.getElementsByTagName("iframe");
    for (var i = 0; i < iframes.length; i++) {
      docs.push(iframes[i]);
    }
    var frames = document.getElementsByTagName("frame");
    for (var i = 0; i < frames.length; i++) {
      docs.push(frames[i]);
    }

    var urlBase = document.location.href.replace(/^(https?:\/\/.*?)\/.*/i, "$1").toLowerCase();
    for (var i = 0; i < docs.length; i++) {

      // If frames/iframes fail a same origin policy check, then they'll through annoying errors, and we wont be able
      // to access them anyway, so we attempt to skip anything that wont match.
      if (docs[i].src && docs[i].src.toLowerCase().substr(0, urlBase.length) !== urlBase) {
        continue;
      }

      var doc = docs[i].contentDocument;

      if (doc) {
        var frameSelection = doc.getSelection();
        if (frameSelection && frameSelection.rangeCount && !frameSelection.isCollapsed) {
          selectionIsInFrame = true;
          selectionFrameElement = docs[i];
          return frameSelection;
        }
      }
      else {
        console.warn("iframe contained no Document object.");
      }
    }

    // Didn't find anything.
    return null;
  }

  function reselectText() {
    var sel = window.getSelection();
    sel.removeAllRanges();
    for (var r = 0; r < lastSelectionRanges.length; r++) {
      sel.addRange(lastSelectionRanges[r]);
    }
  }

  function getText(node, soFar, maxLen, keepText, topNode) {
    if (node.nodeType == Node.TEXT_NODE) {
      if (keepText || !searchEngine) {
        var text = cleanSearchEngineText(node, topNode);
        // remove punctuation and whitespace
        var trimmed = GlobalUtils.removePunctuation(text.trim()).replace(/\s+/g, " ");
        if (trimmed === " " || trimmed === "") return soFar;
        return soFar + " " + trimmed;
      }
      return soFar;
    }

    var banned = [
      "script",
      "noscript",
      "style"
    ];

    if (node.nodeType == Node.ELEMENT_NODE) {
      if (banned.indexOf(node.nodeName.toLowerCase()) == -1) {
        for (var i = 0; i < node.childNodes.length; i++) {
          if (searchEngine) {
            // mark text within our allowed elements. keepText and topNode cascade down the DOM node subtree of topNode
            // the allowed text nodes will know to 
            if (matchesBannedSelectorInSearchEngine(node.childNodes[i])) {
              continue;
            }
            if (matchesAllowedSelectorInSearchEngine(node) || keepText) {
              if (topNode) {
                soFar = getText(node.childNodes[i], soFar, maxLen, true, topNode);
              }
              else {
                soFar = getText(node.childNodes[i], soFar, maxLen, true, node);
              }
            }
            else {
              soFar = getText(node.childNodes[i], soFar, maxLen);
            }
          }
          else {
            soFar = getText(node.childNodes[i], soFar, maxLen);
          }
          if (soFar.length > maxLen) {
            return soFar;
          }
        }
      }
    }
    return soFar;
  }

  function matchesAllowedSelectorInSearchEngine(node) {
    var selector = searchEngines[searchEngine].allowedElements;
    if (node.webkitMatchesSelector && node.webkitMatchesSelector(selector)) {
      return true;
    }
    return false;
  }

  function matchesBannedSelectorInSearchEngine(node) {
    var selector = searchEngines[searchEngine].bannedSubelements;
    if (selector) {
      if (node.webkitMatchesSelector && node.webkitMatchesSelector(selector)) {
        return true;
      }
    }
    return false;
  }

  /*
    Removes generic words from search engine result titles.
  */
  function cleanSearchEngineText(node, topNode) {
    var text = node.textContent;
    if (searchEngine) {
      var url;
      if (searchEngine == "Baidu") {
        url = topNode.parentNode.parentNode.querySelector(".g");
        if (url) {
          url = url.textContent;
        }
      }
      else if (searchEngine == "Yandex") {
        url = topNode.querySelector(".b-serp2-item__title-link");
        if (url) {
          url = url.href;
        }
      }
      else {
        url = topNode.href;
      }

      if (url) {
        var regexMap = {
          wikipedia: /(.*)[-|\u2013|\u2014]/,
          youtube: /(.*)[-|\u2013|\u2014]/,
          facebook: /(.*)\|/,
          wiktionary: /(.*)-\sWiktionary/,
          stumbleupon: /(.*)\|\sStumbleUpon\.com/
        };
        for (var site in regexMap) {
          if (new RegExp(site).test(url)) {
            var regex = regexMap[site];
            var match = regex.exec(text);
            if (match) {
              topNode.setAttribute("sawdivider", true);
              return match[1];
            }
            else if (topNode.getAttribute("sawdivider")) {
              return "";
            }
          }
        }
      }

      // remove Facebook "333 likes 666 talking about this" from search engine results
      if (/(\d+\slikes)|(\d+\stalking\sabout\sthis)/.test(text)) {
        return text.replace(/(\d+\slikes)|(\d+\stalking\sabout\sthis)/g, " ");
      }
      // remove wiktionary text
      else if (/Definition from Wiktionary, the free dictionary. Jump to: navigation, search/.test(text)) {
        return text.replace(/Definition from Wiktionary, the free dictionary. Jump to: navigation, search/g, " ");
      }
    }
    return text;
  }

  function getTitle() {
    var title = document.title;
    if (searchEngine) {
      if (searchEngines[searchEngine].titleTrim) {
        // this engine has a different method of generating result page titles than Google/Yahoo/Bing/Yandex
        title = searchEngines[searchEngine].titleTrim(title);
      }
      else {
        var pieces = title.split(" - ");
        title = title.replace(" - " + pieces[pieces.length - 1], "");
      }
    }
    return title;
  }

  function getSearchQuery() {
    if (searchEngine) {
      if (document.querySelector(searchEngines[searchEngine].searchBox)) {
        var query = document.querySelector(searchEngines[searchEngine].searchBox).value.trim();
        if (query.length > 0) {
          return query;
        }
      }
    }
    return null;
  }

  function getRecommendationText() {
    var text = "";
    var MAX_LEN = 5000;
    var selection = getSelection();
    if (selection) {
      var df = selection.getRangeAt(0).cloneContents();
      var div = document.createElement("div");
      div.appendChild(df);
      text = getText(div, "", MAX_LEN);
    }

    else if (article) {
      text = getText(article, "", MAX_LEN);
    }
    else {
      text = getText(document.body, "", MAX_LEN);
    }
    text = getTitle() + " " + text;
    return text;
  }

  // Note: you must call getSelection() first to populate this field!
  function getSelectionFrame() {
    return selectionFrameElement;
  }

  function checkClearly() {
    var clearlyDoc = document.querySelector("iframe#readable_iframe");
    if (clearlyDoc) clearlyDoc = clearlyDoc.contentDocument;
    if (clearlyDoc) clearlyDoc = clearlyDoc.querySelector("body#body div#box");
    if (clearlyDoc) {
      article = clearlyDoc;
      articleBoundingClientRect = article.getBoundingClientRect();
    }
  }

  // @TODO: This is fairly incomplete.
  function getFavIconUrl() {
    var links = document.getElementsByTagName("link");
    var i;
    for (i = 0; i < links.length; i++) {
      if (links[i].rel) {
        var rels = links[i].rel.toLowerCase().split(/\s+/);
        if (rels.indexOf("icon") !== -1) {
          // Found it!
          return links[i].href;
        }
      }
    }
    return null;
  }

  function _getInfoRequestHandler(data, request, sender, sendResponse) {
    var isSelected = getSelection();

    checkClearly();

    var response = {
      containsImages: containsImages,
      documentWidth: documentWidth,
      documentHeight: documentHeight,
      url: url,
      selection: (isSelected !== null) || (lastSelectionRanges.length > 0),
      selectionIsInFrame: selectionIsInFrame,
      documentLength: document.body.textContent.length,
      articleBoundingClientRect: articleBoundingClientRect,
      article: (article != null),
      recommendationText: getRecommendationText(),
      query: getSearchQuery(),
      searchEngine: searchEngine,
      favIconUrl: getFavIconUrl(),
      documentIsFrameset: documentIsFrameset,
      pdf: getPdfUrl()
    };

    if (request.sendToTab)
      sendResponse(response, true);
    else
      sendResponse(response, false);
  }

  // sendToTab is false if the original call is being called by the Popup, but it's true if it's being called by the
  // search results page
  function respondWithInfo(info, sendToTab) {
    if (typeof Browser != "undefined") {
      if (sendToTab)
        Browser.sendToExtension({name: "simSearch_receivePageInfo", info: info});
      else
        Browser.sendToExtension({name: "popup_receivePageInfo", info: info});
    }
  }

  function getInfoRequestHandler(request, sender, sendResponse) {
    // hack for safari to clip a selection from the popover. a bug in safari erases the text selection everytime the
    // popover comes up. so reselect it after the popover appears.
    if (typeof SAFARI != "undefined" && SAFARI && !request.sendToTab && lastSelectionRanges.length > 0
        && getSelection() == null) {
      reselectText();
    }
    findArticle(function(data){_getInfoRequestHandler(data, request, sender, respondWithInfo)});
  }

  // If we can respond to this request, then we're ready. Otherwise, the page hasn't loaded this script yet.
  function readyRequestHandler() {
    if (typeof Browser != "undefined") {
      Browser.sendToExtension({name: "popup_pageInfoReadyToGo", url: document.location.href});
    }
  }

  function getPdfUrl() {
    if (document.querySelector("embed[type='application/pdf']")) {
      return document.querySelector("embed[type='application/pdf']").src;
    }
    return null;
  }

  // Finally we notify the extension that we're ready to go, in case it's been sitting there waiting for us to load.
  // We pass it our URL so that it's less likely to get confused and think that we're ready to go when some other page
  // finishes loading. This is still heuristic, though, as the browser could be loading two separate copies of the same
  // URL. We'd send our own tab ID, but content scripts don't have access to that API call.
  readyRequestHandler();

  // Public API:
  this.getDefaultArticle = getDefaultArticle;
  this.getSelection = getSelection;
  this.getSelectionFrame = getSelectionFrame;
  this.getFavIconUrl = getFavIconUrl;

  Object.preventExtensions(this);
}

Object.preventExtensions(PageInfo);


