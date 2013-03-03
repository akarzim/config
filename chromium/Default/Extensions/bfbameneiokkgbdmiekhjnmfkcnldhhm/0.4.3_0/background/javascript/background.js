(function(){var q=function(){function c(a){return(""+a).replace(/&(?!\w+;)|[<>"']/g,function(a){return k[a]||a})}var e=Object.prototype.toString;Array.isArray=Array.isArray||function(a){return"[object Array]"==e.call(a)};var i=String.prototype.trim,g;if(i)g=function(a){return null==a?"":i.call(a)};else{var h,m;/\S/.test("\u00a0")?(h=/^[\s\xA0]+/,m=/[\s\xA0]+$/):(h=/^\s+/,m=/\s+$/);g=function(a){return null==a?"":a.toString().replace(h,"").replace(m,"")}}var k={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;",
"'":"&#39;"},o={},p=function(){};p.prototype={otag:"{{",ctag:"}}",pragmas:{},buffer:[],pragmas_implemented:{"IMPLICIT-ITERATOR":!0},context:{},render:function(a,d,b,f){if(!f)this.context=d,this.buffer=[];if(this.includes("",a)){var a=this.render_pragmas(a),j=this.render_section(a,d,b);!1===j&&(j=this.render_tags(a,d,b,f));if(f)return j;this.sendLines(j)}else{if(f)return a;this.send(a)}},send:function(a){""!==a&&this.buffer.push(a)},sendLines:function(a){if(a)for(var a=a.split("\n"),d=0;d<a.length;d++)this.send(a[d])},
render_pragmas:function(a){if(!this.includes("%",a))return a;var d=this,b=this.getCachedRegex("render_pragmas",function(a,d){return RegExp(a+"%([\\w-]+) ?([\\w]+=[\\w]+)?"+d,"g")});return a.replace(b,function(a,b,e){if(!d.pragmas_implemented[b])throw{message:"This implementation of mustache doesn't understand the '"+b+"' pragma"};d.pragmas[b]={};e&&(a=e.split("="),d.pragmas[b][a[0]]=a[1]);return""})},render_partial:function(a,d,b){a=g(a);if(!b||void 0===b[a])throw{message:"unknown_partial '"+a+"'"};
return!d||"object"!=typeof d[a]?this.render(b[a],d,b,!0):this.render(b[a],d[a],b,!0)},render_section:function(a,d,b){if(!this.includes("#",a)&&!this.includes("^",a))return!1;var f=this,j=this.getCachedRegex("render_section",function(a,b){return RegExp("^([\\s\\S]*?)"+a+"(\\^|\\#)\\s*(.+)\\s*"+b+"\n*([\\s\\S]*?)"+a+"\\/\\s*\\3\\s*"+b+"\\s*([\\s\\S]*)$","g")});return a.replace(j,function(a,j,e,c,g,h){var a=j?f.render_tags(j,d,b,!0):"",h=h?f.render(h,d,b,!0):"",n,c=f.find(c,d);"^"===e?n=!c||Array.isArray(c)&&
0===c.length?f.render(g,d,b,!0):"":"#"===e&&(n=Array.isArray(c)?f.map(c,function(a){return f.render(g,f.create_context(a),b,!0)}).join(""):f.is_object(c)?f.render(g,f.create_context(c),b,!0):"function"==typeof c?c.call(d,g,function(a){return f.render(a,d,b,!0)}):c?f.render(g,d,b,!0):"");return a+n+h})},render_tags:function(a,d,b,f){for(var j=this,e=function(){return j.getCachedRegex("render_tags",function(a,b){return RegExp(a+"(=|!|>|&|\\{|%)?([^#\\^]+?)\\1?"+b+"+","g")})},g=e(),h=function(a,f,h){switch(f){case "!":return"";
case "=":return j.set_delimiters(h),g=e(),"";case ">":return j.render_partial(h,d,b);case "{":case "&":return j.find(h,d);default:return c(j.find(h,d))}},a=a.split("\n"),i=0;i<a.length;i++)a[i]=a[i].replace(g,h,this),f||this.send(a[i]);if(f)return a.join("\n")},set_delimiters:function(a){a=a.split(" ");this.otag=this.escape_regex(a[0]);this.ctag=this.escape_regex(a[1])},escape_regex:function(a){if(!arguments.callee.sRE)arguments.callee.sRE=RegExp("(\\/|\\.|\\*|\\+|\\?|\\||\\(|\\)|\\[|\\]|\\{|\\}|\\\\)",
"g");return a.replace(arguments.callee.sRE,"\\$1")},find:function(a,d){function b(a){return!1===a||0===a||a}var a=g(a),f;if(a.match(/([a-z_]+)\./ig)){var c=this.walk_context(a,d);b(c)&&(f=c)}else b(d[a])?f=d[a]:b(this.context[a])&&(f=this.context[a]);return"function"==typeof f?f.apply(d):void 0!==f?f:""},walk_context:function(a,d){for(var b=a.split("."),f=void 0!=d[b[0]]?d:this.context,c=f[b.shift()];void 0!=c&&0<b.length;)f=c,c=c[b.shift()];return"function"==typeof c?c.apply(f):c},includes:function(a,
d){return-1!=d.indexOf(this.otag+a)},create_context:function(a){if(this.is_object(a))return a;var d=".";if(this.pragmas["IMPLICIT-ITERATOR"])d=this.pragmas["IMPLICIT-ITERATOR"].iterator;var b={};b[d]=a;return b},is_object:function(a){return a&&"object"==typeof a},map:function(a,d){if("function"==typeof a.map)return a.map(d);for(var b=[],c=a.length,e=0;e<c;e++)b.push(d(a[e]));return b},getCachedRegex:function(a,d){var b=o[this.otag];b||(b=o[this.otag]={});var c=b[this.ctag];c||(c=b[this.ctag]={});
(b=c[a])||(b=c[a]=d(this.otag,this.ctag));return b}};return{name:"mustache.js",version:"0.4.0",to_html:function(a,c,b,f){var e=new p;if(f)e.send=f;e.render(a,c||{},b);if(!f)return e.buffer.join("\n")}}}();(function(){var c={VERSION:"0.10",templates:{},$:"undefined"!==typeof window?window.jQuery||window.Zepto||null:null,addTemplate:function(e,i){if("object"===typeof e)for(var g in e)this.addTemplate(g,e[g]);else c[e]?console.error("Invalid name: "+e+"."):c.templates[e]?console.error('Template "'+e+
'  " exists'):(c.templates[e]=i,c[e]=function(g,i){var g=g||{},k=q.to_html(c.templates[e],g,c.templates);return c.$&&!i?c.$(k):k})},clearAll:function(){for(var e in c.templates)delete c[e];c.templates={}},refresh:function(){c.clearAll();c.grabTemplates()},grabTemplates:function(){var e,i=document.getElementsByTagName("script"),g,h=[];for(e=0,l=i.length;e<l;e++)if((g=i[e])&&g.innerHTML&&g.id&&("text/html"===g.type||"text/x-icanhaz"===g.type))c.addTemplate(g.id,"".trim?g.innerHTML.trim():g.innerHTML.replace(/^\s+/,
"").replace(/\s+$/,"")),h.unshift(g);for(e=0,l=h.length;e<l;e++)h[e].parentNode.removeChild(h[e])}};"undefined"!==typeof require?module.exports=c:window.ich=c;"undefined"!==typeof document&&(c.$?c.$(function(){c.grabTemplates()}):document.addEventListener("DOMContentLoaded",function(){c.grabTemplates()},!0))})()})();
var WebDeveloper = WebDeveloper || {};

WebDeveloper.Common                = WebDeveloper.Common || {};
WebDeveloper.Common.requestTimeout = 10000;

// Adds a class to an element
WebDeveloper.Common.addClass = function(element, className)
{
  // If the element and class name are set and the element does not already have this class
  if(element && className && !WebDeveloper.Common.hasClass(element, className))
  {
    element.className = (element.className + " " + className).trim();
  }
};

// Adjusts the position of the given element
WebDeveloper.Common.adjustElementPosition = function(element, xPosition, yPosition, offset)
{
  // If the element is set
  if(element)
  {
    var contentWindow = WebDeveloper.Common.getContentWindow();
    var innerHeight   = contentWindow.innerHeight;
    var innerWidth    = contentWindow.innerWidth;
    var offsetHeight  = element.offsetHeight;
    var offsetWidth   = element.offsetWidth;
    var offsetX       = contentWindow.pageXOffset;
    var offsetY       = contentWindow.pageYOffset;

    // If the x position is less than 0
    if(xPosition < 0)
    {
      xPosition = 0;
    }

    // If the y position is less than 0
    if(yPosition < 0)
    {
      yPosition = 0;
    }

    // If the element will fit at the x position
    if((xPosition + offsetWidth + offset + 5) < (innerWidth + offsetX))
    {
      element.style.left = xPosition + offset + "px";
    }
    else
    {
      element.style.left = (innerWidth + offsetX - offsetWidth - offset) + "px";
    }

    // If the element will fit at the y position
    if((yPosition + offsetHeight + offset + 5) < (innerHeight + offsetY))
    {
      element.style.top = yPosition + offset + "px";
    }
    else
    {
      element.style.top = (innerHeight + offsetY - offsetHeight - offset) + "px";
    }
  }
};

// Returns true if the array contains the element
WebDeveloper.Common.contains = function(array, element)
{
  // If the array and element are set
  if(array && element)
  {
    try
    {
      // If the element does not exist in the array
      if(array.indexOf(element) == -1)
      {
        return false;
      }
      else
      {
        return true;
      }
    }
    catch(exception)
    {
      // Loop through the array
      for(var i = 0, l = array.length; i < l; i++)
      {
        // If the element is found
        if(array[i] == element)
        {
          return true;
        }
      }
    }
  }

  return false;
};

// Removes all child elements from an element
WebDeveloper.Common.empty = function(element)
{
  // If the element is set
  if(element)
  {
    var childElements = element.childNodes;

    // Loop through the child elements
    while(childElements.length)
    {
      element.removeChild(childElements[0]);
    }
  }
};

// Returns true if a string ends with another string
WebDeveloper.Common.endsWith = function(string, endsWith)
{
  return new RegExp(endsWith + "$").test(string);
};

// Formats dimensions
WebDeveloper.Common.formatDimensions = function(width, height, locale)
{
  // If the width and height are set
  if(width && height)
  {
    return locale.width + " = " + width + "px " + locale.height + " = " + height + "px";
  }
  else if(width)
  {
    return locale.width + " = " + width + "px";
  }
  else if(height)
  {
    return locale.height + " = " + height + "px";
  }

  return "";
};

// Returns the document body element
WebDeveloper.Common.getDocumentBodyElement = function(contentDocument)
{
  // If there is a body element
  if(contentDocument.body)
  {
    return contentDocument.body;
  }
  else
  {
    var bodyElement = contentDocument.querySelector("body");

    // If there is a body element
    if(bodyElement)
    {
      return bodyElement;
    }
  }

  return contentDocument.documentElement;
};

// Returns the document head element
WebDeveloper.Common.getDocumentHeadElement = function(contentDocument)
{
  var headElement = contentDocument.querySelector("head");

  // If there is a head element
  if(headElement)
  {
    return headElement;
  }

  return contentDocument.documentElement;
};

// Returns all of the images in the document
WebDeveloper.Common.getDocumentImages = function(contentDocument)
{
  var uniqueImages = [];

  // If the content document is set
  if(contentDocument)
  {
    var computedStyle   = null;
    var cssURI          = CSSPrimitiveValue.CSS_URI;
    var image           = null;
    var images          = [];
    var node            = null;
    var styleImage      = null;
    var treeWalker      = contentDocument.createTreeWalker(contentDocument, NodeFilter.SHOW_ELEMENT, null, false);

    // While the tree walker has more nodes
    while((node = treeWalker.nextNode()) !== null)
    {
      // If this is an image element
      if(node.tagName.toLowerCase() == "img")
      {
        images.push(node);
      }
      else if(node.tagName.toLowerCase() == "input" && node.src && node.type && node.type.toLowerCase() == "image")
      {
        image     = new Image();
        image.src = node.src;

        // If this is not a chrome image
        if(image.src.indexOf("chrome://") !== 0)
        {
          images.push(image);
        }
      }
      else if(node.tagName.toLowerCase() == "link" && node.href && node.href.indexOf("chrome://") !== 0 && node.rel && node.rel.indexOf("icon") != -1)
      {
        image     = new Image();
        image.src = node.href;

        images.push(image);
      }
      else
      {
        computedStyle = node.ownerDocument.defaultView.getComputedStyle(node, null);

        // If the computed style is set
        if(computedStyle)
        {
          styleImage = WebDeveloper.Common.getCSSProperty(computedStyle.getPropertyCSSValue("background-image"));

          // If this element has a background image and it is a URI
          if(styleImage && styleImage.primitiveType == cssURI)
          {
            image     = new Image();
            image.src = styleImage.getStringValue();

            // If this is not a chrome image
            if(image.src.indexOf("chrome://") !== 0)
            {
              images.push(image);
            }
          }

          styleImage = computedStyle.getPropertyCSSValue("list-style-image");

          // If this element has a background image and it is a URI
          if(styleImage && styleImage.primitiveType == cssURI)
          {
            image     = new Image();
            image.src = styleImage.getStringValue();

            // If this is not a chrome image
            if(image.src.indexOf("chrome://") !== 0)
            {
              images.push(image);
            }
          }
        }
      }
    }

    images.sort(WebDeveloper.Common.sortImages);

    // Loop through the images
    for(var i = 0, l = images.length; i < l; i++)
    {
      image = images[i];

      // If this is not the last image and the image is the same as the next image
      if(i + 1 < l && image.src == images[i + 1].src)
      {
        continue;
      }

      uniqueImages.push(image);
    }
  }

  return uniqueImages;
};

// Get the position of an element
WebDeveloper.Common.getElementPosition = function(element, xPosition)
{
  var position = 0;

  // If the element is set
  if(element)
  {
    var elementOffsetParent = element.offsetParent;

    // If the element has an offset parent
    if(elementOffsetParent)
    {
      // While there is an offset parent
      while((elementOffsetParent = element.offsetParent) !== null)
      {
        // If getting the x position
        if(xPosition)
        {
          position += element.offsetLeft;
        }
        else
        {
          position += element.offsetTop;
        }

        element = elementOffsetParent;
      }
    }
    else
    {
      // If getting the x position
      if(xPosition)
      {
        position = element.offsetLeft;
      }
      else
      {
        position = element.offsetTop;
      }
    }
  }

  return position;
};

// Get the x position of an element
WebDeveloper.Common.getElementPositionX = function(element)
{
  return WebDeveloper.Common.getElementPosition(element, true);
};

// Get the y position of an element
WebDeveloper.Common.getElementPositionY = function(element)
{
  return WebDeveloper.Common.getElementPosition(element, false);
};

// Returns the text from an element
WebDeveloper.Common.getElementText = function(element)
{
  var elementText = "";

  // If the element is set
  if(element)
  {
    var childNode     = null;
    var childNodes    = element.childNodes;
    var childNodeType = null;

    // Loop through the child nodes
    for(var i = 0, l = childNodes.length; i < l; i++)
    {
      childNode   = childNodes[i];
      childNodeType = childNode.nodeType;

      // If the child node type is an element
      if(childNodeType == Node.ELEMENT_NODE)
      {
        elementText += WebDeveloper.Common.getElementText(childNode);
      }
      else if(childNodeType == Node.TEXT_NODE)
      {
        elementText += childNode.nodeValue + " ";
      }
    }
  }

  return elementText;
};

// Returns the contents of the given URLs
WebDeveloper.Common.getURLContents = function(urlContentRequests, errorMessage, callback)
{
  var urlContentRequestsRemaining = urlContentRequests.length;
  var configuration               = { "callback": callback, "urlContentRequestsRemaining": urlContentRequestsRemaining };

  // Loop through the URL content requests
  for(var i = 0, l = urlContentRequests.length; i < l; i++)
  {
    WebDeveloper.Common.getURLContent(urlContentRequests[i], errorMessage, configuration);
  }
};

// Returns true if an element has the specified class
WebDeveloper.Common.hasClass = function(element, className)
{
  // If the element and class name are set
  if(element && className)
  {
    var classes = element.className.split(" ");

    // Loop through the classes
    for(var i = 0, l = classes.length; i < l; i++)
    {
      // If the classes match
      if(className == classes[i])
      {
        return true;
      }
    }
  }

  return false;
};

// Returns true if the item is in the array
WebDeveloper.Common.inArray = function(item, array)
{
  return WebDeveloper.Common.positionInArray(item, array) != -1;
};

// Includes JavaScript in a document
WebDeveloper.Common.includeJavaScript = function(url, contentDocument, callback)
{
  var scriptElement = contentDocument.createElement("script");

  // If a callback is set
  if(callback)
  {
    var load = (function(callbackFunction)
    {
      var handler = function()
      {
        callbackFunction();

        scriptElement.removeEventListener("load", handler, true);
      };

      return handler;
    })(callback);

    scriptElement.addEventListener("load", load, true);
  }

  scriptElement.setAttribute("src", WebDeveloper.Common.getChromeURL(url));
  WebDeveloper.Common.getDocumentBodyElement(contentDocument).appendChild(scriptElement);
};

// Inserts the given child after the element
WebDeveloper.Common.insertAfter = function(child, after)
{
  // If the child and after are set
  if(child && after)
  {
    var nextSibling = after.nextSibling;
    var parent      = after.parentNode;

    // If the element has a next sibling
    if(nextSibling)
    {
      parent.insertBefore(child, nextSibling);
    }
    else
    {
      parent.appendChild(child);
    }
  }
};

// Inserts the given element as the first child of the element
WebDeveloper.Common.insertAsFirstChild = function(element, child)
{
  // If the element and child are set
  if(element && child)
  {
    // If the element has child nodes
    if(element.hasChildNodes())
    {
      element.insertBefore(child, element.firstChild);
    }
    else
    {
      element.appendChild(child);
    }
  }
};

// Returns true if the ancestor element is an ancestor of the element
WebDeveloper.Common.isAncestor = function(element, ancestorElement)
{
  // If the element and ancestor element are set
  if(element && ancestorElement)
  {
    var parentElement = null;

    // Loop through the parent elements
    while((parentElement = element.parentNode) !== null)
    {
      // If the parent element is the ancestor element
      if(parentElement == ancestorElement)
      {
        return true;
      }
      else
      {
        element = parentElement;
      }
    }
  }

  return false;
};

// Returns the position if the item is in the array or -1 if it is not
WebDeveloper.Common.positionInArray = function(item, array)
{
  // If the array is set
  if(array)
  {
    // Loop through the array
    for(var i = 0, l = array.length; i < l; i++)
    {
      // If the item is in the array
      if(array[i] == item)
      {
        return i;
      }
    }
  }

  return -1;
};

// Removes a class from an element
WebDeveloper.Common.removeClass = function(element, className)
{
  // If the element and class name are set
  if(element && className)
  {
    var classes = element.className.split(" ");

    // Loop through the classes
    for(var i = 0, l = classes.length; i < l; i++)
    {
      // If the classes match
      if(className == classes[i])
      {
        classes.splice(i, 1);

        element.className = classes.join(" ").trim();

        break;
      }
    }
  }
};

// Removes all matching elements from a document
WebDeveloper.Common.removeMatchingElements = function(selector, contentDocument)
{
  var matchingElement  = null;
  var matchingElements = contentDocument.querySelectorAll(selector);

  // Loop through the matching elements
  for(var i = 0, l = matchingElements.length; i < l; i++)
  {
    matchingElement = matchingElements[i];

    // If the matching element has a parent node
    if(matchingElement.parentNode)
    {
      matchingElement.parentNode.removeChild(matchingElement);
    }
  }
};

// Removes the reload parameter from a URL
WebDeveloper.Common.removeReloadParameterFromURL = function(url)
{
  // If the URL is set
  if(url)
  {
    return url.replace(/(&|\?)web-developer-reload=\d+/, "");
  }

  return null;
};

// Removes a substring from a string
WebDeveloper.Common.removeSubstring = function(string, substring)
{
  // If the string and substring are not empty
  if(string && substring)
  {
    var substringStart = string.indexOf(substring);

    // If the substring is found in the string
    if(substring && substringStart != -1)
    {
      return string.substring(0, substringStart) + string.substring(substringStart + substring.length, string.length);
    }

    return string;
  }

  return "";
};

// Sorts two images
WebDeveloper.Common.sortImages = function(imageOne, imageTwo)
{
  // If both images are set
  if(imageOne && imageTwo)
  {
    var imageOneSrc = imageOne.src;
    var imageTwoSrc = imageTwo.src;

    // If the images are equal
    if(imageOneSrc == imageTwoSrc)
    {
      return 0;
    }
    else if(imageOneSrc < imageTwoSrc)
    {
      return -1;
    }
  }

  return 1;
};

// Toggles a class on an element
WebDeveloper.Common.toggleClass = function(element, className, value)
{
  // If the value is set
  if(value)
  {
    WebDeveloper.Common.addClass(element, className);
  }
  else
  {
    WebDeveloper.Common.removeClass(element, className);
  }
};

// Toggles a style sheet in a document
WebDeveloper.Common.toggleStyleSheet = function(url, id, contentDocument, insertFirst)
{
  var styleSheet = contentDocument.getElementById(id);

  // If the style sheet is already in the document
  if(styleSheet)
  {
    WebDeveloper.Common.removeMatchingElements("#" + id, contentDocument);
  }
  else
  {
    var headElement = WebDeveloper.Common.getDocumentHeadElement(contentDocument);
    var firstChild  = headElement.firstChild;
    var linkElement = contentDocument.createElement("link");

    linkElement.setAttribute("href", WebDeveloper.Common.getChromeURL(url));
    linkElement.setAttribute("id", id);
    linkElement.setAttribute("rel", "stylesheet");

    // If there is a first child
    if(insertFirst && firstChild)
    {
      headElement.insertBefore(linkElement, firstChild);
    }
    else
    {
      headElement.appendChild(linkElement);
    }
  }
};

// Handles the completion of a URL content request
WebDeveloper.Common.urlContentRequestComplete = function(content, urlContentRequest, configuration)
{
  urlContentRequest.content = content;

  configuration.urlContentRequestsRemaining--;

  // If there are no URL content requests remaining
  if(configuration.urlContentRequestsRemaining === 0)
  {
    configuration.callback();
  }
};
var WebDeveloper = WebDeveloper || {};

WebDeveloper.Common = WebDeveloper.Common || {};

// Adjusts the position of the given element
WebDeveloper.Common.appendHTML = function(html, element, contentDocument)
{
  // If the HTML, element and content document are set
  if(html && element && contentDocument)
  {
    var htmlElement = contentDocument.createElement("div");

    htmlElement.innerHTML = html;

    // While there children of the HTML element
    while(htmlElement.firstChild)
    {
      element.appendChild(htmlElement.firstChild);
    }
  }
};

// Returns a chrome URL
WebDeveloper.Common.getChromeURL = function(url)
{
  return chrome.extension.getURL(url);
};

// Returns the current content document
WebDeveloper.Common.getContentDocument = function()
{
  return document;
};

// Returns the current content window
WebDeveloper.Common.getContentWindow = function()
{
  return window;
};

// Returns a CSS property
WebDeveloper.Common.getCSSProperty = function(property)
{
  return property;
};

// Gets the content from a URL
WebDeveloper.Common.getURLContent = function(urlContentRequest, errorMessage, configuration)
{
  var url = urlContentRequest.url;

  // If the URL is not entirely generated
  if(url.indexOf("wyciwyg://") !== 0)
  {
    // Try to download the file
    try
    {
      var request = new XMLHttpRequest();

      request.timeout = WebDeveloper.Common.requestTimeout;

      request.onreadystatechange = function()
      {
        // If the request completed
        if(request.readyState == 4)
        {
          WebDeveloper.Common.urlContentRequestComplete(request.responseText, urlContentRequest, configuration);
        }
      };

      request.ontimeout = function()
      {
        WebDeveloper.Common.urlContentRequestComplete(errorMessage, urlContentRequest, configuration);
      };

      request.open("get", url);
      request.send(null);
    }
    catch(exception)
    {
      WebDeveloper.Common.urlContentRequestComplete(errorMessage, urlContentRequest, configuration);
    }
  }
};
var WebDeveloper = WebDeveloper || {};

WebDeveloper.Locales = WebDeveloper.Locales || {};

// Returns a formatted string from the locale
WebDeveloper.Locales.getFormattedString = function(name, parameters)
{
  return chrome.i18n.getMessage(name, parameters);
};

// Returns a string from the locale
WebDeveloper.Locales.getString = function(name)
{
  return chrome.i18n.getMessage(name);
};
var WebDeveloper = WebDeveloper || {};

WebDeveloper.Storage = WebDeveloper.Storage || {};

// Clears the features on a tab
WebDeveloper.Storage.clearTabFeatures = function(featureTabId)
{
  window.localStorage.removeItem(featureTabId);

  WebDeveloper.Storage.updateBadgeText(featureTabId);
};

// Returns the list of features on a tab
WebDeveloper.Storage.getFeaturesOnTab = function(tabId)
{
  var featuresOnTab = window.localStorage.getItem(tabId);

  // If there are features on the tab
  if(featuresOnTab)
  {
    return featuresOnTab.split(",");
  }

  return null;
};

// Returns an item
WebDeveloper.Storage.getItem = function(item)
{
  return window.localStorage.getItem(item);
};

// Returns true if a feature is on a tab
WebDeveloper.Storage.isFeatureOnTab = function(feature, tab)
{
  var tabId         = tab.id;
  var featuresOnTab = window.localStorage.getItem(tabId);

  // If there are features on the tab
  if(featuresOnTab)
  {
    var featuresOnTabArray = featuresOnTab.split(",");

    // Loop through the features on the tab
    for(var i = 0, l = featuresOnTabArray.length; i < l; i++)
    {
      // If the feature is on the tab
      if(featuresOnTabArray[i] == feature)
      {
        return true;
      }
    }
  }

  return false;
};

// Removes an item
WebDeveloper.Storage.removeItem = function(item)
{
  window.localStorage.removeItem(item);
};

// Sets an item
WebDeveloper.Storage.setItem = function(item, value)
{
  window.localStorage.setItem(item, value);
};

// Sets an item if it is not already set
WebDeveloper.Storage.setItemIfNotSet = function(item, value)
{
  // If the item is not already set
  if(!WebDeveloper.Storage.getItem(item))
  {
    window.localStorage.setItem(item, value);
  }
};

// Handles a tab selection changing
WebDeveloper.Storage.tabSelectionChanged = function(tabId)
{
  WebDeveloper.Storage.updateBadgeText(tabId);
};

// Handles a tab updating
WebDeveloper.Storage.tabUpdated = function(tabId, properties)
{
  // If there are no properties or the status is loading
  if(!properties || properties.status == "loading")
  {
    WebDeveloper.Storage.clearTabFeatures(tabId);
  }
};

// Toggles a feature on a tab
WebDeveloper.Storage.toggleFeatureOnTab = function(feature, tab)
{
  var featureTabId         = tab.id;
  var currentFeaturesOnTab = window.localStorage.getItem(featureTabId);
  var newFeaturesOnTab     = null;

  // If there are features on the tab
  if(currentFeaturesOnTab)
  {
    var featureOnTab = false;

    newFeaturesOnTab = currentFeaturesOnTab.split(",");

    // Loop through the features on the tab
    for(var i = 0, l = newFeaturesOnTab.length; i < l; i++)
    {
      // If the feature is on the tab
      if(newFeaturesOnTab[i] == feature)
      {
        featureOnTab = true;

        newFeaturesOnTab.splice(i, 1);
      }
    }

    // If the feature is on the tab
    if(featureOnTab)
    {
      newFeaturesOnTab = newFeaturesOnTab.join(",");
    }
    else
    {
      newFeaturesOnTab = currentFeaturesOnTab + feature + ",";
    }
  }
  else
  {
    newFeaturesOnTab = feature + ",";
  }

  window.localStorage.setItem(featureTabId, newFeaturesOnTab);

  WebDeveloper.Storage.updateBadgeText(featureTabId);
};

// Updates the badge text for a tab
WebDeveloper.Storage.updateBadgeText = function(featureTabId)
{
  var badgeText     = "";
  var badgeTooltip  = "Web Developer";
  var featuresOnTab = WebDeveloper.Storage.getFeaturesOnTab(featureTabId);

  // If there are features on the tab
  if(featuresOnTab)
  {
    var featureCount       = featuresOnTab.length - 1;
    var featureDescription = "features";

    // If there is only one feature count
    if(featureCount == 1)
    {
      featureDescription = "feature";
    }

    badgeText     = featureCount.toString();
    badgeTooltip += "\n" + badgeText + " active " + featureDescription + " on this tab";
  }

  chrome.browserAction.setBadgeText({ "text": badgeText, "tabId": featureTabId });
  chrome.browserAction.setTitle({ "title": badgeTooltip, "tabId": featureTabId });
};

// Updates the extension icon
WebDeveloper.Storage.updateIcon = function()
{
  var icon = { "path": { "19": "/overlay/images/icon.png", "38": "/overlay/images/icon-2x.png" } };

  // If the icon should be in color
  if(WebDeveloper.Storage.getItem("icon_color") == "true")
  {
    icon = { "path": { "19": "/overlay/images/icon-color.png", "38": "/overlay/images/icon-color-2x.png" } };
  }

  chrome.browserAction.setIcon(icon);
};

WebDeveloper.Storage.updateIcon();

chrome.tabs.onRemoved.addListener(WebDeveloper.Storage.tabUpdated);
chrome.tabs.onSelectionChanged.addListener(WebDeveloper.Storage.tabSelectionChanged);
chrome.tabs.onUpdated.addListener(WebDeveloper.Storage.tabUpdated);

chrome.browserAction.setBadgeBackgroundColor({ "color": [0, 200, 0, 255] });
var WebDeveloper = WebDeveloper || {};

WebDeveloper.Upgrade = WebDeveloper.Upgrade || {};

// Formats the version as a number
WebDeveloper.Upgrade.formatVersionNumber = function(versionString)
{
  var betaVersion       = versionString.indexOf("b");
  var firstDecimalPlace = versionString.indexOf(".");
  var versionNumber     = versionString.substring(0, firstDecimalPlace) + ".";

  // If this is not a beta version
  if(betaVersion == -1)
  {
    versionNumber += versionString.substring(firstDecimalPlace + 1);
  }
  else
  {
    versionNumber += versionString.substring(firstDecimalPlace + 1, betaVersion);
  }

  return parseFloat(versionNumber, 10) + "";
};
var WebDeveloper = WebDeveloper || {};

WebDeveloper.Upgrade = WebDeveloper.Upgrade || {};

// Opens the upgrade URL
WebDeveloper.Upgrade.openUpgradeURL = function(version)
{
  chrome.tabs.create({ "url": "http://chrispederick.com/work/web-developer/chrome/installed/" + version.replace(".", "") + "/" });
};

// Sets up the default options
WebDeveloper.Upgrade.setupDefaultOptions = function()
{
  // Advanced
  WebDeveloper.Storage.setItemIfNotSet("populate_email_address", "example@example.com");

  // Colors
  WebDeveloper.Storage.setItemIfNotSet("syntax_highlight_theme", "none");

  // Resize
  WebDeveloper.Storage.setItemIfNotSet("resize_1_description", WebDeveloper.Locales.getString("resize_1_description"));
  WebDeveloper.Storage.setItemIfNotSet("resize_1_height", 768);
  WebDeveloper.Storage.setItemIfNotSet("resize_1_width", 1024);
  WebDeveloper.Storage.setItemIfNotSet("resize_count", 1);

  // Responsive layouts
  WebDeveloper.Storage.setItemIfNotSet("responsive_layout_1_description", WebDeveloper.Locales.getString("responsive_layout_1_description"));
  WebDeveloper.Storage.setItemIfNotSet("responsive_layout_1_height", 480);
  WebDeveloper.Storage.setItemIfNotSet("responsive_layout_1_width", 320);
  WebDeveloper.Storage.setItemIfNotSet("responsive_layout_2_description", WebDeveloper.Locales.getString("responsive_layout_2_description"));
  WebDeveloper.Storage.setItemIfNotSet("responsive_layout_2_height", 320);
  WebDeveloper.Storage.setItemIfNotSet("responsive_layout_2_width", 480);
  WebDeveloper.Storage.setItemIfNotSet("responsive_layout_3_description", WebDeveloper.Locales.getString("responsive_layout_3_description"));
  WebDeveloper.Storage.setItemIfNotSet("responsive_layout_3_height", 800);
  WebDeveloper.Storage.setItemIfNotSet("responsive_layout_3_width", 600);
  WebDeveloper.Storage.setItemIfNotSet("responsive_layout_4_description", WebDeveloper.Locales.getString("responsive_layout_4_description"));
  WebDeveloper.Storage.setItemIfNotSet("responsive_layout_4_height", 600);
  WebDeveloper.Storage.setItemIfNotSet("responsive_layout_4_width", 800);
  WebDeveloper.Storage.setItemIfNotSet("responsive_layout_5_description", WebDeveloper.Locales.getString("responsive_layout_5_description"));
  WebDeveloper.Storage.setItemIfNotSet("responsive_layout_5_height", 1024);
  WebDeveloper.Storage.setItemIfNotSet("responsive_layout_5_width", 768);
  WebDeveloper.Storage.setItemIfNotSet("responsive_layout_6_description", WebDeveloper.Locales.getString("responsive_layout_6_description"));
  WebDeveloper.Storage.setItemIfNotSet("responsive_layout_6_height", 768);
  WebDeveloper.Storage.setItemIfNotSet("responsive_layout_6_width", 1024);
  WebDeveloper.Storage.setItemIfNotSet("responsive_layout_count", 6);

  // Tools
  WebDeveloper.Storage.setItemIfNotSet("tool_1_description", WebDeveloper.Locales.getString("tool_1_description"));
  WebDeveloper.Storage.setItemIfNotSet("tool_1_url", "http://jigsaw.w3.org/css-validator/validator?profile=css21&warning=0&uri=");
  WebDeveloper.Storage.setItemIfNotSet("tool_2_description", WebDeveloper.Locales.getString("tool_2_description"));
  WebDeveloper.Storage.setItemIfNotSet("tool_2_url", "http://validator.w3.org/feed/check.cgi?url=");
  WebDeveloper.Storage.setItemIfNotSet("tool_3_description", WebDeveloper.Locales.getString("tool_3_description"));
  WebDeveloper.Storage.setItemIfNotSet("tool_3_url", "http://validator.w3.org/check?verbose=1&uri=");
  WebDeveloper.Storage.setItemIfNotSet("tool_4_description", WebDeveloper.Locales.getString("tool_4_description"));
  WebDeveloper.Storage.setItemIfNotSet("tool_4_url", "http://validator.w3.org/checklink?check=Check&hide_type=all&summary=on&uri=");
  WebDeveloper.Storage.setItemIfNotSet("tool_5_description", WebDeveloper.Locales.getString("tool_5_description"));
  WebDeveloper.Storage.setItemIfNotSet("tool_5_url", "http://www.cynthiasays.com/mynewtester/cynthia.exe?rptmode=-1&url1=");
  WebDeveloper.Storage.setItemIfNotSet("tool_6_description", WebDeveloper.Locales.getString("tool_6_description"));
  WebDeveloper.Storage.setItemIfNotSet("tool_6_url", "http://www.cynthiasays.com/mynewtester/cynthia.exe?rptmode=2&url1=");
  WebDeveloper.Storage.setItemIfNotSet("tool_count", 6);
};

// Upgrades the extension
WebDeveloper.Upgrade.upgrade = function()
{
  var previousVersion = WebDeveloper.Storage.getItem("version");
  var version         = WebDeveloper.Upgrade.formatVersionNumber("0.4.3");

  WebDeveloper.Upgrade.setupDefaultOptions();

  // If the versions do not match
  if(previousVersion != version)
  {
    WebDeveloper.Storage.setItem("version", version);
    WebDeveloper.Upgrade.openUpgradeURL(version);
  }
};

WebDeveloper.Upgrade.upgrade();
var WebDeveloper = WebDeveloper || {};

WebDeveloper.Background = WebDeveloper.Background || {};

// Converts an RGB color into a hex color
WebDeveloper.Background.convertRGBToHex = function(rgb)
{
  var blue  = parseInt(rgb[2], 10).toString(16).toLowerCase();
  var green = parseInt(rgb[1], 10).toString(16).toLowerCase();
  var red   = parseInt(rgb[0], 10).toString(16).toLowerCase();

  // If the color is only 1 character
  if(blue.length == 1)
  {
    blue = "0" + blue;
  }

  // If the color is only 1 character
  if(green.length == 1)
  {
    green = "0" + green;
  }

  // If the color is only 1 character
  if(red.length == 1)
  {
    red = "0" + red;
  }

  return "#" + red + green + blue;
};

// Gets the current color
WebDeveloper.Background.getColor = function(x, y, eventType)
{
  chrome.tabs.captureVisibleTab(null, function(dataUrl)
  {
    var image = new Image();

    image.src = dataUrl;

    image.onload = function()
    {
      var canvas  = document.createElement("canvas");
      var color   = null;
      var context = canvas.getContext("2d");

      canvas.height = image.naturalHeight;
      canvas.width  = image.naturalWidth;

      context.clearRect(0, 0, image.naturalWidth, image.naturalHeight);
      context.drawImage(image, 0, 0);

      color = WebDeveloper.Background.convertRGBToHex(context.getImageData(x, y, 1, 1).data);

      chrome.tabs.executeScript(null, { "code": "WebDeveloper.ColorPicker.setColor('" + color + "', '" + eventType + "')" });
    };
  });

  return {};
};

// Returns the edit CSS dashboard HTML template
WebDeveloper.Background.getEditCSSDashboardTemplates = function(parameters)
{
  return { "dashboard": ich.dashboard(parameters, true), "editCSS": ich.editCSSPanel(parameters, true), "panel": ich.dashboardPanel(parameters, true), "tab": ich.dashboardTab(parameters, true) };
};

// Returns the edit CSS tab HTML template
WebDeveloper.Background.getEditCSSTabTemplates = function(parameters)
{
  return { "panel": ich.editCSSTabPanel(parameters, true), "tab": ich.editCSSTab(parameters, true) };
};

// Returns the element information dashboard HTML template
WebDeveloper.Background.getElementInformationDashboardTemplates = function(parameters)
{
  return { "dashboard": ich.dashboard(parameters, true), "elementInformation": ich.elementInformationPanel(parameters, true), "panel": ich.dashboardPanel(parameters, true), "tab": ich.dashboardTab(parameters, true) };
};

// Gets the styles from CSS
WebDeveloper.Background.getStylesFromCSS = function(cssDocuments)
{
  var contentDocument = null;
  var cssContent      = null;
  var styles          = "";
  var documents       = cssDocuments.documents;
  var styleSheets     = [];

  // Loop through the documents
  for(var i = 0, l = documents.length; i < l; i++)
  {
    contentDocument = documents[i];
    styleSheets     = styleSheets.concat(contentDocument.styleSheets);

    // If there are embedded styles
    if(contentDocument.embedded)
    {
      styles += contentDocument.embedded;
    }
  }

  cssContent = WebDeveloper.Background.getURLContents(styleSheets, "");

  // Loop through the CSS content
  for(i = 0, l = cssContent.length; i < l; i++)
  {
    styles += cssContent[i].content;
  }

  return { "css": styles };
};

// Gets the content from a URL
WebDeveloper.Background.getURLContent = function(url, errorMessage)
{
  var content = null;

  // Try to get the content
  try
  {
    var request = new XMLHttpRequest();

    request.timeout = WebDeveloper.Common.requestTimeout;

    request.ontimeout = function()
    {
      content = errorMessage;
    };

    request.open("get", url, false);
    request.send(null);

    content = request.responseText;
  }
  catch(exception)
  {
    content = errorMessage;
  }

  return content;
};

// Gets the content from a set of URLs
WebDeveloper.Background.getURLContents = function(urls, errorMessage)
{
  var url         = null;
  var urlContents = [];

  // Loop through the urls
  for(var i = 0, l = urls.length; i < l; i++)
  {
    url = urls[i];

    urlContents.push({ "content": WebDeveloper.Background.getURLContent(url, errorMessage), "url": url });
  }

  return urlContents;
};

// Initializes a generated tab
WebDeveloper.Background.initializeGeneratedTab = function(url, data, locale)
{
  var extensionTab = null;
  var tabs         = chrome.extension.getViews({ "type": "tab" });

  // Loop through the tabs
  for(var i = 0, l = tabs.length; i < l; i++)
  {
    extensionTab = tabs[i];

    // If the tab has a matching URL and has not been initialized
    if(extensionTab.location.href == url && !extensionTab.WebDeveloper.Generated.initialized)
    {
      extensionTab.WebDeveloper.Generated.initialized = true;

      extensionTab.WebDeveloper.Generated.initialize(data, locale);
    }
  }
};

// Initializes a validation tab
WebDeveloper.Background.initializeValidationTab = function(url, data)
{
  var extensionTab = null;
  var tabs         = chrome.extension.getViews({ "type": "tab" });

  // Loop through the tabs
  for(var i = 0, l = tabs.length; i < l; i++)
  {
    extensionTab = tabs[i];

    // If the tab has a matching URL and has not been initialized
    if(extensionTab.location.href == url && !extensionTab.WebDeveloper.Validation.initialized)
    {
      extensionTab.WebDeveloper.Validation.initialized = true;

      extensionTab.WebDeveloper.Validation.initialize(data);
    }
  }
};

// Handles any background messages
WebDeveloper.Background.message = function(message, sender, sendResponse)
{
  // If the message type is to get the current color
  if(message.type == "get-color")
  {
    sendResponse(WebDeveloper.Background.getColor(message.x, message.y, message.eventType));
  }
  else if(message.type == "get-edit-css-dashboard-templates")
  {
    sendResponse(WebDeveloper.Background.getEditCSSDashboardTemplates({ "dashboardTitle": message.dashboardTitle, "tabId": message.tabId, "title": message.title }));
  }
  else if(message.type == "get-edit-css-tab-templates")
  {
    sendResponse(WebDeveloper.Background.getEditCSSTabTemplates({ "active": message.active, "css": message.css, "position": message.position, "title": message.title }));
  }
  else if(message.type == "get-element-information-dashboard-templates")
  {
    sendResponse(WebDeveloper.Background.getElementInformationDashboardTemplates({ "dashboardTitle": message.dashboardTitle, "selectAnElementDisplayInformation": message.selectAnElementDisplayInformation, "tabId": message.tabId, "title": message.title }));
  }
  else if(message.type == "get-storage-item")
  {
    sendResponse({ "value": WebDeveloper.Storage.getItem(message.item) });
  }
  else if(message.type == "get-url-contents")
  {
    sendResponse(WebDeveloper.Background.getURLContents(message.urls, message.errorMessage));
  }
  else if(message.type == "set-storage-item")
  {
    WebDeveloper.Storage.setItem(message.item, message.value);

    // No response required
    sendResponse({});
  }
  else
  {
    // Unknown message
    sendResponse({});
  }
};

// Opens a generated tab
WebDeveloper.Background.openGeneratedTab = function(tabURL, tabIndex, data, locale)
{
  chrome.tabs.create({ "index": tabIndex + 1, "url": tabURL }, function(openedTab)
  {
    var tabLoaded = function(tabId, tabInformation)
    {
      // If this is the opened tab and it finished loading
      if(tabId == openedTab.id && tabInformation.status == "complete")
      {
        WebDeveloper.Background.initializeGeneratedTab(tabURL, data, locale);

        chrome.tabs.onUpdated.removeListener(tabLoaded);
      }
    };

    chrome.tabs.onUpdated.addListener(tabLoaded);
  });
};

// Validates the CSS of the local page
WebDeveloper.Background.validateLocalCSS = function(tabURL, tabIndex, css)
{
  chrome.tabs.create({ "index": tabIndex + 1, "url": tabURL }, function(openedTab)
  {
    var tabLoaded = function(tabId, tabInformation)
    {
      // If this is the opened tab and it finished loading
      if(tabId == openedTab.id && tabInformation.status == "complete")
      {
        WebDeveloper.Background.initializeValidationTab(tabURL, WebDeveloper.Background.getStylesFromCSS(css));

        chrome.tabs.onUpdated.removeListener(tabLoaded);
      }
    };

    chrome.tabs.onUpdated.addListener(tabLoaded);
  });
};

// Validates the HTML of the local page
WebDeveloper.Background.validateLocalHTML = function(tabURL, tabIndex, validateURL)
{
  chrome.tabs.create({ "index": tabIndex + 1, "url": tabURL }, function(openedTab)
  {
    var tabLoaded = function(tabId, tabInformation)
    {
      // If this is the opened tab and it finished loading
      if(tabId == openedTab.id && tabInformation.status == "complete")
      {
        WebDeveloper.Background.initializeValidationTab(tabURL, WebDeveloper.Background.getURLContents([validateURL], ""));

        chrome.tabs.onUpdated.removeListener(tabLoaded);
      }
    };

    chrome.tabs.onUpdated.addListener(tabLoaded);
  });
};

chrome.extension.onMessage.addListener(WebDeveloper.Background.message);
