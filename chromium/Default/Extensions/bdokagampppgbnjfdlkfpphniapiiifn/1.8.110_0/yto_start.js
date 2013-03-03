// YouTube Options
// Copyright (c) 2010-2013 smart people on ice, LLC.
// All rights reserved.  Must not be reproduced without express written permission of smart people on ice, LLC.
//
// https://spoi.com/software/yto/SLA
//
// portions borrowed from Adblock Plus

function bug3 (what) {
	if (1==2) {
		if (typeof what!='object') { console.log('>>'+what);
		} else { console.log(what); }
	}
}

function inArray2 (needle, haystack) {
	var need=needle.split('=');
	for (var i = 0; i < haystack.length; i++) {
		if (need[0]+'='==haystack[i]) {
			return true;
		}
		if (haystack[i].indexOf(need[0]+'=')!='-1') {
			return true;
		}
		if (needle.outerHTML && haystack[i].outerHTML && needle.outerHTML==haystack[i].outerHTML) {
			return true;
		}
	}
	return false;
}

function inArray3 (needle, haystack) {
	for (var i = 0; i < haystack.length; i++) {
		if (needle.outerHTML && haystack[i].outerHTML && needle.outerHTML==haystack[i].outerHTML) {
			return true;
		}
	}
	return false;
}

function proceed (thirdparty, isiframe) {
	// determine if we should filter

	// not filtering because Filtering or InVideo says so
	if (ytOoptions.Filtering!='true' || ytOoptions.InVideo=='default') {
		return false;
	}

	// not filtering because channel pages option not selected
	if (channelpage==true && ytOoptions.youtubeUser=='false') {
		return false;
	}

	if (thirdparty==true || isiframe==true) {
		// settings say not to modify NATIVE youtube
		if (ytOoptions.youtube=='false' && ytOoptions.Sites=='false') {
			return false;
		}
		if (ytOoptions.eyoutube=='false' && ytOoptions.Sites=='false') {
			return false;
		}
	}

	// filtering is gtg
	return true;
}

