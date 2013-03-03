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
var popupRefreshTimer=null;
View.Alert.prototype.setupData=function(){this.host=this.domain=getUserTopLevelDomain(this.docElement.host);this.trackers=this.docElement.abineTracking;this.blocked=this.docElement.abineBlocked;this.social={length:0};this.globalSocialTotal=0;this.bCount={total:totalBlocked};for(var a in DNTP.socialBlocked)this.bCount[a]=DNTP.socialBlocked[a],this.globalSocialTotal+=this.bCount[a];this.globalTotalBlocked=totalBlocked;this.globalTotalOptout=totalOptout;this.currentSocial=0;this.domain in DNTP.socialMap&&
this.bCount[DNTP.socialMap[this.domain].trackerName]&&(this.currentSocial+=this.bCount[DNTP.socialMap[this.domain].trackerName]);this.optouts=this.docElement.abineOptout};
View.Alert.prototype.addTrackerChangeHandler=function(a){var b=this;this.removeTrackerChangeHandler();this.processedChangeEvent=!1;this.trackerChangesHandle=function(c){!b.processedChangeEvent&&b.docElement.tabId==c.tabId&&a!=c.abineTracking.length&&(popupRefreshTimer&&DNTP.clearTimeout(popupRefreshTimer),b.resetFade(),popupRefreshTimer=DNTP.setTimeout(function(){b.processedChangeEvent=!0;b.removeTrackerChangeHandler();fillPopup(c)},1500))};DNTP.Events.addListener("TrackerCountChanged",this.trackerChangesHandle)};
View.Alert.prototype.showSocialButton=function(){};