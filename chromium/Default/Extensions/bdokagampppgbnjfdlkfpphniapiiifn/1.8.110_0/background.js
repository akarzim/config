// YouTube Options
// Copyright (c) 2010-2013 smart people on ice, LLC.
// All rights reserved.  Must not be reproduced without express written permission of smart people on ice, LLC.
//
// https://spoi.com/software/yto/SLA

function bug2 (what) {
	if (1==2) {
		if (typeof what!='object') { console.log('>>'+what);
		} else { console.log(what); }
	}
}

function firstTimeOptions() {
	// some people are not smart enough to find the options
	// do this once for each time the extension is newly installed

	if (!localStorage.FoundOptions) {
		localStorage.FoundOptions = 'true';
		if (thisbrowser=='chrome') {
			window.open('chrome-extension:options.html');
		} else if (thisbrowser=='safari') {
			chrome.tabs.create({url: 'options.html'});
		} else if (thisbrowser=='opera') {
		} else if (thisbrowser=='firefox') {
		}
	} else {
		bug2('localStorage found.');
		//console.log(localStorage);
	}
}

function loadSettings () {
	// reload settings from localstore

	bug2(JSON.stringify(setstor));

	if (JSON.stringify(setstor)=='{}') {
		var newj = '';
		for (var p in setstor) {
			if (newj!='') {newj += ','}
			newj += '"'+p+'":"'+setstor.getItem(p).replace(/\"/g,'\\"')+'"';
		}
		newj = '{'+newj+'}';
		console.log('ERROR: making own JSON:');
		console.log(newj);
		return newj;
	}

	return JSON.stringify(setstor);
}

function startTabsListener () {
	// handle new or refreshed tabs (chrome)

	console.log('creating handler for showing popup menu for tabs (chrome)');
	chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab){
		if (changeInfo.status == 'loading' && goodURL(tab.url)==true && localStorage.Popup=='true') {
			// show popup menu for good urls
			chrome.pageAction.show(tabId);
		}
	});
}