function cleanYTFlashVars (parts) {
	// remove and add flashvars (youtube)

	// https://developers.google.com/youtube/player_parameters

	//console.log('parts:'); console.log(parts);

	//return parts;

	var video_id = undefined;
	var vid_length = 0;
	var orig_autoplay = undefined;
	var isiframe = inArray2('framer=',parts);
	var hasorigin = false;
	var hasplaylist = false;
	var thisurl = document.URL;

	var jparts = JSON.stringify(parts);
	if (jparts.indexOf('el=embedded')!='-1') {embedded=true;}
	if (jparts.indexOf('el=profilepage')!='-1') {channelpage=true;}
	if (jparts.indexOf('origin=')!='-1') {hasorigin=true;}
	if (jparts.indexOf('playlist=')!='-1') {hasplaylist=true;}

	if (jparts.indexOf('twk=immf')!='-1') {
		// already been here, return previous parts
		return parts;
	}

	if (parts.length>0 && parts[0]=='thirdparty') {
		// for embedded on third party pages
		thirdparty = true;
		parts = [];
	}

	if (ytOoptions.eyoutube=='false' && (embedded==true || isiframe==true || thirdparty==true)) {
		// we should not be here, take toys and go home
		return false;
	}

	if (proceed(thirdparty, isiframe)==false) {
		// we should not be here, take toys and go home
		return false;
	}

	//
	// trim off parts
	//

	var newVars = [];
	for (var i = 0; i < parts.length; i++) {
		if (!/^(ad\d*_|afv_|autoplay|advideo=|eurl|fs=|instream|infringe|invideo|interstitial|mpu|prerolls|tpas_ad_type_id|trueview|watermark)/.test(parts[i])) {newVars.push(parts[i]);}

		// get video_id
		if (parts[i].indexOf('video_id=')!='-1') {video_id = parts[i].split('=')[1];}

		// get video length
		if (parts[i].indexOf('length_seconds=')!='-1') {vid_length = parts[i].split('=')[1];}

		// get autoplay
		if (parts[i].indexOf('autoplay=')!='-1') {orig_autoplay = parts[i].split('=')[1];}
	}
	parts=newVars;

	if (ytOoptions.InVideo!='ads') {
		// hide ads
		var newVars = [];
		for (var i = 0; i < parts.length; i++) {
			//console.log(parts[i]);
			if (!/^(iv_|iv3_)/.test(parts[i])) {newVars.push(parts[i]);}
		}
		parts=newVars;
	}
	if (ytOoptions.InVideo=='all') {
		// hide closed captions
		var newVars = [];
		for (var i = 0; i < parts.length; i++) {
			if (!/^(cc_|cc3_)/.test(parts[i])) {newVars.push(parts[i]);}
		}
		parts=newVars;
	}
	if (ytOoptions.ControlsTheme!='default') {
		// change player theme
		var newVars = [];
		for (var i = 0; i < parts.length; i++) {
			if (!/^(theme)/.test(parts[i])) {newVars.push(parts[i]);}
		}
		if (ytOoptions.ControlsTheme=='dark') {newVars.push('theme=dark');}
		if (ytOoptions.ControlsTheme=='light') {newVars.push('theme=light');}
		parts=newVars;
	}
	if (ytOoptions.Hide=='true') {
		// hide player controls
		var newVars = [];
		for (var i = 0; i < parts.length; i++) {
			if (!/^(autohide)/.test(parts[i])) {newVars.push(parts[i]);}
		}
		newVars.push('autohide=3');
		parts=newVars;
	}
	if ((ytOoptions.Cleanup=='true' && ytOoptions.SetView!='default') || isiframe==true) {
		// we set the view size so hide resize buttons
		var newVars = [];
		for (var i = 0; i < parts.length; i++) {
			if (!/^(enablesizebutton)/.test(parts[i])) {newVars.push(parts[i]);}
		}
		newVars.push('enablesizebutton=0');
		parts=newVars;
	}
	if (ytOoptions.Cleanup=='true') {
		// hide end screens
		var newVars = [];
		for (var i = 0; i < parts.length; i++) {
			if (!/^(endscreen_module|pprl)/.test(parts[i])) {newVars.push(parts[i]);}
		}
		parts=newVars;
	}

	if (embedded==true || isiframe==true || thirdparty==true) {
		// all other youtube
		if (ytOoptions.InVideo!='default') {
			// hide ads and set it later
			var newVars = [];
			for (var i = 0; i < parts.length; i++) {
				if (!/^(rel=)/.test(parts[i])) {newVars.push(parts[i]);}
			}
			parts=newVars;
		}
		if (ytOoptions.SetRes!='default') {
			// hide view quality and set it later
			var newVars = [];
			for (var i = 0; i < parts.length; i++) {
				if (!/^(vq=)/.test(parts[i])) {newVars.push(parts[i]);}
			}
			parts=newVars;
		}
	} else {
		// native youtube
		if (channelpage==true && ytOoptions.youtubeUser=='true') {
			// must be a user or channel page
			if (ytOoptions.AutoPlay=='nobuff') {
				parts.push('autoplay=0');
			} else if (ytOoptions.AutoPlay=='no') {
				// youtube channel pre-buffer pause
				parts.push('pauseit=0');
			}
		}

		if (ytOoptions.Cleanup=='true' && ytOoptions.SetView!='default' && !inArray2('enablesizebutton=0',parts)) {
			// hide native resize buttons
			parts.push('enablesizebutton=0');
		}
	}

	//
	// add parts
	//

	// allow full-screen
	parts.push('twk=immf', 'fs=1');

	if (ytOoptions.SetRes!='default') {
		// view quality
		if (ytOoptions.SetRes=='240') {parts.push('vq=small');}
		if (ytOoptions.SetRes=='360') {parts.push('vq=medium');}
		if (ytOoptions.SetRes=='480') {parts.push('vq=large');}
		if (ytOoptions.SetRes=='720') {parts.push('vq=hd720');}
		if (ytOoptions.SetRes=='1080') {parts.push('vq=hd1080');}
	}

	if (embedded==true || isiframe==true || thirdparty==true) {
		// everything other than native youtube page

		if (isiframe==true) {parts.push('isiframe=1');}
		if (thirdparty==true) {parts.push('thirdparty=1');}

		// hide search box
		if (ytOoptions.Cleanup=='true') {parts.push('showsearch=0');}

		// make sure it can be broken out
		parts.push('modestbranding=0','showinfo=1');

		if (ytOoptions.InVideo!='default') {

			// remove ads
			parts.push('rel=0','instream=false','invideo=false');

			// remove annotations
			if (ytOoptions.InVideo=='ads') {
				parts.push('iv_load_policy=1');
			} else {
				parts.push('iv_load_policy=3');
			}

			if (ytOoptions.InVideo=='showcc' || ytOoptions.InVideo=='ads') {
				// allow annotations
				parts.push('cc_load_policy=1');
			}
		}

		// buffering is not available for embedded
		if (ytOoptions.AutoPlayEmbed=='true') {
			// start autoplay
			parts.push('autoplay=1');
		} else if (orig_autoplay) {
			// if it was set before, set it back
			parts.push('autoplay='+orig_autoplay);
		}

		if (ytOoptions.Wads=='true' && vid_length>0) {
			// observe wadsworths constant
			parts.push('start='+ Math.round(vid_length * .3));
		}

		if (ytOoptions.Loop=='true' && hasplaylist==false) {
			if (typeof video_id == 'undefined') {
				// try and get video id
				if (savedPlayer.src.indexOf('/v/')!='-1') {video_id = savedPlayer.src.split('/v/')[1];}
			}
			if (video_id) {parts.push('version=3', 'loop=1', 'playlist='+video_id);}
		}

		// for security reasons
		if (hasorigin==false) {
			var proto = 'http://';
			if (thisurl.indexOf('https://')!='-1') {proto='https://';}
			parts.push('origin='+proto+extractDomainFromURL(thisurl));
		}
	}

	// give back trimmed flashvars
	return parts;
}

