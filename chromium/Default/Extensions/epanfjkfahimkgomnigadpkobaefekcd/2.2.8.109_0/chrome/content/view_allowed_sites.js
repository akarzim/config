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
var EXPORTED_SYMBOLS=[];Components.utils["import"]("resource://dntp/ff/overlay.js");Components.utils["import"]("resource://dntp/view.js");View.AllowedSites=function(){this.parentConstructor.apply(this,arguments);this.doNotAutoRefresh=!0;this.viewName="siteExceptions"};
View.AllowedSites.prototype={render:function(){this.host=this.docElement.topDomain||"";var a="",b={toggledOff:this.docElement.toggledOff,host:this.host,removedSite:this.docElement.removedSite,reloadRequired:this.docElement.reloadRequired,disabledSites:DNTP.Config.getDisabledSites(),reasons:DNTP.Config.getDisabledSitesReason("sites.disabled.reason","{}")},c=new DNTP.Template("allowed_sites");a+=c.render(this,b);return a},reportIssue:function(){var a=this.$("DNTPdesc").value,a=a.replace(/<[^>]+>/g,
"");DNTP.Config.setDisabledSitesReason(this.host,a);if(!this.docElement.url)this.docElement.url=this.parentDoc.defaultView.location.href;DNTP.reportIssue(a,this.docElement);this.show()}};View.registerDerivedClass(View.AllowedSites);