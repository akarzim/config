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
var tabID=null,docElement={},getMatchingOptout=function(a){if(DNTP.OPTOUT_DISABLED)return null;for(var b={},c=[];;){if(a in optoutMap)for(var d=0;d<optoutMap[a].length;d++)optoutMap[a][d][0]in b||(b[optoutMap[a][d][0]]=1,c.push(optoutMap[a][d][0]));else if("."+a in optoutMap)for(var e="."+a,d=0;d<optoutMap[e].length;d++)optoutMap[e][d][0]in b||(b[optoutMap[e][d][0]]=1,c.push(optoutMap[e][d][0]));d=a.indexOf(".");a=d==-1?"*":a.substr(d+1);if(a=="*")return c.length==0?null:c}},toggleAllTrackersOnSite=
function(a,b){var c=docElement.abineTracking,d;for(d in c)d!="length"&&toggleTracker(b,d,a,!0);DNTP.settings.trackerMap[a]={"*":b?1:0}},toggleAllTrackers=function(a){DNTP.settings.trackerMap={};for(var b in DNTP.trackerNames)toggleTracker(a,b,"*")},toggleTracker=function(a,b,c){var d=!1;DNTP.settings.trackerMap[c]||(DNTP.settings.trackerMap[c]={});var e=b.replace(" ","");if(b=="*")a?(c in disabledSites||(disabledSites[c]=1),DNTP.settings.trackerMap[c]["*"]=0):(c in disabledSites&&delete disabledSites[c],
c in disabledSitesReason&&delete disabledSitesReason[c]),a||delete DNTP.settings.trackerMap[c]["*"],docElement.abineDisabled=a,siteDisabled(tabID,a),bridge.tabs.sendRequest(tabID,{message:"siteOnOff",disabled:a},function(){}),webdb.updateDisabledSites(),updateToolbarIcon(tabID);else{if(c=="*"){for(var h in DNTP.settings.trackerMap)h!="*"&&b in DNTP.settings.trackerMap[h]&&delete DNTP.settings.trackerMap[h][b];webdb.toggleGlobal(b)}a?(DNTP.settings.trackerMap[c][b]=1,webdb.setValue(b,1,c)):(DNTP.settings.trackerMap[c][b]=
0,webdb.setValue(b,0,c));var j=popoverDocument,e=b.replace(" ","");h=docElement.abineTracking;var f=!0,i=null,g=null;j&&(i=j.getElementById("g"+e),i||(i=j.getElementById(e),f=!1));if(i)e=i.getElementsByTagName("img"),g=e[e.length-1],g.className&&g.className.indexOf("skip")!=-1&&(g=null),i.className=i.className.replace(/\s(on|off)/i,"")+(a?" on":" off");e="";docElement.abineTracking[b]==2&&(e=".recommended");if(a){if(g)g.src=g.src.replace("cancel","accept"),g.nextSibling.nodeValue=f?" "+DNTP._("dntp.global.blockedeverywhere"):
" "+DNTP._("dntp.capblockedhere"+e);f=docElement.abineBlocked;!(b in f)&&b in h&&(f[b]=1,f.length++,d=!0)}else{if(g)g.src=g.src.replace("accept","cancel"),g.nextSibling.nodeValue=f?" "+DNTP._("dntp.global.notblocked"):" "+DNTP._("dntp.notblockedhere"+e);f=docElement.abineBlocked;b in f&&(f[b]=0,delete f[b],f.length--,d=!0)}d&&(c!="*"&&bridge.tabs.sendRequest(tabID,{message:"toggleTracker",name:b,host:c,blocked:a},function(){}),updateToolbarIcon(tabID))}},showPostInstall=function(){(new DNTP.View.ToolTip(docElement,
popoverDocument)).show()};
function setupData(a){docElement={};docElement.tabId=a.tabId;docElement.abineTracking=a.abineTracking;docElement.abineBlocked=a.abineBlocked;docElement.abineHosts=a.abineHosts;docElement.abineDisabled=a.disabledHere;docElement.abineOptout=a.abineOptout;docElement.abineNotifications=a.abineNotifications||null;docElement._secondClick=!1;docElement.url=a.url;docElement.host=a.host;docElement.topDomain=getUserTopLevelDomain(a.host);var a=DNTP.Config.getWriteCookies(),b=!1,c;for(c in docElement.abineHosts)if(docElement.abineHosts[c]!=
2){docElement.abineHosts[c]=2;var d=getMatchingOptout(c);if(d)for(var e=docElement.abineOptout,h=0;h<d.length;h++)d[h]in e||(e[d[h]]=1,e.length++,a&&totalOptout++,b=!0)}b&&(webdb.updateTotalBlocked(),updateToolbarIcon(tabID),bridge.tabs.sendRequest(tabID,{message:"updateOptout",abineOptout:docElement.abineOptout,abineHosts:docElement.abineHosts},function(){}))}
var fillPopup=function(a,b){setupData(a,b);var c=new DNTP.View.Alert(docElement,popoverDocument);SILENT?webdb.getSetting("showPostInstall",null,function(a){!a||a==""?c.show():(c.close(),bridge.showPostInstallPage(a),webdb.setSetting("showPostInstall",null))}):c.show()},getDataFromTab=function(a){tabID=a.id;fillPopup(getTabData(tabID))};