var EXPORTED_SYMBOLS=["NotificationManager"];Components.utils["import"]("resource://dntp/ff/overlay.js");
var NotificationManager={activeNotifications:[],noteCounts:{},init:function(a){this.saveMsgCounts=a},getPersonDataForTab:function(a){var b=new Date;return{tag:DNTP.origin,language:a.language,browser:DNTP.browser_name,version:DNTP.version,site:a.host,url:a.url,blocked:a.blocked,date:b.getMonth()+1+"-"+b.getDate()+"-"+b.getFullYear(),any:"*"}},getCountForMsg:function(a){return this.noteCounts[a.msg]||0},computeMessages:function(a){for(var b={},e=0;e<DNTP.notificationMessages.length;e++){var c=DNTP.notificationMessages[e],
d=!0,f;for(f in c.target){a[f]||(d=!1);var g=RegExp(c.target[f]);a[f]&&!a[f].match(g)&&(d=!1)}if(d&&!b[c.area]){c.impressions=this.getCountForMsg(c);if(c.impressions==0&&c.alert)b.hasAlertIcon=!0;b[c.area]=c}if(b[0]){for(e=1;e<4;e++)delete b[e];break}if(b[1]&&b[2]&&b[3])break}DNTP.DISABLE_BAD_TRACKERS||(a=DNTP.getBadTrackerForNotification(a.blocked))&&a!=""&&(b={0:{msg:"dntp.bad.tracker.button",target:{any:".*"},alert:1,badTracker:a,area:1},hasAlertIcon:!0});return b},markNotificationsSeen:function(a,
b){for(var e=!1,c=0;c<4;c++)if(c in a){var d=a[c];!d.impressions&&d.alert&&(e=!0);this.noteCounts[d.msg]?this.noteCounts[d.msg]++:this.noteCounts[d.msg]=1;d.impressions=this.noteCounts[d.msg]}a.hasAlertIcon=!1;this.saveMsgCounts(a);e&&DNTP.update_toolbar_icon(b,!0)}};DNTP.NotificationManager=NotificationManager;