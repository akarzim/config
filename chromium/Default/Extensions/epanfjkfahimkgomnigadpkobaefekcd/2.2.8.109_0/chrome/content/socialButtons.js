var EXPORTED_SYMBOLS=["SocialButtons"];Components.utils["import"]("resource://dntp/ff/overlay.js");var Namespace=DNTP;function blockTrackerPerSite(b,a,c){DNTP.blockTrackerPerSite(b,a,c)}function refreshPrivacyAlert(){DNTP.refreshPrivacyAlert()}
var SocialButtons={setupButtons:function(b,a,c){var d=b.document;d.documentElement.blockedContexts=d.documentElement.blockedContexts||{};d.documentElement.placeHolderToRemove=d.documentElement.placeHolderToRemove||[];a in d.documentElement.blockedContexts||(d.documentElement.blockedContexts[a]=[]);d.documentElement.blockedContexts[a].push(c);var e=function(){d.removeEventListener("DOMContentLoaded",e,!1);d.removeEventListener("load",e,!1);SocialButtons[a](b,c,a)};d.readyState=="loading"?(d.addEventListener("DOMContentLoaded",
e,!1),d.addEventListener("load",e,!1)):e()},isNodeProcessed:function(b,a){if(b.getAttribute&&b.getAttribute("ab"+a))return!0;var c=b.nextSibling;return c&&c.getAttribute&&c.getAttribute("ab"+a)?!0:b.parentNode&&b.parentNode.getAttribute?this.isNodeProcessed(b.parentNode,a):!1},isChildNodeProcessed:function(b,a){for(var c=0;c<b.childNodes.length;c++){var d=b.childNodes[c];if(d.getAttribute){if(d.getAttribute("ab"+a))return!0;if(this.isChildNodeProcessed(d,a))return!0}}return!1},adjustSize:function(b,
a){var c=parseInt(b.getAttribute("width")),d=c;if(a.offsetWidth>0&&c>a.offsetWidth)c=a.offsetWidth;if(a.parentNode.offsetWidth>0&&c>a.parentNode.offsetWidth)c=a.parentNode.offsetWidth;c>d/3&&b.setAttribute("width",c+"px")},commonTrackerBlockedHandler:function(b,a,c,d,e,h){var f=b.document,b=h.replace(/[^a-z]+/i,"");d&&(d.setAttribute("ab"+b,"1"),d.setAttribute("abPL","1"));h in f.documentElement.placeHolderToRemove||(f.documentElement.placeHolderToRemove[h]=[]);h=f.documentElement.placeHolderToRemove[h];
f=!1;if(a&&a.nodeName=="IFRAME"&&(a.src=="http://platform.twitter.com/widgets/hub.html"&&(f=!0),!this.isNodeProcessed(a,b)))a.setAttribute("ab"+b,"1"),a.oldDisplay=a.style.display,a.style.display="none",f||(f=d.cloneNode(!0),f.setAttribute("id","ab"+b+"Frame_"+h.length),f.getAttribute("allowResize")&&this.adjustSize(f,a),f.addEventListener("click",e,!0),(a.parentNode||a.oldParentNode).insertBefore(f,a.nextSibling||a.oldNextSibling),h.push(f.id));for(a=0;a<c.length;a++)if(f=c[a],!this.isNodeProcessed(f,
b)&&!this.isChildNodeProcessed(f,b)){f.setAttribute("ab"+b,"1");var g=null;d?(g=d.cloneNode(!0),g.setAttribute("id","ab"+b+"_"+h.length),g.addEventListener("click",e,!0),g.getAttribute("allowResize")&&this.adjustSize(g,f)):(g=f.cloneNode(!0),f.style.display="none",g.setAttribute("unhide",1),g.setAttribute("abPL","1"),g.setAttribute("id","ab"+b+"_"+h.length),g.addEventListener("click",function(b){b.preventDefault();e(b);return!1},!0));f.parentNode.nodeName=="UL"?f.appendChild(g):f.parentNode.insertBefore(g,
f);h.push(g.id)}},placeHolderButton:function(b,a,c,d,e){b=b.document.createElement("img");b.setAttribute("src",d);b.setAttribute("width",a+"px");b.setAttribute("height",c+"px");e&&b.setAttribute("allowResize","yes");var a={cursor:"pointer",background:"none","padding-Left":"1px","padding-Right":"1px",width:a+"px",height:c+"px"},c="",h;for(h in a)b.style[h.replace("-","")]=a[h]+" !important",c+=h+":"+a[h]+";";b.setAttribute("style",c);return b},LinkedIn:function(b,a,c){var d=[],e=this,h=b.document.documentElement,
f=this.placeHolderButton(b,60,20,SocialButtons.images.linkedInShare),g=function(a){SocialButtons.linkedInButtonClicked(a,b.document,b.location.host)};if(!b.document.documentElement[c+" Processed"]){b.document.documentElement[c+" Processed"]=!0;for(var i=b.document.getElementsByTagName("script"),j=0;j<i.length;j++){var k=i[j].getAttribute("type");k&&k.toLowerCase()=="in/share"&&d.push(i[j])}h.abNodeInsertedHandlerIN=function(d){if(!(d.target.nodeType!=1||d.target.nodeName!="SCRIPT")){var h=d.target.getAttribute("type");
h&&h.toLowerCase()=="in/share"&&e.commonTrackerBlockedHandler(b,a,[d.target],f,g,c)}};h.addEventListener("DOMNodeInserted",h.abNodeInsertedHandlerIN,!1)}this.commonTrackerBlockedHandler(b,a,d,f,g,c)},"Facebook Connect":function(b,a,c){var d=[],e=this,h=[],f=[],g=[],i=b.document.documentElement,j=function(a){SocialButtons.likeButtonClicked(a,b.document,b.location.host)},k=this.placeHolderButton(b,45,20,SocialButtons.images.facebookLike);if(!i[c+" Processed"])i[c+" Processed"]=!0,f=b.document.createElement("div"),
f.style.display="none",f.id="abPLFBH",f.setAttribute("viaStub","1"),f.setAttribute("abPL","1"),h=b.document.getElementsByTagName("body"),h=!h||h.length==0?i:h[0],h.insertBefore(f,h.firstChild),f.addEventListener("click",j,!0),d=getElements(a.ownerDocument,["fb-like"],["fb:like","fb:like-box"],["fb_share"],["fblike"]),h=getElements(a.ownerDocument,["FBConnectButton","fb-login-button","fb-button","fb_button"],null,null,["btn-fbconnect","FacebookButton"]),f=getElements(a.ownerDocument,[],["fb:login-button"]),
g=getElements(a.ownerDocument,["fb-subscribe"]),i.abNodeInsertedHandlerFB=function(d){d.target.nodeType==1&&(d.target.nodeName=="FB:LIKE"||d.target.nodeName=="FB:SUBSCRIBE")&&e.commonTrackerBlockedHandler(b,a,[d.target],k,j,c)},i.addEventListener("DOMNodeInserted",i.abNodeInsertedHandlerFB,!1);this.commonTrackerBlockedHandler(b,a,d,k,j,c);g.length>0&&(i=this.placeHolderButton(b,82,20,SocialButtons.images.facebookSubscribe),this.commonTrackerBlockedHandler(b,null,g,i,j,c));h.length>0&&this.commonTrackerBlockedHandler(b,
null,h,null,j,c);f.length>0&&(i=this.placeHolderButton(b,152,22,SocialButtons.images.facebookConnect),this.commonTrackerBlockedHandler(b,null,f,i,j,c))},"Google +1":function(b,a,c){var d=[];if(!b.document.documentElement[c+" Processed"]){b.document.documentElement[c+" Processed"]=!0;for(var d=getElements(b.document,["g-plusone"],["g:plusone"]),e=0;e<d.length;e++)d[e].style.display="none"}e=SocialButtons.placeHolderButton(b,50,20,SocialButtons.images.googlePlusOne,!0);this.commonTrackerBlockedHandler(b,
a,d,e,function(a){SocialButtons.plusOneButtonClicked(a,b.document,b.location.host)},c)},"Twitter Badge":function(b,a,c){var d=[];if(!b.document.documentElement[c+" Processed"]){b.document.documentElement[c+" Processed"]=!0;for(var d=getElements(b.document,["twitter-share-button","twitter-follow-button"]),e=0;e<d.length;e++)d[e].style.display="none"}e=SocialButtons.placeHolderButton(b,55,20,SocialButtons.images.tweetThis);this.commonTrackerBlockedHandler(b,a,d,e,function(a){SocialButtons.tweetButtonClicked(a,
b.document,b.location.host)},c)},replaceNodes:function(b,a,c){if(a){for(var d=0;d<a.length;d++){var e=b.getElementById(a[d]);if(e){e.style.display="none";if(e.getAttribute("unhide"))e.nextSibling.style.display="";e.parentNode.removeChild(e)}}a.splice(0,a.length)}if(c){for(d=0;d<c.length;d++)if(a=c[d],a.nodeName=="SCRIPT"){e=b.createElement("script");e.setAttribute("src",a.getAttribute("src"));if(a.oldOnload)e.onload=a.oldOnload;(a.parentNode||a.oldParentNode).appendChild(e)}else if(a.nodeName=="IFRAME"&&
(a.style.display=a.oldDisplay,a.parentNode||a.oldParentNode.insertBefore(a,a.oldNextSibling),a.src=a.src,a.style.display=="none"))a.style.display="";c.splice(0,c.length)}},removeStub:function(b,a){var c=b.createElement("script");c.appendChild(b.createTextNode(a));b.documentElement.insertBefore(c,b.documentElement.firstChild)},commonClickHandlerFromPopup:function(b,a,c,d){if(b.documentElement.blockedContexts){if(c.indexOf("Facebook")>=0)b.documentElement.removeEventListener("DOMNodeInserted",b.documentElement.abNodeInsertedHandlerFB,
!1),this.removeStub(b,"FB = null;");else if(c.indexOf("Twitter")>=0)for(var e=getElements(b,["twitter-share-button","twitter-follow-button"]),a=0;a<e.length;a++)e[a].style.display="block";else if(c.indexOf("Google")>=0){e=getElements(b,["g-plusone"],["g:plusone"]);for(a=0;a<e.length;a++)e[a].style.display="block";this.removeStub(b,"if (window.gapi) {window.gapi.plusone=null;}")}else b.documentElement.removeEventListener("DOMNodeInserted",b.documentElement.abNodeInsertedHandlerIN,!1);a=b.documentElement.blockedContexts[c];
c=b.documentElement.placeHolderToRemove[c];b.documentElement.abineMessage="<br/>Caution: "+d+" is now tracking your visits here<br/>";this.replaceNodes(b,c,a)}},commonClickHandler:function(b,a,c,d,e){var h=a.documentElement.blockedContexts[d],f=a.documentElement.placeHolderToRemove[d];blockTrackerPerSite(a,d,c);for(b=b.target;!b.getAttribute("abPL");)b=b.parentNode;var g=a.createElement("div");g.style.zIndex="999999999";g.style.width="200px";g.style.padding="5px";g.style.textAlign="center";g.style.fontSize=
"10pt";g.style.fontWeight="normal";g.style.textDecoration="none";g.style.color="black";g.style.backgroundColor="white";g.style.border="1px solid black";b.getAttribute("viaStub")?(g.style.position="fixed",g.style.top="10px",g.style.right="10px"):(g.style.position="absolute",g.style.top=b.style.offsetTop-20+"px",g.style.left=b.style.offsetLeft+"px");g.setAttribute("id","abEnablePopup");DNTP.setText(g,"Enabling "+e+"...");b.parentNode.appendChild(g);Namespace.setTimeout(function(){DNTP.setText(g,"(Now just click again)");
Namespace.setTimeout(function(){g.parentNode&&g.parentNode.removeChild(g)},3E3)},1E3);a.documentElement.abineMessage="<br/>Caution: "+e+" is now tracking your visits here<br/>";this.replaceNodes(a,f,h);refreshPrivacyAlert()},linkedInButtonClicked:function(b,a,c){a.documentElement.removeEventListener("DOMNodeInserted",a.documentElement.abNodeInsertedHandlerIN,!1);this.commonClickHandler(b,a,c,"LinkedIn","LinkedIn")},likeButtonClicked:function(b,a,c){a.documentElement.removeEventListener("DOMNodeInserted",
a.documentElement.abNodeInsertedHandlerFB,!1);this.removeStub(a,"FB = null;");this.commonClickHandler(b,a,c,"Facebook Connect","Facebook")},tweetButtonClicked:function(b,a,c){for(var d=getElements(a,["twitter-share-button","twitter-follow-button"]),e=0;e<d.length;e++)d[e].style.display="block";this.commonClickHandler(b,a,c,"Twitter Badge","Twitter")},plusOneButtonClicked:function(b,a,c){for(var d=getElements(a,["g-plusone"],["g:plusone"]),e=0;e<d.length;e++)d[e].style.display="block";this.removeStub(a,
"if (window.gapi) window.gapi.plusone=null;");this.commonClickHandler(b,a,c,"Google +1","Google")}};function getElements(b,a,c,d,e){var h=[],f,g,i,j={},k={getElementsByClassName:1,getElementsByTagName:2,getElementsByName:3,getElementById:4},m;for(m in k){f=k[m];if(arguments.length<f)break;var l=arguments[f];if(l)for(g=0;l&&g<l.length;g++)if(f=b[m](l[g])){typeof f.nodeName!="undefined"&&(f=[f]);for(i=0;i<f.length;i++)f[i]in j||(h.push(f[i]),j[f[i]]=!0)}}return h}
Namespace.Events.addListener("Facebook Connect Blocked",SocialButtons.setupButtons);Namespace.Events.addListener("Google +1 Blocked",SocialButtons.setupButtons);Namespace.Events.addListener("Twitter Badge Blocked",SocialButtons.setupButtons);Namespace.Events.addListener("LinkedIn Blocked",SocialButtons.setupButtons);Namespace.SocialButtons=SocialButtons;
SocialButtons.images={facebookLike:"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAC0AAAAUCAIAAACWDSOoAAAABGdBTUEAALGPC/xhBQAAAU5JREFUSEtj/Pfv35NXX95++P77zz8GugNWFiYRAU5pMR6GRy8+Xb//9vW7r28GAr1++wVo++MXnxjO3Xj56u2XAXEExFKg7edvvGQ4deX5ADoCYjXQDVjckVCxxjpyBh4EVEBdp2N3B35HQGQHzB3FXdv+gwGQQYw7iFED9wwJ4QF0wdOXn/YfvZ1UvgjNDqxcGroD6Ah4lCHHC1Yrqe+OwJwls1efBobH+RsvgAwgl6TwgCvG6gd8+QUtncJTBq70gSdekB0BD0LMoCItfQDDg5h4gViDlq3Q/IaW3WjrDohrIFbiTy443ZHTvBkNASPl3qN3EEEy0geyFhLiBdMdwGoZjzuQ4wseL2gJguR0Ciy25VwbLEOnAEmsDDqV69Qts4kxDZQ+gHXuoKj3gW2QAWwHAYMA2g4CJkCgUy7cfAUMHPojoL2PX34CugEAZwNKO/hX+zQAAAAASUVORK5CYII=",facebookConnect:"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJgAAAAWCAIAAACzGsLeAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYwIDYxLjEzNDc3NywgMjAxMC8wMi8xMi0xNzozMjowMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNSBNYWNpbnRvc2giIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6RTA2NDlFQzc0NDYyMTFFMUE2NTZEREJDQ0EyRjUwNzgiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6RTA2NDlFQzg0NDYyMTFFMUE2NTZEREJDQ0EyRjUwNzgiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDpFMDY0OUVDNTQ0NjIxMUUxQTY1NkREQkNDQTJGNTA3OCIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpFMDY0OUVDNjQ0NjIxMUUxQTY1NkREQkNDQTJGNTA3OCIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PtCAo/EAABAJSURBVHjafFoJdJTV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",
facebookSubscribe:"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFIAAAAUCAMAAAAp85rYAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyRpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYxIDY0LjE0MDk0OSwgMjAxMC8xMi8wNy0xMDo1NzowMSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNS4xIE1hY2ludG9zaCIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDo3NzE3QkE0QjkxM0ExMUUxQjU1OUNDNjhCOEMzQzMxNyIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDo3NzE3QkE0QzkxM0ExMUUxQjU1OUNDNjhCOEMzQzMxNyI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOjc3MTdCQTQ5OTEzQTExRTFCNTU5Q0M2OEI4QzNDMzE3IiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOjc3MTdCQTRBOTEzQTExRTFCNTU5Q0M2OEI4QzNDMzE3Ii8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+DiUgcwAAAGBQTFRF1On0ytTnU5XSxaKl6+nl6NnRpZOjn6zNO1myVXGrq9LuO1mZ/v7/jcLp4+31zMvbveLycYe2R2Of7OXZYnqt4Mi7O2e6iXKa7O712NzocVyd4uXwuMLZV1qbPofK////zvBnqgAAACB0Uk5T/////////////////////////////////////////wBcXBvtAAABaUlEQVR42syV23KDIBCGQUEhIB6iBFxN3v8tu4AmGWPbGzrTnVGUHz72gEgeQLMaPAh443KaB0JdZqN/iBzV08ZMyA039P2g9qy8sszr7xL+qRyQw6J1n5DXG75327BJnCLL+4lyQEpN683LSRDWmp+RnP6OHHWN9+SBCC6yuXNcmslWSjXBc+zl6H/D5lo1ZeGicnEsKifI1mgHY0LioMK469oFRyZV+EoQ9ByAzXfv4bpaagIyKdXdldacIBevnR/38pS48I7E8LjqJiUv2F5CqlFwARkVOtv+Jsx54MseeJg2NzvSRqTjlWqmNySWJylz0S7UnJfnmcuWOr4isuGrNQFTCuIJ3AoMnDASkClwVBSpLHFwyOUgg/V6kXLYwlaqIAaTXwXkquJcJTDyGcuzBb4rYcsdc4l7PJhecK+nHubjsmDSSAgNg9cz2pviAD4+yCHaKPH6v8dGTmTmI9jgEZz/R/ElwAAGjnaa14PuQQAAAABJRU5ErkJggg==",
googlePlusOne:"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAUCAIAAABAqPnNAAAABGdBTUEAALGPC/xhBQAAAYRJREFUSEtjvHPnDntAPAMhYJi0gpASBiVzW4JqgApOsrLjV3ZXaCvDYx1rYpBI32OCyOyoAjHo/yl1gmiwOmvz5s3XBxkAOokBiH8OMgB11vdBBqDO+koDUL78o2/PB/IMhjrrM1ng6avPey5+uv7oE5puoIhvz3uxrHf2ze/JMvgz1FkfyQK7zn8A2t289j1c9+OXHzPmgBwEQaVLEVIk2QB11juywI6zILub1iA0z90DEvHufmfXBGIAueQBqLPekAiKF7/17npnC7bboOodkA1EQDO2nX5z5ArILKAgUArCJgNAnfWKRODV9RYeU3AG3Iy7j15BBEk0FaEc6qznZIHNJ14C7a5b8RpNN0Tcq/MNWaaCNEGd9ZQssPHYc6D1tctfoekGigDFCxagixNvCdRZj8kCJ688qVn2csPRZ2i6w/pfA521eC+6OPGWQJ31kKpAv+IN0FknLj0m21Sos+4PMgB11t1BBqDOOnz48O1BA4COATnr////QGpQgZMnTwIAc6M3U4ObOZEAAAAASUVORK5CYII=",
linkedInShare:"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAD0AAAAUCAIAAACxo6JAAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAgY0hSTQAAeiYAAICEAAD6AAAAgOgAAHUwAADqYAAAOpgAABdwnLpRPAAABRFJREFUSEvFVllQk1cUDh2mL7z0pa/tTFun04FaNilIZBFxlApTKgyV2pnq0JERZAubbGHRSIAIrRTUAaF2Kihpth9IQrOxmBCWoKyVArIkWtaEXdb0XP7w928A+9B28s1lcs53v3vvd889mWBlNBpDiuRT+rVtI4VCQX9vWFmZIvjYCyMF5t9+601W0KF95/9v0tra2sbGhnKWJT9/+zGd25sjGEjj9GRwe7MFfTm1/dnYQDZ/n8HAfqNz+7663RLEkm9ZAgsLCyqVinIsrTa+6gmdh7yWKIZZ4sEUdk8GrxfSTEF/1p6RjfXnYP1xVZ2wcNNCkMvlFPdULPJ+e/zDp7yuCZ1+tXNUD77P31HFPtDQqrtiqzQw4mBUoxFbrYmpQnz0Tx3UVGzDQkC+Xa9i50qak9ndLw2r0OuAUvnQ8TzZudLHEfc7LlW2hVe2hZWrL5S1ht1TQxpWof62ou2buyq3FGzdQkC+XZKwwMLGsPK2R+qxbq1BNjBJq9J4XP/V87rElyn3v6kIuNl4kinzZkh9bkgCWIovi1vgSkHfN32ajK1ZCCbfnzHlvrmyk7nSi2WtX3zX7EYXnboh9WVIj2U3HEkTOlyt88uTh5YqTzFlbhlCn2uSgAKFX54ULvzKQkC+nRP4npkiX4bk4h0VveZJ9I/tJxiS07nSfEFfuez3yIq28DL1z8rRlqGZGvX4pXtqt3QhNV3slSV2SeKv/h1OJOAzOGEm+/cp8u0Uz3NM4IPRpmdT0NzPJxdDf2ihZokHXyxAOjq99Me8qe8h7RidDS1utovjQ7GdE3grJOAW8W8IEeMBWfafxCbfH0dxPelixSDyPTS5eIYpd0yq65kw4Cb0y+utw3PaOeR+aX2zRDLoEC84HMOFCy/vgvAKBL4KD8gvADGhJ3icIcsOYoi1EJh8217huqXUszvH4KTucT2VLrJPwFqHZiBd3dhKetD1bgQn65fuVxub20YjX6Ojpolsr7DB99IuzCziNLnwRAz8Qc+C6rKDvU9HHIQHJt920Vz3VCFHMw4re7UGz8wGh8TajpE5VP7pJfguUlwL/XMaxudWgKl7+tIzQ2gXzQHfi7vAa2zmnkhBRb4DpOQCk2VkJVlDHIQHf/mmpgt5mgnYok9r8M5CvjXPke++F4s+2WLK8VsnshqGp9HTCzQ6j3TwjfoEfnLJMHNPGAINOTbrfvIUWUnsZnYKpKR6p9U/VI+iPhnTu2cIwbd6aBaVX7fgnyulfF7me00CrQ/Mo9ZxaprJ9zwJuBsgyKV9DbmvjLwc35vYgXzWbn9HcbzoQuUIamjd3IofU+aYVD+6U92Fje3gwkaKb2lIUfPi2hYwqpFZ70yxbRTqE8Mu9jYJzBDOyPFr2gnfbN+tiIPwgKg3xyNDKOjS6WaXlc+mAvLlTkn1Tf2T2pnlbt18YIHC+vTdkMKm7gmDdnYZZF50Ed7fehKIZ4UAp3HmoJiYJcvI4r08cRry7Ujj2dP4RxKxYJYivrL9wq1m1+Rax3js66ImGvwfUtx8NKXunfCaoym1YSUttIr24IJGl8RaWAIL5yyEnd/LRHCATHwUyXkvnH3oMts+hudE438YwX5/N3VJxA7Hcj+4XAMCkO3o+bBw1kJAvs/mS1yTBeDDPo73SSwaDnHIlgOkMTwgcZdA4rM4A0sCmQ0zloBWq1UqlRRoI3+GyDlR4EDjQcv+44D7OCcIzjBEYgtBoVBAuf4EiYFbWxWQHPkAAAAASUVORK5CYII=",
tweetThis:"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADcAAAAUCAIAAACmgTKJAAAABGdBTUEAALGPC/xhBQAAAzdJREFUSEvVl01IVFEUx23bolWLRPqyIIiCol1tIiIw2rRoEbaJWgRCEIVYCm1yKjIkU8xIm1JbWE3B5MegZkzOWPYyQUeLqWlCRkRGxmaajyyp3/M8L6+ZgYGB4jUc9Lxzzz33d//n3ue4IvVjcTQU/RhOFFjys3n1yh1FqwpeBSMjoW+/rPqBDcKCNi1kVUKDC8L/hzK5sGhlM7TMidjmmbA5h3zTkZyZfyPBoIymfiqzvxwLzSfNkf31XUVV7ftqHprjpB203TdbXZfXPCsPXwvOIUTmRIMyklhQVvFkqPBs06l7rp6xIMHq/okNtc/XX+0uqrCX3nKqNCqi7oUHvWtOXi5r7sIffB8y18nDP3SljVKZE7NQspWt1zoRD6wyx/Duu6+LG4c31nvWXnoKfSAcG5mal0I0dyr8FUqvfxofLas6XhBH8r0X7wi0U5ssrXuEc7NH23O+gThNmIl9J9I7GiipthNkq0Qcw5Obymq2nL4OK4qaWQ1Kksw28Hlue4Mb/VARxOImjZ/4oBeeaWwZeKeSKQdl/3iQCMuzhjgiMD6IxxseyxAcDq+PIYfmpxU4bMw98WXnuXpAKQUx3OSwTzNPdkoEO9H5QecTxCVDzm03+g7fdtW6tKyUlGZhzglk6AEWdZAHOZEQVjaDwUECWDCBSKS8tZs0aqqOp6lmULIAxv7EwRC8pGNcIUrTOaPEKaHS6L5oKRGWR0Ii8EGJL+pCCROgGEGkhYwhFeGoMJ27yKgqrpw/KP2z8aNNzyo7Pe1aoNw1uWtZRRGSw8raaSWkcYpSGgoTaYIrqwIBJdPZZLPrDc3lUDLK2eVAIzaPpKGlHMq0VQzKQCSJMUahY63udTYnWKrd+AdaBrkiesJSpjI2hiSwqgo8ctp4pJtysfCRE9l4lD2QT4Q0iTAFStJ4K0tEFZSyy5ThGOuBiDGf21M58OmIw4dxQO1v9cuhT1hKSDP+1sr2xOJJ/f6K6vhqCM30oWicfCklbwkSVAVWIQdLW8ugBNFsoqs6wjymJeT9mFkK3JzVslPmnPaPEwxK30zcyqZT8h2zzz/LzbKmwaZ/C04kU/ziBWFNg43/eX4DKuVtXDsPfl0AAAAASUVORK5CYII="};