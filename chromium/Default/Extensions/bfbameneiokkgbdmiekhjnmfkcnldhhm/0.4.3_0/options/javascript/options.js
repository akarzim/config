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
/* =========================================================
 * bootstrap-modal.js v2.2.2
 * http://twitter.github.com/bootstrap/javascript.html#modals
 * =========================================================
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
 * ========================================================= */


!function ($) {

  "use strict"; // jshint ;_;


 /* MODAL CLASS DEFINITION
  * ====================== */

  var Modal = function (element, options) {
    this.options = options
    this.$element = $(element)
      .delegate('[data-dismiss="modal"]', 'click.dismiss.modal', $.proxy(this.hide, this))
    this.options.remote && this.$element.find('.modal-body').load(this.options.remote)
  }

  Modal.prototype = {

      constructor: Modal

    , toggle: function () {
        return this[!this.isShown ? 'show' : 'hide']()
      }

    , show: function () {
        var that = this
          , e = $.Event('show')

        this.$element.trigger(e)

        if (this.isShown || e.isDefaultPrevented()) return

        this.isShown = true

        this.escape()

        this.backdrop(function () {
          var transition = $.support.transition && that.$element.hasClass('fade')

          if (!that.$element.parent().length) {
            that.$element.appendTo(document.body) //don't move modals dom position
          }

          that.$element
            .show()

          if (transition) {
            that.$element[0].offsetWidth // force reflow
          }

          that.$element
            .addClass('in')
            .attr('aria-hidden', false)

          that.enforceFocus()

          transition ?
            that.$element.one($.support.transition.end, function () { that.$element.focus().trigger('shown') }) :
            that.$element.focus().trigger('shown')

        })
      }

    , hide: function (e) {
        e && e.preventDefault()

        var that = this

        e = $.Event('hide')

        this.$element.trigger(e)

        if (!this.isShown || e.isDefaultPrevented()) return

        this.isShown = false

        this.escape()

        $(document).off('focusin.modal')

        this.$element
          .removeClass('in')
          .attr('aria-hidden', true)

        $.support.transition && this.$element.hasClass('fade') ?
          this.hideWithTransition() :
          this.hideModal()
      }

    , enforceFocus: function () {
        var that = this
        $(document).on('focusin.modal', function (e) {
          if (that.$element[0] !== e.target && !that.$element.has(e.target).length) {
            that.$element.focus()
          }
        })
      }

    , escape: function () {
        var that = this
        if (this.isShown && this.options.keyboard) {
          this.$element.on('keyup.dismiss.modal', function ( e ) {
            e.which == 27 && that.hide()
          })
        } else if (!this.isShown) {
          this.$element.off('keyup.dismiss.modal')
        }
      }

    , hideWithTransition: function () {
        var that = this
          , timeout = setTimeout(function () {
              that.$element.off($.support.transition.end)
              that.hideModal()
            }, 500)

        this.$element.one($.support.transition.end, function () {
          clearTimeout(timeout)
          that.hideModal()
        })
      }

    , hideModal: function (that) {
        this.$element
          .hide()
          .trigger('hidden')

        this.backdrop()
      }

    , removeBackdrop: function () {
        this.$backdrop.remove()
        this.$backdrop = null
      }

    , backdrop: function (callback) {
        var that = this
          , animate = this.$element.hasClass('fade') ? 'fade' : ''

        if (this.isShown && this.options.backdrop) {
          var doAnimate = $.support.transition && animate

          this.$backdrop = $('<div class="modal-backdrop ' + animate + '" />')
            .appendTo(document.body)

          this.$backdrop.click(
            this.options.backdrop == 'static' ?
              $.proxy(this.$element[0].focus, this.$element[0])
            : $.proxy(this.hide, this)
          )

          if (doAnimate) this.$backdrop[0].offsetWidth // force reflow

          this.$backdrop.addClass('in')

          doAnimate ?
            this.$backdrop.one($.support.transition.end, callback) :
            callback()

        } else if (!this.isShown && this.$backdrop) {
          this.$backdrop.removeClass('in')

          $.support.transition && this.$element.hasClass('fade')?
            this.$backdrop.one($.support.transition.end, $.proxy(this.removeBackdrop, this)) :
            this.removeBackdrop()

        } else if (callback) {
          callback()
        }
      }
  }


 /* MODAL PLUGIN DEFINITION
  * ======================= */

  var old = $.fn.modal

  $.fn.modal = function (option) {
    return this.each(function () {
      var $this = $(this)
        , data = $this.data('modal')
        , options = $.extend({}, $.fn.modal.defaults, $this.data(), typeof option == 'object' && option)
      if (!data) $this.data('modal', (data = new Modal(this, options)))
      if (typeof option == 'string') data[option]()
      else if (options.show) data.show()
    })
  }

  $.fn.modal.defaults = {
      backdrop: true
    , keyboard: true
    , show: true
  }

  $.fn.modal.Constructor = Modal


 /* MODAL NO CONFLICT
  * ================= */

  $.fn.modal.noConflict = function () {
    $.fn.modal = old
    return this
  }


 /* MODAL DATA-API
  * ============== */

  $(document).on('click.modal.data-api', '[data-toggle="modal"]', function (e) {
    var $this = $(this)
      , href = $this.attr('href')
      , $target = $($this.attr('data-target') || (href && href.replace(/.*(?=#[^\s]+$)/, ''))) //strip for ie7
      , option = $target.data('modal') ? 'toggle' : $.extend({ remote:!/#/.test(href) && href }, $target.data(), $this.data())

    e.preventDefault()

    $target
      .modal(option)
      .one('hide', function () {
        $this.focus()
      })
  })

}(window.jQuery);
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

WebDeveloper.Options                = WebDeveloper.Options || {};
WebDeveloper.Options.animationSpeed = 100;

$(function()
{
  var hash   = window.location.hash;
  var option = WebDeveloper.Storage.getItem("option");

  WebDeveloper.Options.initialize();

  // If the hash is set
  if(hash)
  {
    $("a", $(hash)).tab("show");
    WebDeveloper.Storage.setItem("option", hash);
  }
  else if(option)
  {
    $("a", $("#" + option)).tab("show");
  }

  $("li", $(".nav-tabs")).on("click", WebDeveloper.Options.changeTab);
});

// Handles a tab change
WebDeveloper.Options.changeTab = function()
{
  WebDeveloper.Storage.setItem("option", $(this).attr("id"));
};

// Closes the option
WebDeveloper.Options.closeOption = function(options, form, clearCallback)
{
  form.slideUp(WebDeveloper.Options.animationSpeed, function()
  {
    $(".table-container", options).slideDown(WebDeveloper.Options.animationSpeed);

    clearCallback();

    form.removeData("position");
  });
};

// Closes the resize option
WebDeveloper.Options.closeResizeOption = function()
{
  var resizeOptions = $("#resize-options");

  WebDeveloper.Options.closeOption(resizeOptions, $("form", resizeOptions), function()
  {
    $("#resize-description").val("");
    $("#resize-width").val("");
    $("#resize-height").val("");
  });
};

// Closes the responsive layout
WebDeveloper.Options.closeResponsiveLayout = function()
{
  var responsiveLayoutOptions = $("#responsive-layouts-options");

  WebDeveloper.Options.closeOption(responsiveLayoutOptions, $("form", responsiveLayoutOptions), function()
  {
    $("#responsive-layout-description").val("");
    $("#responsive-layout-width").val("");
    $("#responsive-layout-height").val("");
  });
};

// Closes the tool
WebDeveloper.Options.closeTool = function()
{
  var toolOptions = $("#tools-options");

  WebDeveloper.Options.closeOption(toolOptions, $("form", toolOptions), function()
  {
    $("#tool-description").val("");
    $("#tool-url").val("");
  });
};

// Deletes an option
WebDeveloper.Options.deleteOption = function(option, title, confirmation, updateCallback)
{
  var deleteDialog = $("#delete-dialog");

  $("h3", deleteDialog).text(title);
  $("p", deleteDialog).text(confirmation);

  $(".btn-danger", deleteDialog).off("click").on("click", function()
  {
    option.remove();
    deleteDialog.modal("hide");
    updateCallback();
  });

  deleteDialog.modal("show");
};

// Deletes a resize option
WebDeveloper.Options.deleteResizeOption = function()
{
  var resizeOption = $(this).closest("tr");

  WebDeveloper.Options.deleteOption(resizeOption, WebDeveloper.Locales.getString("deleteResizeOption"), WebDeveloper.Locales.getFormattedString("deleteResizeOptionConfirmation", [$("td:eq(0)", resizeOption).text()]), WebDeveloper.Options.updateResizeOptions);
};

// Deletes a responsive layout
WebDeveloper.Options.deleteResponsiveLayout = function()
{
  var responsiveLayout = $(this).closest("tr");

  WebDeveloper.Options.deleteOption(responsiveLayout, WebDeveloper.Locales.getString("deleteResponsiveLayout"), WebDeveloper.Locales.getFormattedString("deleteResponsiveLayoutConfirmation", [$("td:eq(0)", responsiveLayout).text()]), WebDeveloper.Options.updateResponsiveLayouts);
};

// Deletes a tool
WebDeveloper.Options.deleteTool = function()
{
  var tool = $(this).closest("tr");

  WebDeveloper.Options.deleteOption(tool, WebDeveloper.Locales.getString("deleteTool"), WebDeveloper.Locales.getFormattedString("deleteToolConfirmation", [$("td:eq(0)", tool).text()]), WebDeveloper.Options.updateTools);
};

// Displays the option form
WebDeveloper.Options.displayOptionForm = function(options, addTitle, addLabel, editTitle, editLabel)
{
  // If in edit mode
  if($("form", options).data("position"))
  {
    $("legend", options).text(editTitle);
    $("form .btn-primary > span", options).text(editLabel);
  }
  else
  {
    $("legend", options).text(addTitle);
    $("form .btn-primary > span", options).text(addLabel);
  }

  $(".table-container", options).slideUp(WebDeveloper.Options.animationSpeed, function()
  {
    $("form", options).slideDown(WebDeveloper.Options.animationSpeed);
  });
};

// Displays the resize option form
WebDeveloper.Options.displayResizeOptionForm = function()
{
  var resizeOptions = $("#resize-options");

  WebDeveloper.Options.resetOptionForm($("#resize-form"));
  WebDeveloper.Options.displayOptionForm(resizeOptions, WebDeveloper.Locales.getString("addResizeOption"), WebDeveloper.Locales.getString("add"), WebDeveloper.Locales.getString("editResizeOption"), WebDeveloper.Locales.getString("save"));
};

// Displays the responsive layout form
WebDeveloper.Options.displayResponsiveLayoutForm = function()
{
  var responsiveLayoutsOptions = $("#responsive-layouts-options");

  WebDeveloper.Options.resetOptionForm($("#responsive-layout-form"));
  WebDeveloper.Options.displayOptionForm(responsiveLayoutsOptions, WebDeveloper.Locales.getString("addResponsiveLayout"), WebDeveloper.Locales.getString("add"), WebDeveloper.Locales.getString("editResponsiveLayout"), WebDeveloper.Locales.getString("save"));
};

// Displays the tool form
WebDeveloper.Options.displayToolForm = function()
{
  var toolsOptions = $("#tools-options");

  WebDeveloper.Options.resetOptionForm($("#tool-form"));
  WebDeveloper.Options.displayOptionForm(toolsOptions, WebDeveloper.Locales.getString("addTool"), WebDeveloper.Locales.getString("add"), WebDeveloper.Locales.getString("editTool"), WebDeveloper.Locales.getString("save"));
};

// Edits a resize option
WebDeveloper.Options.editResizeOption = function()
{
  var resizeOptionPosition = $(this).closest("tr").prevAll().length + 1;

  $("#resize-description").val(WebDeveloper.Storage.getItem("resize_" + resizeOptionPosition + "_description"));
  $("#resize-width").val(WebDeveloper.Storage.getItem("resize_" + resizeOptionPosition + "_width"));
  $("#resize-height").val(WebDeveloper.Storage.getItem("resize_" + resizeOptionPosition + "_height"));

  $("#resize-form").data("position", resizeOptionPosition);

  WebDeveloper.Options.displayResizeOptionForm();
};

// Edits a responsive layout
WebDeveloper.Options.editResponsiveLayout = function()
{
  var responsiveLayoutPosition = $(this).closest("tr").prevAll().length + 1;

  $("#responsive-layout-description").val(WebDeveloper.Storage.getItem("responsive_layout_" + responsiveLayoutPosition + "_description"));
  $("#responsive-layout-width").val(WebDeveloper.Storage.getItem("responsive_layout_" + responsiveLayoutPosition + "_width"));
  $("#responsive-layout-height").val(WebDeveloper.Storage.getItem("responsive_layout_" + responsiveLayoutPosition + "_height"));

  $("#responsive-layout-form").data("position", responsiveLayoutPosition);

  WebDeveloper.Options.displayResponsiveLayoutForm();
};

// Edits a tool
WebDeveloper.Options.editTool = function()
{
  var toolPosition = $(this).closest("tr").prevAll().length + 1;

  $("#tool-description").val(WebDeveloper.Storage.getItem("tool_" + toolPosition + "_description"));
  $("#tool-url").val(WebDeveloper.Storage.getItem("tool_" + toolPosition + "_url"));

  $("#tool-form").data("position", toolPosition);

  WebDeveloper.Options.displayToolForm();
};

// Initializes the options
WebDeveloper.Options.initialize = function()
{
  WebDeveloper.Options.localize();
  WebDeveloper.Options.initializeColorsTab();
  WebDeveloper.Options.initializeResizeTab();
  WebDeveloper.Options.initializeResponsiveLayoutsTab();
  WebDeveloper.Options.initializeToolsTab();
  WebDeveloper.Options.initializeAdvancedTab();
};

// Initializes the advanced tab
WebDeveloper.Options.initializeAdvancedTab = function()
{
  $("#populate_email_address").val(WebDeveloper.Storage.getItem("populate_email_address")).on("change", WebDeveloper.Options.updatePopulateEmailAddress);
};

// Initializes the colors tab
WebDeveloper.Options.initializeColorsTab = function()
{
  $("#syntax_highlight_theme").val(WebDeveloper.Storage.getItem("syntax_highlight_theme")).on("change", WebDeveloper.Options.updateSyntaxHighlightTheme);
  $("#syntax-highlight-browser").on("load", WebDeveloper.Options.updateSyntaxHighlightTheme);
  $("#icon_color").prop("checked", WebDeveloper.Storage.getItem("icon_color") == "true").on("change", WebDeveloper.Options.updateIconColor);
};

// Initializes the resize tab
WebDeveloper.Options.initializeResizeTab = function()
{
  var description        = null;
  var height             = 0;
  var resizeOption       = null;
  var resizeOptionCount  = WebDeveloper.Storage.getItem("resize_count");
  var resizeOptions      = $("#resize-options");
  var resizeOptionsTable = $("tbody", resizeOptions);
  var width              = 0;

  resizeOptionsTable.empty();

  // Loop through the resize options
  for(var i = 1, l = resizeOptionCount; i <= l; i++)
  {
    description = WebDeveloper.Storage.getItem("resize_" + i + "_description");
    height      = WebDeveloper.Storage.getItem("resize_" + i + "_height");
    width       = WebDeveloper.Storage.getItem("resize_" + i + "_width");

    // If the description, height and width are set
    if(description && height > 0 && width > 0)
    {
      resizeOption = {};

      resizeOption.description = description;
      resizeOption.height      = height;
      resizeOption.width       = width;

      resizeOptionsTable.append(ich.resizeOption(resizeOption));
    }
  }

  // If there is only one resize option
  if(resizeOptionCount == 1)
  {
    resizeOptionsTable.addClass("single");
  }

  $(".btn-danger > span", resizeOptionsTable).text(WebDeveloper.Locales.getString("deleteConfirmation"));
  $(".btn-primary > span", resizeOptionsTable).text(WebDeveloper.Locales.getString("edit"));

  resizeOptionsTable.on("click", ".btn-danger", WebDeveloper.Options.deleteResizeOption);
  resizeOptionsTable.on("click", ".btn-primary", WebDeveloper.Options.editResizeOption);
  $("table", resizeOptions).tableDnD({ "onDragStart": WebDeveloper.Options.tableDragStart, "onDrop": WebDeveloper.Options.updateResizeOptions });
  $(".table-container > .btn-primary", resizeOptions).on("click", WebDeveloper.Options.displayResizeOptionForm);

  $("#resize-form").on("submit", function(event) { event.preventDefault(); });
  $("#resize-submit").on("click", WebDeveloper.Options.submitResizeOption);
  $("#resize-cancel").on("click", WebDeveloper.Options.closeResizeOption);
};

// Initializes the responsive layouts tab
WebDeveloper.Options.initializeResponsiveLayoutsTab = function()
{
  var description            = null;
  var height                 = 0;
  var responsiveLayout       = null;
  var responsiveLayoutsCount = WebDeveloper.Storage.getItem("responsive_layout_count");
  var responsiveLayouts      = $("#responsive-layouts-options");
  var responsiveLayoutsTable = $("tbody", responsiveLayouts);
  var width                  = 0;

  responsiveLayoutsTable.empty();

  // Loop through the responsive layouts
  for(var i = 1, l = responsiveLayoutsCount; i <= l; i++)
  {
    description = WebDeveloper.Storage.getItem("responsive_layout_" + i + "_description");
    height      = WebDeveloper.Storage.getItem("responsive_layout_" + i + "_height");
    width       = WebDeveloper.Storage.getItem("responsive_layout_" + i + "_width");

    // If the description, height and width are set
    if(description && height > 0 && width > 0)
    {
      responsiveLayout = {};

      responsiveLayout.description = description;
      responsiveLayout.height      = height;
      responsiveLayout.width       = width;

      responsiveLayoutsTable.append(ich.responsiveLayout(responsiveLayout));
    }
  }

  // If there is only one responsive layout
  if(responsiveLayoutsCount == 1)
  {
    responsiveLayoutsTable.addClass("single");
  }

  $(".btn-danger > span", responsiveLayoutsTable).text(WebDeveloper.Locales.getString("deleteConfirmation"));
  $(".btn-primary > span", responsiveLayoutsTable).text(WebDeveloper.Locales.getString("edit"));

  responsiveLayoutsTable.on("click", ".btn-danger", WebDeveloper.Options.deleteResponsiveLayout);
  responsiveLayoutsTable.on("click", ".btn-primary", WebDeveloper.Options.editResponsiveLayout);
  $("table", responsiveLayouts).tableDnD({ "onDragStart": WebDeveloper.Options.tableDragStart, "onDrop": WebDeveloper.Options.updateResponsiveLayouts });
  $(".table-container > .btn-primary", responsiveLayouts).on("click", WebDeveloper.Options.displayResponsiveLayoutForm);

  $("#responsive-layout-form").on("submit", function(event) { event.preventDefault(); });
  $("#responsive-layout-submit").on("click", WebDeveloper.Options.submitResponsiveLayout);
  $("#responsive-layout-cancel").on("click", WebDeveloper.Options.closeResponsiveLayout);
};

// Initializes the tools tab
WebDeveloper.Options.initializeToolsTab = function()
{
  var description = null;
  var tool        = null;
  var toolsCount  = WebDeveloper.Storage.getItem("tool_count");
  var tools       = $("#tools-options");
  var toolsTable  = $("tbody", tools);
  var url         = null;

  toolsTable.empty();

  // Loop through the tools
  for(var i = 1, l = toolsCount; i <= l; i++)
  {
    description = WebDeveloper.Storage.getItem("tool_" + i + "_description");
    url         = WebDeveloper.Storage.getItem("tool_" + i + "_url");

    // If the description and url are set
    if(description && url)
    {
      tool = {};

      tool.description = description;
      tool.url         = url;

      toolsTable.append(ich.tool(tool));
    }
  }

  // If there is only one tool
  if(toolsCount == 1)
  {
    toolsCount.addClass("single");
  }

  $(".btn-danger > span", toolsTable).text(WebDeveloper.Locales.getString("deleteConfirmation"));
  $(".btn-primary > span", toolsTable).text(WebDeveloper.Locales.getString("edit"));

  toolsTable.on("click", ".btn-danger", WebDeveloper.Options.deleteTool);
  toolsTable.on("click", ".btn-primary", WebDeveloper.Options.editTool);
  $("table", tools).tableDnD({ "onDragStart": WebDeveloper.Options.tableDragStart, "onDrop": WebDeveloper.Options.updateTools });
  $(".table-container > .btn-primary", tools).on("click", WebDeveloper.Options.displayToolForm);

  $("#tool-form").on("submit", function(event) { event.preventDefault(); });
  $("#tool-submit").on("click", WebDeveloper.Options.submitTool);
  $("#tool-cancel").on("click", WebDeveloper.Options.closeTool);
};

// Localizes the options
WebDeveloper.Options.localize = function()
{
  var deleteDialog = $("#delete-dialog");

  $("title").text(WebDeveloper.Locales.getString("extensionName") + " " + WebDeveloper.Locales.getString("options"));
  $("a.brand", $(".navbar")).text(WebDeveloper.Locales.getString("options"));

  $("a", $("#advanced-tab")).append(WebDeveloper.Locales.getString("advanced"));
  $("a", $("#colors-tab")).append(WebDeveloper.Locales.getString("colors"));
  $("a", $("#resize-tab")).append(WebDeveloper.Locales.getString("resize"));
  $("a", $("#responsive-layouts-tab")).append(WebDeveloper.Locales.getString("responsive"));
  $("a", $("#tools-tab")).append(WebDeveloper.Locales.getString("tools"));

  $('button[data-dismiss="modal"]', deleteDialog).text(WebDeveloper.Locales.getString("cancel"));
  $(".btn-danger", deleteDialog).append(WebDeveloper.Locales.getString("delete"));

  WebDeveloper.Options.localizeColorsTab();
  WebDeveloper.Options.localizeResizeTab();
  WebDeveloper.Options.localizeResponsiveLayoutsTab();
  WebDeveloper.Options.localizeToolsTab();
  WebDeveloper.Options.localizeAdvancedTab();
};

// Localizes the advanced tab
WebDeveloper.Options.localizeAdvancedTab = function()
{
  $('[for="populate_email_address"]').text(WebDeveloper.Locales.getString("populateEmailAddress"));
};

// Localizes the colors tab
WebDeveloper.Options.localizeColorsTab = function()
{
  $('#syntax-highlight-performance').text(WebDeveloper.Locales.getString("syntaxHighlightPerformance"));

  $('[for="syntax_highlight_theme"]').text(WebDeveloper.Locales.getString("syntaxHighlightTheme"));
  $('#icon_color').after(WebDeveloper.Locales.getString("displayExtensionIconColor"));

  $('[value="dark"]').text(WebDeveloper.Locales.getString("dark"));
  $('[value="light"]').text(WebDeveloper.Locales.getString("light"));
  $('[value="none"]').text(WebDeveloper.Locales.getString("none"));

  $('#preview').text(WebDeveloper.Locales.getString("preview"));
};

// Localizes the resize tab
WebDeveloper.Options.localizeResizeTab = function()
{
  var resizeOptions = $("#resize-options");

  $("th:eq(0)", resizeOptions).text(WebDeveloper.Locales.getString("description"));
  $("th:eq(1)", resizeOptions).text(WebDeveloper.Locales.getString("width"));
  $("th:eq(2)", resizeOptions).text(WebDeveloper.Locales.getString("height"));
  $("th:eq(3)", resizeOptions).text(WebDeveloper.Locales.getString("keyboard"));
  $("th:eq(4)", resizeOptions).text(WebDeveloper.Locales.getString("actions"));

  $(".muted", resizeOptions).text(WebDeveloper.Locales.getString("dragDropReorder"));
  $(".table-container > .btn-primary", resizeOptions).append(WebDeveloper.Locales.getString("addLabel"));

  $("#resize-cancel").text(WebDeveloper.Locales.getString("cancel"));
  $("#resize-description").attr("placeholder", WebDeveloper.Locales.getString("descriptionPlaceholder"));
  $("#resize-height").attr("placeholder", WebDeveloper.Locales.getString("heightPlaceholder"));
  $("#resize-width").attr("placeholder", WebDeveloper.Locales.getString("widthPlaceholder"));
  $('[for="resize-description"]').text(WebDeveloper.Locales.getString("description"));
  $('[for="resize-height"]').text(WebDeveloper.Locales.getString("height"));
  $('[for="resize-width"]').text(WebDeveloper.Locales.getString("width"));
};

// Localizes the responsive layouts tab
WebDeveloper.Options.localizeResponsiveLayoutsTab = function()
{
  var responsiveLayouts = $("#responsive-layouts-options");

  $("th:eq(0)", responsiveLayouts).text(WebDeveloper.Locales.getString("description"));
  $("th:eq(1)", responsiveLayouts).text(WebDeveloper.Locales.getString("width"));
  $("th:eq(2)", responsiveLayouts).text(WebDeveloper.Locales.getString("height"));
  $("th:eq(3)", responsiveLayouts).text(WebDeveloper.Locales.getString("actions"));

  $(".muted", responsiveLayouts).text(WebDeveloper.Locales.getString("dragDropReorder"));
  $(".table-container > .btn-primary", responsiveLayouts).append(WebDeveloper.Locales.getString("addLabel"));

  $("#responsive-layout-cancel").text(WebDeveloper.Locales.getString("cancel"));
  $("#responsive-layout-description").attr("placeholder", WebDeveloper.Locales.getString("descriptionPlaceholder"));
  $("#responsive-layout-height").attr("placeholder", WebDeveloper.Locales.getString("heightPlaceholder"));
  $("#responsive-layout-width").attr("placeholder", WebDeveloper.Locales.getString("widthPlaceholder"));
  $('[for="responsive-layout-description"]').text(WebDeveloper.Locales.getString("description"));
  $('[for="responsive-layout-height"]').text(WebDeveloper.Locales.getString("height"));
  $('[for="responsive-layout-width"]').text(WebDeveloper.Locales.getString("width"));
};

// Localizes the tools tab
WebDeveloper.Options.localizeToolsTab = function()
{
  var tools = $("#tools-options");

  $("th:eq(0)", tools).text(WebDeveloper.Locales.getString("description"));
  $("th:eq(1)", tools).text(WebDeveloper.Locales.getString("url"));
  $("th:eq(2)", tools).text(WebDeveloper.Locales.getString("keyboard"));
  $("th:eq(3)", tools).text(WebDeveloper.Locales.getString("actions"));

  $(".muted", tools).text(WebDeveloper.Locales.getString("dragDropReorder"));
  $(".table-container > .btn-primary", tools).append(WebDeveloper.Locales.getString("addLabel"));

  $("#tool-cancel").text(WebDeveloper.Locales.getString("cancel"));
  $("#tool-description").attr("placeholder", WebDeveloper.Locales.getString("descriptionPlaceholder"));
  $("#tool-url").attr("placeholder", WebDeveloper.Locales.getString("urlPlaceholder"));
  $('[for="tool-description"]').text(WebDeveloper.Locales.getString("description"));
  $('[for="tool-url"]').text(WebDeveloper.Locales.getString("url"));
};

// Resets the option form
WebDeveloper.Options.resetOptionForm = function(form)
{
  $(".error", form).removeClass("error");
  $(".help-inline", form).text("");
};

// Submits the option
WebDeveloper.Options.submitOption = function(option, options, position)
{
  // If the position is set
  if(position)
  {
    $("tbody > tr:eq(" + (position - 1) + ")", options).replaceWith(option);
  }
  else
  {
    $("tbody", options).append(option);
  }
};

// Submits the resize option
WebDeveloper.Options.submitResizeOption = function()
{
  // If the resize option is valid
  if(WebDeveloper.Options.validateResizeOption())
  {
    var resizeOption  = {};
    var resizeOptions = $("#resize-options");

    resizeOption.description = $("#resize-description").val().trim();
    resizeOption.height      = $("#resize-height").val().trim();
    resizeOption.width       = $("#resize-width").val().trim();

    WebDeveloper.Options.submitOption(ich.resizeOption(resizeOption), resizeOptions, $("#resize-form").data("position"));

    WebDeveloper.Options.updateResizeOptions();
    WebDeveloper.Options.closeResizeOption();
  }
};

// Submits the responsive layout
WebDeveloper.Options.submitResponsiveLayout = function()
{
  // If the responsive layout is valid
  if(WebDeveloper.Options.validateResponsiveLayout())
  {
    var responsiveLayout  = {};
    var responsiveLayouts = $("#responsive-layouts-options");

    responsiveLayout.description = $("#responsive-layout-description").val();
    responsiveLayout.height      = $("#responsive-layout-height").val();
    responsiveLayout.width       = $("#responsive-layout-width").val();

    WebDeveloper.Options.submitOption(ich.responsiveLayout(responsiveLayout), responsiveLayouts, $("#responsive-layout-form").data("position"));

    WebDeveloper.Options.updateResponsiveLayouts();
    WebDeveloper.Options.closeResponsiveLayout();
  }
};

// Submits the tool
WebDeveloper.Options.submitTool = function()
{
  // If the tool is valid
  if(WebDeveloper.Options.validateTool())
  {
    var tool  = {};
    var tools = $("#tools-options");

    tool.description = $("#tool-description").val();
    tool.url         = $("#tool-url").val();

    WebDeveloper.Options.submitOption(ich.tool(tool), tools, $("#tool-form").data("position"));

    WebDeveloper.Options.updateTools();
    WebDeveloper.Options.closeTool();
  }
};

// Handles a table drag starting
WebDeveloper.Options.tableDragStart = function(table)
{
  $(table).removeClass("table-striped");
};

// Updates the icon color
WebDeveloper.Options.updateIconColor = function()
{
  WebDeveloper.Storage.setItem("icon_color", $("#icon_color").prop("checked"));
  WebDeveloper.Storage.updateIcon();
};

// Updates the populate email address
WebDeveloper.Options.updatePopulateEmailAddress = function()
{
  WebDeveloper.Storage.setItem("populate_email_address", $("#populate_email_address").val());
};

// Updates the resize options
WebDeveloper.Options.updateResizeOptions = function(table)
{
  var position      = 0;
  var resizeOption  = null;
  var resizeTab     = $("#resize-options");
  var resizeTable   = $("tbody", resizeTab);
  var resizeOptions = $("tr", resizeTable);
  var resizeCount   = resizeOptions.length;

  // Loop through the resize preferences
  for(var i = 1, l = WebDeveloper.Storage.getItem("resize_count"); i <= l; i++)
  {
    WebDeveloper.Storage.removeItem("resize_" + i + "_description");
    WebDeveloper.Storage.removeItem("resize_" + i + "_height");
    WebDeveloper.Storage.removeItem("resize_" + i + "_width");
  }

  // Loop through the resize options
  for(i = 0; i < resizeCount; i++)
  {
    position     = i + 1;
    resizeOption = resizeOptions.eq(i);

    WebDeveloper.Storage.setItem("resize_" + position + "_description", $("td:eq(0)", resizeOption).text());
    WebDeveloper.Storage.setItem("resize_" + position + "_width", $("td:eq(1)", resizeOption).text());
    WebDeveloper.Storage.setItem("resize_" + position + "_height", $("td:eq(2)", resizeOption).text());
  }

  WebDeveloper.Storage.setItem("resize_count", resizeCount);

  // If the table is set
  if(table)
  {
    $(table).addClass("table-striped");
  }
  else
  {
    $("table", resizeTab).tableDnD({ "onDragStart": WebDeveloper.Options.tableDragStart, "onDrop": WebDeveloper.Options.updateResizeOptions });
  }

  $(".btn-danger > span", resizeTable).text(WebDeveloper.Locales.getString("deleteConfirmation"));
  $(".btn-primary > span", resizeTable).text(WebDeveloper.Locales.getString("edit"));

  // If there is only one resize option
  if(resizeCount == 1)
  {
    resizeTable.addClass("single");
  }
  else
  {
    resizeTable.removeClass("single");
  }
};

// Updates the responsive layouts
WebDeveloper.Options.updateResponsiveLayouts = function(table)
{
  var position               = 0;
  var responsiveLayout       = null;
  var responsiveLayoutsTab   = $("#responsive-layouts-options");
  var responsiveLayoutsTable = $("tbody", responsiveLayoutsTab);
  var responsiveLayouts      = $("tr", responsiveLayoutsTable);
  var responsiveLayoutsCount = responsiveLayouts.length;

  // Loop through the responsive layouts preferences
  for(var i = 1, l = WebDeveloper.Storage.getItem("responsive_layout_count"); i <= l; i++)
  {
    WebDeveloper.Storage.removeItem("responsive_layout_" + i + "_description");
    WebDeveloper.Storage.removeItem("responsive_layout_" + i + "_height");
    WebDeveloper.Storage.removeItem("responsive_layout_" + i + "_width");
  }

  // Loop through the responsive layouts
  for(i = 0; i < responsiveLayoutsCount; i++)
  {
    position         = i + 1;
    responsiveLayout = responsiveLayouts.eq(i);

    WebDeveloper.Storage.setItem("responsive_layout_" + position + "_description", $("td:eq(0)", responsiveLayout).text());
    WebDeveloper.Storage.setItem("responsive_layout_" + position + "_width", $("td:eq(1)", responsiveLayout).text());
    WebDeveloper.Storage.setItem("responsive_layout_" + position + "_height", $("td:eq(2)", responsiveLayout).text());
  }

  WebDeveloper.Storage.setItem("responsive_layout_count", responsiveLayoutsCount);

  // If the table is set
  if(table)
  {
    $(table).addClass("table-striped");
  }
  else
  {
    $("table", responsiveLayoutsTab).tableDnD({ "onDragStart": WebDeveloper.Options.tableDragStart, "onDrop": WebDeveloper.Options.updateResponsiveLayouts });
  }

  $(".btn-danger > span", responsiveLayoutsTable).text(WebDeveloper.Locales.getString("deleteConfirmation"));
  $(".btn-primary > span", responsiveLayoutsTable).text(WebDeveloper.Locales.getString("edit"));

  // If there is only one resize option
  if(responsiveLayoutsCount == 1)
  {
    responsiveLayoutsTable.addClass("single");
  }
  else
  {
    responsiveLayoutsTable.removeClass("single");
  }
};

// Updates the syntax highlight theme
WebDeveloper.Options.updateSyntaxHighlightTheme = function()
{
  var theme = $("#syntax_highlight_theme").val();

  $("#syntax-highlight-browser").get(0).contentDocument.defaultView.WebDeveloper.setTheme(theme);
  WebDeveloper.Storage.setItem("syntax_highlight_theme", theme);
};

// Updates the tools
WebDeveloper.Options.updateTools = function(table)
{
  var position   = 0;
  var tool       = null;
  var toolsTab   = $("#tools-options");
  var toolsTable = $("tbody", toolsTab);
  var tools      = $("tr", toolsTable);
  var toolsCount = tools.length;

  // Loop through the tools preferences
  for(var i = 1, l = WebDeveloper.Storage.getItem("tool_count"); i <= l; i++)
  {
    WebDeveloper.Storage.removeItem("tool_" + i + "_description");
    WebDeveloper.Storage.removeItem("tool_" + i + "_url");
  }

  // Loop through the tools
  for(i = 0; i < toolsCount; i++)
  {
    position = i + 1;
    tool     = tools.eq(i);

    WebDeveloper.Storage.setItem("tool_" + position + "_description", $("td:eq(0)", tool).text());
    WebDeveloper.Storage.setItem("tool_" + position + "_url", $("td:eq(1)", tool).text());
  }

  WebDeveloper.Storage.setItem("tool_count", toolsCount);

  // If the table is set
  if(table)
  {
    $(table).addClass("table-striped");
  }
  else
  {
    $("table", toolsTab).tableDnD({ "onDragStart": WebDeveloper.Options.tableDragStart, "onDrop": WebDeveloper.Options.updateTools });
  }

  $(".btn-danger > span", toolsTable).text(WebDeveloper.Locales.getString("deleteConfirmation"));
  $(".btn-primary > span", toolsTable).text(WebDeveloper.Locales.getString("edit"));

  // If there is only one resize option
  if(toolsCount == 1)
  {
    toolsTable.addClass("single");
  }
  else
  {
    toolsTable.removeClass("single");
  }
};

// Returns true if the resize option is valid
WebDeveloper.Options.validateResizeOption = function()
{
  var description = $("#resize-description");
  var height      = $("#resize-height");
  var heightValue = height.val().trim();
  var width       = $("#resize-width");
  var widthValue  = width.val().trim();
  var valid       = true;

  WebDeveloper.Options.resetOptionForm($("#resize-form"));

  // If the description is not set
  if(!description.val().trim())
  {
    description.next().text(WebDeveloper.Locales.getString("descriptionCannotBeEmpty"));
    description.closest(".control-group").addClass("error");

    valid = false;
  }

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

// Returns true if the responsive layout is valid
WebDeveloper.Options.validateResponsiveLayout = function()
{
  var description = $("#responsive-layout-description");
  var height      = $("#responsive-layout-height");
  var heightValue = height.val().trim();
  var width       = $("#responsive-layout-width");
  var widthValue  = width.val().trim();
  var valid       = true;

  WebDeveloper.Options.resetOptionForm($("#responsive-layout-form"));

  // If the description is not set
  if(!description.val().trim())
  {
    description.next().text(WebDeveloper.Locales.getString("descriptionCannotBeEmpty"));
    description.closest(".control-group").addClass("error");

    valid = false;
  }

  // If the height is not set
  if(!heightValue)
  {
    height.next().text(WebDeveloper.Locales.getString("heightCannotBeEmpty"));
    height.closest(".control-group").addClass("error");

    valid = false;
  }
  else if(parseInt(heightValue, 10) != heightValue || heightValue <= 0)
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
  else if(parseInt(widthValue, 10) != widthValue || widthValue <= 0)
  {
    width.next().text(WebDeveloper.Locales.getString("widthNotValid"));
    width.closest(".control-group").addClass("error");

    valid = false;
  }

  return valid;
};

// Returns true if the tool is valid
WebDeveloper.Options.validateTool = function()
{
  var description = $("#tool-description");
  var url         = $("#tool-url");
  var valid       = true;

  WebDeveloper.Options.resetOptionForm($("#tool-form"));

  // If the description is not set
  if(!description.val().trim())
  {
    description.next().text(WebDeveloper.Locales.getString("descriptionCannotBeEmpty"));
    description.closest(".control-group").addClass("error");

    valid = false;
  }

  // If the URL is not set
  if(!url.val().trim())
  {
    url.next().text(WebDeveloper.Locales.getString("urlCannotBeEmpty"));
    url.closest(".control-group").addClass("error");

    valid = false;
  }

  return valid;
};
/**
 * TableDnD plug-in for JQuery, allows you to drag and drop table rows
 * You can set up various options to control how the system will work
 * Copyright © Denis Howlett <denish@isocra.com>
 * Licensed like jQuery, see http://docs.jquery.com/License.
 *
 * Configuration options:
 *
 * onDragStyle
 *		 This is the style that is assigned to the row during drag. There are limitations to the styles that can be
 *		 associated with a row (such as you can't assign a borderâ€”well you can, but it won't be
 *		 displayed). (So instead consider using onDragClass.) The CSS style to apply is specified as
 *		 a map (as used in the jQuery css(...) function).
 * onDropStyle
 *		 This is the style that is assigned to the row when it is dropped. As for onDragStyle, there are limitations
 *		 to what you can do. Also this replaces the original style, so again consider using onDragClass which
 *		 is simply added and then removed on drop.
 * onDragClass
 *		 This class is added for the duration of the drag and then removed when the row is dropped. It is more
 *		 flexible than using onDragStyle since it can be inherited by the row cells and other content. The default
 *		 is class is tDnD_whileDrag. So to use the default, simply customise this CSS class in your
 *		 stylesheet.
 * onDrop
 *		 Pass a function that will be called when the row is dropped. The function takes 2 parameters: the table
 *		 and the row that was dropped. You can work out the new order of the rows by using
 *		 table.rows.
 * onDragStart
 *		 Pass a function that will be called when the user starts dragging. The function takes 2 parameters: the
 *		 table and the row which the user has started to drag.
 * onAllowDrop
 *		 Pass a function that will be called as a row is over another row. If the function returns true, allow
 *		 dropping on that row, otherwise not. The function takes 2 parameters: the dragged row and the row under
 *		 the cursor. It returns a boolean: true allows the drop, false doesn't allow it.
 * scrollAmount
 *		 This is the number of pixels to scroll if the user moves the mouse cursor to the top or bottom of the
 *		 window. The page should automatically scroll up or down as appropriate (tested in IE6, IE7, Safari, FF2,
 *		 FF3 beta)
 *
 * Other ways to control behaviour:
 *
 * Add class="nodrop" to any rows for which you don't want to allow dropping, and class="nodrag" to any rows
 * that you don't want to be draggable.
 *
 * Inside the onDrop method you can also call $.tableDnD.serialize() this returns a string of the form
 * <tableID>[]=<rowID1>&<tableID>[]=<rowID2> so that you can send this back to the server. The table must have
 * an ID as must all the rows.
 *
 * Known problems:
 * - Auto-scoll has some problems with IE7	(it scrolls even when it shouldn't), work-around: set scrollAmount to 0
 *
 * Version 0.2: 2008-02-20 First public version
 * Version 0.3: 2008-02-07 Added onDragStart option
 *												 Made the scroll amount configurable (default is 5 as before)
 * Version 0.4: 2008-03-15 Changed the noDrag/noDrop attributes to nodrag/nodrop classes
 *												 Added onAllowDrop to control dropping
 *												 Fixed a bug which meant that you couldn't set the scroll amount in both directions
 *												 Added serialise method
 */
jQuery.tableDnD = {
		/** Keep hold of the current table being dragged */
		currentTable : null,
		/** Keep hold of the current drag object if any */
		dragObject: null,
		/** The current mouse offset */
		mouseOffset: null,
		/** Remember the old value of Y so that we don't do too much processing */
		oldY: 0,

		/** Actually build the structure */
		build: function(options) {
				// Make sure options exists
				options = options || {};
				// Set up the defaults if any

				this.each(function() {
						// Remember the options
						this.tableDnDConfig = {
								onDragStyle: options.onDragStyle,
								onDropStyle: options.onDropStyle,
				// Add in the default class for whileDragging
				onDragClass: options.onDragClass ? options.onDragClass : "tDnD_whileDrag",
								onDrop: options.onDrop,
								onDragStart: options.onDragStart,
								scrollAmount: options.scrollAmount ? options.scrollAmount : 5
						};
						// Now make the rows draggable
						jQuery.tableDnD.makeDraggable(this);
				});

				// Now we need to capture the mouse up and mouse move event
				// We can use bind so that we don't interfere with other event handlers
				jQuery(document)
						.bind('mousemove', jQuery.tableDnD.mousemove)
						.bind('mouseup', jQuery.tableDnD.mouseup);

				// Don't break the chain
				return this;
		},

		/** This function makes all the rows on the table draggable apart from those marked as "NoDrag" */
		makeDraggable: function(table) {
				// Now initialise the rows
				var rows = table.rows; //getElementsByTagName("tr")
				var config = table.tableDnDConfig;
				for (var i=0; i<rows.length; i++) {
						// To make non-draggable rows, add the nodrag class (eg for Category and Header rows)
			// inspired by John Tarr and Famic
						var nodrag = $(rows[i]).hasClass("nodrag");
						if (! nodrag) { //There is no NoDnD attribute on rows I want to drag
								jQuery(rows[i]).mousedown(function(ev) {
										if (ev.target.tagName == "TD") {
												jQuery.tableDnD.dragObject = this;
												jQuery.tableDnD.currentTable = table;
												jQuery.tableDnD.mouseOffset = jQuery.tableDnD.getMouseOffset(this, ev);
												if (config.onDragStart) {
														// Call the onDrop method if there is one
														config.onDragStart(table, this);
												}
												return false;
										}
								}).css("cursor", "move"); // Store the tableDnD object
						}
				}
		},

		/** Get the mouse coordinates from the event (allowing for browser differences) */
		mouseCoords: function(ev){
				if(ev.pageX || ev.pageY){
						return {x:ev.pageX, y:ev.pageY};
				}
				return {
						x:ev.clientX + document.body.scrollLeft - document.body.clientLeft,
						y:ev.clientY + document.body.scrollTop	- document.body.clientTop
				};
		},

		/** Given a target element and a mouse event, get the mouse offset from that element.
				To do this we need the element's position and the mouse position */
		getMouseOffset: function(target, ev) {
				ev = ev || window.event;

				var docPos		= this.getPosition(target);
				var mousePos	= this.mouseCoords(ev);
				return {x:mousePos.x - docPos.x, y:mousePos.y - docPos.y};
		},

		/** Get the position of an element by going up the DOM tree and adding up all the offsets */
		getPosition: function(e){
				var left = 0;
				var top  = 0;
				/** Safari fix -- thanks to Luis Chato for this! */
				if (e.offsetHeight == 0) {
						/** Safari 2 doesn't correctly grab the offsetTop of a table row
						this is detailed here:
						http://jacob.peargrove.com/blog/2006/technical/table-row-offsettop-bug-in-safari/
						the solution is likewise noted there, grab the offset of a table cell in the row - the firstChild.
						note that firefox will return a text node as a first child, so designing a more thorough
						solution may need to take that into account, for now this seems to work in firefox, safari, ie */
						e = e.firstChild; // a table cell
				}

				while (e.offsetParent){
						left += e.offsetLeft;
						top  += e.offsetTop;
						e		= e.offsetParent;
				}

				left += e.offsetLeft;
				top  += e.offsetTop;

				return {x:left, y:top};
		},

		mousemove: function(ev) {
				if (jQuery.tableDnD.dragObject == null) {
						return;
				}

				var dragObj = jQuery(jQuery.tableDnD.dragObject);
				var config = jQuery.tableDnD.currentTable.tableDnDConfig;
				var mousePos = jQuery.tableDnD.mouseCoords(ev);
				var y = mousePos.y - jQuery.tableDnD.mouseOffset.y;
				//auto scroll the window
			var yOffset = window.pageYOffset;
		if (document.all) {
					// Windows version
					//yOffset=document.body.scrollTop;
					if (typeof document.compatMode != 'undefined' &&
							 document.compatMode != 'BackCompat') {
						 yOffset = document.documentElement.scrollTop;
					}
					else if (typeof document.body != 'undefined') {
						 yOffset=document.body.scrollTop;
					}

			}

		if (mousePos.y-yOffset < config.scrollAmount) {
				window.scrollBy(0, -config.scrollAmount);
			} else {
						var windowHeight = window.innerHeight ? window.innerHeight
										: document.documentElement.clientHeight ? document.documentElement.clientHeight : document.body.clientHeight;
						if (windowHeight-(mousePos.y-yOffset) < config.scrollAmount) {
								window.scrollBy(0, config.scrollAmount);
						}
				}


				if (y != jQuery.tableDnD.oldY) {
						// work out if we're going up or down...
						var movingDown = y > jQuery.tableDnD.oldY;
						// update the old value
						jQuery.tableDnD.oldY = y;
						// update the style to show we're dragging
			if (config.onDragClass) {
				dragObj.addClass(config.onDragClass);
			} else {
							dragObj.css(config.onDragStyle);
			}
						// If we're over a row then move the dragged row to there so that the user sees the
						// effect dynamically
						var currentRow = jQuery.tableDnD.findDropTargetRow(dragObj, y);
						if (currentRow) {
								// TODO worry about what happens when there are multiple TBODIES
								if (movingDown && jQuery.tableDnD.dragObject != currentRow) {
										jQuery.tableDnD.dragObject.parentNode.insertBefore(jQuery.tableDnD.dragObject, currentRow.nextSibling);
								} else if (! movingDown && jQuery.tableDnD.dragObject != currentRow) {
										jQuery.tableDnD.dragObject.parentNode.insertBefore(jQuery.tableDnD.dragObject, currentRow);
								}
						}
				}

				return false;
		},

		/** We're only worried about the y position really, because we can only move rows up and down */
		findDropTargetRow: function(draggedRow, y) {
				var rows = jQuery.tableDnD.currentTable.rows;
				for (var i=0; i<rows.length; i++) {
						var row = rows[i];
						var rowY		= this.getPosition(row).y;
						var rowHeight = parseInt(row.offsetHeight)/2;
						if (row.offsetHeight == 0) {
								rowY = this.getPosition(row.firstChild).y;
								rowHeight = parseInt(row.firstChild.offsetHeight)/2;
						}
						// Because we always have to insert before, we need to offset the height a bit
						if ((y > rowY - rowHeight) && (y < (rowY + rowHeight))) {
								// that's the row we're over
				// If it's the same as the current row, ignore it
				if (row == draggedRow) {return null;}
								var config = jQuery.tableDnD.currentTable.tableDnDConfig;
								if (config.onAllowDrop) {
										if (config.onAllowDrop(draggedRow, row)) {
												return row;
										} else {
												return null;
										}
								} else {
					// If a row has nodrop class, then don't allow dropping (inspired by John Tarr and Famic)
										var nodrop = $(row).hasClass("nodrop");
										if (! nodrop) {
												return row;
										} else {
												return null;
										}
								}
								return row;
						}
				}
				return null;
		},

		mouseup: function(e) {
				if (jQuery.tableDnD.currentTable && jQuery.tableDnD.dragObject) {
						var droppedRow = jQuery.tableDnD.dragObject;
						var config = jQuery.tableDnD.currentTable.tableDnDConfig;
						// If we have a dragObject, then we need to release it,
						// The row will already have been moved to the right place so we just reset stuff
			if (config.onDragClass) {
							jQuery(droppedRow).removeClass(config.onDragClass);
			} else {
							jQuery(droppedRow).css(config.onDropStyle);
			}
						jQuery.tableDnD.dragObject	 = null;
						if (config.onDrop) {
								// Call the onDrop method if there is one
								config.onDrop(jQuery.tableDnD.currentTable, droppedRow);
						}
						jQuery.tableDnD.currentTable = null; // let go of the table too
				}
		},

		serialize: function() {
				if (jQuery.tableDnD.currentTable) {
						var result = "";
						var tableId = jQuery.tableDnD.currentTable.id;
						var rows = jQuery.tableDnD.currentTable.rows;
						for (var i=0; i<rows.length; i++) {
								if (result.length > 0) result += "&";
								result += tableId + '[]=' + rows[i].id;
						}
						return result;
				} else {
						return "Error: No Table id set, you need to set an id on your table and every row";
				}
		}
}

jQuery.fn.extend(
	{
		tableDnD : jQuery.tableDnD.build
	}
);
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
  var badgeTooltip  = "@name@";
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
