// YouTube Options
// Copyright (c) 2010-2013 smart people on ice, LLC.
// All rights reserved.  Must not be reproduced without express written permission of smart people on ice, LLC.
//
// https://spoi.com/software/yto/SLA

function bug (what) {
	if (1==2) {
		if (typeof what!='object') { console.log('>>'+what);
		} else { console.log(what); }
	}
}

// -----------------

function addCSS (newcss,id) {
	// adds css to head

	var d=document;

	var link = d.createElement('style');
	if (id) {
		link.setAttribute('id',id);
		var prevDiv=d.getElementById(id);
		if (prevDiv!=null) {
			d.head.removeChild(prevDiv);
		}
	}
	link.textContent=newcss;
	d.head.appendChild(link);
}

function showPrev (img,note) {
	// update preview div
	d.getElementById('preImg').src=img;
	if (note) {
		d.getElementById('status').textContent=note;
	} else {
		d.getElementById('status').textContent='YouTube Options';
	}
}

function handleMouse(what) {
	var d=document;

	var gui=d.getElementById('vidtype').textContent;

	// moused over an option that needs image to change
	showPrev(gui+'Normal.png','Toggle a '+popupTitle+'option');

	if (what.id == 'header') {
		showPrev(gui+'Header.png','Click to show or hide header');
	} else if (what.id == 'headline') {
		showPrev(gui+'Title.png','Click to show or hide title');
	} else if (what.id == 'guide') {
		showPrev(gui+'Guide.png','Click to show or hide guide');
	} else if (what.id == 'cinemize' || what.id == 'cinemizep') {
		showPrev(gui+'Cinema.png','Click to show or hide everything');
	} else if (what.id == 'comments') {
		showPrev(gui+'Comments.png','Click to show or hide comments');
	} else if (what.id == 'sidebar') {
		showPrev(gui+'Sidebar.png','Click to show or hide video suggestions');
	} else if (what.id == 'footer') {
		showPrev(gui+'Footer.png','Click to show or hide footer');
	} else if (what.id == 'playlist' || what.id == 'playlist3') {
		showPrev(gui+'Playlist.png','Click to show or hide playlist');
	} else if (what.id == 'description') {
		showPrev(gui+'Description.png','Click to show or hide description');
	} else if (what.id == '240') {
		showPrev(gui+'240.png','Click to change viewing size to 320x240');
	} else if (what.id == '360') {
		showPrev(gui+'360.png','Click to change viewing size to 640x360');
	} else if (what.id == '480') {
		showPrev(gui+'480.png','Click to change viewing size to 853x480');
	} else if (what.id == '720') {
		showPrev(gui+'720.png','Click to change viewing size to 1280x720');
	} else if (what.id == '1080' ) {
		showPrev(gui+'1080.png','Click to change viewing size to 1920x1080');
	} else if (what.id == '540') {
		showPrev(gui+'540.png','Click to change viewing size to 940x540');
	} else if (what.id == 'viewex' ) {
		showPrev(gui+'Window.png','Expand to window width (again to zoom)');
	} else if (what.id == 'downloads' || what.id == 'downloads2') {
		showPrev(gui+'DownloadLinks.png','Click to show or hide download links');
	} else if (what.id == 'loopon') {
		showPrev(gui+'Loop.png','Click to loop video');
	} else if (what.id == 'loopoff') {
		showPrev(gui+'LoopOff.png','Click to stop looping video');
	} else if (what.id == 'filton' || what.id == 'filton2') {
		showPrev(gui+'Normal.png','Click to apply options');
	} else if (what.id == 'filtoff' || what.id == 'filtoff2') {
		showPrev(gui+'Normal.png','Click to disable YouTube Options');
	} else if (what.id == 'filtonce' || what.id == 'filtonce2') {
		showPrev(gui+'Normal.png','Click to disable for one page refresh');
	} else if (what.id == 'prefs') {
		showPrev(gui+'Normal.png','Click to change options');
	}
}

function outMouse (what){
	// revert image back to normal

	var d=document;
	var gui=d.getElementById('vidtype');
	if (what.id == 'prefs'&&gui) {
		d.getElementById('preImg').src=gui.textContent+'Normal.png';
		d.getElementById('status').textContent='Toggle a '+popupTitle+'option';
	}
}

function togglepop (what) {
	// let yto.js know it needs to do something

	var thisid = what.id;
	if (thisid=='playlist3') {thisid='playlist';} // special case for playlist titlebar

	bug(thisbrowser+': '+thisid);

	if (thisbrowser=='chrome') {
		chrome.tabs.getSelected(null, function(tab) {
			chrome.tabs.sendRequest(tab.id, {greeting: 'tog', todo: thisid}, function(response) {
				//console.log(response.data);
			});
		});
	} else if (thisbrowser=='safari') {
		safari.application.activeBrowserWindow.activeTab.page.dispatchMessage('tog', thisid);
	} else if (thisbrowser=='firefox') {
	} else if (thisbrowser=='opera') {
		if (theport){
			// send settings back to yto.js
			theport.postMessage(thisid);
			//opera.postError('the send sent is: '+what.id);
		}
	}
}

