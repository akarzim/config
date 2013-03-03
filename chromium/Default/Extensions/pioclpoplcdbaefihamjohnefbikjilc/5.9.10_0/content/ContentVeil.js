function ContentVeil() {
  "use strict";

  // @TODO: save() and restore() aren't properly used here, so if we do things like add transforms in founctions,
  // we probably break other functions' notion of how to render things.

  var veil = document.createElement("div");
  var inner = document.createElement("div");
  veil.appendChild(inner);

  veil.style.boxSizing = "border-box";
  veil.style.borderStyle = "solid";
  veil.style.borderColor = "rgba(0, 0, 0, 0.7)";

  inner.style.border = "4px solid rgba(255, 255, 0, 0.7)";
  inner.style.height = "100%";
  inner.style.boxSizing = "border-box";

  // We keep a record of what we're currently showing (at least in some cases) so that we can update it in case the
  // state of the page changes (like if the user scrolls).
  var currentlyShownRect = null;
  var currentRectOffsetTop = 0;
  var currentRectOffsetLeft = 0;
  var currentlyStatic = false;

  function reset() {
    currentlyShownRect = null;
    currentRectOffsetTop = 0;
    currentRectOffsetLeft = 0;

    showElements("embed");

    veil.style.position = "fixed";
    veil.style.top = "0px";
    veil.style.left = "0px";
    veil.style.zIndex = "9999999999999990";

    blank();
  }

  function blank() {
    veil.style.height = document.documentElement.clientHeight + "px";
    veil.style.width = document.documentElement.clientWidth + "px";
  }

  function gray() {
    show();
    inner.style.display = "none";
    veil.style.backgroundColor = veil.style.borderColor;
  }

  function show() {
    inner.style.display = "";
    veil.style.backgroundColor = "";
    if (!veil.parentNode) {
      document.documentElement.appendChild(veil);
    }
  }

  function hide() {
    if (veil.parentNode) {
      veil.parentNode.removeChild(veil);
    }
  }

  // Makes a rectangle bigger in all directions by the number of pixels specified (or smaller, if 'amount' is 
  // negative). Returns the new rectangle.
  function expandRect(rect, amount) {
    return {
      top: (rect.top - amount),
      left: (rect.left - amount),
      bottom: (rect.bottom + amount),
      right: (rect.right + amount),
      width: (rect.width + (2 * amount)),
      height: (rect.height + (2 * amount))
    };
  }

  // DrawStroke is obsolete, it is now always "true".
  function revealRect(rect, drawStroke, staticView) {

    // Save this info.
    currentlyShownRect = rect;
    currentRectOffsetTop = document.body.scrollTop;
    currentRectOffsetLeft = document.body.scrollLeft;
    currentlyStatic = staticView;

    // We expand the rectangle for two reasons. 
    // 1) we want to expand it by the width of the stroke, so that when we draw out outline, it doesn't overlap our
    // content.
    // 2) We want to leave a little extra room around the content for aesthetic reasons.
    rect = expandRect(rect, 8);
    var x = rect.left;
    var y = rect.top;
    var width = rect.width;
    var height = rect.height;

    var veilWidth = veil.style.width.replace("px", "");
    var veilHeight = veil.style.height.replace("px", "");

    var offScreen = false;
    if (y + height < 0) {
      offScreen = true;
    }
    else if (y > veilHeight) {
      offScreen = true;
    }
    else if (x + width < 0) {
      offScreen = true;
    }
    else if (x > veilWidth) {
      offScreen = true;
    }

    if (offScreen) {
      veil.style.borderLeftWidth = veilWidth + "px";
      veil.style.borderTopWidth = veilHeight + "px";
      veil.style.borderRightWidth = "0px";
      veil.style.borderBottomWidth = "0px";
      inner.style.display = "none";
      return;
    }

    inner.style.display = "block";
    veil.style.borderLeftWidth = Math.max(x, 0) + "px";
    veil.style.borderTopWidth = Math.max(y, 0) + "px";
    veil.style.borderRightWidth = Math.max((veilWidth - x - width), 0) + "px";
    veil.style.borderBottomWidth = Math.max((veilHeight - y - height), 0) + "px";
  }

  function revealStaticRect(rect, drawStroke) {
    revealRect(rect, drawStroke, true);
  }

  function outlineElement(element, scrollTo) {
    // See notes in Preview.js for why we use this method instead of just calling element.getBoundingClientRect().
    var rect = contentPreview.computeDescendantBoundingBox(element);
    if (rect) {

      var mutableRect = {
        top: rect.top,
        bottom: rect.bottom,
        left: rect.left,
        right: rect.right,
        width: rect.width,
        height: rect.height,
      }

      // We don't want to adjust ourselves into odd positions if the page is scrolled.
      var sLeft = document.body.scrollLeft;
      var sTop = document.body.scrollTop;

      var BORDER_MIN = 9;
      if (mutableRect.left < (BORDER_MIN - sLeft)) {
        mutableRect.width -= (BORDER_MIN - sLeft) - mutableRect.left;
        mutableRect.left = (BORDER_MIN - sLeft);
      }
      if (mutableRect.top < (BORDER_MIN - sTop)) {
        mutableRect.height -= (BORDER_MIN - sTop) - mutableRect.top;
        mutableRect.top = (BORDER_MIN - sTop);
      }

      // Get the wider of our two possible widths.
      var width = Math.max(document.body.scrollWidth, window.innerWidth);

      if (mutableRect.right > (width - BORDER_MIN - sLeft)) {
        mutableRect.right = (width - BORDER_MIN - sLeft);
        mutableRect.width = mutableRect.right - mutableRect.left;
      }

      reset();
      revealRect(mutableRect, true);
      if (scrollTo) {
        element.scrollIntoViewIfNeeded(true);
        // Use the following if this makes it into Firefox or other Gecko-based browsers:
        // element.scrollIntoView(false);
      }
      hideElements("embed", element);
      show();
    }
    else {
      console.warn("Couldn't create rectangle from element: " + element.toString());
    }
  }

  function hideElements (tagName, exceptInElement) {
    var els = document.getElementsByTagName(tagName);
    for (var i = 0; i < els.length; i++) {
      els[i].enSavedVisibility = els[i].style.visibility;
      els[i].style.visibility = "hidden";
    }
    showElements(tagName, exceptInElement);
  }

  function showElements (tagName, inElement) {
    if (!inElement) {
      inElement = document;
    }
    var els = inElement.getElementsByTagName(tagName);
    for (var i = 0; i < els.length; i++) {
      if (typeof els[i].enSavedVisibility !== "undefined") {
        els[i].style.visibility = els[i].enSavedVisibility;
        delete els[i].enSavedVisibility;
      }
    }
  }

  // If we're currently showing a rectangle, and it's not static, we'll redraw on scroll.
  window.addEventListener("scroll", function(e) {
    if (currentlyShownRect && !currentlyStatic) {
      var rect = {
        top: currentlyShownRect.top,
        bottom: currentlyShownRect.bottom,
        left: currentlyShownRect.left,
        right: currentlyShownRect.right,
        width: currentlyShownRect.width,
        height: currentlyShownRect.height
      };

      var vert = document.body.scrollTop - currentRectOffsetTop;
      var horiz = document.body.scrollLeft - currentRectOffsetLeft;

      if (!vert && !horiz) {
        return;
      }

      rect.top -= vert;
      rect.bottom -= vert;
      rect.left -= horiz;
      rect.right -= horiz;

      blank();
      revealRect(rect);
    }
  });

  // Public API:
  this.reset = reset;
  this.show = show;
  this.gray = gray;
  this.hide = hide;
  this.revealRect = revealRect;
  this.revealStaticRect = revealStaticRect;
  this.outlineElement = outlineElement;
  this.expandRect = expandRect;

  Object.preventExtensions(this);
}

