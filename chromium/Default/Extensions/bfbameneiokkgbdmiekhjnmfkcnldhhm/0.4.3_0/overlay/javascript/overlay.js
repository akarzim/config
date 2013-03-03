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
/* ========================================================
 * bootstrap-tab.js v2.2.2
 * http://twitter.github.com/bootstrap/javascript.html#tabs
 * ========================================================
 * Copyright 2012 Twitter, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ======================================================== */


!function ($) {

  "use strict"; // jshint ;_;


 /* TAB CLASS DEFINITION
  * ==================== */

  var Tab = function (element) {
    this.element = $(element)
  }

  Tab.prototype = {

    constructor: Tab

  , show: function () {
      var $this = this.element
        , $ul = $this.closest('ul:not(.dropdown-menu)')
        , selector = $this.attr('data-target')
        , previous
        , $target
        , e

      if (!selector) {
        selector = $this.attr('href')
        selector = selector && selector.replace(/.*(?=#[^\s]*$)/, '') //strip for ie7
      }

      if ( $this.parent('li').hasClass('active') ) return

      previous = $ul.find('.active:last a')[0]

      e = $.Event('show', {
        relatedTarget: previous
      })

      $this.trigger(e)

      if (e.isDefaultPrevented()) return

      $target = $(selector)

      this.activate($this.parent('li'), $ul)
      this.activate($target, $target.parent(), function () {
        $this.trigger({
          type: 'shown'
        , relatedTarget: previous
        })
      })
    }

  , activate: function ( element, container, callback) {
      var $active = container.find('> .active')
        , transition = callback
            && $.support.transition
            && $active.hasClass('fade')

      function next() {
        $active
          .removeClass('active')
          .find('> .dropdown-menu > .active')
          .removeClass('active')

        element.addClass('active')

        if (transition) {
          element[0].offsetWidth // reflow for transition
          element.addClass('in')
        } else {
          element.removeClass('fade')
        }

        if ( element.parent('.dropdown-menu') ) {
          element.closest('li.dropdown').addClass('active')
        }

        callback && callback()
      }

      transition ?
        $active.one($.support.transition.end, next) :
        next()

      $active.removeClass('in')
    }
  }


 /* TAB PLUGIN DEFINITION
  * ===================== */

  var old = $.fn.tab

  $.fn.tab = function ( option ) {
    return this.each(function () {
      var $this = $(this)
        , data = $this.data('tab')
      if (!data) $this.data('tab', (data = new Tab(this)))
      if (typeof option == 'string') data[option]()
    })
  }

  $.fn.tab.Constructor = Tab


 /* TAB NO CONFLICT
  * =============== */

  $.fn.tab.noConflict = function () {
    $.fn.tab = old
    return this
  }


 /* TAB DATA-API
  * ============ */

  $(document).on('click.tab.data-api', '[data-toggle="tab"], [data-toggle="pill"]', function (e) {
    e.preventDefault()
    $(this).tab('show')
  })

}(window.jQuery);/* ===================================================
 * bootstrap-transition.js v2.2.2
 * http://twitter.github.com/bootstrap/javascript.html#transitions
 * ===================================================
 * Copyright 2012 Twitter, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ========================================================== */


!function ($) {

  "use strict"; // jshint ;_;


  /* CSS TRANSITION SUPPORT (http://www.modernizr.com/)
   * ======================================================= */

  $(function () {

    $.support.transition = (function () {

      var transitionEnd = (function () {

        var el = document.createElement('bootstrap')
          , transEndEventNames = {
               'WebkitTransition' : 'webkitTransitionEnd'
            ,  'MozTransition'    : 'transitionend'
            ,  'OTransition'      : 'oTransitionEnd otransitionend'
            ,  'transition'       : 'transitionend'
            }
          , name

        for (name in transEndEventNames){
          if (el.style[name] !== undefined) {
            return transEndEventNames[name]
          }
        }

      }())

      return transitionEnd && {
        end: transitionEnd
      }

    })()

  })

}(window.jQuery);var WebDeveloper = WebDeveloper || {};

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

WebDeveloper.Cookies = WebDeveloper.Cookies || {};

// Deletes all the cookies for the current domain
WebDeveloper.Cookies.deleteDomainCookies = function(cookies)
{
  var cookiesLength = cookies.length;

  // If no domain cookies were found
  if(cookiesLength === 0)
  {
    WebDeveloper.Common.displayNotification("deleteDomainCookiesNoneFound");
  }
  else
  {
    var message = null;

    // If one domain cookie was found
    if(cookiesLength == 1)
    {
      message = WebDeveloper.Locales.getString("deleteDomainCookiesSingleConfirmation");
    }
    else
    {
      message = WebDeveloper.Locales.getFormattedString("deleteDomainCookiesMultipleConfirmation", [cookiesLength]);
    }

    // If the deletion is confirmed
    WebDeveloper.Overlay.displayConfirmation(WebDeveloper.Locales.getString("deleteDomainCookies"), message, WebDeveloper.Locales.getString("delete"), "trash", function()
    {
      WebDeveloper.Overlay.closeConfirmation();

      // Loop through the domain cookies
      for(var i = 0 ; i < cookiesLength; i++)
      {
        WebDeveloper.Cookies.deleteCookie(cookies[i]);
      }

      // If one domain cookie was deleted
      if(cookiesLength == 1)
      {
        WebDeveloper.Common.displayNotification("deleteDomainCookiesSingleResult");
      }
      else
      {
        WebDeveloper.Common.displayNotification("deleteDomainCookiesMultipleResult", [cookiesLength]);
      }
    });
  }
};

// Deletes all the cookies for the current path
WebDeveloper.Cookies.deletePathCookies = function(cookies)
{
  var cookiesLength = cookies.length;

  // If no path cookies were found
  if(cookiesLength === 0)
  {
    WebDeveloper.Common.displayNotification("deletePathCookiesNoneFound");
  }
  else
  {
    var message = null;

    // If one path cookie was found
    if(cookiesLength == 1)
    {
      message = WebDeveloper.Locales.getString("deletePathCookiesSingleConfirmation");
    }
    else
    {
      message = WebDeveloper.Locales.getFormattedString("deletePathCookiesMultipleConfirmation", [cookiesLength]);
    }

    // If the deletion is confirmed
    WebDeveloper.Overlay.displayConfirmation(WebDeveloper.Locales.getString("deletePathCookies"), message, WebDeveloper.Locales.getString("delete"), "trash", function()
    {
      WebDeveloper.Overlay.closeConfirmation();

      // Loop through the path cookies
      for(var i = 0; i < cookiesLength; i++)
      {
        WebDeveloper.Cookies.deleteCookie(cookies[i]);
      }

      // If one path cookie was deleted
      if(cookiesLength == 1)
      {
        WebDeveloper.Common.displayNotification("deletePathCookiesSingleResult");
      }
      else
      {
        WebDeveloper.Common.displayNotification("deletePathCookiesMultipleResult", [cookiesLength]);
      }
    });
  }
};

// Deletes all session cookies
WebDeveloper.Cookies.deleteSessionCookies = function(allCookies)
{
  var cookie        = null;
  var cookies       = [];
  var cookiesLength = null;

  // Loop through the cookies
  for(var i = 0, l = allCookies.length; i < l; i++)
  {
    cookie = allCookies[i];

    // If this is a session cookie
    if(cookie.session)
    {
      cookies.push(cookie);
    }
  }

  cookiesLength = cookies.length;

  // If no session cookies were found
  if(cookiesLength === 0)
  {
    WebDeveloper.Common.displayNotification("deleteSessionCookiesNoneFound");
  }
  else
  {
    var message = null;

    // If one session cookie was found
    if(cookiesLength == 1)
    {
      message = WebDeveloper.Locales.getString("deleteSessionCookiesSingleConfirmation");
    }
    else
    {
      message = WebDeveloper.Locales.getFormattedString("deleteSessionCookiesMultipleConfirmation", [cookiesLength]);
    }

    // If the deletion is confirmed
    WebDeveloper.Overlay.displayConfirmation(WebDeveloper.Locales.getString("deleteSessionCookies"), message, WebDeveloper.Locales.getString("delete"), "trash", function()
    {
      WebDeveloper.Overlay.closeConfirmation();

      // Loop through the session cookies
      for(i = 0; i < cookiesLength; i++)
      {
        WebDeveloper.Cookies.deleteCookie(cookies[i]);
      }

      // If one session cookie was deleted
      if(cookiesLength == 1)
      {
        WebDeveloper.Common.displayNotification("deleteSessionCookiesSingleResult");
      }
      else
      {
        WebDeveloper.Common.displayNotification("deleteSessionCookiesMultipleResult", [cookiesLength]);
      }
    });
  }
};

// Returns tomorrow's date as a string
WebDeveloper.Cookies.getDateTomorrow = function()
{
  var date = new Date();

  date.setDate(date.getDate() + 1);

  return date.toUTCString();
};
var WebDeveloper = WebDeveloper || {};

WebDeveloper.Locales = WebDeveloper.Locales || {};

// Sets up the generated locale
WebDeveloper.Locales.setupGeneratedLocale = function()
{
  var locale = {};

  locale.collapseAll   = WebDeveloper.Locales.getString("collapseAll");
  locale.documents     = WebDeveloper.Locales.getString("documents");
  locale.expandAll     = WebDeveloper.Locales.getString("expandAll");
  locale.extensionName = WebDeveloper.Locales.getString("extensionName");
  locale.from          = WebDeveloper.Locales.getString("from");

  return locale;
};
var WebDeveloper = WebDeveloper || {};

WebDeveloper.Overlay         = WebDeveloper.Overlay || {};
WebDeveloper.Overlay.Cookies = WebDeveloper.Overlay.Cookies || {};

// Returns the locale for the view cookie information feature
WebDeveloper.Overlay.Cookies.getViewCookieInformationLocale = function()
{
  var locale = WebDeveloper.Locales.setupGeneratedLocale();

  locale.atEndOfSession             = WebDeveloper.Locales.getString("atEndOfSession");
  locale.cancel                     = WebDeveloper.Locales.getString("cancel");
  locale.cannotEdit                 = WebDeveloper.Locales.getString("cannotEdit");
  locale.cannotEditHTTPOnlyCookies  = WebDeveloper.Locales.getString("cannotEditHTTPOnlyCookies");
  locale.cannotEditLocalhostCookies = WebDeveloper.Locales.getString("cannotEditLocalhostCookies");
  locale.cookie                     = WebDeveloper.Locales.getString("cookie");
  locale.cookieDeleted              = WebDeveloper.Locales.getString("cookieDeleted");
  locale.cookieEdited               = WebDeveloper.Locales.getString("cookieEdited");
  locale.cookieInformation          = WebDeveloper.Locales.getString("cookieInformation");
  locale.cookies                    = WebDeveloper.Locales.getString("cookies");
  locale.deleteConfirmation         = WebDeveloper.Locales.getString("deleteConfirmation");
  locale.deleteCookie               = WebDeveloper.Locales.getString("deleteCookie");
  locale.deleteCookieConfirmation   = WebDeveloper.Locales.getString("deleteCookieConfirmation");
  locale.deleteLabel                = WebDeveloper.Locales.getString("delete");
  locale.edit                       = WebDeveloper.Locales.getString("edit");
  locale.editCookie                 = WebDeveloper.Locales.getString("editCookie");
  locale.expires                    = WebDeveloper.Locales.getString("expires");
  locale.expiresCannotBeEmpty       = WebDeveloper.Locales.getString("expiresCannotBeEmpty");
  locale.expiresNotValid            = WebDeveloper.Locales.getString("expiresNotValid");
  locale.host                       = WebDeveloper.Locales.getString("host");
  locale.hostCannotBeEmpty          = WebDeveloper.Locales.getString("hostCannotBeEmpty");
  locale.httpOnly                   = WebDeveloper.Locales.getString("httpOnly");
  locale.name                       = WebDeveloper.Locales.getString("name");
  locale.nameCannotBeEmpty          = WebDeveloper.Locales.getString("nameCannotBeEmpty");
  locale.no                         = WebDeveloper.Locales.getString("no");
  locale.path                       = WebDeveloper.Locales.getString("path");
  locale.pathCannotBeEmpty          = WebDeveloper.Locales.getString("pathCannotBeEmpty");
  locale.property                   = WebDeveloper.Locales.getString("property");
  locale.save                       = WebDeveloper.Locales.getString("save");
  locale.secure                     = WebDeveloper.Locales.getString("secure");
  locale.secureCookie               = WebDeveloper.Locales.getString("secureCookie");
  locale.sessionCookie              = WebDeveloper.Locales.getString("sessionCookie");
  locale.value                      = WebDeveloper.Locales.getString("value");
  locale.yes                        = WebDeveloper.Locales.getString("yes");

  return locale;
};
var WebDeveloper = WebDeveloper || {};

WebDeveloper.Overlay     = WebDeveloper.Overlay || {};
WebDeveloper.Overlay.CSS = WebDeveloper.Overlay.CSS || {};

// Returns the locale for the view CSS feature
WebDeveloper.Overlay.CSS.getViewCSSLocale = function()
{
  var locale = WebDeveloper.Locales.setupGeneratedLocale();

  locale.couldNotLoadCSS    = WebDeveloper.Locales.getString("couldNotLoadCSS");
  locale.css                = WebDeveloper.Locales.getString("css");
  locale.dark               = WebDeveloper.Locales.getString("dark");
  locale.embeddedCSSFrom    = WebDeveloper.Locales.getString("embeddedCSSFrom");
  locale.light              = WebDeveloper.Locales.getString("light");
  locale.none               = WebDeveloper.Locales.getString("none");
  locale.syntaxHighlighting = WebDeveloper.Locales.getString("syntaxHighlighting");

  return locale;
};
var WebDeveloper = WebDeveloper || {};

WebDeveloper.Overlay       = WebDeveloper.Overlay || {};
WebDeveloper.Overlay.Forms = WebDeveloper.Overlay.Forms || {};

// Returns the locale for the view form information feature
WebDeveloper.Overlay.Forms.getViewFormInformationLocale = function()
{
  var locale = WebDeveloper.Locales.setupGeneratedLocale();

  locale.action        = WebDeveloper.Locales.getString("action");
  locale.elements      = WebDeveloper.Locales.getString("elements");
  locale.form          = WebDeveloper.Locales.getString("form");
  locale.forms         = WebDeveloper.Locales.getString("forms");
  locale.id            = WebDeveloper.Locales.getString("id");
  locale.label         = WebDeveloper.Locales.getString("label");
  locale.maximumLength = WebDeveloper.Locales.getString("maximumLength");
  locale.method        = WebDeveloper.Locales.getString("method");
  locale.name          = WebDeveloper.Locales.getString("name");
  locale.size          = WebDeveloper.Locales.getString("size");
  locale.type          = WebDeveloper.Locales.getString("type");
  locale.value         = WebDeveloper.Locales.getString("value");

  return locale;
};
var WebDeveloper = WebDeveloper || {};

WebDeveloper.Overlay        = WebDeveloper.Overlay || {};
WebDeveloper.Overlay.Images = WebDeveloper.Overlay.Images || {};

// Returns the locale for the view image information feature
WebDeveloper.Overlay.Images.getViewImageInformationLocale = function()
{
  var locale = WebDeveloper.Locales.setupGeneratedLocale();

  locale.alt      = WebDeveloper.Locales.getString("alt");
  locale.height   = WebDeveloper.Locales.getString("height");
  locale.image    = WebDeveloper.Locales.getString("image");
  locale.images   = WebDeveloper.Locales.getString("images");
  locale.property = WebDeveloper.Locales.getString("property");
  locale.src      = WebDeveloper.Locales.getString("src");
  locale.value    = WebDeveloper.Locales.getString("value");
  locale.width    = WebDeveloper.Locales.getString("width");

  return locale;
};
var WebDeveloper = WebDeveloper || {};

WebDeveloper.Overlay             = WebDeveloper.Overlay || {};
WebDeveloper.Overlay.Information = WebDeveloper.Overlay.Information || {};

// Returns the locale for the view anchor information feature
WebDeveloper.Overlay.Information.getViewAnchorInformationLocale = function()
{
  var locale = WebDeveloper.Locales.setupGeneratedLocale();

  locale.anchor            = WebDeveloper.Locales.getString("anchor");
  locale.anchorInformation = WebDeveloper.Locales.getString("anchorInformation");
  locale.anchors           = WebDeveloper.Locales.getString("anchors");

  return locale;
};

// Returns the locale for the view color information feature
WebDeveloper.Overlay.Information.getViewColorInformationLocale = function()
{
  var locale = WebDeveloper.Locales.setupGeneratedLocale();

  locale.color            = WebDeveloper.Locales.getString("color");
  locale.colorInformation = WebDeveloper.Locales.getString("colorInformation");
  locale.colors           = WebDeveloper.Locales.getString("colors");

  return locale;
};

// Returns the locale for the view document outline feature
WebDeveloper.Overlay.Information.getViewDocumentOutlineLocale = function()
{
  var locale = WebDeveloper.Locales.setupGeneratedLocale();

  locale.documentOutline = WebDeveloper.Locales.getString("documentOutline");
  locale.heading         = WebDeveloper.Locales.getString("heading");
  locale.headings        = WebDeveloper.Locales.getString("headings");
  locale.missingHeading  = WebDeveloper.Locales.getString("missingHeading");
  locale.noHeadingText   = WebDeveloper.Locales.getString("noHeadingText");

  return locale;
};

// Returns the locale for the view JavaScript feature
WebDeveloper.Overlay.Information.getViewJavaScriptLocale = function()
{
  var locale = WebDeveloper.Locales.setupGeneratedLocale();

  locale.beautifyJavaScript     = WebDeveloper.Locales.getString("beautifyJavaScript");
  locale.couldNotLoadJavaScript = WebDeveloper.Locales.getString("couldNotLoadJavaScript");
  locale.dark                   = WebDeveloper.Locales.getString("dark");
  locale.embeddedJavaScriptFrom = WebDeveloper.Locales.getString("embeddedJavaScriptFrom");
  locale.javaScript             = WebDeveloper.Locales.getString("javaScript");
  locale.light                  = WebDeveloper.Locales.getString("light");
  locale.none                   = WebDeveloper.Locales.getString("none");
  locale.syntaxHighlighting     = WebDeveloper.Locales.getString("syntaxHighlighting");
  locale.undoBeautifyJavaScript = WebDeveloper.Locales.getString("undoBeautifyJavaScript");

  return locale;
};

// Returns the locale for the view link information feature
WebDeveloper.Overlay.Information.getViewLinkInformationLocale = function()
{
  var locale = WebDeveloper.Locales.setupGeneratedLocale();

  locale.link            = WebDeveloper.Locales.getString("link");
  locale.linkInformation = WebDeveloper.Locales.getString("linkInformation");
  locale.links           = WebDeveloper.Locales.getString("links");

  return locale;
};

// Returns the locale for the view meta tag information feature
WebDeveloper.Overlay.Information.getViewMetaTagInformationLocale = function()
{
  var locale = WebDeveloper.Locales.setupGeneratedLocale();

  locale.content  = WebDeveloper.Locales.getString("content");
  locale.metaTag  = WebDeveloper.Locales.getString("metaTag");
  locale.metaTags = WebDeveloper.Locales.getString("metaTags");
  locale.name     = WebDeveloper.Locales.getString("name");

  return locale;
};

// Returns the locale for the view response headers feature
WebDeveloper.Overlay.Information.getViewResponseHeadersLocale = function()
{
  var locale = WebDeveloper.Locales.setupGeneratedLocale();

  locale.couldNotLoadResponseHeaders = WebDeveloper.Locales.getString("couldNotLoadResponseHeaders");
  locale.responseHeaders             = WebDeveloper.Locales.getString("responseHeaders");

  return locale;
};
var WebDeveloper = WebDeveloper || {};

WebDeveloper.Overlay         = WebDeveloper.Overlay || {};
WebDeveloper.Overlay.Options = WebDeveloper.Overlay.Options || {};

// Returns the locale for the about feature
WebDeveloper.Overlay.Options.getAboutLocale = function()
{
  var locale = {};

  locale.about                = WebDeveloper.Locales.getString("about");
  locale.author               = WebDeveloper.Locales.getString("author");
  locale.buildDate            = WebDeveloper.Locales.getString("buildDate");
  locale.extensionDescription = WebDeveloper.Locales.getString("extensionDescription");
  locale.extensionName        = WebDeveloper.Locales.getString("extensionName");
  locale.version              = WebDeveloper.Locales.getString("version");

  return locale;
};
var WebDeveloper = WebDeveloper || {};

WebDeveloper.Overlay        = WebDeveloper.Overlay || {};
WebDeveloper.Overlay.Resize = WebDeveloper.Overlay.Resize || {};

// Returns the locale for the view responsive layouts feature
WebDeveloper.Overlay.Resize.getViewResponsiveLayoutsLocale = function()
{
  var locale = WebDeveloper.Locales.setupGeneratedLocale();

  locale.layouts           = WebDeveloper.Locales.getString("layouts");
  locale.reloadLayouts     = WebDeveloper.Locales.getString("reloadLayouts");
  locale.responsiveLayouts = WebDeveloper.Locales.getString("responsiveLayouts");

  return locale;
};
var WebDeveloper = WebDeveloper || {};

WebDeveloper.Cookies = WebDeveloper.Cookies || {};

// Adds a cookie
WebDeveloper.Cookies.addCookie = function(cookie)
{
  var host     = cookie.host.trim();
  var name     = cookie.name.trim();
  var protocol = "http://";
  var secure   = cookie.secure;
  var url      = null;
  var value    = cookie.value.trim();

  // If the cookie is secure
  if(secure)
  {
    protocol = "https://";
  }

  url = protocol + host + cookie.path.trim();

  // If the cookie is a session cookie
  if(cookie.session)
  {
    chrome.cookies.set({ "domain": host, "name": name, "secure": secure, "url": url, "value": value });
  }
  else
  {
    chrome.cookies.set({ "domain": host, "expirationDate": (new Date(cookie.expires.trim()).getTime()) / 1000, "name": name, "secure": secure, "url": url, "value": value });
  }
};

// Returns true if you can edit a local cookie
WebDeveloper.Cookies.canEditLocalCookie = function()
{
  return false;
};

// Deletes a cookie
WebDeveloper.Cookies.deleteCookie = function(cookie)
{
  var protocol = "http://";

  // If the cookie is secure
  if(cookie.secure)
  {
    protocol = "https://";
  }

  chrome.cookies.remove({ "name": cookie.name, "url": protocol + cookie.host + cookie.path });
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

WebDeveloper.Common                 = WebDeveloper.Common || {};
WebDeveloper.Overlay                = WebDeveloper.Overlay || {};
WebDeveloper.Overlay.animationSpeed = 100;

$(function()
{
  var menu         = chrome.extension.getBackgroundPage().WebDeveloper.Storage.getItem("menu");
  var notification = $("#notification");

  $("#cookies-toolbar > a").append(WebDeveloper.Locales.getString("cookies"));
  $("#css-toolbar > a").append(WebDeveloper.Locales.getString("css"));
  $("#disable-toolbar > a").append(WebDeveloper.Locales.getString("disable"));
  $("#forms-toolbar > a").append(WebDeveloper.Locales.getString("forms"));
  $("#images-toolbar > a").append(WebDeveloper.Locales.getString("images"));
  $("#information-toolbar > a").append(WebDeveloper.Locales.getString("information"));
  $("#miscellaneous-toolbar > a").append(WebDeveloper.Locales.getString("miscellaneous"));
  $("#options-toolbar > a").append(WebDeveloper.Locales.getString("options"));
  $("#outline-toolbar > a").append(WebDeveloper.Locales.getString("outline"));
  $("#resize-toolbar > a").append(WebDeveloper.Locales.getString("resize"));
  $("#tools-toolbar > a").append(WebDeveloper.Locales.getString("tools"));

  // If the menu is set
  if(menu)
  {
    $("a", $("#" + menu)).tab("show");
  }

  WebDeveloper.Overlay.getSelectedTab(function(tab)
  {
    var featuresOnTab = chrome.extension.getBackgroundPage().WebDeveloper.Storage.getFeaturesOnTab(tab.id);

    // If there are features on the tab
    if(featuresOnTab)
    {
      // Loop through the features on the tab
      for(var i = 0, l = featuresOnTab.length; i < l; i++)
      {
        $("#" + featuresOnTab[i]).addClass("active");
      }
    }
  });

  $("#confirmation-cancel").on("click", WebDeveloper.Overlay.closeConfirmation);
  $(".close", notification).on("click", WebDeveloper.Overlay.closeNotification);
  $(".help-inline").on("click", "a", WebDeveloper.Overlay.openURL);
  $("li", $(".nav-tabs")).on("click", WebDeveloper.Overlay.changeTab);
  $(notification).on("click", "a", WebDeveloper.Overlay.openURL);
});

// Displays a notification
WebDeveloper.Common.displayNotification = function(message, parameters)
{
  // If parameters are set
  if(parameters)
  {
    WebDeveloper.Overlay.displayNotification(WebDeveloper.Locales.getFormattedString(message, parameters));
  }
  else
  {
    WebDeveloper.Overlay.displayNotification(WebDeveloper.Locales.getString(message));
  }
};

// Adds a feature on a tab
WebDeveloper.Overlay.addFeatureOnTab = function(featureItem, tab, scriptFile, scriptCode)
{
  WebDeveloper.Overlay.addScriptsToTab(tab, scriptFile, scriptCode, null);
};

// Adds a script to the tab
WebDeveloper.Overlay.addScriptToTab = function(tab, script, callback)
{
  chrome.tabs.executeScript(tab.id, script, callback);
};

// Adds scripts to the tab
WebDeveloper.Overlay.addScriptsToTab = function(tab, scriptFile, scriptCode, callback)
{
  WebDeveloper.Overlay.addScriptToTab(tab, { "file": scriptFile }, function()
  {
    WebDeveloper.Overlay.addScriptToTab(tab, { "code": scriptCode }, callback);
  });
};

// Handles a tab change
WebDeveloper.Overlay.changeTab = function()
{
  WebDeveloper.Overlay.closeNotification();

  chrome.extension.getBackgroundPage().WebDeveloper.Storage.setItem("menu", $(this).attr("id"));
};

// Closes the overlay
WebDeveloper.Overlay.close = function()
{
  window.close();
};

// Closes the confirmation
WebDeveloper.Overlay.closeConfirmation = function(event, callback)
{
  $("#confirmation").slideUp(WebDeveloper.Overlay.animationSpeed, callback);

  // If the event is set
  if(event)
  {
    event.preventDefault();
  }
};

// Closes the notification
WebDeveloper.Overlay.closeNotification = function(event, callback)
{
  $("#notification").slideUp(WebDeveloper.Overlay.animationSpeed, callback);

  // If the event is set
  if(event)
  {
    event.preventDefault();
  }
};

// Displays a confirmation
WebDeveloper.Overlay.displayConfirmation = function(title, message, buttonText, buttonIcon, callback)
{
  var confirmation = $("#confirmation");

  WebDeveloper.Overlay.closeConfirmation(null, function()
  {
    var buttonHTML = buttonText;

    // If the button icon is set
    if(buttonIcon)
    {
      buttonHTML = '<i class="icon-' + buttonIcon + '"></i> ' + buttonText;
    }

    $("span", confirmation).text(message);
    $("#confirmation-cancel").text(WebDeveloper.Locales.getString("cancel"));
    $(".btn-warning", confirmation).html(buttonHTML).off("click").on("click", callback);
    confirmation.slideDown(WebDeveloper.Overlay.animationSpeed);
  });
};

// Displays a notification
WebDeveloper.Overlay.displayNotification = function(message, type)
{
  var notification = $("#notification");

  // If the type is not specified
  if(!type)
  {
    type = "success";
  }

  WebDeveloper.Overlay.closeNotification(null, function()
  {
    notification.removeClass().addClass("alert alert-" + type);
    $("span", notification).html(message);
    notification.slideDown(WebDeveloper.Overlay.animationSpeed);
  });
};

// Returns the selected tab
WebDeveloper.Overlay.getSelectedTab = function(callback)
{
  chrome.tabs.getSelected(null, callback);
};

// Returns the selected window
WebDeveloper.Overlay.getSelectedWindow = function(callback)
{
  chrome.windows.getCurrent(callback);
};

// Returns true if this is a valid tab
WebDeveloper.Overlay.isValidTab = function(tab)
{
  var url = tab.url;

  // If this is a chrome URL
  if(url.indexOf("chrome://") === 0 || url.indexOf("chrome-extension://") === 0)
  {
    WebDeveloper.Overlay.displayNotification(WebDeveloper.Locales.getString("extensionName") + " " + WebDeveloper.Locales.getString("internalBrowserPagesError"), "error");

    return false;
  }
  else if(url.indexOf("https://chrome.google.com/extensions/") === 0 || url.indexOf("https://chrome.google.com/webstore/") === 0)
  {
    WebDeveloper.Overlay.displayNotification(WebDeveloper.Locales.getString("extensionName") + " " + WebDeveloper.Locales.getString("chromeExtensionGalleryError"), "error");

    return false;
  }

  return true;
};

// Handles any overlay messages
WebDeveloper.Overlay.message = function(message, sender, sendResponse)
{
  // If the message type is a notification
  if(message.type == "display-notification")
  {
    WebDeveloper.Common.displayNotification(message.message, message.parameters);
  }

  sendResponse({});
};

// Opens a tab to the URL
WebDeveloper.Overlay.openTab = function(tabURL)
{
  WebDeveloper.Overlay.getSelectedTab(function(tab)
  {
    chrome.tabs.create({ "index": tab.index + 1, "url": tabURL });

    WebDeveloper.Overlay.close();
  });
};

// Opens a URL from the overlay
WebDeveloper.Overlay.openURL = function()
{
  var href = $(this).attr("href");

  WebDeveloper.Overlay.getSelectedTab(function(tab)
  {
    chrome.tabs.create({ "index": tab.index + 1, "url": href });

    WebDeveloper.Overlay.close();
  });
};

// Toggles a content setting
WebDeveloper.Overlay.toggleContentSetting = function(settingType, menu, url, enableMessage, disableMessage)
{
  chrome.contentSettings[settingType].get({ "primaryUrl": url }, function(details)
  {
    var callback = null;
    var setting  = details.setting;

    // If the setting is currently set to block
    if(setting == "block")
    {
      setting = "allow";
    }
    else
    {
      setting = "block";
    }

    // If the enable and disable message are set
    if(enableMessage && disableMessage)
    {
      callback = function()
      {
        WebDeveloper.Overlay.updateContentSettingMenu(menu, settingType);

        // If the setting is being allowed
        if(setting == "allow")
        {
          WebDeveloper.Overlay.displayNotification(WebDeveloper.Locales.getString(enableMessage));
        }
        else
        {
          WebDeveloper.Overlay.displayNotification(WebDeveloper.Locales.getString(disableMessage));
        }
      };
    }

    chrome.contentSettings[settingType].set({ "primaryPattern": url, "setting": setting }, callback);
  });
};

// Toggles a feature on a tab
WebDeveloper.Overlay.toggleFeatureOnTab = function(featureItem, tab, scriptFile, scriptCode, closeOverlay)
{
  var feature = featureItem.attr("id");

  WebDeveloper.Overlay.addScriptsToTab(tab, scriptFile, scriptCode, function()
  {
    chrome.extension.getBackgroundPage().WebDeveloper.Storage.toggleFeatureOnTab(feature, tab);

    featureItem.toggleClass("active");

    // If the overlay should be closed
    if(closeOverlay)
    {
      WebDeveloper.Overlay.close();
    }
  });
};

// Updates the menu
WebDeveloper.Overlay.updateContentSettingMenu = function(menu, settingType)
{
  chrome.contentSettings[settingType].get({ "primaryUrl": "http://*/*" }, function(details)
  {
    var setting = details.setting;

    // If the setting is currently set to block
    if(setting == "block")
    {
      menu.addClass("active");
    }
    else if(menu.hasClass("active"))
    {
      menu.removeClass("active");
    }
  });
};

chrome.extension.onMessage.addListener(WebDeveloper.Overlay.message);
var WebDeveloper = WebDeveloper || {};

WebDeveloper.Overlay         = WebDeveloper.Overlay || {};
WebDeveloper.Overlay.Cookies = WebDeveloper.Overlay.Cookies || {};

$(function()
{
  var disableCookiesMenu = $("#disable-cookies");

  disableCookiesMenu.append(WebDeveloper.Locales.getString("disableCookies")).on("click", WebDeveloper.Overlay.Cookies.toggleCookies);
  $("#add-cookie").append(WebDeveloper.Locales.getString("addCookieMenu")).on("click", WebDeveloper.Overlay.Cookies.addCookie);
  $("#delete-domain-cookies").append(WebDeveloper.Locales.getString("deleteDomainCookies")).on("click", WebDeveloper.Overlay.Cookies.deleteDomainCookies);
  $("#delete-path-cookies").append(WebDeveloper.Locales.getString("deletePathCookies")).on("click", WebDeveloper.Overlay.Cookies.deletePathCookies);
  $("#delete-session-cookies").append(WebDeveloper.Locales.getString("deleteSessionCookies")).on("click", WebDeveloper.Overlay.Cookies.deleteSessionCookies);
  $("#view-cookie-information").append(WebDeveloper.Locales.getString("viewCookieInformation")).on("click", WebDeveloper.Overlay.Cookies.viewCookieInformation);

  $("#add-cookie-cancel").on("click", WebDeveloper.Overlay.Cookies.cancelAddCookie);
  $("#add-cookie-dialog").on("submit", function(event) { event.preventDefault(); });
  $("#add-cookie-expires, #add-cookie-host, #add-cookie-name, #add-cookie-path, #add-cookie-value").on("keypress", WebDeveloper.Overlay.Cookies.addCookieKeyPress);
  $("#add-cookie-submit").on("click", WebDeveloper.Overlay.Cookies.submitAddCookie);

  $("legend", $("#add-cookie-dialog")).text(WebDeveloper.Locales.getString("addCookie"));
  $("#add-cookie-cancel").text(WebDeveloper.Locales.getString("cancel"));
  $("#add-cookie-secure").after(WebDeveloper.Locales.getString("secureCookie"));
  $("#add-cookie-session").after(WebDeveloper.Locales.getString("sessionCookie")).on("change", WebDeveloper.Overlay.Cookies.changeSession);
  $("#add-cookie-submit").append(WebDeveloper.Locales.getString("add"));
  $('[for="add-cookie-expires"]').text(WebDeveloper.Locales.getString("expires"));
  $('[for="add-cookie-host"]').text(WebDeveloper.Locales.getString("host"));
  $('[for="add-cookie-name"]').text(WebDeveloper.Locales.getString("name"));
  $('[for="add-cookie-path"]').text(WebDeveloper.Locales.getString("path"));
  $('[for="add-cookie-value"]').text(WebDeveloper.Locales.getString("value"));

  WebDeveloper.Overlay.updateContentSettingMenu(disableCookiesMenu, "cookies");
});

// Adds a cookie
WebDeveloper.Overlay.Cookies.addCookie = function()
{
  WebDeveloper.Overlay.getSelectedTab(function(tab)
  {
    // If the tab is valid
    if(WebDeveloper.Overlay.isValidTab(tab))
    {
      chrome.tabs.sendMessage(tab.id, {type: "get-location-details"}, function(response)
      {
        var addCookieDialog = $("#add-cookie-dialog");

        $("#add-cookie-expires").val(WebDeveloper.Cookies.getDateTomorrow()).prop("disabled", false);
        $("#add-cookie-host").val(response.host);
        $("#add-cookie-path").val(response.path);
        $("#add-cookie-value").focus();

        WebDeveloper.Overlay.Cookies.resetAddDialog(addCookieDialog);

        $(".tabbable, #confirmation, #notification").slideUp(WebDeveloper.Overlay.animationSpeed, function()
        {
          addCookieDialog.slideDown(WebDeveloper.Overlay.animationSpeed);
        });
      });
    }
  });
};

// Handles a key press when adding a cookie
WebDeveloper.Overlay.Cookies.addCookieKeyPress = function(event)
{
  // If the enter key was pressed
  if(event.keyCode == 13)
  {
    WebDeveloper.Overlay.Cookies.submitAddCookie();
  }
};

// Cancels adding a cookie
WebDeveloper.Overlay.Cookies.cancelAddCookie = function()
{
  $("#add-cookie-dialog").slideUp(WebDeveloper.Overlay.animationSpeed, function()
  {
    $(".tabbable").slideDown(WebDeveloper.Overlay.animationSpeed);
  });
};

// Handles the cookie session setting being changed
WebDeveloper.Overlay.Cookies.changeSession = function()
{
  var session = $(this);

  // If the session setting is checked
  if(session.prop("checked"))
  {
    $("#add-cookie-expires").val("").prop("disabled", true);
  }
  else
  {
    $("#add-cookie-expires").val(WebDeveloper.Cookies.getDateTomorrow()).prop("disabled", false);
  }
};

// Converts an array of cookies
WebDeveloper.Overlay.Cookies.convertCookies = function(cookies)
{
  var convertedCookies = [];
  var cookie           = null;
  var cookieObject     = null;

  // Loop through the cookies
  for(var i = 0, l = cookies.length; i < l; i++)
  {
    cookie       = {};
    cookieObject = cookies[i];

    cookie.expires  = cookieObject.expirationDate;
    cookie.host     = cookieObject.domain;
    cookie.httpOnly = cookieObject.httpOnly;
    cookie.name     = cookieObject.name;
    cookie.path     = cookieObject.path;
    cookie.secure   = cookieObject.secure;
    cookie.session  = cookieObject.session;
    cookie.value    = cookieObject.value;

    convertedCookies.push(cookie);
  }

  return convertedCookies;
};

// Deletes all the cookies for the current domain
WebDeveloper.Overlay.Cookies.deleteDomainCookies = function()
{
  WebDeveloper.Overlay.getSelectedTab(function(tab)
  {
    // If the tab is valid
    if(WebDeveloper.Overlay.isValidTab(tab))
    {
      chrome.cookies.getAll({}, function(allCookies)
      {
        chrome.tabs.sendMessage(tab.id, { "allCookies": WebDeveloper.Overlay.Cookies.convertCookies(allCookies), "type": "get-domain-cookies" }, function(cookies)
        {
          WebDeveloper.Cookies.deleteDomainCookies(cookies);
        });
      });
    }
  });
};

// Deletes all the cookies for the current path
WebDeveloper.Overlay.Cookies.deletePathCookies = function()
{
  WebDeveloper.Overlay.getSelectedTab(function(tab)
  {
    // If the tab is valid
    if(WebDeveloper.Overlay.isValidTab(tab))
    {
      chrome.cookies.getAll({}, function(allCookies)
      {
        chrome.tabs.sendMessage(tab.id, { "allCookies": WebDeveloper.Overlay.Cookies.convertCookies(allCookies), "type": "get-path-cookies" }, function(cookies)
        {
          WebDeveloper.Cookies.deletePathCookies(cookies);
        });
      });
    }
  });
};

// Deletes all session cookies
WebDeveloper.Overlay.Cookies.deleteSessionCookies = function()
{
  chrome.cookies.getAll({}, function(allCookies)
  {
    WebDeveloper.Cookies.deleteSessionCookies(WebDeveloper.Overlay.Cookies.convertCookies(allCookies));
  });
};

// Populates a cookie from a dialog
WebDeveloper.Overlay.Cookies.populateCookieFromDialog = function()
{
  var cookie = {};

  cookie.host  = $("#add-cookie-host").val();
  cookie.name  = $("#add-cookie-name").val();
  cookie.path  = $("#add-cookie-path").val();
  cookie.value = $("#add-cookie-value").val();

  // If the cookie is secure
  if($("#add-cookie-secure").prop("checked"))
  {
    cookie.secure = true;
  }

  // If the cookie is a session cookie
  if($("#add-cookie-session").prop("checked"))
  {
    cookie.session = true;
  }
  else
  {
    cookie.expires = $("#add-cookie-expires").val();
  }

  return cookie;
};

// Resets the add cookie dialog
WebDeveloper.Overlay.Cookies.resetAddDialog = function(addDialog)
{
  $(".error", addDialog).removeClass("error");
  $(".help-inline", addDialog).text("");
};

// Adds a cookie
WebDeveloper.Overlay.Cookies.submitAddCookie = function()
{
  // If the dialog is valid
  if(WebDeveloper.Overlay.Cookies.validateAddDialog())
  {
    var cookie = WebDeveloper.Overlay.Cookies.populateCookieFromDialog();

    WebDeveloper.Cookies.addCookie(cookie);
    WebDeveloper.Overlay.Cookies.cancelAddCookie();
    WebDeveloper.Overlay.displayNotification(WebDeveloper.Locales.getFormattedString("cookieAdded", [cookie.name]));
  }
};

// Toggles cookies
WebDeveloper.Overlay.Cookies.toggleCookies = function()
{
  var menu = $(this);

  WebDeveloper.Overlay.toggleContentSetting("cookies", menu, "http://*/*", "enableCookiesResult", "disableCookiesResult");
  WebDeveloper.Overlay.toggleContentSetting("cookies", menu, "https://*/*");
};

// Returns true if the add dialog is valid
WebDeveloper.Overlay.Cookies.validateAddDialog = function()
{
  var expires   = $("#add-cookie-expires");
  var host      = $("#add-cookie-host");
  var hostValue = host.val().trim();
  var name      = $("#add-cookie-name");
  var path      = $("#add-cookie-path");
  var valid     = true;

  WebDeveloper.Overlay.Cookies.resetAddDialog($("#add-cookie-dialog"));

  // If the cookie name is not set
  if(!name.val())
  {
    name.next().text(WebDeveloper.Locales.getString("nameCannotBeEmpty"));
    name.closest(".control-group").addClass("error");

    valid = false;
  }

  // If the cookie host is not set
  if(!hostValue)
  {
    host.next().text(WebDeveloper.Locales.getString("hostCannotBeEmpty"));
    host.closest(".control-group").addClass("error");

    valid = false;
  }
  else if(hostValue == "localhost" || hostValue == ".localhost")
  {
    host.next().html(WebDeveloper.Locales.getString("extensionName") + " " + WebDeveloper.Locales.getString("hostCannotBeLocalhost"));
    host.closest(".control-group").addClass("error");

    valid = false;
  }

  // If the cookie path is not set
  if(!path.val())
  {
    path.next().text(WebDeveloper.Locales.getString("pathCannotBeEmpty"));
    path.closest(".control-group").addClass("error");

    valid = false;
  }

  // If the cookie is not a session cookie
  if(!$("#add-cookie-session").prop("checked"))
  {
    var expiresValue = expires.val().trim();

    // If the cookie expires is not set
    if(!expiresValue)
    {
      expires.next().text(WebDeveloper.Locales.getString("expiresCannotBeEmpty"));
      expires.closest(".control-group").addClass("error");

      valid = false;
    }
    else if(new Date(expiresValue) == "Invalid Date")
    {
      expires.next().text(WebDeveloper.Locales.getString("expiresNotValid"));
      expires.closest(".control-group").addClass("error");

      valid = false;
    }
  }

  return valid;
};

// Displays all the cookies for the page
WebDeveloper.Overlay.Cookies.viewCookieInformation = function()
{
  WebDeveloper.Overlay.getSelectedTab(function(tab)
  {
    // If the tab is valid
    if(WebDeveloper.Overlay.isValidTab(tab))
    {
      chrome.cookies.getAll({}, function(allCookies)
      {
        chrome.tabs.sendMessage(tab.id, { "allCookies": WebDeveloper.Overlay.Cookies.convertCookies(allCookies), "type": "get-cookies" }, function(data)
        {
          chrome.extension.getBackgroundPage().WebDeveloper.Background.openGeneratedTab(chrome.extension.getURL("generated/view-cookie-information.html"), tab.index, data, WebDeveloper.Overlay.Cookies.getViewCookieInformationLocale());

          WebDeveloper.Overlay.close();
        });
      });
    }
  });
};
var WebDeveloper = WebDeveloper || {};

WebDeveloper.Overlay     = WebDeveloper.Overlay || {};
WebDeveloper.Overlay.CSS = WebDeveloper.Overlay.CSS || {};

$(function()
{
  $("#disable-all-styles").append(WebDeveloper.Locales.getString("disableAllStyles")).on("click", WebDeveloper.Overlay.CSS.disableAllStyles);
  $("#disable-browser-default-styles").append(WebDeveloper.Locales.getString("disableBrowserDefaultStyles")).on("click", WebDeveloper.Overlay.CSS.disableBrowserDefaultStyles);
  $("#disable-embedded-styles").append(WebDeveloper.Locales.getString("disableEmbeddedStyles")).on("click", WebDeveloper.Overlay.CSS.disableEmbeddedStyles);
  $("#disable-inline-styles").append(WebDeveloper.Locales.getString("disableInlineStyles")).on("click", WebDeveloper.Overlay.CSS.disableInlineStyles);
  $("#disable-linked-style-sheets").append(WebDeveloper.Locales.getString("disableLinkedStyleSheets")).on("click", WebDeveloper.Overlay.CSS.disableLinkedStyleSheets);
  $("#disable-print-styles").append(WebDeveloper.Locales.getString("disablePrintStyles")).on("click", WebDeveloper.Overlay.CSS.disablePrintStyles);
  $("#display-handheld-styles").append(WebDeveloper.Locales.getString("displayHandheldStyles")).on("click", WebDeveloper.Overlay.CSS.displayHandheldStyles);
  $("#display-print-styles").append(WebDeveloper.Locales.getString("displayPrintStyles")).on("click", WebDeveloper.Overlay.CSS.displayPrintStyles);
  $("#edit-css").append(WebDeveloper.Locales.getString("editCSS")).on("click", WebDeveloper.Overlay.CSS.editCSS);
  $("#reload-linked-style-sheets").append(WebDeveloper.Locales.getString("reloadLinkedStyleSheets")).on("click", WebDeveloper.Overlay.CSS.reloadLinkedStyleSheets);
  $("#use-border-box-model").append(WebDeveloper.Locales.getString("useBorderBoxModel")).on("click", WebDeveloper.Overlay.CSS.useBorderBoxModel);
  $("#view-css").append(WebDeveloper.Locales.getString("viewCSS")).on("click", WebDeveloper.Overlay.CSS.viewCSS);
});

// Adds a feature on a tab
WebDeveloper.Overlay.CSS.addFeatureOnTab = function(featureItem, tab, scriptCode)
{
  WebDeveloper.Overlay.addFeatureOnTab(featureItem, tab, "features/javascript/css.js", scriptCode);
};

// Disables all styles
WebDeveloper.Overlay.CSS.disableAllStyles = function()
{
  var featureItem = $(this);

  WebDeveloper.Overlay.getSelectedTab(function(tab)
  {
    // If the tab is valid
    if(WebDeveloper.Overlay.isValidTab(tab))
    {
      var feature = featureItem.attr("id");
      var disable = !chrome.extension.getBackgroundPage().WebDeveloper.Storage.isFeatureOnTab(feature, tab);

      WebDeveloper.Overlay.CSS.toggleFeatureOnTab(featureItem, tab, "WebDeveloper.CSS.toggleAllStyles(" + disable + ", [document]);");
    }
  });
};

// Disables the browser default styles
WebDeveloper.Overlay.CSS.disableBrowserDefaultStyles = function()
{
  var featureItem = $(this);

  WebDeveloper.Overlay.getSelectedTab(function(tab)
  {
    // If the tab is valid
    if(WebDeveloper.Overlay.isValidTab(tab))
    {
      WebDeveloper.Overlay.CSS.toggleFeatureOnTab(featureItem, tab, "WebDeveloper.CSS.toggleBrowserDefaultStyles([document]);");
    }
  });
};

// Disables embedded styles
WebDeveloper.Overlay.CSS.disableEmbeddedStyles = function()
{
  var featureItem = $(this);

  WebDeveloper.Overlay.getSelectedTab(function(tab)
  {
    // If the tab is valid
    if(WebDeveloper.Overlay.isValidTab(tab))
    {
      var feature = featureItem.attr("id");
      var disable = !chrome.extension.getBackgroundPage().WebDeveloper.Storage.isFeatureOnTab(feature, tab);

      WebDeveloper.Overlay.CSS.toggleFeatureOnTab(featureItem, tab, "WebDeveloper.CSS.toggleEmbeddedStyles(" + disable + ", [document]);");
    }
  });
};

// Disables inline styles
WebDeveloper.Overlay.CSS.disableInlineStyles = function()
{
  var featureItem = $(this);

  WebDeveloper.Overlay.getSelectedTab(function(tab)
  {
    // If the tab is valid
    if(WebDeveloper.Overlay.isValidTab(tab))
    {
      var feature = featureItem.attr("id");
      var disable = !chrome.extension.getBackgroundPage().WebDeveloper.Storage.isFeatureOnTab(feature, tab);

      WebDeveloper.Overlay.CSS.toggleFeatureOnTab(featureItem, tab, "WebDeveloper.CSS.toggleInlineStyles(" + disable + ", [document]);");
    }
  });
};

// Disables linked style sheets
WebDeveloper.Overlay.CSS.disableLinkedStyleSheets = function()
{
  var featureItem = $(this);

  WebDeveloper.Overlay.getSelectedTab(function(tab)
  {
    // If the tab is valid
    if(WebDeveloper.Overlay.isValidTab(tab))
    {
      var feature = featureItem.attr("id");
      var disable = !chrome.extension.getBackgroundPage().WebDeveloper.Storage.isFeatureOnTab(feature, tab);

      WebDeveloper.Overlay.CSS.toggleFeatureOnTab(featureItem, tab, "WebDeveloper.CSS.toggleLinkedStyleSheets(" + disable + ", [document]);");
    }
  });
};

// Disables print styles
WebDeveloper.Overlay.CSS.disablePrintStyles = function()
{
  var featureItem = $(this);

  WebDeveloper.Overlay.getSelectedTab(function(tab)
  {
    // If the tab is valid
    if(WebDeveloper.Overlay.isValidTab(tab))
    {
      var feature = featureItem.attr("id");
      var disable = !chrome.extension.getBackgroundPage().WebDeveloper.Storage.isFeatureOnTab(feature, tab);

      WebDeveloper.Overlay.CSS.toggleFeatureOnTab(featureItem, tab, "WebDeveloper.CSS.togglePrintStyles(" + disable + ", [document]);");
    }
  });
};

// Displays handheld styles
WebDeveloper.Overlay.CSS.displayHandheldStyles = function()
{
  var featureItem = $(this);

  WebDeveloper.Overlay.getSelectedTab(function(tab)
  {
    // If the tab is valid
    if(WebDeveloper.Overlay.isValidTab(tab))
    {
      var feature = featureItem.attr("id");
      var storage = chrome.extension.getBackgroundPage().WebDeveloper.Storage;
      var display = !storage.isFeatureOnTab(feature, tab);

      // If displaying handheld styles and print styles are being displayed
      if(display && storage.isFeatureOnTab("display-print-styles", tab))
      {
        var displayPrintStylesItem = $("#display-print-styles");

        WebDeveloper.Overlay.CSS.toggleFeatureOnTab(displayPrintStylesItem, tab, 'WebDeveloper.CSS.toggleMediaTypeStyles("print", false, [document]);');
      }

      WebDeveloper.Overlay.CSS.toggleFeatureOnTab(featureItem, tab, 'WebDeveloper.CSS.toggleMediaTypeStyles("handheld", ' + display + ', [document]);');
    }
  });
};

// Displays print styles
WebDeveloper.Overlay.CSS.displayPrintStyles = function()
{
  var featureItem = $(this);

  WebDeveloper.Overlay.getSelectedTab(function(tab)
  {
    // If the tab is valid
    if(WebDeveloper.Overlay.isValidTab(tab))
    {
      var feature = featureItem.attr("id");
      var storage = chrome.extension.getBackgroundPage().WebDeveloper.Storage;
      var display = !storage.isFeatureOnTab(feature, tab);

      // If displaying print styles and handheld styles are being displayed
      if(display && storage.isFeatureOnTab("display-handheld-styles", tab))
      {
        var displayHandheldStylesItem = $("#display-handheld-styles");

        WebDeveloper.Overlay.CSS.toggleFeatureOnTab(displayHandheldStylesItem, tab, 'WebDeveloper.CSS.toggleMediaTypeStyles("handheld", false, [document]);');
      }

      WebDeveloper.Overlay.CSS.toggleFeatureOnTab(featureItem, tab, 'WebDeveloper.CSS.toggleMediaTypeStyles("print", ' + display + ', [document]);');
    }
  });
};

// Edits the CSS of the page
WebDeveloper.Overlay.CSS.editCSS = function()
{
  var featureItem = $(this);

  WebDeveloper.Overlay.getSelectedTab(function(tab)
  {
    // If the tab is valid
    if(WebDeveloper.Overlay.isValidTab(tab))
    {
      var feature = featureItem.attr("id");
      var edit    = !chrome.extension.getBackgroundPage().WebDeveloper.Storage.isFeatureOnTab(feature, tab);
      var locale  = "";

      locale += "'couldNotLoadCSS': '" + WebDeveloper.Locales.getString("couldNotLoadCSS") + "',";
      locale += "'dashboardTitle': '" + WebDeveloper.Locales.getString("extensionName") + " " + WebDeveloper.Locales.getString("dashboard") + "',";
      locale += "'editCSS': '" + WebDeveloper.Locales.getString("editCSS") + "',";
      locale += "'embeddedStyles': '" + WebDeveloper.Locales.getString("embeddedStyles") + "'";

      WebDeveloper.Overlay.toggleFeatureOnTab(featureItem, tab, "dashboard/javascript/dashboard.js", "WebDeveloper.EditCSS.editCSS(" + edit + ", document, {" + locale + "});", true);
    }
  });
};

// Reloads the linked style sheets of the page
WebDeveloper.Overlay.CSS.reloadLinkedStyleSheets = function()
{
  var featureItem = $(this);

  WebDeveloper.Overlay.getSelectedTab(function(tab)
  {
    // If the tab is valid
    if(WebDeveloper.Overlay.isValidTab(tab))
    {
      WebDeveloper.Overlay.CSS.addFeatureOnTab(featureItem, tab, "WebDeveloper.CSS.reloadLinkedStyleSheets([document]);");
    }
  });
};

// Toggles a feature on a tab
WebDeveloper.Overlay.CSS.toggleFeatureOnTab = function(featureItem, tab, scriptCode)
{
  WebDeveloper.Overlay.toggleFeatureOnTab(featureItem, tab, "features/javascript/css.js", scriptCode);
};

// Displays alt attributes for all images
WebDeveloper.Overlay.CSS.useBorderBoxModel = function()
{
  var featureItem = $(this);

  WebDeveloper.Overlay.getSelectedTab(function(tab)
  {
    // If the tab is valid
    if(WebDeveloper.Overlay.isValidTab(tab))
    {
      WebDeveloper.Overlay.CSS.toggleFeatureOnTab(featureItem, tab, "WebDeveloper.CSS.useBorderBoxModel([document]);");
    }
  });
};

// Displays the CSS
WebDeveloper.Overlay.CSS.viewCSS = function()
{
  WebDeveloper.Overlay.getSelectedTab(function(tab)
  {
    // If the tab is valid
    if(WebDeveloper.Overlay.isValidTab(tab))
    {
      chrome.tabs.sendMessage(tab.id, {type: "get-css"}, function(data)
      {
        data.theme = chrome.extension.getBackgroundPage().WebDeveloper.Storage.getItem("syntax_highlight_theme");

        chrome.extension.getBackgroundPage().WebDeveloper.Background.openGeneratedTab(chrome.extension.getURL("generated/view-css.html"), tab.index, data, WebDeveloper.Overlay.CSS.getViewCSSLocale());

        WebDeveloper.Overlay.close();
      });
    }
  });
};
var WebDeveloper = WebDeveloper || {};

WebDeveloper.Overlay         = WebDeveloper.Overlay || {};
WebDeveloper.Overlay.Disable = WebDeveloper.Overlay.Disable || {};

$(function()
{
  var disableJavaScriptMenu    = $("#disable-javascript");
  var disableNotificationsMenu = $("#disable-notifications");
  var disablePluginsMenu       = $("#disable-plugins");
  var disablePopupsMenu        = $("#disable-popups");

  disableJavaScriptMenu.append(WebDeveloper.Locales.getString("disableJavaScript")).on("click", WebDeveloper.Overlay.Disable.toggleJavaScript);
  disableNotificationsMenu.append(WebDeveloper.Locales.getString("disableNotifications")).on("click", WebDeveloper.Overlay.Disable.toggleNotifications);
  disablePluginsMenu.append(WebDeveloper.Locales.getString("disablePlugins")).on("click", WebDeveloper.Overlay.Disable.togglePlugins);
  disablePopupsMenu.append(WebDeveloper.Locales.getString("disablePopups")).on("click", WebDeveloper.Overlay.Disable.togglePopups);
  $("#reset-disable-features").append(WebDeveloper.Locales.getString("resetDisableFeatures")).on("click", WebDeveloper.Overlay.Disable.resetFeatures);

  WebDeveloper.Overlay.updateContentSettingMenu(disableJavaScriptMenu, "javascript");
  WebDeveloper.Overlay.updateContentSettingMenu(disableNotificationsMenu, "notifications");
  WebDeveloper.Overlay.updateContentSettingMenu(disablePluginsMenu, "plugins");
  WebDeveloper.Overlay.updateContentSettingMenu(disablePopupsMenu, "popups");
});

// Resets the disable features
WebDeveloper.Overlay.Disable.resetFeatures = function()
{
  chrome.contentSettings.cookies.clear({});
  chrome.contentSettings.images.clear({});
  chrome.contentSettings.javascript.clear({});
  chrome.contentSettings.notifications.clear({});
  chrome.contentSettings.plugins.clear({});
  chrome.contentSettings.popups.clear({});

  WebDeveloper.Overlay.updateContentSettingMenu($("#disable-javascript"), "javascript");
  WebDeveloper.Overlay.updateContentSettingMenu($("#disable-notifications"), "notifications");
  WebDeveloper.Overlay.updateContentSettingMenu($("#disable-plugins"), "plugins");
  WebDeveloper.Overlay.updateContentSettingMenu($("#disable-popups"), "popups");

  WebDeveloper.Overlay.displayNotification(WebDeveloper.Locales.getString("resetDisableFeaturesResult"));
};

// Toggles JavaScript
WebDeveloper.Overlay.Disable.toggleJavaScript = function()
{
  var menu = $(this);

  WebDeveloper.Overlay.toggleContentSetting("javascript", menu, "http://*/*", "enableJavaScriptResult", "disableJavaScriptResult");
  WebDeveloper.Overlay.toggleContentSetting("javascript", menu, "https://*/*");
};

// Toggles notifications
WebDeveloper.Overlay.Disable.toggleNotifications = function()
{
  var menu = $(this);

  WebDeveloper.Overlay.toggleContentSetting("notifications", menu, "http://*/*", "enableNotificationsResult", "disableNotificationsResult");
  WebDeveloper.Overlay.toggleContentSetting("notifications", menu, "https://*/*");
};

// Toggles plugins
WebDeveloper.Overlay.Disable.togglePlugins = function()
{
  var menu = $(this);

  WebDeveloper.Overlay.toggleContentSetting("plugins", menu, "http://*/*", "enablePluginsResult", "disablePluginsResult");
  WebDeveloper.Overlay.toggleContentSetting("plugins", menu, "https://*/*");
};

// Toggles popups
WebDeveloper.Overlay.Disable.togglePopups = function()
{
  var menu = $(this);

  WebDeveloper.Overlay.toggleContentSetting("popups", menu, "http://*/*", "enablePopupsResult", "disablePopupsResult");
  WebDeveloper.Overlay.toggleContentSetting("popups", menu, "https://*/*");
};
var WebDeveloper = WebDeveloper || {};

WebDeveloper.Overlay       = WebDeveloper.Overlay || {};
WebDeveloper.Overlay.Forms = WebDeveloper.Overlay.Forms || {};

$(function()
{
  $("#check-all-checkboxes").append(WebDeveloper.Locales.getString("checkAllCheckboxes")).on("click", WebDeveloper.Overlay.Forms.checkAllCheckboxes);
  $("#clear-form-fields").append(WebDeveloper.Locales.getString("clearFormFields")).on("click", WebDeveloper.Overlay.Forms.clearFormFields);
  $("#clear-radio-buttons").append(WebDeveloper.Locales.getString("clearRadioButtons")).on("click", WebDeveloper.Overlay.Forms.clearRadioButtons);
  $("#convert-form-gets-to-posts").append(WebDeveloper.Locales.getString("convertFormGetsToPosts")).on("click", function() { WebDeveloper.Overlay.Forms.convertFormMethods("post"); });
  $("#convert-form-posts-to-gets").append(WebDeveloper.Locales.getString("convertFormPostsToGets")).on("click", function() { WebDeveloper.Overlay.Forms.convertFormMethods("get"); });
  $("#convert-select-elements-to-text-inputs").append(WebDeveloper.Locales.getString("convertSelectElementsToTextInputs")).on("click", WebDeveloper.Overlay.Forms.convertSelectElementsToTextInputs);
  $("#convert-text-inputs-to-textareas").append(WebDeveloper.Locales.getString("convertTextInputsToTextareas")).on("click", WebDeveloper.Overlay.Forms.convertTextInputsToTextareas);
  $("#display-form-details").append(WebDeveloper.Locales.getString("displayFormDetails")).on("click", WebDeveloper.Overlay.Forms.displayFormDetails);
  $("#display-passwords").append(WebDeveloper.Locales.getString("displayPasswords")).on("click", WebDeveloper.Overlay.Forms.displayPasswords);
  $("#enable-auto-completion").append(WebDeveloper.Locales.getString("enableAutoCompletion")).on("click", WebDeveloper.Overlay.Forms.enableAutoCompletion);
  $("#enable-form-fields").append(WebDeveloper.Locales.getString("enableFormFields")).on("click", WebDeveloper.Overlay.Forms.enableFormFields);
  $("#expand-select-elements").append(WebDeveloper.Locales.getString("expandSelectElements")).on("click", WebDeveloper.Overlay.Forms.expandSelectElements);
  $("#make-form-fields-writable").append(WebDeveloper.Locales.getString("makeFormFieldsWritable")).on("click", WebDeveloper.Overlay.Forms.makeFormFieldsWritable);
  $("#outline-form-fields-without-labels").append(WebDeveloper.Locales.getString("outlineFormFieldsWithoutLabels")).on("click", WebDeveloper.Overlay.Forms.outlineFormFieldsWithoutLabels);
  $("#populate-form-fields").append(WebDeveloper.Locales.getString("populateFormFields")).on("click", WebDeveloper.Overlay.Forms.populateFormFields);
  $("#remove-maximum-lengths").append(WebDeveloper.Locales.getString("removeMaximumLengths")).on("click", WebDeveloper.Overlay.Forms.removeMaximumLengths);
  $("#uncheck-all-checkboxes").append(WebDeveloper.Locales.getString("uncheckAllCheckboxes")).on("click", WebDeveloper.Overlay.Forms.uncheckAllCheckboxes);
  $("#view-form-information").append(WebDeveloper.Locales.getString("viewFormInformation")).on("click", WebDeveloper.Overlay.Forms.viewFormInformation);
});

// Adds a feature on a tab
WebDeveloper.Overlay.Forms.addFeatureOnTab = function(featureItem, tab, scriptCode)
{
  WebDeveloper.Overlay.addFeatureOnTab(featureItem, tab, "features/javascript/forms.js", scriptCode);
};

// Checks all checkboxes
WebDeveloper.Overlay.Forms.checkAllCheckboxes = function()
{
  var featureItem = $(this);

  WebDeveloper.Overlay.getSelectedTab(function(tab)
  {
    // If the tab is valid
    if(WebDeveloper.Overlay.isValidTab(tab))
    {
      WebDeveloper.Overlay.Forms.addFeatureOnTab(featureItem, tab, "WebDeveloper.Forms.toggleCheckboxes(true, [document]);");
    }
  });
};

// Clears all form fields
WebDeveloper.Overlay.Forms.clearFormFields = function()
{
  var featureItem = $(this);

  WebDeveloper.Overlay.getSelectedTab(function(tab)
  {
    // If the tab is valid
    if(WebDeveloper.Overlay.isValidTab(tab))
    {
      WebDeveloper.Overlay.Forms.addFeatureOnTab(featureItem, tab, "WebDeveloper.Forms.clearFormFields([document]);");
    }
  });
};

// Clears all radio buttons
WebDeveloper.Overlay.Forms.clearRadioButtons = function()
{
  var featureItem = $(this);

  WebDeveloper.Overlay.getSelectedTab(function(tab)
  {
    // If the tab is valid
    if(WebDeveloper.Overlay.isValidTab(tab))
    {
      WebDeveloper.Overlay.Forms.addFeatureOnTab(featureItem, tab, "WebDeveloper.Forms.clearRadioButtons([document]);");
    }
  });
};

// Converts the methods of all forms
WebDeveloper.Overlay.Forms.convertFormMethods = function(method)
{
  var featureItem = $(this);

  WebDeveloper.Overlay.getSelectedTab(function(tab)
  {
    // If the tab is valid
    if(WebDeveloper.Overlay.isValidTab(tab))
    {
      WebDeveloper.Overlay.Forms.addFeatureOnTab(featureItem, tab, 'WebDeveloper.Forms.convertFormMethods("' + method + '", [document]);');
    }
  });
};

// Converts select elements to text inputs
WebDeveloper.Overlay.Forms.convertSelectElementsToTextInputs = function()
{
  var featureItem = $(this);

  WebDeveloper.Overlay.getSelectedTab(function(tab)
  {
    // If the tab is valid
    if(WebDeveloper.Overlay.isValidTab(tab))
    {
      WebDeveloper.Overlay.Forms.addFeatureOnTab(featureItem, tab, "WebDeveloper.Forms.convertSelectElementsToTextInputs([document]);");
    }
  });
};

// Converts text inputs to textareas
WebDeveloper.Overlay.Forms.convertTextInputsToTextareas = function()
{
  var featureItem = $(this);

  WebDeveloper.Overlay.getSelectedTab(function(tab)
  {
    // If the tab is valid
    if(WebDeveloper.Overlay.isValidTab(tab))
    {
      WebDeveloper.Overlay.Forms.addFeatureOnTab(featureItem, tab, "WebDeveloper.Forms.convertTextInputsToTextareas([document]);");
    }
  });
};

// Displays the details about all forms
WebDeveloper.Overlay.Forms.displayFormDetails = function()
{
  var featureItem = $(this);

  WebDeveloper.Overlay.getSelectedTab(function(tab)
  {
    // If the tab is valid
    if(WebDeveloper.Overlay.isValidTab(tab))
    {
      var feature = featureItem.attr("id");
      var display = !chrome.extension.getBackgroundPage().WebDeveloper.Storage.isFeatureOnTab(feature, tab);

      WebDeveloper.Overlay.Forms.toggleFeatureOnTab(featureItem, tab, "WebDeveloper.Forms.displayFormDetails(" + display + ", [document]);");
    }
  });
};

// Displays all passwords
WebDeveloper.Overlay.Forms.displayPasswords = function()
{
  var featureItem = $(this);

  WebDeveloper.Overlay.getSelectedTab(function(tab)
  {
    // If the tab is valid
    if(WebDeveloper.Overlay.isValidTab(tab))
    {
      WebDeveloper.Overlay.Forms.addFeatureOnTab(featureItem, tab, "WebDeveloper.Forms.displayPasswords([document]);");
    }
  });
};

// Enables auto completion on all elements
WebDeveloper.Overlay.Forms.enableAutoCompletion = function()
{
  var featureItem = $(this);

  WebDeveloper.Overlay.getSelectedTab(function(tab)
  {
    // If the tab is valid
    if(WebDeveloper.Overlay.isValidTab(tab))
    {
      WebDeveloper.Overlay.Forms.addFeatureOnTab(featureItem, tab, "WebDeveloper.Forms.enableAutoCompletion([document]);");
    }
  });
};

// Enables all form fields
WebDeveloper.Overlay.Forms.enableFormFields = function()
{
  var featureItem = $(this);

  WebDeveloper.Overlay.getSelectedTab(function(tab)
  {
    // If the tab is valid
    if(WebDeveloper.Overlay.isValidTab(tab))
    {
      WebDeveloper.Overlay.Forms.addFeatureOnTab(featureItem, tab, "WebDeveloper.Forms.enableFormFields([document]);");
    }
  });
};

// Expands all select elements
WebDeveloper.Overlay.Forms.expandSelectElements = function()
{
  var featureItem = $(this);

  WebDeveloper.Overlay.getSelectedTab(function(tab)
  {
    // If the tab is valid
    if(WebDeveloper.Overlay.isValidTab(tab))
    {
      WebDeveloper.Overlay.Forms.addFeatureOnTab(featureItem, tab, "WebDeveloper.Forms.expandSelectElements([document]);");
    }
  });
};

// Makes all form fields writable
WebDeveloper.Overlay.Forms.makeFormFieldsWritable = function()
{
  var featureItem = $(this);

  WebDeveloper.Overlay.getSelectedTab(function(tab)
  {
    // If the tab is valid
    if(WebDeveloper.Overlay.isValidTab(tab))
    {
      WebDeveloper.Overlay.Forms.addFeatureOnTab(featureItem, tab, "WebDeveloper.Forms.makeFormFieldsWritable([document]);");
    }
  });
};

// Outlines all form fields without labels
WebDeveloper.Overlay.Forms.outlineFormFieldsWithoutLabels = function()
{
  var featureItem = $(this);

  WebDeveloper.Overlay.getSelectedTab(function(tab)
  {
    // If the tab is valid
    if(WebDeveloper.Overlay.isValidTab(tab))
    {
      var feature = featureItem.attr("id");
      var display = !chrome.extension.getBackgroundPage().WebDeveloper.Storage.isFeatureOnTab(feature, tab);

      WebDeveloper.Overlay.Forms.toggleFeatureOnTab(featureItem, tab, "WebDeveloper.Forms.outlineFormFieldsWithoutLabels(" + display + ", [document]);");
    }
  });
};

// Populates all form fields
WebDeveloper.Overlay.Forms.populateFormFields = function()
{
  var featureItem = $(this);

  WebDeveloper.Overlay.getSelectedTab(function(tab)
  {
    // If the tab is valid
    if(WebDeveloper.Overlay.isValidTab(tab))
    {
      WebDeveloper.Overlay.Forms.addFeatureOnTab(featureItem, tab, 'WebDeveloper.Forms.populateFormFields([document], "' + chrome.extension.getBackgroundPage().WebDeveloper.Storage.getItem("populate_email_address") + '", "' + WebDeveloper.Locales.getString("password").toLowerCase() + '");');
    }
  });
};

// Removes maximum lengths from all elements
WebDeveloper.Overlay.Forms.removeMaximumLengths = function()
{
  var featureItem = $(this);

  WebDeveloper.Overlay.getSelectedTab(function(tab)
  {
    // If the tab is valid
    if(WebDeveloper.Overlay.isValidTab(tab))
    {
      WebDeveloper.Overlay.Forms.addFeatureOnTab(featureItem, tab, "WebDeveloper.Forms.removeMaximumLengths([document]);");
    }
  });
};

// Toggles a feature on a tab
WebDeveloper.Overlay.Forms.toggleFeatureOnTab = function(featureItem, tab, scriptCode)
{
  WebDeveloper.Overlay.toggleFeatureOnTab(featureItem, tab, "features/javascript/forms.js", scriptCode);
};

// Unchecks all checkboxes
WebDeveloper.Overlay.Forms.uncheckAllCheckboxes = function()
{
  var featureItem = $(this);

  WebDeveloper.Overlay.getSelectedTab(function(tab)
  {
    // If the tab is valid
    if(WebDeveloper.Overlay.isValidTab(tab))
    {
      WebDeveloper.Overlay.Forms.addFeatureOnTab(featureItem, tab, "WebDeveloper.Forms.toggleCheckboxes(false, [document]);");
    }
  });
};

// Displays information about all forms
WebDeveloper.Overlay.Forms.viewFormInformation = function()
{
  WebDeveloper.Overlay.getSelectedTab(function(tab)
  {
    // If the tab is valid
    if(WebDeveloper.Overlay.isValidTab(tab))
    {
      chrome.tabs.sendMessage(tab.id, {type: "get-forms"}, function(data)
      {
        chrome.extension.getBackgroundPage().WebDeveloper.Background.openGeneratedTab(chrome.extension.getURL("generated/view-form-information.html"), tab.index, data, WebDeveloper.Overlay.Forms.getViewFormInformationLocale());

        WebDeveloper.Overlay.close();
      });
    }
  });
};
var WebDeveloper = WebDeveloper || {};

WebDeveloper.Overlay        = WebDeveloper.Overlay || {};
WebDeveloper.Overlay.Images = WebDeveloper.Overlay.Images || {};

$(function()
{
  var disableImagesMenu = $("#disable-images");

  disableImagesMenu.append(WebDeveloper.Locales.getString("disableImages")).on("click", WebDeveloper.Overlay.Images.toggleImages);
  $("#display-alt-attributes").append(WebDeveloper.Locales.getString("displayAltAttributes")).on("click", WebDeveloper.Overlay.Images.displayAltAttributes);
  $("#display-image-dimensions").append(WebDeveloper.Locales.getString("displayImageDimensions")).on("click", WebDeveloper.Overlay.Images.displayImageDimensions);
  $("#display-image-paths").append(WebDeveloper.Locales.getString("displayImagePaths")).on("click", WebDeveloper.Overlay.Images.displayImagePaths);
  $("#find-broken-images").append(WebDeveloper.Locales.getString("findBrokenImages")).on("click", WebDeveloper.Overlay.Images.findBrokenImages);
  $("#hide-background-images").append(WebDeveloper.Locales.getString("hideBackgroundImages")).on("click", WebDeveloper.Overlay.Images.hideBackgroundImages);
  $("#hide-images").append(WebDeveloper.Locales.getString("hideImages")).on("click", WebDeveloper.Overlay.Images.hideImages);
  $("#make-images-full-size").append(WebDeveloper.Locales.getString("makeImagesFullSize")).on("click", WebDeveloper.Overlay.Images.makeImagesFullSize);
  $("#make-images-invisible").append(WebDeveloper.Locales.getString("makeImagesInvisible")).on("click", WebDeveloper.Overlay.Images.makeImagesInvisible);
  $("#outline-all-images").append(WebDeveloper.Locales.getString("outlineAllImages")).on("click", WebDeveloper.Overlay.Images.outlineAllImages);
  $("#outline-background-images").append(WebDeveloper.Locales.getString("outlineBackgroundImages")).on("click", WebDeveloper.Overlay.Images.outlineBackgroundImages);
  $("#outline-images-with-adjusted-dimensions").append(WebDeveloper.Locales.getString("outlineImagesWithAdjustedDimensions")).on("click", WebDeveloper.Overlay.Images.outlineImagesWithAdjustedDimensions);
  $("#outline-images-with-empty-alt-attributes").append(WebDeveloper.Locales.getString("outlineImagesWithEmptyAltAttributes")).on("click", WebDeveloper.Overlay.Images.outlineImagesWithEmptyAltAttributes);
  $("#outline-images-with-oversized-dimensions").append(WebDeveloper.Locales.getString("outlineImagesWithOversizedDimensions")).on("click", WebDeveloper.Overlay.Images.outlineImagesWithOversizedDimensions);
  $("#outline-images-without-alt-attributes").append(WebDeveloper.Locales.getString("outlineImagesWithoutAltAttributes")).on("click", WebDeveloper.Overlay.Images.outlineImagesWithoutAltAttributes);
  $("#outline-images-without-dimensions").append(WebDeveloper.Locales.getString("outlineImagesWithoutDimensions")).on("click", WebDeveloper.Overlay.Images.outlineImagesWithoutDimensions);
  $("#reload-images").append(WebDeveloper.Locales.getString("reloadImages")).on("click", WebDeveloper.Overlay.Images.reloadImages);
  $("#replace-images-with-alt-attributes").append(WebDeveloper.Locales.getString("replaceImagesWithAltAttributes")).on("click", WebDeveloper.Overlay.Images.replaceImagesWithAltAttributes);
  $("#view-image-information").append(WebDeveloper.Locales.getString("viewImageInformation")).on("click", WebDeveloper.Overlay.Images.viewImageInformation);

  WebDeveloper.Overlay.updateContentSettingMenu(disableImagesMenu, "images");
});

// Adds a feature on a tab
WebDeveloper.Overlay.Images.addFeatureOnTab = function(featureItem, tab, scriptCode)
{
  WebDeveloper.Overlay.addFeatureOnTab(featureItem, tab, "features/javascript/images.js", scriptCode);
};

// Displays alt attributes for all images
WebDeveloper.Overlay.Images.displayAltAttributes = function()
{
  var featureItem = $(this);

  WebDeveloper.Overlay.getSelectedTab(function(tab)
  {
    // If the tab is valid
    if(WebDeveloper.Overlay.isValidTab(tab))
    {
      var feature = featureItem.attr("id");
      var display = !chrome.extension.getBackgroundPage().WebDeveloper.Storage.isFeatureOnTab(feature, tab);

      WebDeveloper.Overlay.Images.toggleFeatureOnTab(featureItem, tab, "WebDeveloper.Images.displayAltAttributes(" + display + ", [document]);");
    }
  });
};

// Displays the dimensions for all images
WebDeveloper.Overlay.Images.displayImageDimensions = function()
{
  var featureItem = $(this);

  WebDeveloper.Overlay.getSelectedTab(function(tab)
  {
    // If the tab is valid
    if(WebDeveloper.Overlay.isValidTab(tab))
    {
      var feature = featureItem.attr("id");
      var display = !chrome.extension.getBackgroundPage().WebDeveloper.Storage.isFeatureOnTab(feature, tab);
      var locale  = "";

      locale += "'height': '" + WebDeveloper.Locales.getString("height") + "',";
      locale += "'width': '" + WebDeveloper.Locales.getString("width") + "'";

      WebDeveloper.Overlay.Images.toggleFeatureOnTab(featureItem, tab, "WebDeveloper.Images.displayImageDimensions(" + display + ", [document], {" + locale + "});");
    }
  });
};

// Displays the paths for all images
WebDeveloper.Overlay.Images.displayImagePaths = function()
{
  var featureItem = $(this);

  WebDeveloper.Overlay.getSelectedTab(function(tab)
  {
    // If the tab is valid
    if(WebDeveloper.Overlay.isValidTab(tab))
    {
      var feature = featureItem.attr("id");
      var display = !chrome.extension.getBackgroundPage().WebDeveloper.Storage.isFeatureOnTab(feature, tab);

      WebDeveloper.Overlay.Images.toggleFeatureOnTab(featureItem, tab, "WebDeveloper.Images.displayImagePaths(" + display + ", [document]);");
    }
  });
};

// Finds all the broken images on a page
WebDeveloper.Overlay.Images.findBrokenImages = function()
{
  WebDeveloper.Overlay.getSelectedTab(function(tab)
  {
    // If the tab is valid
    if(WebDeveloper.Overlay.isValidTab(tab))
    {
      chrome.tabs.sendMessage(tab.id, {type: "get-broken-images"}, function(data)
      {
        var locale = WebDeveloper.Locales.setupGeneratedLocale();

        locale.brokenImage  = WebDeveloper.Locales.getString("brokenImage");
        locale.brokenImages = WebDeveloper.Locales.getString("brokenImages");

        chrome.extension.getBackgroundPage().WebDeveloper.Background.openGeneratedTab(chrome.extension.getURL("generated/find-broken-images.html"), tab.index, data, locale);

        WebDeveloper.Overlay.close();
      });
    }
  });
};

// Hides all background images
WebDeveloper.Overlay.Images.hideBackgroundImages = function()
{
  var featureItem = $(this);

  WebDeveloper.Overlay.getSelectedTab(function(tab)
  {
    // If the tab is valid
    if(WebDeveloper.Overlay.isValidTab(tab))
    {
      WebDeveloper.Overlay.Images.toggleFeatureOnTab(featureItem, tab, "WebDeveloper.Images.hideBackgroundImages([document]);");
    }
  });
};

// Hides all images
WebDeveloper.Overlay.Images.hideImages = function()
{
  var featureItem = $(this);

  WebDeveloper.Overlay.getSelectedTab(function(tab)
  {
    // If the tab is valid
    if(WebDeveloper.Overlay.isValidTab(tab))
    {
      var feature = featureItem.attr("id");
      var disable = !chrome.extension.getBackgroundPage().WebDeveloper.Storage.isFeatureOnTab(feature, tab);

      WebDeveloper.Overlay.Images.toggleFeatureOnTab(featureItem, tab, "WebDeveloper.Images.hideImages(" + disable + ", [document]);");
    }
  });
};

// Makes all images full size
WebDeveloper.Overlay.Images.makeImagesFullSize = function()
{
  var featureItem = $(this);

  WebDeveloper.Overlay.getSelectedTab(function(tab)
  {
    // If the tab is valid
    if(WebDeveloper.Overlay.isValidTab(tab))
    {
      WebDeveloper.Overlay.Images.addFeatureOnTab(featureItem, tab, "WebDeveloper.Images.makeImagesFullSize([document]);");
    }
  });
};

// Makes all images invisible
WebDeveloper.Overlay.Images.makeImagesInvisible = function()
{
  var featureItem = $(this);

  WebDeveloper.Overlay.getSelectedTab(function(tab)
  {
    // If the tab is valid
    if(WebDeveloper.Overlay.isValidTab(tab))
    {
      var feature   = featureItem.attr("id");
      var invisible = !chrome.extension.getBackgroundPage().WebDeveloper.Storage.isFeatureOnTab(feature, tab);

      WebDeveloper.Overlay.Images.toggleFeatureOnTab(featureItem, tab, "WebDeveloper.Images.makeImagesInvisible(" + invisible + ", [document]);");
    }
  });
};

// Outlines all images
WebDeveloper.Overlay.Images.outlineAllImages = function()
{
  var featureItem = $(this);

  WebDeveloper.Overlay.getSelectedTab(function(tab)
  {
    // If the tab is valid
    if(WebDeveloper.Overlay.isValidTab(tab))
    {
      WebDeveloper.Overlay.Images.toggleFeatureOnTab(featureItem, tab, "WebDeveloper.Images.outlineAllImages([document]);");
    }
  });
};

// Outlines all background images
WebDeveloper.Overlay.Images.outlineBackgroundImages = function()
{
  var featureItem = $(this);

  WebDeveloper.Overlay.getSelectedTab(function(tab)
  {
    // If the tab is valid
    if(WebDeveloper.Overlay.isValidTab(tab))
    {
      var feature = featureItem.attr("id");
      var outline = !chrome.extension.getBackgroundPage().WebDeveloper.Storage.isFeatureOnTab(feature, tab);

      WebDeveloper.Overlay.Images.toggleFeatureOnTab(featureItem, tab, "WebDeveloper.Images.outlineBackgroundImages(" + outline + ", [document]);");
    }
  });
};

// Outlines all images with adjusted dimensions
WebDeveloper.Overlay.Images.outlineImagesWithAdjustedDimensions = function()
{
  var featureItem = $(this);

  WebDeveloper.Overlay.getSelectedTab(function(tab)
  {
    // If the tab is valid
    if(WebDeveloper.Overlay.isValidTab(tab))
    {
      var feature = featureItem.attr("id");
      var outline = !chrome.extension.getBackgroundPage().WebDeveloper.Storage.isFeatureOnTab(feature, tab);

      WebDeveloper.Overlay.Images.toggleFeatureOnTab(featureItem, tab, "WebDeveloper.Images.outlineImagesWithAdjustedDimensions(" + outline + ", [document]);");
    }
  });
};

// Outlines all images with empty alt attributes
WebDeveloper.Overlay.Images.outlineImagesWithEmptyAltAttributes = function()
{
  var featureItem = $(this);

  WebDeveloper.Overlay.getSelectedTab(function(tab)
  {
    // If the tab is valid
    if(WebDeveloper.Overlay.isValidTab(tab))
    {
      WebDeveloper.Overlay.Images.toggleFeatureOnTab(featureItem, tab, "WebDeveloper.Images.outlineImagesWithEmptyAltAttributes([document]);");
    }
  });
};

// Outlines all images with oversized dimensions
WebDeveloper.Overlay.Images.outlineImagesWithOversizedDimensions = function()
{
  var featureItem = $(this);

  WebDeveloper.Overlay.getSelectedTab(function(tab)
  {
    // If the tab is valid
    if(WebDeveloper.Overlay.isValidTab(tab))
    {
      var feature = featureItem.attr("id");
      var outline = !chrome.extension.getBackgroundPage().WebDeveloper.Storage.isFeatureOnTab(feature, tab);

      WebDeveloper.Overlay.Images.toggleFeatureOnTab(featureItem, tab, "WebDeveloper.Images.outlineImagesWithOversizedDimensions(" + outline + ", [document]);");
    }
  });
};

// Outlines all images without alt attributes
WebDeveloper.Overlay.Images.outlineImagesWithoutAltAttributes = function()
{
  var featureItem = $(this);

  WebDeveloper.Overlay.getSelectedTab(function(tab)
  {
    // If the tab is valid
    if(WebDeveloper.Overlay.isValidTab(tab))
    {
      WebDeveloper.Overlay.Images.toggleFeatureOnTab(featureItem, tab, "WebDeveloper.Images.outlineImagesWithoutAltAttributes([document]);");
    }
  });
};

// Outlines all images without dimensions
WebDeveloper.Overlay.Images.outlineImagesWithoutDimensions = function()
{
  var featureItem = $(this);

  WebDeveloper.Overlay.getSelectedTab(function(tab)
  {
    // If the tab is valid
    if(WebDeveloper.Overlay.isValidTab(tab))
    {
      WebDeveloper.Overlay.Images.toggleFeatureOnTab(featureItem, tab, "WebDeveloper.Images.outlineImagesWithoutDimensions([document]);");
    }
  });
};

// Reloads all the images on a page
WebDeveloper.Overlay.Images.reloadImages = function()
{
  var featureItem = $(this);

  WebDeveloper.Overlay.getSelectedTab(function(tab)
  {
    // If the tab is valid
    if(WebDeveloper.Overlay.isValidTab(tab))
    {
      WebDeveloper.Overlay.Images.addFeatureOnTab(featureItem, tab, "WebDeveloper.Images.reloadImages([document]);");
    }
  });
};

// Replaces all images with alt attributes
WebDeveloper.Overlay.Images.replaceImagesWithAltAttributes = function()
{
  var featureItem = $(this);

  WebDeveloper.Overlay.getSelectedTab(function(tab)
  {
    // If the tab is valid
    if(WebDeveloper.Overlay.isValidTab(tab))
    {
      var feature = featureItem.attr("id");
      var replace = !chrome.extension.getBackgroundPage().WebDeveloper.Storage.isFeatureOnTab(feature, tab);

      WebDeveloper.Overlay.Images.toggleFeatureOnTab(featureItem, tab, "WebDeveloper.Images.replaceImagesWithAltAttributes(" + replace + ", [document]);");
    }
  });
};

// Toggles a feature on a tab
WebDeveloper.Overlay.Images.toggleFeatureOnTab = function(featureItem, tab, scriptCode)
{
  WebDeveloper.Overlay.toggleFeatureOnTab(featureItem, tab, "features/javascript/images.js", scriptCode);
};

// Toggles images
WebDeveloper.Overlay.Images.toggleImages = function()
{
  var menu = $(this);

  WebDeveloper.Overlay.toggleContentSetting("images", menu, "http://*/*", "enableImagesResult", "disableImagesResult");
  WebDeveloper.Overlay.toggleContentSetting("images", menu, "https://*/*");
};

// Displays all the images
WebDeveloper.Overlay.Images.viewImageInformation = function()
{
  WebDeveloper.Overlay.getSelectedTab(function(tab)
  {
    // If the tab is valid
    if(WebDeveloper.Overlay.isValidTab(tab))
    {
      chrome.tabs.sendMessage(tab.id, {type: "get-images"}, function(data)
      {
        chrome.extension.getBackgroundPage().WebDeveloper.Background.openGeneratedTab(chrome.extension.getURL("generated/view-image-information.html"), tab.index, data, WebDeveloper.Overlay.Images.getViewImageInformationLocale());

        WebDeveloper.Overlay.close();
      });
    }
  });
};
var WebDeveloper = WebDeveloper || {};

WebDeveloper.Overlay             = WebDeveloper.Overlay || {};
WebDeveloper.Overlay.Information = WebDeveloper.Overlay.Information || {};

$(function()
{
  $("#display-abbreviations").append(WebDeveloper.Locales.getString("displayAbbreviations")).on("click", WebDeveloper.Overlay.Information.displayAbbreviations);
  $("#display-access-keys").append(WebDeveloper.Locales.getString("displayAccessKeys")).on("click", WebDeveloper.Overlay.Information.displayAccessKeys);
  $("#display-anchors").append(WebDeveloper.Locales.getString("displayAnchors")).on("click", WebDeveloper.Overlay.Information.displayAnchors);
  $("#display-aria-roles").append(WebDeveloper.Locales.getString("displayARIARoles")).on("click", WebDeveloper.Overlay.Information.displayARIARoles);
  $("#display-div-dimensions").append(WebDeveloper.Locales.getString("displayDivDimensions")).on("click", WebDeveloper.Overlay.Information.displayDivDimensions);
  $("#display-div-order").append(WebDeveloper.Locales.getString("displayDivOrder")).on("click", WebDeveloper.Overlay.Information.displayDivOrder);
  $("#display-element-information").append(WebDeveloper.Locales.getString("displayElementInformation")).on("click", WebDeveloper.Overlay.Information.displayElementInformation);
  $("#display-id-class-details").append(WebDeveloper.Locales.getString("displayIdClassDetails")).on("click", WebDeveloper.Overlay.Information.displayIdClassDetails);
  $("#display-link-details").append(WebDeveloper.Locales.getString("displayLinkDetails")).on("click", WebDeveloper.Overlay.Information.displayLinkDetails);
  $("#display-object-information").append(WebDeveloper.Locales.getString("displayObjectInformation")).on("click", WebDeveloper.Overlay.Information.displayObjectInformation);
  $("#display-stack-levels").append(WebDeveloper.Locales.getString("displayStackLevels")).on("click", WebDeveloper.Overlay.Information.displayStackLevels);
  $("#display-tab-index").append(WebDeveloper.Locales.getString("displayTabIndex")).on("click", WebDeveloper.Overlay.Information.displayTabIndex);
  $("#display-table-depth").append(WebDeveloper.Locales.getString("displayTableDepth")).on("click", WebDeveloper.Overlay.Information.displayTableDepth);
  $("#display-table-information").append(WebDeveloper.Locales.getString("displayTableInformation")).on("click", WebDeveloper.Overlay.Information.displayTableInformation);
  $("#display-title-attributes").append(WebDeveloper.Locales.getString("displayTitleAttributes")).on("click", WebDeveloper.Overlay.Information.displayTitleAttributes);
  $("#display-topographic-information").append(WebDeveloper.Locales.getString("displayTopographicInformation")).on("click", WebDeveloper.Overlay.Information.displayTopographicInformation);
  $("#find-duplicate-ids").append(WebDeveloper.Locales.getString("findDuplicateIds")).on("click", WebDeveloper.Overlay.Information.findDuplicateIds);
  $("#view-anchor-information").append(WebDeveloper.Locales.getString("viewAnchorInformation")).on("click", WebDeveloper.Overlay.Information.viewAnchorInformation);
  $("#view-color-information").append(WebDeveloper.Locales.getString("viewColorInformation")).on("click", WebDeveloper.Overlay.Information.viewColorInformation);
  $("#view-document-outline").append(WebDeveloper.Locales.getString("viewDocumentOutline")).on("click", WebDeveloper.Overlay.Information.viewDocumentOutline);
  $("#view-link-information").append(WebDeveloper.Locales.getString("viewLinkInformation")).on("click", WebDeveloper.Overlay.Information.viewLinkInformation);
  $("#view-meta-tag-information").append(WebDeveloper.Locales.getString("viewMetaTagInformation")).on("click", WebDeveloper.Overlay.Information.viewMetaTagInformation);
  $("#view-javascript").append(WebDeveloper.Locales.getString("viewJavaScript")).on("click", WebDeveloper.Overlay.Information.viewJavaScript);
  $("#view-response-headers").append(WebDeveloper.Locales.getString("viewResponseHeaders")).on("click", WebDeveloper.Overlay.Information.viewResponseHeaders);
});

// Displays the abbreviations on a page
WebDeveloper.Overlay.Information.displayAbbreviations = function()
{
  var featureItem = $(this);

  WebDeveloper.Overlay.getSelectedTab(function(tab)
  {
    // If the tab is valid
    if(WebDeveloper.Overlay.isValidTab(tab))
    {
      WebDeveloper.Overlay.Information.toggleFeatureOnTab(featureItem, tab, "WebDeveloper.Information.displayAbbreviations([document]);");
    }
  });
};

// Displays the access keys on a page
WebDeveloper.Overlay.Information.displayAccessKeys = function()
{
  var featureItem = $(this);

  WebDeveloper.Overlay.getSelectedTab(function(tab)
  {
    // If the tab is valid
    if(WebDeveloper.Overlay.isValidTab(tab))
    {
      var feature = featureItem.attr("id");
      var display = !chrome.extension.getBackgroundPage().WebDeveloper.Storage.isFeatureOnTab(feature, tab);

      WebDeveloper.Overlay.Information.toggleFeatureOnTab(featureItem, tab, "WebDeveloper.Information.displayAccessKeys(" + display + ", [document]);");
    }
  });
};

// Displays the anchors on a page
WebDeveloper.Overlay.Information.displayAnchors = function()
{
  var featureItem = $(this);

  WebDeveloper.Overlay.getSelectedTab(function(tab)
  {
    // If the tab is valid
    if(WebDeveloper.Overlay.isValidTab(tab))
    {
      var feature = featureItem.attr("id");
      var display = !chrome.extension.getBackgroundPage().WebDeveloper.Storage.isFeatureOnTab(feature, tab);

      WebDeveloper.Overlay.Information.toggleFeatureOnTab(featureItem, tab, "WebDeveloper.Information.displayAnchors(" + display + ", [document]);");
    }
  });
};

// Displays the ARIA roles on a page
WebDeveloper.Overlay.Information.displayARIARoles = function()
{
  var featureItem = $(this);

  WebDeveloper.Overlay.getSelectedTab(function(tab)
  {
    // If the tab is valid
    if(WebDeveloper.Overlay.isValidTab(tab))
    {
      WebDeveloper.Overlay.Information.toggleFeatureOnTab(featureItem, tab, "WebDeveloper.Information.displayARIARoles([document]);");
    }
  });
};

// Displays the dimensions for divs on a page
WebDeveloper.Overlay.Information.displayDivDimensions = function()
{
  var featureItem = $(this);

  WebDeveloper.Overlay.getSelectedTab(function(tab)
  {
    // If the tab is valid
    if(WebDeveloper.Overlay.isValidTab(tab))
    {
      var feature = featureItem.attr("id");
      var display = !chrome.extension.getBackgroundPage().WebDeveloper.Storage.isFeatureOnTab(feature, tab);
      var locale  = "";

      locale += "'height': '" + WebDeveloper.Locales.getString("height") + "',";
      locale += "'width': '" + WebDeveloper.Locales.getString("width") + "'";

      WebDeveloper.Overlay.Information.toggleFeatureOnTab(featureItem, tab, "WebDeveloper.Information.displayDivDimensions(" + display + ", [document], {" + locale + "});");
    }
  });
};

// Displays the order of the divs on a page
WebDeveloper.Overlay.Information.displayDivOrder = function()
{
  var featureItem = $(this);

  WebDeveloper.Overlay.getSelectedTab(function(tab)
  {
    // If the tab is valid
    if(WebDeveloper.Overlay.isValidTab(tab))
    {
      var feature = featureItem.attr("id");
      var display = !chrome.extension.getBackgroundPage().WebDeveloper.Storage.isFeatureOnTab(feature, tab);

      WebDeveloper.Overlay.Information.toggleFeatureOnTab(featureItem, tab, "WebDeveloper.Information.displayDivOrder(" + display + ", [document]);");
    }
  });
};

// Displays information about an element
WebDeveloper.Overlay.Information.displayElementInformation = function()
{
  var featureItem = $(this);

  WebDeveloper.Overlay.getSelectedTab(function(tab)
  {
    // If the tab is valid
    if(WebDeveloper.Overlay.isValidTab(tab))
    {
      var feature = featureItem.attr("id");
      var display = !chrome.extension.getBackgroundPage().WebDeveloper.Storage.isFeatureOnTab(feature, tab);
      var locale  = "";

      locale += "'ancestors': '" + WebDeveloper.Locales.getString("ancestors") + "',";
      locale += "'children': '" + WebDeveloper.Locales.getString("children") + "',";
      locale += "'dashboardTitle': '" + WebDeveloper.Locales.getString("extensionName") + " " + WebDeveloper.Locales.getString("dashboard") + "',";
      locale += "'dom': '" + WebDeveloper.Locales.getString("dom") + "',";
      locale += "'elementInformation': '" + WebDeveloper.Locales.getString("elementInformation") + "',";
      locale += "'layout': '" + WebDeveloper.Locales.getString("layout") + "',";
      locale += "'position': '" + WebDeveloper.Locales.getString("position") + "',";
      locale += "'selectAnElementDisplayInformation': '" + WebDeveloper.Locales.getString("selectAnElementDisplayInformation") + "',";
      locale += "'text': '" + WebDeveloper.Locales.getString("text") + "'";

      WebDeveloper.Overlay.toggleFeatureOnTab(featureItem, tab, "dashboard/javascript/dashboard.js", "WebDeveloper.ElementInformation.initialize(" + display + ", document, {" + locale + "});", true);
    }
  });
};

// Displays the id and class details for a page
WebDeveloper.Overlay.Information.displayIdClassDetails = function()
{
  var featureItem = $(this);

  WebDeveloper.Overlay.getSelectedTab(function(tab)
  {
    // If the tab is valid
    if(WebDeveloper.Overlay.isValidTab(tab))
    {
      var feature = featureItem.attr("id");
      var display = !chrome.extension.getBackgroundPage().WebDeveloper.Storage.isFeatureOnTab(feature, tab);

      WebDeveloper.Overlay.Information.toggleFeatureOnTab(featureItem, tab, "WebDeveloper.Information.displayIdClassDetails(" + display + ", [document]);");
    }
  });
};

// Displays the details for the links on a page
WebDeveloper.Overlay.Information.displayLinkDetails = function()
{
  var featureItem = $(this);

  WebDeveloper.Overlay.getSelectedTab(function(tab)
  {
    // If the tab is valid
    if(WebDeveloper.Overlay.isValidTab(tab))
    {
      WebDeveloper.Overlay.Information.toggleFeatureOnTab(featureItem, tab, "WebDeveloper.Information.displayLinkDetails([document]);");
    }
  });
};

// Displays the information for objects on a page
WebDeveloper.Overlay.Information.displayObjectInformation = function()
{
  var featureItem = $(this);

  WebDeveloper.Overlay.getSelectedTab(function(tab)
  {
    // If the tab is valid
    if(WebDeveloper.Overlay.isValidTab(tab))
    {
      var feature = featureItem.attr("id");
      var display = !chrome.extension.getBackgroundPage().WebDeveloper.Storage.isFeatureOnTab(feature, tab);

      WebDeveloper.Overlay.Information.toggleFeatureOnTab(featureItem, tab, "WebDeveloper.Information.displayObjectInformation(" + display + ", [document]);");
    }
  });
};

// Displays the stack levels on a page
WebDeveloper.Overlay.Information.displayStackLevels = function()
{
  var featureItem = $(this);

  WebDeveloper.Overlay.getSelectedTab(function(tab)
  {
    // If the tab is valid
    if(WebDeveloper.Overlay.isValidTab(tab))
    {
      var feature = featureItem.attr("id");
      var display = !chrome.extension.getBackgroundPage().WebDeveloper.Storage.isFeatureOnTab(feature, tab);

      WebDeveloper.Overlay.Information.toggleFeatureOnTab(featureItem, tab, "WebDeveloper.Information.displayStackLevels(" + display + ", [document]);");
    }
  });
};

// Displays the tab indices on a page
WebDeveloper.Overlay.Information.displayTabIndex = function()
{
  var featureItem = $(this);

  WebDeveloper.Overlay.getSelectedTab(function(tab)
  {
    // If the tab is valid
    if(WebDeveloper.Overlay.isValidTab(tab))
    {
      var feature = featureItem.attr("id");
      var display = !chrome.extension.getBackgroundPage().WebDeveloper.Storage.isFeatureOnTab(feature, tab);

      WebDeveloper.Overlay.Information.toggleFeatureOnTab(featureItem, tab, "WebDeveloper.Information.displayTabIndex(" + display + ", [document]);");
    }
  });
};

// Displays the depth of all tables on a page
WebDeveloper.Overlay.Information.displayTableDepth = function()
{
  var featureItem = $(this);

  WebDeveloper.Overlay.getSelectedTab(function(tab)
  {
    // If the tab is valid
    if(WebDeveloper.Overlay.isValidTab(tab))
    {
      var feature = featureItem.attr("id");
      var display = !chrome.extension.getBackgroundPage().WebDeveloper.Storage.isFeatureOnTab(feature, tab);

      WebDeveloper.Overlay.Information.toggleFeatureOnTab(featureItem, tab, "WebDeveloper.Information.displayTableDepth(" + display + ", [document], " + '"' + WebDeveloper.Locales.getString("depth") + '");');
    }
  });
};

// Displays the information for tables on a page
WebDeveloper.Overlay.Information.displayTableInformation = function()
{
  var featureItem = $(this);

  WebDeveloper.Overlay.getSelectedTab(function(tab)
  {
    // If the tab is valid
    if(WebDeveloper.Overlay.isValidTab(tab))
    {
      var feature = featureItem.attr("id");
      var display = !chrome.extension.getBackgroundPage().WebDeveloper.Storage.isFeatureOnTab(feature, tab);

      WebDeveloper.Overlay.Information.toggleFeatureOnTab(featureItem, tab, "WebDeveloper.Information.displayTableInformation(" + display + ", [document]);");
    }
  });
};

// Displays the title attributes on a page
WebDeveloper.Overlay.Information.displayTitleAttributes = function()
{
  var featureItem = $(this);

  WebDeveloper.Overlay.getSelectedTab(function(tab)
  {
    // If the tab is valid
    if(WebDeveloper.Overlay.isValidTab(tab))
    {
      var feature = featureItem.attr("id");
      var display = !chrome.extension.getBackgroundPage().WebDeveloper.Storage.isFeatureOnTab(feature, tab);

      WebDeveloper.Overlay.Information.toggleFeatureOnTab(featureItem, tab, "WebDeveloper.Information.displayTitleAttributes(" + display + ", [document]);");
    }
  });
};

// Displays the topographic information for a page
WebDeveloper.Overlay.Information.displayTopographicInformation = function()
{
  var featureItem = $(this);

  WebDeveloper.Overlay.getSelectedTab(function(tab)
  {
    // If the tab is valid
    if(WebDeveloper.Overlay.isValidTab(tab))
    {
      WebDeveloper.Overlay.Information.toggleFeatureOnTab(featureItem, tab, "WebDeveloper.Information.displayTopographicInformation([document]);");
    }
  });
};

// Finds all the duplicate ids on a page
WebDeveloper.Overlay.Information.findDuplicateIds = function()
{
  WebDeveloper.Overlay.getSelectedTab(function(tab)
  {
    // If the tab is valid
    if(WebDeveloper.Overlay.isValidTab(tab))
    {
      chrome.tabs.sendMessage(tab.id, {type: "get-duplicate-ids"}, function(data)
      {
        var locale = WebDeveloper.Locales.setupGeneratedLocale();

        locale.duplicateId  = WebDeveloper.Locales.getString("duplicateId");
        locale.duplicateIds = WebDeveloper.Locales.getString("duplicateIds");

        chrome.extension.getBackgroundPage().WebDeveloper.Background.openGeneratedTab(chrome.extension.getURL("generated/find-duplicate-ids.html"), tab.index, data, locale);

        WebDeveloper.Overlay.close();
      });
    }
  });
};

// Toggles a feature on a tab
WebDeveloper.Overlay.Information.toggleFeatureOnTab = function(featureItem, tab, scriptCode)
{
  WebDeveloper.Overlay.toggleFeatureOnTab(featureItem, tab, "features/javascript/information.js", scriptCode);
};

// Displays the anchor information for a page
WebDeveloper.Overlay.Information.viewAnchorInformation = function()
{
  WebDeveloper.Overlay.getSelectedTab(function(tab)
  {
    // If the tab is valid
    if(WebDeveloper.Overlay.isValidTab(tab))
    {
      chrome.tabs.sendMessage(tab.id, {type: "get-anchors"}, function(data)
      {
        chrome.extension.getBackgroundPage().WebDeveloper.Background.openGeneratedTab(chrome.extension.getURL("generated/view-anchor-information.html"), tab.index, data, WebDeveloper.Overlay.Information.getViewAnchorInformationLocale());

        WebDeveloper.Overlay.close();
      });
    }
  });
};

// Displays the color information for a page
WebDeveloper.Overlay.Information.viewColorInformation = function()
{
  WebDeveloper.Overlay.getSelectedTab(function(tab)
  {
    // If the tab is valid
    if(WebDeveloper.Overlay.isValidTab(tab))
    {
      chrome.tabs.sendMessage(tab.id, {type: "get-colors"}, function(data)
      {
        chrome.extension.getBackgroundPage().WebDeveloper.Background.openGeneratedTab(chrome.extension.getURL("generated/view-color-information.html"), tab.index, data, WebDeveloper.Overlay.Information.getViewColorInformationLocale());

        WebDeveloper.Overlay.close();
      });
    }
  });
};

// Displays the document outline
WebDeveloper.Overlay.Information.viewDocumentOutline = function()
{
  WebDeveloper.Overlay.getSelectedTab(function(tab)
  {
    // If the tab is valid
    if(WebDeveloper.Overlay.isValidTab(tab))
    {
      chrome.tabs.sendMessage(tab.id, {type: "get-document-outline"}, function(data)
      {
        chrome.extension.getBackgroundPage().WebDeveloper.Background.openGeneratedTab(chrome.extension.getURL("generated/view-document-outline.html"), tab.index, data, WebDeveloper.Overlay.Information.getViewDocumentOutlineLocale());

        WebDeveloper.Overlay.close();
      });
    }
  });
};

// Displays the JavaScript
WebDeveloper.Overlay.Information.viewJavaScript = function()
{
  WebDeveloper.Overlay.getSelectedTab(function(tab)
  {
    // If the tab is valid
    if(WebDeveloper.Overlay.isValidTab(tab))
    {
      chrome.tabs.sendMessage(tab.id, {type: "get-javascript"}, function(data)
      {
        data.theme = chrome.extension.getBackgroundPage().WebDeveloper.Storage.getItem("syntax_highlight_theme");

        chrome.extension.getBackgroundPage().WebDeveloper.Background.openGeneratedTab(chrome.extension.getURL("generated/view-javascript.html"), tab.index, data, WebDeveloper.Overlay.Information.getViewJavaScriptLocale());

        WebDeveloper.Overlay.close();
      });
    }
  });
};

// Displays the link information for a page
WebDeveloper.Overlay.Information.viewLinkInformation = function()
{
  WebDeveloper.Overlay.getSelectedTab(function(tab)
  {
    // If the tab is valid
    if(WebDeveloper.Overlay.isValidTab(tab))
    {
      chrome.tabs.sendMessage(tab.id, {type: "get-links"}, function(data)
      {
        chrome.extension.getBackgroundPage().WebDeveloper.Background.openGeneratedTab(chrome.extension.getURL("generated/view-link-information.html"), tab.index, data, WebDeveloper.Overlay.Information.getViewLinkInformationLocale());

        WebDeveloper.Overlay.close();
      });
    }
  });
};

// Displays the meta tag information for a page
WebDeveloper.Overlay.Information.viewMetaTagInformation = function()
{
  WebDeveloper.Overlay.getSelectedTab(function(tab)
  {
    // If the tab is valid
    if(WebDeveloper.Overlay.isValidTab(tab))
    {
      chrome.tabs.sendMessage(tab.id, {type: "get-meta-tags"}, function(data)
      {
        chrome.extension.getBackgroundPage().WebDeveloper.Background.openGeneratedTab(chrome.extension.getURL("generated/view-meta-tag-information.html"), tab.index, data, WebDeveloper.Overlay.Information.getViewMetaTagInformationLocale());

        WebDeveloper.Overlay.close();
      });
    }
  });
};

// Displays the response headers
WebDeveloper.Overlay.Information.viewResponseHeaders = function()
{
  WebDeveloper.Overlay.getSelectedTab(function(tab)
  {
    // If the tab is valid
    if(WebDeveloper.Overlay.isValidTab(tab))
    {
      chrome.tabs.sendMessage(tab.id, {type: "get-document-details"}, function(data)
      {
        chrome.extension.getBackgroundPage().WebDeveloper.Background.openGeneratedTab(chrome.extension.getURL("generated/view-response-headers.html"), tab.index, data, WebDeveloper.Overlay.Information.getViewResponseHeadersLocale());

        WebDeveloper.Overlay.close();
      });
    }
  });
};
var WebDeveloper = WebDeveloper || {};

WebDeveloper.Overlay               = WebDeveloper.Overlay || {};
WebDeveloper.Overlay.Miscellaneous = WebDeveloper.Overlay.Miscellaneous || {};

$(function()
{
  $("#clear-cache").append(WebDeveloper.Locales.getString("clearCache")).on("click", WebDeveloper.Overlay.Miscellaneous.clearCache);
  $("#clear-history").append(WebDeveloper.Locales.getString("clearHistory")).on("click", WebDeveloper.Overlay.Miscellaneous.confirmClearHistory);
  $("#display-color-picker").append(WebDeveloper.Locales.getString("displayColorPicker")).on("click", WebDeveloper.Overlay.Miscellaneous.displayColorPicker);
  $("#display-hidden-elements").append(WebDeveloper.Locales.getString("displayHiddenElements")).on("click", WebDeveloper.Overlay.Miscellaneous.displayHiddenElements);
  $("#display-line-guides").append(WebDeveloper.Locales.getString("displayLineGuides")).on("click", WebDeveloper.Overlay.Miscellaneous.displayLineGuides);
  $("#display-ruler").append(WebDeveloper.Locales.getString("displayRuler")).on("click", WebDeveloper.Overlay.Miscellaneous.displayRuler);
  $("#linearize-page").append(WebDeveloper.Locales.getString("linearizePage")).on("click", WebDeveloper.Overlay.Miscellaneous.linearizePage);
  $("#make-frames-resizable").append(WebDeveloper.Locales.getString("makeFramesResizable")).on("click", WebDeveloper.Overlay.Miscellaneous.makeFramesResizable);
  $("#mark-all-links-unvisited").append(WebDeveloper.Locales.getString("markAllLinksUnvisited")).on("click", function() { WebDeveloper.Overlay.Miscellaneous.toggleVisitedLinks(false); });
  $("#mark-all-links-visited").append(WebDeveloper.Locales.getString("markAllLinksVisited")).on("click", function() { WebDeveloper.Overlay.Miscellaneous.toggleVisitedLinks(true); });
});

// Adds a feature on a tab
WebDeveloper.Overlay.Miscellaneous.addFeatureOnTab = function(featureItem, tab, scriptCode)
{
  WebDeveloper.Overlay.addFeatureOnTab(featureItem, tab, "features/javascript/miscellaneous.js", scriptCode);
};

// Adds an href to the history
WebDeveloper.Overlay.Miscellaneous.addToHistory = function(href)
{
  chrome.history.addUrl({url: href});
};

// Clears the cache
WebDeveloper.Overlay.Miscellaneous.clearCache = function()
{
  WebDeveloper.Overlay.openTab("chrome://settings/clearBrowserData");
};

// Clears the history
WebDeveloper.Overlay.Miscellaneous.clearHistory = function()
{
  WebDeveloper.Overlay.closeConfirmation();

  chrome.history.deleteAll(function()
  {
    WebDeveloper.Overlay.displayNotification(WebDeveloper.Locales.getString("clearHistoryResult"));
  });
};

// Asks to confirm to clear the history
WebDeveloper.Overlay.Miscellaneous.confirmClearHistory = function()
{
  WebDeveloper.Overlay.displayConfirmation(null, WebDeveloper.Locales.getString("clearHistoryConfirmation"), WebDeveloper.Locales.getString("clear"), "trash", WebDeveloper.Overlay.Miscellaneous.clearHistory);
};

// Displays a color picker
WebDeveloper.Overlay.Miscellaneous.displayColorPicker = function()
{
  var featureItem = $(this);

  WebDeveloper.Overlay.getSelectedTab(function(tab)
  {
    // If the tab is valid
    if(WebDeveloper.Overlay.isValidTab(tab))
    {
      var feature = featureItem.attr("id");
      var display = !chrome.extension.getBackgroundPage().WebDeveloper.Storage.isFeatureOnTab(feature, tab);
      var locale  = {};

      locale.hoverColor    = WebDeveloper.Locales.getString("hoverColor");
      locale.selectedColor = WebDeveloper.Locales.getString("selectedColor");
      locale.title         = WebDeveloper.Locales.getString("extensionName") + " " + WebDeveloper.Locales.getString("colorPicker");

      WebDeveloper.Overlay.toggleFeatureOnTab(featureItem, tab, "toolbar/javascript/color-picker.js", "WebDeveloper.ColorPicker.displayColorPicker(" + display + ", document, '" + ich.colorPickerToolbar(locale, true) + "');", true);
    }
  });
};

// Displays all hidden elements
WebDeveloper.Overlay.Miscellaneous.displayHiddenElements = function()
{
  var featureItem = $(this);

  WebDeveloper.Overlay.getSelectedTab(function(tab)
  {
    // If the tab is valid
    if(WebDeveloper.Overlay.isValidTab(tab))
    {
      WebDeveloper.Overlay.Miscellaneous.addFeatureOnTab(featureItem, tab, "WebDeveloper.Miscellaneous.displayHiddenElements([document]);");
    }
  });
};

// Displays line guides
WebDeveloper.Overlay.Miscellaneous.displayLineGuides = function()
{
  var featureItem = $(this);

  WebDeveloper.Overlay.getSelectedTab(function(tab)
  {
    // If the tab is valid
    if(WebDeveloper.Overlay.isValidTab(tab))
    {
      var feature = featureItem.attr("id");
      var display = !chrome.extension.getBackgroundPage().WebDeveloper.Storage.isFeatureOnTab(feature, tab);
      var locale  = {};

      locale.addHorizontalLineGuide = WebDeveloper.Locales.getString("addHorizontalLineGuide");
      locale.addVerticalLineGuide   = WebDeveloper.Locales.getString("addVerticalLineGuide");
      locale.nextPosition           = WebDeveloper.Locales.getString("nextPosition");
      locale.positionLabel          = WebDeveloper.Locales.getString("positionLabel");
      locale.previousPosition       = WebDeveloper.Locales.getString("previousPosition");
      locale.title                  = WebDeveloper.Locales.getString("extensionName") + " " + WebDeveloper.Locales.getString("lineGuides");

      WebDeveloper.Overlay.toggleFeatureOnTab(featureItem, tab, "toolbar/javascript/line-guides.js", "WebDeveloper.LineGuides.displayLineGuides(" + display + ", document, '" + ich.lineGuidesToolbar(locale, true) + "');", true);
    }
  });
};

// Displays a ruler
WebDeveloper.Overlay.Miscellaneous.displayRuler = function()
{
  var featureItem = $(this);

  WebDeveloper.Overlay.getSelectedTab(function(tab)
  {
    // If the tab is valid
    if(WebDeveloper.Overlay.isValidTab(tab))
    {
      var feature = featureItem.attr("id");
      var display = !chrome.extension.getBackgroundPage().WebDeveloper.Storage.isFeatureOnTab(feature, tab);
      var locale  = {};

      locale.endPositionX   = WebDeveloper.Locales.getString("endPositionX");
      locale.height         = WebDeveloper.Locales.getString("height");
      locale.startPositionX = WebDeveloper.Locales.getString("startPositionX");
      locale.title          = WebDeveloper.Locales.getString("extensionName") + " " + WebDeveloper.Locales.getString("ruler");
      locale.width          = WebDeveloper.Locales.getString("width");
      locale.yLabel         = WebDeveloper.Locales.getString("yLabel");

      WebDeveloper.Overlay.toggleFeatureOnTab(featureItem, tab, "toolbar/javascript/ruler.js", "WebDeveloper.Ruler.displayRuler(" + display + ", document, '" + ich.rulerToolbar(locale, true) + "');", true);
    }
  });
};

// Linearizes a page
WebDeveloper.Overlay.Miscellaneous.linearizePage = function()
{
  var featureItem = $(this);

  WebDeveloper.Overlay.getSelectedTab(function(tab)
  {
    // If the tab is valid
    if(WebDeveloper.Overlay.isValidTab(tab))
    {
      WebDeveloper.Overlay.Miscellaneous.toggleFeatureOnTab(featureItem, tab, "WebDeveloper.Miscellaneous.linearizePage([document]);");
    }
  });
};

// Makes all frames resizable
WebDeveloper.Overlay.Miscellaneous.makeFramesResizable = function()
{
  var featureItem = $(this);

  WebDeveloper.Overlay.getSelectedTab(function(tab)
  {
    // If the tab is valid
    if(WebDeveloper.Overlay.isValidTab(tab))
    {
      WebDeveloper.Overlay.Miscellaneous.addFeatureOnTab(featureItem, tab, "WebDeveloper.Miscellaneous.makeFramesResizable([document]);");
    }
  });
};

// Removes an href from the history
WebDeveloper.Overlay.Miscellaneous.removeFromHistory = function(href)
{
  chrome.history.deleteUrl({url: href});
};

// Toggles a feature on a tab
WebDeveloper.Overlay.Miscellaneous.toggleFeatureOnTab = function(featureItem, tab, scriptCode)
{
  WebDeveloper.Overlay.toggleFeatureOnTab(featureItem, tab, "features/javascript/miscellaneous.js", scriptCode);
};

// Toggles all links on the page between visited and unvisited
WebDeveloper.Overlay.Miscellaneous.toggleVisitedLinks = function(visited)
{
  WebDeveloper.Overlay.getSelectedTab(function(tab)
  {
    // If the tab is valid
    if(WebDeveloper.Overlay.isValidTab(tab))
    {
      chrome.tabs.sendMessage(tab.id, {type: "get-links"}, function(data)
      {
        var documents = data.documents;
        var links     = null;

        // Loop through the documents
        for(var i = 0, l = documents.length; i < l; i++)
        {
          links = documents[i].links;

          // Loop through all the links
          for(var j = 0, m = links.length; j < m; j++)
          {
            // If marking links as visited
            if(visited)
            {
              WebDeveloper.Overlay.Miscellaneous.addToHistory(links[j]);
            }
            else
            {
              WebDeveloper.Overlay.Miscellaneous.removeFromHistory(links[j]);
            }
          }
        }
      });
    }
  });
};
var WebDeveloper = WebDeveloper || {};

WebDeveloper.Overlay         = WebDeveloper.Overlay || {};
WebDeveloper.Overlay.Options = WebDeveloper.Overlay.Options || {};

$(function()
{
  $("#about").append(WebDeveloper.Locales.getString("aboutMenu")).on("click", WebDeveloper.Overlay.Options.about);
  $("#help").append(WebDeveloper.Locales.getString("help")).on("click", WebDeveloper.Overlay.openURL);
  $("#options").append(WebDeveloper.Locales.getString("optionsMenu")).on("click", WebDeveloper.Overlay.Options.options);
  $("#reset-page").append(WebDeveloper.Locales.getString("resetPage")).on("click", WebDeveloper.Overlay.Options.resetPage);
});

// Opens the about page
WebDeveloper.Overlay.Options.about = function()
{
  WebDeveloper.Overlay.getSelectedTab(function(tab)
  {
    chrome.extension.getBackgroundPage().WebDeveloper.Background.openGeneratedTab(chrome.extension.getURL("about/about.html"), tab.index, null, WebDeveloper.Overlay.Options.getAboutLocale());

    WebDeveloper.Overlay.close();
  });
};

// Opens the options
WebDeveloper.Overlay.Options.options = function()
{
  WebDeveloper.Overlay.openTab(chrome.extension.getURL("options/options.html"));
};

// Resets the page
WebDeveloper.Overlay.Options.resetPage = function()
{
  WebDeveloper.Overlay.getSelectedTab(function(tab)
  {
    WebDeveloper.Overlay.addScriptToTab(tab, { "code": "window.location.reload();" }, function()
    {
      WebDeveloper.Overlay.close();
    });
  });
};
var WebDeveloper = WebDeveloper || {};

WebDeveloper.Overlay         = WebDeveloper.Overlay || {};
WebDeveloper.Overlay.Outline = WebDeveloper.Overlay.Outline || {};

$(function()
{
  var showElementTagNamesMenu = $("#show-element-tag-names");

  $("#outline-absolute-positioned-elements").append(WebDeveloper.Locales.getString("outlineAbsolutePositionedElements")).on("click", WebDeveloper.Overlay.Outline.outlineAbsolutePositionedElements);
  $("#outline-block-level-elements").append(WebDeveloper.Locales.getString("outlineBlockLevelElements")).on("click", WebDeveloper.Overlay.Outline.outlineBlockLevelElements);
  $("#outline-deprecated-elements").append(WebDeveloper.Locales.getString("outlineDeprecatedElements")).on("click", WebDeveloper.Overlay.Outline.outlineDeprecatedElements);
  $("#outline-external-links").append(WebDeveloper.Locales.getString("outlineExternalLinks")).on("click", WebDeveloper.Overlay.Outline.outlineExternalLinks);
  $("#outline-fixed-positioned-elements").append(WebDeveloper.Locales.getString("outlineFixedPositionedElements")).on("click", WebDeveloper.Overlay.Outline.outlineFixedPositionedElements);
  $("#outline-floated-elements").append(WebDeveloper.Locales.getString("outlineFloatedElements")).on("click", WebDeveloper.Overlay.Outline.outlineFloatedElements);
  $("#outline-frames").append(WebDeveloper.Locales.getString("outlineFrames")).on("click", WebDeveloper.Overlay.Outline.outlineFrames);
  $("#outline-headings").append(WebDeveloper.Locales.getString("outlineHeadings")).on("click", WebDeveloper.Overlay.Outline.outlineHeadings);
  $("#outline-non-secure-elements").append(WebDeveloper.Locales.getString("outlineNonSecureElements")).on("click", WebDeveloper.Overlay.Outline.outlineNonSecureElements);
  $("#outline-relative-positioned-elements").append(WebDeveloper.Locales.getString("outlineRelativePositionedElements")).on("click", WebDeveloper.Overlay.Outline.outlineRelativePositionedElements);
  $("#outline-table-captions").append(WebDeveloper.Locales.getString("outlineTableCaptions")).on("click", WebDeveloper.Overlay.Outline.outlineTableCaptions);
  $("#outline-table-cells").append(WebDeveloper.Locales.getString("outlineTableCells")).on("click", WebDeveloper.Overlay.Outline.outlineTableCells);
  $("#outline-tables").append(WebDeveloper.Locales.getString("outlineTables")).on("click", WebDeveloper.Overlay.Outline.outlineTables);
  showElementTagNamesMenu.append(WebDeveloper.Locales.getString("showElementTagNames")).on("click", WebDeveloper.Overlay.Outline.toggleShowElementTagNames);

  // If the outline show element tag names preference is set to true
  if(chrome.extension.getBackgroundPage().WebDeveloper.Storage.getItem("outline.show.element.tag.names") == "true")
  {
    showElementTagNamesMenu.addClass("active");
  }
});

// Outlines all absolute positioned elements
WebDeveloper.Overlay.Outline.outlineAbsolutePositionedElements = function()
{
  var featureItem = $(this);

  WebDeveloper.Overlay.getSelectedTab(function(tab)
  {
    // If the tab is valid
    if(WebDeveloper.Overlay.isValidTab(tab))
    {
      var feature = featureItem.attr("id");
      var outline = !chrome.extension.getBackgroundPage().WebDeveloper.Storage.isFeatureOnTab(feature, tab);

      WebDeveloper.Overlay.Outline.toggleFeatureOnTab(featureItem, tab, 'WebDeveloper.Outline.outlinePositionedElements("absolute", ' + outline + ", [document]);");
    }
  });
};

// Outlines all block level elements
WebDeveloper.Overlay.Outline.outlineBlockLevelElements = function()
{
  var featureItem = $(this);

  WebDeveloper.Overlay.getSelectedTab(function(tab)
  {
    // If the tab is valid
    if(WebDeveloper.Overlay.isValidTab(tab))
    {
      var showElementTagNames = chrome.extension.getBackgroundPage().WebDeveloper.Storage.getItem("outline.show.element.tag.names") == "true";

      WebDeveloper.Overlay.Outline.toggleFeatureOnTab(featureItem, tab, "WebDeveloper.Outline.outlineBlockLevelElements([document], " + showElementTagNames + ");");
    }
  });
};

// Outlines all deprecated elements
WebDeveloper.Overlay.Outline.outlineDeprecatedElements = function()
{
  var featureItem = $(this);

  WebDeveloper.Overlay.getSelectedTab(function(tab)
  {
    // If the tab is valid
    if(WebDeveloper.Overlay.isValidTab(tab))
    {
      var showElementTagNames = chrome.extension.getBackgroundPage().WebDeveloper.Storage.getItem("outline.show.element.tag.names") == "true";

      WebDeveloper.Overlay.Outline.toggleFeatureOnTab(featureItem, tab, "WebDeveloper.Outline.outlineDeprecatedElements([document], " + showElementTagNames + ");");
    }
  });
};

// Outlines all external links
WebDeveloper.Overlay.Outline.outlineExternalLinks = function()
{
  var featureItem = $(this);

  WebDeveloper.Overlay.getSelectedTab(function(tab)
  {
    // If the tab is valid
    if(WebDeveloper.Overlay.isValidTab(tab))
    {
      var feature = featureItem.attr("id");
      var outline = !chrome.extension.getBackgroundPage().WebDeveloper.Storage.isFeatureOnTab(feature, tab);

      WebDeveloper.Overlay.Outline.toggleFeatureOnTab(featureItem, tab, "WebDeveloper.Outline.outlineExternalLinks(" + outline + ", [document]);");
    }
  });
};

// Outlines all fixed positioned elements
WebDeveloper.Overlay.Outline.outlineFixedPositionedElements = function()
{
  var featureItem = $(this);

  WebDeveloper.Overlay.getSelectedTab(function(tab)
  {
    // If the tab is valid
    if(WebDeveloper.Overlay.isValidTab(tab))
    {
      var feature = featureItem.attr("id");
      var outline = !chrome.extension.getBackgroundPage().WebDeveloper.Storage.isFeatureOnTab(feature, tab);

      WebDeveloper.Overlay.Outline.toggleFeatureOnTab(featureItem, tab, 'WebDeveloper.Outline.outlinePositionedElements("fixed", ' + outline + ", [document]);");
    }
  });
};

// Outlines all floated elements
WebDeveloper.Overlay.Outline.outlineFloatedElements = function()
{
  var featureItem = $(this);

  WebDeveloper.Overlay.getSelectedTab(function(tab)
  {
    // If the tab is valid
    if(WebDeveloper.Overlay.isValidTab(tab))
    {
      var feature = featureItem.attr("id");
      var outline = !chrome.extension.getBackgroundPage().WebDeveloper.Storage.isFeatureOnTab(feature, tab);

      WebDeveloper.Overlay.Outline.toggleFeatureOnTab(featureItem, tab, "WebDeveloper.Outline.outlineFloatedElements(" + outline + ", [document]);");
    }
  });
};

// Outlines all frames
WebDeveloper.Overlay.Outline.outlineFrames = function()
{
  var featureItem = $(this);

  WebDeveloper.Overlay.getSelectedTab(function(tab)
  {
    // If the tab is valid
    if(WebDeveloper.Overlay.isValidTab(tab))
    {
      WebDeveloper.Overlay.Outline.toggleFeatureOnTab(featureItem, tab, "WebDeveloper.Outline.outlineFrames([document]);");
    }
  });
};

// Outlines all headings
WebDeveloper.Overlay.Outline.outlineHeadings = function()
{
  var featureItem = $(this);

  WebDeveloper.Overlay.getSelectedTab(function(tab)
  {
    // If the tab is valid
    if(WebDeveloper.Overlay.isValidTab(tab))
    {
      var showElementTagNames = chrome.extension.getBackgroundPage().WebDeveloper.Storage.getItem("outline.show.element.tag.names") == "true";

      WebDeveloper.Overlay.Outline.toggleFeatureOnTab(featureItem, tab, "WebDeveloper.Outline.outlineHeadings([document], " + showElementTagNames + ");");
    }
  });
};

// Outlines all non-secure elements
WebDeveloper.Overlay.Outline.outlineNonSecureElements = function()
{
  var featureItem = $(this);

  WebDeveloper.Overlay.getSelectedTab(function(tab)
  {
    // If the tab is valid
    if(WebDeveloper.Overlay.isValidTab(tab))
    {
      WebDeveloper.Overlay.Outline.toggleFeatureOnTab(featureItem, tab, "WebDeveloper.Outline.outlineNonSecureElements([document]);");
    }
  });
};

// Outlines all relative positioned elements
WebDeveloper.Overlay.Outline.outlineRelativePositionedElements = function()
{
  var featureItem = $(this);

  WebDeveloper.Overlay.getSelectedTab(function(tab)
  {
    // If the tab is valid
    if(WebDeveloper.Overlay.isValidTab(tab))
    {
      var feature = featureItem.attr("id");
      var outline = !chrome.extension.getBackgroundPage().WebDeveloper.Storage.isFeatureOnTab(feature, tab);

      WebDeveloper.Overlay.Outline.toggleFeatureOnTab(featureItem, tab, 'WebDeveloper.Outline.outlinePositionedElements("relative", ' + outline + ", [document]);");
    }
  });
};

// Outlines all table captions
WebDeveloper.Overlay.Outline.outlineTableCaptions = function()
{
  var featureItem = $(this);

  WebDeveloper.Overlay.getSelectedTab(function(tab)
  {
    // If the tab is valid
    if(WebDeveloper.Overlay.isValidTab(tab))
    {
      WebDeveloper.Overlay.Outline.toggleFeatureOnTab(featureItem, tab, "WebDeveloper.Outline.outlineTableCaptions([document]);");
    }
  });
};

// Outlines all table cells
WebDeveloper.Overlay.Outline.outlineTableCells = function()
{
  var featureItem = $(this);

  WebDeveloper.Overlay.getSelectedTab(function(tab)
  {
    // If the tab is valid
    if(WebDeveloper.Overlay.isValidTab(tab))
    {
      var showElementTagNames = chrome.extension.getBackgroundPage().WebDeveloper.Storage.getItem("outline.show.element.tag.names") == "true";

      WebDeveloper.Overlay.Outline.toggleFeatureOnTab(featureItem, tab, "WebDeveloper.Outline.outlineTableCells([document], " + showElementTagNames + ");");
    }
  });
};

// Outlines all tables
WebDeveloper.Overlay.Outline.outlineTables = function()
{
  var featureItem = $(this);

  WebDeveloper.Overlay.getSelectedTab(function(tab)
  {
    // If the tab is valid
    if(WebDeveloper.Overlay.isValidTab(tab))
    {
      WebDeveloper.Overlay.Outline.toggleFeatureOnTab(featureItem, tab, "WebDeveloper.Outline.outlineTables([document]);");
    }
  });
};

// Toggles a feature on a tab
WebDeveloper.Overlay.Outline.toggleFeatureOnTab = function(featureItem, tab, scriptCode)
{
  WebDeveloper.Overlay.toggleFeatureOnTab(featureItem, tab, "features/javascript/outline.js", scriptCode);
};

// Toggles whether to show element tag names when outlining
WebDeveloper.Overlay.Outline.toggleShowElementTagNames = function()
{
  var featureItem = $(this);

  featureItem.toggleClass("active");
  chrome.extension.getBackgroundPage().WebDeveloper.Storage.setItem("outline.show.element.tag.names", featureItem.hasClass("active"));
};

var WebDeveloper = WebDeveloper || {};

WebDeveloper.Overlay        = WebDeveloper.Overlay || {};
WebDeveloper.Overlay.Resize = WebDeveloper.Overlay.Resize || {};

$(function()
{
  var resizeWindowHeight = $("#resize-window-height");
  var resizeWindowWidth  = $("#resize-window-width");

  $("#display-window-size").append(WebDeveloper.Locales.getString("displayWindowSize")).on("click", WebDeveloper.Overlay.Resize.displayWindowSize);
  $("#edit-resize-dimensions").append(WebDeveloper.Locales.getString("editResizeDimensions")).on("click", WebDeveloper.Overlay.Resize.editResizeDimensions);
  $("#resize-menu").on("click", ".custom-resize-window", WebDeveloper.Overlay.Resize.customResizeWindow);
  $("#resize-window").append(WebDeveloper.Locales.getString("resizeWindowMenu")).on("click", WebDeveloper.Overlay.Resize.displayResizeDialog);
  $("#view-responsive-layouts").append(WebDeveloper.Locales.getString("viewResponsiveLayouts")).on("click", WebDeveloper.Overlay.Resize.viewResponsiveLayouts);

  $("#resize-window-cancel").on("click", WebDeveloper.Overlay.Resize.cancelResizeWindow);
  $("#resize-window-dialog").on("submit", function(event) { event.preventDefault(); });
  $("#resize-window-submit").on("click", WebDeveloper.Overlay.Resize.submitResizeWindow);

  $("legend", $("#resize-window-dialog")).text(WebDeveloper.Locales.getString("resizeWindow"));
  $("#resize-window-cancel").text(WebDeveloper.Locales.getString("cancel"));
  $("#resize-window-submit").append(WebDeveloper.Locales.getString("resize"));
  $('[for="resize-window-height"]').text(WebDeveloper.Locales.getString("height"));
  $('[for="resize-window-width"]').text(WebDeveloper.Locales.getString("width"));

  resizeWindowHeight.attr("placeholder", WebDeveloper.Locales.getString("heightPlaceholder"));
  resizeWindowWidth.attr("placeholder", WebDeveloper.Locales.getString("widthPlaceholder"));
  resizeWindowHeight.add(resizeWindowWidth).on("keypress", WebDeveloper.Overlay.Resize.resizeWindowKeyPress);

  WebDeveloper.Overlay.Resize.setupCustomResizeOptions();
});

// Cancels resizing the window
WebDeveloper.Overlay.Resize.cancelResizeWindow = function()
{
  $("#resize-window-dialog").slideUp(WebDeveloper.Overlay.animationSpeed, function()
  {
    $(".tabbable").slideDown(WebDeveloper.Overlay.animationSpeed);
  });
};

// Resizes the window to a custom size
WebDeveloper.Overlay.Resize.customResizeWindow = function()
{
  var featureItem = $(this);

  WebDeveloper.Overlay.Resize.resizeWindow(featureItem.data("height"), featureItem.data("width"));
};

// Displays the resize dialog
WebDeveloper.Overlay.Resize.displayResizeDialog = function()
{
  WebDeveloper.Overlay.getSelectedTab(function(tab)
  {
    // If the tab is valid
    if(WebDeveloper.Overlay.isValidTab(tab))
    {
      chrome.tabs.sendMessage(tab.id, {type: "get-window-size"}, function(response)
      {
        var resizeWindowDialog = $("#resize-window-dialog");

        $("#resize-window-height").val(response.outerHeight);
        $("#resize-window-width").val(response.outerWidth).focus();

        WebDeveloper.Overlay.Resize.resetResizeDialog(resizeWindowDialog);

        $(".tabbable, #confirmation, #notification").slideUp(WebDeveloper.Overlay.animationSpeed, function()
        {
          resizeWindowDialog.slideDown(WebDeveloper.Overlay.animationSpeed);
        });
      });
    }
  });
};

// Displays the window size
WebDeveloper.Overlay.Resize.displayWindowSize = function()
{
  WebDeveloper.Overlay.getSelectedTab(function(tab)
  {
    // If the tab is valid
    if(WebDeveloper.Overlay.isValidTab(tab))
    {
      chrome.tabs.sendMessage(tab.id, {type: "get-window-size"}, function(response)
      {
        WebDeveloper.Overlay.displayNotification(WebDeveloper.Locales.getFormattedString("displayWindowSizeResult", [response.outerWidth, response.outerHeight, response.innerWidth, response.innerHeight]), "info");
      });
    }
  });
};

// Opens the options to edit the resize dimensions
WebDeveloper.Overlay.Resize.editResizeDimensions = function()
{
  WebDeveloper.Overlay.openTab(chrome.extension.getURL("options/options.html#resize-tab"));
};

// Resets the add cookie dialog
WebDeveloper.Overlay.Resize.resetResizeDialog = function(resizeDialog)
{
  $(".error", resizeDialog).removeClass("error");
  $(".help-inline", resizeDialog).text("");
};

// Resizes the window
WebDeveloper.Overlay.Resize.resizeWindow = function(height, width)
{
  WebDeveloper.Overlay.getSelectedWindow(function(selectedWindow)
  {
    var size = {};

    // If the height is not a wildcard
    if(height != "*")
    {
      size.height = parseInt(height, 10);
    }

    // If the width is not a wildcard
    if(width != "*")
    {
      size.width = parseInt(width, 10);
    }

    chrome.windows.update(selectedWindow.id, size, function()
    {
      WebDeveloper.Overlay.close();
    });
  });
};

// Handles a key press when resizing the window
WebDeveloper.Overlay.Resize.resizeWindowKeyPress = function(event)
{
  // If the enter key was pressed
  if(event.keyCode == 13)
  {
    WebDeveloper.Overlay.Resize.submitResizeWindow();
  }
};

// Sets up the custom resize options
WebDeveloper.Overlay.Resize.setupCustomResizeOptions = function()
{
  var description          = null;
  var editResizeDimensions = $("#edit-resize-dimensions").closest("li");
  var height               = 0;
  var resizeOption         = null;
  var storage              = chrome.extension.getBackgroundPage().WebDeveloper.Storage;
  var width                = 0;

  $(".custom-resize-window", $("#custom-resize-options")).remove();

  // Loop through the resize options
  for(var i = 1, l = storage.getItem("resize_count"); i <= l; i++)
  {
    description = storage.getItem("resize_" + i + "_description");
    height      = storage.getItem("resize_" + i + "_height");
    width       = storage.getItem("resize_" + i + "_width");

    // If the description, height and width are set
    if(description && height > 0 && width > 0)
    {
      resizeOption = {};

      resizeOption.description = description;
      resizeOption.height      = height;
      resizeOption.width       = width;

      editResizeDimensions.before(ich.customResizeOption(resizeOption));
    }
  }
};

// Resizes the window
WebDeveloper.Overlay.Resize.submitResizeWindow = function()
{
  // If the dialog is valid
  if(WebDeveloper.Overlay.Resize.validateResizeDialog())
  {
    WebDeveloper.Overlay.Resize.resizeWindow($("#resize-window-height").val(), $("#resize-window-width").val());
  }
};

// Returns true if the resize dialog is valid
WebDeveloper.Overlay.Resize.validateResizeDialog = function()
{
  var height      = $("#resize-window-height");
  var heightValue = height.val().trim();
  var width       = $("#resize-window-width");
  var widthValue  = width.val().trim();
  var valid       = true;

  WebDeveloper.Overlay.Resize.resetResizeDialog($("#resize-window-dialog"));

  // If the height is not set
  if(!heightValue)
  {
    height.next().text(WebDeveloper.Locales.getString("heightCannotBeEmpty"));
    height.closest(".control-group").addClass("error");

    valid = false;
  }
  else if(heightValue != "*" && (parseInt(heightValue, 10) != heightValue || heightValue <= 0))
  {
    height.next().text(WebDeveloper.Locales.getString("heightNotValid"));
    height.closest(".control-group").addClass("error");

    valid = false;
  }

  // If the width is not set
  if(!widthValue)
  {
    width.next().text(WebDeveloper.Locales.getString("widthCannotBeEmpty"));
    width.closest(".control-group").addClass("error");

    valid = false;
  }
  else if(widthValue != "*" && (parseInt(widthValue, 10) != widthValue || widthValue <= 0))
  {
    width.next().text(WebDeveloper.Locales.getString("widthNotValid"));
    width.closest(".control-group").addClass("error");

    valid = false;
  }

  return valid;
};

// Displays the responsive layouts for the page
WebDeveloper.Overlay.Resize.viewResponsiveLayouts = function()
{
  WebDeveloper.Overlay.getSelectedTab(function(tab)
  {
    // If the tab is valid
    if(WebDeveloper.Overlay.isValidTab(tab))
    {
      var data        = {};
      var description = null;
      var height      = null;
      var layout      = null;
      var storage     = chrome.extension.getBackgroundPage().WebDeveloper.Storage;
      var width       = null;

      data.layouts             = [];
      data.pageURL             = tab.url;

      // Loop through the possible responsive options
      for(var i = 1, l = storage.getItem("responsive_layout_count"); i <= l; i++)
      {
        description = storage.getItem("responsive_layout_" + i + "_description");
        height      = storage.getItem("responsive_layout_" + i + "_height");
        width       = storage.getItem("responsive_layout_" + i + "_width");

        // If the description, height and width are set
        if(description && height > 0 && width > 0)
        {
          layout             = {};
          layout.description = description;
          layout.height      = height;
          layout.width       = width;

          data.layouts.push(layout);
        }
      }

      chrome.extension.getBackgroundPage().WebDeveloper.Background.openGeneratedTab(chrome.extension.getURL("generated/view-responsive-layouts.html"), tab.index, data, WebDeveloper.Overlay.Resize.getViewResponsiveLayoutsLocale());

      WebDeveloper.Overlay.close();
    }
  });
};
var WebDeveloper = WebDeveloper || {};

WebDeveloper.Overlay       = WebDeveloper.Overlay || {};
WebDeveloper.Overlay.Tools = WebDeveloper.Overlay.Tools || {};

$(function()
{
  $("#edit-tools").append(WebDeveloper.Locales.getString("editTools")).on("click", WebDeveloper.Overlay.Tools.editTools);
  $("#tools-menu").on("click", ".custom-tool", WebDeveloper.Overlay.Tools.customTool);
  $("#validate-local-css").append(WebDeveloper.Locales.getString("validateLocalCSS")).on("click", WebDeveloper.Overlay.Tools.validateLocalCSS);
  $("#validate-local-html").append(WebDeveloper.Locales.getString("validateLocalHTML")).on("click", WebDeveloper.Overlay.Tools.validateLocalHTML);
  $("#view-source").append(WebDeveloper.Locales.getString("viewSource")).on("click", WebDeveloper.Overlay.Tools.viewSource);

  WebDeveloper.Overlay.Tools.setupCustomTools();
});

// Opens a custom tool
WebDeveloper.Overlay.Tools.customTool = function()
{
  var featureItem = $(this);

  WebDeveloper.Overlay.getSelectedTab(function(tab)
  {
    WebDeveloper.Overlay.openTab(featureItem.data("url") + tab.url);

    WebDeveloper.Overlay.close();
  });
};

// Opens the options to edit the tools
WebDeveloper.Overlay.Tools.editTools = function()
{
  WebDeveloper.Overlay.openTab(chrome.extension.getURL("options/options.html#tools-tab"));
};

// Sets up the custom tools
WebDeveloper.Overlay.Tools.setupCustomTools = function()
{
  var description = null;
  var editTools   = $("#edit-tools").closest("li");
  var storage     = chrome.extension.getBackgroundPage().WebDeveloper.Storage;
  var tool        = null;
  var url         = 0;

  $(".custom-tool", $("#custom-tools")).remove();

  // Loop through the tools
  for(var i = 1, l = storage.getItem("tool_count"); i <= l; i++)
  {
    description = storage.getItem("tool_" + i + "_description");
    url         = storage.getItem("tool_" + i + "_url");

    // If the description and url are set
    if(description && url)
    {
      tool = {};

      tool.description = description;
      tool.url         = url;

      editTools.before(ich.customTool(tool));
    }
  }
};

// Validates the CSS of the local page
WebDeveloper.Overlay.Tools.validateLocalCSS = function()
{
  WebDeveloper.Overlay.getSelectedTab(function(tab)
  {
    // If the tab is valid
    if(WebDeveloper.Overlay.isValidTab(tab))
    {
      chrome.tabs.sendMessage(tab.id, {type: "get-css"}, function(data)
      {
        chrome.extension.getBackgroundPage().WebDeveloper.Background.validateLocalCSS(chrome.extension.getURL("validation/css.html"), tab.index, data);

        WebDeveloper.Overlay.close();
      });
    }
  });
};

// Validates the HTML of the local page
WebDeveloper.Overlay.Tools.validateLocalHTML = function()
{
  WebDeveloper.Overlay.getSelectedTab(function(tab)
  {
    // If the tab is valid
    if(WebDeveloper.Overlay.isValidTab(tab))
    {
      chrome.extension.getBackgroundPage().WebDeveloper.Background.validateLocalHTML(chrome.extension.getURL("validation/html.html"), tab.index, tab.url);

      WebDeveloper.Overlay.close();
    }
  });
};

// Displays the source of the page
WebDeveloper.Overlay.Tools.viewSource = function()
{
  WebDeveloper.Overlay.getSelectedTab(function(tab)
  {
    WebDeveloper.Overlay.openTab("view-source:" + tab.url);
  });
};
