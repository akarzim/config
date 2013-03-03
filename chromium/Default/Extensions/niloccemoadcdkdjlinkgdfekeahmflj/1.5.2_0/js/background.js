/*globals ril, webkitNotifications */
$(function(){function r(e){sendMessageToTab(e,{status:"error",error:"Sorry, you can only save valid web pages to Pocket."})}function i(e,t){t&&executeScriptInTab(e,"window.___PKT__URL_TO_SAVE = '"+t+"'"),executeScriptFromURLInTab(e,"js/r.js")}function s(e,t){isChrome()?executeScriptFromURLInTabWithCallback(e,"vendor/Autocomplete/Autocomplete.js",t):t()}function o(e){isChrome()&&chrome.browserAction.setIcon({tabId:e,path:{19:"../img/browser-action-icon-added-19.png",38:"../img/browser-action-icon-added-38.png"}})}function u(e,t){var s=e.id,a=e.title,f=t||e.url,c=this;if(!navigator.onLine){alert("Oops! You must be online to save this page.");return}if(!ril.isAuthorized()){n.showLoginWindow(e,function(){u(e,t)});return}if(!isValidURL(f)){r(e);return}if(isGoogleReaderURL(f)){sendMessageToTab(e,{action:"addOpenGoogleReaderArticle"});return}l(e,f,function(r){if(r.injected===!1)return;i(e,f),ril.add(a,f,{success:function(){o(e.id),sendMessageToTab(e,{status:"success"}),executeScriptInTab(e,"window.___PKT__URL_SAVED = '"+f+"'")},error:function(r,i){if(r===401){sendMessageToTab(e,{status:"unauthorized"}),n.showLoginWindow(e,function(){u(e,t)});return}sendMessageToTab(e,{status:"error",error:i.getResponseHeader("X-Error")})}})})}function l(e,t,n){if(isChrome())n({injected:!0});else if(getSetting("pocket.restart")===!0)n({injected:!0});else{if($.inArray(t,a)===-1){a.push(t),e.page.dispatchMessage("isSafariContentAvailable",{url:t}),setTimeout(function(){l(e,t,n)},250);return}if($.inArray(t,a)!==-1&&$.inArray(t,f)===-1){a.removeByValue(t),alert("Oops, This tab was open before you installed Pocket. Please restart Safari or refresh this page ("+String.fromCharCode("8984")+"R) in order to save it."),n({injected:!1});return}a.removeByValue(t),f.removeByValue(t),n({injected:!0})}}var e="1.5.2",t=!1,n;Array.prototype.removeByValue=function(e){for(var t=0;t<this.length;t++)if(this[t]==e){this.splice(t,1);break}},function(){function t(e,s){var o=e.linkUrl,u=e.selectionText||o;o||(o=s.url,u=s.title);if(!navigator.onLine){alert("Oops! You must be online to save this page.");return}if(!ril.isAuthorized()){n.showLoginWindow(s,function(){t(e,s)});return}if(!isValidURL(o)){r(s);return}l(s,o,function(r){if(r.injected===!1)return;i(s,o),ril.add(u,o,{success:function(){sendMessageToTab(s,{status:"success"}),executeScriptInTab(s,"window.___PKT__URL_SAVED = '"+o+"'")},error:function(r,i){if(r===401){sendMessageToTab(s,{status:"unauthorized"}),n.showLoginWindow(s,function(){t(e,s)});return}sendMessageToTab(s,{status:"error",error:i.getResponseHeader("X-Error")})}})})}isChrome()&&chrome.contextMenus.create({title:"Save to Pocket",contexts:["page","frame","editable","image","video","audio","link","selection"],onclick:t})}(),n=function(){function e(e,t){ril.afterLogin=t;if(isChrome()){var n=428,r=385;chrome.windows.create({url:"../html/login.html",type:"popup",width:n,height:r,left:Math.floor(screen.width/2-(n+1)/2),top:Math.floor(screen.height/2-r/2)},function(){})}else if(isSafari()){var i=e&&e.browserWindow?e.browserWindow:safari.application.activeBrowserWindow,s;if(i)for(var o=0;o<safari.extension.toolbarItems.length;o++)if(i==safari.extension.toolbarItems[o].browserWindow){s=safari.extension.toolbarItems[o];break}s||(s=safari.extension.toolbarItems[0]);if(!s.popover){var u=safari.extension.createPopover("com.ideashower.pocket.safari.login.popover",safari.extension.baseURI+"html/login.html",427,385);s.popover=u}s&&s.popover&&s.popover.contentWindow&&s.popover.contentWindow.reset&&s.popover.contentWindow.reset(),s.showPopover()}}return addMessageListener(function(t,n,r){if(t.action==="login"){var i=ril.afterLogin!==undefined;return ril.login(t.username,t.password,{success:function(){isChrome()&&(getAllTabs(function(e){$.each(e,function(e,t){chrome.browserAction.setPopup({tabId:t.id,popup:""})})}),sendMessage({action:"updateOptions"})),r({status:"success"}),isChrome()&&!i&&chrome.tabs.getSelected(null,function(e){u(e,e.url)})},error:function(e){r({status:"error",error:e.getResponseHeader("X-Error")})}}),!0}if(t.action==="logout")return ril.logout(),isChrome()&&getAllTabs(function(e){$.each(e,function(e,t){chrome.browserAction.setPopup({tabId:t.id,popup:"../html/login.html"})})}),r({}),!1;if(t.action==="showLoginWindow")return e(),r({}),!1}),{showLoginWindow:e}}(),addMessageListener(function c(e,t,u){var a,f,h;if(e.action==="getSetting")return u({value:getSetting(e.key)}),!1;if(e.action==="setSetting")return setSetting(e.key,e.value),u({}),!1;if(e.action==="isValidToken")return ril.isValidToken({success:function(){u({value:!0})},failure:function(){u({value:!1})}}),!0;if(e.action==="openTab")return openTabWithURL(e.url),u({}),!1;if(e.action==="getTags"){var p=function(){var e=getSetting("tags");d="",e&&(d=JSON.parse(e));var t=getSetting("usedTags");usedTags=[];if(t){var n=JSON.parse(t),r=[];for(var i in n)r.push(n[i]);r.sort(function(e,t){return e=new Date(e.timestamp),t=new Date(t.timestamp),e<t?-1:e>t?1:0});for(var s=0;s<r.length;s++)usedTags.push(r[s].tag);usedTags.reverse()}u({value:{tags:d,usedTags:usedTags}})};return s(t.tab,function(){ril.fetchTags({success:p,error:p})}),!0}if(e.action==="addURL")return a=t&&t.tab&&t.tab.id?t.tab.id:null,f=e.url,h=e.title,navigator.onLine?ril.isAuthorized()?isValidURL(f)?e.id&&e.id==="keyboard-shortcut"&&isGoogleReaderURL(f)?(sendMessageToTab(t.tab,{action:"addOpenGoogleReaderArticle"}),!1):(l(t.tab,f,function(r){if(r.injected===!1)return u(a,{status:"error"}),!1;i(t.tab,f),ril.add(h,f,{ref_id:e.ref_id,success:function(){e.showSavedToolbarIcon&&e.showSavedToolbarIcon===!0&&o(a),executeScriptInTab(t.tab,"window.___PKT__URL_SAVED = '"+f+"'"),u({status:"success"})},error:function(r,i){if(r===401)return u(a,{status:"unauthorized"}),n.showLoginWindow(function(){c(e,t,u)}),!0;u(a,{status:"error",error:i.getResponseHeader("X-Error")})}})}),!0):(r(t.tab),!1):(n.showLoginWindow(t.tab,function(){c(e,t,u)}),!0):(alert("Oops! You must be online to save this page."),!1);if(e.action=="addTags"){a=t&&t.tab&&t.tab.id?t.tab.id:null;if(!ril.isAuthorized())return n.showLoginWindow();f=e.url;var d=e.tags,v={action:"tags_add",tags:d,url:f};return ril.sendAction(v,{success:function(){var e=getSetting("usedTags"),t=e?JSON.parse(e):{};for(var n=0;n<d.length;n++){var r=d[n].trim(),i={tag:r,timestamp:new Date};t[r]=i}setSetting("usedTags",JSON.stringify(t)),u({status:"success"})},error:function(e,t){if(e===401)return sendMessageToTab(tab,{status:"unauthorized"}),n.showLoginWindow(tab,function(){handler(info,tab)}),!0;u({status:"error",error:t.getResponseHeader("X-Error")})}}),!0}}),isSafari()?safari.application.addEventListener("command",function(e){e.command==="handleSaveToPocket"&&u(safari.application.activeBrowserWindow.activeTab,e.userInfo)},!1):isChrome()&&(chrome.browserAction.onClicked.addListener(u),chrome.tabs.onUpdated.addListener(function(e,t,n){ril.isAuthorized()||chrome.browserAction.setPopup({tabId:e,popup:"../html/login.html"})}));var a=[],f=[];(function(){$.each({twitter:"true",greader:"true",hackernews:"true",reddit:"true","keyboard-shortcut":"true","keyboard-shortcut-add":isMac()?String.fromCharCode("8984")+"+"+String.fromCharCode("8679")+"+P":"ctrl+shift+S"},function(e,t){getSetting(e)||setSetting(e,t)}),!isMac()&&getSetting("keyboard-shortcut-add").match("command")&&setSetting("keyboard-shortcut-add",getSetting("keyboard-shortcut-add").replace(/command/g,"ctrl"));if(getSetting("installed")!=="true")setSetting("installed","true"),openTabWithURL("http://getpocket.com/installed/");else if(t&&getSetting("installed")==="true"&&(!getSetting("lastInstalledVersion")||getSetting("lastInstalledVersion")!=e)){var r=isChrome()?"chrome":"safari";openTabWithURL("http://getpocket.com/"+r+"/updated?v="+e+"&vo="+getSetting("lastInstalledVersion"))}setSetting("lastInstalledVersion",e);if(isSafari()){safari.extension.settings.openSettingsSafariCheckbox=!1,safari.application.addEventListener("message",function(e){var t=e.name,n=e.message;t==="safariContentAvailable"&&f.push(n.url)}),!getSetting("pocket.run")&&!getSetting("pocket.restart")?setSetting("pocket.restart",!0):getSetting("pocket.run")||(setSetting("pocket.restart",!0),setSetting("pocket.run",!0));var i=function(e){var t=e.key;if(t=="openSettingsSafariCheckbox"){var n=safari.application.activeBrowserWindow,r;n?r=n.openTab():r=safari.application.openBrowserWindow().activeTab,r.url=safari.extension.baseURI+"html/options.html",safari.application.activeBrowserWindow.activate()}};safari.extension.settings.addEventListener("change",i),safari.extension.addContentScriptFromURL(safari.extension.baseURI+"sites/twitter/twitter.ril.js",["http://twitter.com/*","https://twitter.com/*"],[],!0),safari.extension.addContentStyleSheetFromURL(safari.extension.baseURI+"sites/twitter/twitter.ril.css",["http://twitter.com/*","https://twitter.com/*"],[]),safari.extension.addContentScriptFromURL(safari.extension.baseURI+"sites/google-reader/google-reader.ril.js",["https://www.google.*/reader/view/*","http://www.google.*/reader/view/*","https://google.*/reader/view/*","http://google.*/reader/view/*"],[],!1),safari.extension.addContentStyleSheetFromURL(safari.extension.baseURI+"sites/google-reader/google-reader.ril.css",["https://www.google.*/reader/view/*","http://www.google.*/reader/view/*","https://google.*/reader/view/*","http://google.*/reader/view/*"],[]),safari.extension.addContentScriptFromURL(safari.extension.baseURI+"sites/hackernews/hn.pocket.js",["http://*.ycombinator.org/*","http://*.ycombinator.com/*"],[],!0),safari.extension.addContentScriptFromURL(safari.extension.baseURI+"sites/reddit/reddit.pocket.js",["*://*.reddit.com/*"],[],!0)}})()});