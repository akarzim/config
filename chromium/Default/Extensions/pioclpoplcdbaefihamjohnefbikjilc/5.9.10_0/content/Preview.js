function ContentPreview() {
  "use strict";

  var contentVeil = new ContentVeil();

  // Stores a reference to the last element that we used as a preview.
  var previewElement = null;

  function buildPreviewLegend() {

    var legend = document.createElement("div");
    legend.id = "evernotePreviewLegend";
    if (SAFARI) {
      legend.className = "evernotePreviewLegendSafari";
    }
    else {
      legend.className = "evernotePreviewLegend";
    }

    legend.dir = "ltr"; // It ends up backwards on right-to-left pages otherwise.

    var nudgeImgs = [
      // Image name                 Message identifier
      ["nudge-icon-arrow-up.png",   "contentPreview_expandSelection"],
      ["nudge-icon-arrow-down.png", "contentPreview_shrinkSelection"],
      ["nudge-icon-arrow-lr.png",   "contentPreview_moveSelection"],
      ["nudge-icon-return.png",     "contentPreview_clipArticle"]
    ];

    var ul = document.createElement("UL");

    for (var i = 0; i < nudgeImgs.length; i++) {
      // @TODO: The div in this block seems totally unnessecary, we could refactor the CSS to get rid of it.
      var li = document.createElement("li");
      var div = document.createElement("div");
      var img = document.createElement("img");
      var message = document.createTextNode(" " + Browser.i18n.getMessage(nudgeImgs[i][1]));
      div.className = "keyIcon";
      img.width = "49";
      img.height = "22";
      img.src = Browser.extension.getURL("images/nudge-icons/" + nudgeImgs[i][0]);
      if (devicePixelRatio >= 2) {
        img.src = Browser.extension.getURL("images/nudge-icons/" + nudgeImgs[i][0].replace(/(\.png$)/, "@2x$1"));
      }

      div.appendChild(img);
      li.appendChild(div);
      li.appendChild(message);
      ul.appendChild(li);
    }
    legend.appendChild(ul);
    return legend;
  }

  var previewLegend = buildPreviewLegend();

  function showPreviewLegend() {
    if (!previewLegend.parentNode) {
      document.documentElement.appendChild(previewLegend);
    }
    previewLegend.className = previewLegend.className.replace(/\s*hidden|visible\s*/, "");
    previewLegend.className += " visible";
  }

  function hidePreviewLegend() {
    previewLegend.className = previewLegend.className.replace(/\s*hidden|visible\s*/, "");
    previewLegend.className += " hidden";
  }

  function removePreviewLegend() {
    if (previewLegend.parentNode) {
      previewLegend.parentNode.removeChild(previewLegend);
    }
  }

  function buildUrlElement() {
    var urlEl = document.createElement("div");
    urlEl.id = "evernotePreviewContainer";
    urlEl.className = "evernotePreviewContainer evernotePreviewUrlContainer";
    return urlEl;
  }

  var urlElement = buildUrlElement();

  function showUrlElement() {
    if (!urlElement.parentNode) {
      document.documentElement.appendChild(urlElement);
    }

    // Make sure we're centered in the window.
    var elStyle = window.getComputedStyle(urlElement, '');
    var w = parseInt(elStyle.getPropertyValue("width"));
    var h = parseInt(elStyle.getPropertyValue("height"));
    if (w && h) {
      urlElement.style.marginLeft = (0 - w / 2) + "px";
      urlElement.style.marginTop = (0 - h / 2) + "px";
    }
  }

  function hideUrlElement() {
    if (urlElement.parentNode) {
      urlElement.parentNode.removeChild(urlElement);
    }
  }

  function previewUrl(request, sender, sendResponse) {
    var title, url, favIconUrl;
    if (request.args) {
      title = request.args.title;
      url = request.args.url;
      favIconUrl = request.args.favIconUrl;
    }
    clear();
    contentVeil.reset();
    contentVeil.gray();
    title = title ? title : window.document.title;
    url = url ? url : window.location.href;
    if (!favIconUrl) {
      if (typeof pageInfo !== undefined) {
        favIconUrl = pageInfo.getFavIconUrl();
      }
    }
    urlElement.innerHTML = GlobalUtils.createUrlClipContent(title, url, favIconUrl);
    showUrlElement();
  }

  // This doesn't remove internal state of previewElement, because another script may not have finished clipping until
  // after the page looks 'clear'.
  function clear() {
    contentVeil.reset();
    contentVeil.hide();
    hideUrlElement();
    removePreviewLegend();
  }

  function _previewArticle (showHelp) {
    if (previewElement)
    {
      var selectionFrame;
      if (typeof pageInfo !== undefined) {
        selectionFrame = pageInfo.getSelectionFrame();
      }

      if (selectionFrame) {

        var rect = {
          width: selectionFrame.width,
          height: selectionFrame.height,
          top: selectionFrame.offsetTop,
          bottom: (selectionFrame.height + selectionFrame.offsetTop),
          left: selectionFrame.offsetLeft,
          right: (selectionFrame.width + selectionFrame.offsetLeft)
        };
        contentVeil.revealStaticRect(contentVeil.expandRect(rect, -9), true);
        contentVeil.show();
      }
      else {
        contentVeil.outlineElement(previewElement, true);
      }
      if (showHelp) {
        showPreviewLegend();
        setTimeout(hidePreviewLegend, 6000);
      }
    }
    else {
      console.warn("Couldn't find a preview element. We should switch to 'full page' mode.");
    }
  }

  function previewArticle (request, sender, sendResponse) {
    var showHelp = (request.args && request.args.showHelp);

    clear();
    previewElement = null;

    if (typeof pageInfo !== undefined) {
      previewElement = pageInfo.getDefaultArticle(function(el){
        previewElement = el;
        _previewArticle(showHelp);
      });
    }
    else {
      console.warn("Couldn't find a 'pageInfo' object.");
    }
  }

  // When nudging the preview around the page, we want to skip nodes that aren't interesting. This includes empty
  // nodes, containers that have identical contents to the already selected node, invisible nodes, etc.
  // @TODO: There's a lot more we could probably add here.
  function looksInteresting(candidate, given) {

    if (!candidate) {
      console.warn("Can't determine if 'null' is interesting (it's probably not).");
      return false;
    }
    // This is the parent of our 'HTML' tag, but has no tag itself. There's no reason it's ever more interesting than
    // the HTML element.
    if (candidate === window.document) {
      return false;
    }

    // We don't want to clip the clipper controls notification.
    // @TODO: Probably want something similar for the content veil.
    if (candidate === previewLegend) {
      return false;
    }

    // Elements with neither text nor images are not interesting.
    if (candidate.textContent.trim() == "" && (candidate.getElementsByTagName("img").length === 0)) {
      return false;
    }

    // Elements with 0 area are not interesting.
    var rect = candidate.getBoundingClientRect();
    if (!rect.width || !rect.height) {
      return false;
    }

    // Invisible elements are not interesting.
    var style = getComputedStyle(candidate);
    if ((style.visibility === "hidden") || (style.display === "none")) {
      return false;
    }

    // If the nodes have a parent/child relationship, then they're only interesting if their visible contents differ.
    if (candidate.parentNode && given.parentNode) {
      if ((candidate.parentNode == given) || (given.parentNode == candidate)) {
        if (sameElement(candidate, given)) {
          return false;
        }
      }
    }
    return true;
  }

  function sameElement(a, b) {
    var aRect = a.getBoundingClientRect();
    var bRect = b.getBoundingClientRect();
    if (aRect.bottom == bRect.bottom && aRect.height == bRect.height
        && aRect.left == bRect.left && aRect.right == bRect.right
        && aRect.top == bRect.top && aRect.width == bRect.width) {
      return false;
    } else if ((a.textContent === b.textContent) &&
      (a.getElementsByTagName("img").length === b.getElementsByTagName("img").length)) {
      return false;
    }
  }

  function descendTreeUntilUniqueElement(parent) {
    for (var i = 0; i < parent.children.length; i++) {
      if (sameElement(parent.children[i], parent)) {
        return descendTreeUntilUniqueElement(parent.children[i]);
      } else if (looksInteresting(parent.children[i], parent)) {
        return parent.children[i];
      }
    }
    return parent;
  }

  // Returns the current article element, which may not be the same as the auto-detected one if the user has 'nudged'
  // the selection around the page.
  function getArticleElement() {
    return previewElement;
  }

  // What this does:
  // 'previewElement' is the HTML element node that we will clip when an "article" clip is selected. In general, this
  // is chosen by our Clearly implementation, and should be a div or something containing the main page content.
  // In case the user wants to adjust the auto-selection, though, The popup window registers event handlers for the 
  // arrow keys, and whenever one is pressed, it will pass us a "nudge_preview" message (unless nudging is disabled).
  // The nudge_preview message contains a "direction" property corresponding to the arrow key pressed: either "up",
  // "down", "left" or "right".
  //
  // Nudging "up" moves previewElement one level up in the DOM tree, such that the "article" becomes the previous
  // article's parent node. This operation will also save the currently selected node before moving up the tree.
  //
  // Nudging "down" will move the previewElement down the DOM tree to the current article's first child element, unless
  // we had already saved an article at this level in the tree, in which case we will select the previously selected
  // article element.
  //
  // Nudging left or right will move the previewElement to the the current previewElement's previous or next sibling
  // nodes, respectively. It will also adjust the "saved" article at this level in the tree, such that if the user were 
  // to nudge up and then down, they would end up back at the same element where they started.
  //
  // There are some checks in here to skip over nodes with no visible difference (i.e., container divs with no content
  // of their own) and to make sure we haven't run out of bounds in the DOM tree.
  //
  // Once the previewElement has cahnged, we'll repaint our preview overlay.
  function nudgePreview(request, sender, sendResponse) {
    var direction = request.args.direction;
    if (!previewElement) {
      return;
    }

    var oldPreview = previewElement;

    switch (direction) {
      case "up":
        var temp = previewElement.parentNode;
        while (temp) {
          if (looksInteresting(temp, previewElement)) {
             // If we move up and then down, we want to move back to where we started, not the first child.
            temp.enNudgeDescendToNode = previewElement;
            previewElement = temp;
            break;
          }
          temp = temp.parentNode;
        }
        break;
      case "down":
        if (previewElement.enNudgeDescendToNode)
        {
          var temp = previewElement.enNudgeDescendToNode; 
          // @TODO: make sure we clean these up somewhere else if we never reverse our nudging.
          delete previewElement.enNudgeDescendToNode;
          previewElement = temp;
          break;
        }
        previewElement = descendTreeUntilUniqueElement(previewElement);
        break;
      case "left":
        var temp = previewElement.previousElementSibling;
        while (temp) {
          if (looksInteresting(temp, previewElement)) {
            previewElement = temp;
            break;
          }
          temp = temp.previousElementSibling;
        }
        break;
      case "right":
        var temp = previewElement.nextElementSibling;
        while (temp) {
          if (looksInteresting(temp, previewElement)) {
            previewElement = temp;
            break;
          }
          temp = temp.nextElementSibling;
        }
        break;
      default:
        console.warn("Unhandled nudge direction: " + direction);
    }

    // Drawing is expensive so don't bother if nothing changed.
    if (oldPreview !== previewElement) {
      contentVeil.outlineElement(previewElement, true);
    }
  }

  function previewFullPage() {

    var borderWidth = 10;
    var w = window.innerWidth;
    var h = window.innerHeight;

    var rect = {
      bottom: (h - borderWidth),
      top: (borderWidth),
      left: (borderWidth),
      right: (w - borderWidth),
      width: (w - (2 * borderWidth)),
      height: (h - (2 * borderWidth))
    }

    clear();
    contentVeil.reset();
    contentVeil.revealStaticRect(rect, true);
    contentVeil.show();
  }

  // Creates the union of two rectangles, which is defined to be the smallest rectangle that contains both given
  // rectangles.
  function unionRectangles(rect1, rect2) {
    var rect = {
      top: (Math.min(rect1.top, rect2.top)),
      bottom: (Math.max(rect1.bottom, rect2.bottom)),
      left: (Math.min(rect1.left, rect2.left)),
      right: (Math.max(rect1.right, rect2.right))
    }
    rect.width = rect.right - rect.left;
    rect.height = rect.bottom - rect.top;

    return rect;
  }

  // Returns true if the rectangles match, false otherwise.
  function rectanglesEqual(rect1, rect2) {
    if (!rect1 && !rect2) return true;
    if (!rect1) return false;
    if (!rect2) return false;
    if (rect1.top != rect2.top) return false;
    if (rect1.bottom != rect2.bottom) return false;
    if (rect1.left != rect2.left) return false;
    if (rect1.right != rect2.right) return false;
    if (rect1.width != rect2.width) return false;
    if (rect1.height != rect2.height) return false;
    return true;
  }

  // If the user triple-clicks a paragraph, we will often get a selection that includes the next paragraph after the
  // selected one, but only up to offset 0 in that paragraph. This causes the built in getBoundingClientRect to give a
  // box that includes the whole trailing paragraph, even though none of it is actually selected. Instead, we'll build
  // our own bounding rectangle that omits the trailing box.
  // @TODO: Currently this computes a box that is *too big* if you pass it a range that doesn't have start and/or end
  // offsets that are 0, because it will select the entire beginning and ending node, instead of jsut the selected
  // portion.
  function computeAlternateBoundingBox(range) {
    
    // If the end of selection isn't at offset 0 into an element node (rather than a text node), then we just return the
    // original matching rectangle.
    if ((range.endOffset !== 0) || (range.endContainer.nodeType !== Node.ELEMENT_NODE)) {
      var rect = range.getBoundingClientRect();
      var mutableRect = {
        top: rect.top,
        bottom: rect.bottom,
        left: rect.left,
        right: rect.right,
        width: rect.width,
        height: rect.height
      };
      return mutableRect;
    }

    // This is the one we don't want.
    var endElementRect = null;
    try {
      endElementRect = range.endContainer.getBoundingClientRect();
    }
    catch(ex) {
      console.warn("Couldn't get a bounding client rect for our end element, maybe it's a text node.");
    }

    // We look for a rectangle matching our end element, and if we find it, we don't copy it to our list to keep.
    // You'd think we could just grab the last element in range.getClientRects() here and trim that one, which might be
    // true, but the spec makes no claim that these are returned in order, so I don't want to rely on that.
    // We keep track if we remove a rectangle, as we're only trying to remove one for the trailing element. If there are
    // more than one matching rectangle, we want to keep all but one of them.
    var foundEnd = false;
    var keptRects = [];
    var initialRects = range.getClientRects();
    for (var i = 0; i < initialRects.length; i++) {
      if (rectanglesEqual(endElementRect, initialRects[i]) && !foundEnd) {
        foundEnd = true;
      }
      else {
        keptRects.push(initialRects[i]);
      }
    }

    // Now compute our new bounding box and return that.
    if (keptRects.length == 0) return range.getBoundingClientRect();
    if (keptRects.length == 1) return keptRects[0];

    var rect = keptRects[0];
    for (var i = 1; i < keptRects.length; i++) {
      rect = unionRectangles(rect, keptRects[i]);
    }

    return rect;
  }

  // If every edge of the rectangle is in negative space,
  function rectIsOnScreen(rect) {
    // rtl pages have actual content in "negative" space. This case could be handled better.
    if (document.dir == "rtl") {
      return false;
    }
    // If both top and bottom are in negative space, we can't see this.
    if (rect.bottom < 0 && rect.top < 0) {
      return false;
    }
    // Or, if both left and right are in negative space, we can't see this.
    if (rect.left < 0 && rect.right < 0) {
      return false;
    }
    // Probably visible.
    return true;
  }

  function applyElementRect(element, rect) {
    var newRect = rect;
    var tempRect = element.getBoundingClientRect();

    // Skip elements that are positioned off screen.
    if (!rectIsOnScreen(tempRect)) {
      return newRect;
    }
    // We skip anything with an area of one px or less. This is anything that has "display: none", or single pixel
    // images for loading ads and analytics and stuff. Most hidden items end up at 0:0 and will stretch our rectangle
    // to the top left corner of the screen if we include them. Sometimes single pixels are deliberately placed off
    // screen.
    if ((tempRect.width * tempRect.height) > 1) {
      newRect = unionRectangles(element.getBoundingClientRect(), rect);
    }

    // We won't descend into hidden elements.
    if (getComputedStyle(element).display == "none") {
      return newRect;
    }

    if (element.children) {
      for (var i = 0; i < element.children.length; i++) {
        newRect = applyElementRect(element.children[i], newRect);
      }
    }
    return newRect;
  }

  // In the case of positioned elements, a bounding box around an element doesn't necessarily contain its child
  // elements, so we have this method to combine all of these into one bigger box. ContentVeil calls this function.
  function computeDescendantBoundingBox(element) {
    if (!element) return {top: 0, bottom: 0, left: 0, right: 0, width: 0, height: 0};
    return applyElementRect(element, element.getBoundingClientRect());
  }

  function previewSelection() {

    var selection;
    var selectionFrame;
    if (typeof pageInfo !== undefined) {
      selection = pageInfo.getSelection();
      // If our selection is in a frame or iframe, we'll compute an offset relative to that, so we need to adjust it by
      // the offset of the frame.
      selectionFrame = pageInfo.getSelectionFrame();
    }
 
    contentVeil.reset();

    var frameRect = null;
    if (selectionFrame) {
      frameRect = selectionFrame.getBoundingClientRect();
    }

    var range, rect, i;

    // If !selection, then something has gone awry.
    if (selection) {
      clear();
      contentVeil.reset();
      // We attempt to highlight each selection, but this hasn't been tested for more than a single selection.
      for (i = 0; i < selection.rangeCount; i++) {
        range = selection.getRangeAt(i);

        rect = computeAlternateBoundingBox(range);

        // Actual adjustment mentioned earlier regarding frames.
        if (frameRect) {
          rect.left += frameRect.left;
          rect.right += frameRect.left;
          rect.top += frameRect.top;
          rect.bottom += frameRect.top;
        }

        contentVeil.revealRect(rect, true);
      }
    }
    contentVeil.show();
  }

  Browser.addMessageHandlers({
    preview_clear: clear,
    preview_nudge: nudgePreview,
    preview_article: previewArticle,
    preview_fullPage: previewFullPage,
    preview_selection: previewSelection,
    preview_url: previewUrl,
  });

  // Public API:
  this.getArticleElement = getArticleElement;
  this.looksInteresting = looksInteresting;
  this.computeDescendantBoundingBox = computeDescendantBoundingBox;

  Object.preventExtensions(this);
}