// Extracts a domain name from a URL
function extractDomainFromURL (url) {
	if (!url) return '';

	if (extractDomainFromURL._lastURL == url) return extractDomainFromURL._lastDomain;

	var x = url.substr(url.indexOf('://') + 3);
	x = x.substr(0, x.indexOf('/'));
	x = x.substr(x.indexOf('@') + 1);
	if (x.indexOf('[') == 0 && x.indexOf(']') > 0) {
		x = x.substring(1,x.indexOf(']'));
	} else {
		colPos = x.indexOf(':');
		if (colPos >= 0)
			x = x.substr(0, colPos);
	}

	extractDomainFromURL._lastURL = url;
	extractDomainFromURL._lastDomain = x;
	return x;
}

function pauseWait (player,newVars) {
	// youtube channel pre-buffer pause (chrome)
	// normal pausing is done in yto.js

	if (JSON.stringify(newVars).indexOf('pauseit=0')!='-1') {
		ywaiter = setInterval(function () {
			try {
				// pause
				player.pauseVideo();
				bug3('waiting to pause flash..');

				// done
				clearInterval(ywaiter);
			} catch(err){}
		},180);
	}
}

function ytSwapObj (player, newVars) {
	// save new object to DOM

	bug3(newVars);

	// put vars back together
	player.setAttribute('flashvars', newVars.join('&'));

	// video acceleration
	// http://helpx.adobe.com/flash/kb/flash-object-embed-tag-attributes.html#main_Using_Window_Mode__wmode__values_
	// direct, gpu, opaque, transparent, window
	var wmode='';
	if (player.getAttribute('wmode') && player.getAttribute('wmode')=='transparent') { wmode='window'; bug3('ytO: swapping transparent flash for window'); }
	if (ytOoptions.Wmode=='true') { wmode='direct'; }
	if (wmode!='') { player.setAttribute('wmode', wmode); }
	player.setAttribute('yto', 'immf');

	// remove old object
	var parent = player.parentNode;
	var insertBefore = player.nextSibling;
	parent.removeChild(player);

	// insert replacement object
	parent.insertBefore(player, insertBefore);

	// check to see if it needs pre-buffer pausing
	pauseWait(player,newVars);

	bug3('SWAPPED IT');
}

