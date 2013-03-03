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
/* ===========================================================
 * bootstrap-tooltip.js v2.2.2
 * http://twitter.github.com/bootstrap/javascript.html#tooltips
 * Inspired by the original jQuery.tipsy by Jason Frame
 * ===========================================================
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


 /* TOOLTIP PUBLIC CLASS DEFINITION
  * =============================== */

  var Tooltip = function (element, options) {
    this.init('tooltip', element, options)
  }

  Tooltip.prototype = {

    constructor: Tooltip

  , init: function (type, element, options) {
      var eventIn
        , eventOut

      this.type = type
      this.$element = $(element)
      this.options = this.getOptions(options)
      this.enabled = true

      if (this.options.trigger == 'click') {
        this.$element.on('click.' + this.type, this.options.selector, $.proxy(this.toggle, this))
      } else if (this.options.trigger != 'manual') {
        eventIn = this.options.trigger == 'hover' ? 'mouseenter' : 'focus'
        eventOut = this.options.trigger == 'hover' ? 'mouseleave' : 'blur'
        this.$element.on(eventIn + '.' + this.type, this.options.selector, $.proxy(this.enter, this))
        this.$element.on(eventOut + '.' + this.type, this.options.selector, $.proxy(this.leave, this))
      }

      this.options.selector ?
        (this._options = $.extend({}, this.options, { trigger: 'manual', selector: '' })) :
        this.fixTitle()
    }

  , getOptions: function (options) {
      options = $.extend({}, $.fn[this.type].defaults, options, this.$element.data())

      if (options.delay && typeof options.delay == 'number') {
        options.delay = {
          show: options.delay
        , hide: options.delay
        }
      }

      return options
    }

  , enter: function (e) {
      var self = $(e.currentTarget)[this.type](this._options).data(this.type)

      if (!self.options.delay || !self.options.delay.show) return self.show()

      clearTimeout(this.timeout)
      self.hoverState = 'in'
      this.timeout = setTimeout(function() {
        if (self.hoverState == 'in') self.show()
      }, self.options.delay.show)
    }

  , leave: function (e) {
      var self = $(e.currentTarget)[this.type](this._options).data(this.type)

      if (this.timeout) clearTimeout(this.timeout)
      if (!self.options.delay || !self.options.delay.hide) return self.hide()

      self.hoverState = 'out'
      this.timeout = setTimeout(function() {
        if (self.hoverState == 'out') self.hide()
      }, self.options.delay.hide)
    }

  , show: function () {
      var $tip
        , inside
        , pos
        , actualWidth
        , actualHeight
        , placement
        , tp

      if (this.hasContent() && this.enabled) {
        $tip = this.tip()
        this.setContent()

        if (this.options.animation) {
          $tip.addClass('fade')
        }

        placement = typeof this.options.placement == 'function' ?
          this.options.placement.call(this, $tip[0], this.$element[0]) :
          this.options.placement

        inside = /in/.test(placement)

        $tip
          .detach()
          .css({ top: 0, left: 0, display: 'block' })
          .insertAfter(this.$element)

        pos = this.getPosition(inside)

        actualWidth = $tip[0].offsetWidth
        actualHeight = $tip[0].offsetHeight

        switch (inside ? placement.split(' ')[1] : placement) {
          case 'bottom':
            tp = {top: pos.top + pos.height, left: pos.left + pos.width / 2 - actualWidth / 2}
            break
          case 'top':
            tp = {top: pos.top - actualHeight, left: pos.left + pos.width / 2 - actualWidth / 2}
            break
          case 'left':
            tp = {top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left - actualWidth}
            break
          case 'right':
            tp = {top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left + pos.width}
            break
        }

        $tip
          .offset(tp)
          .addClass(placement)
          .addClass('in')
      }
    }

  , setContent: function () {
      var $tip = this.tip()
        , title = this.getTitle()

      $tip.find('.tooltip-inner')[this.options.html ? 'html' : 'text'](title)
      $tip.removeClass('fade in top bottom left right')
    }

  , hide: function () {
      var that = this
        , $tip = this.tip()

      $tip.removeClass('in')

      function removeWithAnimation() {
        var timeout = setTimeout(function () {
          $tip.off($.support.transition.end).detach()
        }, 500)

        $tip.one($.support.transition.end, function () {
          clearTimeout(timeout)
          $tip.detach()
        })
      }

      $.support.transition && this.$tip.hasClass('fade') ?
        removeWithAnimation() :
        $tip.detach()

      return this
    }

  , fixTitle: function () {
      var $e = this.$element
      if ($e.attr('title') || typeof($e.attr('data-original-title')) != 'string') {
        $e.attr('data-original-title', $e.attr('title') || '').removeAttr('title')
      }
    }

  , hasContent: function () {
      return this.getTitle()
    }

  , getPosition: function (inside) {
      return $.extend({}, (inside ? {top: 0, left: 0} : this.$element.offset()), {
        width: this.$element[0].offsetWidth
      , height: this.$element[0].offsetHeight
      })
    }

  , getTitle: function () {
      var title
        , $e = this.$element
        , o = this.options

      title = $e.attr('data-original-title')
        || (typeof o.title == 'function' ? o.title.call($e[0]) :  o.title)

      return title
    }

  , tip: function () {
      return this.$tip = this.$tip || $(this.options.template)
    }

  , validate: function () {
      if (!this.$element[0].parentNode) {
        this.hide()
        this.$element = null
        this.options = null
      }
    }

  , enable: function () {
      this.enabled = true
    }

  , disable: function () {
      this.enabled = false
    }

  , toggleEnabled: function () {
      this.enabled = !this.enabled
    }

  , toggle: function (e) {
      var self = $(e.currentTarget)[this.type](this._options).data(this.type)
      self[self.tip().hasClass('in') ? 'hide' : 'show']()
    }

  , destroy: function () {
      this.hide().$element.off('.' + this.type).removeData(this.type)
    }

  }


 /* TOOLTIP PLUGIN DEFINITION
  * ========================= */

  var old = $.fn.tooltip

  $.fn.tooltip = function ( option ) {
    return this.each(function () {
      var $this = $(this)
        , data = $this.data('tooltip')
        , options = typeof option == 'object' && option
      if (!data) $this.data('tooltip', (data = new Tooltip(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  $.fn.tooltip.Constructor = Tooltip

  $.fn.tooltip.defaults = {
    animation: true
  , placement: 'top'
  , selector: false
  , template: '<div class="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>'
  , trigger: 'hover'
  , title: ''
  , delay: 0
  , html: false
  }


 /* TOOLTIP NO CONFLICT
  * =================== */

  $.fn.tooltip.noConflict = function () {
    $.fn.tooltip = old
    return this
  }

}(window.jQuery);
/* ===========================================================
 * bootstrap-popover.js v2.2.2
 * http://twitter.github.com/bootstrap/javascript.html#popovers
 * ===========================================================
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
 * =========================================================== */


!function ($) {

  "use strict"; // jshint ;_;


 /* POPOVER PUBLIC CLASS DEFINITION
  * =============================== */

  var Popover = function (element, options) {
    this.init('popover', element, options)
  }


  /* NOTE: POPOVER EXTENDS BOOTSTRAP-TOOLTIP.js
     ========================================== */

  Popover.prototype = $.extend({}, $.fn.tooltip.Constructor.prototype, {

    constructor: Popover

  , setContent: function () {
      var $tip = this.tip()
        , title = this.getTitle()
        , content = this.getContent()

      $tip.find('.popover-title')[this.options.html ? 'html' : 'text'](title)
      $tip.find('.popover-content')[this.options.html ? 'html' : 'text'](content)

      $tip.removeClass('fade top bottom left right in')
    }

  , hasContent: function () {
      return this.getTitle() || this.getContent()
    }

  , getContent: function () {
      var content
        , $e = this.$element
        , o = this.options

      content = $e.attr('data-content')
        || (typeof o.content == 'function' ? o.content.call($e[0]) :  o.content)

      return content
    }

  , tip: function () {
      if (!this.$tip) {
        this.$tip = $(this.options.template)
      }
      return this.$tip
    }

  , destroy: function () {
      this.hide().$element.off('.' + this.type).removeData(this.type)
    }

  })


 /* POPOVER PLUGIN DEFINITION
  * ======================= */

  var old = $.fn.popover

  $.fn.popover = function (option) {
    return this.each(function () {
      var $this = $(this)
        , data = $this.data('popover')
        , options = typeof option == 'object' && option
      if (!data) $this.data('popover', (data = new Popover(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  $.fn.popover.Constructor = Popover

  $.fn.popover.defaults = $.extend({} , $.fn.tooltip.defaults, {
    placement: 'right'
  , trigger: 'click'
  , content: ''
  , template: '<div class="popover"><div class="arrow"></div><div class="popover-inner"><h3 class="popover-title"></h3><div class="popover-content"></div></div></div>'
  })


 /* POPOVER NO CONFLICT
  * =================== */

  $.fn.popover.noConflict = function () {
    $.fn.popover = old
    return this
  }

}(window.jQuery);
/* ===================================================
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

WebDeveloper.Generated              = WebDeveloper.Generated || {};
WebDeveloper.Generated.cookie       = null;
WebDeveloper.Generated.storedLocale = null;

// Handles the cookie session setting being changed
WebDeveloper.Generated.changeSession = function()
{
  var session = $(this);

  // If the session setting is checked
  if(session.prop("checked"))
  {
    $("#cookie-expires").val("").prop("disabled", true);
  }
  else
  {
    $("#cookie-expires").val(WebDeveloper.Cookies.getDateTomorrow()).prop("disabled", false);
  }
};

// Deletes a cookie
WebDeveloper.Generated.deleteCookie = function()
{
  var alert  = document.createElement("div");
  var cookie = WebDeveloper.Generated.populateCookieFromElement(WebDeveloper.Generated.cookie);

  alert.appendChild(document.createTextNode(WebDeveloper.Generated.storedLocale.cookieDeleted.replace("%S", "'" + cookie.name + "'")));
  alert.setAttribute("class", "alert alert-success");

  WebDeveloper.Cookies.deleteCookie(cookie);

  WebDeveloper.Generated.cookie.slideUp(WebDeveloper.Generated.animationSpeed, function() { WebDeveloper.Generated.cookie.remove(); });
  $("#delete-dialog").modal("hide");
  WebDeveloper.Generated.cookie.before(alert);
};

// Displays a cookie
WebDeveloper.Generated.displayCookie = function(cookie, container, cookiesCounter, locale)
{
  var childElement        = document.createElement("th");
  var cookieElement       = document.createElement("div");
  var cookieExpires       = cookie.expires;
  var cookieName          = cookie.name;
  var element             = document.createElement("tr");
  var expiresDescription  = locale.atEndOfSession;
  var httpOnlyDescription = locale.no;
  var secureDescription   = locale.no;
  var separator           = document.createElement("div");
  var table               = document.createElement("table");
  var tableContainer      = document.createElement("thead");

  // If the cookie has an expiration
  if(cookieExpires)
  {
    expiresDescription = new Date(cookieExpires * 1000).toUTCString();
  }

  // If the cookie is HttpOnly
  if(cookie.httpOnly)
  {
    httpOnlyDescription = locale.yes;
  }

  // If the cookie is secure
  if(cookie.secure)
  {
    secureDescription = locale.yes;
  }

  cookieElement.setAttribute("class", "web-developer-cookie");
  cookieElement.setAttribute("id", "cookie-" + cookiesCounter);

  childElement.appendChild(document.createTextNode(locale.property));
  element.appendChild(childElement);

  childElement = document.createElement("th");

  childElement.appendChild(document.createTextNode(locale.value));
  element.appendChild(childElement);
  tableContainer.appendChild(element);

  childElement   = document.createElement("td");
  element        = document.createElement("tr");
  tableContainer = document.createElement("tbody");

  childElement.appendChild(document.createTextNode(locale.name));
  element.appendChild(childElement);

  childElement = document.createElement("td");

  childElement.appendChild(document.createTextNode(cookieName));
  childElement.setAttribute("class", "web-developer-name");
  element.appendChild(childElement);
  tableContainer.appendChild(element);

  childElement = document.createElement("td");
  element      = document.createElement("tr");

  childElement.appendChild(document.createTextNode(locale.value));
  element.appendChild(childElement);

  childElement = document.createElement("td");

  childElement.appendChild(document.createTextNode(cookie.value));
  childElement.setAttribute("class", "web-developer-value");
  element.appendChild(childElement);
  tableContainer.appendChild(element);

  childElement = document.createElement("td");
  element      = document.createElement("tr");

  childElement.appendChild(document.createTextNode(locale.host));
  element.appendChild(childElement);

  childElement = document.createElement("td");

  childElement.appendChild(document.createTextNode(cookie.host));
  childElement.setAttribute("class", "web-developer-host");
  element.appendChild(childElement);
  tableContainer.appendChild(element);

  childElement = document.createElement("td");
  element      = document.createElement("tr");

  childElement.appendChild(document.createTextNode(locale.path));
  element.appendChild(childElement);

  childElement = document.createElement("td");

  childElement.appendChild(document.createTextNode(cookie.path));
  childElement.setAttribute("class", "web-developer-path");
  element.appendChild(childElement);
  tableContainer.appendChild(element);

  childElement = document.createElement("td");
  element      = document.createElement("tr");

  childElement.appendChild(document.createTextNode(locale.expires));
  element.appendChild(childElement);

  childElement = document.createElement("td");

  childElement.appendChild(document.createTextNode(expiresDescription));
  childElement.setAttribute("class", "web-developer-expires");
  element.appendChild(childElement);
  tableContainer.appendChild(element);

  childElement = document.createElement("td");
  element      = document.createElement("tr");

  childElement.appendChild(document.createTextNode(locale.secure));
  element.appendChild(childElement);

  childElement = document.createElement("td");

  childElement.appendChild(document.createTextNode(secureDescription));
  childElement.setAttribute("class", "web-developer-secure");
  element.appendChild(childElement);
  tableContainer.appendChild(element);

  childElement = document.createElement("td");
  element      = document.createElement("tr");

  childElement.appendChild(document.createTextNode(locale.httpOnly));
  element.appendChild(childElement);

  childElement = document.createElement("td");

  childElement.appendChild(document.createTextNode(httpOnlyDescription));
  element.appendChild(childElement);
  tableContainer.appendChild(element);

  table.appendChild(tableContainer);
  table.setAttribute("class", "table table-bordered table-striped");
  cookieElement.appendChild(table);
  cookieElement.appendChild(WebDeveloper.Generated.generateCommands(cookie, locale));
  container.appendChild(cookieElement);
  separator.setAttribute("class", "web-developer-separator");
  container.appendChild(separator);
  document.getElementById("content").appendChild(container);

  childElement = document.createElement("a");
  element      = document.createElement("li");

  childElement.appendChild(document.createTextNode(cookieName));
  childElement.setAttribute("href", "#cookie-" + cookiesCounter);
  element.appendChild(childElement);
  $(".dropdown-menu", $("#cookies-dropdown")).get(0).appendChild(element);
};

// Edits a cookie
WebDeveloper.Generated.editCookie = function()
{
  // If the dialog is valid
  if(WebDeveloper.Generated.validateEditDialog())
  {
    var alert     = document.createElement("div");
    var newCookie = WebDeveloper.Generated.populateCookieFromDialog();
    var oldCookie = WebDeveloper.Generated.populateCookieFromElement(WebDeveloper.Generated.cookie);

    WebDeveloper.Cookies.deleteCookie(oldCookie);
    WebDeveloper.Cookies.addCookie(newCookie);
    WebDeveloper.Generated.populateElementFromCookie(WebDeveloper.Generated.cookie, newCookie);

    alert.appendChild(document.createTextNode(WebDeveloper.Generated.storedLocale.cookieEdited.replace("%S", "'" + oldCookie.name + "'")));
    alert.setAttribute("class", "alert alert-success");

    WebDeveloper.Generated.cookie.prepend(alert);
    $("#edit-dialog").modal("hide");
  }
};

// Generates the commands
WebDeveloper.Generated.generateCommands = function(cookie, locale)
{
  var childElement = document.createElement("i");
  var commands     = document.createDocumentFragment();
  var cookieHost   = cookie.host;
  var element      = document.createElement("button");

  childElement.setAttribute("class", "icon-trash");
  element.appendChild(childElement);
  element.appendChild(document.createTextNode(" " + locale.deleteConfirmation));
  element.setAttribute("class", "web-developer-delete btn btn-danger");
  commands.appendChild(element);

  childElement = document.createElement("i");
  element      = document.createElement("button");

  childElement.setAttribute("class", "icon-pencil");
  element.appendChild(childElement);
  element.appendChild(document.createTextNode(" " + locale.edit));

  // If the cookie is HTTP only
  if(cookie.httpOnly)
  {
    element.setAttribute("class", "web-developer-edit btn");
    element.setAttribute("data-content", locale.cannotEditHTTPOnlyCookies);
    element.setAttribute("data-title", locale.cannotEdit);
  }
  else if(!WebDeveloper.Cookies.canEditLocalCookie() && (cookieHost == "localhost" || cookieHost == ".localhost"))
  {
    element.setAttribute("class", "web-developer-edit btn");
    element.setAttribute("data-content", locale.cannotEditLocalhostCookies);
    element.setAttribute("data-title", locale.cannotEdit);
  }
  else
  {
    element.setAttribute("class", "web-developer-edit btn btn-primary");
  }

  commands.appendChild(element);

  return commands;
};

// Initializes the page with data
WebDeveloper.Generated.initialize = function(data, locale)
{
  var container         = null;
  var contentDocument   = null;
  var cookieInformation = locale.cookieInformation;
  var documents         = data.documents;
  var cookieDescription = null;
  var cookies           = null;
  var cookiesCounter    = 1;
  var cookiesDropdown   = $("#cookies-dropdown");
  var cookiesLength     = null;
  var deleteDialog      = $("#delete-dialog");
  var editDialog        = $("#edit-dialog");

  WebDeveloper.Generated.emptyContent();
  WebDeveloper.Generated.localizeHeader(locale);
  WebDeveloper.Generated.setPageTitle(cookieInformation, data, locale);

  $(".dropdown-toggle", cookiesDropdown).prepend(locale.cookies);

  // Loop through the documents
  for(var i = 0, l = documents.length; i < l; i++)
  {
    contentDocument   = documents[i];
    cookieDescription = locale.cookies.toLowerCase();
    cookies           = contentDocument.cookies;
    cookiesLength     = cookies.length;

    // If there is only one cookie
    if(cookiesLength == 1)
    {
      cookieDescription = locale.cookie.toLowerCase();
    }

    WebDeveloper.Generated.addDocument(contentDocument.url, i, cookieDescription, cookiesLength);

    // If there are cookies
    if(cookiesLength > 0)
    {
      container = WebDeveloper.Generated.generateDocumentContainer();

      // Loop through the cookies
      for(var j = 0; j < cookiesLength; j++)
      {
        WebDeveloper.Generated.displayCookie(cookies[j], container, cookiesCounter, locale);

        cookiesCounter++;
      }
    }
    else
    {
      WebDeveloper.Generated.addSeparator();
    }
  }

  WebDeveloper.Generated.storedLocale = locale;

  $("#cookie-secure").after(locale.secureCookie);
  $("#cookie-session").after(locale.sessionCookie).on("change", WebDeveloper.Generated.changeSession);
  $(".btn-danger", deleteDialog).append(locale.deleteLabel).on("click", WebDeveloper.Generated.deleteCookie);
  $(".btn-primary", editDialog).append(locale.save).on("click", WebDeveloper.Generated.editCookie);
  $('button[data-dismiss="modal"]', deleteDialog).text(locale.cancel);
  $('button[data-dismiss="modal"]', editDialog).text(locale.cancel);
  $(".web-developer-delete").on("click", WebDeveloper.Generated.showDeleteDialog);
  $(".web-developer-edit.btn-primary").on("click", WebDeveloper.Generated.showEditDialog);
  $(".web-developer-edit:not(.btn-primary)").popover();
  $('[for="cookie-expires"]').text(locale.expires);
  $('[for="cookie-host"]').text(locale.host);
  $('[for="cookie-name"]').text(locale.name);
  $('[for="cookie-path"]').text(locale.path);
  $('[for="cookie-value"]').text(locale.value);

  WebDeveloper.Generated.initializeCommonElements();
};

// Populates a cookie from a dialog
WebDeveloper.Generated.populateCookieFromDialog = function()
{
  var cookie = {};

  cookie.host  = $("#cookie-host").val();
  cookie.name  = $("#cookie-name").val();
  cookie.path  = $("#cookie-path").val();
  cookie.value = $("#cookie-value").val();

  // If the cookie is secure
  if($("#cookie-secure").prop("checked"))
  {
    cookie.secure = true;
  }

  // If the cookie is a session cookie
  if($("#cookie-session").prop("checked"))
  {
    cookie.session = true;
  }
  else
  {
    cookie.expires = $("#cookie-expires").val();
  }

  return cookie;
};

// Populates a cookie from an element
WebDeveloper.Generated.populateCookieFromElement = function(cookieElement)
{
  var cookie = {};

  cookie.host = $(".web-developer-host", cookieElement).text();
  cookie.name = $(".web-developer-name", cookieElement).text();
  cookie.path = $(".web-developer-path", cookieElement).text();

  // If the cookie is secure
  if($(".web-developer-secure", cookieElement).text() == WebDeveloper.Generated.storedLocale.yes)
  {
    cookie.secure = true;
  }

  return cookie;
};

// Populates a dialog from an element
WebDeveloper.Generated.populateDialogFromElement = function(cookieElement)
{
  var expires = $(".web-developer-expires", cookieElement).text();

  $("#cookie-host").val($(".web-developer-host", cookieElement).text());
  $("#cookie-name").val($(".web-developer-name", cookieElement).text());
  $("#cookie-path").val($(".web-developer-path", cookieElement).text());
  $("#cookie-value").val($(".web-developer-value", cookieElement).text());

  // If this is a session cookie
  if(expires == WebDeveloper.Generated.storedLocale.atEndOfSession)
  {
    $("#cookie-expires").val("").prop("disabled", true);
    $("#cookie-session").prop("checked", true);
  }
  else
  {
    $("#cookie-expires").val(expires).prop("disabled", false);
    $("#cookie-session").prop("checked", false);
  }

  // If this is not a secure cookie
  if($(".web-developer-secure", cookieElement).text() == WebDeveloper.Generated.storedLocale.no)
  {
    $("#cookie-secure").prop("checked", false);
  }
  else
  {
    $("#cookie-secure").prop("checked", true);
  }
};

// Populates an element from a cookie
WebDeveloper.Generated.populateElementFromCookie = function(cookieElement, cookie)
{
  $(".web-developer-host", cookieElement).text(cookie.host);
  $(".web-developer-name", cookieElement).text(cookie.name);
  $(".web-developer-path", cookieElement).text(cookie.path);
  $(".web-developer-value", cookieElement).text(cookie.value);

  // If the cookie is secure
  if(cookie.secure)
  {
    $(".web-developer-secure", cookieElement).text(WebDeveloper.Generated.storedLocale.yes);
  }
  else
  {
    $(".web-developer-secure", cookieElement).text(WebDeveloper.Generated.storedLocale.no);
  }

  // If the cookie is a session cookie
  if(cookie.session)
  {
    $(".web-developer-expires", cookieElement).text(WebDeveloper.Generated.storedLocale.atEndOfSession);
  }
  else
  {
    $(".web-developer-expires", cookieElement).text(cookie.expires);
  }

  return cookie;
};

// Resets the edit cookie dialog
WebDeveloper.Generated.resetEditDialog = function(editDialog)
{
  $(".error", editDialog).removeClass("error");
  $(".help-inline", editDialog).text("");
};

// Shows the delete cookie dialog
WebDeveloper.Generated.showDeleteDialog = function()
{
  var cookieElement = $(this).parent();
  var cookieName    = $(".web-developer-name", cookieElement).text();
  var deleteDialog  = $("#delete-dialog");

  WebDeveloper.Generated.cookie = cookieElement;

  $(".alert").remove();

  $("h3", deleteDialog).text(WebDeveloper.Generated.storedLocale.deleteCookie);
  $("p", deleteDialog).text(WebDeveloper.Generated.storedLocale.deleteCookieConfirmation.replace("%S", "'" + cookieName + "'"));

  deleteDialog.modal("show");
};

// Shows the edit cookie dialog
WebDeveloper.Generated.showEditDialog = function()
{
  var cookieElement = $(this).parent();
  var editDialog    = $("#edit-dialog");

  WebDeveloper.Generated.cookie = cookieElement;

  $(".alert").remove();

  $("h3", editDialog).text(WebDeveloper.Generated.storedLocale.editCookie);
  WebDeveloper.Generated.populateDialogFromElement(cookieElement);
  WebDeveloper.Generated.resetEditDialog(editDialog);

  editDialog.modal("show");
};

// Returns true if the edit cookie dialog is valid
WebDeveloper.Generated.validateEditDialog = function()
{
  var expires = $("#cookie-expires");
  var host    = $("#cookie-host");
  var name    = $("#cookie-name");
  var path    = $("#cookie-path");
  var valid   = true;

  WebDeveloper.Generated.resetEditDialog($("#edit-dialog"));

  // If the cookie name is not set
  if(!name.val())
  {
    name.next().text(WebDeveloper.Generated.storedLocale.nameCannotBeEmpty);
    name.closest(".control-group").addClass("error");

    valid = false;
  }

  // If the cookie host is not set
  if(!host.val())
  {
    host.next().text(WebDeveloper.Generated.storedLocale.hostCannotBeEmpty);
    host.closest(".control-group").addClass("error");

    valid = false;
  }

  // If the cookie path is not set
  if(!path.val())
  {
    path.next().text(WebDeveloper.Generated.storedLocale.pathCannotBeEmpty);
    path.closest(".control-group").addClass("error");

    valid = false;
  }

  // If the cookie is not a session cookie
  if(!$("#cookie-session").prop("checked"))
  {
    var expiresValue = expires.val().trim();

    // If the cookie expires is not set
    if(!expiresValue)
    {
      expires.next().text(WebDeveloper.Generated.storedLocale.expiresCannotBeEmpty);
      expires.closest(".control-group").addClass("error");

      valid = false;
    }
    else if(new Date(expiresValue) == "Invalid Date")
    {
      expires.next().text(WebDeveloper.Generated.storedLocale.expiresNotValid);
      expires.closest(".control-group").addClass("error");

      valid = false;
    }
  }

  return valid;
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
