/*
***********************************************************************
 (C) 2008, 2009 by Abine, Inc. All Rights Reserved.

 This software is the confidential and proprietary information
 of Abine, Inc. ("Confidential Information"), subject
 to the Non-Disclosure Agreement and/or License Agreement you entered
 into with Abine. You shall use such Confidential Information only
 in accordance with the terms of said Agreement(s). Abine makes
 no representations or warranties about the suitability of the
 software. The software is provided with ABSOLUTELY NO WARRANTY
 and Abine will NOT BE LIABLE for ANY DAMAGES resulting from
 the use of the software.

 Contact license@getabine.com with any license-related questions.

 http://www.getabine.com

*/
var EXPORTED_SYMBOLS=[];Components.utils["import"]("resource://dntp/ff/overlay.js");Components.utils["import"]("resource://dntp/view.js");View.Global=function(a){this.parentConstructor.apply(this,arguments);this.doNotFade=!0;this.viewName="global";this.doNotAutoRefresh=!0};
View.Global.prototype={render:function(){var a="",b=DNTP.Config.getLastTrackerUpdated(),b=!b||(""+b).indexOf("NaN")>=0?new Date:new Date(parseInt(b)),d=DNTP.settings.trackerMap["*"]||{},e=DNTP.trackerNames,c=[],f;for(f in e)c.push(f);c.sort();b=b.toLocaleDateString();e=DNTP.Config.getUseGlobalAllow();d={lastUpdateDateString:b,globalSettings:d,ruleArray:c,useGlobalAllow:e};c=new DNTP.Template("settings");a+=c.render(this,d);return a},toggleUseRecs:function(){DNTP.Config.getUseGlobalAllow()==1?DNTP.Config.setUseGlobalAllow(0):
DNTP.Config.setUseGlobalAllow(1)},blockUnblock:function(a){a=a||event;for(a=a.target||a.srcElement;a.nodeName.toUpperCase()!="LI";)a=a.parentNode;var b=a.innerHTML.indexOf("cancel.gif")!=-1;DNTP.toggle_tracker(this.parentDoc,this.doc,b,a.firstChild.nodeValue,"*",!1)},blockAll:function(){DNTP.Config.set("global.blocked","1");DNTP.toggle_all_trackers(this.parentDoc,this.doc,!0);return!1},allowAll:function(){DNTP.Config.set("global.blocked","0");DNTP.toggle_all_trackers(this.parentDoc,this.doc,!1);return!1},
canShowOldUI:function(){return!DNTP.isNewerVersion(DNTP.getOriginalVersion(),"2.2.1.1116")},changeTheme:function(a){DNTP.Config.set("theme",a);DNTP.theme=null;DNTP.browser_name!="Firefox"?(this.close(),DNTP.alert("Please click on toolbar button again to see theme changes"),DNTP.initTheme()):(DNTP.initTheme(),this.showGlobal())}};View.registerDerivedClass(View.Global);