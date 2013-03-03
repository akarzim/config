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
View.prototype.show=function(){var a=this;this.win=a.doc.defaultView;var b=a.$("thePopup"),c=a.doc.createElement("div");c.style.minHeight="200px";a.doc.documentElement.appendChild(c);if(b){var d=b.offsetWidth;c.style.minHeight=b.offsetHeight-10+"px";c.style.minWidth=d-10+"px";b.parentNode.removeChild(b)}c.setAttribute("id","thePopup");DNTP.setTimeout(function(){if(a.noTemplate)c.className=a.viewName,c.innerHTML=a.render();else{a.addOnLoad(function(){a.changeInviteLink()});c.className=a.className()+
" "+a.viewName;var b=new DNTP.Template("layout",a.win);c.innerHTML=b.render(a,{body:a.render(),notifications:a.getNotifications()})}a.postShow()},150)};View.prototype.addNotificationIframe=function(a,b){bg.bridge.tabs.sendRequest(tabID,{message:"addIframe",link:a},function(){});b.preventDefault();this.close();return!1};
View.prototype.autoSizeIframe=function(){if(this.doc){var a=this.doc.getElementById("thePopup");if(a)a.style.minHeight="",a.style.minWidth="",setTimeout(function(){bg.resizePopup(a.offsetWidth,a.offsetHeight)},100)}};
View.prototype.fixExternalLinks=function(){if(this.doc){for(var a=this.doc.getElementsByClassName("externalLink"),b=Math.round(((new Date).getTime()-bg.installDate.getTime())/6E4),c=bg.bridge.app.getDetails(),d=0;d<a.length;d++)if(a[d].href&&a[d].href.match(/^http[s]?:\//))a[d].href=a[d].href.replace(/&m=.+]/,"")+"&m="+b+"&v="+c.version+"&o="+bg.ORIGIN+"&r="+bg.REVISION+"&ov="+bg.original_version;bridge.addLinkHandlers(this)}};
View.prototype.fixExternalLink=function(a){var b=bg.bridge.app.getDetails(),c=Math.round(((new Date).getTime()-bg.installDate.getTime())/6E4);a&&a.match(/^http[s]?:\//)&&(a=a.replace(/&m=.+]/,"")+"&m="+c+"&v="+b.version+"&o="+bg.ORIGIN+"&r="+bg.REVISION+"&ov="+bg.original_version);return a};
View.prototype.changeInviteLink=function(){var a=this.doc;if(a){var b=a.getElementById("DNTPinviteLink");b&&bg.webdb.getSetting("howitworks_clicked",0,function(a){if(a==0)b.innerHTML=DNTP._("dntp.howthisworks"),b.setAttribute("href","http://www.donottrackplus.com/link.php?type=how"),b.addEventListener("click",function(){bg.webdb.setSetting("howitworks_clicked",1);return!0},!0)})}};
View.prototype.markNotificationsSeen=function(){this.docElement&&(DNTP.NotificationManager.markNotificationsSeen(this.docElement.abineNotifications,this.doc),bridge.updateNotificationsTabData(tabID,this.docElement.abineNotifications))};View.prototype.attachUnloadHandler=function(){var a=this;this.windowUnloadHandler=function(){a.close()};DNTP.bind(this.doc.defaultView,"unload",this.windowUnloadHandler,!1)};
View.prototype.showGlobal=function(){(new DNTP.View.Global(this.docElement,this.doc)).show();return!1};