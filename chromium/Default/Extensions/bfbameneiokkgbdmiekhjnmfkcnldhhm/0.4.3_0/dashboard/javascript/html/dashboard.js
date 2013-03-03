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

}(window.jQuery);var WebDeveloper = WebDeveloper || {};

WebDeveloper.Generated                          = WebDeveloper.Generated || {};
WebDeveloper.Generated.ancestorSingleLineHeight = 20;
WebDeveloper.Generated.ancestorContainer        = null;
WebDeveloper.Generated.ancestors                = null;

// Adjusts the ancestors
WebDeveloper.Generated.adjustAncestors = function(adjustor)
{
  // Loop through the ancestors
  WebDeveloper.Generated.ancestors.each(function()
  {
    adjustor($(this));
  });
};

// Hides ancestors from the middle of the path
WebDeveloper.Generated.hideAncestors = function()
{
  var middleAncestor = $(".web-developer-middle-ancestor");

  middleAncestor.prevAll(":visible").first().add(middleAncestor.nextAll(":visible").eq(0)).hide();
};

// Hides ancestors from the middle of the path
WebDeveloper.Generated.populateAncestors = function(ancestors)
{
  $("#content").empty().get(0).appendChild(ancestors);
  WebDeveloper.Generated.resizeAncestors(true);
};

// Resizes the ancestors
WebDeveloper.Generated.resizeAncestors = function(reset)
{
  var currentHeight  = 0;
  var previousHeight = 0;

  // If resetting or the ancestor container and ancestors are not set
  if(reset || (!WebDeveloper.Generated.ancestorContainer && !WebDeveloper.Generated.ancestors))
  {
    WebDeveloper.Generated.ancestorContainer = $(".breadcrumb");
    WebDeveloper.Generated.ancestors         = $("li", WebDeveloper.Generated.ancestorContainer);
  }

  WebDeveloper.Generated.toggleMiddleAncestor(true);

  WebDeveloper.Generated.adjustAncestors(function(ancestor) { WebDeveloper.Generated.setAncestorDescription(ancestor, true, true, 0); });

  // If the ancestors are wrapping
  if(WebDeveloper.Generated.ancestorContainer.height() > WebDeveloper.Generated.ancestorSingleLineHeight)
  {
    WebDeveloper.Generated.adjustAncestors(function(ancestor) { WebDeveloper.Generated.setAncestorDescription(ancestor, true, true, 30); });
  }

  // If the ancestors are wrapping
  if(WebDeveloper.Generated.ancestorContainer.height() > WebDeveloper.Generated.ancestorSingleLineHeight)
  {
    WebDeveloper.Generated.adjustAncestors(function(ancestor) { WebDeveloper.Generated.setAncestorDescription(ancestor, true, false, 0); });
  }

  // If the ancestors are wrapping
  if(WebDeveloper.Generated.ancestorContainer.height() > WebDeveloper.Generated.ancestorSingleLineHeight)
  {
    WebDeveloper.Generated.adjustAncestors(function(ancestor) { WebDeveloper.Generated.setAncestorDescription(ancestor, true, false, 16); });
  }

  // If the ancestors are wrapping
  if(WebDeveloper.Generated.ancestorContainer.height() > WebDeveloper.Generated.ancestorSingleLineHeight)
  {
    WebDeveloper.Generated.adjustAncestors(function(ancestor) { WebDeveloper.Generated.setAncestorDescription(ancestor, false, false, 0); });
  }

  // If the ancestors are wrapping
  if(WebDeveloper.Generated.ancestorContainer.height() > WebDeveloper.Generated.ancestorSingleLineHeight)
  {
    WebDeveloper.Generated.toggleMiddleAncestor(false);
  }

  currentHeight = WebDeveloper.Generated.ancestorContainer.height();

  // While the ancestors are wrapping
  while(currentHeight > WebDeveloper.Generated.ancestorSingleLineHeight && currentHeight != previousHeight)
  {
    previousHeight = WebDeveloper.Generated.ancestorContainer.height();

    WebDeveloper.Generated.hideAncestors();

    currentHeight = WebDeveloper.Generated.ancestorContainer.height();
  }
};

// Sets the ancestor description
WebDeveloper.Generated.setAncestorDescription = function(ancestor, includeId, includeClasses, truncateLength)
{
  var ancestorData        = ancestor.data("web-developer-element-id");
  var ancestorDescription = ancestor.data("web-developer-element-tag");

  // If including the id and it is set
  if(includeId && ancestorData)
  {
    ancestorDescription += ancestorData;
  }

  ancestorData = ancestor.data("web-developer-element-classes");

  // If including the classes and they are set
  if(includeClasses && ancestorData)
  {
    ancestorDescription += ancestorData;
  }

  // If truncating the length and the description is longer than the truncate length
  if(truncateLength && ancestorDescription.length > truncateLength)
  {
    var halfLength = truncateLength / 2;

    ancestorDescription = ancestorDescription.substring(0, halfLength) + "..." + ancestorDescription.substr(-halfLength);
  }

  // If this is the active ancestor
  if(ancestor.hasClass("active"))
  {
    ancestor.text(ancestorDescription);
  }
  else
  {
    $("a", ancestor).text(ancestorDescription);
  }
};

// Toggles the middle ancestor
WebDeveloper.Generated.toggleMiddleAncestor = function(display)
{
  // If displaying the middle ancestor
  if(display)
  {
    WebDeveloper.Generated.ancestors.show();
    $(".web-developer-middle-ancestor").removeClass("web-developer-middle-ancestor");
  }
  else
  {
    var middleAncestor = WebDeveloper.Generated.ancestors.eq(Math.floor(WebDeveloper.Generated.ancestors.length / 2)).addClass("web-developer-middle-ancestor");

    $("a", middleAncestor).text("...");
  }
};

$(function()
{
  $(window).on("resize", WebDeveloper.Generated.resizeAncestors);
});
var WebDeveloper = WebDeveloper || {};

WebDeveloper.Dashboard = WebDeveloper.Dashboard || {};

// Initializes the ancestors
WebDeveloper.Dashboard.initializeAncestors = function(event)
{
  WebDeveloper.Generated.ancestorContainer = $(event.target);
  WebDeveloper.Generated.ancestors         = $("li", WebDeveloper.Generated.ancestorContainer);

  WebDeveloper.Generated.resizeAncestors();
};

window.addEventListener("web-developer-initialize-ancestors-event", WebDeveloper.Dashboard.initializeAncestors, false);