function defineDefaults () {
	// define localstore defaults

	setstor.Filtering='true';

	if (!setstor.SetView) setstor.SetView='default';
	if (!setstor.SetRes) setstor.SetRes='default';
		if (!setstor.ChangeResView) setstor.ChangeResView='false';

	if (!setstor.InVideo) setstor.InVideo='all';
	if (!setstor.AutoPlay) setstor.AutoPlay='no';
		if (!setstor.AutoPlayEmbed) setstor.AutoPlayEmbed='false';
		if (!setstor.IgnoreTime) setstor.IgnoreTime='true';

	if (!setstor.Loop) setstor.Loop='false';
	if (!setstor.SetLink) setstor.SetLink='default';
	if (!setstor.MoPlay) setstor.MoPlay='false';

	if (!setstor.RSS) setstor.RSS='false';
	if (!setstor.SSL) setstor.SSL='false';
	if (!setstor.Popout) setstor.Popout='false';
	if (!setstor.Wmode) setstor.Wmode='false';
	if (!setstor.Wads) setstor.Wads='false';
	if (!setstor.Volume) setstor.Volume='default';
	if (!setstor.Keys) setstor.Keys='false';

	if (!setstor.Cinemize) setstor.Cinemize='false';
		if (!setstor.Header) setstor.Header='false';
		if (!setstor.Guide) setstor.Guide='true';
		if (!setstor.Headline) setstor.Headline='false';
		if (!setstor.Description) setstor.Description='true';
		if (!setstor.ExpDescription) setstor.ExpDescription='false';
		if (!setstor.Comments) setstor.Comments='true';
		if (!setstor.Sidebar) setstor.Sidebar='true';
		if (!setstor.Footer) setstor.Footer='true';
		if (!setstor.Playlist) setstor.Playlist='true';
	if (!setstor.Cleanup) setstor.Cleanup='true';
		if (!setstor.SidebarStay) setstor.SidebarStay='false';
	if (!setstor.ScrollTop) setstor.ScrollTop='false';

	if (!setstor.Swatch) setstor.Swatch='#222222';
	if (!setstor.Mood) setstor.Mood='default';
	if (!setstor.Frame) setstor.Frame='false';

	if (!setstor.Hide) setstor.Hide='true';
	if (!setstor.ControlsTheme) setstor.ControlsTheme='default';

	if (!setstor.DownloadLinks) setstor.DownloadLinks='true';
		if (!setstor.Hwebm) setstor.Hwebm='false';
		if (!setstor.Hmp4) setstor.Hmp4='false';
		if (!setstor.Hflv) setstor.Hflv='false';
		if (!setstor.H3gp) setstor.H3gp='false';
		if (!setstor.H3d) setstor.H3d='true';

	if (!setstor.Popup) setstor.Popup='true';

	if (!setstor.Sites) setstor.Sites='false';
		if (!setstor.youtube) setstor.youtube='true';
		if (!setstor.eyoutube) setstor.eyoutube='true';
		if (!setstor.youtubeHome) setstor.youtubeHome='true';
		if (!setstor.youtubeUser) setstor.youtubeUser='true';
		if (!setstor.youtubeChannel) setstor.youtubeChannel='true';
		if (!setstor.daily) setstor.daily='false';
		if (!setstor.dump) setstor.dump='false';
		if (!setstor.escapist) setstor.escapist='false';
		if (!setstor.fear) setstor.fear='false';
		if (!setstor.funny) setstor.funny='false';
		if (!setstor.g4tv) setstor.g4tv='false';
		if (!setstor.hulu) setstor.hulu='false';
		if (!setstor.vimeo) setstor.vimeo='false';
		if (!setstor.meta) setstor.meta='false';
		if (!setstor.twitter) setstor.twitter='false';
		if (!setstor.others) setstor.others='false';

	if (!setstor.ytCodec) setstor.ytCodec='Flash';
	if (!setstor.ytVers) setstor.ytVers='normal';

	// do away with animation
	setstor.OldAnimate='false';
	if (setstor.Animate && setstor.Animate=='true') {setstor.OldAnimate='true';}

	// migrate settings
	if (setstor.ChangeView=='false') setstor.SetView='default';
	if (setstor.ChangeRes=='false') setstor.SetRes='default';
	if (setstor.InVideo=='true') setstor.InVideo='all';
	if (setstor.AutoPlay=='true') setstor.AutoPlay='no';
	if (setstor.ChangeLink=='false') setstor.SetLink='default';
	if (setstor.Showcc=='true') setstor.InVideo='showcc';
	if (setstor.Annotations=='true') setstor.InVideo='ads';
	if (setstor.AutoPlaylist=='true') setstor.AutoPlay='playlist';
	if (setstor.NoBuff=='true') setstor.AutoPlay='nobuff';
	if (setstor.Gray=='true') setstor.Mood='matte';
	if (setstor.Dim=='true') setstor.Mood='dim';
	if (setstor.Swatch=='#EBEBEB') setstor.Swatch='#FBFBFB';
	if (setstor.Space) setstor.Keys=setstor.Space;

	// cleanup no longer hides guide automatically, so migrate old setting
	if (!setstor.OldGuide) setstor.OldGuide='false';
	if (setstor.OldGuide=='false') {
		if (setstor.Cleanup=='true' && setstor.Guide=='false') {setstor.Guide='true';}
		setstor.OldGuide='true';
	}

	// fix volume fix
	if (!setstor.FixVolume2) {
		setstor.FixVolume2='true';
		if (setstor.Volume=='100' || setstor.Volume==100) {setstor.Volume='default';}
		setstor.removeItem('FixVolume');
	}

	// delete old settings
	setstor.removeItem('ControlColourSwatch');
	setstor.removeItem('ChangeLink');
	setstor.removeItem('ChangeView');
	setstor.removeItem('ChangeRes');
	setstor.removeItem('Annotations');
	setstor.removeItem('Showcc');
	setstor.removeItem('AutoPlaylist');
	setstor.removeItem('NoBuff');
	setstor.removeItem('Gray');
	setstor.removeItem('Dim');
	setstor.removeItem('Animate');
	setstor.removeItem('Space');
}