function ytFindObj (e) {
	// loop through everything on page and look for valid youtube embed or objects

	// get source domain from object
	var eltDomain = extractDomainFromURL(e.url);

	// get object
	var player = e.target;

	if (player && (eltDomain.indexOf('ytimg.com')!='-1' || eltDomain.indexOf('youtube.com')!='-1') && /^(embed|object)$/.test(player.localName)) {

		if (eltDomain.indexOf('ytimg.com')!='-1' && player.hasAttribute('flashvars')) {
			// found am native or embedded youtube object

			var newVars = player.getAttribute('flashvars').split('&');

			if (ytOoptions && typeof ytOoptions == 'object') {
				// options are here and now we need some deep cleaning

				if (proceed(thirdparty, isiframe)==true) {
					// proceed says page looks valid

					var cleanVars = cleanYTFlashVars (newVars);
					if (cleanVars != false) {ytSwapObj(player, cleanVars);}
				}

				// stop looking at the page
				document.removeEventListener('beforeload', ytFindObj, true);
			} else {
				// dont have options yet, so saving first pass until options arrives

				savedPlayer = player;
				savedPlayerVars = newVars;
			}
		} else if (eltDomain.indexOf('youtube.com')!='-1') {
			// embedded youtube on third paty page (like google reader)

			// keep track of tries so we dont do this forever
			objectcount++;

			// assign fake value
			var newVars = ['thirdparty'];

			if (ytOoptions && typeof ytOoptions == 'object') {
				// example: http://www.npr.org/2012/12/02/166112493/dozens-of-covers-later-hallelujah-endures
				if (proceed(thirdparty, isiframe)==true) {
					// proceed says page looks valid

					var cleanVars = cleanYTFlashVars (newVars);
					if (cleanVars != false) {ytSwapObj(player, cleanVars);}
				}

				// stop looking at the page
				if (objectcount>18) {
					document.removeEventListener('beforeload', ytFindObj, true);
				}
			} else {
				// dont have options yet, so saving first pass until options arrives
				// the options loop will pick up this reference

				// example: a bunch of <object><param><embed>

				savedPlayer = player;
				savedPlayerVars = newVars;

				savedPlayers.push(player);
			}
		}
	} else if (player.baseURI.indexOf('youtube.com')!='-1' && window!=window.parent && ytOoptions && typeof ytOoptions == 'object' && player.ownerDocument.head && player.ownerDocument.head.innerHTML.indexOf('ytOhtml5style')=='-1') {

		var temp = d.createElement('style');
		temp.setAttribute('id','ytOhtml5style');

		var newcss='';

		// hide resize buttons
		newcss += '#html5large, #html5small {display: none;} ';

		if (ytOoptions.InVideo!='default') {
			// hide ads
			newcss += '.videowall-endscreen, .html5-endscreen.videowall-endscreen, .video-ads {display: none;} ';

			if (ytOoptions.InVideo=='all' || ytOoptions.InVideo=='showcc') {
				// hide annotations
				newcss += '.html5-video-content .video-annotations, .annotation, .annotation-shape {display: none;} ';
				// hide annotations button
				newcss += '.html5-annotations-button, .iv-created .html5-annotations-button {display: none;} ';
			}

			if (ytOoptions.InVideo=='all') {
				// hide captions
				newcss += '.captions-created .html5-captions-button';
			}
		}

		// write css to iframe header
		temp.type='text/css';
		temp.innerText=newcss;
		player.ownerDocument.head.appendChild(temp);

		if (ytOoptions.ControlsTheme=='light') {
			// apply light controls theme in iframe
			var temp = d.createElement('script');
			temp.setAttribute('id','ytOlightenup');
			temp.innerText='var themeCount=0; var d=document; var themeWait = setInterval(function(){var aa=d.getElementById(\'movie_player-html5\'); var ab=d.getElementById(\'video-player\'); themeCount++; if (aa || ab) {clearTimeout(themeWait); if (aa) {var ac=aa.getElementsByClassName(\'html5-video-controls\');} if (ab) {var ac=ab.getElementsByClassName(\'html5-video-controls\');} if (ac && ac[0]) {ac[0].className+=\' light-theme\';}} if (themeCount>18){clearTimeout(themeWait);}},1000);';
			player.ownerDocument.body.appendChild(temp);
		}

		if (ytOoptions.Hide=='true') {
			// hide html5 controls in iframe
			var temp = d.createElement('script');
			temp.setAttribute('id','ytOhidecontrols');
			temp.innerText='var hideCount=0; var d=document; var hideWait = setInterval(function(){var aa=d.getElementById(\'movie_player-html5\'); var ab=d.getElementById(\'video-player\'); if (aa || ab) {clearTimeout(hideCount); if (aa) {aa.className+=\' autohide-embeds autohide-aspect hide-controls\';} if (ab) {ab.className+=\' autohide-embeds autohide-aspect hide-controls\';}} hideCount++; if (hideCount>18) {clearTimeout(hideWait);}},1000);';
			player.ownerDocument.body.appendChild(temp);
		}
	}
}

