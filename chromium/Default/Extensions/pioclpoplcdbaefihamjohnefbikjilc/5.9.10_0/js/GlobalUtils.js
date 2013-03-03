/*
  This file is a collection of globally accessible utility functions. They're intended to be used from anywhere you 
  might need them, which could be in various extension pages, or in content scripts, etc. This is design ed to be a
  small library, so don't include massive amounts of stuff. Think C standard library. A bit of text processing, etc.
  These are also all inserted into the global namespace, so no 'Evernote' object needs to be defined to use them.
*/

var GlobalUtils = {};
(function(){
  "use strict";

  var urlMatcher = /^(.*?):\/\/((www\.)?(.*?))(:\d+)?(\/.*?)(\?.*)?$/;

  var BAD_FAV_ICON_URLS = {"http://localhost/favicon.ico": true};

  GlobalUtils.componentizeUrl = function(url) {
    var data = {
      protocol: null,
      domain: null,
      domainNoWww: null,
      port: null,
      path: null,
      queryString: null
    };
    var matches = urlMatcher.exec(url);
    data.protocol = matches[1];
    data.domain = matches[2];
    data.domainNoWww = matches[4];
    data.port = matches[5];
    data.path = matches[6];
    data.queryString = matches[7];
    return data;
  };

  GlobalUtils.localize = function(element) {
    var node = element.nodeName.toLowerCase();
    if (node == "input" || node == "textarea") {
      var type = element.type;
      if (node == "textarea") type = "textarea";
      switch (element.type) {
        case "text":
        case "textarea":
        case "button":
        case "submit":
        case "search":
          if (element.attributes["placeholder"]) {
            var localizedMessage = Browser.i18n.getMessage(element.attributes["placeholder"].value);
            if (localizedMessage) {
              element.placeholder = localizedMessage;
            }
          }
          if (element.attributes["message"]) {
            var localizedMessage = Browser.i18n.getMessage(element.attributes["message"].value);
            if (localizedMessage) {
              element.value = localizedMessage;
            }
          }
          break;

        // unlocalizable.
        case "checkbox":
        case "password":
        case "hidden":
          break;

        default:
          throw new Error("We need to localize the value of input elements.");
      }
    }

    else if (element.attributes["message"]) {
      var localizedMessage = Browser.i18n.getMessage(element.attributes["message"].value);
      if (localizedMessage) {
        element.innerHTML = localizedMessage;
      }
    }

    if (element.title){
      var localizedTitle = Browser.i18n.getMessage(element.title);
      if (localizedTitle) {
        element.title = localizedTitle;
      }
    }

    for (var i = 0; i < element.children.length; i++) {
      GlobalUtils.localize(element.children[i]);
    }
  };

  GlobalUtils.getQueryParams = function(url) {
    var data = GlobalUtils.componentizeUrl(url);
    var queryString = data.queryString;
    var params = {};
    if (!queryString) {
      return params;
    };
    queryString = queryString.substr(1); // Don't want the question mark.
    queryString = queryString.split("#")[0]; // Get rid of any fragment identifier.
    var pairs = queryString.split("&");
    var i;
    for (i = 0; i < pairs.length; i++) {
      var item = pairs[i].split("=");
      if (item[1]) {
        item[1] = item[1].replace(/\+/g, " ");
      }
      params[item[0].toLowerCase()] = item[1];
    }
    return params;
  };

  GlobalUtils.escapeXML = function(str) {
    var map = {
      "&" : "&amp;",
      "<" : "&lt;",
      ">" : "&gt;",
      "\"" : "&quot;",
      "'" : "&apos;"
    };

    var a = str.split("");
    for (var i = 0; i < a.length; i++) {
      if (map[a[i]]) {
        a[i] = map[a[i]];
      }
    }
    return a.join("");
  };

  GlobalUtils.createUrlClipContent = function(title, url, favIcoUrl) {
    var titleAttr = (title) ? GlobalUtils.escapeXML(title) : "";
    var style = "font-size: 12pt; line-height: 18px; display: inline;";
    var content = "<a title=\"" + titleAttr + "\" style=\"" + style + "\" href=\"" + url + "\">" + url + "</a>";
    if (favIcoUrl && !BAD_FAV_ICON_URLS[favIcoUrl.toLowerCase()]) {
      var imgStyle = "display:inline;border: none; width: 16px; height: 16px; padding: 0px; margin: 0px 8px -2px 0px;";
      content = "<span><img title=\"" + titleAttr + "\" style=\"" + imgStyle + "\" src=\"" + favIcoUrl + "\"/>" + 
        content + "</span>"
    } else {
      content = "<span>" + content + "</span>";
    }
    return content;
  };

  // generates the URI for the web and desktop client versions of normal notes, linked notes, and biz notes
  GlobalUtils.getNoteURI = function(client, baseUrl, message, action, userId) {
    var uri;
    if (client == "WEB") {
      if (message.shareKey) { // shared notebook
        uri = baseUrl + "/shard/" + message.shardId + "/share/view/" + message.shareKey + "/#n=" + message.noteGuid;
      }
      else if (message.inBusinessNotebook) {
        uri = baseUrl + "/shard/" + message.shardId + "/business/dispatch/" + action + "/" + message.noteGuid + "#st=b"
          + "&n=" + message.noteGuid;
        if (message.notebookGuid) {
          uri += "&b=" + message.notebookGuid;
        }
      }
      else {
        uri = baseUrl + "/" + action + "/" + message.noteGuid + "#st=p";
      }
    }
    else if (client == "DESKTOP") {
      uri = "evernote:///view/" + userId + "/" + message.shardId + "/" + message.noteGuid + "/" + message.noteGuid + "/";
      if (message.linkedNotebookGuid) { // shared notebook
        uri += message.linkedNotebookGuid + "/";
      }
      else if (message.inBusinessNotebook && message.notebookGuid) { // biz notebook
        if (message.linkedNotebookGuid) {
          uri += message.linkedNotebookGuid + "/";
        }
        else if (message.notebookGuid) {
          uri += message.notebookGuid + "/";
        }
      }
      uri += "sync/";
    }
    return uri;
  };

  GlobalUtils.buildGoogleRegEx = function() {
    // http://www.google.com/supported_domains
    var googleCountryDomains = [".com",".ad",".ae",".com.af",".com.ag",".com.ai",".am",".co.ao",".com.ar",".as",".at",
      ".com.au",".az",".ba",".com.bd",".be",".bf",".bg",".com.bh",".bi",".bj",".com.bn",".com.bo",".com.br",".bs",
      ".co.bw",".by",".com.bz",".ca",".cd",".cf",".cg",".ch",".ci",".co.ck",".cl",".cm",".cn",".com.co",".co.cr",
      ".com.cu",".cv",".com.cy",".cz",".de",".dj",".dk",".dm",".com.do",".dz",".com.ec",".ee",".com.eg",".es",".com.et",
      ".fi",".com.fj",".fm",".fr",".ga",".ge",".gg",".com.gh",".com.gi",".gl",".gm",".gp",".gr",".com.gt",".gy",
      ".com.hk",".hn",".hr",".ht",".hu",".co.id",".ie",".co.il",".im",".co.in",".iq",".is",".it",".je",".com.jm",".jo",
      ".co.jp",".co.ke",".com.kh",".ki",".kg",".co.kr",".com.kw",".kz",".la",".com.lb",".li",".lk",".co.ls",".lt",".lu",
      ".lv",".com.ly",".co.ma",".md",".me",".mg",".mk",".ml",".mn",".ms",".com.mt",".mu",".mv",".mw",".com.mx",".com.my",
      ".co.mz",".com.na",".com.nf",".com.ng",".com.ni",".ne",".nl",".no",".com.np",".nr",".nu",".co.nz",".com.om",
      ".com.pa",".com.pe",".com.ph",".com.pk",".pl",".pn",".com.pr",".ps",".pt",".com.py",".com.qa",".ro",".ru",".rw",
      ".com.sa",".com.sb",".sc",".se",".com.sg",".sh",".si",".sk",".com.sl",".sn",".so",".sm",".st",".com.sv",".td",
      ".tg",".co.th",".com.tj",".tk",".tl",".tm",".tn",".to",".com.tr",".tt",".com.tw",".co.tz",".com.ua",".co.ug",
      ".co.uk",".com.uy",".co.uz",".com.vc",".co.ve",".vg",".co.vi",".com.vn",".vu",".ws",".rs",".co.za",".co.zm",
      ".co.zw",".cat"];
    for (var i = 0; i < googleCountryDomains.length; i++) {
      googleCountryDomains[i] = googleCountryDomains[i].replace(/\./g, "\\.");
    }
    return new RegExp("^https?://www\.google(" + googleCountryDomains.join("|") + ")/", "i");
  };

  GlobalUtils.removePunctuation = function(text) {
    var dashes = ["-", "_", "\u2013", "\u2014", "\u00B7"];
    var brackets = ["\\(", "\\)", "\\[", "\\]", "\\{", "\\}", "\u300A", "\u300B",
      "\uFF08", "\uFF09", "\u3010", "\u3011", "\u300C", "\u300D", "\u00BB"];
    var punc = ["\\.", "!", "\:", "\;", "\"", "\'", ",", "\\?", "\u3002",
      "\u3001", "\uFF01", "\uFF0C", "\uFF1A", "\u2026", "\u201C", "\u201D"];
    var misc = ["@", "#", "\\$", "%", "\\^", "&", "\\*", "\\+", "=", "`", "~",
      "/", "\\\\", "\\|", ">", "<", "\u25CF", ];

    var regex = new RegExp(dashes.join("|") + "|" + brackets.join("|") + "|" + punc.join("|") + "|" + misc.join("|"), "g");
    return text.replace(regex, " ");
  };

  Object.preventExtensions(GlobalUtils);
})();
