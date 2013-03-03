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
/* =============================================================
 * bootstrap-collapse.js v2.2.2
 * http://twitter.github.com/bootstrap/javascript.html#collapse
 * =============================================================
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
 * ============================================================ */


!function ($) {

  "use strict"; // jshint ;_;


 /* COLLAPSE PUBLIC CLASS DEFINITION
  * ================================ */

  var Collapse = function (element, options) {
    this.$element = $(element)
    this.options = $.extend({}, $.fn.collapse.defaults, options)

    if (this.options.parent) {
      this.$parent = $(this.options.parent)
    }

    this.options.toggle && this.toggle()
  }

  Collapse.prototype = {

    constructor: Collapse

  , dimension: function () {
      var hasWidth = this.$element.hasClass('width')
      return hasWidth ? 'width' : 'height'
    }

  , show: function () {
      var dimension
        , scroll
        , actives
        , hasData

      if (this.transitioning) return

      dimension = this.dimension()
      scroll = $.camelCase(['scroll', dimension].join('-'))
      actives = this.$parent && this.$parent.find('> .accordion-group > .in')

      if (actives && actives.length) {
        hasData = actives.data('collapse')
        if (hasData && hasData.transitioning) return
        actives.collapse('hide')
        hasData || actives.data('collapse', null)
      }

      this.$element[dimension](0)
      this.transition('addClass', $.Event('show'), 'shown')
      $.support.transition && this.$element[dimension](this.$element[0][scroll])
    }

  , hide: function () {
      var dimension
      if (this.transitioning) return
      dimension = this.dimension()
      this.reset(this.$element[dimension]())
      this.transition('removeClass', $.Event('hide'), 'hidden')
      this.$element[dimension](0)
    }

  , reset: function (size) {
      var dimension = this.dimension()

      this.$element
        .removeClass('collapse')
        [dimension](size || 'auto')
        [0].offsetWidth

      this.$element[size !== null ? 'addClass' : 'removeClass']('collapse')

      return this
    }

  , transition: function (method, startEvent, completeEvent) {
      var that = this
        , complete = function () {
            if (startEvent.type == 'show') that.reset()
            that.transitioning = 0
            that.$element.trigger(completeEvent)
          }

      this.$element.trigger(startEvent)

      if (startEvent.isDefaultPrevented()) return

      this.transitioning = 1

      this.$element[method]('in')

      $.support.transition && this.$element.hasClass('collapse') ?
        this.$element.one($.support.transition.end, complete) :
        complete()
    }

  , toggle: function () {
      this[this.$element.hasClass('in') ? 'hide' : 'show']()
    }

  }


 /* COLLAPSE PLUGIN DEFINITION
  * ========================== */

  var old = $.fn.collapse

  $.fn.collapse = function (option) {
    return this.each(function () {
      var $this = $(this)
        , data = $this.data('collapse')
        , options = typeof option == 'object' && option
      if (!data) $this.data('collapse', (data = new Collapse(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  $.fn.collapse.defaults = {
    toggle: true
  }

  $.fn.collapse.Constructor = Collapse


 /* COLLAPSE NO CONFLICT
  * ==================== */

  $.fn.collapse.noConflict = function () {
    $.fn.collapse = old
    return this
  }


 /* COLLAPSE DATA-API
  * ================= */

  $(document).on('click.collapse.data-api', '[data-toggle=collapse]', function (e) {
    var $this = $(this), href
      , target = $this.attr('data-target')
        || e.preventDefault()
        || (href = $this.attr('href')) && href.replace(/.*(?=#[^\s]+$)/, '') //strip for ie7
      , option = $(target).data('collapse') ? 'toggle' : $this.data()
    $this[$(target).hasClass('in') ? 'addClass' : 'removeClass']('collapsed')
    $(target).collapse(option)
  })

}(window.jQuery);/* ============================================================
 * bootstrap-dropdown.js v2.2.2
 * http://twitter.github.com/bootstrap/javascript.html#dropdowns
 * ============================================================
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
 * ============================================================ */


!function ($) {

  "use strict"; // jshint ;_;


 /* DROPDOWN CLASS DEFINITION
  * ========================= */

  var toggle = '[data-toggle=dropdown]'
    , Dropdown = function (element) {
        var $el = $(element).on('click.dropdown.data-api', this.toggle)
        $('html').on('click.dropdown.data-api', function () {
          $el.parent().removeClass('open')
        })
      }

  Dropdown.prototype = {

    constructor: Dropdown

  , toggle: function (e) {
      var $this = $(this)
        , $parent
        , isActive

      if ($this.is('.disabled, :disabled')) return

      $parent = getParent($this)

      isActive = $parent.hasClass('open')

      clearMenus()

      if (!isActive) {
        $parent.toggleClass('open')
      }

      $this.focus()

      return false
    }

  , keydown: function (e) {
      var $this
        , $items
        , $active
        , $parent
        , isActive
        , index

      if (!/(38|40|27)/.test(e.keyCode)) return

      $this = $(this)

      e.preventDefault()
      e.stopPropagation()

      if ($this.is('.disabled, :disabled')) return

      $parent = getParent($this)

      isActive = $parent.hasClass('open')

      if (!isActive || (isActive && e.keyCode == 27)) return $this.click()

      $items = $('[role=menu] li:not(.divider):visible a', $parent)

      if (!$items.length) return

      index = $items.index($items.filter(':focus'))

      if (e.keyCode == 38 && index > 0) index--                                        // up
      if (e.keyCode == 40 && index < $items.length - 1) index++                        // down
      if (!~index) index = 0

      $items
        .eq(index)
        .focus()
    }

  }

  function clearMenus() {
    $(toggle).each(function () {
      getParent($(this)).removeClass('open')
    })
  }

  function getParent($this) {
    var selector = $this.attr('data-target')
      , $parent

    if (!selector) {
      selector = $this.attr('href')
      selector = selector && /#/.test(selector) && selector.replace(/.*(?=#[^\s]*$)/, '') //strip for ie7
    }

    $parent = $(selector)
    $parent.length || ($parent = $this.parent())

    return $parent
  }


  /* DROPDOWN PLUGIN DEFINITION
   * ========================== */

  var old = $.fn.dropdown

  $.fn.dropdown = function (option) {
    return this.each(function () {
      var $this = $(this)
        , data = $this.data('dropdown')
      if (!data) $this.data('dropdown', (data = new Dropdown(this)))
      if (typeof option == 'string') data[option].call($this)
    })
  }

  $.fn.dropdown.Constructor = Dropdown


 /* DROPDOWN NO CONFLICT
  * ==================== */

  $.fn.dropdown.noConflict = function () {
    $.fn.dropdown = old
    return this
  }


  /* APPLY TO STANDARD DROPDOWN ELEMENTS
   * =================================== */

  $(document)
    .on('click.dropdown.data-api touchstart.dropdown.data-api', clearMenus)
    .on('click.dropdown touchstart.dropdown.data-api', '.dropdown form', function (e) { e.stopPropagation() })
    .on('touchstart.dropdown.data-api', '.dropdown-menu', function (e) { e.stopPropagation() })
    .on('click.dropdown.data-api touchstart.dropdown.data-api'  , toggle, Dropdown.prototype.toggle)
    .on('keydown.dropdown.data-api touchstart.dropdown.data-api', toggle + ', [role=menu]' , Dropdown.prototype.keydown)

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

WebDeveloper.Generated                    = WebDeveloper.Generated || {};
WebDeveloper.Generated.animationSpeed     = 200;
WebDeveloper.Generated.maximumURLLength   = 100;
WebDeveloper.Generated.syntaxHighlighters = [];

// Adds a document
WebDeveloper.Generated.addDocument = function(documentURL, documentCount, itemDescription, itemCount)
{
  var childElement = document.createElement("a");
  var element      = document.createElement("h2");
  var fragment     = document.createDocumentFragment();

  childElement.appendChild(document.createTextNode(documentURL));

  childElement.setAttribute("href", documentURL);
  element.setAttribute("id", "document-" + (documentCount + 1));
  element.appendChild(childElement);
  fragment.appendChild(element);

  element      = document.createElement("li");
  childElement = document.createElement("a");

  childElement.appendChild(document.createTextNode(WebDeveloper.Generated.formatURL(documentURL)));
  childElement.setAttribute("href", "#document-" + (documentCount + 1));
  element.appendChild(childElement);
  $(".dropdown-menu", $("#documents-dropdown")).get(0).appendChild(element);

  // If the item description is set
  if(itemDescription)
  {
    element = document.createElement("h3");

    // If there are items
    if(itemCount !== 0)
    {
      childElement = document.createElement("i");

      childElement.setAttribute("class", "icon-caret-down");
      element.appendChild(childElement);
    }

    element.appendChild(document.createTextNode(itemCount + " " + itemDescription));
    fragment.appendChild(element);
  }

  document.getElementById("content").appendChild(fragment);
};

// Adds a separator
WebDeveloper.Generated.addSeparator = function()
{
  var separator = document.createElement("div");

  separator.setAttribute("class", "web-developer-separator");
  document.getElementById("content").appendChild(separator);
};

// Changes the syntax highlight theme
WebDeveloper.Generated.changeSyntaxHighlightTheme = function(event)
{
  var themeMenu = $(this);
  var themeIcon = $("i", themeMenu);

  // If this is not the current theme
  if(themeIcon.hasClass("icon-empty"))
  {
    var theme = themeMenu.attr("id").replace("web-developer-syntax-highlighting-", "");

    // If there is no theme
    if(theme == "none")
    {
      $(".CodeMirror").hide();
      $(".web-developer-syntax-highlight").show();
    }
    else if(WebDeveloper.Generated.syntaxHighlighters.length)
    {
      $(".CodeMirror").show();
      $(".web-developer-syntax-highlight").hide();

      // Loop through the syntax highlighters
      for(var i = 0, l = WebDeveloper.Generated.syntaxHighlighters.length; i < l; i++)
      {
        WebDeveloper.Generated.syntaxHighlighters[i].setOption("theme", theme);
      }
    }
    else
    {
      WebDeveloper.Generated.initializeSyntaxHighlight(theme);
    }

    $(".dropdown-menu .icon-ok", $("#web-developer-syntax-highlighting-dropdown")).removeClass("icon-ok").addClass("icon-empty");
    themeIcon.removeClass("icon-empty").addClass("icon-ok");
  }

  event.preventDefault();
};

// Collapses all the output
WebDeveloper.Generated.collapseAllOutput = function(event)
{
  // Loop through the output headers
  $("h3").each(function()
  {
    var header = $(this);

    $("i", header).removeClass("icon-caret-down").addClass("icon-caret-right");
    header.next().slideUp(WebDeveloper.Generated.animationSpeed);
  });

  event.preventDefault();
};

// Empties the content
WebDeveloper.Generated.emptyContent = function()
{
  $(".progress", $("#content")).remove();
};

// Expands all the output
WebDeveloper.Generated.expandAllOutput = function(event)
{
  // Loop through the output headers
  $("h3").each(function()
  {
    var header = $(this);

    $("i", header).removeClass("icon-caret-right").addClass("icon-caret-down");
    header.next().slideDown(WebDeveloper.Generated.animationSpeed);
  });

  // If the event is set
  if(event)
  {
    event.preventDefault();
  }
};

// Formats a URL
WebDeveloper.Generated.formatURL = function(url)
{
  // If the URL is set
  if(url && url.length > WebDeveloper.Generated.maximumURLLength)
  {
    var halfLength = WebDeveloper.Generated.maximumURLLength / 2;

    return url.substring(0, halfLength) + "..." + url.substr(-halfLength);
  }

  return url;
};

// Generates a document container
WebDeveloper.Generated.generateDocumentContainer = function()
{
  var documentContainer = document.createElement("div");

  documentContainer.setAttribute("class", "web-developer-document");

  return documentContainer;
};

// Initializes the common page elements
WebDeveloper.Generated.initializeCommonElements = function()
{
  $("i", $("h3")).on("click", WebDeveloper.Generated.toggleOutput);
  $("#web-developer-collapse-all").on("click", WebDeveloper.Generated.collapseAllOutput);
  $("#web-developer-expand-all").on("click", WebDeveloper.Generated.expandAllOutput);

  // If there is a nav bar
  if($(".navbar").length)
  {
    $(".dropdown-toggle").dropdown();
  }
};

// Initializes the syntax highlight functionality
WebDeveloper.Generated.initializeSyntaxHighlight = function(color, locale)
{
  // If the locale is set
  if(locale)
  {
    $(".dropdown-toggle", $("#web-developer-syntax-highlighting-dropdown")).prepend(locale.syntaxHighlighting);
    $("#web-developer-syntax-highlighting-dark").append(locale.dark);
    $("#web-developer-syntax-highlighting-light").append(locale.light);
    $("#web-developer-syntax-highlighting-none").append(locale.none);

    $(".dropdown-menu a", $("#web-developer-syntax-highlighting-dropdown")).on("click", WebDeveloper.Generated.changeSyntaxHighlightTheme);
    $("i", $("#web-developer-syntax-highlighting-" + color)).removeClass("icon-empty").addClass("icon-ok");
  }

  // If a color is set
  if(color != "none")
  {
    // Loop through the syntax highlight elements
    $(".web-developer-syntax-highlight").each(function()
    {
      var pre = $(this);

      window.setTimeout(function()
      {
        WebDeveloper.Generated.syntaxHighlighters.push(CodeMirror(function(element)
        {
          pre.after(element);
          pre.hide();
        },
        {
          lineNumbers: pre.data("line-numbers"),
          mode: pre.data("type"),
          readOnly: true,
          tabSize: 2,
          theme: color,
          value: pre.text()
        }));
      }, 0);
    });
  }
};

// Initializes the page with JSON data
WebDeveloper.Generated.initializeWithJSON = function(event)
{
  var eventTarget = event.target;

  WebDeveloper.Generated.initialize(JSON.parse(eventTarget.getAttribute("data-web-developer")), JSON.parse(eventTarget.getAttribute("data-web-developer-locale")));

  eventTarget.removeAttribute("data-web-developer");
  eventTarget.removeAttribute("data-web-developer-locale");

  window.removeEventListener("web-developer-generated-event", WebDeveloper.Generated.initializeWithJSON, false);
};

// Localizes the header
WebDeveloper.Generated.localizeHeader = function(locale)
{
  $("#web-developer-collapse-all").text(locale.collapseAll);
  $("#web-developer-expand-all").text(locale.expandAll);
  $(".dropdown-toggle", $("#documents-dropdown")).prepend(locale.documents);
  $("span.brand").text(locale.webDeveloper);
};

// Outputs content
WebDeveloper.Generated.output = function(title, url, anchor, type, outputOriginal)
{
  var childElement      = document.createElement("i");
  var container         = document.createElement("pre");
  var content           = document.getElementById("content");
  var documentContainer = WebDeveloper.Generated.generateDocumentContainer();
  var element           = document.createElement("h3");
  var outputContainers  = [];
  var outputTitle       = title;

  childElement.setAttribute("class", "icon-caret-down");
  element.appendChild(childElement);
  element.setAttribute("id", anchor);

  // If the URL is set
  if(url)
  {
    childElement = document.createElement("a");
    outputTitle  = WebDeveloper.Generated.formatURL(url);

    childElement.appendChild(document.createTextNode(outputTitle));
    childElement.setAttribute("href", url);
    element.appendChild(childElement);
  }
  else
  {
    element.appendChild(document.createTextNode(outputTitle));
  }

  content.appendChild(element);

  childElement = document.createElement("a");
  element      = document.createElement("li");

  childElement.appendChild(document.createTextNode(outputTitle));
  childElement.setAttribute("href", "#" + anchor);
  element.appendChild(childElement);
  $(".dropdown-menu", $("#files-dropdown")).get(0).appendChild(element);

  container.setAttribute("class", "web-developer-syntax-highlight");
  container.setAttribute("data-line-numbers", "true");
  container.setAttribute("data-type", type);
  documentContainer.appendChild(container);
  outputContainers.push($(container));

  // If the original should be output
  if(outputOriginal)
  {
    var originalContainer = document.createElement("pre");

    originalContainer.setAttribute("class", "web-developer-original");
    documentContainer.appendChild(originalContainer);
    outputContainers.push($(originalContainer));
  }

  content.appendChild(documentContainer);
  WebDeveloper.Generated.addSeparator();

  return outputContainers;
};

// Sets the page title
WebDeveloper.Generated.setPageTitle = function(type, data, locale)
{
  document.title = type + " " + locale.from.toLowerCase() + " " + WebDeveloper.Generated.formatURL(data.pageURL);

  $("a.brand", $(".navbar")).text(type);
};

// Toggles the collapsed state of an output
WebDeveloper.Generated.toggleOutput = function()
{
  $(this).toggleClass("icon-caret-down").toggleClass("icon-caret-right").parent().next().slideToggle(WebDeveloper.Generated.animationSpeed);
};

window.addEventListener("web-developer-generated-event", WebDeveloper.Generated.initializeWithJSON, false);