function vimSwapObj (player) {
	// save new object to DOM

	// http://developer.vimeo.com/player/embedding

	var playersrc = player.src;
	if (player && playersrc) {
		var base = '';
		// do not bother setting player colours because it is lame
		//if (ytOoptions.ControlsTheme=='dark') {base += '&color=000000';}
		//if (ytOoptions.ControlsTheme=='light') {base += '&color=FFFFFF';}

		var vimtype = undefined;
		if (playersrc.indexOf('video/')!='-1') {vimtype='iframe';}
		if (playersrc.indexOf('clip_id=')!='-1') {vimtype='embed';}

		// could not determine type of vimeo
		if (!vimtype) {return false;}

		// determine if autoplay was set
		var orig_autoplay = undefined;
		if (playersrc.indexOf('autoplay=')!='-1') {orig_autoplay = playersrc.split('autoplay=')[1].split('&')[0];}

		if (ytOoptions.AutoPlayEmbed=='true') {
			if (orig_autoplay) {
				// remove original autoplay setting
				playersrc = playersrc.replace('&autoplay=0','').replace('&autoplay=1','').replace('autoplay=0','').replace('autoplay=1','');
			}
			// set autoplay to yes
			base += 'autoplay=1';
		}

		if (ytOoptions.Cleanup=='true') {
			playersrc = playersrc.replace('&byline=0','').replace('byline=0','').replace('&byline=1','').replace('byline=1','');
			playersrc = playersrc.replace('&portrait=0','').replace('portrait=0','').replace('&portrait=1','').replace('portrait=1','');
			playersrc = playersrc.replace('&show_byline=0','').replace('show_byline=0','').replace('&show_byline=1','').replace('show_byline=1','');
			playersrc = playersrc.replace('&show_portrait=0','').replace('show_portrait=0','').replace('&show_portrait=1','').replace('show_portrait=1','');
			base += '&byline=0&portrait=0';
		}
		if (ytOoptions.Loop=='true') {base += '&loop=1';}

		if (base!='') {

			var vidid = undefined;
			if (vimtype=='iframe') {
				var bits = playersrc.split('video/');
				if (bits && bits[1]) {vidid=bits[1].split('?')[0];}
			}
			if (vimtype=='embed') {
				var bits = playersrc.split('clip_id=');
				if (bits && bits[1]) {vidid=bits[1].split('&')[0];}
			}

			// could not find videoid
			if (!vidid) {return false;}

			// enable script access
			base += '&api=1';

			// enable fullscreen
			playersrc = playersrc.replace('fullscreen=0','fullscreen=1');

			if (vimtype=='iframe') {
				// create new iframe
				var oldwidth = player.width;
				var oldheight = player.height;

				var proto = 'http://';
				if (parentssl==true) {proto='https://';}
				var newurl = proto+'player.vimeo.com/video/'+vidid+'?'+base;

				var temp = d.createElement('iframe');
				temp.src = newurl;
				temp.setAttribute('yto', 'immf');
				temp.setAttribute('frameborder', '0');
				temp.width=oldwidth;
				temp.height=oldheight;

				var parent = player.parentNode;
				var insertBefore = player.nextSibling;
				parent.removeChild(player);
				parent.insertBefore(temp, insertBefore);
			}
			if (vimtype=='embed') {
				// modify existing flash
				player.src = playersrc+'&'+base;
				player.setAttribute('yto', 'immf');
			}
		}
	}
}

