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
var EXPORTED_SYMBOLS=["Events","bindObj","$A"];if(!Array.prototype.indexOf)Array.prototype.indexOf=function(a,c){for(var b=c||0,d=this.length;b<d;b++)if(this[b]===a)return b;return-1};function $A(a){if(!a)return[];if("toArray"in a)return a.toArray();for(var c=a.length||0,b=Array(c);c--;)b[c]=a[c];return b}function bindObj(a,c){var b=a,d=$A(arguments),e=c;d.shift();d.shift();return function(){return b.apply(e,d.concat($A(arguments)))}}
var Events={listeners:{},addListener:function(a,c){a in this.listeners||(this.listeners[a]=[]);this.listeners[a].indexOf(c)==-1&&this.listeners[a].push(c)},removeListener:function(a,c){if(a in this.listeners){var b=this.listeners[a].indexOf(c);b!=-1&&(this.listeners[a][b]=null)}},trigger:function(a){if(a in this.listeners){var c=$A(arguments);c.shift();for(var b=this.listeners[a],d=[],e=0;e<b.length;e++)if(b[e])try{b[e].apply(null,c),b[e]&&d.push(b[e])}catch(f){}this.listeners[a]=d}},hasListener:function(a){return a in
this.listeners}};typeof DNTP!="undefined"&&(DNTP.Events=Events);