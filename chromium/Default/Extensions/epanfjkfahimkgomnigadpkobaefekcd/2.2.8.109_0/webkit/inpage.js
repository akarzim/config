/*
**********************************************************************************
 (C) 2011 by Abine, Inc. All Rights Reserved.

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
var domainMap={},trackerMap={},hostsSeen={},disabledHere=!1,replayEvents=[],topDomain=null,urlToNodeMap={},urlAlreadyBlocked={},TRUE_BLOCK=!1,abNoOp="var abNoOp=function(i,a){return (a&&a.length?a[0]:null)||true;},abSC=function(n,v){document.cookie=n+'='+v+';path=/;expires='+(new Date((new Date()).getTime()+(30000*60*60*24))).toGMTString();},abGC=function(n){return document.cookie.indexOf(n+'=')!=-1;},abAddNoOpMethods=function(o,m){m=m.split(',');for(var i=0;i<m.length;i++){if(m[i].match(/^#/)){o['get'+m[i].substr(1)]=o['set'+m[i].substr(1)]=abNoOp;}else{o[m[i]]=abNoOp;}}};";
abNoOp+="var abClickEvent=function(n){if(n.click){n.click();}else{var e=n.ownerDocument.createEvent('MouseEvents');e.initMouseEvent('click',true, true, n.ownerDocument.defaultView, 1,0,0,0,0,false,false,false,false,0,null);n.dispatchEvent(e);}};";
var shouldLoad=function(a){if(!disabledHere){var b=a.target,c=a.target.src||a.target.data||a.url||void 0,d=b.nodeName;if(!(d!="IFRAME"&&d!="IMG"&&d!="SCRIPT")&&c)if(c[0]=="/"&&(c=window.location.protocol+c),TRUE_BLOCK==!0)a=c.indexOf("#"),a!=-1&&(c=c.substr(0,a)),c in urlAlreadyBlocked?(urlBlocked(b,urlAlreadyBlocked[c].rule),delete urlAlreadyBlocked[c]):(c in urlToNodeMap||(urlToNodeMap[c]=[]),urlToNodeMap[c].push(b));else{var e=topDomain,f=c.getDomain();if(f&&(d=bridge.getMatchingRule(a,c,d,e,f),
d!==!1)){if(d){var e=d.name,g=d.isBlocked,h=!1;f in hostsSeen||(hostsSeen[f]=1,h=!0);if(g&&(a.preventDefault(),d.stub&&insertStub(e,d.stub,c),b.nodeName=="SCRIPT"&&DNTP.fireEvent(b,"load"),b.parentNode)){if(DNTP.Events.hasListener(e+" Blocked")){b.oldNextSibling=b.nextSibling;b.oldParentNode=b.parentNode;try{if(b.nodeName=="SCRIPT"&&typeof b.onload!="undefined")b.oldOnload=b.onload}catch(i){}DNTP.Events.trigger(e+" Blocked",window,e,b)}a.replaying&&b.parentNode.removeChild(b)}bridge.extension.sendRequest({message:"trackerFound",
ruleName:e,blocked:g,requestHost:f,allowedByTopDomain:d.allowedByTopDomain,url:c},function(){})}else h&&bridge.extension.sendRequest({message:"newHost",requestHost:f},function(){});return!0}}}},insertStub=function(a,b,c){try{var d="{}";c.indexOf("?")!=-1&&(d={},c.replace(/([^?=&]+)(=([^&]*))?/g,function(a,b,c,e){d[b]=unescape(e)}),d=JSON.stringify(d));a="abine.stub."+a;if(!document.getElementById(a)){var e=document.createElement("script");e.setAttribute("id",a);e.appendChild(document.createTextNode("var abPrm="+
d+";"+abNoOp+b));document.documentElement.insertBefore(e,document.documentElement.firstChild)}}catch(f){}};function urlBlocked(a,b){if(DNTP.Events.hasListener(b+" Blocked"))a.oldNextSibling=a.nextSibling,a.oldParentNode=a.parentNode,DNTP.Events.trigger(b+" Blocked",window,b,a);if(a.nodeName=="SCRIPT")DNTP.fireEvent(a,"load");else if(a.nodeName=="IFRAME"||a.nodeName=="IMG")a.style.display="none"}
var handleMessage=function(a){if(a.message=="siteOnOff")disabledHere=a.disabled;else if(a.message=="requestBlocked"){TRUE_BLOCK=!0;var b=a.rule.name;a.isBlocked&&a.rule.stub&&insertStub(b,a.rule.stub,a.url);var c=a.url;c[0]=="/"&&(c=window.location.protocol+c);var d=urlToNodeMap[c];if(d&&d.length>0){if(a.isBlocked)for(a=0;a<d.length;a++)urlBlocked(d[a],b)}else a.isBlocked&&(urlAlreadyBlocked[c]={rule:b,type:a.type});d&&delete urlToNodeMap[c]}else a.message=="toggleTracker"?toggleTrackerHandler(a):
a.message=="addIframe"&&window.top==window&&DNTP.addNotificationIframe(a.link,document)},pageActions={getVersion:function(a){!topDomain||!topDomain.match(DNTP.abineDomainsRegex)?a(""):a(VERSION+" "+bridge.browser_name+" "+ORIGIN+" "+REVISION)},getDailyTotals:function(a,b){!topDomain||!topDomain.match(DNTP.abineDomainsRegex)?b(""):bridge.extension.sendRequest({message:"getDailyTotals",year:a},function(a){b(a)})},getBadTrackerTotals:function(a){if(!topDomain||!topDomain.match(DNTP.abineDomainsRegex)||
DNTP.DISABLE_BAD_TRACKERS)return"";bridge.extension.sendRequest({message:"getBadTrackerTotals"},function(b){a(b)})},showSettings:function(a){if(topDomain&&topDomain.match(DNTP.abineDomainsRegex)){var b=document.getElementById("noAddon");if(b)b.style.display="none";if(b=document.getElementById("addonPresent"))b.style.display="";bridge.showSettings()}a("")},changeLocale:function(a,b){window.location.host.match(DNTP.abineDomainsRegex)&&bridge.extension.sendRequest({message:"changeLocale",locale:a},function(){});
b("")}};function handlePageEvent(a){var b=a.target.getAttribute("action");if(b in pageActions){var c=a.target.getAttribute("param"),c=c?JSON.parse(c):[];c.push(function(b){a.target.innerHTML=b;DNTP.fireEvent(a.target,"click")});pageActions[b].apply(pageActions,c)}}
function handleDNTPEditorTestEvent(){var a=document.getElementById("hidden_data_div"),b={};a&&a.textContent&&(b=JSON.parse(a.textContent));a=null;typeof docElement!="undefined"&&(a=docElement);bridge.extension.sendRequest({message:"testNotifications",newMsgs:b,data:a},function(){})}bridge.initMessageHandler();document.addEventListener("beforeload",shouldLoad,!0);document.addEventListener("DNTPPageEvent",handlePageEvent,!0);
document.addEventListener("DNTPMMEditorTestEvent",handleDNTPEditorTestEvent,!1);bridge.loadRules();