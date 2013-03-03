// Copyright 2012 Google Inc. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// This script is a content script that should be run within developer
// tools pages that are performing remote debugging (those pages with
// locations that match "http://*/*/devtools.html?*").


(function() {

  // addExtensionWrapper will be toStringed and injected into and run directly
  // in the developer tools page. There, for Chrome 16 or newer, use
  // addExtension to insert our extension into the remote devtools page.

  function addExtensionWrapper(url)
  {
    if (typeof addExtension === 'function') {
      addExtension(url);
      console.log('PageSpeed injected into a devtools page.');
    } else {
      console.log('Cannot add extension PageSpeed to devtools.');
    }
  }

  // Create a link to the PageSpeed landing page.
  var pagespeedURL = escape(chrome.extension.getURL('devtools-page.html'));

  var script = document.createElement('script');
  script.innerText = ('(' + addExtensionWrapper.toString() +
                      ")(unescape('" + pagespeedURL + "'));");
  document.body.appendChild(script);

})();