function vimeoFindObj (e) {
	// loop through everything on page and look for valid youtube embed or objects

	// get source domain from object
	var eltDomain = extractDomainFromURL(e.url);

	// get object
	var player = e.target;

	if (player && player.localName && player.src && (player.localName=='iframe' || player.localName=='embed') && player.src.indexOf('vimeo.com')!='-1' && !player.getAttribute('yto')) {
		if (ytOoptions && typeof ytOoptions == 'object' && ytOoptions.eyoutube=='true') {
			// use alert rather than console.log because vimeo clears console
			//alert('SWAP');
			vimSwapObj(player);
		}
	}
}

function cleanURL (newurl) {
	// cleanup any time codes (youtube)

	if (newurl.indexOf('#at=')!='-1' || newurl.indexOf('#t=')!='-1') {
		// clean up time code argument
		if (newurl.indexOf('#at=')!='-1') {
			var bits = newurl.split('#at=')[1];
			if (bits.indexOf('m')!='-1') {
				var parts = bits.split('m');
				newurl = newurl.replace(bits,((parts[0]*60)+parseInt(parts[1])));
			}
		}
		if (newurl.indexOf('#t=')!='-1') {
			var bits = newurl.split('#t=')[1];
			if (bits.indexOf('m')!='-1') {
				var parts = bits.split('m');
				newurl = newurl.replace(bits,((parts[0]*60)+parseInt(parts[1])));
			}
		}
		newurl = newurl.replace('#at=','&t=').replace('#t=','&t=');
	}
	newurl = newurl.replace(/#!/g,'');

	if (ytOoptions.Wads=='true' && newurl.indexOf('/watch')!='-1' && newurl.indexOf('&wadsworth=1')=='-1') {
		// observe wadsworths constant
		newurl = newurl.replace('&wadsworth=0','').replace('&wadsworth=1','')+'&wadsworth=1';
	}
	if (ytOoptions.SSL=='true' && newurl.indexOf('https://')=='-1') {
		// do a pre-emptive ssl swap
		newurl = newurl.replace('http://','https://');
	}

	return newurl;
}

function getSafariPrefs () {
	// get prefs from global_page.html

	try {
		var theAnswer = safari.self.tab.canLoad(event, 'getPrefs');
	} catch(err){}

	if (theAnswer) {
		// load this localstore with prefs from global (cue: eyes roll)
		JSON.parse(theAnswer,function(key,value){
			if (key) {
				//console.log('   '+key+': '+value);
				localStorage.setItem(key,value);
			}
		});

		// stop waiting for prefs
		document.removeEventListener('beforeload', getSafariPrefs, true);

		ytOoptions = localStorage;

		var bail=false;
		if (native==true && ytOoptions.youtube=='false') {bail=true;}
		if (thirdparty==true && ytOoptions.eyoutube=='false') {bail=true;}

		if (bail==true) {
			// stop looking at the page
			document.removeEventListener('beforeload', ytFindObj, true);

			return false;
		}

		if (ytOoptions.youtube=='true' && ytOoptions.InVideo!='default' && native==true) {
			var newurl = cleanURL (thisurl);
			if (thisurl!=newurl) { document.location=newurl; }
		}
	}
}

// ------------------

var ytOoptions = undefined;
var savedPlayer, savedPlayerVars;
var savedPlayers = [];
var embedded = false;
var parentssl = false;
var thirdparty = false;
var isiframe = false;
var channelpage = false;
var native = false;
var objectcount = 0;

var d = document;
var thisurl = d.URL;

var thisbrowser='NaN';
if (window.opera) {thisbrowser='opera';} else {
	if (navigator.userAgent.indexOf('Firefox')!='-1') {thisbrowser='firefox'; d=content.document;}
	if (navigator.userAgent.indexOf('Safari')!='-1') {thisbrowser='safari';}
	if (navigator.userAgent.indexOf('Chrome')!='-1') {thisbrowser='chrome';}
}
bug3('thisbrowser: '+thisbrowser);
if (thisbrowser=='NaN' || (thisbrowser!='chrome' && thisbrowser!='safari')) {throw '';}

if (thisurl.indexOf('www.youtube.com')=='-1') {embedded=true;}
if (thisurl.indexOf('https://')!='-1') {parentssl=true;}
if (thisurl.indexOf('/embed/')!='-1') {thirdparty=true;}
if (thisurl.indexOf('http://www.youtube.com')=='0' || d.URL.indexOf('https://www.youtube.com')=='0') {native=true;}

// start looking at page objects
document.addEventListener('beforeload', ytFindObj, true);
document.addEventListener('beforeload', vimeoFindObj, true);

if (thisbrowser=='chrome') {
	// send message back to background.js that we want settings
	chrome.extension.sendRequest({greeting: 'youtube.js', todo: ''}, function(response) {

		// options arrived from background
		ytOoptions = JSON.parse(response['settings']);

		if (ytOoptions.youtube=='true' && ytOoptions.InVideo!='default' && native==true) {
			var newurl = cleanURL (thisurl);
			if (thisurl!=newurl) { document.location=newurl; }
		}

		if (typeof ytOoptions!="undefined" && savedPlayers.length>0) {
			// go through an array of youtube objects

			while (savedPlayers.length > 0) {
				// get the saved player from the stack
				var savedPlayer = savedPlayers[0];

				// determine any flashvars
				var savedPlayerVars = ['thirdparty'];
				if (savedPlayer.getAttribute('flashvars')) {
					savedPlayerVars = savedPlayer.getAttribute('flashvars').split('&');
				}

				// make the flashvars right
				var cleanVars = cleanYTFlashVars (savedPlayerVars);

				// insert new flashvars
				if (cleanVars != false) {ytSwapObj(savedPlayer, cleanVars);}

				// remove player from the stack
				savedPlayer = savedPlayers.shift();
			}
		} else if (typeof ytOoptions != "undefined" && typeof savedPlayer != "undefined") {
			// a first pass at the object was found

			if (proceed()==true) {
				// proceed says page looks valid
				var cleanVars = cleanYTFlashVars (savedPlayerVars);
				if (cleanVars != false) {ytSwapObj(savedPlayer, cleanVars);}
			}

			// stop looking at the page
			document.removeEventListener('beforeload', ytFindObj, true);
		} else {
			// options or savedPlayer is undefined
		}
	});
}

if (thisbrowser=='safari') {
	// send message back to global_page.html that we want settings
	document.addEventListener('beforeload', getSafariPrefs, true);

	if (savedPlayer && savedPlayerVars && ytOoptions != "undefined" && ytOoptions.length>3) {
		// a first pass at the object was found and we have options

		if (proceed()==true) {
			// proceed says page looks valid
			var cleanVars = cleanYTFlashVars (savedPlayerVars);
			if (cleanVars != false) {ytSwapObj(savedPlayer, cleanVars);}
		}

		// stop looking at the page
		document.removeEventListener('beforeload', ytFindObj, true);
	} else {
		// options or savedPlayer is undefined
	}
}

/* EOF */