// YouTube Options
// Copyright (c) 2010-2013 smart people on ice, LLC.
// All rights reserved.  Must not be reproduced without express written permission of smart people on ice, LLC.
//
// https://spoi.com/software/yto/SLA

function bug(what) {
	if (1==2) {
		if (typeof what!='object') { console.log('>>'+what);
		} else { console.log(what); }
	}
}

function inArray (needle, haystack) {
	for (var i = 0; i < haystack.length; i++) {
		if (needle==haystack[i]) {
			return true;
		}
	}
	return false;
}

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

function isToF (what) {
	// is it true or false

	if (what=='true'||what=='false') { return true; }
	return false;
}

function loadSettings () {
	// reload settings from localStorage

	bug(JSON.stringify(setstor));

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

// -----------------

function extRefresh() {
	// show extension must be refreshed notice (opera)

	if (thisbrowser=='opera') {
		var aa=d.getElementById('operadis');
		if (aa.style.display=='block') {
			aa.style.display='none';
		} else {
			aa.style.display='block';
		}
	}
}

function getSafariAnswer (theMessageEvent) {
	// handle answer (safari events)

	bug('got back from safari message director: '+theMessageEvent.name);
	if (theMessageEvent.name === "putPrefs") {
		JSON.parse(theMessageEvent.message,function(key,value){
			if (typeof value!='object') {
				localStorage.setItem(key,value);
			}
		});
	}
}

function focusSettings () {
	// hilight the settings for copying

	d.getElementById('jsettings').value=loadSettings();
	bug ('copying jsettings to jbsettings');
	d.getElementById('jbsettings').value=d.getElementById('jsettings').value;

	var bits = d.getElementById('jsettings').select();
}

function getSettings () {
	// swap out parts of mail message for copying

	var link=mailConfig();
	if (d.getElementById('settings')&&d.getElementById('getset')) {
		d.getElementById('settings').value=unescape(link).replace('?',"\n").replace('&body=',"\n\n").replace('mailto:',"mailto=");
		d.getElementById('getset').style.display='block';
	}
}

function mailConfig () {
	// format a mail message

	var to='spoi.Software@gmail.com';
	var subject='YTO full config ('+thisbrowser+')';
	if (setstor.DownloadLinks=='never') {subject='YTO google config ('+thisbrowser+')'; }
	var helptext=escape('What appears to be wrong:\n\n\nAt least one specific URL you have the problem with:\n\n\n');

	var body=helptext+loadSettings();

	if (body.indexOf('"Version":"undefined"')!='-1') {
		body=body.replace(/"Version":"undefined"/,'"Version":"'+document.getElementById('version').textContent+'"');
	}

	body += escape('\n\nScreen:'+ screen.width +'x'+ screen.height +'x'+ screen.colorDepth+'\nWindow:'+window.innerWidth+'x'+window.innerHeight+'\n\n'+thisbrowser+':');

	var link='mailto:'+to+'?subject='+subject+'&body='+body+navigator.userAgent;
	return link;
}

function showVis (kind) {
	// change display to represent setting

	var d=document;

	if (kind=='swatch') {
		// change background to match colour

		var ss=d.getElementById('Swatch');
		if (ss) {
			if (ss.options[ss.selectedIndex].value=='#000000') {d.getElementById('colorswatch').className='swb';}
			if (ss.options[ss.selectedIndex].value=='#222222') {d.getElementById('colorswatch').className='swd';}
			if (ss.options[ss.selectedIndex].value=='#888888') {d.getElementById('colorswatch').className='swm';}
			if (ss.options[ss.selectedIndex].value=='#FBFBFB') {d.getElementById('colorswatch').className='swn';}
			showVis('mood');
		}
	}
}

function saveSettings () {
	// save the text settings into real settings
	// please let this not be poor judgement

	var aa=d.getElementById('jsettings');
	var ab=d.getElementById('jbsettings');
	if (aa&&ab) {
		var bits = aa.value;
		var origbits = ab.value;
	} else {
		return false;
	}

	var cool=false;

	if (bits!='' && bits!=origbits) {
		bug('settings edit was modified.  looking at them now..');
		try{
			bits=JSON.parse(bits);
		}
		catch(e){
			aa.value='Yuck!  Bad list.';
			return false;
		}

		if (bits.AutoPlayEmbed&&isToF(bits.AutoPlayEmbed)) { setstor.AutoPlayEmbed=bits.AutoPlayEmbed; cool=true; }
		if (bits.ChangeResView&&isToF(bits.ChangeResView)) { setstor.ChangeResView=bits.ChangeResView; cool=true; }
		if (bits.Cinemize&&isToF(bits.Cinemize)) { setstor.Cinemize=bits.Cinemize; cool=true; }
		if (bits.Cleanup&&isToF(bits.Cleanup)) { setstor.Cleanup=bits.Cleanup; cool=true; }
		if (bits.Comments&&isToF(bits.Comments)) { setstor.Comments=bits.Comments; cool=true; }
		if (bits.Description&&isToF(bits.Description)) { setstor.Description=bits.Description; cool=true; }
		// DownloadLinks
		if (bits.ExpDescription&&isToF(bits.ExpDescription)) { setstor.ExpDescription=bits.ExpDescription; cool=true; }
		if (bits.Frame&&isToF(bits.Frame)) { setstor.Frame=bits.Frame; cool=true; }
		if (bits.Footer&&isToF(bits.Footer)) { setstor.Footer=bits.Footer; cool=true; }
		if (bits.FoundOptions&&isToF(bits.FoundOptions)) { setstor.FoundOptions=bits.FoundOptions; cool=true; }
		if (bits.GoogleBar&&isToF(bits.GoogleBar)) { setstor.GoogleBar=bits.GoogleBar; cool=true; }
		if (bits.Guide&&isToF(bits.Guide)) { setstor.Guide=bits.Guide; cool=true; }
		if (bits.Header&&isToF(bits.Header)) { setstor.Header=bits.Header; cool=true; }
		if (bits.Headline&&isToF(bits.Headline)) { setstor.Headline=bits.Headline; cool=true; }
		if (bits.Hide&&isToF(bits.Hide)) { setstor.Hide=bits.Hide; cool=true; }
		if (bits.IgnoreTime&&isToF(bits.IgnoreTime)) { setstor.IgnoreTime=bits.IgnoreTime; cool=true; }

		if (bits.Hwebm&&isToF(bits.Hwebm)) { setstor.Hwebm=bits.Hwebm; cool=true; }
		if (bits.Hmp4&&isToF(bits.Hmp4)) { setstor.Hmp4=bits.Hmp4; cool=true; }
		if (bits.Hflv&&isToF(bits.Hflv)) { setstor.Hflv=bits.Hflv; cool=true; }
		if (bits.H3gp&&isToF(bits.H3gp)) { setstor.H3gp=bits.H3gp; cool=true; }
		if (bits.H3d&&isToF(bits.H3d)) { setstor.H3d=bits.H3d; cool=true; }

		if (bits.Loop&&isToF(bits.Loop)) { setstor.Loop=bits.Loop; cool=true; }
		if (bits.MoPlay&&isToF(bits.MoPlay)) { setstor.MoPlay=bits.MoPlay; cool=true; }
		if (bits.Playlist&&isToF(bits.Playlist)) { setstor.Playlist=bits.Playlist; cool=true; }
		if (bits.Popout&&isToF(bits.Popout)) { setstor.Popout=bits.Popout; cool=true; }
		if (bits.Popup&&isToF(bits.Popup)) { setstor.Popup=bits.Popup; cool=true; }
		if (bits.RSS&&isToF(bits.RSS)) { setstor.RSS=bits.RSS; cool=true; }
		if (bits.SSL&&isToF(bits.SSL)) { setstor.SSL=bits.SSL; cool=true; }
		if (bits.ScrollTop&&isToF(bits.ScrollTop)) { setstor.ScrollTop=bits.ScrollTop; cool=true; }
		if (bits.Sidebar&&isToF(bits.Sidebar)) { setstor.Sidebar=bits.Sidebar; cool=true; }
		if (bits.SidebarStay&&isToF(bits.SidebarStay)) { setstor.SidebarStay=bits.SidebarStay; cool=true; }
		// Version
		if (bits.Wmode&&isToF(bits.Wmode)) { setstor.Wmode=bits.Wmode; cool=true; }
		if (bits.Wads&&isToF(bits.Wads)) { setstor.Wads=bits.Wads; cool=true; }
		if (bits.Keys&&isToF(bits.Keys)) { setstor.Keys=bits.Keys; cool=true; }

		if (bits.AutoPlay&&inArray(bits.AutoPlay,['default','no','playlist','nobuff','nobufflist'])) { setstor.AutoPlay=bits.AutoPlay; cool=true; }
		if (bits.ControlsTheme&&inArray(bits.ControlsTheme,['default','light','dark'])) { setstor.ControlsTheme=bits.ControlsTheme; cool=true; }
		if (bits.InVideo&&inArray(bits.InVideo,['default','all','showcc','ads'])) { setstor.InVideo=bits.InVideo; cool=true; }
		if (bits.Mood&&inArray(bits.Mood,['default','matte','dim'])) { setstor.Mood=bits.Mood; cool=true; }
		if (bits.SetLink&&inArray(bits.SetLink,['default','in','pop','win'])) { setstor.SetLink=bits.SetLink; cool=true; }
		if (bits.SetRes&&inArray(bits.SetRes,['default','highres','1080','720','480','360','240'])) { setstor.SetRes=bits.SetRes; cool=true; }
		if (bits.SetView&&inArray(bits.SetView,['default','exp','1080','720','540','480','360','240'])) { setstor.SetView=bits.SetView; cool=true; }
		if (bits.Swatch&&inArray(bits.Swatch,['#000000','#222222','#888888','#FBFBFB'])) { setstor.Swatch=bits.Swatch; cool=true; }
		if (bits.Volume&&inArray(bits.Volume,['default','100','90','80','70','60','50','40','30','20','10','0'])) { setstor.Volume=bits.Volume; cool=true; }

		if (bits.Sites&&isToF(bits.Sites)) { setstor.Sites=bits.Sites; cool=true; }
		if (bits.youtube&&isToF(bits.youtube)) { setstor.youtube=bits.youtube; cool=true; }
		if (bits.eyoutube&&isToF(bits.eyoutube)) { setstor.eyoutube=bits.eyoutube; cool=true; }
		if (bits.youtubeHome&&isToF(bits.youtubeHome)) { setstor.youtubeHome=bits.youtubeHome; cool=true; }
		if (bits.youtubeUser&&isToF(bits.youtubeUser)) { setstor.youtubeUser=bits.youtubeUser; cool=true; }
		if (bits.youtubeChannel&&isToF(bits.youtubeChannel)) { setstor.youtubeChannel=bits.youtubeChannel; cool=true; }

		if (bits.daily&&isToF(bits.daily)) { setstor.daily=bits.daily; cool=true; }
		if (bits.dump&&isToF(bits.dump)) { setstor.dump=bits.dump; cool=true; }
		if (bits.escapist&&isToF(bits.escapist)) { setstor.escapist=bits.escapist; cool=true; }
		if (bits.fear&&isToF(bits.fear)) { setstor.fear=bits.fear; cool=true; }
		if (bits.funny&&isToF(bits.funny)) { setstor.funny=bits.funny; cool=true; }
		if (bits.g4tv&&isToF(bits.g4tv)) { setstor.g4tv=bits.g4tv; cool=true; }
		if (bits.hulu&&isToF(bits.hulu)) { setstor.hulu=bits.hulu; cool=true; }
		if (bits.meta&&isToF(bits.meta)) { setstor.meta=bits.meta; cool=true; }
		if (bits.twitter&&isToF(bits.twitter)) { setstor.twitter=bits.twitter; cool=true; }
		if (bits.vimeo&&isToF(bits.vimeo)) { setstor.vimeo=bits.vimeo; cool=true; }
		if (bits.others&&isToF(bits.others)) { setstor.others=bits.others; cool=true; }

		//cool=false; console.log('===> hey, do a manual refresh!'); aa.value='';

		if (thisbrowser=='safari') {
			// safari is different
			safari.self.tab.dispatchMessage('savePrefs',setstor);
		}
	} else {
		// no changes between old and new
		bug ('settings edit old and new are the same.');
		// reset to placeholder
		aa.value='';
	}

	if (cool==true) {
		// reload settings on the page
		window.location.reload();
	}
}

function showPrev (img,note) {
	// update preview div

	if (img) {
		d.getElementById('preImg').src=img;
		d.getElementById('preImg').style.display='inline-block';
		d.getElementById('preDivNote').style.borderTopStyle='solid';

		if (note) {
			d.getElementById('preDivNote').textContent=note;
			if (note.indexOf('\n')!='-1') {d.getElementById('preDivNote').innerHTML = note.replace(/\n/g,'<br>').replace(/\t/g,'&nbsp;&nbsp;&nbsp;');}
			d.getElementById('preDivNote').style.display='block';
		}
	} else {
		d.getElementById('preImg').style.display='none';
		d.getElementById('preDivNote').style.borderTopStyle='none';

		if (note) {
			d.getElementById('preDivNote').innerHTML = note;
			d.getElementById('preDivNote').style.display='block';
		}
	}
	if (!note) {
		d.getElementById('preDivNote').style.display='none';
	}
}

function handleMouse (what) {
	// change preview image based on mouseovers

	if (what.id=='divHeader') {
		showPrev(images+'/Header.png');
	} else if (what.id=='divGuide') {
		showPrev(images+'/Guide.png');
	} else if (what.id=='divHeadline') {
		showPrev(images+'/Title.png');
	} else if (what.id=='divComments') {
		showPrev(images+'/Comments.png');
	} else if (what.id=='divSidebar'||what.id=='secLinks') {
		showPrev(images+'/Sidebar.png');
	} else if (what.id=='divLinksIn') {
		if (setstor.DownloadLinks=='never') {
			showPrev(images+'/LinkIn.png','This option will remove the description, and comments.');
		} else {
			showPrev(images+'/LinkIn.png','This option will remove the description, comments, and any download links.');
		}
	} else if (what.id=='divSidebarStay') {
		showPrev(images+'/AutoPlayList.png');
	} else if (what.id=='divFooter') {
		showPrev(images+'/Footer.png');
	} else if (what.id=='divPlaylist') {
		showPrev(images+'/Playlist.png');
	} else if (what.id=='divDescription') {
		showPrev(images+'/Description.png','This option includes YouTube comments on videos.');
	} else if (what.id=='divExpDescription') {
		showPrev(images+'/DescriptionExpand.png');
	} else if (what.id=='divFrame') {
		showPrev(images+'/Frame.png','Add a frame around YouTube videos.');
	} else if (what.id=='divChangeView') {
		showPrev(images+'/ChangeView.png','This option can also be toggled using the page action popup menu.  This will also disable the YouTube frame option.');
	} else if (what.id=='divChangeRes') {
		showPrev(images+'/ChangeRes.png','This option may require hiding in-video ads and annotations and only works with YouTube Flash videos.');
	} else if (what.id=='divSyncRes') {
		showPrev(images+'/LoopOff.png','This option does not work with some video ads or movies.');
	} else if (what.id=='divAutoPlayDefault') {
		showPrev(images+'/LoopOff.png');
	} else if (what.id=='divAutoPlayNo') {
		showPrev(images+'/AutoPlay.png','This option may require hiding in-video ads and annotations and may not work with video ads or movies.');
	} else if (what.id=='divAutoPlayPlaylist') {
		showPrev(images+'/AutoPlayList.png','This option may require hiding in-video ads and annotations and may not work with video ads or movies.');
	} else if (what.id=='divAutoPlayNoBuff') {
		showPrev(images+'/NoBuff.png','This option may require hiding in-video ads and annotations and may not work with video ads or movies.');
	} else if (what.id=='divAutoPlayNoBuffList') {
		showPrev(images+'/NoBuffList.png','This option may require hiding in-video ads and annotations and may not work with video ads or movies.');
	} else if (what.id=='divInVideoDefault') {
		showPrev(images+'/InVideo.png');
	} else if (what.id=='divInVideoAds') {
		showPrev(images+'/Annotations.png','This option does not prevent some video ads and hides the playlist menu when in full-screen mode.');
	} else if (what.id=='divInVideoShowcc') {
		showPrev(images+'/Cc.png','This option does not prevent some video ads and hides the playlist menu when in full-screen mode.');
	} else if (what.id=='divInVideoAll') {
		showPrev(images+'/LoopOff.png','This option does not prevent some video ads and hides the playlist menu when in full-screen mode.');
	} else if (what.id=='divLinksDefault') {
		showPrev(images+'/LinkIn.png');
	} else if (what.id=='divLinksIn') {
		showPrev(images+'/LinkIn.png');
	} else if (what.id=='divLinksPop') {
		showPrev(images+'/LinkIn.png');
	} else if (what.id=='divLinksWin') {
		showPrev(images+'/LinkIn.png');
	} else if (what.id=='divMoodDefault') {
		showPrev(images+'/Normal.png');
	} else if (what.id=='divMoodMatte') {
		showPrev(images+'/Matte.png');
	} else if (what.id=='divMoodDim') {
		showPrev(images+'/Dim.png');
	} else if (what.id=='spoi') {
		showPrev(images+'/love.png');
	} else if (what.id=='divDownloadLinks' && d.getElementById('DownloadLinks').disabled == true || what.id=='disnote') {
		showPrev(images+'/Disabled.png','Please download the full version to enable this option.');
	} else if (what.id=='vg') {
		showPrev(images+'/Disabled.png');
	} else if (what.id=='divDownloadLinks' || what.id=='dltypes') {
		showPrev(images+'/DownloadLinks.png','This option does not work with some videos with ads or movies and does not work with some non-YouTube video sites.')
	} else if (what.id=='vf') {
		showPrev(images+'/DownloadLinks.png')
	} else if (what.id=='divHide') {
		showPrev(images+'/Hide.png');
	} else if (what.id=='divLoop') {
		showPrev(images+'/Loop.png','This option can also be toggled using the page action popup menu.');
	} else if (what.id=='divPopup'||what.id=='showpmenu3') {
		showPrev(images+'/Popup.png');
	} else if (what.id=='divAutoPlayEmbed') {
		showPrev(images+'/NoBuff.png','Automatically start playing videos on sites other than www.youtube.com and vimeo.com.');
	} else if (what.id=='divIgnoreTime') {
		showPrev(images+'/NoBuffList.png','Default behaviour is to ignore auto-play settings if a start time is present.');
	} else if (what.id=='divSSL') {
		showPrev(images+'/SSL.png');
	} else if (what.id=='divRSS') {
		showPrev(images+'/RSS.png','Create a link to use with Google Reader for YouTube and Twitter.');
	} else if (what.id=='divPopout') {
		showPrev(images+'/Popout.png','Open the current video in a video-only window.');
	} else if (what.id=='divCleanup') {
		showPrev(images+'/Cleanup.png','Simplify the page layout and add click-to-show bars to show Subscribe, author videos, Like, Dislike, Add to, Share, Flag, and Statistics buttons.  This will also hide the YouTube guide and disable the YouTube frame option.');
	} else if (what.id=='divScrollTop') {
		showPrev(images+'/ScrollToTop.png');
	} else if (what.id=='divMoPlay') {
		if (setstor.DownloadLinks=='never') {
			showPrev(images+'/MoPlay.png','This option will remove the description, and comments.');
		} else {
			showPrev(images+'/MoPlay.png','This option will remove the description, comments, and any download links.');
		}
	} else if (what.id=='divWmode') {
		showPrev(images+'/LoopOff.png','This has been know to cause problems with Flash videos.');
	} else if (what.id=='divVolume') {
		showPrev(images+'/LoopOff.png','Set the audio volume of the video.');
	} else if (what.id=='divWads') {
		showPrev(images+'/Wadsworth.png','Skip past the first 30% of the video.');
	} else if (what.id=='divKeys') {
		showPrev(false,'<table><tr><th>Key(s)</th><th>What it does</th></tr><tr><td>Spacebar</td><td>Start or pause the video</td></tr><tr><td>c</td><td>Hide or show comments</td></tr><tr><td>d</td><td>Hide or show description</td></tr><tr><td>f</td><td>Hide or show footer</td></tr><tr><td>g</td><td>Hide or show guide</td></tr><tr><td>h</td><td>Hide or show header</td></tr><tr><td>p</td><td>Hide or show playlist</td></tr><tr><td>s</td><td>Hide or show video suggestions</td></tr><tr><td>t</td><td>Hide or show title</td></tr><tr><td>y</td><td>Hide or show downloads</td></tr><tr><td>z</td><td>Hide or show everything</td></tr><tr><td>1</td><td>Set viewing size: 1920x1080</td></tr><tr><td>2</td><td>Set viewing size: 320x240</td></tr><tr><td>3</td><td>Set viewing size: 640x360</td></tr><tr><td>4</td><td>Set viewing size: 854x480</td></tr><tr><td>5</td><td>Set viewing size: 960x520</td></tr><tr><td>7</td><td>Set viewing size: 1280x720</td></tr><tr><td>w</td><td>Set viewing size: window width</td></tr><tr><td>Shift-1</td><td>Set viewing quality: 1080p</td></tr><tr><td>Shift-2</td><td>Set viewing quality: 240</td></tr><tr><td>Shift-3</td><td>Set viewing quality: 360p</td></tr><tr><td>Shift-4</td><td>Set viewing quality: 480p</td></tr><tr><td>Shift-7</td><td>Set viewing quality: 720p</td></tr><tr><td>Keypad-0</td><td>Video audio volume: Mute</td></tr><tr><td>Keypad-1</td><td>Video audio volume: 1</td></tr><tr><td>Keypad-2</td><td>Video audio volume: 2</td></tr><tr><td>Keypad-3</td><td>Video audio volume: 3</td></tr><tr><td>Keypad-4</td><td>Video audio volume: 4</td></tr><tr><td>Keypad-5</td><td>Video audio volume: 5</td></tr><tr><td>Keypad-6</td><td>Video audio volume: 6</td></tr><tr><td>Keypad-7</td><td>Video audio volume: 7</td></tr><tr><td>Keypad-8</td><td>Video audio volume: 8</td></tr><tr><td>Keypad-9</td><td>Video audio volume: 9</td></tr><tr><td>Enter</td><td>Video audio volume: Max</td></tr></table>');
	} else if (what.id=='divThemeDefault'||what.id=='divThemeDark') {
		showPrev(images+'/ThemeDark.png');
	} else if (what.id=='divThemeLight') {
		showPrev(images+'/ThemeLight.png');

	} else if (what.id=='divCinemize') {
		showPrev(images+'/Cinemize.png');
	} else if (what.id=='advanced') {
		showPrev(images+'/LoopOff.png','Click to hide advanced settings.');
	} else {
		showPrev(images+'/Normal.png');
	}
}

function loadConfig () {
	// load settings from local storage

	if (setstor.length==0) {
		console.log('could not find setstor');

		if (thisbrowser=='safari') {
			// get prefs because options does not know about main localstorage (safari)
			safari.self.tab.dispatchMessage('getPrefs','');
			window.location.reload();
		} else {
			return false;
		}
	}

	var bits=['AutoPlayEmbed', 'ChangeResView', 'Cinemize', 'Cleanup', 'Comments', 'Description', 'DownloadLinks', 'ExpDescription', 'Frame', 'Footer', 'Guide', 'Header', 'Headline', 'Hide', 'Hwebm', 'Hmp4', 'Hflv', 'H3gp', 'H3d', 'IgnoreTime', 'Loop', 'MoPlay', 'Playlist', 'Popout', 'Popup', 'RSS', 'SSL', 'ScrollTop', 'Sidebar', 'SidebarStay', 'Sites', 'Keys', 'Volume', 'Wads', 'Wmode', 'daily', 'dump', 'escapist', 'fear', 'funny', 'g4tv', 'hulu', 'meta', 'others', 'twitter', 'vimeo', 'youtube', 'eyoutube', 'youtubeHome', 'youtubeUser', 'youtubeChannel'];
	for (i=0;i<bits.length;i++) {
		var val = setstor.getItem(bits[i]);
		var a = d.getElementById(bits[i]);
		if (a && val) {
			//console.log(a.id+': '+val);
			if (val=='true') {a.checked=true;} else {a.checked=false;}
		} else {
			console.log('could not find DOM or setstor for: '+bits[i]);
		}
	}

	d.getElementById('18').selected=true; // default to default size
	if (setstor.SetView=='240') {d.getElementById('15').selected=true; }
	if (setstor.SetView=='360') {d.getElementById('11').selected=true; }
	if (setstor.SetView=='480') {d.getElementById('12').selected=true; }
	if (setstor.SetView=='540') {d.getElementById('16').selected=true; }
	if (setstor.SetView=='720') {d.getElementById('13').selected=true; }
	if (setstor.SetView=='1080') {d.getElementById('14').selected=true; }
	//if (setstor.SetView=='2304') {d.getElementById('18').selected=true; }
	if (setstor.SetView=='exp') {d.getElementById('17').selected=true; }

	d.getElementById('7').selected=true; // default to default resolution
	if (setstor.SetRes=='240') {d.getElementById('5').selected=true; }
	if (setstor.SetRes=='360') {d.getElementById('1').selected=true; }
	if (setstor.SetRes=='480') {d.getElementById('2').selected=true; }
	if (setstor.SetRes=='720') {d.getElementById('3').selected=true; }
	if (setstor.SetRes=='1080') {d.getElementById('4').selected=true; }
	if (setstor.SetRes=='highres') {d.getElementById('6').selected=true; }

	d.getElementById('vdefault').selected=true; // default to page volume
	if (setstor.Volume=='100') {d.getElementById('v100').selected=true; }
	if (setstor.Volume=='90') {d.getElementById('v90').selected=true; }
	if (setstor.Volume=='80') {d.getElementById('v80').selected=true; }
	if (setstor.Volume=='70') {d.getElementById('v70').selected=true; }
	if (setstor.Volume=='60') {d.getElementById('v60').selected=true; }
	if (setstor.Volume=='50') {d.getElementById('v50').selected=true; }
	if (setstor.Volume=='40') {d.getElementById('v40').selected=true; }
	if (setstor.Volume=='30') {d.getElementById('v30').selected=true; }
	if (setstor.Volume=='20') {d.getElementById('v20').selected=true; }
	if (setstor.Volume=='10') {d.getElementById('v10').selected=true; }
	if (setstor.Volume=='0') {d.getElementById('v0').selected=true; }

	d.getElementById('ivall').checked=true; // default to hide everything
	if (setstor.InVideo=='default') {d.getElementById('ivdefault').checked=true;}
	if (setstor.InVideo=='showcc') {d.getElementById('ivshowcc').checked=true;}
	if (setstor.InVideo=='ads') {d.getElementById('ivads').checked=true; }

	d.getElementById('apno').checked=true; // default to disable auto-play
	if (setstor.AutoPlay=='default') {d.getElementById('apdefault').checked=true;}
	if (setstor.AutoPlay=='playlist') {d.getElementById('applaylist').checked=true;}
	if (setstor.AutoPlay=='nobuff') {d.getElementById('apnobuff').checked=true; }
	if (setstor.AutoPlay=='nobufflist') {d.getElementById('apnobufflist').checked=true; }

	d.getElementById('linkdefault').checked=true; // default to normal links
	if (setstor.SetLink=='in') {d.getElementById('linkin').checked=true;}
	if (setstor.SetLink=='pop') {d.getElementById('linkpop').checked=true;}
	if (setstor.SetLink=='win') {d.getElementById('linkwin').checked=true; }

	if (setstor.MoPlay=='false'){d.getElementById('MoPlay').checked=false; }
	if (setstor.Wmode=='false'){d.getElementById('Wmode').checked=false; }
	if (setstor.Wads=='false'){d.getElementById('Wads').checked=false;}
	if (setstor.Keys=='false'){d.getElementById('Keys').checked=false;}

	d.getElementById('light').selected=true;
	if (setstor.Swatch=='#888888') {d.getElementById('medium').selected=true; }
	if (setstor.Swatch=='#222222') {d.getElementById('dark').selected=true; }
	if (setstor.Swatch=='#000000') {d.getElementById('darkest').selected=true; }

	d.getElementById('mdefault').checked=true;
	if (setstor.Mood=='matte') {d.getElementById('mmatte').checked=true; }
	if (setstor.Mood=='dim') {d.getElementById('mdim').checked=true; }

	d.getElementById('defaulttheme').checked=true;
	if (setstor.ControlsTheme=='light') {d.getElementById('lighttheme').checked=true; }
	if (setstor.ControlsTheme=='dark') {d.getElementById('darktheme').checked=true; }

	// logic that affects other settings
	if (setstor.ChangeResView=='true') {
		d.getElementById('SetView').disabled=true;
	}

	checkSites();
	checkCinemize();
	checkResView();
	checkSize();
	checkYT();
	checkClean();
	checkInvideo();
	checkMood();

	if (setstor.DownloadLinks=='never') {
		d.getElementById('DownloadLinks').checked=false;
		d.getElementById('DownloadLinks').disabled=true;
		addCSS('.fx, #dltypes, #versfull {display: none !important;} #divDownloadLinks {color: gray;} #disnote {display: block;} ');
	} else {
		d.getElementById('versgoog').style.display='none';
	}
}

function checkSites () {
	// the options are in the shadow of all sites

	var opts = ['youtube', 'vimeo', 'daily', 'meta', 'g4tv', 'fear', 'funny', 'hulu', 'escapist', 'dump', 'twitter', 'others'];
	if ( d.getElementById('Sites').checked == true ) {
		for (var i=0;i<opts.length;i++) {if (d.getElementById(opts[i])) {d.getElementById(opts[i]).disabled=true;}}
	} else {
		for (var i=0;i<opts.length;i++) {if (d.getElementById(opts[i])) {d.getElementById(opts[i]).disabled=false;}}
	}
}

function checkMood () {
	// change options based on matt/dim

	var base = 'Hide everything';
	var aa = d.getElementById('hidelabel');
	var ab = d.getElementById('secMood');

	if (d.getElementById('Swatch') && d.getElementById('Swatch').value!='#FBFBFB') {
		if (d.getElementById('mmatte').checked==true) {
			base += ' and matte the page';
		}
		if (d.getElementById('mdim').checked==true) {
			base += ' and dim the page';
		}
		ab.style.display='block';
	} else {
		ab.style.display='none';
	}
	if (aa) {aa.textContent=base;}
}

function checkCinemize () {
	// the options are in the shadow of the matte

	if (d.getElementById('Cinemize').checked==true) {
		d.getElementById('divEverything').style.display='none';
	} else {
		d.getElementById('divEverything').style.display='block';
	}
}

function checkInvideo () {
	// the options are in the shadow of the disable ads and annotations

	if (d.getElementById('ivdefault').checked==true) {
		d.getElementById('divWmode').style.display='none';
		d.getElementById('secControls').style.display='none';
	} else {
		d.getElementById('divWmode').style.display='block';
		d.getElementById('secControls').style.display='block';
	}
}

function checkIgnoreTime () {
	// the options are in the shadow of the auto-play

	if (d.getElementById('apdefault').checked==true) {
		d.getElementById('divIgnoreTime').style.display='none';
	} else {
		d.getElementById('divIgnoreTime').style.display='block';
	}
}

function checkSize () {
	// disable the sync size with the setting

	if (d.getElementById('SetRes').value == 'default') {
		// hide Keep the viewing size the same as the viewing quality option
		d.getElementById('divSyncRes').style.display='none';
	} else {
		// show Keep the viewing size the same as the viewing quality option
		d.getElementById('divSyncRes').style.display='block';
	}
	if (d.getElementById('ChangeResView').checked == true) {
		// show on page load if sync is selected
		d.getElementById('divSyncRes').className += ' ind';
	}
	checkFrame();
}

function checkResView () {
	// disable the dropdown with the setting

	if (d.getElementById('ChangeResView').checked == true) {
		d.getElementById('SetView').disabled=true;

		if (d.getElementById('SetRes').value=='highres') {
			// view sync can not be highres
			d.getElementById('SetRes').value='1080';
			// save setting to not be highres
			saveChange(d.getElementById('SetRes'));
		}
		if (d.getElementById('SetRes').value=='default') {
			// view sync can not be default
			d.getElementById('SetRes').value='480';
			// save setting to not be highres
			saveChange(d.getElementById('SetRes'));
		}
		// disable view size: default
		d.getElementById('7').disabled=true;
		// disable view size: window
		d.getElementById('6').disabled=true;
	} else {
		d.getElementById('SetView').disabled=false;

		// enable view size: default
		d.getElementById('7').disabled=false;
		// enable view size: window
		d.getElementById('6').disabled=false;
	}
}

function checkFrame () {
	// disable frame option

	if (d.getElementById('Cleanup').checked == true && d.getElementById('SetView').value == 'default') {
		d.getElementById('divFrame').style.display='block';
	} else {
		d.getElementById('divFrame').style.display='none';
	}
}

function checkClean () {
	// disable the dropdown with the checkbox

	if (setstor.ytVers=='feather') {
		d.getElementById('divSidebarStay').style.display='block';
		if (d.getElementById('Cleanup').checked == true) {
			d.getElementById('divSidebarStay').style.display='none';
		}
	}
	checkFrame();
}

function checkDL () {
	// show or hide download options

	if (d.getElementById('DownloadLinks').checked == true) {
		d.getElementById('dltypes').style.display='block';
	} else {
		d.getElementById('dltypes').style.display='none';
	}
}

function checkYT () {
	// make sure options are hidden that are not for youtube and youtube embedded

	var opts = ['divSyncRes', 'secInVid', 'secPb', 'divExpDescription', 'divFrame', 'divChangeRes', 'divPopout', 'divSSL'];
	if (d.getElementById('youtube').checked==true || d.getElementById('eyoutube').checked==true || d.getElementById('Sites').checked==true) {
		for (var i=0;i<opts.length;i++) {d.getElementById(opts[i]).style.display='block';}
	} else {
		for (var i=0;i<opts.length;i++) {d.getElementById(opts[i]).style.display='none';}
	}
	if (d.getElementById('eyoutube').checked==true && thisbrowser!='opera') {
		// chrome and safari are the only browsers to get embedded youtube
		d.getElementById('divAutoPlayEmbed').style.display='block';
	} else {
		// other browsers cant handle embedded youtube
		d.getElementById('divAutoPlayEmbed').style.display='none';
	}

	var opts = ['secModYT'];
	if (d.getElementById('youtube').checked==true || d.getElementById('Sites').checked==true) {
		for (var i=0;i<opts.length;i++) {d.getElementById(opts[i]).style.display='block';}
	} else {
		for (var i=0;i<opts.length;i++) {d.getElementById(opts[i]).style.display='none';}
	}

	var opts = ['secLinks', 'divMoPlay', 'dltypes', 'secControls', 'needAnno'];
	if (d.getElementById('Sites').checked==false && d.getElementById('youtube').checked==false && d.getElementById('eyoutube').checked==false) {
		for (var i=0;i<opts.length;i++) {if (d.getElementById(opts[i])) {d.getElementById(opts[i]).style.display='none';}}
	} else {
		for (var i=0;i<opts.length;i++) {if (d.getElementById(opts[i])) {d.getElementById(opts[i]).style.display='block';}}
	}

	// determine if we need to display non-youtube notes
	ytNotes();
}

function ytNotes () {
	// determine if we need to display non-youtube notes

	var opts = ['Sites', 'daily', 'dump', 'escapist', 'fear', 'funny', 'g4tv', 'hulu', 'meta', 'twitter', 'vimeo', 'others'];
	var showtips = false;
	for (var i=0;i<opts.length;i++) {
		if (d.getElementById(opts[i]).checked==true) {showtips = true;}
	}
	var yttips = d.getElementsByClassName('ytt');
	for (var i=0;i<yttips.length;i++) {
		if (showtips) {
			yttips[i].style.display='block';
		} else {
			yttips[i].style.display='none';
		}
	}
}

function saveChange (what) {
	// save click to local storage

	if (what.nodeName=='INPUT') {
		if (setstor[what.id]) {
			setstor[what.id]=what.checked;
			console.log(what.id+' '+what.checked);
		} else {
			setstor[what.name]=what.value;
			console.log(what.name+' '+what.value);
		}
	}
	if (what.nodeName=='SELECT') {
		// dropdowns
		setstor[what.id]=what.value;
		console.log(what.id+' '+what.value);
	}

	if (thisbrowser=='chrome') {
		// let background.js know it needs to refresh
		chrome.extension.sendRequest({greeting: "options", todo: what.id}, function(response) {
			bug('greeting:options todo:'+what.id);
		});
	} else if (thisbrowser=='safari') {
		safari.self.tab.dispatchMessage("savePrefs",localStorage);
	} else if (thisbrowser=='firefox') {
		// firefox handled by main.js
	} else if (thisbrowser=='opera') {
		// opera does not need to let background know
	}

	d.getElementById('getset').style.display='none';

	// determine if we need to display non-youtube notes
	ytNotes();
}

function showhide (what) {
	// tab selected

	bug('selected: '+what.textContent);
	// hide existing selected pane
	var was=d.getElementsByClassName('prefpane selected');
	if (was[0]) {
		was[0].className='prefpane';
	}

	// hide existing selected menu item
	var was=d.getElementsByClassName('menuselected');
	if (was[0]) {
		if (was[0].id=='mlayout' || was[0].id=='msites') {
			was[0].className='adv';
		} else {
			was[0].className='';
		}
	}

	// show selected pane
	d.getElementById(what.textContent+'Pane').className='prefpane selected';

	// hilight selected menu item
	what.className='menuselected';

	// set default image in preview pane
	d.getElementById('preImg').src=images+'/Normal.png';
	d.getElementById('preDiv').style.display='block';
	d.getElementById('preDivNote').style.display='none';

	// hide preview pane for sites
	if (what.id=='msites' || what.id=='msupport') {
		d.getElementById('preDiv').style.display='none';
	}

	// scroll to the top of a newly selected pane
	window.scroll(0, 0);
}

function getFile (thisbrowser,file) {
	// open a file within the extension

	var guts = '';

	if (thisbrowser=='chrome') {
		// from manifest for support email and options page
		var version = 'NaN';
		var xhr = new XMLHttpRequest();
		xhr.open('GET', chrome.extension.getURL(file), false);
		xhr.send(null);
		guts = xhr.responseText;
	}
	if (thisbrowser=='safari') {
		try {
			var xhr = new XMLHttpRequest();
			xhr.open('GET', safari.extension.baseURI+file, false);
			xhr.send(null);
			guts = xhr.responseText;
		} catch(err){
			// could not read info.plist
		}
	}
	if (thisbrowser=='opera') {
		try {
			var xhr = new XMLHttpRequest();
			xhr.open('GET', file, false);
			xhr.send(null);
			guts = xhr.responseText;
		} catch(err){
			// could not read config.xml
		}
	}

	return guts;
}

function getVersion (thisbrowser) {
	// get extension version for display and localstor

	var vers = '';

	if (thisbrowser=='chrome') {
		vers = getFile (thisbrowser,'manifest.json');
		var manifest = JSON.parse(vers);
		vers = manifest.version;
	}
	if (thisbrowser=='safari') {
		vers = getFile (thisbrowser,'Info.plist');
		vers = vers.split('CFBundleVersion')[1].split('</string>')[0].split('<string>')[1];
	}
	if (thisbrowser=='opera') {
		vers = getFile (thisbrowser,'config.xml');
		vers = vers.split('version="')[2].split('"')[0];
	}

	if (document.getElementById('version')&&vers!='') {
		document.getElementById('version').textContent='Version '+vers;
		setstor.Version=vers;

		if (thisbrowser=='safari') {
			// safari needs to push this save
			safari.self.tab.dispatchMessage('savePrefs',setstor);
		}
	}
}

function getSLA () {
	// get extension SLA from local files and insert

	var sla = getFile (thisbrowser,'LICENSE.txt');

	var d=document;
	if (d.getElementById('theSLA')&&sla!='') {
		d.getElementById('theSLA').textContent=sla;
	}
}

function showSLA () {
	// display the SLA
	var d=document;

	// get the SLA from local files and show
	getSLA();
	d.getElementById('bigSLA').style.display='block';
}

function agreeSLA () {
	// hide SLA div and update localstor

	var d=document;

	d.getElementById('bigSLA').style.display='none';

	setstor.VersionsNote='true';
	if (thisbrowser=='safari') {
		// safari needs to push this save
		safari.self.tab.dispatchMessage('savePrefs',setstor);
	}
}

function fixBrowser () {
	// browser specific things

	var d=document;

	if (thisbrowser=='safari'||thisbrowser=='firefox') {
		// hide show toolbar option
		d.getElementById('divPopup').style.display='none';
		d.getElementById('allbrowsers').style.display='none';
	}

	if (!setstor.VersionsNote) {
		// one time notice

		addCSS('.heading {position: static;} .section {margin-top: 24px;} #navbar {position: absolute; bottom: auto; top: auto;} ','');

		if (thisbrowser=='chrome') {d.getElementById('bigchromenotes').style.display='block';}
		if (thisbrowser=='safari') {d.getElementById('bigsafarinotes').style.display='block';}
		if (thisbrowser=='opera') {d.getElementById('bigoperanotes').style.display='block';}
		if (thisbrowser=='mozilla') {d.getElementById('bigmoznotes').style.display='block';}

		showSLA();
	}

	if (thisbrowser=='opera') {
		// fixes for opera

		if (d.head) {
			var temp = d.createElement('link');
			temp.setAttribute('rel','stylesheet');
			temp.setAttribute('type','text/css');
			temp.setAttribute('href','options-opera.css');

			d.head.appendChild(temp);
		}
		d.getElementById('divSey').style.display='none';
		d.getElementById('divAutoPlayEmbed').style.display='none';
	}

	if (thisbrowser!='chrome') {
		// hide google and full version info
		d.getElementById('versfull').style.display='none';
		d.getElementById('versgoog').style.display='none';
	}
}

function handleKeys (ev) {
	// handle various keypresses

	var e=window.event||window.Event;
	var evtobj=window.event ? event : ev; //distinguish between explicit and implicit events
	var unicode=evtobj.charCode ? evtobj.charCode : evtobj.keyCode;

	var d=document;

	bug('keypress in: '+d.activeElement.nodeName+' '+unicode+' '+d.activeElement.id);

	if (d.activeElement.nodeName!='TEXTAREA'&&d.activeElement.nodeName!='INPUT') {
		if (unicode=='86'||unicode=='49') {
			// 1 or v for video
			showhide(d.getElementById('mvideo'));
		}
		if (unicode=='76'||unicode=='50') {
			// 2 or l for layout
			showhide(d.getElementById('mlayout'));
		}
		if (unicode=='83'||unicode=='51') {
			// 3 or s for sites
			showhide(d.getElementById('msites'));
		}
		if (unicode=='65'||unicode=='52') {
			// 4 or a for support/about
			showhide(d.getElementById('msupport'));
		}
		if (unicode=='192'||unicode=='231') {
			// ` for show all advanced/hidden options
			showHideAdvanced();
		}
	}
}

function showHideSettings () {
	// show or hide the settings

	d.getElementById('divSHsetings').style.display='none';

	// show settings edit
	d.getElementById('hiddensettings').style.display='block';
}

function showHideAdvanced (thekind) {
	// show or hide the advanced settings

	var kind = 'hide';
	var aa = d.getElementById('showhide');
	if (aa != null && aa.textContent.indexOf('.adv {display: none')!='-1') { kind = 'show'; }
	if (aa != null && aa.textContent.indexOf('.adv {display: inline')!='-1') { kind = 'hide'; }

	if (thekind) {kind = thekind;}

	if (kind == 'hide') {
		addCSS('.def {display: inline-block;} section.adv, .adv {display: none !important;} ','showhide');
	}
	if (kind == 'show') {
		addCSS('.def {display: none !important;} section.adv {display: block;} .adv {display: inline-block;} ','showhide');
	}
	if (kind == 'full') {
		addCSS('.def {display: inline-block;} section.adv {display: block;} .adv {display: inline-block;} #advanced {display: none;} ','showhide');
	}

	checkSites();
	checkCinemize();
	checkResView();
	checkSize();
	checkIgnoreTime();
	checkDL();
	checkYT();
	checkClean();
	checkInvideo();
	checkMood();
}

function addEvents (d) {
	// chrome manifest 2 is lame

	if (d.body) {d.body.addEventListener('keydown',function(){handleKeys(event);},false);}

	// mouse-over
	var maps = ['divAutoPlayDefault', 'divAutoPlayNo', 'divAutoPlayPlay', 'divAutoPlayPlaylist', 'divAutoPlayNoBuff', 'divAutoPlayNoBuffList', 'divAutoPlayEmbed', 'divChangeRes', 'divChangeView', 'divCinemize', 'divCleanup', 'divComments', 'divControlsTheme', 'divDescription', 'divDownloadLinks', 'divExpDescription', 'divFrame', 'divFooter', 'divGuide', 'divHeader', 'divHeadline', 'divHide', 'divIgnoreTime', 'divInVideoDefault', 'divInVideoAds', 'divInVideoShowcc', 'divInVideoAll', 'divLoop', 'divMoodDefault', 'divMoodMatte', 'divMoodDim', 'divMoPlay', 'divNormal', 'divPlaylist', 'divPopout', 'divPopup', 'divRSS', 'divScrollTop', 'divSidebar', 'divSidebarStay', 'divSSL', 'divSwatch', 'divSyncRes', 'divVolume', 'divWads', 'divKeys', 'divWmode', 'preDiv', 'showpmenu3', 'spoi', 'vf', 'vg', 'dltypes', 'advanced', 'secLinks', 'divLinksIn', 'divThemeDefault', 'divThemeLight', 'divThemeDark'];
	for (i=0;i<maps.length;i++) {
		if (d.getElementById(maps[i])) {d.getElementById(maps[i]).addEventListener('mouseover',function(){handleMouse(this);},true);}
	}

	// tabs
	maps = ['mlayout', 'msites', 'msupport', 'mvideo'];
	for (i=0;i<maps.length;i++) {
		if (d.getElementById(maps[i])) {d.getElementById(maps[i]).addEventListener('click',function(){showhide(this);},true);}
	}

	// click to save setting
	maps = ['AutoPlayEmbed', 'ChangeResView', 'Cinemize', 'Cleanup', 'Comments', 'daily', 'Description', 'DownloadLinks', 'dump', 'escapist', 'ExpDescription', 'fear', 'Footer', 'Frame', 'funny', 'g4tv', 'Guide', 'Header', 'Headline', 'Hide', 'Hwebm', 'Hmp4', 'Hflv', 'H3gp', 'H3d', 'hulu', 'IgnoreTime', 'Loop', 'meta', 'MoPlay', 'others', 'Playlist', 'Popout', 'Popup', 'RSS', 'ScrollTop', 'Sidebar', 'SidebarStay', 'Sites', 'Keys', 'SSL', 'twitter', 'vimeo', 'Wads', 'Wmode', 'youtube', 'eyoutube', 'ivdefault', 'ivads', 'ivshowcc', 'ivall', 'apdefault', 'apno', 'applaylist', 'apnobuff', 'apnobufflist', 'linkdefault', 'linkin', 'linkpop', 'linkwin', 'mdefault', 'mmatte', 'mdim', 'defaulttheme', 'lighttheme', 'darktheme', 'youtubeHome', 'youtubeUser', 'youtubeChannel'];
	for (i=0;i<maps.length;i++) {
		if (d.getElementById(maps[i])) {d.getElementById(maps[i]).addEventListener('click',function(){saveChange(this);},true);}
	}

	// popup menu
	maps = ['SetRes', 'SetView', 'Swatch', 'Volume'];
	for (i=0;i<maps.length;i++) {
		if (d.getElementById(maps[i])) {d.getElementById(maps[i]).addEventListener('change',function(){saveChange(this); handleMouse(this.parentNode);},true);}
	}

	// page and other setting interactions
	if (d.getElementById('SetView')) {d.getElementById('SetView').addEventListener('change',function(){checkSize();},true);}
	if (d.getElementById('ChangeResView')) {d.getElementById('ChangeResView').addEventListener('click',function(){checkResView();},true);}

	if (d.getElementById('ivdefault')) {d.getElementById('ivdefault').addEventListener('click',function(){checkInvideo();},true);}
	if (d.getElementById('ivads')) {d.getElementById('ivads').addEventListener('click',function(){checkInvideo();},true);}
	if (d.getElementById('ivshowcc')) {d.getElementById('ivshowcc').addEventListener('click',function(){checkInvideo();},true);}
	if (d.getElementById('ivall')) {d.getElementById('ivall').addEventListener('click',function(){checkInvideo();},true);}

	if (d.getElementById('apdefault')) {d.getElementById('apdefault').addEventListener('click',function(){checkIgnoreTime();},true);}
	if (d.getElementById('apno')) {d.getElementById('apno').addEventListener('click',function(){checkIgnoreTime();},true);}
	if (d.getElementById('aplist')) {d.getElementById('aplist').addEventListener('click',function(){checkIgnoreTime();},true);}
	if (d.getElementById('apnobuff')) {d.getElementById('apnobuff').addEventListener('click',function(){checkIgnoreTime();},true);}
	if (d.getElementById('apnobufflist')) {d.getElementById('apnobufflist').addEventListener('click',function(){checkIgnoreTime();},true);}

	if (d.getElementById('AdvShow')) {d.getElementById('AdvShow').addEventListener('click',function(){showHideAdvanced();event.preventDefault();},true);}
	if (d.getElementById('AdvHide')) {d.getElementById('AdvHide').addEventListener('click',function(){showHideAdvanced();event.preventDefault();},true);}
	if (d.getElementById('Cinemize')) {d.getElementById('Cinemize').addEventListener('click',function(){checkCinemize();},true);}
	if (d.getElementById('DownloadLinks')) {d.getElementById('DownloadLinks').addEventListener('click',function(){checkDL();},true);}

	if (d.getElementById('Swatch')) {d.getElementById('Swatch').addEventListener('change',function(){showVis('swatch');checkMood();},true);}

	if (d.getElementById('Cleanup')) {d.getElementById('Cleanup').addEventListener('click',function(){checkClean();},true);}

	if (d.getElementById('Popup')) {d.getElementById('Popup').addEventListener('click',function(){extRefresh();},true);}
	if (d.getElementById('Sites')) {d.getElementById('Sites').addEventListener('click',function(){checkSites();checkYT();},true);}
	if (d.getElementById('youtube')) {d.getElementById('youtube').addEventListener('click',function(){checkYT();},true);}
	if (d.getElementById('eyoutube')) {d.getElementById('eyoutube').addEventListener('click',function(){checkYT();},true);}
	if (d.getElementById('SHsetings')) {d.getElementById('SHsetings').addEventListener('click',function(){showHideSettings();event.preventDefault();},true);}
	if (d.getElementById('jsettings')) {d.getElementById('jsettings').addEventListener('blur',function(){saveSettings(this);},true);}
	if (d.getElementById('jsettings')) {d.getElementById('jsettings').addEventListener('mouseup',function(){focusSettings(this);},true);}
	if (d.getElementById('jsettings')) {d.getElementById('settings').addEventListener('mouseup',function(){this.select();},true);}
	if (d.getElementById('faq')) {d.getElementById('faq').addEventListener('click',function(){window.open('https://spoi.com/software/yto/faq'); event.preventDefault();},true);}
	if (d.getElementById('email')) {d.getElementById('email').addEventListener('click',function(){getSettings();event.preventDefault();},true);}

	if (d.getElementById('agree')) {d.getElementById('agree').addEventListener('click',function(){agreeSLA();},true);}
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

var images='watch7';

var currentTime=new Date(); if (currentTime.getDate()==18 && currentTime.getMonth()==8) { var fin=new Date(2006, 8, 18); d.getElementById('day').textContent=Math.ceil((currentTime.getTime()-fin.getTime())/(86400000))+' days.'; }

if (thisbrowser=='safari') {
	// get prefs because options does not know about main localStorage

	safari.self.addEventListener('message', getSafariAnswer, false);
	safari.self.tab.dispatchMessage('getPrefs','');
}

if (thisbrowser!='NaN') {
	// determine extension version for about
	getVersion(thisbrowser);

	// add mouse and key events
	addEvents(d);

	// customize for browsers
	fixBrowser();
	loadConfig();

	if (!setstor.VersionsNote) {
		// make sure all settings are available the first time
		showHideAdvanced('full');
	} else {
		showHideAdvanced();
	}
}

/* EOF */