function respop (what) {
	// let youtube.js know it needs to do something

	var thisid = what.id;

	bug(thisbrowser+': '+thisid);

	if (thisbrowser=='chrome'&&chrome.tabs) {
		chrome.tabs.getSelected(null, function(tab) {
			chrome.tabs.sendRequest(tab.id, {greeting: 'vis', todo: thisid}, function(response) {
				//console.log(response.data);
			});
		});
	} else if (thisbrowser=='safari') {
		safari.application.activeBrowserWindow.activeTab.page.dispatchMessage('vis', thisid);
	} else if (thisbrowser=='firefox') {
	} else if (thisbrowser=='opera') {
		if (theport){
			// send settings back to yto.js
			theport.postMessage(thisid);
			//opera.postError('the send sent is: '+what.id);
		}
	}
}

function openOptions () {
	// open the options from the popup menu

	if (thisbrowser=='chrome') {
		window.open('chrome-extension:options.html');
		// window.close();
	} else if (thisbrowser=='safari') {
		// send message to yto.js to send to global_page to open the options
		safari.application.activeBrowserWindow.activeTab.page.dispatchMessage('options');
	} else if (thisbrowser=='firefox') {
	} else if (thisbrowser=='opera') {
	}
}

function checkURL (url) {
	// change popup layout based on browser and url

	//console.log(url);

	popupTitle='';
	if (url.indexOf('youtube.com')!='-1') {
		popupTitle='YouTube ';

		if (url=='http://www.youtube.com/' || url=='https://www.youtube.com/') {ytPage='home';}
		if (url.indexOf('youtube.com/watch')!='-1') {ytPage='watch';}
		if (url.indexOf('youtube.com/user/')!='-1') {ytPage='user';}
		if (url.indexOf('youtube.com/channel')!='-1') {ytPage='channel';}

		if (setstor.youtubeHome=='false' && ytPage=='home') {options_only=true;}
		if (setstor.youtubeUser=='false' && ytPage=='user') {options_only=true;}
		if (setstor.youtubeChannel=='false' && ytPage=='channel') {options_only=true;}
		if (ytPage==undefined) {options_only=true;}
	}
	if (url.indexOf('vimeo.com')!='-1') {popupTitle='Vimeo ';}
	if (url.indexOf('dailymotion.com')!='-1') {popupTitle='Dailymotion ';}
	if (url.indexOf('g4tv.com')!='-1') {popupTitle='G4TV ';}
	if (url.indexOf('fearnet.com')!='-1') {popupTitle='FEARnet ';}
	if (url.indexOf('metacafe.com')!='-1') {popupTitle='Metacafe ';}
	if (url.indexOf('escapistmagazine.com')!='-1') {popupTitle='Escapist ';}
	if (url.indexOf('hulu.com')!='-1') {popupTitle='Hulu ';}
	if (url.indexOf('pornhub.com')!='-1') {popupTitle='PornHub ';}
	if (url.indexOf('tube8.com')!='-1') {popupTitle='Tube8 ';}
	if (url.indexOf('xvideos.com')!='-1') {popupTitle='xVideos ';}
	if (url.indexOf('twitter.com')!='-1') {popupTitle='Twitter ';}
	if (url.indexOf('instagram.com')!='-1') {options_only=true;}

	// reset the menu based on url and browser
	cleanPopts();
}

function validateHandler () {
	// get current url and validate layout (safari)

	checkURL(safari.application.activeBrowserWindow.activeTab.url);
}

function addEvents (d) {
	// chrome manifest 2 is lame

	var maps = ['status', 'header', 'header2', 'headline', 'headline2', 'cinemize', 'cinemizep', 'downloads', 'downloads2', 'description', 'description2', 'comments', 'comments2', 'sidebar', 'sidebar2', 'footer', 'footer2', 'guide', 'playlist', 'playlist2', 'playlist3', 'Normal', 'filton', 'filton2', 'filtoff', 'filtoff2', 'filtonce', 'filtonce2', 'loopon', 'loopoff'];
	for (i=0;i<maps.length;i++) {
		d.getElementById(maps[i]).addEventListener('mouseover',function(){handleMouse(this);},true);
		d.getElementById(maps[i]).addEventListener('click',function(){togglepop(this);},true);
	}
	maps = ['240', '360', '480', '540', '720', '1080', 'viewex'];
	for (i=0;i<maps.length;i++) {
		d.getElementById(maps[i]).addEventListener('mouseover',function(){handleMouse(this);},true);
		d.getElementById(maps[i]).addEventListener('click',function(){respop(this);},true);
	}
	d.getElementById('prefs').addEventListener('mouseover',function(){handleMouse(this);},true);
	d.getElementById('prefs').addEventListener('mouseout',function(){outMouse(this);},true);
	d.getElementById('prefs').addEventListener('click',function(){openOptions();},true);
}