function goodURL (taburl) {
	// list all valid domains/urls

	var full=false;
	var good=false;

	if (setstor.Sites=='true') {full=true;}

	if (taburl.indexOf('youtube.com')!='-1' && (setstor.youtube=='true' || full)) {good=true;}
	if (taburl.search(/vimeo.com\/[0-9]/)!='-1' && (setstor.vimeo=='true' || full)) {good=true;}
	if (taburl.indexOf('dailymotion.com/video/')!='-1' && (setstor.daily=='true' || full)) {good=true;}
	if (taburl.indexOf('metacafe.com/watch/')!='-1' && (setstor.meta=='true' || full)) {good=true;}
	if (taburl.indexOf('g4tv.com/videos/')!='-1' && (setstor.g4tv=='true' || full)) {good=true;}
	if (taburl.indexOf('fearnet.com/movies')!='-1' && (setstor.fear=='true' || full)) {good=true;}
	if (taburl.indexOf('funnyordie.com/videos')!='-1' && (setstor.funny=='true' || full)) {good=true;}
	if (taburl.indexOf('hulu.com/watch')!='-1' && (setstor.hulu=='true' || full)) {good=true;}
	if (taburl.indexOf('escapistmagazine.com/videos')!='-1' && (setstor.escapist=='true' || full)) {good=true; }
	if (taburl.indexOf('dump.com')!='-1' && (setstor.dump=='true' || full)) {good=true;}
	if (taburl.indexOf('twitter.com')!='-1' && (setstor.twitter=='true' || full)) {good=true;}
	if ((taburl.indexOf('own3d.tv')!='-1' || taburl.indexOf('twitch.tv')!='-1' || taburl.indexOf('instagram.com')!='-1' || taburl.indexOf('xvideos.com/video')!='-1' || taburl.indexOf('pornhub.com/view_video')!='-1' || (taburl.indexOf('tube8.com/')!='-1' && taburl.replace('http:\/\/','').search(/\/.*\//)!='-1')) && (setstor.others=='true' || full)) {good=true;}
	bug2('this page is good? '+ good +' ('+ taburl +')' );

	return good;
}

// ------------------

var d=document;
var setstor=localStorage;
var thisbrowser='NaN';
if (window.opera) {thisbrowser='opera'; setstor=widget.preferences;} else {
	if (navigator.userAgent.indexOf('Firefox')!='-1') {thisbrowser='firefox';}
	if (navigator.userAgent.indexOf('Safari')!='-1') {thisbrowser='safari';}
	if (navigator.userAgent.indexOf('Chrome')!='-1') {thisbrowser='chrome';}
}
bug2('thisbrowser: '+thisbrowser);

if (thisbrowser!='firefox' && window==window.parent) {

	// make sure there is a setting for everything
	defineDefaults();

	// only force options page on user once
	firstTimeOptions();

	// DO NOT DELETE THIS:
	localStorage.DownloadLinks = 'never';

	if (thisbrowser=='chrome') {
		// handler to listen for options.html, popup.html, or new tab/page

		chrome.extension.onRequest.addListener(
			function(request, sender, sendResponse) {
				console.log('callback: '+ request.greeting +' '+ request.todo);

				// options page changes
				if (request.greeting == 'options') {
					// options.html changes
					console.log('reloading settings because '+ request.greeting +' page changed: '+ request.todo);
					currentSettings = loadSettings();
					sendResponse({}); // send return
				} else if (request.greeting == 'ytVers') {
					setstor.ytVers = request.todo;
				} else if (request.greeting == 'ytCodec') {
					setstor.ytCodec = request.todo;
				} else if (request.todo == 'pa-on') {
					// change page action icon to visible on
					setstor.Filtering = 'true';
				} else if (request.todo == 'pa-off') {
					// change page action icon to visible off
					setstor.Filtering = 'false';
				} else if (request.todo == 'pa-once') {
					// change page action icon to visible off
					setstor.Filtering = 'once';
				} else if (request.todo == 'pa-show') {
					// change page action icon to visible off
					chrome.pageAction.show(sender.tab.id);
				} else if (request.todo == 'pa-hide') {
					// change page action icon to visible off
					chrome.pageAction.hide(sender.tab.id);
				} else {
					// a tab wants the current settings
					currentSettings = loadSettings();
					console.log(sender.tab.id+' wants settings, so sending: '+ currentSettings);
					sendResponse({settings: currentSettings});

					if (setstor.Filtering == 'false') {
						chrome.pageAction.setIcon({tabId: sender.tab.id, path: 'icons/16-off.png'});
					}
				}
		});
		bug2('background.js first run: '+JSON.stringify(localStorage).replace(/,/g,', '));

		startTabsListener();
	} else if (thisbrowser=='safari') {
		// handled by the global page file (global_page.html)

		// popup dimensions handled in Info.plist
	} else if (thisbrowser=='opera') {
		// When the injected script is activated, it connects with the background.js process
		opera.extension.onconnect = function(event) {
			// Convert the settings into an object
			litobj = {};
			litobj['makelinks_action'] = 'settings';
			litobj['prefs'] = loadSettings();
			//opera.postError(litobj['prefs']);
			event.source.postMessage(litobj);

			if (event.origin.indexOf('popup.html') > -1 && event.origin.indexOf('widget://') > -1 ){
				var tab = opera.extension.tabs.getFocused();
				if (tab) {
					tab.postMessage( 'Send a port', [event.source] );
					//opera.postError('sent a message to injected script');
				}
			}
		}

		if (setstor.Popup=='true') {
			// create toolbar menu
			window.addEventListener('load', function(){
				var ToolbarUIItemProperties = {
					title: 'YouTube Options',
					icon: 'icons/18.png',
					popup: {
						href: 'popup.html',
						width: 330,
						height: 475
					}
				}
				var theButton = opera.contexts.toolbar.createItem(ToolbarUIItemProperties);
				opera.contexts.toolbar.addItem(theButton);
			}, false);
		}
		setstor.menu='pa-hide';
	}

	var currentSettings = loadSettings();
} else if (thisbrowser=='firefox') {
	// handled in background-moz.js
} else {
	bug2('already been here (background.js)');
}

bug2('end of background.js');

/* EOF */
