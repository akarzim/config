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

'use strict';

var pagespeed_options = {

  saveCheckbox: function(id) {
    if (document.getElementById(id).checked) {
      localStorage.setItem(id, '1');
    } else {
      localStorage.removeItem(id);
    }
  },

  loadCheckbox: function(id) {
    document.getElementById(id).checked = !!localStorage.getItem(id);
  },

  getDefaultValue: function(id) {
    var default_value;
    if (id === 'localeId') {
      var default_locale = chrome.i18n.getMessage('@@ui_locale');
      default_value = default_locale ? default_locale : 'en_US';
    } else if (id === 'analyzeFilter') {
      default_value = 'all';
    }
    return default_value;
  },

  saveSelection: function(id) {
    if (!document.getElementById(id).value ||
        document.getElementById(id).value ===
        pagespeed_options.getDefaultValue(id)) {
      localStorage.removeItem(id);
    } else {
      localStorage.setItem(id, document.getElementById(id).value);
    }
  },

  loadSelection: function(id) {
    if (!localStorage.getItem(id)) {
      document.getElementById(id).value = pagespeed_options.getDefaultValue(id);
    } else {
      document.getElementById(id).value = localStorage.getItem(id);
    }
  },

  saveTextbox: function(id) {
    localStorage.setItem(id, document.getElementById(id).value);
  },

  loadTextbox: function(id) {
    document.getElementById(id).value = localStorage.getItem(id) || '';
  },

  save: function() {
    pagespeed_options.saveCheckbox('runAtOnLoad');
    pagespeed_options.saveCheckbox('noOptimizedContent');
    pagespeed_options.saveSelection('analyzeFilter');
    pagespeed_options.saveSelection('localeId');
  },

  load: function() {
    pagespeed_options.loadCheckbox('runAtOnLoad');
    pagespeed_options.loadCheckbox('noOptimizedContent');
    pagespeed_options.loadSelection('analyzeFilter');
    pagespeed_options.loadSelection('localeId');
  },

  reset: function() {
    localStorage.clear();
    pagespeed_options.load();
  },

  init: function() {
    document.addEventListener('click', pagespeed_options.save);
    document.addEventListener('keydown', pagespeed_options.save);
    document.addEventListener('keyup', pagespeed_options.save);
    pagespeed_options.load();
  }

};

pagespeed_options.init();

var resetButton = document.getElementById('reset-button');
resetButton.onclick = pagespeed_options.reset;