function cleanPopts (kind) {
	// determine if we show the wrong page message

	var newcss = '';
	var show=false;

	if (popupTitle!='YouTube ') {
		newcss += '#map, #loopnfilter {display: none;} #nomap {display: block;} ';
	}

	if (popupTitle == 'Twitter ') {
		if (thisbrowser=='safari' || thisbrowser=='opera') {
			if (setstor.twitter=='false') {
				show=true;
			} else if (setstor.menu=='pa-hide') {
				show=true;
			}
		}
		newcss += '#nomap, #looping {display: none;} #loopnfilter {display: block;} #filtering {float: left !important;} ';
	}

	if (popupTitle == 'Hulu ') {
		newcss += '#status, #map, #res, #loopnfilter, #downloads2, #filtering2 {display:none;} ';
	}

	if (options_only==true) {
		newcss += '#status, #map, #nomap, #res, #loopnfilter {display: none;} ';
	}
	if (ytPage=='home' || ytPage=='user' || ytPage=='channel') {
		newcss += '#res {display: none;} #loopnfilter {margin-top: 9px;} ';
	}
	if (ytPage=='home' || ytPage=='channel') {
		newcss += '#loopnfilter {display: none;} #opt {margin-top: 9px;} ';
	}

	if (thisbrowser=='opera') {
		// opera is special width and does not have option button
		newcss += '#nomap, #res, #loopnfilter, #opt {width: 280px !important;} ';
		newcss += '#opt {display:none;} ';
	}

	// even if is empty we need to clear it out
	addCSS(newcss,'ytOmenu');

	// try and trick out safari popup menu for non supported site
	if (popupTitle=='') {kind='NaN';}

	if (thisbrowser=='safari' || thisbrowser=='opera') {
		var d=document;
		if (show || kind) {
			// show the wrong page message
			d.getElementById('theform').style.display='none';
			d.getElementById('wrongpop').style.display='block';
		} else {
			// show a normal popup menu
			d.getElementById('theform').style.display='block';
			d.getElementById('wrongpop').style.display='none';
		}

		if (1==2) {
			d.getElementById('debug').textContent='kind: '+kind+'\n show: '+show+'\n '+setstor.menu;
			d.getElementById('debug').style.display='block';
		}
	}
}

// ------------------

var d=document;
var setstor=localStorage;
var thisbrowser='NaN';
var popupTitle='';
var options_only=false;
var ytPage=undefined;

if (window.opera) {thisbrowser='opera'; setstor=widget.preferences;} else {
	if (navigator.userAgent.indexOf('Firefox')!='-1') {thisbrowser='firefox';}
	if (navigator.userAgent.indexOf('Safari')!='-1') {thisbrowser='safari';}
	if (navigator.userAgent.indexOf('Chrome')!='-1') {thisbrowser='chrome';}
}

if (thisbrowser=='chrome'&&chrome) {
	if (chrome.tabs) {
		chrome.tabs.getSelected(null, function(tab) {
			// change popup layout based on browser and url

			checkURL(tab.url);
		});
	}
	if (chrome.extension) {
		// determine if download links are available

		if (localStorage.DownloadLinks=='never') {
			d.getElementById('downloads').setAttribute('coords','');
			d.getElementById('downloads2').style.display='none';
		}
	}
}

if (thisbrowser=='safari') {
	// create event to verify current page url

	safari.application.addEventListener('popover', validateHandler, true);
}

if (thisbrowser=='opera') {
	// create opera messaging system
	var theport;

	function handleMessageFromInjectedScript (event) {
		//console.log ('Message received from the injected script: '+ event.data);
		opera.postMessage ('Message received from the injected script: '+ event.data);
	}

	opera.extension.onmessage = function(event) {
		if (event.data == 'Here is a port to the currently focused tab') {
			if (event.ports.length > 0) {
				theport = event.ports[0];
				theport.onmessage = handleMessageFromInjectedScript;
			}
		}

		if (event.data.prefs) {
			// get current url and validate layout

			checkURL(event.data.prefs);
		}

		// show or hide popup guts based on active tab url
		if (event.data.makelinks_action == 'settings') {
			cleanPopts('hide');
		} else {
			cleanPopts();
		}
	}
}

if (thisbrowser=='firefox') {
	function getDOM() { if (thisbrowser=='firefox') { return content.document; } return document; }
	self.on('message', function(what) {
		var d=getDOM();
		//console.log('popup.js got this: '+what);
		d.getElementById('debug').textContent=what;
	});
	//d.getElementById('debug').textContent='hey';
}

if (thisbrowser!='NaN') {
	// add mouse and key events
	addEvents(d);
}

/* EOF */