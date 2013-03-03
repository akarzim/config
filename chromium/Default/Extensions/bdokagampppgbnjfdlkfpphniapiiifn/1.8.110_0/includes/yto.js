// YouTube Options
// Copyright (c) 2010-2013 smart people on ice, LLC.
// All rights reserved.  Must not be reproduced without express written permission of smart people on ice, LLC.
//
// https://spoi.com/software/yto/SLA

function bug (what) {
	if (debug) {
		if (typeof what!='object') { console.log('>>'+what);
		} else { console.log(what); }
	}
}

function inArray (needle, haystack) {
	for (var i = 0; i < haystack.length; i++) {
		if (needle.indexOf(haystack[i])!='-1') {
			return true;
		}
	}
	return false;
}

function trim (a) {
	// remove end spaces from string
	return a.replace(/^\s+|\s+$/g,'');
}

function unique (a) {
	var r = new Array();
	o:for(var i = 0, n = a.length; i < n; i++) {
		for(var x = 0, y = r.length; x < y; x++) {
			if(r[x]==a[i]) continue o;
		}
		r[r.length] = a[i];
	}
	return r;
}

function nameFromPath (url) {
	// get name of video from url (ph)

	var title = url.split('/');
	title = title[title.length-1];
	if (title.search("\\?")!='-1') {
		title = title.split('?')[0];
	}
	return title;
}

function pausecomp (ms) {
	ms += new Date().getTime();
	while (new Date() < ms){}
}

function insertAfter (parent, node, referenceNode) {
	parent.insertBefore(node, referenceNode.nextSibling);
}

// -----------------

function hideStuff (options) {
	// handle page object manipulations

	var d=getDOM();

	var canChangeViewSize='true';
	var grayColour=options.Swatch;

	// look for popup cinemize call
	var cinemize=options.Cinemize;
	if (options.Cinemizep=='true') {cinemize='true';}

	do_baseCSS();

	if (vidtype=='youtube') {
		if (cinemize=='true') {
			do_cinemize();

			if (options.Cleanup=='true') {do_clean();}
		} else {
			if (options.Cleanup=='true') {do_clean();}
			if (options.Mood!='default') {do_matte(options.Swatch);}
			if (options.Header=='true') {toggle_header();}
			if (options.Headline=='true') {toggle_headline();}
			if (options.Guide=='true') {toggleOff('guide');}
			if (options.Sidebar=='true') {toggle_sidebar();}
			if (options.Comments=='true') {toggle_comments();} // this must be first
			if (options.Description=='true') {toggle_description();} // this must be second
			if (options.Footer=='true') {toggle_footer();}
			if (options.Playlist=='true') {toggle_playlist();}
		}

		// determine format of video
		var ytVidType=vidKind();

		if (options.SetView!='default') {
			bug('== changeSize from hideStuff');
			if (ytVidType=='flash' && options.ChangeResView=='true') {
				// do nothing
			} else {
				// flash or html5 without sync
				var valView=getView(options.SetView);
				changeSize(valView);
			}
		}

		// create download links
		if (options.DownloadLinks!='never' && ytPage=='watch') {
			do_DownloadLinks(ytVidType);
			if (options.DownloadLinks=='false') {toggle_downloads();}
		}

		if (ytVidType=='flash') {
			if (options.InVideo!='default') {
				// remove ads and annotations for opera
				removeFromVideo();
			}
			if (options.SidebarStay=='true' && options.SetView=='default') {
				addFlashControls();
			}
		}

		if (options.Popout == 'true') {
			// add popout widget to title
			addYtPopControl();
		}

		if (options.Keys == 'true') {
			// add spacebar play/pause
			addKeyControls();
		}

		// things that depend on api (autoplay, resolution, size and loop)
		if ((options.AutoPlay!='default' || options.SetRes!='default' || options.SetView!='default' || options.Loop=='true') && ytPage=='watch') {
			newWait(ytVidType);
		}

		// center non-resized video in cinema mode
		if (cinemize=='true') {
			do_Center();
		}

		// expand description
		if (options.ExpDescription=='true') {
			var aa = d.getElementById('watch-description');
			if (aa) {
				aa.className = aa.className.replace('yt-uix-expander-collapsed','');
			}
			var aa = d.getElementById('watch-description-text');
			if (aa) {
				aa.style.height='auto';
			}
			var aa = d.getElementById('de');
			if (aa) {
				// feather
				aa.className += ' expanded';
			}
		}

		if (ytVidType=='html5') {
			// add click controls for html5 video
			addHTML5controls(options);

			// adjust html5 theme
			if (options.ControlsTheme=='light') {
				var themeCount=0;
				var themeWait = setInterval(function(){
					var aa=d.getElementById('movie_player-html5');
					var ab=d.getElementById('movie_player');
					if (aa || ab) {
						clearTimeout(themeWait);
						if (aa) {var ac=aa.getElementsByClassName('html5-video-controls');}
						if (ab) {var ac=ab.getElementsByClassName('html5-video-controls');}
						if (ac && ac[0]) {ac[0].className+=' light-theme';}
					}
					themeCount++;
					if (themeCount>18) {clearTimeout(themeWait);}
				},818);
			}

			if (options.Hide=='true') {
				var hideCount=0;
				var hideWait = setInterval(function(){
					var aa=d.getElementById('movie_player-html5');
					var ab=d.getElementById('movie_player');
					if (aa || ab) {
						clearTimeout(hideCount);
						if (aa) {aa.className+=' autohide-embeds autohide-aspect hide-controls';}
						if (ab) {ab.className+=' autohide-embeds autohide-aspect hide-controls';}
					}
					hideCount++;
					if (hideCount>18) {clearTimeout(hideWait);}
				},818);
			}
		}

		// create event for window resize
		addOnResize();
	} else {
		// all videos other than youtube

		var newcss = '';

		if (options.Cleanup=='true') {
			// try and anti-alias
			newcss += 'body {font-family: \'Lucida Grande\', Helvetica, malotf, Arial, sans-serif; text-shadow: transparent 0px 0px 1px;} ';
		}

		if (options.Mood=='dim' && grayColour!='#FBFBFB') {
			if (grayColour=='#888888') {rgba='136,136,136, 0.7';}
			if (grayColour=='#222222') {rgba='34,34,34, 0.7';}
			if (grayColour=='#000000') {rgba='0,0,0, 0.9';}
		}

		if (vidtype=='vimeo') {
			if (d.getElementById('wrap')) {
				// new style
				newcss += '#video {background: transparent;} ';
				if (options.Header=='true' || cinemize=='true') { newcss += '#site_header, #ribbon {display: none;} '; }
				if (options.Headline=='true' || cinemize=='true') { newcss += '#page_header {display: none;} '; }
				if (options.Sidebar=='true' || cinemize=='true') { newcss += '#brozar, #brozar_toggle, #context_browser_1 {display: none !important;} '; }
				if (options.Description=='true' || cinemize=='true') { newcss += '#info {display: none;} '; }
				if (options.Comments=='true' || cinemize=='true') { newcss += 'section#comments {display: none;} #extras {display:none;} #cols .col_large {display: none;} '; }
				if (options.Footer=='true' || cinemize=='true') { newcss += '#site_footer, #footers_footer {display: none;} '; }
				if (options.Cleanup=='true' || cinemize=='true') { newcss += 'ul#menu {display: none;} .ad_box, #ad {display:none;} #extras_panel {display:none;} #cols .col_large {min-height: inherit;} '; }
				if (options.Mood=='matte' || cinemize=='true') { newcss += 'html {background-color:'+grayColour+';} body, #main, #site_header, #info {background-color:transparent;} #tools {background-color:transparent !important;border:0 !important;} #info, .boxed {border:0;} a {color: #4BF;} '; }
				if (options.Mood=='dim') {
					newcss += '#video, #content {box-shadow: 0 0 0 1818px rgba('+rgba+'); z-index: 181818; position: relative;} html {background: rgba('+rgba+');} ';
				}
				if (cinemize=='true') { newcss += '#main{border-radius:0; width:auto;} .vimeo_holder{box-shadow: 0px 0px 18px #000000;} #ytOlinks a {color: #03C;} #everything{width:0;margin:0;} div.a{background:black !important;} #extras, #brozar_toggle_wrapper {display:none;} html {-webkit-box-shadow: inset 0px 0px 900px 100px rgba(0, 0, 0, 0.9); box-shadow: inset 0px 0px 900px 100px rgba(0, 0, 0, 0.9); height: 100%;} body {height:100%; min-width:0;} '; }
			} else {
				// old style
				var quals = d.getElementsByClassName('video');
				if (quals[0]){quals[0].id='video_player';}
				if (options.Header=='true' || cinemize=='true') { newcss += '#top{display:none;} '; }
				if (options.Headline=='true' || cinemize=='true') { newcss += '#header{display:none;} '; }
				if (options.Sidebar=='true' || cinemize=='true') { newcss += '.video_stuff, #brozar, #brozar_toggle, #context_browser_1 {display:none;} '; }
				if (options.Footer=='true' || cinemize=='true') { newcss += '#bottom{display:none;} '; }
				if (options.Description=='true' || cinemize=='true') { newcss += '#skirt, .description_container, .byline, .date, .portrait{display:none;} '; }
				if (options.Comments=='true' || cinemize=='true') { newcss += '.columnB{display:none;} '; }
				if (options.Cleanup=='true' || cinemize=='true') { newcss += '#main, #meat{background:transparent; background-color:transparent;} .plus_graphic, .help, .explore, .login, .join, .portrait {display:none;} .menudo_subtier li {margin-left:11px;} #everything, #main{background-color:transparent !important; background-image:none !important;} #header .rightside {margin:0;} .title {text-align: center; width: 100%;} .byline, .date {margin-left: 81px !important;} '; }
				if (options.DownloadLinks=='true') { newcss += '#ytOlinks {margin-top: 10px; margin-left: 18px;} '; } else { newcss += '#ytOlinks {display:none;} '; }
				if (options.Mood=='matte') { newcss += 'body, #everything, #skirt, #bottom, #bottom li{background-color:'+grayColour+' !important;} .tabs, .scrolly_container, .columnA li, .content{background:transparent !important;} #bottom {margin:0; padding: 18px;} '; }
				if (cinemize=='true') {	newcss += 'body, #main{background-color:'+grayColour+';} #main{border-radius:0; width:auto;} .vimeo_holder{box-shadow: 0px 0px 18px #000000;} #ytOlinks a {color: #03C;} #everything{width:0;margin:0;} #meat{margin:0;margin-top:18px;} div.a{background:black !important;} #toolbar_couch_mode, #toolbar_lock {display:none;} html {-webkit-box-shadow: inset 0px 0px 900px 100px rgba(0, 0, 0, 0.9); box-shadow: inset 0px 0px 900px 100px rgba(0, 0, 0, 0.9); height:100%;} '; }
			}
		}

		if (vidtype=='dailymotion') {
			var quals = d.getElementsByClassName('dmco_html player_box');
			if (quals[0]){quals[0].id='video_player';}

			if (options.Header=='true' || cinemize=='true') { newcss += '#header_full, #breadcrumb, .dmpi_subheader, #fb-root, .sd_header {display: none;} '; }
			if (options.Headline=='true' || cinemize=='true') { newcss += '.box_header, .user_container, .pl_video_pagetitle {display: none;} '; }
			if (options.Sidebar=='true' || cinemize=='true') { newcss += '#right_content_box{display:none;} '; }
			if (options.Footer=='true' || cinemize=='true') { newcss += '#footer{display:none;} '; }
			if (options.Description=='true' || cinemize=='true') { newcss += '.video_tools_box, div.user_container div, #video_description, #np_more_desc, .title_owner_rating{display:none !important;} '; }
			if (options.Comments=='true' || cinemize=='true') { newcss += '.comment_box{display:none;} '; }
			if ((options.Description=='true' && options.Comments=='true') || cinemize=='true') { newcss += '#player_page_tabs, .info_box{display:none !important;} '; }
			if (options.Playlist=='true' || cinemize=='true') { newcss += '#tab_member_content, #player_page_tabs_nav {display:none;} '; }
			if (options.Cleanup=='true' || cinemize=='true') { newcss += '#wrapper, #push_footer{background-image:none !important; background-color:white !important;} ul.header_main_menu, div#family_filter, #login_info, #utility_links, a.button, .user_container, #breadcrumb, #adsense_on_player_page, #subsc_unlogged_tooltip, #dmpi_video_tools, #inline_shares, #video_infos, #top_header_announcement, .official_logo, div.sd_video_socialbuttons {display: none !important;} .box_header{margin-bottom:18px;} div#right_content_box {margin-top:0;} .span-8 {width: 620px !important;} '; }
			if (options.DownloadLinks=='true') { newcss += '.video_tools_box{margin-top:40px;} #top_content_box{margin-bottom: 24px;} #ytOlinks {margin-top: 10px;} div.dmco_box.column.span-8.bottom_box {margin-top: 40px;} '; }
			if (options.DownloadLinks=='false') { newcss += '#ytOlinks {display:none;} '; }
			if (options.Mood=='matte' || cinemize=='true') { newcss += '#wrapper, #footer, #breadcrumb, #bodyall{background-color:'+grayColour+' !important; background-image:none !important;} #content, div.dmpi_bigbox, div.box_content, div.content_right, #push_footer, #header_nav, #topwrapper{background-color:transparent !important;background:transparent !important;} #header_nav{border:0 !important;} '; }
			if (options.Mood=='dim' && cinemize=='false') { newcss += '#video_player {box-shadow: 0 0 0 1818px rgba('+rgba+'); z-index: 181818; position: relative;} .sd_header {background: rgba('+rgba+');} '; }
			if (cinemize=='true') {	newcss += '#wrapper {background: transparent !important; overflow: visible;} html {-webkit-box-shadow: inset 0px 0px 900px 100px rgba(0, 0, 0, 0.9); box-shadow: inset 0px 0px 900px 100px rgba(0, 0, 0, 0.9); height:100%;} #sd_video_tools, .pl_video_tabs {display: none;} ';
			}
			newcss += '#ytOlinks {float:left;} .span-8 {width:auto !important;} ';
		}

		if (vidtype=='metacafe') {
			if (options.Header=='true' || cinemize=='true') { newcss += '#Header, #Top, #PushdownContainer, #HeaderContainer {display:none;} '; }
			if (options.Headline=='true' || cinemize=='true') { newcss += '#Tags, #ItemTitle {display:none;} '; }
			if (options.Headline=='true' || options.Header=='true' || cinemize=='true') { newcss += '#Content{margin-top:18px;} '; }
			if (options.Sidebar=='true' || cinemize=='true') { newcss += '#SideCol, #RelatedTopics {display:none;} '; }
			if (options.Footer=='true' || cinemize=='true') { newcss += '#Footer{display:none;} '; }
			if (options.Description=='true' || cinemize=='true') { newcss += '#AfterPlayer{display:none;} '; }
			if (options.Comments=='true' || cinemize=='true') { newcss += '#Comments{display:none;} '; }
			if (options.Playlist=='true' || cinemize=='true') { newcss += '#PlaylistBar{display:none;} '; }
			if (options.Cleanup=='true' || cinemize=='true') { newcss += 'body{background-image:none !important;} #Content.Branded {background:none;} li#FBConnect, li#HeaderSponsorship, #Top, #Tags, #UserLinks, #SiteNav, #MENHeaderContainer, .Ad, #gPlusOneTop, #fblikeTop, #SocialTools, #SocialTop #Channel, #SocialTop {display:none !important;} #ItemTitle{margin-bottom:18px;} ';}
			if (options.DownloadLinks=='true') { newcss += '#ytOlinks {margin-top: 10px; margin-left: 18px;} '; } else { newcss += '#ytOlinks {display:none;} '; }
			if (options.Mood=='matte') { newcss += 'body{background-color:'+grayColour+' !important; background-image:none !important;} #Navigation, #ItemInfo, #RelatedTopics, #Footer, #ItemContainer, #Content{background:transparent;} #ItemInfo{color:black;} '; }
			if (options.Mood=='dim' && cinemize=='false') {	newcss += '#adaptvDiv {box-shadow: 0 0 0 1818px rgba('+rgba+'); z-index: 181818; position: relative;} #Content {background: transparent; z-index: 181818;} '; }
			if (cinemize=='true') {
				newcss += 'body {background-color:'+grayColour+' !important;} #Content, #ItemContainer, #HeaderContainer {background: transparent !important; background-color:transparent !important; box-shadow: none;} #ItemContainer{box-shadow: 0px 0px 18px #000000;margin-top: 18px;} #ytOlinks a {color: #03C;} #Content, #MainCol{margin:0 !important;padding:0;} html {-webkit-box-shadow: inset 0px 0px 900px 100px rgba(0, 0, 0, 0.9); box-shadow: inset 0px 0px 900px 100px rgba(0, 0, 0, 0.9); height:100%;} ';
			}
			if (cinemize=='false') {newcss += '#ItemContainer{margin-left:auto;} ';}
		}

		if (vidtype == 'g4tv') {
			if (options.Header=='true' || cinemize=='true') { newcss += '#hd, #logo{display:none;} '; }
			if (options.Headline=='true' || cinemize=='true') { newcss += '.hd{display:none;} '; }
			if (options.Sidebar=='true' || cinemize=='true') { newcss += 'div.col.rt{display:none;} '; }
			if (options.Description=='true' || cinemize=='true') { newcss += '#video-footer, .vid-details, .ft, #Video-Detail, #vid-subtitle{display:none;} '; }
			if (options.Comments=='true' || cinemize=='true') { newcss += '#comments{display:none;} '; }
			if (options.Footer=='true' || cinemize=='true') { newcss += '#ft, #onetruefan_slidebar_id{display:none;} '; }
			if (options.DownloadLinks=='true') { newcss += '#video{margin-bottom:41px;} #ytOlinks {margin-top: 10px; margin-left: 18px; text-align:left;} #ytOlinks a:hover {color: black; background: transparent;} '; }
			if (options.DownloadLinks=='false') { newcss += '#ytOlinks {display:none;} '; }
			if (options.Cleanup=='true' || cinemize=='true') { newcss += '#hd-hot-topics, #hd-follow-twitter, #user-nav, #hd-nav, #theme-toggle, .ad-wrap{display:none;} .hd h1 {color: black !important;} '; }
			if (options.Mood=='matte' || cinemize=='true') { newcss += 'html, body, #ft, #ft div, div.bd-wrap{background-color:'+grayColour+' !important; background-image:'+grayColour+' !important;} #related-videos div, #news div, #video-player div, #ft div, .info-wrap-1, .bd-wrap {background:transparent;} .hd h1 {color: white !important;} '; }
			if (options.Mood=='dim' && cinemize=='false') { newcss += '.primary-player {box-shadow: 0 0 0 1818px rgba('+rgba+'); z-index: 181818; position: relative;} '; }
			if (cinemize=='true') {
				newcss += 'body, body.theme-light, .theme-light .bd-wrap, .aots_v2.videos.detail .bd-wrap, .aots_v2 #content, .aots_v2.videos.detail #content {background-color:'+grayColour+' !important; background:'+grayColour+' !important;} #ytOlinks a {color: #03C;} .flash-player, .theme-light, #video, #video-player, .article .article-wrap-1, .theme-light, .theme-light .article .article-wrap-2, .module, .module .mod-wrap-1, .module .mod-wrap-2, .module .mod-wrap-3, .bd-wrap, .theme-dark .module.wide.video-player.hd-player .mod-wrap-2 {background:transparent;background-color:transparent;} #detail-video-player{box-shadow: 0px 0px 18px #000000;} #ytOlinks a {color: #03C;} .row{margin:0;} .content-wrap{margin:0 !important;} ul.breadcrumb{display:none;} #video{padding:0;} html {-webkit-box-shadow: inset 0px 0px 900px 100px rgba(0, 0, 0, 0.9); box-shadow: inset 0px 0px 900px 100px rgba(0, 0, 0, 0.9); height:100%;} ';
			}
		}

		if (vidtype == 'fearnet') {
			if (options.Header=='true' || cinemize=='true') { newcss += '#header, #navigation {display:none !important;} '; }
			if (options.Headline=='true' || cinemize=='true') { newcss += '#page_header, #content-header {display:none !important;} '; }
			if (options.Sidebar=='true' || cinemize=='true') { newcss += '#sidebar, div.rotator.clear{display:none !important;} '; }
			if (options.Description=='true' || cinemize=='true') { newcss += '#movie_metadata_container, #content_well, .wrapper-left-column {display:none !important;} '; }
			if (options.Comments=='true' || cinemize=='true') { newcss += '#movie_info, #blog_container {display:none !important;} '; }
			if (options.Footer=='true' || cinemize=='true') { newcss += '#footer, #footer_nav{display:none !important;} '; }
			if (options.Cleanup=='true' || cinemize=='true') { newcss += 'body.home, div#page, body.movies, div.inside.clear, #content_outer, #content_header, div#footer, #page, #content_outer .inside, #content_outer {background-image:none !important;} #tool_icons, #mvd_shared_icon, #soc_nav, .rate-widget-1 {display:none;} #sidebar{margin-top:63px;} '; if (d.getElementById('page')) {d.getElementById('page').style.backgroundImage='none !important';} }
			if (options.Mood=='dim' && cinemize=='false') {	newcss += '#myExperience {box-shadow: 0 0 0 1818px rgba('+rgba+'); z-index: 181818; position: relative;} '; }
			if (cinemize=='true') {
				newcss += 'body {background-color:'+grayColour+' !important; background:'+grayColour+' !important;} body.extras, body.movies, #video_player{background-color: transparent !important;} #mvd_embedded_player{box-shadow: 0px 0px 18px #000000;} .inside, .paper, #content_outer, #content_outer .inside {width:auto;height:auto;overflow:visible;min-height:inherit;padding:0;margin:0;} #md_left_nav, #tool_icons{display:none;} #mvd_embedded_player_container{margin-top:0;} html {-webkit-box-shadow: inset 0px 0px 900px 100px rgba(0, 0, 0, 0.9); box-shadow: inset 0px 0px 900px 100px rgba(0, 0, 0, 0.9); height:100%; background-color:'+grayColour+';} #mainborder, #mainborder #mainshadow, .page-node .panel-fearnet-movies-top {background: transparent; box-shadow: none;} .panels-flexible-region-new-left {display: none;} ';
			}
		}

		if (vidtype=='funny') {
			if (options.Header=='true' || cinemize=='true') { newcss += '#header, div.ui-header, #navigation-wrapper {display:none;} #page_header{padding:0;} '; }
			if (options.Headline=='true' || cinemize=='true') { newcss += '.player_page_h1, h2.title{display:none;} '; }
			if (options.Sidebar=='true' || cinemize=='true') { newcss += '.below_player_vids, #sidebar{display:none;} '; }
			if (options.Description=='true' || cinemize=='true') { newcss += '#video_action_tabs, #media_description, p.description, div.duration_and_views, div.from {display:none;} '; }
			if (options.Comments=='true' || cinemize=='true') { newcss += '.fb_iframe_widget{display:none !important;} '; }
			if (options.Footer=='true' || cinemize=='true') { newcss += '#funbar, #footer, #copyright_line, #content-footer, div.ui-footer{display:none;} '; }
			if (options.Cleanup=='true' || cinemize=='true') { newcss += '#action_button_group, #login_links, #action_button_group, #leader_board_ad, .player_page_ad_box, #content-footer, #funbar, #header_takeover, div#_ad_div, div#share-buttons, div.medley, div.vote-buttons, #twtr-widget-1, html.media_show #content .widget {display: none;} .player_page_h1 {text-align: center; margin-bottom: 18px !important; margin-top: -14px;} '; d.body.style.backgroundImage='none'; }
			if (options.Mood=='matte' || cinemize=='true') { newcss += 'body {background-color:'+grayColour+' !important; background: transparent;} #page_header, #header, #wrapper, div#show- {background-color:transparent !important; background: transparent;} #page {background: transparent; border: 0;} html {-webkit-box-shadow: inset 0px 0px 900px 100px rgba(0, 0, 0, 0.9); box-shadow: inset 0px 0px 900px 100px rgba(0, 0, 0, 0.9); height:100%;} '; }
			if (options.Mood=='dim' && cinemize=='false') {	newcss += '#video_player {box-shadow: 0 0 0 1818px rgba('+rgba+'); z-index: 181818; position: relative;} '; }
		}

		if (vidtype=='hulu') {
			if (options.Header=='true' || cinemize=='true') { newcss += '#banner-wrapper{display:none;} '; }
			if (options.Headline=='true' || cinemize=='true') { newcss += '.video-meta{display:none;} '; }
			if (options.Sidebar=='true' || cinemize=='true') { newcss += '#content {display:none;} '; }
			if (options.Playlist=='true' || cinemize=='true') { newcss += '#content {display:none;} '; }
			if (options.Description=='true' || cinemize=='true') { newcss += '#video-description{display:none !important;} '; }
			if (options.Comments=='true' || cinemize=='true') { newcss += '#fb-comments{display:none;} '; }
			if (options.Footer=='true' || cinemize=='true') { newcss += '#footer{display:none;} '; }
			if (options.Cleanup=='true' || cinemize=='true') { newcss += '.ext-show-link-container-watch, #m_tags_pane, .subscription-links, #watch_page_social , #watch-share, #banner-ad-container, div.fixed-lg.container.availability, #fb_watch_page_like_button {display:none;} #banner-ad-container {display:none !important;} '; }
			if (options.Mood=='matte') { newcss += 'body{background-color:'+grayColour+' !important; background-image:none !important;} #video-player-section {background: transparent;} .top, #description-container, .white, .main, .tab-header, div#show-and-watch-container .tab-header.main.white, div#time-based-search-container .tab-header.main.white, .bg-gray, #recommended-videos, #footer, .footer, #top-sec-nv, div.embed_search_bar, div.bar, .availability, .review-bg, .t-top-bg, .t-body {background:transparent !important; background-color:transparent !important; border-left:0; border-right:0;} .t-list li.t-li {border:0;} '; }
			if (options.Mood=='dim' && cinemize=='false') {	newcss += '#player-container {box-shadow: 0 0 0 1818px rgba('+rgba+'); z-index: 181818; position: relative;} .bg-gray, #recommended-videos, div.fluid.footer {background: rgba('+rgba+') !important;} '; }
			if (cinemize=='true') { newcss += 'body, #page_header, #header, #wrapper {background-color:'+grayColour+' !important; background: transparent;} #video-player-section, #background {background: transparent !important;} #page, .bg {background: transparent; border: 0;} #show-and-watch-container, .fixed-lg {display:none;} html {-webkit-box-shadow: inset 0px 0px 900px 100px rgba(0, 0, 0, 0.9); box-shadow: inset 0px 0px 900px 100px rgba(0, 0, 0, 0.9); height:100%;} '; }
			// cant be resized
			canChangeViewSize='false';
		}

		if (vidtype=='escapist') {
			if (options.Header=='true' || cinemize=='true') { newcss += '#site_header, #site_menu{display:none;} '; }
			if (options.Headline=='true' || cinemize=='true') { newcss += '.headline, #video_detail_header{display:none;} '; }
			if (options.Sidebar=='true' || cinemize=='true') { newcss += '#recent_site, #recent_gallery, #recent_site, #related_video_panel{display:none;} '; }
			if (options.Description=='true' || cinemize=='true') { newcss += '.byline, .video_closing, #video_details {display:none;} '; }
			if (options.Comments=='true' || cinemize=='true') { newcss += '.fb_iframe_widget, .footer{display:none;} '; }
			if (options.Footer=='true' || cinemize=='true') { newcss += '#legal, .legal_notes{display:none;} '; }
			if (options.Cleanup=='true' || cinemize=='true') { newcss += 'div.tags, #channel_menu, #ad_leaderboard, #user_panel, #right_column, div.share_panel, #welcome_panel, #new_user_panel, #profile_user_panel, #video_details div, #partners_container, #top_site_part, #navbar_top {display: none;} div#site_body, #container div.submenu_spacer {background: transparent;} div#legal_container {border-color: transparent !important;} #video_detail_header {margin-left: 18px;} #main_column {margin-left: 0;} html, #secondary_nav, #secondary_nav a {background: none !important;} a.submenu_nav:hover {color: #0071BC !important;}'; }
			if (options.Mood=='matte' || cinemize=='true') { newcss += 'html {background-color:'+grayColour+' !important; background: transparent;} body, #container, #site_body, #legal, #recent_site, #recent_gallery, #recent_site, .submenu_spacer {background-color:transparent !important; background: transparent;} #site_body, div#legal, #recent_site, #recent_gallery, #recent_site{border:0;} #container div.submenu_spacer {display: none;} '; }
			if (options.Mood=='dim' && cinemize=='false') { newcss += '#video_player {box-shadow: 0 0 0 1818px rgba('+rgba+'); z-index: 181818; position: relative;} #site_menu, #navbar_container {background: rgba('+rgba+') !important;} '; }
			if (cinemize=='true') {
				newcss += '#video_player_menu {display:none;} #player_api {box-shadow: 0px 0px 18px #000000;} #content {margin-top: 18px !important;} html {-webkit-box-shadow: inset 0px 0px 900px 100px rgba(0, 0, 0, 0.9); box-shadow: inset 0px 0px 900px 100px rgba(0, 0, 0, 0.9); height:100%;} ';
			}
		}

		if (vidtype=='dump') {
			var found=false;
			var base=d.getElementById('ytOvidtype');
			if (base&&base.getAttribute('cid')!='NaN') { found=true; }
			if (options.Header=='true' || cinemize=='true') { newcss += '#header, form.searchform {display:none !important;} '; }
			if (options.Headline=='true' || cinemize=='true') { newcss += '.post h2 {display:none;} '; }
			if (options.Sidebar=='true' || cinemize=='true') { newcss += '.box {display:none !important;} '; }
			if (options.Description=='true' || cinemize=='true') { newcss += '#holder {display:none;} .post {background:transparent;} '; }
			if (options.Comments=='true' || cinemize=='true') { newcss += ''; }
			if (options.Footer=='true' || cinemize=='true') { newcss += '#footer {display:none;} '; }
			if (options.Cleanup=='true' || cinemize=='true') { newcss += '#top-ad, .right-ad, #col-right div, .navigation.single {display:none;} .rating, .post-to-wall {display:none !important;} body {padding: 0;margin: 0;} table{padding:0;margin:0;border-collapse:collapse;} '; }
			if (options.Mood=='matte' || cinemize=='true') { newcss += 'body, .post.single {background-color:'+grayColour+'; background:'+grayColour+';} #footer, #navigation, div.inner, .navigation.single, #col-right .box, #col-right .box .inner .title, .navigation.single .divider, table, tr, td {background:transparent !important;} #footer {border:0;} ';	}
			if (options.Mood=='dim' && cinemize=='false') { newcss += '#mediaplayer {box-shadow: 0 0 0 1818px rgba('+rgba+'); z-index: 181818; position: relative;} body {background: rgba('+rgba+') !important;} '; }
			if (cinemize=='true') {
				newcss += 'table, td {background:transparent;} #TR0, #TR1 {display:none;} html {-webkit-box-shadow: inset 0px 0px 900px 100px rgba(0, 0, 0, 0.9); box-shadow: inset 0px 0px 900px 100px rgba(0, 0, 0, 0.9); height:100%;} ';
				if (found) {
					newcss += '#'+base.getAttribute('cid')+' {box-shadow: 0px 0px 18px #000000; padding-bottom: 0;} ';
				}
			}
			if (options.DownloadLinks=='true') {newcss += '#ytOlinks {padding-left:18px;padding-top:10px;text-align:left;} ';} else { newcss += '#ytOlinks {display:none;} '; }
		}

		if (vidtype == 'ph') {
			if (options.Header=='true' || cinemize=='true') { newcss += '#ph_net_bar, .header-wrapper, .header {display: none;} '; }
			if (options.Headline=='true' || cinemize=='true') { newcss += '.video-title-nf, .section_bar h1, .section_title {display:none;} .section_bar {background:transparent; border:0;} '; }
			if (options.Sidebar=='true' || cinemize=='true') { newcss += '.section-bottom, .section-relateds, .section-bottom, ul.videos, .funny-videos.section_title, .tabs_video {display:none;} '; var aa=d.getElementsByClassName('section_wrapper auto'); for (var i=0; i<aa.length; i++) {aa[i].style.display='none';} }
			if (options.Description=='true' || cinemize=='true') { newcss += '.nf-sub_video{display:none;} '; }
			if (options.Footer=='true' || cinemize=='true') { newcss += '.footer, .main-sprite, .footer-title {display:none;} '; }
			if (options.DownloadLinks=='true') { newcss += '#ytOlinks {margin-top: 10px; margin-left: 18px; padding-left: 18px; width: 100%;} '; } else { newcss += '#ytOlinks {display:none;} '; }
			if (options.Cleanup=='true' || cinemize=='true') { newcss += 'body{background-image:none;} #ph_net_bar, .flag-wrapper, div.view-channel-btn, .abovePlayer {display:none;} iframe, p.large, #topRightMenuNf {display:none;} '; }
			if (options.InVideo!='default' || cinemize=='true') { newcss += '.right-ads, #TJBottom {display:none !important;} '; }
			if (options.Mood=='matte') { newcss += 'body{background-color:'+grayColour+' !important; background-image:none !important;} .nf-sub_video, .header-wrapper{background:transparent;} '; }
			if (options.Mood=='dim' && cinemize=='false') {	newcss += '#playerDiv_1 {box-shadow: 0 0 0 1818px rgba('+rgba+'); z-index: 181818; position: relative;} '; }
			if (cinemize=='true') { newcss += '#VideoPlayer, #playerDiv_1 {box-shadow: 0px 0px 18px #000000;} #ytOlinks a {color: #03C;} .container{padding:0;width:0;margin:0;} .no-flash-js{margin-left:99px;margin-top:99px; margin-bottom:18px;} .videos_wrapper, .funny-videos, .videopagecontainer, .section-top {display:none;} body, .video-wrapper {background: transparent !important; border: transparent !important;} html {-webkit-box-shadow: inset 0px 0px 900px 100px rgba(0, 0, 0, 0.9); box-shadow: inset 0px 0px 900px 100px rgba(0, 0, 0, 0.9); height:100%; background-color:'+grayColour+';} '; }
		}

		if (vidtype == 't8') {
			if (options.Header=='true' || cinemize=='true') { newcss += '#ph_net_bar, #navbar, .header-wrapper{display:none;} '; }
			if (options.Headline=='true' || cinemize=='true') { newcss += '.title-wrapper{display:none;} '; }
			if (options.Sidebar=='true' || cinemize=='true') { newcss += '#related_videos, .funny-title-bar, .box-thumbnail-friends, .title-wrapper-2{display:none;} '; }
			if (options.Description=='true' || cinemize=='true') { newcss += '.banner-container, .buttons-video-col, .video-col-02, .video-col-03, .video-info-container, .bkg-video-rating-box {display:none;} '; }
			if (options.Comments=='true' || cinemize=='true') { newcss += 'div.box-comments, div.title-wrapper, #comments, div.margin-comments{display:none;} '; }
			if (options.Footer=='true' || cinemize=='true') { newcss += '.footer-wrapper, .footer-wrapper-categories {display:none;} '; }
			if (options.DownloadLinks=='true') { newcss += '#ytOlinks {margin-top: 10px; margin-left: 18px; padding-left: 18px; width: 100%;} '; } else { newcss += '#ytOlinks {display:none;} '; }
			if (options.InVideo!='default' || cinemize=='true') { newcss += '.ad-col-02, .ad-col-01, div.footer-ad, iframe {display:none !important;} '; }
			if (options.Cleanup=='true' || cinemize=='true') { newcss += 'body{background-image:none;} .content-wrapper{background-color:transparent;} #ph_net_bar, #gosearch, .top-right-menu, .banner-container, .name-ps-trigger, .title-bar, .flag-wrapper {display:none;} ' }
			if (options.Mood=='dim' && cinemize=='false') {	newcss += '#vid {box-shadow: 0 0 0 1818px rgba('+rgba+'); z-index: 181818; position: relative;} '; }
			if (cinemize=='true') {
				newcss += '#vid {box-shadow: 0px 0px 18px #000000;} #ytOlinks a {color: #03C;} .content-wrapper, .main-video-wrapper{margin:0;padding:0;} div.video-col-01.float-left div{margin:0 !important;} .title-bar, .bkg-video-rating-box {display:none;} body{background:transparent;} html {-webkit-box-shadow: inset 0px 0px 900px 100px rgba(0, 0, 0, 0.9); box-shadow: inset 0px 0px 900px 100px rgba(0, 0, 0, 0.9); height:100%; background-color:'+grayColour+';} ';
			}
		}

		if (vidtype == 'xvid') {
			if (options.Header=='true' || cinemize=='true') { newcss += '#table0, #siteNav, header {display:none;} '; }
			if (options.Headline=='true' || cinemize=='true') { newcss += '#table2{display:none;} '; }
			if (options.Sidebar=='true' || cinemize=='true') { newcss += '#table10, #relatedVideos {display:none;} '; }
			if (options.Description=='true' || cinemize=='true') { newcss += '#table3{display:none;} '; }
			if (options.Footer=='true' || cinemize=='true') { newcss += '#footer, .footer, .main-sprite, footer {display:none;} '; }
			if (options.DownloadLinks=='true') { newcss += '#ytOlinks {color:black; black; font: normal 12px \'Lucida Grande\', Helvetica, malotf, Arial, sans-serif; padding: 10px 0 0 10px; text-shadow: 0 0 3px white; text-align: left; word-wrap: break-word;} '; } else { newcss += '#ytOlinks {display:none;} '; }
			if (options.Cleanup=='true' || cinemize=='true') { newcss += '#table6, #table7, #table8, #table9, #table11, #abGoogle_0, #video-ad, #ad-bottom, .secondary, #videoTabs {display:none;} #player {background-color: transparent !important;} #flash-player-embed {margin:0 !important;} '; }
			if (options.Mood=='matte' || cinemize=='true') { newcss += 'html,body{background:'+grayColour+' !important;} '; }
			if (options.Mood=='dim' && cinemize=='false') {	newcss += '#flash-player-embed, #player {box-shadow: 0 0 0 1818px rgba('+rgba+'); z-index: 181818; position: relative;} '; }
			if (cinemize=='true') { newcss += '#flash-player-embed {-webkit-box-shadow: 0px 0px 18px #000000; box-shadow: 0px 0px 18px #000000;} #ytOlinks a {color: #03C;} #table10 {display:none;} html {-webkit-box-shadow: inset 0px 0px 900px 100px rgba(0, 0, 0, 0.9); box-shadow: inset 0px 0px 900px 100px rgba(0, 0, 0, 0.9); height:100%; background-color:'+grayColour+';} body {background: transparent !important;} '; }
		}

		if (vidtype=='twitch' && options.Mood=='dim') {
			newcss += '#standard_holder {box-shadow: 0 0 0 1818px rgba('+rgba+'); z-index: 181818; position: relative;} ';
		}
		if (vidtype == 'own3d' && options.Mood=='dim') {
			newcss += '#channel_player_content {box-shadow: 0 0 0 1818px rgba('+rgba+'); z-index: 181818; position: relative;} ';
		}

		if (canChangeViewSize=='true' && options.SetView!='default') {
			// change video size
			bug('change size to: '+getView(options.SetView));
			bug('== changesize from hideStuff');
			changeSize (getView(options.SetView));
		}

		if (options.DownloadLinks=='true') {
			// create download links
			bug('want to create download links');
			makeDLlinks (vidtype);
		}

		if ((grayColour=='#222222' || grayColour=='#000000') && (options.Mood=='matte' || cinemize=='true')) {
			// change yto colours when background gets too dark
			newcss += '#ytOlinks, #ytOlinks a {color: #999;} #ytOlinks:hover {color: #DDDDDD;} #ytOlinks:hover a {color: #85BFE6;} ';
		}

		// add all new css to the header
		if (newcss!='') { addCSS(newcss,'ytObase'); }

		// only show download links if selected
		if (options.DownloadLinks=='false') {toggle_downloads();}

		// create event for window resize
		addOnResize();
	}
}

function appendYTType () {
	// append youtube type to footer

	var d=getDOM();

	var aa = d.getElementById('footer-main');
	var ab = d.getElementById('ftl');
	var ac = d.getElementById('footer-links-secondary');
	var ad = d.getElementById('footer-hh-links-secondary');

	var codec = 'Flash';
	if (vidKind()=='html5') {codec = 'HTML5';}
	var pagetype = '';
	if (ytType=='feather') {pagetype = 'Feather';}
	if (ytType=='watch7') {pagetype = 'Watch7';}

	if (ytPage!='watch') {return false;}

	var ytKind=codec;
	if (pagetype!='') {ytKind=pagetype+' '+codec;}

	if (ytKind!='normal' && ytKind!='flash' && (aa || ab || ac || ad)) {
		if (ytType=='normal' && aa) {
			// normal
			var bits = aa.getElementsByTagName('ul');
			for (var i=0; i<bits.length; i++) {
				if (bits[i] && bits[i].className.indexOf('pickers')!='-1') {
					var temp = d.createElement('li');
					var temp2 = d.createElement('span');
					temp.textContent = 'Version:';
					temp2.textContent = ytKind;
					temp.setAttribute('class','ytFt');
					temp.appendChild(temp2);
					bits[i].appendChild(temp);
				}
			}
		}
		if (ytType=='watch7') {
			// watch7
			var temp = d.createElement('li');
			temp.textContent = 'Version: '+ ytKind;
			temp.setAttribute('class','ytFt');
			if (ac) {ac.appendChild(temp);}
			if (ad) {ad.appendChild(temp);}
		}
		if (ytType=='feather') {
			// feather
			var temp = d.createElement('span');
			temp.setAttribute('class','ytFt');
			temp.textContent = ytKind;
			if (ab) {ab.appendChild(temp);}
		}
	}

	if (options.ytCodec!=codec) {
		if (thisbrowser=='chrome') { chrome.extension.sendRequest({greeting: 'ytCodec', todo: codec}, function() {}); }
		if (thisbrowser=='safari') { safari.self.tab.dispatchMessage('savePrefs','{"ytCodec":"'+codec+'"}'); }
		if (thisbrowser=='opera') {}
	}
}

function defineVidType (vidtype) {
	// determine video id and write it to the header

	var d=getDOM();

	var centertype='';
	var vidid='';

	if (vidtype=='youtube') {
		if (ytType=='normal') {
			centertype='id';
			centerid='watch-video';
			vidid='watch-player';
		}
		if (ytType=='watch7') {
			centertype='id';
			centerid='watch7-container';
			vidid='watch7-player';
		}
		if (ytType=='feather') {
			centertype='id';
			centerid='p';
			vidid='p';
		}
	}
	if (vidtype=='vimeo') {
		centertype='id';
		centerid='video_player';
	}
	if (vidtype=='dailymotion') {
		centertype='id';
		centerid='video_player';
	}
	if (vidtype=='metacafe') {
		centertype='id';
		centerid='ItemContainer';
	}
	if (vidtype == 'g4tv') {
		centertype='id';
		centerid='video';
	}
	if (vidtype == 'fearnet') {
		centertype='id';
		centerid='myExperience';
	}
	if (vidtype=='funny') {
		centertype='id';
		centerid='video_player';
	}
	if (vidtype=='hulu') {
		centertype='id';
		centerid='player-container';
	}
	if (vidtype=='escapist') {
		centertype='id';
		centerid='video_player_object';
	}
	if (vidtype=='dump') {
		centertype='id';
		centerid='mediaplayer';
	}
	if (vidtype == 'ph') {
		centertype='id';
		centerid='playerDiv_1';
	}
	if (vidtype == 't8') {
		centertype='id';
		centerid='vid';
	}
	if (vidtype == 'xvid') {
		centertype='id';
		centerid='flash-player-embed';
	}
	if (vidtype == 'own3d') {
		centertype='id';
		centerid='x';
	}
	if (vidtype == 'twitch') {
		centertype='id';
		centerid='x';
	}
	if (vidtype == 'twitter') {
		centertype='id';
		centerid='video_player';
	}

	if (!d.getElementById('ytOvidtype') && centertype!='') {
		// create header
		bug('ytO: appending vid type to header');
		var temp = d.createElement('style');
		temp.setAttribute('id','ytOvidtype');
		temp.setAttribute('ctype',centertype);
		temp.setAttribute('cid',centerid);
		temp.setAttribute('vid',vidid);
		if (d.head) { d.head.appendChild(temp); }
	} else if (d.getElementById('ytOvidtype')) {
		// update header
		d.getElementById('ytOvidtype').setAttribute('ctype',centertype);
		d.getElementById('ytOvidtype').setAttribute('cid',centerid);
	}
}

function do_Center (cwait) {
	// center video

	var wait=0;
	if (cwait) {wait=cwait;}

	setTimeout(function(){
		var d=getDOM();
		var aa=d.getElementById('ytOvidtype');
		if (!aa) {
			console.log('ytO ERROR: could not determine video type.');
			return false;
		}

		var type=aa.getAttribute('ctype');
		var id=aa.getAttribute('cid');
		var vid=aa.getAttribute('vid');

		bug('do_Center video frame: '+ type+' '+id);

		if (type=='id') { var yw = d.getElementById(id); }
		else if (type=='class') { var yw = d.getElementsByClassName(id)[0]; }

		if (!yw) {
			if (vidtype!='twitter') {
				// could not find the video to center
				//console.log('ytO ERROR: could not find the video to center.');
			}
			return false;
		}

		// worry about headline and title (youtube)
		var offset=0;

		var newcss='';

		var ab=d.getElementById('ytOsettings');
		if (ab&&thisbrowser=='firefox') {
			ab=JSON.parse(ab.textContent);
			viewexp=ab.viewexp;
		}

		if (vidtype=='youtube') {
			if (ytType=='normal') {
				// dont fully center if header or headline
				var ac=d.getElementById('masthead-container');
				var ad=d.getElementById('watch-headline-container');
				if (ac && ad) {
					if (ac.clientHeight>0 || ad.clientHeight>0) {offset=1;}
				}
				if (offset>0) {
					addCSS('','ytOcenter');
					return false;
				}
			}
			if (ytType=='watch7') {
				// dont fully center if header (new youtube interface)
				var ac=d.getElementById('yt-masthead-container');
				var ad=d.getElementById('gb');
				if (ac && ad) {
					if (ac.clientHeight>0 || ad.clientHeight>0) {offset=1;}
				}
				if (offset>0) {
					addCSS('','ytOcenter');
					return false;
				}
			}
			if (ytType=='feather' && isCinema()) {
				if (d.getElementById('movie_player')) {
					// flash
					var width=d.getElementById('movie_player').clientWidth;
					newcss += '#lc, #ytOlinks {width:'+width+'px !important; margin-bottom: 18px;} ';
					newcss += '#ct {margin-left:0;} ';
				}
				if (d.getElementById('video-player')) {
					// html5
					var width=d.getElementById('video-player').clientWidth;
					newcss += '#ct, #lc {width: 100%;} #p {margin: 0 auto;} ';
					newcss += '#ytOlinks {width:'+width+'px} ';
					newcss += '#ct {margin-left:0;} ';
				}
			}
		} else {
			// all videos other than youtube worry about sides
			var width = getStyle(yw).getPropertyValue('width').replace(/px/,'');
			if (width==0) {
				width = yw.clientWidth;
			}
			if (options.viewexp=='false') {
				var fancyside = Math.round((window.innerWidth-width)/2);
				if (fancyside > 0) {
					val=fancyside+'px';
				}

				if (vidtype=='xvid') {
					yw=yw.parentNode;
				}

				if (!d.getElementById('wrap')) {
					if (type=='id') { newcss += '#'+id+' {margin-left:'+val+';} '; }
					if (type=='class') { newcss += '.'+id+' {margin-left:'+val+';} '; }
				}

				if (d.getElementById('ytOlinks')&&(vidtype=='dailymotion'||vidtype=='ph'||vidtype=='xvid')) {
					newcss += '#ytOlinks {margin-left:'+val+';} ';
				}
				if (vidtype=='escapist'&&d.getElementById('video_player_menu')) {
					newcss += '#video_player_menu{margin-left:'+val+';} ';
				}
			}
		}

		if ((isCinema() && (offset==0 || options.Cinemize=='true')) || options.Cinemizep=='true') {
			// down from the top of the page
			if (options.viewexp=='false') {
				if (!vheight) {
					// get height of video
					if (vid!='') {yw=d.getElementById(vid);}
					var vheight = yw.clientHeight;
				}
				var wih=window.innerHeight;
				if (wih==0) {wih=window.parent.innerHeight;}

				var val=18;
				var fancytop = Math.round((wih-vheight-80)/2);
				if (fancytop > 0) {val=fancytop;}

				if (type=='id') {
					newcss += '#'+id+' {margin-top:'+val+'px !important;} ';
				} else {
					newcss += '.'+id+' {margin-top:'+val+'px !important;} ';
				}
				if (options.SidebarStay=='true') {
					var yh = 0;
					var yl = d.getElementById('ytOlinks');
					newcss += '#watch-sidebar {margin-top: -'+ (yw.clientHeight+yh) +'px;} ';
				}
			}
		}

		if (newcss!='') {
			addCSS(newcss,'ytOcenter');
		} else {
			addCSS('','ytOcenter');
		}
	},wait);
}

function expToWidth () {
	// return height and width based on window size

	var winw=window.innerWidth;
	var winh=window.innerHeight;
	var d=getDOM();
	if (thisbrowser=='firefox') {
		winw=unsafeWindow.top.innerWidth;
		winh=unsafeWindow.top.innerHeight;
		d=content.document;
	}

	var scroll=0;
	if (d.body.scrollWidth>winw||d.body.scrollHeight>winh) {
		scroll=17;
	}

	if (ytType=='normal') {
		// look for the playlist (youtube)
		if (d.getElementById('playlist-bar-mask') && getDisplay('playlist-bar')!='none') {
			winh-=46;
		}
	}

	var neww=winw-scroll;
	var newh=Math.round(winw/1.777777777777778);
	bug('resize-w: '+ neww+' x '+newh);

	if (newh>winh) {
		newh=winh-5;
		neww=Math.round(newh*1.777777777777778);
		bug('resize-h: '+ neww+' x '+newh);
	}

	bug('expToWidth resize: '+ neww+' x '+newh);
	return [neww,newh];
}

function ytoZoom (kind) {
	// zoom in on video like an iOS device

	var d=getDOM();

	var aa=d.getElementById('ytOzoom');
	var ac=d.getElementById('ytOsettings');

	var viewexp = false;
	if (ac && ac.textContent.indexOf('viewexp')!='-1') {viewexp = true;}

	var cleanup = false;
	if (kind=='remove') {cleanup = 'remove';}
	if (kind=='update' && aa=='null') {cleanup = 'nothing to update';}
	if (viewexp==false) {cleanup = 'not in viewexp mode';}
	if (viewexp==true && kind=='action') {cleanup = false;}
	if (viewexp==true && kind=='action' && aa) {cleanup = 'undo from page action';}

	var zoom = 1.1;
	if (viewexp==true && kind=='action' && aa && aa.getAttribute('zoom')) {
		cleanup = false;
		if (aa.getAttribute('zoom')=='1.1') {zoom=1.33;}
		if (aa.getAttribute('zoom')=='1.33') {zoom=1.5777;}
		if (aa.getAttribute('zoom')=='1.5777') {cleanup=true;}
	}

	if (cleanup != false) {
		bug('zoom: removing or cleaning up css: '+cleanup);
		if (aa) {d.head.removeChild(aa);}
		return false;
	}

	var player = undefined;
	var ab = d.getElementById('ytOvidtype');
	if (ab && ab.getAttribute('vid')) {
		player = d.getElementById(ab.getAttribute('vid'));

		if (player) {
			var winw=window.innerWidth;
			//var winh=window.innerHeight;

			var formula = Math.round((((winw * zoom) - winw) / zoom) / 2);

			var newcss = '#'+ab.getAttribute('vid')+' {zoom: '+zoom+'; margin-left: -'+formula+'px !important;} ';

			addCSS(newcss,'ytOzoom');
			var aa=d.getElementById('ytOzoom');
			aa.setAttribute('zoom',zoom);
		}
	}
}

function changeSize (mode) {
	// change frame size
	// http://code.google.com/apis/youtube/js_api_reference.html#Playback_quality
	// http://en.wikipedia.org/wiki/Youtube

	// on setview on changeview on resizeview

	// default to large
	var width=854;
	var height=480;
	if (mode=='small'||mode=='240p') { width=320; height=240; }
	if (mode=='medium'||mode=='360p') { width=640; height=360; }
	if (mode=='large'||mode=='480p') { width=854; height=480; }
	if (mode=='hd540'||mode=='540p') { width=960; height=540; }
	if (mode=='hd720'||mode=='720p') { width=1280; height=720; }
	if (mode=='hd1080'||mode=='1080p'||mode=='highres') { width=1920; height=1080; }
	//if (mode=='hd2304'||mode=='highres') { width=4096; height=2304; }

	if (mode=='viewexp') {
		var dsize=expToWidth();
		width=dsize[0];
		height=dsize[1];
		addCSS(mode,'ytOsettings');
		options.viewexp='true';
	} else {
		addCSS('','ytOsettings');
		options.viewexp='false';
	}

	var newcss='';
	var centertype = '';
	var centerid = '';

	var d=getDOM();

	if (vidtype=='vimeo') {
		if (d.getElementById('wrap')) {
			// new vimeo
			newcss += '.vimeo_holder {width:'+width+'px !important; height:'+height+'px !important; margin-right:0;} #content {width:auto;} .vimeo_holder {margin: 0 auto !important;} ';
			if (mode=='viewexp') {
				newcss += '.vimeo_holder, #video_player {margin-top: 0 !important;} #content{padding:0 !important;} ';
			}
		} else {
			// old vimeo
			newcss += '.vimeo_holder, #video_player{width:'+width+'px !important;height:'+height+'px !important; margin-right:0;} .video_stuff{float:left;margin-top:18px;margin-left: 965px;margin-bottom: -428px;padding-top: 50px;} #everything{margin:0;} .description_container{margin-top:64px;} #everything, .main, div#top, #header .rightside{width:auto !important;} #meat{margin: 20px 20px 20px 0;} ';
			if (mode=='viewexp') {
				newcss += '#toolbar{display:none;} #meat{margin:0;} .video, #video_player{margin:0 !important;} ';
			}
		}
	}

	if (vidtype=='dailymotion') {
		newcss += '.player_box, #video_player, .dmpi_video_playerv4 {width:'+width+'px !important;height:'+height+'px !important;} div#right_content_box{margin-top:'+(height/2)+'px;} #content{margin:0px !important;} .video_tools_box{margin-top:95px;} #top_content_box{margin-bottom:81px;} #video_player > div > div{height:auto !important;} ';
		if (mode=='viewexp') {
			newcss += '#wrapper{padding-top:0 !important;} #topwrapper{height:auto;min-height:auto;} div.dmpi_bigbox {padding:0;} .player_box, #video_player {margin:0 !important;} ';
		}
		newcss += '#ytOlinks {width:'+ width +'px;} ';
	}

	if (vidtype=='metacafe') {
		newcss += '#movieclips_player, #FlashWrap, #adaptvDiv, #ItemContainer, #fpObj, .WideScreen #fpObj {width:'+width+'px !important; height:'+height+'px !important;} #adaptvDiv{margin:0;} #Content.Branded, #Content{width:'+width+'px;} .WideScreen #FlashWrap{margin:0;} #SideCol{margin-top:130px; margin-left: 627px; float:left; margin-bottom:-858px; padding-top:'+height+'px;} #AfterPlayer{margin-top:70px !important;} #Content{width:auto !important;} #FlashWrap{margin-top:0 !important;} ';
		// #SideCol
		if (mode=='viewexp') {
			newcss += '#Content, #ItemContainer {margin:0 !important; padding:0;} ';
		}
	}

	if (vidtype=='g4tv') {
		newcss += '#detail-video-player, #video{width:'+width+'px !important;height:'+height+'px !important;} .content-wrap, #bd .content-wrap{width:0;margin:0;margin-left:18px;} .flash-player, .theme-light, #video, #video-player, .mod-wrap-1, .module .mod-wrap-1, .article .article-wrap-1, .theme-light .module .mod-wrap-2, .theme-light .article .article-wrap-2{background:transparent;} .mod-wrap-2 {width: 100%;} ';
		if (mode=='viewexp') {
			newcss += '.videos.detail .flash-player, .videos.detail .module .bd, .module .mod-wrap-3, .article .article-wrap-3 {padding:0 !important; margin:0 !important;} div.content-wrap {margin:0 !important; padding:0;} ';
		}
	}

	if (vidtype=='fearnet') {
		newcss += '#mvd_embedded_player, #mvd_embedded_player_container, #myExperience {width:'+width+'px !important;height:'+(height+175)+'px !important;} #mvd_embedded_player {margin:0 !important;} #mvd_embedded_player_container{width: 100% !important; margin-top: -47px;} #content_outer, #content_outer .inside, #video_player, .paper {width:auto !important;} #page{padding-top:18px !important;} #md_left_nav{margin-bottom: -410px;} #page {margin:0;} .panels-flexible-region-new-left {width:0 !important;} ';
		if (mode=='viewexp') {
			newcss += '#mvd_embedded_player_container {padding:0 !important; margin:0 !important;} .movie-video-left {width:0;} .movie-video-left, .mainborder, .panels-flexible-region-inside {padding:0;margin:0;} ';
		}
	}

	if (vidtype=='funny') {
		newcss += '#fodplayer, #video_player, video{width:'+width+'px !important;height:'+(height+175)+'px !important;} #video_player {margin: auto !important;} #content {overflow: visible !important;} #page{width:auto !important;} #content {margin:0;width: auto;} #content_column, .content_column{width:auto !important; float:none;} ';
		if (mode=='viewexp') {
			newcss += '#page, #page_header {padding:0 !important;} ';
		}
	}

	if (vidtype=='hulu') {
		newcss += '.bg{background: transparent;} #player-container{margin-left: 0 !important;} ';
	}

	if (vidtype=='escapist') {
		newcss += '#video_player_object, #sponsor_player, #sponsor_player embed {width: '+width+'px !important; height: '+height+'px !important;} #video_player_menu {width: '+(width-12)+'px !important;} #container {width: auto;} #sponsor_player {top:0; left:0; position: static; margin: 0 auto;} #sponsor_display, #sponsor_player_container {width: 100%;} #sponsor_player_container {height: '+height+'px;} #sponsor_display {height: '+ (height+20) +'px;} #sponsor_container, #sponsor_display, #sponsor_player_container {background: transparent;} #sponsor_header {width: '+ (width-8) +'px; margin: 0 auto;} ';
		if (mode=='viewexp') {
			newcss += '#container, #site_body, #video_player_menu, #video_player_object {margin:0;padding:0;} #video_player_menu{border:0;} ';
		}
	}

	if (vidtype=='dump') {
		var base=d.getElementById('ytOvidtype');
		if (base&&base.getAttribute('cid')!='NaN') {
			newcss += '#'+base.getAttribute('cid')+'{width:'+width+'px !important;height:'+height+'px !important;} .container {width:auto;} #content {margin: 18px 0 0;} #col-middle {width:100%;} #mediaplayer{margin: 0 !important;} #ytOlinks {width:'+width+'px} ';
			if (mode=='viewexp') {
				newcss += '#'+base.getAttribute('cid')+'{margin:0;} ';
			}
		}
	}

	if (vidtype=='ph') {
		newcss += '#VideoPlayer, #playerDiv_1 {width: '+width+'px !important; height: '+height+'px !important;} .container {width: 0; margin-left: 18px; margin-top: 18px;} #sidebar {margin-top:'+height+'px;} .container-videos-right {margin-top: '+(height+80)+'px;} ';
		if (mode=='viewexp') {
			newcss += '#VideoPlayer, .container, #playerDiv_1 {margin:0 !important;} ';
		}
	}

	if (vidtype=='t8') {
		newcss += '#flvplayer{width:'+width+'px !important;height:'+height+'px !important;} .content-wrapper{width:0;margin:0;} #vid{width:100% !important;height:100% !important;} ';
		if (mode=='viewexp') {
			newcss += '.main-video-wrapper, .video-col-01 div {margin:0 !important; padding:0;} #related_videos {padding-top:'+(height/1.5)+'px;} #vid{margin:0 !important;} ';
		}
	}

	if (vidtype=='xvid') {
		newcss += '#flash-player-embed {width:'+width+'px !important; height:'+height+'px !important;} #main #player {width:'+width+'px !important; height:'+ (height+20) +'px !important;} #player {background-color:transparent !important; margin: 0 auto !important;} #flash-player-embed{background-color:black;} #page {width: auto;} ';
		if (mode=='viewexp') {
			newcss += '#flash-player-embed{margin:0 !important;} ';
		}
	}

	if (vidtype=='twitter') {
		newcss += '#video_player {width:'+width+'px !important; height:'+height+'px !important;} ';
		var newleft = 60;
		if (width>320) {
			newleft = ((width-568+130)/2)*-1;
		}
		newcss += '#video_player {margin-left: '+newleft+'px !important;} ';
	}

	if (vidtype=='youtube') {
		if (ytType=='normal') {
			if (options.SidebarStay=='false') {
				// make sure video sidebar doesnt hide behind video
				newcss += '#watch-sidebar {margin-top: 0 !important; padding-top: 10px;} ';
			}

			// video may need to expand past youtube page width
			newcss += '#watch-video {width:100% !important;} ';

			if (options.Cinemizep=='true') {
				// keep the video where it was so the centering can handle the rest
				var current=getStyle(d.getElementById('watch-video')).getPropertyValue('margin-top');
				if (current) {newcss += '#watch-video {margin-top:'+current+';} ';}
			}

			if (vidKind()=='html5') {
				// html5 video resize
				newcss += '.html5-video-content {width:'+width+'px !important; height:'+height+'px !important;} ';
			}

			// add space for player controls
			if ((ytControls==true && options.Hide=='false') || vidKind()=='html5') {
				height+=30;
			}

			// flash video resize
			newcss += '#watch-player {width:'+width+'px !important; height:'+height+'px !important;} ';

			if (options.SidebarStay=='false') {
				// make video center
				newcss += '#watch-player {margin: 0 auto;} ';
			}
			if (options.SidebarStay=='true' && options.Cleanup=='false') {
				newcss += '#watch-main, #watch-panel, #watch-actions, #watch-panel .content {width: '+width+'px;} #watch-sidebar {left: 330px;} #watch-player {margin: 0 auto;} ';
			}

			if (d.URL.indexOf('embed')=='-1') {
				// resize the links so they can float with video horizontally
				newcss += '#ytOlinks {width:'+ width +'px !important;} body {height: auto; width: auto;} ';
			}

			// remove ad move
			newcss += '#watch-video.has-ad {left:0 !important;} ';

			if (vidKind()=='html5') {
				// fix html5 resize
				newcss += '.video-content, .html5-video-content {left:0 !important; top:0 !important;} ';
				// hide resize buttons
				newcss += '#html5large, #html5small {display:none;} ';
			}

			// determine if header or headline is showing for spacing
			var offset=0;
			if (d.getElementById('masthead-container')) {
				header = d.getElementById('masthead-container').clientHeight; if (header > 0) { offset += header; }
			}
			if (d.getElementById('watch-headline')) {
				headline = d.getElementById('watch-headline').clientHeight; if (headline > 0) { offset += headline; }
			}
			if (offset>0) {
				addCSS('#watch-player {margin-top: 0 !important;} ','ytOcenter');
			} else {
				addCSS('','ytOcenter');
			}

			if (mode=='viewexp') {
				// fit to width or fit to height
				newcss += '#watch-video, #watch-container {margin:0 !important;} #watch-container {padding:0;} #watch-video {width: 100% !important;} ';

				var vidbottom = getOffsetTop(d.getElementById('watch-player'))+height;

				if (options.ScrollTop=='true' || (d.body.scrollTop + vidbottom > window.innerHeight)) {
					// scroll to the top of the video
					scrollToTop(d);
				}
			}
		}

		if (ytType=='watch7') {
			// new youtube interface

			// resize download links
			if (options.DownloadLinks!='never') {
				newcss += '#watch7-container #ytOlinks {margin: 0 auto; width: '+width+'px;} ';
				newcss += '#watch7-container.watch-medium #ytOlinks {width: '+width+'px;} ';
				newcss += '#watch7-container.watch-large #ytOlinks {width: '+width+'px;} ';
			}

			// this centers setsize video with playlist showing
			newcss += '#watch7-container.watch-playlist #watch7-video-container {width: '+width+'px;} ';

			// correct and center css of auto-sizing larger videos
			newcss += '#watch7-container.watch-medium #watch7-video-container {width: '+width+'px;} ';
			newcss += '#watch7-container.watch-large #watch7-video-container {width: '+width+'px;} ';
			newcss += '#watch7-container.watch-medium #watch7-playlist-container {width: '+width+'px;} ';
			newcss += '#watch7-container.watch-large #watch7-playlist-container {width: '+width+'px;} ';
			newcss += '#watch7-video-container {width: auto;} ';

			// adjust height of playlist
			var plistheight = height;
			if (options.Hide=='true' && options.SidebarStay=='false') {plistheight = height-3;}
			newcss += '.watch-playlist #watch7-playlist-tray-container {height: '+plistheight+'px;} .watch-playlist #watch7-playlist-tray {border-bottom: 0;} ';
			newcss += '.watch-playlist.watch-large #watch7-playlist-tray-container {height: '+plistheight+'px;} ';

			var aa = d.getElementById('watch7-container');
			if (options.SidebarStay=='false') {
				// make the playlist drop-down button show
				newcss += '.watch-playlist #watch7-playlist-bar-toggle-button {display: inline;} ';

				// make the playlist hidden by default
				if (aa && options.SidebarStay=='false' && aa.className.indexOf('watch-playlist')!='-1' && aa.className.indexOf('watch-playlist-collapsed')=='-1') {
					aa.className = aa.className+' watch-playlist-collapsed';
				}
			} else {
				// make sure the playlist is showing (it could be in large size and hidden natively)
				if (options.SetView=='default' && aa && aa.className.indexOf('watch-playlist')!='-1' && aa.className.indexOf('watch-playlist-collapsed')!='-1') {
					aa.className = aa.className.replace(' watch-playlist-collapsed','');
				}
			}
			addCSS('','ytOsidebar');

			if (options.Cleanup=='false') {
				// adjust playlist with cleanup = false
				newcss += '#watch7-playlist-data {padding-left: 0;} ';
			}

			// center everything under video
			newcss += '.site-left-aligned #watch7-main, .site-right-aligned #watch7-main {margin: 0 auto !important;} ';
			newcss += '#watch7-main-container {padding-left: 0 !important;} ';
			newcss += '#watch7-main {margin: 0 auto !important;} ';

			// make sure video sidebar doesnt hide behind video
			newcss += '#watch7-sidebar {padding-top: 10px;} ';

			// video may need to expand past youtube page width
			newcss += '#watch7-video {width:100% !important;} ';
			if (options.Cinemizep=='true') {
				// keep the video where it was so the centering can handle the rest
				var current=getStyle(d.getElementById('watch7-video')).getPropertyValue('margin-top');
				if (current) {newcss += '#watch7-video {margin-top:'+current+';} ';}
			}

			if (vidKind()=='html5') {
				// html5 video resize
				newcss += '.html5-video-content {width:'+width+'px !important; height:'+height+'px !important;} ';
			}

			// add space for player controls
			if ((ytControls==true && options.Hide=='false') || vidKind()=='html5') {
				height+=30;
			}

			// flash video resize
			newcss += '#watch7-player {width: '+width+'px !important; height: '+height+'px !important;} ';

			// make video center
			newcss += '#watch7-player {margin: 0 auto;} ';
			newcss += '#watch7-video-container {margin: 0 auto !important; padding-left: 0 !important;} ';

			newcss += '#watch7-playlist-container, #watch7-video-container {padding-top: 0 !important; margin-top: 0 !important;} ';

			// remove ad move
			newcss += '#watch7-video.has-ad {left: 0 !important;} ';

			if (vidKind()=='html5') {
				// fix html5 resize
				newcss += '.video-content, .html5-video-content {left:0 !important; top:0 !important;} ';
				// hide resize buttons
				newcss += '#html5large, #html5small {display: none;} ';
			}

			// new additions
			newcss += '#watch7-playlist {width:'+width+'px !important;} ';

			// make playlist same size as video
			newcss += '#watch7-playlist-container {width:'+width+'px; padding-left: 0 !important; margin: 0 auto;} ';
			if (width>640) {
				newcss += '.watch-medium #watch7-playlist-bar, .sidebar-collapsed .watch-medium #watch7-playlist-bar {width:'+width+'px;} ';
			}

			// SidebarStay
			if (options.SidebarStay=='false') {
				newcss += '.watch7-playlist-bar {width: '+width+'px !important;} ';
			} else {
				newcss += '.watch7-playlist-bar {width: '+(width+305)+'px !important;} ';
				newcss += '.watch-playlist #watch7-playlist-bar-toggle-button {display: none;} ';
			}
			newcss += '.watch7-playlist-bar {min-width: 419px;} ';

			newcss += '.watch-branded #watch7-video-container {margin-top: 0 !important; padding-top: 0 !important;} ';
			newcss += '#page {padding-top: 0;} #page-container {margin-top: 0;} ';

			// determine if header or headline is showing for spacing
			var offset=0;
			if (d.getElementById('masthead')) {
				header = d.getElementById('masthead').clientHeight; if (header > 0) { offset += header; }
			}

			if (offset>0) {
				addCSS('#watch7-player {margin-top:0 !important;} ','ytOcenter');
			} else {
				addCSS('','ytOcenter');
			}

			if (options.Cleanup=='true') {
				// keep sidebar from staying put
				newcss += '.watch-wide #watch7-sidebar {margin-top: 55px !important;} ';
			} else {
				newcss += '.sidebar-expanded #watch7-sidebar {margin-top: 0 !important; padding: 15px 0 10px 5px;} ';
			}

			if (mode=='viewexp') {
				// fit to width or fit to height
				newcss += '#watch7-video, #watch7-container {margin:0 !important;} #watch7-container {padding:0;} #watch7-video {width: 100% !important;} ';

				var vidbottom = getOffsetTop(d.getElementById('watch7-player'))+height;

				// move over comments and related
				newcss += '#watch7-main-container {padding-left: 0 !important;} ';

				if (options.ScrollTop=='true' || (d.body.scrollTop + vidbottom > window.innerHeight)) {
					// scroll to the top of the video
					scrollToTop(d);
				}

				// viewexp hides guide
				toggleOff('guide');
			}
		}
		if (ytType=='feather') {

			if (vidKind()=='html5') {
				// html5 video resize
				newcss += '.html5-video-content {width:'+width+'px !important; height:'+height+'px !important;} ';
			}

			// add space for player controls
			if ((ytControls==true && options.Hide=='false')||vidKind()=='html5') {
				height+=30;
			}

			if (vidKind()=='html5') {
				newcss += '.video-content, .html5-video-content {left:0 !important; top:0 !important;} ';
				// hide resize buttons
				newcss += '#html5large, #html5small {display:none;} ';

				newcss += '#p {width:'+width+'px;} ';
			}

			// make sure video frame is the same height for everything below
			newcss += '#p {height: '+height+'px; width: '+width+'px;} ';

			// flash video resize
			newcss += '#movie_player {width:'+width+'px !important; height:'+height+'px !important;} ';

			if (options.SidebarStay=='true' && options.Cleanup=='false') {
				// container must be wide enough to hold sidebar
				newcss += '#mh, #ct {width: '+ (width+25+300) +'px;} #mh {min-width: 965px;} ';
				// make comments and links as wide as video
				newcss += '#lc, #ytOlinks {width: '+width+'px !important;} ';
			} else {
				// sidebar not staying
				if (mode=='240p' || mode=='360p' || mode=='small' || mode=='medium') {
					// keep it next to video for small sizes
				} else {
					// move sidebar down for larger sizes
					newcss += '#rc {margin-top:'+height+'px; padding-top: 10px;} ';
					if (mode!='viewexp' && isCinema()==false) {
						// set headline, title, and container to video width for page centering
						newcss += '#mh, #ct, #ft { width: '+width+'px; min-width: 960px; } ';
					}
				}
			}

			if (options.SidebarStay=='false') {
				// make video center
				newcss += '#watch-player {margin: 0 auto;} ';
			}
			if (options.SidebarStay=='true' && options.Cleanup=='false') {
				newcss += '#watch-main, #watch-panel, #watch-actions, #watch-panel .content {width: '+width+'px;} #watch-sidebar {left: 330px;} #watch-player {margin: 0 auto;} ';
			}

			if (mode=='viewexp') {
				// fit to width or fit to height
				newcss += 'body {margin:0 !important;} #mh, #ct, #ft { margin-left: 18px;} ';
				newcss += '#p {margin-left: -18px;} #mh {margin-top: 9px;} ';

				var vidbottom = getOffsetTop(d.getElementById('p'))+height;
				if (options.ScrollTop=='true' || (d.body.scrollTop + vidbottom > window.innerHeight)) {
					// scroll to the top of the video
					scrollToTop(d);
				}
			}
		}

		// make the sidebar stay
		makeSidebarStay ();
	}

	// add to head
	if (newcss!='') { addCSS(newcss,'ytOvid'); addCSS ('','ytOnovid'); }

	// video has been cinemized so center it
	if (options.SetView!='exp') {
		bug('trying to center after vid size change');
		do_Center(818);
	}

	bug('ytO: viewing area size changed to: '+ width +'x'+ height);
}

function makeSidebarStay () {
	// keep sidebar next to video (youtube)

	if (options.SidebarStay=='true') {
		setTimeout(function(height){
			var newcss='';
			var d=getDOM();

			// height of video
			var height=d.getElementById(d.getElementById('ytOvidtype').getAttribute('vid')).clientHeight;

			// compensate for description and comments
			var smargin=0;
			var wp = d.getElementById('watch-panel');
			if (wp) {
				// account for description and comments
				smargin = wp.clientHeight + height + 5;
			} else {
				// popin has removed description and comments
				smargin = height + 5;
			}

			var branded=false;
			if (d.getElementById('page') && d.getElementById('page').className.indexOf('watch-branded')!='-1') {branded=true;}

			// look for download links
			var yh = 0;
			var yl = d.getElementById('ytOlinks');

			// look for playlist ads
			var yl = d.getElementById('watch-video-extra');
			if (yl) {
				yh += yl.clientHeight;
			}

			newcss += '#watch-sidebar {margin-top: -'+ (smargin+yh) +'px;} ';
			newcss += '.watch-wide #watch-sidebar {margin-top: -'+ (smargin+yh) +'px !important; padding-top: 0; } ';
			if (branded=true) {
				newcss += '.watch-branded.watch-autohide #watch-sidebar, .watch-branded.watch-autohide #watch-sidebar, .watch-branded #watch-sidebar {margin-top: -'+ (smargin+yh+5) +'px;} ';
			}

			// sidebar needs to be above default matte background box
			newcss += '#watch-sidebar {z-index: 181819;} ';

			if (d.getElementById('ytOvid')) {
				d.getElementById('ytOvid').innerText += newcss;
			}
		},459);
	}
}

function pixelsToSize (mw) {
	// convert pixels into text size

	var dlclass='large';
	if (mw<320) {dlclass='micro';} else
	if (mw<600) {dlclass='small';} else
	if (mw<800) {dlclass='medium';} else
	if (mw<900) {dlclass='large';} else
	if (mw<1200) {dlclass='hd540';} else
	if (mw<1900) {dlclass='hd720';} else
	{dlclass='hd1080';}

	return dlclass;
}

function getOffsetTop (obj) {
	// determine where object is from the top of the page

	if (!obj) {return false;}

	var offsetTop = obj.offsetTop;
	var parentEl = obj.offsetParent;

	while (parentEl!=null){
		offsetTop = offsetTop + parentEl.offsetTop;
		parentEl = parentEl.offsetParent;
	}
	return(offsetTop);
}

function scrollToTop (d) {
	// scroll to the top of the video

	var aa=d.getElementById('ytOvidtype');
	if (aa) {
		var id=aa.getAttribute('cid');
		if (vidtype=='metacafe') {id='FlashWrap';}
		if (vidtype=='g4tv') {id='detail-video-player';}
		if (vidtype=='hulu') {id='player';}
		if (vidtype=='youtube') {id='watch7-video';}
		var ab=d.getElementById(id);

		if (vidtype=='vimeo'&&d.getElementById('wrap')) {
			// new vimeo
			ab = d.getElementsByClassName('vimeo_holder')[0];
		}

		if (ab) {
			document.body.scrollTop = getOffsetTop(ab);
		}
	}
}

function ytControlls () {
	// determine if controlls are being shown for size (youtube)

	var d=getDOM();

	var el = d.getElementById('movie_player');
	if (el&&el.getAttribute('flashvars')) {
		if (el.getAttribute('flashvars').indexOf('autohide=3')!='-1') {
			return false;
		}
	}
	return true;
}

function addCSS (newcss,id) {
	// adds css to head

	var d=getDOM();

	if (!d.head) {return false;}

	var link = d.createElement('style');
	if (id) {
		link.setAttribute('id',id);
		var prevDiv=d.getElementById(id);
		if (prevDiv!=null) {
			d.head.removeChild(prevDiv);
		}
	}
	link.type='text/css';
	link.textContent=newcss;
	d.head.appendChild(link);
}

function removeFromVideo (el) {
	// clone video and clean it (youtube for opera, metacafe, dailymotion)

	if (el==null) {
		var el = document.getElementById('movie_player');
	} else {
		var el = document.getElementById(el);
	}

	// get all vars
	if (el && el.getAttribute('flashvars')!=null && el.getAttribute('yto')==null) {
	} else {
		bug('YTO: flashvars modified earlier or by someone else.');
		return;
	}

	// clone existing video
	var newclone = el.cloneNode(true);

	// insert the new vars into the clone
	if (vidtype=='youtube' && thisbrowser=='opera') {
		var oldvars = el.getAttribute('flashvars');
		var newvars = cleanFlashVars(oldvars.split('&'));
		newclone.setAttribute('flashvars', newvars.join('&'));

		// video acceleration
		// http://helpx.adobe.com/flash/kb/flash-object-embed-tag-attributes.html#main_Using_Window_Mode__wmode__values_
		// direct, gpu, opaque, transparent, window
		var wmode='';
		if (el.getAttribute('wmode') && el.getAttribute('wmode')=='transparent') { wmode='window'; bug('ytO: swapping transparent flash for window'); }
		if (options.Wmode=='true') { wmode='direct'; }
		if (wmode!='') { newclone.setAttribute('wmode', wmode); }
	}

	if (vidtype=='metacafe') {
		// turn off ads - check done in gotOpts
		var oldvars = el.getAttribute('value');
		var newvars = oldvars.replace('adData','xadData');
		newclone.setAttribute('value', newvars);
	}

	// remove the original bits so we can swap in the clone
	var parent = el.parentNode;

	// remove the original video embed
	setTimeout(function(parent, newclone) {
		// remove everything else
		for (var i=parent.children.length-1; i>=0; i--) {
			parent.removeChild(parent.children[i]);
		}

		// add clone
		parent.appendChild(newclone);
	}, 279, parent, newclone);

	bug('ytO: clone inserted');
}

function getView (view) {
	// turn option into a size to translate

	val='large';
	if (view=='exp') val='viewexp';
	//if (view=='view2304') val='hd2304';
	if (view=='1080') val='hd1080';
	if (view=='720') val='hd720';
	if (view=='540') val='hd540';
	if (view=='480') val='large';
	if (view=='360') val='medium';
	if (view=='240') val='small';
	return val;
}

function addOnResize () {
	// create event listener for centering the video on window resize

	var delay = (function(){
		var timer = 0;
		return function(callback, ms) {
			clearTimeout (timer);
			timer = setTimeout(callback, ms);
		};
	})();

	var d=getDOM();
	var thewin=window;

	if (thisbrowser=='firefox') { thewin=unsafeWindow; }
	thewin.onresize = (function() {
		delay(function(){
			var mc=d.getElementById('ytOsettings');
			var md=d.getElementById('ytOvid');
			var me=d.getElementById('ytOcenter');
			var mf=d.getElementById('ytOzoom');
			if ((options.SetView!='default' && options.SetView=='exp' && options.ChangeResView=='false') || (mc && mc.textContent.indexOf('viewexp')!='-1')) {
				bug ('== changeSize from addOnResize');
				changeSize('viewexp');
				if (mf) {ytoZoom('update');}
			} else if (options.SetView!='default' || md || (me && me.textContent!='')) {
				bug ('do_Center');
				do_Center();
			}
		}, 800);
	});
	bug('add on resize added.');
}

function handlePopup (request) {
	// do something with the popup selection

	if (options && !options.VersionsNote) {
		return false;
	}

	if (vidtype=='youtube') {
		if (request=='header'){toggle_header();}
		if (request=='headline'){toggle_headline();}
		if (request=='guide'){toggle_guide();}
		if (request=='sidebar'){toggle_sidebar();}
		if (request=='downloads'){toggle_downloads();}
		if (request=='description'){toggle_description();}
		if (request=='comments'){toggle_comments();}
		if (request=='footer'){toggle_footer();}
		if (request=='playlist'){toggle_playlist();}
		if (request=='cinemize'){do_cinemize();}
		if (request=='loopon'){addLoop();}
		if (request=='loopoff'){stopLoop();}
		if (request=='cinemize') {if (options.Cinemizep=='true'){options.Cinemizep='false';}else{options.Cinemizep='true';}}
	} else {
		// not youtube
		if (request=='header2') {if (options.Header=='true'){options.Header='false';}else{options.Header='true';}}
		if (request=='headline2') {if (options.Headline=='true'){options.Headline='false';}else{options.Headline='true';}}
		if (request=='sidebar2') {if (options.Sidebar=='true'){options.Sidebar='false';}else{options.Sidebar='true';}}
		if (request=='downloads2') {if (options.DownloadLinks=='true'){options.DownloadLinks='false';}else{options.DownloadLinks='true';}}
		if (request=='description2') {if (options.Description=='true'){options.Description='false';}else{options.Description='true';}}
		if (request=='comments2') {if (options.Comments=='true'){options.Comments='false';}else{options.Comments='true';}}
		if (request=='footer2') {if (options.Footer=='true'){options.Footer='false';}else{options.Footer='true';}}
		if (request=='playlist2') {if (options.Playlist=='true'){options.Playlist='false';}else{options.Playlist='true';}}
		if (request=='cinemizep') {if (options.Cinemizep=='true'){options.Cinemizep='false';}else{options.Cinemizep='true';}}

		hideStuff(options);
	}

	bug('ytO: youtube callback: '+ request);

	if (request == 'cinemize' || request == 'cinemizep' || request == 'header' || request == 'headline') {
		bug('doing center from handlepopup');
		do_Center();
	} else if (request=='filton'||request=='filton2') {
		// turn filters on
		if (thisbrowser=='chrome') {
			chrome.extension.sendRequest({greeting: 'yto.js', todo: 'pa-on'}, function() {});
		}
		if (thisbrowser=='safari') {
			setstor.Filtering='true';
			safari.self.tab.dispatchMessage('savePrefs',setstor);
		}
		if (thisbrowser=='opera') {
			setstor.Filtering='true';
		}
		window.location.reload();
	} else if (request=='filtoff'||request=='filtoff2') {
		// turn filters off
		if (thisbrowser=='chrome') {
			chrome.extension.sendRequest({greeting: 'yto.js', todo: 'pa-off'}, function() {});
		}
		if (thisbrowser=='safari') {
			setstor.Filtering='false';
			safari.self.tab.dispatchMessage('savePrefs',setstor);
		}
		if (thisbrowser=='opera') {
			setstor.Filtering='false';
		}
		window.location.reload();
	} else if (request=='filtonce'||request=='filtonce2') {
		// turn filters off
		if (thisbrowser=='chrome') {
			chrome.extension.sendRequest({greeting: 'yto.js', todo: 'pa-once'}, function() {});
		}
		if (thisbrowser=='safari') {
			setstor.Filtering='once';
			safari.self.tab.dispatchMessage('savePrefs',setstor);
		}
		if (thisbrowser=='opera') {
			setstor.Filtering='once';
		}
		window.location.reload();
	} else if (!isNaN(request)||request=='viewex') {
		// resize video

		if (!d) {var d=getDOM();}

		var viewexp = false;
		var ac = d.getElementById('ytOsettings');
		if (ac && ac.textContent.indexOf('viewexp')!='-1') {viewexp = true;}

		options.SetView=request;
		fixOptions(request);
		changeSize(request+'p');
		bug('== changeSize from handlePopup');
		bug(options);

		if (viewexp == true) {
			// zoom in or out on video
			ytoZoom('action');
		}

		if (options.DownloadLinks!='never') {
			// stop polling for standard sizes
			window.clearInterval(waiter4);
		}
	}
}

function fixOptions (what) {
	// for window view mode (firefox)

	var d=getDOM();

	var viewexp=false;

	if (options.SetView=='exp') {viewexp=true;}

	if (what!='viewex'&&viewexp==true) {
		// remove viewexp from options
		options.SetView=what;
	} else if (what=='viewex'&&viewexp==false) {
		// add viewexp to options
		options.SetView='exp';
	}

	if (d.getElementById('ytOsettings')) {d.getElementById('ytOsettings').textContent=JSON.stringify(options);}
}

// -----------------

function cleanFlashVars (parts) {
	// remove and add flashvars (youtube for opera)

	var video_id = undefined;
	var isiframe = inArray('framer=',parts);
	var hasorigin = false;
	var hasplaylist = false;

	var channelpage = false;
	var embedded = false;

	var jparts = JSON.stringify(parts);
	if (jparts.indexOf('el=embedded')!='-1') {embedded=true;}
	if (jparts.indexOf('el=profilepage')!='-1') {channelpage=true;}
	if (jparts.indexOf('origin=')!='-1') {hasorigin=true;}
	bug('embedded: '+embedded+' channelpage: '+channelpage+' hasorigin: '+hasorigin);

	if (jparts.indexOf('twk=immf')!='-1') {
		// already been here, return previous parts
		return parts;
	}

	if (parts.length>0 && parts[0]=='thirdparty') {
		// for embedded on third party pages
		thirdparty = true;
		parts = [];
	}

	if (options.eyoutube=='false' && (embedded==true || isiframe==true || thirdparty==true)) {
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
	}
	parts=newVars;

	if (options.InVideo!='ads') {
		// hide ads
		var newVars = [];
		for (var i = 0; i < parts.length; i++) {
			//console.log(parts[i]);
			if (!/^(iv_|iv3_)/.test(parts[i])) {newVars.push(parts[i]);}
		}
		parts=newVars;
	}
	if (options.InVideo=='all') {
		// hide closed captions
		var newVars = [];
		for (var i = 0; i < parts.length; i++) {
			if (!/^(cc_|cc3_)/.test(parts[i])) {newVars.push(parts[i]);}
		}
		parts=newVars;
	}
	if (options.ControlsTheme!='default') {
		// change player theme
		var newVars = [];
		for (var i = 0; i < parts.length; i++) {
			if (!/^(theme)/.test(parts[i])) {newVars.push(parts[i]);}
		}
		if (options.ControlsTheme=='dark') {newVars.push('theme=dark');}
		if (options.ControlsTheme=='light') {newVars.push('theme=light');}
		parts=newVars;
	}
	if (options.Hide=='true') {
		// hide player controls
		var newVars = [];
		for (var i = 0; i < parts.length; i++) {
			if (!/^(autohide)/.test(parts[i])) {newVars.push(parts[i]);}
		}
		newVars.push('autohide=3');
		parts=newVars;
	}
	if ((options.Cleanup=='true' && options.SetView!='default') || isiframe==true) {
		// we set the view size so hide resize buttons
		var newVars = [];
		for (var i = 0; i < parts.length; i++) {
			if (!/^(enablesizebutton)/.test(parts[i])) {newVars.push(parts[i]);}
		}
		newVars.push('enablesizebutton=0');
		parts=newVars;
	}
	if (options.Cleanup=='true') {
		// hide end screens
		var newVars = [];
		for (var i = 0; i < parts.length; i++) {
			if (!/^(endscreen_module|pprl)/.test(parts[i])) {newVars.push(parts[i]);}
		}
		parts=newVars;
	}

	// native youtube
	if (ytPage=='user') {
		// must be a user or channel page
		if (options.AutoPlay=='nobuff') {
			parts.push('autoplay=0');
		} else if (options.AutoPlay=='no') {
			// youtube channel pre-buffer pause
			parts.push('pauseit=0');
		}
	}
	if (options.Cleanup=='true' && options.SetView!='default') {
		// hide native resize buttons
		parts.push('enablesizebutton=0');
	}

	//
	// add parts
	//

	// allow full-screen
	parts.push('twk=immf', 'fs=1');

	if (options.SetRes!='default') {
		// view quality
		if (options.SetRes=='240') {parts.push('vq=small');}
		if (options.SetRes=='360') {parts.push('vq=medium');}
		if (options.SetRes=='480') {parts.push('vq=large');}
		if (options.SetRes=='720') {parts.push('vq=hd720');}
		if (options.SetRes=='1080') {parts.push('vq=hd1080');}
	}

	//console.log(parts);

	// give back trimmed flashvars
	return parts;
}

function reverseString (string) {
    var reversedString = "";
    var stringLength = string.length - 1;
    for (var i = stringLength; i >= 0; i--) {
        reversedString += string[i];
    }
    return reversedString;
}

function sizeFromItag (url,ytVidType) {
	// determine video size and format from url (youtube)

	// get the signature and itag, because they could be anywhere

	var sig='';
	if (url.indexOf('sig=')!='-1') {
		sig = url.split('sig=')[1].split('&')[0];
		url = url.replace('sig=','signature=');
	}
	if (url.indexOf('signature=')!='-1') {
		sig = url.split('signature=')[1].split('&')[0];
	}

	// make sure we have the essentials
	if (sig=='' || url.indexOf('itag=')=='-1' || url.indexOf('url=')=='-1') {return false;}

	// get itag
	var itag = url.split('itag=')[1].split('&')[0];

	// get the base url
	url = url.split('url=')[1];
	url = url.substring(0,url.length);

	// make sure the signature did not get trimmed off and spelled correctly
	if (url.indexOf('signature=')=='-1') {url+='&signature='+sig;}

	// obfuscation
	var parts = url.split('&itag=');
	if (parts.length>2 || (url.indexOf('?itag=')!='-1' && url.indexOf('&itag=')!='-1')) {
		//console.log('reducing itags: &itag='+itag);
		url = url.replace('&itag='+itag,'');
	}
	//console.log(url);

	// get signature
	var thesig = url.split('signature=')[1].split('&')[0];

	// default
	var rez = new Array('Unknown','Unknown',url);

	// 3D webem
	if (itag==102) { rez = ['720p','3D-MP4',url,720,itag,thesig]; }
	if (itag==101) { rez = ['480p','3D-WebM',url,480,itag,thesig]; }
	if (itag==100) { rez = ['360p','3D-MP4',url,360,itag,thesig]; }

	// webem
	if (itag==46) { rez = ['1080p','WebM',url,1080,itag,thesig]; }
	if (itag==45) { rez = ['720p','WebM',url,720,itag,thesig]; }
	if (itag==44) { rez = ['480p','WebM',url,480,itag,thesig]; }
	if (itag==43) { rez = ['360p','WebM',url,360,itag,thesig]; }

	// 3D mp4
	if (itag==84) { rez = ['720p','3D-WebM',url,720,itag,thesig]; }
	if (itag==85) { rez = ['520p','3D-WebM',url,520,itag,thesig]; }
	if (itag==82) { rez = ['360p','3D-WebM',url,360,itag,thesig]; }
	if (itag==83) { rez = ['240p','3D-MP4',url,240,itag,thesig]; }

	// mp4
	if (itag==38) { rez = ['3072p','MP4',url,2304,itag,thesig]; }
	if (itag==37) { rez = ['1080p','MP4',url,1080,itag,thesig]; }
	if (itag==22) { rez = ['720p','MP4',url,720,itag,thesig]; }
	if (itag==18) { rez = ['360p','MP4',url,360,itag,thesig]; }

	// flv
	if (itag==120) { rez = ['720p','FLV',url,720,itag,thesig]; }
	if (itag==35) { rez = ['480p','FLV',url,480,itag,thesig]; }
	if (itag==34) { rez = ['360p','FLV',url,360,itag,thesig]; }
	if (itag==6) { rez = ['270p','FLV',url,270,itag,thesig]; }
	if (itag==5) { rez = ['240p','FLV',url,240,itag,thesig]; }

	// 3gp
	if (itag==36) { rez = ['240p','3GP',url,240,itag,thesig]; }
	if (itag==17) { rez = ['144p','3GP',url,144,itag,thesig]; }
	if (itag==13) { rez = ['Mobile','3GP',url,'Mobile',itag,thesig]; }

	return rez;
}

function deCode (url) {
	// de-obfuscate url

	return (unescape(url).replace(/%3A/g,':').replace(/%2C/g,',').replace(/%2F/g,'/').replace(/%3F/g,'?').replace(/%3D/g,'=').replace(/%25/g,'%').replace(/%26/g,'&').replace(/%3B/g,';').replace(/\\u0026/g,'&'));
}

// -----------------
// others
// -----------------

function makeDLContainer (label) {
	// create download links div (all others)

	if (!label) {
		var label = 'Download: ';
	}

	var d=getDOM();
	var links = d.createElement('div');
	links.setAttribute('id','ytOlinks');

	var link = d.createElement('span');
	link.textContent=label;
	links.appendChild(link);

	return links;
}

function makeDLLink (div,url,title) {
	// create download links div (all others)

	var link = document.createElement('a');
	link.setAttribute('href',url);
	link.textContent=title;
	link.setAttribute('title','Right-click and Save link as...');
	link.setAttribute('style','margin-left: 10px;');

	return div.appendChild(link);
}

function cleanVimeoValue (bit) {
	// clean url for downloads (vimeo)

	var vval = '';
	var parts = bit.split(':');
	var bits = parts.length;
	vval = parts[bits-1].replace(/\"/g,'').replace(/\[/g,'');

	return vval;
}

function makeDLlinks (vidtype) {
	// make download links (all others)

	var d=getDOM();

	if (d.getElementById('ytOlinks') != null) {
		bug('ytO: download links already exist');
		return false;
	}

	if (vidtype=='vimeo') {
		var parts = d.getElementsByTagName('script');
		var parent = d.getElementById('video_player');

		var pile = '';
		for (var i=0;i<parts.length;i++){
			if (parts[i].innerHTML.search('player_url')!='-1') {
				pile=parts[i].innerHTML.split(']}}')[0];
			}
		}

		if (pile!='' && parent) {
			var parts = pile.split(',');
			var downurl, downid, downtime, downsig, downhd, downsd, downmob;
			var downtest;
			for (var i=0;i<parts.length;i++){
				if (parts[i].search('"player_url"')!='-1') {
					downurl=cleanVimeoValue(parts[i]);
				}
				if (parts[i].search('"id"')!='-1') {
					downid=cleanVimeoValue(parts[i]);
				}
				if (parts[i].search('"timestamp"')!='-1') {
					downtime=cleanVimeoValue(parts[i]);
				}
				if (parts[i].search('"signature"')!='-1') {
					downsig=cleanVimeoValue(parts[i]);
				}
				if (parts[i].search('"h264"')!='-1') {
					downhd=cleanVimeoValue(parts[i]);
				}
				if (parts[i].search('"sd"')!='-1') {
					downsd=cleanVimeoValue(parts[i]);
				}
				if (parts[i].search('"mobile"')!='-1') {
					downmob=cleanVimeoValue(parts[i]);
				}
			}

			var bail=0;
			var downstring;
			var downhds, downsds, downmobs;

			if (d.getElementById('wrap')) {
				// new
				bail=1;
			} else {
				// orig
				if (downurl!=null){
					downstring = 'http://'+ downurl +'/';
				} else { bail=1; }
				if (downid!=null){
					downstring += 'play_redirect?clip_id='+ downid;
				} else { bail=1; }
				if (downsig!=null){
					downstring += '&sig='+ downsig;
				} else { bail=1; }
				if (downtime!=null){
					downstring += '&time='+ downtime;
				} else { bail=1; }
			}

			if (bail<1 && downstring!=null && parent) {
				// create download links div
				var links = makeDLContainer();

				if (downhd!=null){
					url = downstring+'&quality='+ downhd;
					links.appendChild(makeDLLink (links,url,'HD'));
				}
				if (downsd!=null){
					url = downstring+'&quality='+ downsd;
					links.appendChild(makeDLLink (links,url,'SD'));
				}
				if (downmob!=null){
					url = downstring+'&quality='+ downmob;
					links.appendChild(makeDLLink (links,url,'Mobile'));
				}
				if (downtest!=null){
					url = downstring+'&quality='+ downtest;
					links.appendChild(makeDLLink (links,url,'Test'));
				}

				// append download div to movie
				parent.appendChild(links);
			}
		}else{console.log('ytO: could not find links or place to append them');}
	}
	if (vidtype == 'funny') {
		var linksSource=d.getElementsByTagName('source');
		var parent = d.getElementById('thumb');

		if (linksSource[0] && parent) {

			// create download links div
			var links = makeDLContainer();

			var found = 0;

			for (var i=0;i<linksSource.length;i++){
				var url = linksSource[i].getAttribute('src');

				var title='Download';
				if (url.search('.mp4')!='-1') { title='MP4'; }
				if (url.search('.3gp')!='-1') { title='3GP'; }
				if (url.search('.mov')!='-1') { title='MOV'; }

				if (url.search('http')!='-1') {
					links.appendChild(makeDLLink (links,url,title));
					found = 1;
				}
			}

			if (found != 0) {
				// append download div to movie
				parent.appendChild(links);
			}
		}else{console.log('ytO: could not find links or place to append them');}
	}
	if (vidtype == 'dailymotion') {
		var linksSource = d.getElementById('video_player').children[0];
		var parent = d.getElementById('video_player').parentNode;

		if (linksSource != null && linksSource.childNodes[4] && linksSource.childNodes[4].name=='flashvars' && linksSource.childNodes[4].value && parent) {
			var oldvars = linksSource.childNodes[4].value;
			parts = unescape(oldvars).replace(/%3A/g,':').replace(/%2C/g,',');

			parts = parts.split(',');

			var haystack = new Array('videoTitle','ldURL','sdURL','hqURL','hd720URL','hd1080URL');

			// create download links div
			var links = makeDLContainer();

			var found = 0;

			for (var i=0;i<parts.length;i++){
				if (inArray(parts[i],haystack)) {
					guts = parts[i].split('":"');
					guts = guts[1].split('"');
					guts = guts[0];
					if (guts.search('http')!='-1') {
						url = guts.replace(/\//g,'').replace(/\\/g,'/');

						title = url.split('cdn/')[1];
						title = title.split('/')[0];

						links.appendChild(makeDLLink (links,url,title));
						found = 1;
					} else {
						part = guts.replace(/\+/g,' ').replace(/\\/g,'');
					}
				}
			}

			if (found != 0) {
				// append download div to movie
				parent.appendChild(links);
			}
		}else{console.log('ytO: could not find links or place to append them');}
	}
	if (vidtype == 'g4tv') {
		var links = d.getElementById('video-player');
		var parent = d.getElementById('video');

		if (links!=null && parent) {
			var linksSource = unescape(links.innerHTML);

			if (linksSource.search(/videodb/i)!='-1') {
				var parts = linksSource.split("src=\'");
				var parts = parts[1].split("\'");

				var base = parts[0];

				if (base.length!=0) {
					// create download links div
					var links = makeDLContainer();

					var url = base;
					var title = 'MP4';
					links.appendChild(makeDLLink (links,url,title));

					var base = base.split('_iphone.mp4');

					url = base[0]+'_flv.flv';
					title = 'SD';
					links.appendChild(makeDLLink (links,url,title));

					url = base[0]+'_flvhd.flv';
					title = 'HD';
					links.appendChild(makeDLLink (links,url,title));

					// append download div to movie
					parent.appendChild(links);
				}
			}
		}else{console.log('ytO: could not find links or place to append them');}
	}
	if (vidtype == 'metacafe') {
		var bodytext = unescape(d.body.innerHTML);

		var parts = bodytext.split('"mediaURL":"');
		var parent = d.getElementById('ItemContainer');

		if (parts.length>0 && parent) {
			var arr = new Array();
			for (var i=0;i<parts.length;i++){
				if (parts[i].search('"key"')!='-1') {
					var bit = parts[i];
					if (bit.search('}}')!='-1') {
						bit = bit.split('}}')[0];
					}
					var line = bit.replace(/\+/g,' ').replace(/\\/g,'');
					arr.push(line);
				}
			}

			// remove duplicates
			var arr2 = new Array();
			arr2 = unique(arr);

			if (arr2.length>0) {
				// create download links div
				var links = makeDLContainer();

				for (var i=0;i<arr2.length;i++){
					var line = arr2[i];
					var url = line.split('"')[0];
					var key = line.split('key":"')[1].split('"')[0];

					var url = url+'?__gda__='+key;

					var title = 'HD';
					if (line.search('highDefinitionMP4')!='-1') {
						title = 'Standard';
					}

					links.appendChild(makeDLLink (links,url,title));
				}

				// append download div to movie
				parent.appendChild(links);

				if (d.getElementById('MainCol')) {d.getElementById('MainCol').style.marginTop='20px';}
			}
		}else{console.log('ytO: could not find links or place to append them');}
	}
	if (vidtype == 'dump') {
		var bodytext = d.body.innerHTML;
		var parts = bodytext.split('file=');
		var base=d.getElementById('ytOvidtype');
		if (parts[1] && base) {
			var parent=d.getElementById('player');
			parts = parts[1].split('">');
			if (parts[0]) {
				var url = parts[0];
				var title = nameFromPath (url);
			}
			if (title!=null && url!=null) {
				// create download links div
				var links = makeDLContainer();
				links.appendChild(makeDLLink (links,url,title));

				// append download div to movie
				parent.appendChild(links);
			}
		}else{console.log('ytO: could not find links or place to append them');}
	}
	if (vidtype == 'hulu') { }
	if (vidtype == 'escapist') { }
	if (vidtype == 'ph') {
		var bodytext = d.body.innerHTML;
		var parts = bodytext.split('video_url=');
		var parent = d.getElementById('playerDiv_1');

		if (parts.length>1 && parent) {
			parts = parts[1].split('&amp;');
			var url = deCode(parts[0]);
			var title = nameFromPath (url);

			if (title!=null && url!=null && url.indexOf('flv')!='-1') {
				// create download links div
				var links = makeDLContainer();
				links.appendChild(makeDLLink (links,url,title));

				// append download div to movie
				parent.parentNode.insertBefore(links,parent.nextSibling);
			}else{console.log('ytO: no title or url');}
		}else{console.log('ytO: could not find links or place to append them');}
	}
	if (vidtype == 't8') { }
	if (vidtype == 'xvid') {
		if (d.getElementById('flash-player-embed')) {
			var el = d.getElementById('flash-player-embed').getAttribute('flashvars');
			var url = el.split('flv_url=')[1].split('&url_bigthumb')[0];
			var url1=unescape(url);
		}

		if (d.getElementById('player')) {
			var bodytext = d.getElementById('player').innerHTML;
			if (bodytext.indexOf('3GP')!='-1') {
				var url2 = bodytext.split('3GP||')[1].split('|| ')[0];
			}
		}
		var parent = d.getElementById('player').parentNode;
		if ((url1!=null || url2!=null) && parent) {
			// create download links div
			var links = makeDLContainer();

			if (url2!=null) { links.appendChild(makeDLLink (links,url2,'MP4')); }
			if (url1!=null) { links.appendChild(makeDLLink (links,url1,'FLV')); }

			// append download div to movie
			parent.appendChild(links);
		}else{console.log('ytO: could not find links or place to append them');}
	}
}

// -----------------
// youtube
// -----------------

function getYTmedialinks (movieDiv,ytVidType) {
	// get youtube media links (for download)

	if (!movieDiv) {
		console.log('ytO: video not found for download links');
		return false;
	}

	var linksSource = deCode(movieDiv.innerHTML);

	var parts = linksSource.split('url_encoded_fmt_stream_map=');
	// localized version
	if (linksSource.indexOf('url_encoded_fmt_stream_map%3D')!='-1') {parts = linksSource.split('url_encoded_fmt_stream_map%3D');}
	// html5 version
	if (ytVidType=='html5') {parts = linksSource.split('url_encoded_fmt_stream_map": "');}

	if (!parts[1]) {console.log('ytO: stream_map for download links is missing');return false;}

	// start looking here
	var theparts = parts[1];

	// de-obfuscate localized version
	if (theparts.indexOf('\u0026')!='-1') {theparts = theparts.replace(/\\u0026amp;/g,'&amp;').replace(/%3D/g,'=');}

	// get the meat with the urls
	parts = theparts.split('&amp;')[0];
	if (ytVidType=='html5') {parts = theparts.split('", "')[0];}

	// determine the delimiter
	if (parts.indexOf('=')=='-1') {return false;}
	var thediv = parts.split('=')[0]+'=';

	// get an array of videos
	var parts = (','+parts).split(','+thediv);
	if (parts.length<2) {return false;}

	// create array of right links
	var arr = new Array();
	for (var i=1;i<parts.length;i++) {
		// put the entry back together
		var thispart = thediv+parts[i]; // .replace(/,/g,'%2C');
		// verify the entry has basic needs met
		if (thispart.indexOf('videoplayback')!='-1' && thispart.indexOf('itag=')!='-1' && thispart.indexOf('sig=')!='-1') {
			arr.push(thispart);
		}
	}
	//console.log(arr);

	// remove duplicate entries
	var arr = unique(arr);

	if (arr.length==0) {return false;}

	// create array of resolutions, links, and formats
	var arr2 = new Array();
	for (var i=0;i<arr.length;i++){
		var vid = sizeFromItag(arr[i],ytVidType);
		if (vid) {arr2.push(vid);}
	}
	// console.log(arr2);

	// sort by format and resolution
	arr=arr2.sort(function(a, b){
		if(a[1]===b[1]){
			if(a[3]===b[3]) return 0;
			return a[3]<b[3]? 1:-1;
		}
		return a[1]<b[1]? 1:-1;
	});

	return arr;
}

function makeLinks (movieDiv,ytVidType) {
	// make download links (youtube)

	if (!movieDiv) {
		console.log('ytO: video not found for download links');
		return false;
	}

	var arr = getYTmedialinks(movieDiv,ytVidType);

	if (arr && arr.length!=0) {
		// create download links div

		var d=getDOM();

		var links = document.createElement('div');
		links.setAttribute('id','ytOlinks');

		// fix name of saved video
		var vidTitle = 'YouTube video';

		if (d.getElementById('watch-headline-title')) {
			// normal and watch7
			vidTitle = trim(d.getElementById('watch-headline-title').textContent);
		}
		if (d.getElementById('vt')) {
			// feather
			vidTitle = trim(d.getElementById('vt').textContent);
		}

		if (vidTitle != 'YouTube video') {
			// cleanup title
			vidTitle = vidTitle.replace(/[\n\r]/g, '').replace(/ +(?= )/g,''); // remove carriage returns and multiple spaces
			vidTitle = vidTitle.replace(/\"/g,'').replace(/\'/g,'').replace(/http:\/\//g,'').replace(/\//g,'-');
			vidTitle = vidTitle.replace(/:/g,'-').replace(/ ,/g,', ').replace(/ , /g,', ');
			//console.log(vidTitle);
		}

		var curfmt = '';
		var noshow=[];
		var kinds=5;

		if (options.Hwebm=='true') {noshow.push('WebM');kinds--;}
		if (options.Hmp4=='true') {noshow.push('MP4');kinds--;}
		if (options.Hflv=='true') {noshow.push('FLV');kinds--;}
		if (options.H3gp=='true') {noshow.push('3GP');kinds--;}
		if (options.H3d=='true') {noshow.push('3D-WebM','3D-MP4');kinds--;}

		var ac = d.getElementById('ytOvidtype');
		var aa = ac.getAttribute('cid');
		var ab = d.getElementById(aa);
		if (noshow.length>5 && ac) {
			// do not create download links because none were wanted
			ab.style.paddingBottom='14px';

			return false;
		}

		var linksadded=0;

		for (var i=0;i<arr.length;i++) {
			// create links

			var url = arr[i][2];
			var def = arr[i][0];
			var fmt = arr[i][1];

			if (! inArray(fmt, noshow)) {
				if (fmt != curfmt && kinds>1) {
					curfmt = fmt;
					var link = document.createElement('span');
					link.textContent=fmt;
					links.appendChild(link);
				}

				var link = document.createElement('a');
				link.setAttribute('href',url+'&title='+encodeURIComponent(vidTitle+'-'+def));
				link.textContent=def;
				link.setAttribute('title',def+' '+fmt);
				links.appendChild(link);

				// keep track of number of links made
				linksadded++;
			}
		}

		if (linksadded>0) {
			// append download div to movie
			if (ytType=='normal') {
				var parent = d.getElementById('watch-player').parentNode;
				parent.appendChild(links);
			}
			if (ytType=='watch7') {
				var parent = d.getElementById('watch7-player').parentNode;
				parent.insertBefore(links, d.getElementById('watch7-player').nextSibling);
			}
			if (ytType=='feather') {
				var parent = d.getElementById('p').parentNode;
				d.getElementById('lc').insertBefore(links, d.getElementById('p').nextSibling);
			}

			// fix spacing because it is missing a label
			if (kinds==1) {d.getElementById('ytOlinks').firstChild.style.paddingLeft='18px';}

			bug('ytO: download links created for '+ ytVidType +': '+ vidTitle);
		} else {
			// do not create download padding because none were added
			ab.style.paddingBottom='14px';
		}
	} else {
		console.log('ytO: reference material for download links is missing');
	}
}

function do_DownloadLinks (ytVidType) {
	// get source for download links (youtube)

	var d=getDOM();

	if (d.getElementById('ytOlinks') != null) {
		bug('ytO: download links already exist');
		return;
	}

	// create download links
	var aa = d.getElementById('ytOvidtype');
	if (aa && options.DownloadLinks!='never') {
		// get type of youtube
		var links = d.getElementById(aa.getAttribute('vid'));
	} else {
		// type of youtube has not been identified yet
		return false;
	}

	if (ytVidType=='html5') {
		var links = d.body;
	}

	makeLinks(links,ytVidType);
}

function do_AutoPlay (player,ytVidType) {
	// disable autoplay (youtube)

	var d=getDOM();
	var loc = window.location.href;

	var timeset1 = false;
	var timeset2 = false;
	var inplaylist = false;
	var islive = false;

	// if t= is set, go home
	// if liveplayback, go home
	// if default, go home
	// if inplaylist is true and nobufflist or playlist, go home

	var el = d.getElementById('movie_player');
	if (ytVidType=='flash' && el && el.getAttribute('flashvars') && el.getAttribute('flashvars').indexOf('live_playback=1')!='-1') { islive = true; }

	if (loc.indexOf('&list=')!='-1') { inplaylist = true; }
	if (loc.indexOf('#t=')!='-1') { timeset1 = true; }
	if (loc.indexOf('&t=')!='-1') { timeset2 = true; }

	if (options.AutoPlay=='default' || islive==true) {
		// do not pause or nobuff
		return false;
	}
	if ((timeset1==true || timeset2==true) && options.IgnoreTime=='true') {
		// do not pause or nobuff
		return false;
	}

	if (ytVidType=='flash') {
		if (options.AutoPlay=='no' || (options.AutoPlay=='playlist' && inplaylist==false)) { player.pauseVideo(); }
		if (options.AutoPlay=='nobuff' || (options.AutoPlay=='nobufflist' && inplaylist==false)) { player.stopVideo(); }
	} else {
		// html5
		if (options.AutoPlay=='no' || (options.AutoPlay=='playlist' && inplaylist==false)) {
			player.pause();
			if (timeset1==false && timeset2==false) { player.currentTime=0; }
		}
	}

	bug('ytO: autoplay disabled for '+ ytVidType);
}

function getRes (res,ytVidType) {
	// highres,hd1080,hd720,large,medium,small
	// 240 = small: 320px by 240px.
	// 360 = medium: 640px by 360px.
	// 480 = large: 854px by 480px.
	// 720 = hd720: 1280px by 720px.
	// 1080 = hd1080: 1920px by 1080px.
	// highres = hd2304: 4096px by 2304px.

	var val='NaN';

	if (ytVidType=='flash') {
		// flash
		if (res=='highres') val='highres';
		if (res=='1080') val='hd1080';
		if (res=='720') val='hd720';
		if (res=='480') val='large';
		if (res=='360') val='medium';
		if (res=='240') val='small';
	} else {
		// html5
		if (res=='highres') val='1080p';
		if (res=='1080') val='1080p';
		if (res=='720') val='720p';
		if (res=='480') val='480p';
		if (res=='360') val='360p';
	}
	return val;
}

function isCinema () {
	// determine if video has been cinemized (youtube)

	var d=getDOM();
	if (vidtype=='youtube') {
		var aa = d.getElementById('movie_player');
		var ab = d.getElementById('ytOvidtype');

		// get type of youtube
		if (ab) {var aa = d.getElementById(ab.getAttribute('vid'));}
		if (aa==null) {return false;}

		if ((d.getElementById('ytOcss') && d.getElementById('ytOcss').textContent!='')) {
			return true;
		}
	} else {
		// all others
		if (options.Cinemizep=='true') {return true;}
	}
	return false;
}

function getDOM() {
	// the DOM is different in firefox

	if (thisbrowser=='firefox') { return content.document; } return document;
}

function setResolution (val,ytVidType) {
	// change display resolution (youtube)

	var player = getPlayer(ytVidType);
	if (!player) {
		// could not find movie_player to change resolution (html5?)
		bug('could not find movie_player to change resolution (html5?)');
		return false;
	}

	if (ytVidType=='flash') {
		// flash

		if (thisbrowser=='firefox'&&unsafeWindow._gel) { player = unsafeWindow._gel('movie_player'); }

		// (try to) set resolution to preference size
		player.setPlaybackQuality(val);

		// determine what it actually got set to
		var mode = player.getPlaybackQuality();

		// get available video sizes
		var quals = player.getAvailableQualityLevels();
	} else {
		// html5
	}

	if (mode==null) {
		// didnt get what we wanted from the api, so default to wanted size
		var mode=val;
	}

	bug('ytO: wanted: '+ val +' got: '+ mode + ' from: '+ quals);

	if (options.ChangeResView=='true') {
		// change viewing area size based on selected video resolution
		bug('ytO: changing size from res');
		bug('== changeSize from setResolution');
		changeSize(mode);
	}
}

function isPlaylistURL () {
	// determine if playlist is being shown (youtube)

	var d=getDOM();
	if (d.URL.indexOf('list=')!='-1') {
		return true;
	}
	return false;
}

function getPlayer(ytVidType) {
	// return the player object (youtube)

	if (ytVidType=='flash') {
		var player = document.getElementById('movie_player');
		if (thisbrowser=='firefox'&&unsafeWindow._gel) { player = unsafeWindow._gel('movie_player'); }
	} else {
		// html5
		var bits = document.getElementsByTagName('video');
		if (bits.length>0) {
			for (var i=0; i<bits.length; i++ ) {
				if (bits[i].className.indexOf('html5-main-video')!='-1') {
					player = bits[i];
				}
			}
		}
	}
	if (player) {
		return player;
	}
	bug('--------- no player found ---------');
	return false;
}

function setVolume (volume) {
	// set the youtube volume

	var ytVidType=vidKind();

	// get player object to loop
	var player=getPlayer(ytVidType);

	if (player && typeof(player)=='object') {
		var volGood = true;
		var volCount = 0;
		var volWait = setInterval(function(){
			try {player.setVolume(volume);}
			catch(err){volGood=false;volCount++;}
			if (volGood==true) {clearTimeout(volWait); console.log('YTO: setting volume: '+volume);}
			if (volCount>181) {clearTimeout(volWait); console.log('YTO: cant set volume');}
			console.log(volCount);
		},18);
	}
}

function stopLoop () {
	// stop the looping madness!

	bug('stop loop!');
	clearInterval(waiter2);
	waiter2=undefined;
}

function addLoop (ytVidType) {
	// listener for looping video (youtube)

	if (waiter2) {
		bug('waiter2 already set');
		return false;
	}

	bug('adding video loop waiter');
	if (vidtype!='youtube') {
		bug ('addLoop is not youtube');
		return false;
	}

	if (!ytVidType) {
		// flash or html5
		var ytVidType=vidKind();
	}

	// get player object to loop
	var player=getPlayer(ytVidType);

	if (ytVidType=='flash') {
		waiter2 = setInterval(function () {
			if (player) {
				if (!player.getPlayerState) {
					stopLoop ();
				} else if (player.getPlayerState() == 0) {
					bug('restarting flash video');
					player.playVideo();
				}
			}
		},180);
	} else {
		// html5
		waiter2 = setInterval(function () {
			if (player.ended==true) {
				bug('restarting html5 video');
				player.play();
			}
		},180);
	}
}

function newWait (ytVidType) {
	// loop for trying to remove ads n whatnot (youtube)

	var hangcount = 0;
	var d=getDOM();

	waiter = setInterval(function () {
		var isshowingplist=isPlaylistURL();
		if (ytVidType=='flash') {
			// flash
			var player = getPlayer(ytVidType);
			try {
				var pstate=0;
				pstate=player.getPlayerState();
				bug('flash playerstate:'+ pstate);
				if (pstate == 1) {
					// set resolution, and adjust display size if sync is set
					// must be done before autoplay because of turning off buffering
					if (options.SetRes!='default') {
						var valRes=getRes(options.SetRes,ytVidType);
						setResolution(valRes,ytVidType);
					}

					// must be done after setres because of turning off buffering
					if (options.AutoPlay!='default') {
						// pause or nobuff
						do_AutoPlay(player,ytVidType);
					}

					// add replay event
					if (options.Loop=='true' && isshowingplist==false) { addLoop(); }

					// done
					clearInterval(waiter);
				}
			} catch(err){}
		} else {
			// html5
			if (options.SetRes!='default') {
				var valRes=getRes(options.SetRes,ytVidType);
				setResolution(valRes,ytVidType);
			}
			if (options.AutoPlay=='default') {
				// done
				clearInterval(waiter);
			} else {
				var player = getPlayer(ytVidType);
				if (player && player.currentTime > 0) {
					bug('trying to turn off html5 autoplay');
					do_AutoPlay(player,ytVidType);

					// done
					clearInterval(waiter);
				}
			}

			// add replay event
			if (options.Loop=='true' && isshowingplist==false) { addLoop(); }
		}

		// increment loop stats
		hangcount++;
		bug('ytO hangcount: '+hangcount);

		if (hangcount>180) {
			bug('ytO: giving up looking for player functions: '+hangcount);
			clearInterval(waiter);
		}
	},180);
}

// -----------------

function getStyle(what) {
	// determine current style of object

	if (thisbrowser=='opera') {
		return document.defaultView.getComputedStyle(what,null);
	}
	return getComputedStyle(what,null);
}

function getDisplay (what) {
	// determine if object is being displayed

	var d=getDOM();
	var a=d.getElementById(what);
	if (a) {
		return getStyle(a).getPropertyValue('display');
	}
	return 'NaN';
}

function toggleOff (what) {
	// hide object

	var d=getDOM();
	var id = d.getElementById(what);
	if (id) {
		// special case for playlist
		var aa = d.getElementById('page-container');
		var ab = d.getElementById('watch7-container');
		if (what=='watch7-playlist-container' && ab && ab.className.indexOf('branded')!='-1' && options.Cleanup=='false') {
			if (aa) {aa.style.marginTop='50px';}
		}

		// special case for youtube guide on non-watch pages
		var aa = d.getElementById('content');
		if (aa && what=='guide' && ytPage!='watch') {
			if (options.Cleanup=='true') {
				aa.style.margin='0 auto';
			} else {
				aa.style.marginLeft='0';
			}
		}

		// special case for footer
		if (what=='footer-hh-container') {
			d.getElementById('page-container').style.paddingBottom=0;
		}

		id.style.display='none';
	} else if (typeof(what)!='string') {
		what.style.display='none';
	}
}

function toggleOn (what) {
	// show object

	var d=getDOM();
	var id = d.getElementById(what);

	if (id) {
		// special case for playlist
		var aa = d.getElementById('page-container');
		var ab = d.getElementById('watch7-container');
		if (what=='watch7-playlist-container' && ab && ab.className.indexOf('branded')!='-1' && options.Cleanup=='false') {
			if (aa) {aa.style.marginTop='';}
		}

		// special case for youtube guide on non-watch pages
		if (what=='guide' && ytPage!='watch') {
			d.getElementById('content').style.marginLeft='180px';
		}

		// special case for footer
		if (what=='footer-hh-container') {
			d.getElementById('page-container').style.paddingBottom='153px';
		}

		id.style.display='block';
	} else if (typeof(what)!='string') {
		what.style.display='block';
	}
}

function toggle (what) {
	// show or hide object

	var d=getDOM();
	var id = d.getElementById(what);
	var yclass = d.getElementsByClassName(what);

	if (id) {
		if (id.style.display!='none') {
			toggleOff(what);
		} else {
			toggleOn(what);

			// special case for youtube playlist
			if (what=='watch7-playlist-container') {
				var aa = d.getElementById('watch7-container');
				if (aa && aa.className.indexOf('watch-playlist')!='-1' && aa.className.indexOf('watch-playlist-collapsed')!='-1') {
					aa.className = aa.className.replace(' watch-playlist-collapsed','');
				}
			}
		}
	} else if (yclass && yclass[0]) {
		for (var j=0;j<yclass.length;j++){
			var current=getStyle(yclass[j]).getPropertyValue('display');
			if (current=='none') {
				toggleOn(yclass[j]);
				bug('class on: '+what);
			} else {
				toggleOff(yclass[j]);
				bug('class off: '+what);
			}
		}
	} else {
		bug(what+' doesnt exist');
	}
}

function toggle_header () {
	if (ytType=='normal') {
		toggle('masthead-container'); toggle('ticker'); toggle('yt-masthead-container');
	}
	if (ytType=='watch7') {
		toggle('yt-masthead-container'); toggle('gb'); toggle('gbz'); toggle('gbx1'); toggle('gbx3');
	}
	if (ytType=='feather') {
		toggle('mh');
	}
}
function toggle_headline () {
	if (ytType=='normal') {
		toggle('watch-headline-container');
		toggle('branded-page-header');
	}
	if (ytType=='watch7') {
		toggle('watch7-headline');
	}
	if (ytType=='feather') {
		toggle('vt');
		toggle('ud');
	}
}
function toggle_guide () {
	toggle('guide');
}
function toggle_sidebar () {
	if (ytType=='normal') {
		// could be homepage
		toggle('watch-sidebar');
	}
	if (ytType=='watch7') {
		toggle('watch7-sidebar');
	}
	if (ytType=='feather') {
		toggle('rc');
	}
	// youtube home page
	toggle('video-sidebar');
	// youtube user page
	toggle('secondary-pane');
}
function toggle_description () {
	if (ytType=='normal') {
		toggle('watch-panel');
	}
	if (ytType=='watch7') {
		if (options.Cleanup=='false') {
			toggle('watch7-user-header');
			toggle('watch7-action-buttons');
		//} else {
			// handled by the click-to-show bar
		}
		toggle('watch7-action-panels');
	}
	if (ytType=='feather') {
		toggle('vc');
		toggle('vo');
		toggle('de');
		toggle('ded');
	}
	makeSidebarStay();
}
function toggle_comments () {
	if (ytType=='normal') {
		toggle('watch-discussion');
	}
	if (ytType=='watch7') {
		toggle('watch7-discussion');
	}
	if (ytType=='feather') {
		toggle('cm');
	}
	makeSidebarStay();
}
function toggle_footer () {
	if (ytType=='normal') {
		toggle('footer-container');
		// could be homepage
		toggle('footer-hh-container');
	}
	if (ytType=='watch7') {
		toggle('footer-container');
		toggle('footer-hh-container');
	}
	if (ytType=='feather') {
		toggle('ft');
	}
}
function toggle_playlist () {
	if (ytType=='normal') {
		toggle('quicklist'); toggle('playlist-bar'); if (options.viewexp=='true') {changeSize('viewexp');}
	}
	if (ytType=='watch7') {
		// new youtube interface
		toggle('watch7-playlist-container');
	}
}

function toggle_downloads () {toggle('ytOlinks'); makeSidebarStay();}

function do_cinemize () {
	// hide everything (youtube)

	var d=getDOM();

	if (d.getElementById('ytOcss') && d.getElementById('ytOcss').textContent!='') {
		un_cinemize();
		return false;
	}

	var newcss = '';

	if (ytType=='normal') {
		// header
		toggleOff('masthead-container'); toggleOff('ticker'); toggleOff('yt-masthead-container');
		// headline
		toggleOff('watch-headline-container'); toggleOff('branded-page-header');
		// sidebar
		toggleOff('watch-sidebar');
		toggleOff('video-sidebar'); // youtube home page
		toggleOff('secondary-pane'); // youtube user page
		// downloads
		toggleOff('ytOlinks');
		// description
		toggleOff('watch-panel');
		// comments
		toggleOff('watch-discussion');
		// footer
		toggleOff('footer-container');
		toggleOff('footer-hh-container');
		// playlist
		toggleOff('quicklist'); toggleOff('playlist-bar');

		newcss += '#watch-player {margin: 0 auto;} #watch-video.has-ad {left:0 !important;} ';

		newcss += '.watch-branded #watch-main-container, #masthead-container {background-color: transparent !important; background: none;} ';

		newcss += '#page.watch-branded #watch-channel-discoverbox, #watch-channel-discoverbox {background: transparent !important;} \
#watch-channel-discoverbox {-webkit-box-shadow: inset 0 4px 8px rgba(0,0,0,.05),0 1px 0 transparent; box-shadow: inset 0 4px 8px rgba(0,0,0,.05),0 1px 0 transparent;} ';
	}
	if (ytType=='watch7') {
		// new youtube interface

		// top
		toggleOff('yt-masthead-container'); toggleOff('gb'); toggleOff('gbz'); toggleOff('gbx1'); toggleOff('gbx3');
		toggleOff('ticker');
		toggleOff('guide');
		// headline
		toggleOff('watch7-headline');
		// sidebar
		toggleOff('watch7-sidebar');
		// downloads
		toggleOff('ytOlinks');
		// description
		toggleOff('watch7-user-header');
		toggleOff('watch7-action-buttons');
		toggleOff('watch7-action-panels');
		// comments
		toggleOff('watch7-discussion');
		// footer
		toggleOff('footer-container');
		toggleOff('footer-hh-container');
		// playlist
		toggleOff('watch7-playlist-container');

		newcss += '#watch7-player {margin: 0 auto;} #watch7-video.has-ad {left:0 !important;} ';

		newcss += '.watch-branded #watch7-main-container {background-color:transparent !important; background: none;} ';

		newcss += '.watch-wide #watch7-player {-webkit-box-shadow: none; box-shadow: none;} ';

		newcss += '#watch7-sidebar {margin-top: 18px;} ';

		newcss += '#watch7-headline, #watch7-user-header, #watch7-content #watch-privacy-contain, #yt-masthead-container {background: transparent !important;} ';
		newcss += '#watch7-headline, #watch7-user-header, #watch7-content #watch-privacy-contain, #yt-masthead-container, #watch7-action-panels, #watch7-discussion, #watch7-action-buttons {border-color: transparent !important;} ';

		newcss += '#watch7-video-container, #watch7-content {background-image: none !important; background-color: transparent !important; background: transparent !important;} ';

		newcss += '#watch7-branded-banner {display: none;} ';

		// footer
		newcss += 'body #footer-hh-container {background: transparent !important; border-top-color: transparent;} body #footer-hh-main {border-bottom-color: transparent;} ';

		// native javascript will try and reset this
		newcss += '#watch7-video-container {padding-left: 0 !important; padding-top: 0 !important;} ';

		// make video center
		newcss += '#watch7-video-container {margin: 0 auto !important; padding-left: 0 !important;} ';
		newcss += '#watch7-player {margin: 0 auto;} ';
		newcss += '#watch7-video {width: 100% !important;} ';

		// hide frame
		newcss += '#watch7-video {background: transparent;} ';

		// hide popup guides
		newcss += '.yt-uix-clickcard-card, .watch7-card-promo, .yt-uix-clickcard-card-flip, .yt-uix-clickcard-card-reverse, .yt-uix-clickcard-card-visible {display: none;} ';

		// remove cruft to prevent cinemize from scrolling
		newcss += 'html, body, #body-container {height: auto; min-height: auto;} ';
	}
	if (ytType=='feather') {
		// header
		toggleOff('mh');

		// title
		toggleOff('vt');
		toggleOff('ud');

		// sidebar
		toggleOff('rc');

		// downloads
		toggleOff('ytOlinks');

		// description
		toggleOff('vc');
		toggleOff('vo');
		toggleOff('de');
		toggleOff('ded');

		// comments
		toggleOff('cm');

		// footer
		toggleOff('ft');

		var aa=d.getElementById('movie_player');
		if (aa) {
			newcss += '#lc {float:none; width: '+aa.clientWidth+'px; margin: 0 auto;} #ct {width: 100%; margin-left: 0;} ';
		}

		newcss += '#vt, #ud { width: 960px; margin: auto; } ';

		newcss += 'html {height: 100%;} ';
	}

	if (options.Mood='matte') {
		newcss += 'html { background: '+options.Swatch+';} body {background: transparent !important; background-color: transparent !important;} ';
	}

	do_matte(options.Swatch);

	if (options.Cleanup=='false') {
		newcss += '#content {background:none !important; background-image:none !important} body {height:auto;} #watch-video-extra {display: none;} ';
	}

	if (options.DownloadLinks!='never' && !d.getElementById('ytOvid')) {
		newcss += '#ytOlinks {margin: 0 auto;} ';
	}

	addCSS (newcss,'ytOcss');

	do_Center();

	fixlogo('gray');

	fixPopout();

	ytoZoom('remove');
}

function un_cinemize () {
	// show everything (youtube)

	var d=getDOM();

	if (ytType=='normal') {
		// header
		toggleOn('masthead-container');toggleOn('ticker'); toggleOn('yt-masthead-container');
		// headline
		toggleOn('watch-headline-container'); toggleOn('branded-page-header');
		// sidebar
		toggleOn('watch-sidebar');
		toggleOn('video-sidebar'); // youtube home page
		toggleOn('secondary-pane'); // youtube user page
		// downloads
		toggleOn('ytOlinks');
		// description
		toggleOn('watch-panel');
		// comments
		toggleOn('watch-discussion');
		// footer
		toggleOn('footer-container');
		// playlist
		toggleOn('quicklist'); toggleOn('playlist-bar');

		// set background to default
		d.body.style.background='#FBFBFB';
	}
	if (ytType=='watch7') {
		// new youtube interface

		// top
		toggleOn('yt-masthead-container'); toggleOn('gb'); toggleOn('gbz'); toggleOn('gbx1'); toggleOn('gbx3');
		toggleOn('ticker');
		toggleOn('guide');

		// headline
		toggleOn('watch7-headline');
		// sidebar
		toggleOn('watch7-sidebar');
		// downloads
		toggleOn('ytOlinks');
		// description
		toggleOn('watch7-user-header');
		toggleOn('watch7-action-buttons');
		toggleOn('watch7-action-panels');
		// comments
		toggleOn('watch7-discussion');
		// footer
		toggleOn('footer-container'); toggleOff('footer-hh-container');
		// playlist
		toggleOn('watch7-playlist-container');

		// set background to default
		d.body.style.background='#FBFBFB';
	}
	if (ytType=='feather') {
		// header
		toggleOn('mh');

		// title
		toggleOn('vt');
		toggleOn('ud');

		// sidebar
		toggleOn('rc');

		// downloads
		toggleOn('ytOlinks');

		// description
		toggleOn('vc');
		toggleOn('vo');
		toggleOn('de');
		toggleOn('ded');

		// comments
		toggleOn('cm');

		// footer
		toggleOn('ft');

		// set background to default
		d.body.style.background='#FBFBFB';
	}

	// undo cinemize
	addCSS ('','ytOcss');

	// make download links normal
	lightLinks(true);

	// undo matting
	addCSS('','ytOmatte');

	// undo centering
	addCSS('','ytOcenter');

	var aa=d.getElementById('ytOvidtype');
	if (!aa) {
		console.log('ytO: could not find ytOvidtype');
		return false;
	}
	type=aa.getAttribute('ctype');
	id=aa.getAttribute('cid');

	bug('un_cinemize video frame: '+ type+' '+id);

	if (type=='id') { var yw = d.getElementById(id); } else if (type=='class') { var yw = d.getElementsByClassName(id)[0]; }
	if (yw) {yw.style.marginTop='auto';}

	if (options.Cleanup=='true'){
		fixlogo();
	} else {
		fixlogo('colour');
	}

	fixPopout();

	ytoZoom('remove');
}

function do_baseCSS () {
	// default base css

	var newcss = '';

	if (options.DownloadLinks!='never') {
		newcss += '#ytOlinks {font:normal 12px \'Lucida Grande\', Helvetica, malotf, Arial, sans-serif; padding: 10px 0 10px 1px; text-align: left; word-wrap: break-word;} #ytOlinks a {padding-right:10px;} ';

		newcss += '#ytOlinks>a+span {padding-left: 8px;} #ytOlinks a:hover {background: transparent;} #ytOlinks span {padding-right: 10px; padding-left:18px;} ';

		newcss += '#ytOlinks, #ytOlinks a {color: #999;} #ytOlinks:hover {color: rgba(2, 6, 30, .81); text-shadow: 0 0 2px gray;} ';
		if (options.Frame=='false') {
			newcss += '#ytOlinks:hover a {color: #1C62B9;} ';
		}

		// resize download links to standard three sizes
		newcss += '#watch7-container #ytOlinks {width: 640px;} ';
		newcss += '#watch7-container.watch-medium #ytOlinks {width: 854px;} ';
		newcss += '#watch7-container.watch-large #ytOlinks {width: 1280px;} ';
	}

	if (vidtype=='youtube') {
		var d=getDOM();
		if (options.DownloadLinks!='never') {
			if (ytType=='feather') {
				newcss += '#lc {width: 640px;} ';
			}

			if (options.Cleanup=='false' && ytType!='watch7') {
				// make links visible with default large video background
				newcss += '.watch-wide #ytOlinks:hover span {color: white;} .watch-wide #ytOlinks:hover a {color: #85BFE6;} ';
			}
		}

		if (ytType=='watch7') {newcss += '#footer {margin: auto;} ';}

		if (ytType!='feather') {
			// fiddle with guide
			newcss += 'body.guide-collapsed #page.watch #guide-container.branded {background: transparent;} ';
			newcss += 'body.sidebar-collapsed #page.watch #guide-container.branded {background: transparent;} ';
			newcss += 'body.guide-expanded #page.watch #guide-container {background: rgba(251,251,251,.95);} ';
			newcss += 'body.guide-expanded #page.watch #guide-container.branded {background: rgba(251,251,251,.95);} ';
			newcss += 'body.guide-enabled #page.watch #guide-container {left: 0px; top: 0px;} ';
			newcss += '#page.watch .guide-module-toggle-label {opacity: 0;} ';
		}

		if (options.InVideo!='default') {
			// block html5 related videos & ads
			newcss += '.videowall-endscreen, .html5-endscreen.videowall-endscreen, .video-ads {display: none;} ';

			if (options.InVideo!='ads') {
				// enable html5 annotations
				newcss += '.video-annotations, .annotation, .annotation-shape {display: none;} ';
			}
		}

		if (options.RSS=='true') {
			// add rss link to header

			if (ytType!='feather') {
				newcss += '#masthead-search, #ytOrss {float: left;} #ytOrss {margin-top: 0; margin-left: 40px; color: #333; font-size: 13px;} ';
			}
			if (ytType!='feather' && options.Cleanup=='true') { newcss += '#ytOrss {color: #666;} #ytOrss:hover {color: #1C62B9;} '; }
			if (ytType=='feather') { newcss += '#qe {width: 230px;} #ytOrss {border: 0;} '; }
			if (options.Cleanup=='false') {
				newcss += '#masthead-nav {padding: 0;} #ytOrss + span {margin-left: 10px;} ';
			}
			if (ytType=='feather') {
				newcss += '#ytOrss {float: left; margin-left: 18px; margin-top: 12px;} #masthead-search {width: 71%;} ';
			} else {
				newcss += '#ytOrss {float: right; margin-left: 18px; margin-top: 12px;} #masthead-search {width: 71%;} ';
			}
		}

		if (options.Guide=='true') {
			// watch7 guide hide
			d.body.className = d.body.className.replace('guide-expanded','').replace('guide-collapsed','');
			toggleOff('guide');
		}

		if (ytType=='watch7') {
			newcss += '.ytFt {color: #666; font-size: 11px; font-weight: bold;} ';

			// make sure playlist items cant be selected when hidden
			newcss += '#watch7-container.watch-playlist-collapsed #watch7-playlist-tray-container {display: none;} ';

			// make guide float on top of video
			newcss += '#guide {z-index: 18;} ';
		} else {
			newcss += '.ytFt {text-transform: capitalize;} .ytFt span {padding-left: 10px; font-weight: bold;} ';
		}

		if (links.indexOf('//www.youtube.com/')!='-1') {
			newcss += 'iframe {display:none;} .sb-card-content iframe {display: inline;} ';
		}

		if (options.ControlsTheme=='light') {
			// lighten up the playlist bar
			newcss += '.watch7-playlist-bar {border-top-color: #ccc;} ';
			newcss += '#watch7-playlist-bar-controls {border-left-color: #ccc;} ';
			newcss += '.watch7-playlist-bar-left, .watch7-playlist-bar-secondary-controls, #watch7-playlist-bar-controls {background: #ccc;} ';
			newcss += '.watch7-playlist-bar-left .title, #watch7-playlist-bar-controls {color: rgba(2, 6, 30, .81);} ';

			// lighten up playlist
			newcss += '#watch7-playlist-tray, #watch7-playlist-tray-mask {background: rgba(204, 204, 204, .81);} ';
			newcss += '#watch7-playlist-tray .video-list-item .title {color: rgba(0, 0, 0, .81) !important; text-shadow: none;} ';
			newcss += '#watch7-playlist-tray .video-list-item .stat {text-shadow: none;} ';
			newcss += '#watch7-playlist-tray .video-list-item a:hover {background: rgba(53, 53, 53, .3);} ';
			newcss += '#watch7-playlist-tray .video-list-item, #watch7-playlist-tray .video-list-item:hover {border-top: 1px solid transparent;} ';
		}
	}

	addCSS (newcss,'ytObase');
}

function lightLinks (kind) {
	// lighten the download links for dark backgrounds (youtube)

	var newcss='';
	var grayColour=options.Swatch;

	if (!kind) {
		if (options.Mood=='dim') {
			newcss += '.yt-uix-expander-head {text-shadow: 0 0 5px black; color: white;} ';
			if (grayColour=='#222222') {
				newcss += '#ytOlinks:hover a, #ytOrss:hover {text-shadow: 0 0 3px black;} ';
			}
			if (grayColour=='#000000') {
				newcss += '#ytOlinks:hover a, #ytOrss:hover {color: #000; text-shadow: 0 0 3px red;} ';
			}
		} else {
			newcss = '.yt-uix-expander-head {color: #DADADA;} ';

			if (grayColour=='#222222' || grayColour=='#000000') {
				newcss += '#ytOlinks, #ytOlinks a {color: #333; text-shadow: none;} #ytOlinks:hover a, #ytOrss:hover {color: #85BFE6;} #ytOlinks:hover span {color: #DADADA;} #ytOlinks:hover a, #ytOrss:hover, #ytOlinks:hover span {text-shadow: 0 0 3px white;}';
			}
		}

		if (options.Mood=='matte' && (grayColour=='#222222' || grayColour=='#000000')) {
			// fix colours for darker backgrounds
			newcss += '#eow-title, #watch-headline-show-title, #vt, #eow-title a {color: #DADADA !important; text-shadow: 0 0 3px white;} ';
			if (ytType!='feather') { newcss += '#ytOrss, #masthead-nav a {color: #666;} '; }
			newcss += '#watch-headline-container, #watch-headline-title, #content {color: #333333;} ';
			// hide button borders
			newcss += '#masthead-gaia-user-wrapper, .yt-uix-button, #masthead-gaia-photo-wrapper {border-color: transparent !important;} ';
			// hide box shadow
			newcss += '#masthead-expanded-container {-moz-box-shadow: none; -o-box-shadow: none; -webkit-box-shadow: none; box-shadow: none; background: '+grayColour+';} ';
		}
	}

	addCSS(newcss,'ytOdark');
}

function do_clean () {
	// cleanup layout (youtube)

	var d=getDOM();

	var newcss = '\
#content {background:none !important;background-image:none !important} \
.watch-wide #watch-video-container {background-color:transparent; background-image:none;} \
#eow-title, #vt {font-weight: normal;} \
#masthead-container {border-bottom: 0;} \
#masthead-nav, #watch-branded-actions, #watch-channel-brand-div, #watch-headline-user-info, #watch-more-from-user, #ticker, .ticker, #yt-feedback, #branded-playlist-module {display: none;} \
#masthead-utility {display: none;} \
#watch-container {padding-top: 18px;} \
#watch-video-container {padding-bottom: 18px;} \
#watch-headline {padding-bottom: 18px; margin: 0;} \
#watch-headline, #masthead {width: auto;} \
#watch-headline-container, #masthead-container {padding-left: 18px; padding-right: 18px;} \
#watch-headline-container, #watch-headline-title, #eow-title, #content, #vt, .long-title {background: white; background-color: transparent; color: rgba(2, 6, 30, .81) !important;} \
#eow-title a {color: rgba(2, 6, 30, .81) !important;} \
#watch-player {margin: 0 auto;} \
#watch-privacy-contain {display: none;} \
#watch-sidebar {margin-top:0 !important;} \
#watch-sidebar, #watch-module-body, .watch-module-body, #watch-stage, .yt-stage {background: transparent !important;} \
.watch-headline {width: 0; margin: 0;} \
.yt-uix-tooltip-tip-content, #alerts, #watch-context-container {display: none;} \
.ytOpopin {display: inline;} \
body { font-family: \'Lucida Grande\', Helvetica, malotf, Arial, sans-serif; text-rendering: optimizelegibility; } \
#watch-panel {padding-left: 18px; background-image:none;} \
#watch-stage {box-shadow: none; } \
#watch-video.has-ad {left:0 !important;} \
.share-panel-services-dynamic iframe {display: block;} \
.watch-branded #watch-headline-container {width: auto;} \
#shared-addto-menu {height:300px;} .playlists ul {height:195px !important;} \
#watch-longform-ad-placeholder, #instream_google_companion_ad_div {display: none;} \
#watch-userbanner, #watch-video-extra {display: none;} \
#watch-player, #p #movie_player {-webkit-box-shadow: 0 4px 16px rgba(0, 0, 0, .199219); box-shadow: 0 4px 16px rgba(0, 0, 0, .199219);} \
#ad_creative_1, .watch-pyv-vid, .branded-banner-image {display: none;} \
#watch7-sidebar .watch-pyv-vid {display: none;} \
';

	// youtube home page
	newcss += '#branded-page-body-container, .branded-page-v2-col-container {background: transparent;} ';

	// chrome-store-ize the scrollbars
	newcss += '#watch-panel::-webkit-scrollbar, #watch-related::-webkit-scrollbar, #watch-more-related::-webkit-scrollbar, #watch7-discussion::-webkit-scrollbar, #watch7-sidebar::-webkit-scrollbar { width: 10px; background: -webkit-gradient(linear,left top,right top,color-stop(0%,rgba(202, 202, 202, 0.07)),color-stop(100%,rgba(229, 229, 229, 0.07))); -webkit-box-shadow: 0 0 1px 0 rgba(0, 0, 0, .15) inset,0 1px 0 0 white; box-shadow: 0 0 1px 0 rgba(0, 0, 0, .15) inset,0 1px 0 0 white; background-color: #E5E5E5; } ';
	newcss += '#watch-panel::-webkit-scrollbar, #watch-related::-webkit-scrollbar, #watch-more-related::-webkit-scrollbar, #watch-panel::-webkit-scrollbar-thumb, #watch-related::-webkit-scrollbar-thumb, #watch-more-related::-webkit-scrollbar-thumb, #watch7-discussion::-webkit-scrollbar, #watch7-sidebar::-webkit-scrollbar, #watch7-discussion::-webkit-scrollbar-thumb, #watch7-sidebar::-webkit-scrollbar-thumb { overflow: visible; border-radius: 4px; border: solid 1px #A6A6A6; } ';
	newcss += '#watch-panel::-webkit-scrollbar-thumb, #watch-related::-webkit-scrollbar-thumb, #watch-more-related::-webkit-scrollbar-thumb, #watch7-discussion::-webkit-scrollbar-thumb, #watch7-sidebar::-webkit-scrollbar-thumb { background: -webkit-gradient(linear,left top,right top,color-stop(0%,rgba(233, 233, 233, 0.05)),color-stop(100%,rgba(221, 221, 221, 0.05))); -webkit-box-shadow: 0 2px 1px 0 rgba(0, 0, 0, .05); box-shadow: 0 2px 1px 0 rgba(0, 0, 0, .05); background-color: #E9E9E9; } ';

	// no background for header
	newcss += '#yt-masthead-container.yt-masthead-hh {background: transparent; border-color: transparent;} ';

	// make body center for home and channel pages
	if (options.youtubeHome=='true' || options.youtubeChannel=='true') {
		newcss += '.exp-new-site-width #page {margin: 0 auto !important;} ';
	}

	// click to show bar
	newcss += '#ytOtexp, #ytOdexp {border: 0; border-radius: 4px; height: 8px;} #ytOtexp {margin-bottom: 1px; margin-top: -9px;} #ytOdexp {margin-bottom: 0; margin-top: -5px;} #ytOtexp:hover, #ytOdexp:hover {background: #A6A6A6; box-shadow: 0 0 8px rgba(255, 255, 255, .81); -webkit-box-shadow: 0 0 8px rgba(255, 255, 255, .81);} #ytOtexp:active, #ytOdexp:active {background: #747474;} #watch-actions {margin-top: 4px;} ';
	// hide the description buttons
	newcss += '#watch-actions span, #watch-actions button, #watch-description-extra-info li {display: none;} ';
	// center the title buttons
	newcss += '#watch-headline-user-info {text-align: center !important;} ';

	// hide guide and guide notice
	newcss += '#yt-uix-clickcard-card1, #yt-hitchhiker-feedback {display: none;} ';
//	toggleOff('guide');

	if (ytType=='watch7') {
		// new youtube interface
		//newcss += '#watch7-branded-banner, #watch7-views-info, #watch7-user-header {display: none;} ';
		newcss += '#watch7-branded-banner, #watch7-user-header {display: none;} ';
		newcss += '#watch7-video-container {background-image: none !important; background-color: transparent !important; background: transparent !important;} ';
		newcss += '#watch7-headline {border-color: transparent; background-color: transparent;} ';
		newcss += '#watch7-discussion {height: 365px; overflow-y: scroll; overflow-x: hidden; border-right-color: transparent;} ';
		newcss += '#watch7-sidebar {height: 638px; overflow-y: scroll; overflow-x: hidden;} ';
		newcss += '#page {padding-top: 0;} ';
		newcss += '.exp-new-site-width #page.watch, #page.watch #content {padding-bottom: 0 !important;} ';
		newcss += '#watch7-content {box-shadow: none; background: transparent; border:0;} ';
		newcss += '#footer {margin: auto;} ';

		// click-to-show will reveal like, about, share, etc buttons
		newcss += '#watch7-action-buttons {display: none;} ';

		newcss += '#watch7-player {margin: 0 auto;} ';
		newcss += '#watch7-headline a, #watch-headline-show-title {color: rgba(2, 6, 30, .81) !important;} ';

		newcss += '#watch7-user-header {background: transparent;} ';
		newcss += '.watch-playlist #watch7-video-container {padding-top: 0;} ';

		// dull user links
		newcss += '#watch7-user-header a {color: #999 !important;} ';
		// hide borders of descriptions n whatnot
		newcss += '#watch7-user-header, #watch7-action-buttons, #watch7-action-panels {border-color: transparent;} ';
		// hide avatars
		newcss += '#watch7-user-header .yt-user-photo, #comments-view .yt-user-photo {display: none;} ';

		// center everything under video
		newcss += '.site-left-aligned #watch7-main, .site-right-aligned #watch7-main {margin: 0 auto !important;} ';
		var aa = d.getElementById('watch7-main-container');
		if (aa) {aa.style.paddingLeft='0';}

		// dull links in comments area
		newcss += '#watch7-discussion a {color: #999 !important;} #watch7-content:hover a, #watch7-sidebar:hover a, #watch7-sidebar:hover .title {color: #1C62B9 !important;} ';
		newcss += '#watch-panel a, #watch-description-extra-info .full-link .link-like {color: #999 !important;} #watch-panel:hover a, #watch-panel:hover #watch-description-extra-info .full-link .link-like {color: #1C62B9 !important;} .comments-rating-positive {color: #999;} #watch-panel:hover .comments-rating-positive {color: #090;} ';
		newcss += '.video-list-item a span.title {color: #999 !important;} ';

		// dull thumbnails of suggested videos
		newcss += '#watch-sidebar-section .ux-thumb {background: transparent;} .video-list-item .ux-thumb-wrap, .video-list-item .yt-pl-thumb {opacity: .5;} ';
		newcss += '.video-list-item:hover .ux-thumb-wrap, .video-list-item:hover .yt-pl-thumb {opacity: 1;} ';
		newcss += '#watch7-user-header .yt-uix-button-icon-wrapper {opacity: .5;} ';
		newcss += '#watch7-user-header:hover .yt-uix-button-icon-wrapper {opacity: 1;} ';
		newcss += '#watch7-action-buttons .yt-uix-button-icon-wrapper {opacity: .5;} ';
		newcss += '#watch7-action-buttons:hover .yt-uix-button-icon-wrapper {opacity: 1;} ';

		// cleanup footer
		newcss += 'body #footer-hh-container {background-color: transparent !important; border-top-color: transparent;} ';
		newcss += '#footer-hh-logo img {opacity: .81;} ';
		newcss += '#content-container #baseDiv, #page-container {padding-bottom: 153px;} ';

		// this centers small video with playlist showing with cleanup=true
		newcss += '#watch7-container.watch-playlist #watch7-video-container {margin: 0 auto; padding: 0;} ';
		newcss += '#watch7-playlist-container {margin: 0 auto; padding: 0;} ';
		newcss += '#watch7-container.watch-playlist #watch7-playlist-data {padding-left: 0;} ';
		newcss += '#watch7-container.watch-playlist #watch7-player {margin: 0;} ';

		var small=640;
		var med=854;
		var large=1280;
		if (options.SidebarStay=='true') {
			small+=305;
			med+=305;
			large+=305;
		}
		newcss += '#watch7-container.watch-playlist #watch7-video-container {width: '+small+'px;} ';
		newcss += '#watch7-playlist-container {width: '+small+'px;} ';
		newcss += '#watch7-container.watch-playlist #watch7-playlist-data {width: '+small+'px;} ';
		newcss += '#watch7-container.watch-medium #watch7-video-container {width: '+med+'px;} ';
		newcss += '#watch7-container.watch-medium #watch7-playlist-container {width: '+med+'px;} ';
		newcss += '#watch7-container.watch-large #watch7-video-container {width: '+large+'px;} ';
		newcss += '#watch7-container.watch-large #watch7-playlist-container {width: '+large+'px;} ';
		newcss += '#watch7-container.watch-playlist.watch-large #watch7-playlist-data {width: '+large+'px;} ';

		if (options.SidebarStay=='false') {
			// adjust height of playlist
			newcss += '.watch-playlist #watch7-playlist-tray {border-bottom: 0;} ';
			newcss += '#watch7-playlist-tray-container {height: 360px;} ';
			newcss += '.watch-medium #watch7-playlist-tray-container {height: 480px;} ';
			newcss += '.watch-large #watch7-playlist-tray-container {height: 720px;} ';
		} else {
			newcss += '#watch7-container #ytOlinks {width: '+small+'px;} ';
			newcss += '#watch7-container.watch-medium #ytOlinks {width: '+med+'px;} ';
			newcss += '#watch7-container.watch-large #ytOlinks {width: '+large+'px;} ';
		}

		// make the playlist drop-down button show
		newcss += '.watch-playlist #watch7-playlist-bar-toggle-button {display: inline;} ';

		// move up the video
		newcss += '#watch7-video-container, .watch7-playlist {padding-top: 0;} ';

		// make video center
		newcss += '#watch7-video-container {margin: 0 auto !important; padding-left: 0 !important;} ';
		newcss += '#watch7-video {width: 100% !important;} ';

		// center video title
		newcss += '#watch-headline-title {font-weight: normal; margin: 0; text-align: center;} ';
		newcss += '#watch-headline-title span {color: rgba(2, 6, 30, .81) !important;} ';
		newcss += '#watch7-headline #watch-privacy-icon {display: none; float: none;} ';

		if (options.Popout=='true') {
			// compensate for popout widget
			newcss += '.sidebar-collapsed #watch7-headline {margin-right: -219px;} ';
			newcss += '.sidebar-expanded #watch7-headline {margin-right: -336px;} ';
		} else {
			newcss += '.sidebar-collapsed #watch7-headline {margin-right: -183px;} ';
			newcss += '.sidebar-expanded #watch7-headline {margin-right: -300px;} ';
		}

		newcss += '#watch7-sidebar, .watch-wide #watch7-sidebar {margin-top: 55px !important; } ';
		newcss += '.sidebar-expanded #watch7-sidebar {padding: 15px 0 10px 5px;} ';

		var aa = d.getElementById('watch7-headline');
		if (aa) {
			// add description click-to-show
			newcss += '#ytOdexp {float: left; width: 640px; margin-top: 0;} #watch7-user-header {top: 8px;} ';
			var temp = d.createElement('div');
			temp.setAttribute('id','ytOdexp');
			temp.setAttribute('title','Click to show buttons');
			// insertAfter(parent, node, referenceNode)
			insertAfter(aa.parentNode, temp, aa);

			d.getElementById('ytOdexp').addEventListener('click',function(){
				var aa = d.getElementById('ytOdexp');
				var ab = d.getElementById('watch7-user-header');
				var ac = d.getElementById('watch7-action-buttons');
				var ad = d.getElementById('watch7-sidebar');
				var ae = d.getElementById('watch7-action-panels');
				var af = d.getElementById('watch7-discussion');
				if (aa.className.indexOf('a')!='-1') {
					aa.className='';
					aa.title='Click to show buttons';
					ab.style.display='none';
					ac.style.display='none';
					ae.style.display='none';
					if (ad.style.display!='none') {af.style.height='628px';}
				} else {
					aa.className='a';
					aa.title='Click to hide buttons';
					ab.style.display='block';
					ac.style.display='block';
					ae.style.display='block';
					af.style.height='365px';
				}
			},true);
		}
		if (options.DownloadLinks!='never') {
			newcss += '#ytOlinks {margin: 0 auto;} ';
		}
	}
	if (d.body && d.body.className.indexOf('guide-enabled')!='-1') {
		d.body.className = d.body.className+' guide-collapsed';
	}
	if (ytType=='feather') {
		// user logo
		newcss += '#ud {display: none;} ';
		// extra header links
		newcss += '.ml {display: none;} #ytOrss {display: inline;} ';
		// title spacing
		newcss += '#vt {padding-bottom: 18px;} ';
	}
	if (ytType!='feather') {
		// replace black thumbnail gifs with data-thumbs
		var proto='http:';
		if (options.SSL=='true' || links.indexOf('https')!='-1') {proto='https:';}
		var thumbs = d.getElementsByClassName('yt-thumb-clip-inner');
		for (var i=0;i<thumbs.length;i++) {
			var bit = thumbs[i].firstChild;
			if (bit && bit.getAttribute('data-thumb') && bit.src.indexOf(bit.getAttribute('data-thumb'))=='-1') {
				bit.src = proto+bit.getAttribute('data-thumb');
			}
		}
	}

	addCSS (newcss,'ytOclean');
}

function fixlogo (kind) {
	// brute force the logo (youtube)

	var d=getDOM();

	var aa=d.getElementById('logo');
	var ab=d.getElementById('ytOmatte');
	var ac=d.getElementById('footer-hh-logo');
	if (ac && ac.children && ac.children[0] && ac.children[0].children[0]) {ac=ac.children[0].children[0];} else {ac=false;}

	if (ytType=='feather') { aa=d.getElementById('lg'); }
	if (aa) {
		var logoColour = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEgAAAAeCAYAAACPOlitAAAKDElEQVR4Xu1aa2wU1xU+sw/v2usHMX4bP8B2g712Y3t51aI8ElSZl1tICCIpUVyCGkHVqiohEklpoWmllgrSoARVIEyAQmvqgADRWoBLWqAkGJzULolpbUwT/MIG7PWu9zUzPedqZu7MLsFUuLJ/5EhHZ/Y7596Z+91zz70ztiDLMnyxfCkCjLFccZXkoVmDWoY6ETVWp4/B/0f8qEOoA6TKdR/qRZBhn+tqc9+4IKixvHidALADgSgYP9KPutJ1teXsmBJ0ubx4GZo69gzjT7yo5dOvtrRaYIxEkuHn45QckhgZ4KdoV1mSk5MXm0ymryvF+nBvb+/HahT6tqCxCYLQg/gOGCW5WObMlkAuJMASFwcZ1S89MH6w8TLcu3geRpLUZ54FW0Ym+DtvQc8fa+FRRAb4BlnL2rVrXTU1Na8iCZCdnZ2BRLxAjvT09McR20x4eXn530+cOLFjFLMnVwOiHZDx4poH57sognhhZILiKhdDUrkL+q5egc4jtfCIknjuiaJ4y8aNG6+eOnUK+vr6QJKkStVbXFz8XGtrK4iiCCtWrLiHBI3e8gI5h8+UPPKWI0kgPURcUJY1S/GPKiYBciwJCQn1Cxcu9NXW1trv3r2bPHny5LQbN250WyyWqqioKCBdsGDB7lGuPxpBge4e2FFWwvCk/AJYfeQ9hn985A/Q8Is3GJ6CA570UOuCW+nR+aFuci24hILHjh2rr6ur+ybVofz8/KdtNtsuXGpFZrMZZs+eLeJy+zOMooggZ2mzBDI4ldFYxaAWYw2FEA8pMQKIwv/ED90DRkFyTWQqKyt/k5qaCkgMxMTErEItDwQCUVi8oays7B9I4jDF5eTkrMzMzGxOS0sLor2ZkZGxGckzgyLYxw783Yb2lA5rS0lJIX1FG4gMqcQJKl0TAUwFWc8Cx80OB3ztZD3TlEVLqB1ZDRNiHBEZM2FWBcysOw7zPmiCgldfAwkEUO9piomFr2zaDLMbzsO8Dz+Cab+rpXjyhWs6bfNEzPtz5871HD161IHLrDwvL+/bVH9oec2ZM2c/AFBmLcN6dBgxIYSzi6RlY83agjYJ3d9HhVmzZlU2NjZOyc3NTe7p6QESzMIpRPS8efMWHjx4cBthIVmecP9jvWxIB1GpKURI9KQsBg/bowknq2FBRrSs1bPH8qZA2s5dYLJamT9r1fPQffYM3PnwEgBtOm+9DYnTpoMq8c5iKMX4xrXVcBcLPH8eSKAMosFKuFOdsWKHQ0ND0bi8ViMGTqcTioqKDrH6kJT0SyIHBw/79u2jusQyDrF1uPvFsw0pOtpOGKoVFCGSqV+7HUfEi3QsLQGjGgurZPBxPCQzjFlFImIEswVO/ngTvP/Wm3zJTp3KYuJLSzVyLh/cD7XrX4bhgQFGZuYLL4Y/U5wJFMEBvxMfz8YJHo8nkWZ9+vTpnyFRvVOnTjUhlk+kLVmy5N6TTz5ZtXLlykYaPBZzM/pnAAARQRnDrCLkpwkgqy/SDlSIUDAK93FM5kszIk6Feq+3Qv+x9+D6rrdBCoWUNElgMVGPF4IqTb/+FfgazsC1UycZkOAsDn8mh0ZQXFxcg8vlChAJlK5kS0tLj5IPa00CLieBSPN6vRfQd6Krq+u3SI56JHiCLPojCKJritNLCGSBMiBcReOgOW7MLIZJHIvIKBMtM7xnktkEgeFhholKXxAXr8VNDAYgHp9XGhhkgDXGYXwmkAX1yYmQ0M6dO5sbGhpcNEgstlQ39pCvqqoqds+ePYwAv9/vRojOTXeISCIgMTExTumDYsgaMgjJNWA02RJECvVHsSQSXfMGHOeqi9V+cyUHx7T+ZKtVa1f2k63MxjqLGSaydlzMMhBBXLKysk6jcVERLikpcSNpzdosiSINlgahEkqqXqtkcIK4RGAhSfbIYBA+y8qSECVRK9KyHhcZTpZjRCbFKBhara1Iv1FZO10MyaRvLQdVWAwqxXARBg0EdXR0fKQMiOrQLd3McssxIkKdIRUjjYij/kh14icyIgmSiABt5jlBHBclmXCyHEO/xDAWh5a3pRiO8RiS01iD9CIFggaCcHgBA0HDw8NBFFZHRLUXni3hBJGOkC3GpcNrBgSk+5+wKdawxCImCQhnlseS6ieIt+WYGqPrq+3dGjJ6QiCF10+K9VuMAYKe9XAy1JlVYykmggzys1hOGGFhRMju+2eQrCeIZ5ABZ3GcTL7EOBm8rYpr/YUCAa1dktXCbNHL6yFr4SIIeTxw9rlnQRX0GpYYNdRqjV4WL17s2b17NyPD7XY7CLt9+3YCZRphEyZM8KqxCiYou1u0nnztGptL8oMziIwWY8wshptsdh3G26pKGG67YLHZDJhvcJDXUexD9PkAUlIghj6TuN38nkDthR7OhLGuGGpGQUHBAJ6k5fb2dqG5uXkmFvBpTU1NqymG2lRUVPxTKdIStifyrHhEqEDodfITaWHy2f3elSTDsuHbu6zDE/HAZ35qAUxbt17FKE5rS5qYOxlS58yFGNyJTcrG4nO7WVzfp9e0dgXVa6D7/F8hY8ZMhvXd7Ah/h+vgBPGZ5jWDY+LevXs7t2/fntnf35+CA77c2dnJfEuXLpXpexFd40HTi+3orGTCNhfwnc3T3d3NdgjZuDvcHCmDyKoxIY+XnWesdjsULnsaALW37d+QkpdvPFCqdRFJqdi2HUBXN/uuX2cx/U1N8HlLC2Q6nVCIBKFq9/tg/7uGDLIKQjulif5QJzkcDoiNjaXrkN5XXV29ZcOGDYCfR2gZ0qsDLF++HDZt2nQYybhDMYsWLWrEF12WffPnz4cDBw50Y190CKXXj6DuO0sHzXiESiHwDgwwDSIhKk672JW6I0Qa8x1/YytcqqnRYiX0U5zfM8SwDnyf+v0rPwLPnTuszSd/OQs9ly6wGLsA+HrxXWg5XQ+iMnFD/f1w/GdboLv+T/yeqHFmc5sQtsSK0JxXgL048A1h/h8iOa9hHZqIRPjwVeMgwj/AOK/iLw0EAufwMBmPpND5fS3qJ0rzNzFuK9tev1qY3u7zdYZnkU+SoM3nZ0AiZkF6FN9ROrG4emIcrJAmm0xEMnQFGOdQGG3H3wLcwLaYwhCDfjpJd4si+xJgHRqCHLsNBN373C1/ALwYE4X+AJKKywImWvmCspmE/u+0ticJ8LDCSTIrf6+ig6T/Pn4bGjv6BuABcqgwv+VuKOSEhxfahRgRD/vQslLUzYLwhX5R8YdHpFqth5659q/nBRgboQ/3T33qHa73iJIZxpdQ9g4VOaKdZVea/yPAGMrfSote+twffOd2MGgdL39mTouyurNttqqZTS3nFGxspclVUuQVpe8NiuIMCeQkSYZYtLEhGWyU/kyBrHKQ1NURWbdMVLHoX5T50mHLyKxYVPQxTEbjNtE7F240CRbz2WiTaRtmThcoMsI/L3wp/wXehDj2vinzPQAAAABJRU5ErkJggg==';
		var logoGray = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEgAAAAeCAQAAAAlM5AmAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAABrpJREFUGBkFwVmMXXUdAODv9z/nznTuDHRayrQMSFsoS9kMWGxV4gIhYFCLUbFBHzDKgxJjsEpCDGLgwbUQfTJqfFMji6gBRdCoyBJAUMGqqSJS6Eo7TDqduXOXc35+XwAAAAAAAAAA7CrOtN6pTsSppqTTdUFryqkKKdJB84rK6w4qimP2a4XG/xzx8s4jQAAAAAAAAAAA7NrkQ95kjSmZJ0dXWmecFGnCOICR40Ix76giLDmiFVoHzHsxfv75RQgAAAAAAAAAYNfH3W4TKQCkAAAAAAAAkKonzvji9qcIAAAAAAAAANj1Xg8YBwAAACARACAFAKCxeu81HznlmQAAAAAAAABg17gnvKU1QEghhVatFgCAvlatAwBSIAVIA5c/ufW99a5LbW9Gqx/61LPcWXU/babdd9P3ugkAAACAc21orHKWWgpAOOBlgRSAtMWJ9ntZCgABAikEDrx99P46JnyJNR/L6+NZ63x7WM4/Pr7K1wAAAABwum5jpUt1NRoURfGclxQEgHS+WX/1XwAAQIBi0WBryRc8zhubbCferTTOmSpzAAAAAGCdFWHgiEPmtVqLDjnkmAAAhEQLSAAJACoLhhvqnfN3PVIuO25+C97ZWG1mefAwAAAAADhF1A57UN/ZrlB5yZ90jBQpQAqkBCQCQEgEICwabqzx+5jrrX5105Pn/u7ikVkrn5zbz9frTifbnX3griqrheFXkq/WY2XnAKwjtBb0LYGhY8ZUKiElaqkFpMaYYohAo9KRWiNFCH392UI+E7uHDq0ffTJWpVN46KTRt66tn8mj9n7jjkdWwujLuWfiZ/89/YHi0dz9/VsPdzENoaOjkggdYZUddlhvyfk+5hqTGhAucL1P2AZGTnKlG9zoA07TSoTlbmHnIB6vzdXzHyozq5za88fvviPvaS8eTAxnym3L9+dKehuG6zdcu/Fzw8pF/U2X3tG9FBOkBJBIVE6yxrhW1xqrFTCywVVO1nGJNUa6rrTZpAkbXG2tIehngfb+snTYaxudOG3dc0//e+GWtjPjo97aDu29YvkWNCRdjMg6xr5R6RICEAIBWimRWq1EYuA+j6kUJxs421pDf3CvRdPOVkthoMDO56q9fUtqs8pT2471tw6dbePdk++L7JnfsTs0JG0IoFWpAAgpAQAAEGr7/MMePcWYxhpj5rxgjwPSKh2JVAC/CtTO6s89RWeMrubex/Z2BmEwGTOGBFIKKVOtAxAgkAAIAAFCV9FHR6oxtKSxjFoBjQLkb0lTZl/Z88RtnU6S9KoK2jqnJAlIBCkBEgAEIBEgARAgwLTtPmhWC4AC+EdI63jhbYc7YymFLEAAAoEQMowMAQKBBAlSCAAACVIiTTjPBVZqAalSA9psVDV/JwEBgECC0EoYGQKQIASAkFKCAIQAQDjmeY1WZUEjUKkBAS0JkABSSEBKBOWW3LUEQAAAIACkBAABWPK8oXFFCIEVCgAE0AoKqYUiBeC6oQxJYIkECQAAWikECKSUoAWECZOu9klX6WilMQUAEtze0wtLqp4x44y3RhkEvftmjafGZKE3RwBSSiRCYIgpIQGEZYyjUfTRUemZtlpXgomoASAAnu588J/KZ6xNtdWDo0dCseDZLUd+Wk23gDwIQCAAqRE2Oc15RgCG3uQyq4xrLam9btm0bRasxpwRJnT6BRBZjTSA8p3JZr/ffHZ03cAWnf+cv+hImPOrd510WddIgjygAQi1SiAMLKpc6EyHFAUUtbDNJULjdR3/8oqOS1xu0uteNJKm1IdrIIcrDq+aOYEJuPkPz9742t1zK8dt9ubDbiO/P7M9LjrHhUd/dHzt+gk6OJi9mILQd0RlUVGZ92dbzHnMrBPNa4V5K+y2z1Zdf/OGSuNBW200Zr+nvaFjZEq9NwAevuCqL+CB+AWQ29od5WT7/CT+AsdPn7zdoP+DX++99pvYFS/eedbE4zEDYaAnjelKYdlAMa6xrJhUOaY1ptZHbQVIPSkVY2r0vMWVPwwAAAAAAAAA7iwrHx1cHgBCAkIKiZAgQAopJCCkkCCNvN95NxUAAAAAAAAAbmvbm8eWRhLQAkgkaAEpJRKJBC0StHoudM4BjwQAAAAAAAAA8MsPL/zg1ZVDRUEqCAVAAUBKAK1EC1qpa7N3DidviB8HAAAAAAAAAMAb7zlw69Erh5a0GotS65giERaMhECrNqlIhK4OujrSlBXWOmO3O+IeAgAAAAAAAACAPGF584ozmumcZTBtXduM1linQQ7GbAQI9TEHA0rVr/YZ1P3ymqZe9opX7Yn98H+qo7WxDJNl0AAAAABJRU5ErkJggg==';
		var logoTWK = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEgAAAAeCAAAAACqUQdxAAABMElEQVRIDb3BzyuDcRwH8DdPVn4VLspBk/KzHLeDi5/lV7FdpdiBksOUclLkpCTKwYWDP0CpHcTBwUFCTTs4OZhlh5WFPHvm8extE+u7k/p85fUC/kdjO/7GbCyAL+O75dAxw/e9yemRjiATldDhs5iTIg8N6KiJ8FsAWlrv7Vfm2F5oWWS0/5jJhQNuF0HHBs39ayZWL3lTAh1bzLp7IRlxQccyyef5MMmHKujYJPl4cmuTaQ80lIZIOnSYNQYNdRHmBaGhIca88wrIdX8wLz0MuTUqliDmuqLiqAxSTSkqrD5IDWaoWoHUBAucGRDyZ6hKuiHktVnADyGPQ5XpgVD9E1UXBoSKT6lah9gOVT0Qm+IP6y0aqoVY9VycNONkeHSgxYCOtiFfZ3NXrxu/+QRfQjqyjuilJgAAAABJRU5ErkJggg==';

		var swap=false;
		var currentTime = new Date();

		var ismatte = false;
		var isdim = false;
		if (ab) {
			if (ab.textContent.indexOf('body')!='-1') {ismatte=true;} else if (ab.textContent.indexOf('background')!='-1') {isdim=true;}
		}

		if (!kind) {
			if (options.Cleanup=='true') { swap=logoColour; }
			if (ismatte==true || isdim==true) { swap=logoGray; }
		} else {
			if (kind=='clean' || kind=='colour') { swap=logoColour; }
			if (kind=='gray') { swap=logoGray; }
		}

		if (currentTime.getDate()==18 && currentTime.getMonth()==8) { swap=logoTWK; }

		if (swap!=false) {
			aa.className='';
			aa.style.width='72px';
			aa.style.height='30px';
			aa.style.background='none';
			aa.style.backgroundImage='none';
			if (ytType!='feather') {
				if (aa) {aa.src=swap;}
				if (ac) {ac.src=swap;}
			} else { aa.style.background='url('+swap+')'; }
		}
	}
}

function fixPopout () {
	// change popout image based on background color

	var d=getDOM();
	var aa=d.getElementById('ytOpop');
	var ab=d.getElementById('ytOmatte');

	var ismatte = false;
	var isdim = false;

	if (aa) {
		// swap out popout image with black version
		d.getElementById('ytOpop').firstChild.src='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAASCAMAAABhEH5lAAAAG1BMVEUAAAD///8AAAAJCQkKCgo/Pz/h4eHr6+v////03cO4AAAAAnRSTlMAAHaTzTgAAAA/SURBVBhXjc7RDgAgBEBRKen/vzhtybA29/HMAC0FZQLA1yX80ZLiFHEkYgokgp6O+PVjUrrYC39ZSpZSqEYbaDQCBLwCaoYAAAAASUVORK5CYII=';

		if (ab) {
			if (ab.textContent.indexOf('body')!='-1') {ismatte=true;} else if (ab.textContent!='') {isdim=true;}
		}

		if (ismatte==true && (options.Swatch=='#222222' || options.Swatch=='#000000')) {
			// swap out popout image with white version
			d.getElementById('ytOpop').firstChild.src='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAASCAYAAABWzo5XAAAASUlEQVQ4y2NgGFngP5EArwE0NQiXi8ly0YEDB/5TbBDMEBhNlkHIhqDLE20QuiFkBfbXr1/xGkKSi759+zZI0hHdsgbVLBwaAABOf6w7665k5QAAAABJRU5ErkJggg==';
		}
	}
}

function do_matte (grayColour) {
	// gray the background (youtube)

	var d=getDOM();

	var newcss = '';

	if (grayColour!='#FBFBFB') {
		if (options.Mood=='matte') {
			newcss += 'body {background-color: '+grayColour+' !important; background: '+grayColour+' !important;} \
#watch-main-container, #content.watch-wide #watch-video-container, #watch-main-container, #watch-frame-top, #masthead-container, .yt-stage {background-color: transparent !important; background-image: none !important;} \
.watch-branded #watch-main-container {background-color: '+grayColour+' !important; background-image: none !important;} \
#watch-headline-container, #watch-video-container, .watch-module-body, #watch-frame-top, #masthead-container {background: transparent !important;} \
#watch-frame-top, .yt-stage {box-shadow:none !important; -webkit-box-shadow:none !important; box-shadow:none !important;} #watch-stage{overflow:visible;} \
body {background-image: none !important;} \
#watch-content {background:transparent;} \
#masthead-gaia-user-wrapper, #masthead-gaia-photo-wrapper {border:none;} \
button.yt-uix-button {background: #FBFBFB;} #watch-description-expand, #watch-description-collapse {background-color:'+grayColour+' !important;} \
#masthead .sb-button {border-color: #333;} \
#page.watch-branded #watch-channel-discoverbox, #watch-channel-discoverbox {background: transparent !important;} \
#watch-channel-discoverbox {-webkit-box-shadow: inset 0 4px 8px rgba(0,0,0,.05),0 1px 0 transparent; box-shadow: inset 0 4px 8px rgba(0,0,0,.05),0 1px 0 transparent;} \
button.yt-uix-button, a.yt-uix-button {background: transparent; border-radius: 5px; text-shadow: none;} \
.yt-horizontal-rule {border-color: transparent;} \
#footer ul, #watch-description-expand .yt-uix-button, #watch-description-collapse .yt-uix-button {text-shadow: none;} \
.yt-uix-button-group .start {border-top-left-radius: 5px; border-bottom-left-radius: 5px; margin-right: -3px;} \
.yt-uix-button-group .end {border-top-right-radius: 5px; border-bottom-right-radius: 5px;} \
html body #footer-hh-container {background-color: transparent !important; border-color: transparent !important;} \
.branded-page-v2-secondary-column-hidden .branded-page-v2-col-container {background-color: transparent !important;} \
.branded-page-v2-body div {border-color: transparent;} .branded-page-v2-body a {color: white;} \
#yt-masthead-container.yt-masthead-hh, #masthead-user-expander .yt-uix-expander-head, #masthead-gaia-user-wrapper, #masthead-gaia-photo-wrapper {background: transparent; border-color: transparent;} \
';
			if (ytType=='watch7') {
				newcss += '.watch-wide #watch7-video-container, #watch7-content, #watch7-action-panels, #yt-masthead-container, #watch7-sidebar {background-color: transparent !important; background-image: none !important;} #yt-masthead-container, #watch7-discussion {border-color: transparent !important;} #watch7-content {border:0;} .yt-horizontal-rule {display: none;} #watch7-content {box-shadow: none; -webkit-box-shadow: none;} #masthead-user-wrapper {border: 0 !important;} #watch7-headline, #watch7-action-buttons, #watch7-action-panels, .comments-section h4 {border: 0;} #watch7-headline, #watch7-user-header {background: transparent; border-color: transparent !important;} ';
			}

			d.body.style.background=grayColour;
		}

		// fix links for matte colour
		if (grayColour=='#222222' || grayColour=='#000000') {
			lightLinks();
		} else {
			lightLinks(true);
		}

		if (options.Mood=='dim' && grayColour!='#FBFBFB' && options.Cinemize!='true' && options.Cinemizep!='true') {
			if (grayColour=='#888888') {rgba='136,136,136, 0.7';}
			if (grayColour=='#222222') {rgba='34,34,34, 0.7';}
			if (grayColour=='#000000') {rgba='0,0,0, 0.9';}
			newcss += '#watch-player, #watch-video-container, #p #movie_player, #p #video-player, #watch7-player {box-shadow: 0 0 0 181818px rgba('+rgba+'); z-index: 181818; position: relative;} #watch-video-container {padding-bottom: 0;} body #footer-hh-container, body #footer-container {z-index: 0;} ';

			// turn down everything under the watch7 video
			newcss += '#watch7-main-container {opacity: .81;} ';
			newcss += '#watch-video {width: 100%} ';

			if (grayColour=='#000000') {
				newcss += '#ytOlinks {color: #999;} #ytOlinks:hover a {color: #333;}';
			}
		}

		fixlogo('gray');
	} else {
		newcss += '#ytOlinks:hover a {color: #1C62B9;} ';
	}

	if (newcss!='') {
		addCSS (newcss,'ytOmatte');
	}
}

function vidKind () {
	// determine format of youtube

	var d=getDOM();
	var ytVidType='flash';
	if (d.getElementById('captions') || d.getElementById('www-player-css')) {
		// normal html5 (pre oct 2012)
		ytVidType='html5';
	}
	if (d.getElementById('watch-player') && d.getElementById('watch-player').className.indexOf('html5-player')!='-1') {
		// normal html5 (oct 2012)
		ytVidType='html5';
	}
	if (d.getElementById('movie_player') && d.getElementById('movie_player').className.indexOf('html5-video-player')!='-1') {
		// feather html5
		ytVidType='html5';
	}
	if (d.getElementById('watch7-player') && d.getElementById('watch7-player').className.indexOf('html5-player')!='-1') {
		// watch7 html5
		ytVidType='html5';
	}
	bug('video type: '+ytVidType);
	return ytVidType;
}

function modSite (site) {
	// mod a specific site

	var d=getDOM();

	if (site=='youtube'){
		// change logo
		fixlogo();

		var ac=d.getElementsByClassName('secondary-pane');
		if (ac[0]) {
			ac[0].id='secondary-pane';
		}
		var ac=d.getElementsByClassName('playlists-wide');
		if (ac[0]) {
			ac[0].id='playlists-wide';
		}
		var ac=d.getElementsByClassName('branded-page-v2-secondary-col');
		if (ac[0]) {
			ac[0].id='watch-sidebar';
		}

		if (ytType=='watch7') {
			var ac=d.getElementById('watch7-content');
			if (ac && ac.firstElementChild && ac.firstElementChild.className.indexOf('yt-uix-button-panel')!='-1') {
				ac.firstElementChild.id='watch7-headline-box';
			}
			var ac=d.getElementsByClassName('comments-section');
			if (ac[0] && ac[0].firstElementChild.textContent.indexOf('Top Comments')!='-1') {
				ac[0].id='watch7-top-comments';
			}
		}
	}

	if (site=='ph') {
		// add ids to body
		var bits=d.getElementsByClassName('videos_wrapper');
		if (bits[0]) {bits[0].id='sidebar';}
	}

	if (site=='xvid') {
		// add ids to tables in xvid
		var parent=d.getElementsByTagName('table');
		for (var i = 0; i < parent.length; i++) {
			parent[i].id='table'+i;
		}
		var parent=d.getElementsByTagName('p');
		for (var i = 0; i < parent.length; i++) {
			parent[i].id='footer';
		}
	}

	if (site=='dump') {
		// add id to div in dump

		var parts = d.getElementsByTagName('table');
		for (var i=0;i<parts.length;i++) {parts[i].id='table'+i;}

		var el=d.getElementById('table4');

		// clone existing video
		var newclone = el.cloneNode(true);
		newclone.id='tablecin';

		(elem=d.getElementById('table0')).parentNode.removeChild(elem);
		(elem=d.getElementById('table1')).parentNode.removeChild(elem);
		(elem=d.getElementById('table5')).parentNode.removeChild(elem);
		(elem=d.getElementById('table2')).parentNode.removeChild(elem);

		// add clone
		d.body.appendChild(newclone);

		var parts = d.getElementsByTagName('TR');
		for (var i=0;i<parts.length;i++) {parts[i].id='TR'+i;}
	}

	if (site=='dailymotion') {
		// for resizing
		var bits=d.getElementsByClassName('dmpi_video_playerv4');
		if (bits[0]) {bits[0].id='video_player';}

		// remove video ads
		var a=d.getElementsByTagName('object');
		for (var i=0;i<a.length;i++) {
			if (a[i].innerHTML.indexOf('param')!='-1') {
				var oldvalue = a[i].innerHTML;
				var newvalue = oldvalue;

				if (options.InVideo!='default') {
					bug('dailymotion: ads');
					newvalue = newvalue.replace(/name%22%3A%22auditudeOverlay/g,'XXXname%22%3A%22auditudeOverlay');

					if (options.Cleanup=='true') {
						newvalue = newvalue.replace(/showFacebookButton%22%3Atrue/g,'showFacebookButton%22%3Afalse');
						newvalue = newvalue.replace(/showTwitterButton%22%3Atrue/g,'showTwitterButton%22%3Afalse');
					}

					// remove iframe ads
					var elem=d.getElementById('player_middle_ad');
					if (elem) {	elem.parentNode.removeChild(elem); }
					var elem=d.getElementById('mc_Bottom');
					if (elem) { elem.parentNode.removeChild(elem); }
				}

				if (newvalue != oldvalue) {
					bug('dailymotion: swapping params');
					a[i].innerHTML = newvalue;
				}
			}
		}
	}

	if (site=='metacafe' && options.InVideo!='default') {
		removeFromVideo('flashVars');

		operamenu=true;
	}

	if (site=='vimeo' && d.getElementById('wrap')) {
		// new vimeo
		ab = d.getElementsByClassName('vimeo_holder')[0];
		if (ab) {
			ab.id='video_player';
		}
	}

	if (site=='g4tv' && (options.SetRes=='highres' || options.SetRes=='1080' || options.SetRes=='720')) {
		var origurl = d.URL;
		var taburl = origurl;

		var args = '';
		if (taburl.indexOf('#')!='-1') {
			var bits = taburl.split('#');
			args = bits[1];
			taburl = bits[0];
		}

		if (taburl.indexOf('?quality=')!='-1') {
			taburl = taburl.split('?quality=')[0];
		}

		taburl += '?quality=hd';

		if (args!='') {
			taburl += '#'+args;
		}

		if (taburl != origurl) {
			document.location = taburl;
			return false;
		}
	}

	if (site=='instagram' && (options.others=='true'||options.Sites=='true') && options.RSS=='true') {
		var origurl = d.URL;
		var who='';
		var thecolour = '#444;';
		var thepad = 12;
		if (origurl.indexOf('/p/')!='-1') {
			var aa = d.getElementById('media_user');
			if (aa && aa.children[0]) {
				who = aa.children[0].textContent;
				thepad += 2;
			}
		} else {
			var bits = origurl.split('instagram.com/');
			if (bits && bits[1]) {
				who = bits[1].split('/')[0];
				var thecolour = 'white; text-shadow: 0 0 3px black;';
			}
		}
		if (who!='') {
			var temp = d.createElement('link');
			temp.setAttribute('title','RSS feed for user');
			temp.setAttribute('alt','Created by YouTube Options');
			temp.setAttribute('href','http://statigr.am/feed/'+ who);
			temp.setAttribute('rel','alternate');
			temp.setAttribute('type','application/rss+xml');

			if (d.head) { d.head.appendChild(temp); }

			var temp = d.createElement('link');
			temp.setAttribute('title','RSS feed for user as a #tag');
			temp.setAttribute('alt','Created by YouTube Options');
			temp.setAttribute('href','http://statigr.am/tags/'+ who+'/feed/recent.rss');
			temp.setAttribute('rel','alternate');
			temp.setAttribute('type','application/rss+xml');

			if (d.head) { d.head.appendChild(temp); }

			// add RSS link to header
			var temp = d.createElement('a');
			temp.setAttribute('title','Add "'+who+'" to Google Reader');
			temp.setAttribute('alt','Created by YouTube Options');
			temp.setAttribute('href','http://statigr.am/feed/'+ who);
			temp.setAttribute('target','_empty');
			temp.setAttribute('id','ytOrss');
			temp.innerHTML='RSS';

			var header = d.getElementsByClassName('top-bar');
			if (header && header[0]) {
				var where = header[0].getElementsByClassName('logo');
				if (where && where[0]) {
					where[0].parentNode.appendChild(temp);
				}

				addCSS('#ytOrss {padding-top: '+thepad+'px; margin-left: 115px; position: absolute; color: '+thecolour+'} ');
			}
		}
	}

	if (site=='twitter') {
		var origurl = d.URL;
		var taburl = origurl;
		var newurl = origurl;

		if (options.SSL=='true' && taburl.search(/http:/i)!='-1') {
			// add ssl
			newurl = taburl.replace(/http:/gi,'https:');
			bug('adding ssl: '+taburl+' to: '+newurl);
			taburl = newurl;

			// something changed, reload the page
			document.location = taburl;
			return false;
		}

		var proto='http';
		if (options.SSL=='true' || links.indexOf('https')!='-1') {proto='https';}

		if (options.RSS=='true') {
			// get userid
			var who='';

			if (origurl.indexOf('twitter.com/')!='-1') {
				who = origurl.split('twitter.com/')[1].split('/')[0];
			}

			if (who != '' && d.getElementById('doc')) {
				//console.log('who: '+who);

				var temp = d.createElement('link');
				temp.setAttribute('title','RSS');
				temp.setAttribute('alt','Created by YouTube Options');
				temp.setAttribute('href','https://api.twitter.com/1/statuses/user_timeline.rss?screen_name='+ who);
				temp.setAttribute('rel','alternate');
				temp.setAttribute('type','application/rss+xml');

				if (d.head) { d.head.appendChild(temp); }

				// add RSS link to header
				var temp = d.createElement('a');
				temp.setAttribute('title','Add "'+who+'" to Google Reader');
				temp.setAttribute('alt','Created by YouTube Options');
				temp.setAttribute('href',proto+'://www.google.com/ig/addtoreader?feedurl=https://api.twitter.com/1/statuses/user_timeline.rss?screen_name='+ who);
				temp.setAttribute('target','_empty');
				temp.setAttribute('id','ytOrss');
				temp.innerHTML='RSS';

				var where = d.getElementsByClassName('container');
				if (where[0]) {
					where[0].appendChild(temp);

					addCSS('#ytOrss {padding-top: 10px; position: absolute; color: #0084B4;} '); // official twitter blue: #00bef6
				}
			}
		}

		// try to embed funny or die
		var bits = d.getElementsByClassName('twitter-timeline-link');
		var bits2 = d.getElementsByClassName('permalink-footer');
		if (bits.length>0 && bits2.length>0) {

			if (bits[0] && bits[0].getAttribute('data-expanded-url')) {
				var where = bits[0].getAttribute('data-expanded-url');
				if (where.indexOf('funnyordie.com')!='-1') {
					var vid = where.split('videos/')[1].split('/')[0];

					var temp = d.createElement('iframe');
					temp.setAttribute('src','http://www.funnyordie.com/embed/'+vid);
					temp.setAttribute('frameborder','0');
					temp.setAttribute('id','video_player');

					var parent = bits2[0].parentNode;
					parent.insertBefore(temp, bits2[0]);
				}
			}
		}

		// iframe
		var bits = d.getElementsByTagName('iframe');
		if (bits.length>0) {
			var foundtube = false;
			for (var i=0;i<bits.length;i++) {
				if (bits[i].src.indexOf('youtube.com')!='-1') {
					// youtube embeded

					foundtube = true;
					bits[i].id='video_player';

					var base='&version=3&enablejsapi=1';
					var newiframe = '';
					var ads='';
					var anno='';
					var clean='';
					var auto='';
					var hide='';

					if (options.InVideo!='default'){ads='&rel=0';anno='&iv_load_policy=3';}
					if (options.InVideo=='ads'){anno='&iv_load_policy=1';}

					var clean='';
					if (options.Cleanup=='true'){clean='&showsearch=0&modestbranding=1';}

					if (options.ControlsTheme=='dark') {clean+='&theme=dark';}
					if (options.ControlsTheme=='light') {clean+='&theme=light';}

					var auto='';
					if (options.AutoPlay=='no' || options.AutoPlay=='playlist') {auto='&autoplay=0';}

					var hide='';
					if (options.Hide=='true') {hide='&autohide=1';}

					newiframe=ads+anno+clean+auto+hide;
					if (newiframe!='') {
						bits[i].src+='?'+base+newiframe+'&iframe=true&origin='+proto+'://www.youtube.com';
					}
				}
				if (bits[i].src.indexOf('player.vimeo.com')!='-1') {
					// vimeo embeded

					foundtube = true;
					bits[i].id='video_player';
				}
				if (bits[i].src.indexOf('dailymotion.com')!='-1') {
					// vimeo embeded

					foundtube = true;
					bits[i].id='video_player';
				}
				if (bits[i].src.indexOf('funnyordie.com')!='-1') {
					// funny or die embeded

					foundtube = true;
					addCSS('#video_player {margin-top: 10px;} ');
				}
			}

			if (foundtube==true) {
				// page has video we can resize
				if (thisbrowser=='chrome') {
					chrome.extension.sendRequest({greeting: 'yto.js', todo: 'pa-show'}, function() {});
				}
				if (thisbrowser=='opera') {
					// let dumb popup know it can show options
					setstor.menu='pa-show';
				}
				if (thisbrowser=='safari') {
					// let dumb popup know it can show options
					setstor.menu='pa-show';
					safari.self.tab.dispatchMessage('savePrefs',setstor);
				}
			} else {
				// page does not have a video
				if (thisbrowser=='chrome') {
					chrome.extension.sendRequest({greeting: 'yto.js', todo: 'pa-hide'}, function() {});
				}
				if (thisbrowser=='opera') {
					// let dumb popup know it needs to hide options
					setstor.menu='pa-hide';
				}
				if (thisbrowser=='safari') {
					// let dumb popup know it needs to hide options
					setstor.menu='pa-hide';
					safari.self.tab.dispatchMessage('savePrefs',setstor);
				}
			}
		}
	}
}

function cleanTimeURL (newurl) {
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

	if (setstor.Wads=='true' && newurl.indexOf('/watch')!='-1' && newurl.indexOf('&wadsworth=1')=='-1') {
		// observe wadsworths constant
		newurl = newurl.replace('&wadsworth=0','')+'&wadsworth=1';
	}
	if (setstor.SSL=='true') {
		// do a pre-emptive ssl swap
		newurl = newurl.replace('http://','https://');
	}

	return newurl;
}

function verifyURL (options) {
	// make url changes (youtube)

	var d=getDOM();

	var origurl = d.URL;
	var taburl = origurl;
	var newurl = origurl;

	if (taburl.search(/http:/i)!='-1' && options.SSL=='true') {
		// add ssl
		newurl = taburl.replace(/http:/gi,'https:');
		bug('adding ssl: '+taburl+' to: '+newurl);
		taburl = newurl;
	}

	if (taburl.search(/#!/) != '-1' && options.InVideo!='default') { // chrome and safari handle this in yt_start.js
		// url with #! prevents removal of in-video
		newurl = taburl.replace(/#!/g, '');
		bug('removing ex.pound from: '+taburl+' to: '+newurl);
		taburl = newurl;
	}

	if (taburl != origurl) {
		// might as well remove cruft from any changes
		taburl = taburl.replace('?feature=player_embedded&', '?').replace('&feature=player_embedded', '').replace(/\&\&/g, '&');

		// something changed, reload the page
		document.location = taburl;
		return false;
	}

	if (options.RSS=='true') {
		// create RSS feed

		var proto='http';
		if (options.SSL=='true'||links.indexOf('https')!='-1') {proto='https';}
		var who='';

		if (ytType=='normal' || ytType=='feather') {
			var a=d.getElementsByClassName('yt-user-name');
			if (a.length>0) {
				for (var i=0;i<a.length;i++) {
					if (a[i] && a[i].className.indexOf('author')!='-1') {
						who = a[i].innerText;
					}
				}
			}
		}

		if (ytType=='watch7') {
			// new youtube interface

			var a=d.getElementById('watch7-container');
			b=a.getElementsByTagName('link');
			for (var i=0;i<b.length;i++) {
				if (b[i] && b[i].getAttribute('itemprop') && b[i].href.indexOf('user/')!='-1') {
					who=b[i].href.split('user/')[1];
				}
			}
		}

		if (ytPage=='user') {
			var parts = links.split('/user/');
			if (parts.length>0) {
				who = parts[1].split('/')[0].split('?')[0];
			}
		}

		if (who!='') {
			// add to html head
			var temp = d.createElement('link');
			temp.setAttribute('title','RSS');
			temp.setAttribute('alt','Created by YouTube Options');
			temp.setAttribute('href',proto+'://gdata.youtube.com/feeds/base/users/'+ who +'/uploads?alt=rss&v=2&orderby=published&client=ytapi-youtube-profile');
			temp.setAttribute('rel','alternate');
			temp.setAttribute('type','application/rss+xml');

			if (d.head) { d.head.appendChild(temp); }

			// add RSS link to header
			var temp = d.createElement('a');
			temp.setAttribute('title','Add "'+who+'" to Google Reader');
			temp.setAttribute('alt','Created by YouTube Options');
			temp.setAttribute('href',proto+'://www.google.com/ig/addtoreader?feedurl='+ proto +'://gdata.youtube.com/feeds/base/users/'+ who +'/uploads?alt=rss&v=2&orderby=published&client=ytapi-youtube-profile');
			temp.setAttribute('target','_empty');
			temp.setAttribute('id','ytOrss');
			temp.innerHTML='RSS';

			if (ytType!='feather') {
				// normal
				var aa = d.getElementById('masthead-search-bar');
				if (aa) { aa.appendChild(temp); }
				// watch7
				var aa = d.getElementById('yt-masthead-content');
				if (aa) {
					aa.insertBefore(temp, d.getElementById('masthead-upload-button-group'));
				}

				if (options.Cleanup=='false') {
					// add seperator
					var temp = d.createElement('span');
					temp.setAttribute('class','masthead-link-separator');
					temp.innerHTML='|';

					var aa = d.getElementById('masthead-search-bar');
					if (aa) { aa.appendChild(temp); }
				}
			}
			if (ytType=='feather') {
				// feather
				if (d.getElementById('se') && d.getElementById('mh')) {
					temp.setAttribute('class','ml');
					d.getElementById('mh').insertBefore(temp, d.getElementById('se').nextSibling);
				}
			}
		}
	}
}

function inlineImages () {
	// create an array of inline images

	var images = [];

	// 0 = chrome hotdogs
	images.push('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB0AAAAdCAIAAADZ8fBYAAACeUlEQVRIS7VUW3KiQBTN2vRHnbJcgNaU/7HUGheSaFWScQXqGtRZDm8EhJZ8zn11i9LE/OTQfTmcvvdAc9Gnfz+DJ5jlpbxcSpwYkRBIhkteLLVCvKTEUgQuEQ0k8SUXRUEhUZerUoOqTNsaQvuym9K2t0ThtPBbUfHjKCTaV6kCRqEYNVI08KpItBClEN/ia6gGbhOZim9eyGEleW7nVTEHszyX5asv4QxHhWAmJTGsXExzU3fGmefiS8KZRQbkr1arbrfb6/V+NWAwGOx2O8g0ldr3LL4Zitk5ozMRuHu73e73+8Ph8HcDRqPRfD6HNkkRRTLJtG8NkLNer8fj8WQymTVgsVgcj0f4IdTLxTfNUoAJTMAamluWnyXh04QKhwk7Syk/wynl2jdJ0oRCkhrCLwYHHzXOREqxEAPWG9+kBrjzcrnsdDpf92273aZkeAfte0qSEyKhAYC9fLNv0P8T1yZiAlR8gcYxBkPgKT4+/j7s2+FwgO9BiigSOYlvbAPcHlun7P9q8v+lFDzB6aYOr8Q3iqI4iijGhug3g+/GypnEWBrHMphGV98oCmVSgO28vr487Ntms4HMSNeHIQ6A+IYMXBACe2m1Wt/pG3w5oS4zDsY3gCPkExHYy/vbO/TtefI8nc5mU2zUdDat8sWfxX6/h99FQCVYGmCEk/gGgR/UANuBZykeAV5xvVZ8fUJAo06a+J3o47P5AQni6/m+53k+HRZSXbVmoikFib72pRRPl9yT6qo1swbxdV3P9TwXp4U08RvRpUDXEIyvhuPW4LAIwXHo6prjONV8xwRXfLmGShyHmSZuRWRd2+k0WnVY1lni+xP4DyqvNKiW7UOoAAAAAElFTkSuQmCC');

	// 1 = opera wrench
	images.push('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABYAAAAWCAYAAADEtGw7AAABxklEQVR42u2VS0sCYRSGxUDqH0SCmzZe0cQL3mjjwo0poSiCNxTBhY7ieEMICv9AhfuWbvMHFBoMSBC0dyEIIdEisIbA4HSOJIQmo0Y7Fw/fMN+ZZ855Z4YRAcC/sBEvFsvl8kVIEAa5Q+oze2uLJSqV6sZms4Hf7+/xPO9cWaxQKOZQq9VnbrebpNBqtepYJ56pWU/sdDqf0uk0+Hw+6Ha7+7/USATFSqVyDuo2l8tBMBgEu91+MLO/pdForgTFmOUcoVDoPZ/PQyqVAovF8ojnNIgEOcSYOJfLNVxHLI1EIq+FQgFYloVoNApWqxX0ej04HA7weDxQrVZvBcXYwU+kBoOhn0gkoFQqQbFYJOh4Ek08HqcbvfR6veNVxDKj0TiRlstlyGQyJPqIxWKjQCAA4XB4VKvVHgaDQQkAtgXF+CAImclk6ieTSRoTstksifhOp3OJNex4PD6lFTlCduiaZcTU6YCyrFQqwDAMYMZ8u92+wP29b4mY1ilLibHTLmZ4j6M/47tLGVKnE6lWqxUtQFjs9Xrfms1mBSPo4Piz0vXFjUbj2mw2f+JHMeQ47nwq/auYMCEnCIPs6nQ60RJs/iCL+QJsuUiqTRwojAAAAABJRU5ErkJggg==');

	// 2 = chrome trash
	images.push('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAAQCAYAAAAmlE46AAAAAXNSR0IArs4c6QAAAAZiS0dEAP8A/wD/oL2nkwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAHpJREFUKM/lkUsOwCAIBecGeCJOSuKqXpMuioa09uO6ixcTnUEU3J0eQAEDWooBmrlgp/BdRhFmkruPnM9EZHN3ZQbfJbHGQpsNaKWUXgRdEWutx43x0Nd2T4xexKc1ifxS/PirQ7SV4WdRRWR7k/rwhxjR2Hxq2YJjBzbopxlpotZQAAAAAElFTkSuQmCC');

	// 3 = yto 16
	images.push('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAACFklEQVQ4EaXBS0hUYRiA4ff71RwHnZlK7YIS7lKDiDZuWniJcRNiIkIQbqJd21a5KqIWRRdw020I2iQYRIskXISgjRQEJkZQUOOtNJ0zzZzOzDnn/8KEIFzO84iqUg5DmQxlqvT9UpO5e+uevH/XYQoueL+hkIdcDoyAKhqJok2HkOZmNBrBb2hEVldfaE/vBQmfPE6ZSxeH2X8ACnkwAvEExBNsExDBZh043AatbQR7dhMqVJVKo+hQ/ys9P6zqOKqdHaqp+6rpad3h8oiq4+hfXz5rePumBtevrBl1sjWk38DHeegfhJ4kpB5AXxLGx2B8DPqSMDAEz8bg1En48R1pacHMzVUYbWhsIwgg9RCGz8FSBmZnYGmRfxRobYfxp7CyDJMTyLHjyKcFNYQhCDA7Db9ykJ4BhP8IO4mAX8JgTKhWUVVA0VwOVYuqAgooupiBhXnoH0QPNkF3EtLTaHUNprC6/MENfFyviKpS8n1cz8P1PILQEoQW1yvi3biGnh5Enk9ga+twR+9QrKszstTXO+m9nemSSAQTi2OdLNsEE4+zxTpZtph4AhOLE2S+om6BaHfvSmX1mbMLKxMvu6hyMBtrYAxiBEwF5B22CGCtBWcDDS2EFrUQbT/6qHLvwNCI+y1jN6ZeHylurhP+XKNYyONvriMiIIBVahJ7MLUxqusbqKjfR1gbm9p1ovOqqCrlMJTpD+JXGeA8zkvnAAAAAElFTkSuQmCC');

	// 4 = yto 16 black and white
	images.push('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAADFBMVEVubm7Hx8cgICD////6mCPJAAAABHRSTlP///8AQCqp9AAAAElJREFUeNqFj0kKwDAQw2T5/3/uEghJW6jwYdDBZuiDD5EwSUpcIeAG0DrrImgpI565RKuV6hCUXVjvcwSmGKXv2ewiNCyk/98eDJMB9vL9CxMAAAAASUVORK5CYII=');

	return images;
}

function slaBanner () {
	// display SLA banner

	var d=getDOM();
	if (!d.getElementById('ytOsla')) {
		var newcss = '#ytOsla {background: #FFF29E; border: 1px solid #D4CDAD; border-radius: 2px; color: rgba(2, 6, 30, .81); font-size: 14px; margin: 18px; padding: 5px 18px; white-space: normal; text-align: left; text-shadow: 0 0 3px white;} #ytOsighted p {padding-bottom: 5px;} sup {font-size:8px;} .pi {margin-left: 18px;} #ytOsla p {margin-top: 14px; margin-bottom: 14px;} #ytOc1 {margin: 0px 0px -7px 0px;} #ytOc2 {margin-right: 4px; margin-bottom: -10px; margin-left: 18px;} #ytOc3 {margin-right: 11px; margin-bottom: -4px; margin-left: 24px;} #ytOc4 {margin-bottom: -3px; margin-left: 1px;} ';
		if (navigator.platform!='MacIntel') { newcss += '.maco {display: none;} '; }
		addCSS (newcss,'ytOSLACSS');

		var link = d.createElement('div');
		link.setAttribute('id','ytOsla');
		var fart = '<p>Thank you for installing <b>YouTube Options';
		if (thisbrowser=='chrome') {fart += '</b>.</p><p>To use this extension you <b>must</b> agree to the Software License Agreement located in the extension Options.';}
		if (thisbrowser=='safari') {fart += '</b>.</p><p>To use this extension you <b>must</b> agree to the Software License Agreement located in the extension Preferences.';}
		if (thisbrowser=='firefox') {fart += '</b>.</p><p>To use this extension you <b>must</b> agree to the Software License Agreement located in the extension Preferences.';}
		if (thisbrowser=='opera') {fart += '</b>.</p><p>To use this extension you <b>must</b> agree to the Software License Agreement located in the extension Preferences.';}
		fart += '</p><br>';

		var images = inlineImages();

		if (thisbrowser=='chrome') { fart += '<p>To get to the options and agree to the Software License Agreement:</p><p><img src="'+ images[0] +'" height="29" width="29" id="ytOc2"> > Tools > Extensions > YouTube Options > Options</p><img src="'+ images[3] +'" height="16" width="16" id="ytOc3"> > Options...</p><p class="onetime"></p><p>To disable or uninstall:</p><p><img src="'+ images[0] +'" height="29" width="29" id="ytOc2"> > Tools > Extensions > YouTube Options > un-check Enabled or <img src="'+ images[2] +'" height="16" width="14" id="ytOc4"></p>'; }
		if (thisbrowser=='safari') { fart += '<p>To get to the options:</p><p class="pi">Safari > Preferences... > Extensions > YouTube Options > Click here to open preferences...</p><p>To disable or uninstall:</p><p class="pi">Safari > Preferences... > Extensions > YouTube Options > Uninstall or Enable YouTube Options</p>'; }
		if (thisbrowser=='opera') { fart += '<p>To get to the options:</p><p class="pi">Opera <span class="maco">> Tools </span>> Extensions > Manage Extensions... > YouTube Options > <img src="'+ images[1] +'" height="22" width="22" id="ytOc1"> > Preferences</p><p>To disable or uninstall:</p><p class="pi">Opera <span class="maco">> Tools </span>> Extensions > Manage Extensions... > YouTube Options > Disable or Uninstall</p>'; }

		link.innerHTML=fart;

		d.body.insertBefore(link,d.body.firstChild);
	}
}

function dupeCheck () {
	// look for another version of this extension

	var d=getDOM();
	if (d.getElementById('ytObase')) {
		var newcss = '#ytOsighted {background: #FFF29E; border: 1px solid #D4CDAD; border-radius: 2px; color: rgba(2, 6, 30, .81); font-size: 14px; margin: 18px; padding: 5px 18px; white-space: normal; text-align: left; text-shadow: 0 0 3px white;} #ytOsighted p {margin-top: 14px; margin-bottom: 14px;} #ytOsighted img {display: inline-block;} sup {font-size:8px;} .pi {margin-left: 18px;} #ytOc1 {margin: 0px 0px -7px 0px;} #ytOc2 {margin-right: 4px; margin-bottom: -10px; margin-left: 18px;} #ytOc3 {margin-right: 11px; margin-bottom: -4px; margin-left: 24px;} #ytOc4 {margin-bottom: -3px; margin-left: 1px;} ';
		if (navigator.platform!='MacIntel') { newcss += '.maco {display: none;} '; }
		addCSS (newcss,'ytOsightedCSS');

		var link = d.createElement('div');
		link.setAttribute('id','ytOsighted');

		var fart = '<p>It looks like you have another version of <b>YouTube Options</b> installed.  You should disable or uninstall one copy.</p>';

		var images = inlineImages();

		if (thisbrowser=='chrome') { fart += '<p>To disable or uninstall:</p><p><img src="'+ images[0] +'" height="29" width="29" id="ytOc2"> > Tools > Extensions > YouTube Options > Enabled or <img src="'+ images[2] +'" height="16" width="14" id="ytOc4"></p>'; }
		if (thisbrowser=='safari') { fart += '<p>To disable or uninstall:</p><p class="pi">Safari > Preferences... > Extensions > YouTube Options > Uninstall or Enable YouTube Options</p>'; }
		if (thisbrowser=='opera') { fart += '<p>To disable or uninstall:</p><p class="pi">Opera <span class="maco">> Tools </span>> Extensions > Manage Extensions... > YouTube Options > Disable or Uninstall</p>'; }

		link.innerHTML=fart;

		// found another version running
		d.body.insertBefore(link,d.body.firstChild);
		return false;
	}

	// this is the only version running so far
	addCSS ('','ytObase');
	return true;
}

function browserFail () {
	// look for another version of this extension

	var d=getDOM();

	var newcss = '#ytOsighted {background: #FFF29E; border: 1px solid #D4CDAD; border-radius: 2px; color: rgba(2, 6, 30, .81); font-size: 14px; margin: 18px; padding: 5px 18px; white-space: normal; text-align: left; text-shadow: 0 0 3px white;} #ytOsighted p {margin-top: 14px; margin-bottom: 14px;} #ytOsighted img {display: inline-block;} sup {font-size:8px;} .pi {margin-left: 18px;} #ytOc1 {margin: 0px 0px -7px 0px;} #ytOc2 {margin-right: 4px; margin-bottom: -10px; margin-left: 18px;} #ytOc3 {margin-right: 11px; margin-bottom: -4px; margin-left: 24px;} #ytOc4 {margin-bottom: -3px; margin-left: 1px;} ';
	addCSS (newcss,'ytOsightedCSS');

	var link = d.createElement('div');
	link.setAttribute('id','ytOsighted');

	var fart = '<p>YouTube Options could not retrieve its settings.  This can occur if you have site-data blocked.</p>';

	var images = inlineImages();

	if (thisbrowser=='chrome') { fart += '<p><img src="'+ images[0] +'" height="29" width="29" id="ytOc2"> > Settings > Privacy > Content settings... > Allow local data to be set (recommended)</p>'; }
	if (thisbrowser=='safari') {}
	if (thisbrowser=='opera') {}

	link.innerHTML=fart;

	// found another version running
	d.body.insertBefore(link,d.body.firstChild);
	return false;
}

function gotOpts () {
	// do something with the options

	//slaBanner();
	//dupeCheck();

	if (options && !options.VersionsNote) {
		slaBanner();
		return false;
	}

	if (options&&options.Sites=='false') {
		if (vidtype=='youtube'&&options.youtube=='false') { return false; }
		if (vidtype=='vimeo'&&options.vimeo=='false') { return false; }
		if (vidtype=='dailymotion'&&options.daily=='false') { return false; }
		if (vidtype=='metacafe'&&options.meta=='false') { return false; }
		if (vidtype=='g4tv'&&options.g4tv=='false') { return false; }
		if (vidtype=='fearnet'&&options.fear=='false') { return false; }
		if (vidtype=='funny'&&options.funny=='false') { return false; }
		if (vidtype=='hulu'&&options.hulu=='false') { return false; }
		if (vidtype=='escapist'&&options.escapist=='false') { return false; }
		if (vidtype=='dump'&&options.dump=='false') { return false; }
		if (vidtype=='twitter'&&options.twitter=='false') {
			if (thisbrowser=='safari') {safari.self.tab.dispatchMessage('pa-hide','');}
			return false;
		}
		if ((vidtype=='ph'||vidtype=='t8'||vidtype=='xvid'||vidtype=='instagram') && options.others=='false') { return false; }
	}

	if (options.youtubeHome=='false' && ytPage=='home') { return false; }
	if (options.youtubeUser=='false' && ytPage=='user') { return false; }
	if (options.youtubeChannel=='false' && ytPage=='channel') { return false; }

	if (options.Filtering=='false' || options.Filtering=='once') {
		// do not filter the page

		if (options.Filtering=='once') {
			// turn filters back on
			if (thisbrowser=='chrome') {
				chrome.extension.sendRequest({greeting: 'yto.js', todo: 'pa-on'}, function() {});
			}
			if (thisbrowser=='safari') {
				setstor.Filtering='true';
				safari.self.tab.dispatchMessage('savePrefs',setstor);
			}
			if (thisbrowser=='opera') {
				setstor.Filtering='true';
			}
		}
		return false;
	}

	var d=getDOM();

	if (vidtype=='youtube'){
		verifyURL(options);
		ytControls=ytControlls();

		// add youtube video type to footer
		appendYTType();

		// add old-skool frame around video
		if (options.Frame=='true' && options.Cleanup=='false' && options.SetView=='default') {makeFrame();}

		// set volume
		if (options.Volume!='default') {
			setVolume(options.Volume);
		}
	}

	if (options.ytVers!=ytType) {
		if (thisbrowser=='chrome') { chrome.extension.sendRequest({greeting: 'ytVers', todo: ytType}, function() {}); }
		if (thisbrowser=='safari') { safari.self.tab.dispatchMessage('savePrefs','{"ytVers":"'+ytType+'"}'); }
		if (thisbrowser=='opera') {}
	}

	// see if dom needs tweaking
	modSite(vidtype);

	// bail group
	if (vidtype=='instagram') { return false; }

	options.Cinemizep='false';
	if (options.Cinemize=='true') {options.Cinemizep='true';}

	var viewexp='false';

	if (options.SetView=='exp' && options.ChangeResView=='false') {viewexp='true';}
	options.viewexp=viewexp;

	// hide objects
	hideStuff(options);

	// mod links
	if (options.SetLink!='default'||options.MoPlay=='true') {
		modLinks();
	}

	if (options.ScrollTop=='true' && !d.getElementById('ytOsighted')) {
		// scroll to top of video (youtube)
		setTimeout(function(){scrollToTop (d);},1250);
	}
}

function makeFrame () {
	// old-skool frame around video (youtube)

	var newback = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFEAAABRBAMAAABYoVcFAAAAD1BMVEUkJCQlJSUjIyMmJiYiIiJVc4zMAAAFE0lEQVR4XkXVwW0YzIFD4UfKBZCjFMAZpwDJFTh//0UtsAKSG/FdeXjILIHQqED4LlwhGgNNCkCaHAimNAQFjqSvGgI0CqDyZQMl0dc/5OP+VVHPNw8MOeQvYUKhUO9GA7g/Tsnl01vgdEAQoAlu84lAG4QwgxJQUmC0p+2T3XBNHU4w/++BovBABFWHGQRC3xgApARaxM6zBqDcP+Z4LXDzbwAAooGdrpgCCZwhI0YQowAMbsSLQwDCCTAkwQORwTOuMchxad3UbFgHg5CVkMXh+H1EPKH0yqbEITxFeAGPzvCgewjEQOddwWAEk5BQ9zFmP/qkv7w1kMgDjt8Ko1H/VT0mNVGfovx4pEH0mfDxaRdk5GLSko3WFhIIwYKq1mQO/bfQhwCk8l2TnaBfEAAKUQ25BgkPAGGoObkPkHsJGd8oT6H91tDRCBqf5Nsj509JiKYIYDTRSSREBAFgcrBUZAC8B+2VwSjhMAZ7NG/qWJPxuGjW849bV4nhQZ4CkJBBzwdjwPktAIU88GAlgi8AESRg2CWFCgQ3JdyCdmNzbZcpSrQGuGVjDNzCwEQRwtw8jIonWCC/DNNIBAJyw4g3Jkj0KwS+liAwBASXDaMFFIwBETLhdjaWEz4DQV+IX+14PgoBIt5AQuUy9r9XHghU7gF5IUp9lZNgAKqzEL56bvJHgdI1N3Sn0FJJ5za1stBJpOCBwGrzKaIhWmVGbKr6UTJwNGcFzzDMviGgZy2MawILTxAw260wsUJ4F+fk7ZoAx+SLiYLQoUNhAb4ZqdDXDcwPDlkDgGclYAYhU4AFjV8AATx8W7GL4MHoXgwAbXUW+D6U3gyQrYYsUjOlA+kLws0B/B8dHtzDVRGhuuC/wFFXIGP6Rzn4MhyEIMJXjzADGr/vakj6KWzm3AlJiAFAe1im1ron+sAmUAVktZ4CgDGXSLCL9V+/Q0mjN0IbAbLH4ep4CKFWByl7Yb8F7Ntxhr4H9AxQovd9rnvhc0CByujECMxvFBpw43FkFJkL6PBUQFaqPBwCCr9UsJ74VNAyBw61YmDN8rcvAASZMtCBfIFIWtHQdNHPhh9PoM2XLQNF559I/CWof+onM3qUIcQhTyQH9VJtApSIJ1JDx8lArUBMYaRcjjZow5QpEAEwIcjlXc4PiRDCjXsTEKleIEq/dfBrtAHFwSifTaCM2TBAmAU4E8s2a3AlUJVmx6+AUfTncKYmyY0RAwMMDYmAKkbmbDw0CEBLsK9L4MVxfjDBmxvMCzIA/HEcu4InPhMpRvsyBxyBbwJTwH5KZwFFPvz0Hb9FeIFjZMxY/OhD401nU7CAnLdCaIwn9jZh6TESGuIJzG7CCuopT66Sr34/cVmTj+Y3E6WEj5IasOiD9oPcqT8eELIWhNrDWY/yLpIEyw3fhSyHeAAcLgbci0ykRmxhHKQn0jfIqfJNtlo8cBJ2ckSKhpwY4AREIiKAvdDCQUDEySBMDv+aOt44fzGT4GI4U41HHuxR/xVBN8ryQLres77+M4J+hzh4eAXBV8hE+IQw8I83dINguBEKwex4YgKHJWmkC1yi8FG43DgSJNYNOtziv9wawA8sNQYLIolZ/gcmFK5ZII4ACAHBgB8RBIKMCF8Dl9n8khPEwOrgVzP7f30Xo6BI7/oJKVH4ryPuAXLjEXbVg2AxibLwSHzTcxPqQdTmEid5IFAPJqQdHAJR9smO2q9PERFJ+ai+/Jnlv33/P9zXh7x0fTmDAAAAAElFTkSuQmCC';

	var newcss = '';
	if (options.Cleanup=='true') {
		newcss += '#watch7-video {background: url('+newback+');} ';
	} else {
		newcss += '#watch7-video-container {background: url('+newback+');} ';
	}

	if (options.Mood=='dim' && options.Swatch=='#000000') {
		newcss += '#ytOlinks span, #ytOlinks:hover span {color: rgba(255,255,255, .81) !important;} ';
		newcss += '#ytOlinks a, #ytOlinks:hover a {color: rgba(255,255,255, 1) !important;} ';
	} else {
		newcss += '#ytOlinks:hover span {color: #999;} #ytOlinks:hover a {color: #85BFE6;} ';
	}
	// 468aca
	addCSS(newcss,'ytOframe');
}

function modLinks () {
	// modify new video links

	var d=getDOM();
	var bits=d.getElementsByTagName('a');

	if (!bits){return false;}
	if (bits.length==0){return false;}

	if (options.SetLink=='pop' || options.SetLink=='in' || options.MoPlay=='true') {
		// http://code.google.com/apis/youtube/player_parameters.html

		var proto='http';
		if (options.SSL=='true'||links.indexOf('https')!='-1') {proto='https';}

		var width=640;var height=360;
		if (options.SetView!='default') {
			//if (options.SetView=='2304') {width=4096;height=2304;}
			if (options.SetView=='1080') {width=1920;height=1080;}
			if (options.SetView=='720') {width=1280;height=720;}
			if (options.SetView=='540') {width=960;height=540;}
			if (options.SetView=='480') {width=854;height=480;}
			if (options.SetView=='360') {width=640;height=360;}
			if (options.SetView=='240') {width=320;height=240;}
		}

		var base='&version=3&enablejsapi=1';

		var anno='';
		var ads='';
		if (options.InVideo!='default') {ads='&rel=0';anno='&iv_load_policy=3';}
		if (options.InVideo=='ads') {anno='&iv_load_policy=1';}

		var clean='';
		if (options.Cleanup=='true') {clean='&showsearch=0&modestbranding=1';}

		if (options.ControlsTheme=='dark') {clean+='&theme=dark';}
		if (options.ControlsTheme=='light') {clean+='&theme=light';}

		var auto='';
		if (options.AutoPlay=='no' || options.AutoPlay=='playlist') {auto='&autoplay=0';}

		var hide='';
		if (options.Hide=='true') {hide='&autohide=1';}

		if (options.SetRes!='default') {
			// view quality
			if (options.SetRes=='240') {base+='&vq=small';}
			if (options.SetRes=='360') {base+='&vq=medium';}
			if (options.SetRes=='480') {base+='&vq=large';}
			if (options.SetRes=='720') {base+='&vq=hd720';}
			if (options.SetRes=='1080') {base+='&vq=hd1080';}
		}

		// yeah, this does not work
		//var cc='&cc_load_policy=0';
		//if (options.indexOf('showcc')!='-1'){cc='&cc_load_policy=1';}

		var ytVidType=vidKind();

		var wapl = 'watch-player';
		var wavi = 'watch-video';
		var wasb = 'watch-sidebar';
		if (ytType=='watch7') {
			wapl = 'watch7-player';
			wavi = 'watch7-video';
			wasb = 'watch7-sidebar';
		}
		if (ytType=='feather') {
			wapl = 'p';
			wavi = 'p';
			wasb = 'rc';
		}

		var wmode='';
		if (options.Wmode=='true') { wmode='wmode="direct"'; }
	}

	// get a list of all video links to modify
	for (var i=0; i<bits.length; i++) {
		if (bits[i].href.indexOf('/watch?')!='-1' && !bits[i].getAttribute('ytO')) {

			// been here before - needed for more videos link
			bits[i].setAttribute('ytO','seen');

			if (options.SetLink=='win') {
				// convert links to open in new window/tab

				bits[i].target='_empty';
			}

			if (options.SetLink=='pop' || options.SetLink=='in' || options.MoPlay=='true') {

				// get video id from url for popup, popin, and mouseover play
				var vidid=bits[i].href.split('v=')[1].split('&')[0];

				if (vidid && (bits[i].className.indexOf('related-video')!='-1' || ytType=='feather')) {
					// convert links to be popups

					// popout
					if (options.SetLink=='pop') {
						bits[i].addEventListener('click',function(){

							var vidid=event.target.parentElement.href.split('v=')[1].split('&')[0];
							var vidtitle=event.target.innerText;

							var newwhere=proto+'://www.youtube.com/v/'+vidid;
							if (ytVidType=='html5') {newwhere=proto+'://www.youtube.com/embed/'+vidid+'?';}

							var loop='';
							if (options.Loop=='true'){loop='&loop=1&playlist='+vidid;}
							newwhere+=ads+clean+auto+hide+anno+base+loop;
							if (ytVidType=='html5') {newwhere+='&iframe=true&origin='+proto+'://www.youtube.com';}

							window.open(newwhere,vidid,'width='+width+',height='+height);

							// prevent default event
							event.preventDefault();
						},true);
					}

					// popin
					if (options.SetLink=='in') {
						bits[i].addEventListener('click',function(){
							var vidid = event.target.parentElement.href.split('v=')[1].split('&')[0];
							var vidtitle = event.target.innerText;

							var newwhere = proto+'://www.youtube.com/v/'+vidid;
							if (ytVidType=='html5') {newwhere = proto+'://www.youtube.com/embed/'+vidid+'?';}

							var loop='';
							if (options.Loop=='true'){loop='&loop=1&playlist='+vidid;}
							newwhere += ads+clean+auto+hide+anno+base+loop;
							if (ytVidType=='html5') {newwhere+='&iframe=true&origin='+proto+'://www.youtube.com';}

							var d=document;
							var aa=d.getElementById(wapl);
							if (aa) {
								if (ytVidType=='flash') {
									aa.innerHTML='<embed width="100%" height="100%" name="plugin" src="'+newwhere+'" type="application/x-shockwave-flash" id="movie_player" allowscriptaccess="always" allowfullscreen="true" '+wmode+'>';
								}
								if (ytVidType=='html5') {
									aa.innerHTML='<iframe id="player" type="text/html" width="100%" height="100%" src="'+newwhere+'" class="ytOpopin" frameborder="0" allowfullscreen style="display:block !important;">';
								}
							}

							// change things that are no longer valid
							if (d.getElementById('watch-headline-title')) {d.getElementById('watch-headline-title').children[0].textContent=vidtitle;}
							if (d.getElementById('vt')) {d.getElementById('vt').textContent=vidtitle;}
							if (d.getElementById('watch7-sidebar')) {d.getElementById('watch7-sidebar').style.paddingTop='15px';}

							// delete things that are no longer valid
							if (d.getElementById('watch7-user-header')) {(elem=d.getElementById('watch7-user-header')).parentNode.removeChild(elem);}
							if (d.getElementById('watch7-action-buttons')) {(elem=d.getElementById('watch7-action-buttons')).parentNode.removeChild(elem);}
							if (d.getElementById('watch7-action-panels')) {(elem=d.getElementById('watch7-action-panels')).parentNode.removeChild(elem);}
							if (d.getElementById('watch7-discussion')) {(elem=d.getElementById('watch7-discussion')).parentNode.removeChild(elem);}
							if (d.getElementById('ytOlinks')) {(elem=d.getElementById('ytOlinks')).parentNode.removeChild(elem);}

							if (d.getElementById('vc')) {(elem=d.getElementById('vc')).parentNode.removeChild(elem);}
							if (d.getElementById('vo')) {(elem=d.getElementById('vo')).parentNode.removeChild(elem);}
							if (d.getElementById('ffd')) {(elem=d.getElementById('ffd')).parentNode.removeChild(elem);}
							if (d.getElementById('de')) {(elem=d.getElementById('de')).parentNode.removeChild(elem);}
							if (d.getElementById('cm')) {(elem=d.getElementById('cm')).parentNode.removeChild(elem);}
							if (d.getElementById('rc')) {d.getElementById('rc').style.marginLeft='0 !important';}
							d.title=vidtitle;

							// prevent default event
							event.preventDefault();

							// look for sidebar staying
							makeSidebarStay();
						},true);
					}

					// moplay
					if (options.MoPlay=='true') {
						bits[i].firstChild.id=vidid;
						bits[i].firstChild.addEventListener('mouseover',function(){
							var vidid=event.target.parentNode.parentNode.parentNode.parentNode.id;
							var vidtitle=event.target.parentNode.parentNode.parentNode.parentNode.nextSibling.innerText;

							var newwhere=proto+'://www.youtube.com/v/'+vidid;
							if (ytVidType=='html5') {newwhere=proto+'://www.youtube.com/embed/'+vidid+'?';}

							var loop='';
							if (options.Loop=='true'){loop='&loop=1&playlist='+vidid;}
							newwhere+=ads+clean+auto+hide+anno+base+loop;
							if (ytVidType=='html5') {newwhere+='&iframe=true&origin='+proto+'://www.youtube.com';}

							var d=document;
							var aa=d.getElementById(wapl);
							if (aa) {
								if (ytVidType=='flash') {
									aa.innerHTML='<embed width="100%" height="100%" name="plugin" src="'+newwhere+'&autoplay=1" type="application/x-shockwave-flash" id="movie_player" allowscriptaccess="always" allowfullscreen="true" '+wmode+'>';
								}
								if (ytVidType=='html5') {
									aa.innerHTML='<iframe id="player" type="text/html" width="100%" height="100%" src="'+newwhere+'&autoplay=1" class="ytOpopin" frameborder="0" allowfullscreen style="display:block !important;">';
								}
							}

							// change things that are no longer valid
							if (d.getElementById('watch-headline-title')) {d.getElementById('watch-headline-title').children[0].textContent=vidtitle;}
							if (d.getElementById('vt')) {d.getElementById('vt').textContent=vidtitle;}
							if (d.getElementById('watch7-sidebar')) {d.getElementById('watch7-sidebar').style.paddingTop='15px';}

							// delete things that are no longer valid
							if (d.getElementById('watch7-user-header')) {(elem=d.getElementById('watch7-user-header')).parentNode.removeChild(elem);}
							if (d.getElementById('watch7-action-buttons')) {(elem=d.getElementById('watch7-action-buttons')).parentNode.removeChild(elem);}
							if (d.getElementById('watch7-action-panels')) {(elem=d.getElementById('watch7-action-panels')).parentNode.removeChild(elem);}
							if (d.getElementById('watch7-discussion')) {(elem=d.getElementById('watch7-discussion')).parentNode.removeChild(elem);}
							if (d.getElementById('ytOlinks')) {(elem=d.getElementById('ytOlinks')).parentNode.removeChild(elem);}

							if (d.getElementById('vc')) {(elem=d.getElementById('vc')).parentNode.removeChild(elem);}
							if (d.getElementById('vo')) {(elem=d.getElementById('vo')).parentNode.removeChild(elem);}
							if (d.getElementById('ffd')) {(elem=d.getElementById('ffd')).parentNode.removeChild(elem);}
							if (d.getElementById('de')) {(elem=d.getElementById('de')).parentNode.removeChild(elem);}
							if (d.getElementById('cm')) {(elem=d.getElementById('cm')).parentNode.removeChild(elem);}
							if (d.getElementById('rc')) {d.getElementById('rc').style.marginLeft='0 !important';}
							d.title=vidtitle;

							// prevent default event
							event.preventDefault();
						},true);
					}
				} else {
					bug('NOT GOING AT: '+vidid);
				}
			}
		}
	}

	if (options.Cleanup=='true' && ytType=='normal') {
		// setup a listener for the more suggested videos button
		var morebut=d.getElementById('watch-more-related-button');
		if (morebut&&getStyle(morebut).getPropertyValue('display')!='none'&&d.getElementById('watch-more-related-loading')) {
			morebut.addEventListener('mousedown',function(){
				setTimeout(function(){moreModLinks();},600);
			});
		}
	}
}

function moreModLinks () {
	// wait for more videos to populate to mod links

	waiter3 = setInterval(function () {
		if (!document.getElementById('watch-more-related-loading')) {
			modLinks();
			clearTimeout (waiter3);
			document.getElementById('watch-related').style.height='540px';
			document.getElementById('watch-more-related').style.height='540px';

			// expand width to include second column
			document.getElementById('watch-sidebar').style.width='575px';
		}
	},180);
}

function addKeyControls () {
	// add spacebar control

	var d=getDOM();
	if (d.body) {d.body.addEventListener('keydown',function(){
		var e=window.event||window.Event;
		var evtobj=window.event ? event : ev; //distinguish between explicit and implicit events
		var unicode=evtobj.charCode ? evtobj.charCode : evtobj.keyCode;

		bug('keypress in: '+d.activeElement.nodeName+' '+unicode+' '+d.activeElement.id);
		//console.log('keypress in: '+d.activeElement.nodeName+' '+unicode+' '+d.activeElement.id);

		// 49 = 1 = 1080
		// 50 = 2 = 240
		// 51 = 3 = 360
		// 52 = 4 = 480
		// 53 = 5 = 520
		// 55 = 7 = 720

		// 96 = keypad 0 = volume mute
		// 97 = keypad 1 = volume 10%
		// 98 = keypad 2 = volume 20%
		// 99 = keypad 3 = volume 30%
		// 100 = keypad 4 = volume 40%
		// 101 = keypad 5 = volume 50%
		// 102 = keypad 6 = volume 60%
		// 103 = keypad 7 = volume 70%
		// 104 = keypad 8 = volume 80%
		// 105 = keypad 9 = volume 90%
		// 13 = enter/keypad enter = volume max

		// 87 = w = window
		// 107 = keypad + = window
		// 32 = space = play/pause

		// 67 = c = comment
		// 68 = d = description
		// 70 = f = footer
		// 71 = g = guide
		// 72 = h = header
		// 80 = p = playlist
		// 83 = s = suggested
		// 84 = t = title
		// 89 = y = downloads
		// 90 = z = cinemize

		if (d.activeElement.nodeName == 'BODY') {

			// we dont need these keys
			if (evtobj.altGraphKey || evtobj.metaKey || evtobj.altKey || evtobj.ctrlKey) {return false;}

			var thekeys=[49,50,51,52,53,55, 96,97,98,99,100,101,102,103,104,105,13 ,87,107,32, 67,68,70,71,72,80,83,84,89,90];
			if (inArray (unicode.toString(), thekeys)) {
				event.preventDefault();

				var mode='';
				var res='';
				if (unicode==49) {mode='1080p'; res='hd1080';}
				if (unicode==50) {mode='240p'; res='small';}
				if (unicode==51) {mode='360p'; res='medium';}
				if (unicode==52) {mode='480p'; res='large';}
				if (unicode==53) {mode='540p';}
				if (unicode==55) {mode='720p'; res='hd720';}
				if (unicode==87) {mode='viewexp';}

				if (mode!='') {
					if (evtobj.shiftKey) {
						if (res!='') {
							console.log('YTO: setting Viewing quality');
							var ytVidType = vidKind();
							if (ytVidType=='flash') {
								setResolution(res,ytVidType);
							}
						}
					} else {
						console.log('YTO: setting Viewing size');
						changeSize(mode);
					}
				}

				// resolution should have picked it up by now
				if (evtobj.shiftKey) {return false;}

				if (unicode==32) {
					console.log('YTO: play/pause');

					var ytVidType = vidKind();
					var player = getPlayer(ytVidType);

					if (player) {
						if (ytVidType=='flash') {
							if (player.getPlayerState()==1) {
								player.pauseVideo();
							} else {
								player.playVideo();
							}
						} else {
							// html5
							var aa = d.getElementById('movie_player');
							var ab = d.getElementById('movie_player-html5');
							if (aa || ab) {
								if ((aa && aa.className.indexOf('playing-mode')!='-1') || (ab && ab.className.indexOf('playing-mode')!='-1')) {
									player.pause();
								} else {
									player.play();
								}
							}
						}
					}
				}

				if (unicode==67) { handlePopup('comments'); console.log('YTO: comments!'); }
				if (unicode==68) { handlePopup('description'); console.log('YTO: description!'); }
				if (unicode==70) { handlePopup('footer'); console.log('YTO: footer!'); }
				if (unicode==71) { handlePopup('guide'); console.log('YTO: guide!'); }
				if (unicode==72) { handlePopup('header'); console.log('YTO: header!'); }
				if (unicode==80) { handlePopup('playlist'); console.log('YTO: playlist!'); }
				if (unicode==83) { handlePopup('sidebar'); console.log('YTO: suggested!'); }
				if (unicode==84) { handlePopup('headline'); console.log('YTO: title!'); }
				if (unicode==89) { handlePopup('downloads'); console.log('YTO: downloads!'); }
				if (unicode==90) { handlePopup('cinemize'); console.log('YTO: cinemize!'); }

				if (unicode==96) { setVolume(0); console.log('YTO: volume!'); }
				if (unicode==97) { setVolume(10); console.log('YTO: volume!'); }
				if (unicode==98) { setVolume(20); console.log('YTO: volume!'); }
				if (unicode==99) { setVolume(30); console.log('YTO: volume!'); }
				if (unicode==100) { setVolume(40); console.log('YTO: volume!'); }
				if (unicode==101) { setVolume(50); console.log('YTO: volume!'); }
				if (unicode==102) { setVolume(60); console.log('YTO: volume!'); }
				if (unicode==103) { setVolume(70); console.log('YTO: volume!'); }
				if (unicode==104) { setVolume(80); console.log('YTO: volume!'); }
				if (unicode==105) { setVolume(90); console.log('YTO: volume!'); }
				if (unicode==13) { setVolume(100); console.log('YTO: volume!'); }
			}
		}
	},false);}
}

function addYtPopControl () {
	// add and handle title popout button (youtube)

	var d=getDOM();
	var ha = d.getElementById('watch-headline-title'); // normal youtube
	var ha2 = d.getElementById('vt'); // feather youtube
	if (ha || ha2) {
		var temp = d.createElement('a');
		temp.setAttribute('id','ytOpop');
		temp.setAttribute('title','Pop this video out into a window');
		var temp2 = d.createElement('img');
		// temp2.src = added in the fixPopout function
		temp.appendChild(temp2);

		temp.addEventListener('click', function(event) {
			event.preventDefault();

			event.target.parentNode.className = 'popped';

			var p = d.getElementById('movie_player');
			var p2 = d.getElementById('movie_player-html5');
			var p3 = d.getElementById('player');

			var width=854;
			var height=480;

			if (p || p2 || p3) {
				var vidid = 'NaN';
				if (p) {
					if (p.getAttribute('flashvars')) {
						// flash
						var bits = p.getAttribute('flashvars').split('&video_id=');
						if (bits.length>0) {
							vidid = bits[1].split('&')[0];
						}
					}
					if (p.outerHTML.indexOf('plugin')!='-1') {
						// flash popin
						var bits = p.outerHTML.split('/v/');
						if (bits.length>0) {
							vidid = bits[1].split('&')[0];
						}
					}

					if (p.parentNode) {
						height = p.parentNode.clientHeight;
						width = p.parentNode.clientWidth;
					}
				}

				if (p2) {
					// html5
					var bits = p2.outerHTML.split('data-youtube-id="');
					if (bits.length>0) {
						vidid = bits[1].split('"')[0];
					}
					height = p2.clientHeight;
					width = p2.clientWidth;
				}

				if (p3) {
					// html5 popin
					var bits = p3.outerHTML.split('/embed/');
					if (bits.length>0) {
						vidid = bits[1].split('?')[0];
					}
					height = p3.clientHeight;
					width = p3.clientWidth;
				}

				if (vidid!='NaN') {
					var proto = 'http';
					if (document.URL.indexOf('https://')!='-1') {proto = 'https';}

					var base='&version=3&enablejsapi=1';

					var anno='';
					var ads='';
					if (options.InVideo!='default'){ads='&rel=0';anno='&iv_load_policy=3';}
					if (options.InVideo=='ads'){anno='&iv_load_policy=1';}

					var clean='';
					if (options.Cleanup=='true'){clean='&showsearch=0&modestbranding=1';}

					if (options.ControlsTheme=='dark') {clean+='&theme=dark';}
					if (options.ControlsTheme=='light') {clean+='&theme=light';}

					var auto='';
					if (options.AutoPlay=='no' || options.AutoPlay=='playlist') {auto='&autoplay=0';}

					var hide='';
					if (options.Hide=='true') {hide='&autohide=1';}

					var loop='';
					if (options.Loop=='true'){loop='&loop=1&playlist='+vidid;}

					// flash version
					var newwhere = proto+'://www.youtube.com/v/'+vidid;

					// html5 version
					if (p2 || p3) {newwhere = proto+'://www.youtube.com/embed/'+vidid+'?';}

					// determine if we should pickup where we were playing
					var ytVidType = vidKind();
					var player = getPlayer(ytVidType);
					if (ytVidType=='flash' && player.getPlayerState()==1) {
						// start playing where it left off
						auto = '&autoplay=1';
						auto += '&start='+player.getCurrentTime().toFixed(0);

						// set the same resolution
						var res = player.getPlaybackQuality();
						auto += '&vq='+res;

						// pause the main player
						player.pauseVideo();
					}

					if (event) {
						if (event.shiftKey) {
							// shift key = small audio player
							height = 34;
							width = 240;
						}
						//if (event.ctrlKey) {}
						if (event && !event.altKey) {
							// alt key = disable all settings
							newwhere += ads+clean+auto+hide+anno+base+loop;
						}
					}

					if (p2 || p3) {newwhere += '&iframe=true&origin='+proto+'://www.youtube.com';}

					window.open(newwhere,vidid,'width='+width+',height='+height);
				} else {
					console.log ('ytO: no video_id found for popout.');
				}
			}
		},false);

		var newcss = '#ytOpop img {margin-bottom: -2px; opacity: .747;} #ytOpop.popped img {opacity: .18;} #ytOpop:active img {margin-bottom: -3px; margin-right: 1px; margin-left: -1px; opacity: 1;} ';

		// append to header
		if (ha) {ha.appendChild(temp);}
		if (ha2) {ha2.appendChild(temp); newcss += '#ytOpop {margin-left: 9px;} ';}

		addCSS(newcss,'ytOpopCSS');
		fixPopout();
	}
}

function resizePlaylist () {
	// resize the youtube flash playlist

	// make sure the playlist is showing
	var aa = d.getElementById('watch7-container');
	var ab = d.getElementById('watch7-player');

	if (aa==null || ab==null || aa.className.indexOf('watch-playlist')=='-1') {return false;}

	if (aa.className.indexOf('watch-playlist-collapsed')!='-1') {
		// make the playlist show
		aa.className = aa.className.replace(' watch-playlist-collapsed','');
	}

	// default to smallest playlist for small size
	var listwidth=183;
	if (d.body && d.body.className.indexOf(' sidebar-expanded')!='-1') {
		listwidth=305;
	}

	var vidheight = ab.clientHeight;
	var vidwidth = ab.clientWidth;

	var newcss='';
	newcss += '#watch7-playlist-tray-container {height: '+(vidheight)+'px !important;} ';
	newcss += '#watch7-playlist-data .watch7-playlist-bar {width: '+(vidwidth+listwidth)+'px;} ';
	// hide playlist show/hide button
	newcss += '#watch7-playlist-bar-toggle-button {display: none !important;} ';
	newcss += '#watch7-playlist-tray {border-bottom: 0;} ';

	if (newcss!='') {
		addCSS(newcss,'ytOsidebar');
	}
}

function addFlashControls () {
	// add event listener for click to resize playlist (youtube flash)
	// html5 handled in addHTML5controls

	var d=getDOM();
	var mp=d.getElementById('movie_player');

	// make sure the playlist is showing
	var aa = d.getElementById('watch7-container');

	if (vidtype=='youtube' && mp && aa && aa.className.indexOf('watch-playlist')!='-1') {
		// timed poll due to ability to resize window

		var last=0;
		var last2='';
		waiter4 = self.setInterval(function(){
			if (last!=mp.clientWidth || last2!=d.body.className) { last=mp.clientWidth; last2=d.body.className; resizePlaylist(); }
		},1089);
	}
}

function addHTML5controls (options) {
	// add events to buttons (youtube html5)

	var d=getDOM();

	if (!d.getElementById('ytOhtml5')) {
		bug('ytO: appending html5 workaround');
		var temp=document.createElement('input');
		temp.setAttribute('type','hidden');
		temp.setAttribute('id','ytOhtml5');
		if (document.body) { document.body.appendChild(temp); }
	}

	var buts=d.getElementsByTagName('button');
	for (var i=0;i<buts.length;i++) {
		// full-screen fix
		if (buts[i].getAttribute('data-value')&&buts[i].getAttribute('data-value')=='fullscreen') {
			bug('found full screen html5 button');
			buts[i].addEventListener('click',function(){
				bug('clean the css for full-screen html5!');
				var ma=d.getElementById('ytOvid');
				var mb=d.getElementById('ytOhtml5');
				if (ma&&mb) {
					if (ma.textContent!='') {
						mb.value=ma.textContent;
						ma.textContent='';
						mb.setAttribute('dps',d.body.getAttribute('data-player-size'));
					} else if (ma.textContent==''&&mb.value!='') {
						ma.textContent=mb.value;
						d.body.setAttribute('data-player-size',mb.getAttribute('dps'));
					}
				}
			});

			d.body.addEventListener('keydown',function(ev){
				// add another escape check if user escapes from full-screen mode

				var e=window.event||window.Event;
				var evtobj=window.event ? event : ev; //distinguish between explicit and implicit events
				var unicode=evtobj.charCode ? evtobj.charCode : evtobj.keyCode;
				if (unicode==27) {
					var ma=d.getElementById('ytOvid');
					var mb=d.getElementById('ytOhtml5');
					if (ma&&mb) {
						if (mb.value!='') {
							ma.textContent=mb.value;
							d.body.setAttribute('data-player-size',mb.getAttribute('dps'));
						}
					}
				}
			});
		}

		if (buts[i].title=='Large player'||buts[i].title=='Small player') {
			// look at small and large player buttons
			if (options.SetView!='default') {
				// hide resizing buttons because they dont work now
				buts[i].style.display='none';
			}
		}

		// add ids so they can be hidden if size is changed from popup
		if (buts[i].title=='Large player') {buts[i].id='html5large';}
		if (buts[i].title=='Small player') {buts[i].id='html5small';}
		if (buts[i].title=='Captions') {buts[i].id='html5cc';}

		if (options.InVideo!='default' && options.InVideo!='ads') {
			// hide show annotation button
			if (buts[i].title=='Annotations') {buts[i].style.display='none';}
		}

		if (options.InVideo=='all') {
			// hide cc button
			if (buts[i].title=='Captions') {buts[i].style.display='none';}
		}

	}
}

function getSafariAnswer (theMessageEvent) {
	// handle answer (safari events)

	bug('got back from safari message director: '+theMessageEvent.name);
	if (theMessageEvent.name === 'putPrefs') {
		JSON.parse(theMessageEvent.message,function(key,value){
			if (typeof value!='object') {
				//console.log(key+' '+value);
				localStorage.setItem(key,value);
			}
		});

		// reload this sessions options and start messing with page
		options = JSON.parse(loadSettings());
		bug('options after asking:')
		bug(options);

		gotOpts();
	}

	if (theMessageEvent.name === 'vis' || theMessageEvent.name === 'tog') {
		// handle popover options
		handlePopup(theMessageEvent.message);
	}

	if (theMessageEvent.name === 'options') {
		// ask global_page to open options
		safari.self.tab.dispatchMessage('options','');
	}
}

function getOperaAnswer () {
	// handle answer (opera events)

	opera.extension.onmessage = function(event) {

		if (event.data == 'Send a port') {
			// popup menu was clicked

			background = event.source; // in case you need to send anything to background, just do background.postMessage()
			var channel = new MessageChannel();

			event.ports[0].postMessage('Here is a port to the currently focused tab', [channel.port2]);
			//opera.postError('post sent from injected script');

			channel.port1.onmessage = function(event) {
				// message received from popup.js
				//opera.postError('Message received from the popup: '+ event.data);
				handlePopup(event.data);
			};

			// send url to popup for page context
			litobj = {};
			litobj['makelinks_action'] = 'url';
			litobj['prefs'] = document.URL;
			//opera.postError(litobj['prefs']);
			event.ports[0].postMessage(litobj);
		}

		switch (event.data.makelinks_action) {
			case 'settings':
				bug('ytO: the preferences we got from scripts/background:');
				options=JSON.parse(event.data.prefs);
				//console.log(options);

				gotOpts();
				break;
		}
	};
}

function getVidType (links) {
	// determine video type from URL

	var vidtype='NaN';
	if (links.search('youtube.com/')!='-1') { vidtype = 'youtube'; }
	if (links.search('vimeo.com/')!='-1') { vidtype = 'vimeo'; }
	if (links.search('dailymotion.com/video/')!='-1') { vidtype = 'dailymotion'; }
	if (links.search('g4tv.com/videos/')!='-1') { vidtype = 'g4tv'; }
	if (links.search('metacafe.com/watch/')!='-1') { vidtype = 'metacafe'; }
	if (links.search('fearnet.com/movies')!='-1') { vidtype = 'fearnet'; }
	if (links.search('funnyordie.com/videos')!='-1') { vidtype = 'funny'; }
	if (links.search('hulu.com/watch')!='-1') { vidtype = 'hulu'; }
	if (links.search('escapistmagazine.com/videos')!='-1') { vidtype = 'escapist'; }
	if (links.search('dump.com/[A-Z,a-z,0-9].*')!='-1') { vidtype = 'dump'; }
	if (links.search('pornhub.com/view_video')!='-1') { vidtype = 'ph'; }
	if (links.search('tube8.com/')!='-1'&&links.replace('http:\/\/','').search(/\/.*\//)!='-1') { vidtype = 't8'; }
	if (links.search('xvideos.com/video')!='-1') { vidtype = 'xvid'; }
	if (links.search('twitch.tv/')!='-1') { vidtype = 'twitch'; }
	if (links.search('own3d.tv/')!='-1') { vidtype = 'own3d'; }
	if (links.search('twitter.com/')!='-1') { vidtype = 'twitter'; }
	if (links.search('instagram.com/')!='-1') { vidtype = 'instagram'; }

	//
	// special cases
	//

	// handle popouts
	if (vidtype=='youtube' && !document.head) {vidtype='NaN';}

	return vidtype;
}

// -----------------

function debugObj (kind) {
	// make things for debugging

	var d=getDOM();

	if (kind=='ticker') {
		var link = d.createElement('div');
		link.id='ticker';
		link.className='ytg-base';
		link.innerHTML = '<div id="ticker-inner"><div class="ytg-wide"><button onclick="yt.net.cookies.set(\'HideTicker\', 1, 604800);" class="yt-uix-close" data-close-parent-id="ticker"><img alt="Close" src="//s.ytimg.com/yt/img/pixel-vfl3z5WfW.gif"></button><img class="ticker-icon" src="//s.ytimg.com/yt/img/pixel-vfl3z5WfW.gif" alt=""><div class="ticker-content"><a href="http://www.youtube.com/user/justincurrie3"><strong> Watch Now: This is a fully-full-on fake ticker to annoy and debug</strong></a></div></div></div>';
		d.body.insertBefore(link,d.body.firstChild);
	}

	if (kind=='privacy') {
		var link = d.createElement('div');
		link.id='watch-privacy-contain';
		link.innerHTML = '<div id="eow-privacy"><div class="yt-alert yt-alert-default yt-alert-warn " id="watch-video-notification-alert"><div class="yt-alert-buttons"></div><div class="yt-alert-content" role="alert"><span class="yt-alert-vertical-trick"></span><div class="yt-alert-message">This video is unlisted. Only those with the link can see it.  <a target="_blank" href="http://www.google.com/support/youtube/bin/answer.py?answer=181547">Learn more</a></div></div></div></div>';
		d.getElementById('watch-headline').insertBefore(link,d.getElementById('watch-headline').firstChild);
	}

	if (kind=='screenshots') {
		if (d.getElementById('watch7-playlist-bar-title')){
			d.getElementById('watch7-playlist-bar-title').textContent='YouTube Options';
		}
		newcss = '#watch-related-container {height: 573px; overflow: hidden;} .comments-section, #watch7-discussion {height: 345px; overflow: hidden;} #watch-related {overflow: hidden !important;} #watch7-main-container {height: 670px; overflow: hidden;} #watch7-top-comments {display:none;} #watch7-action-panels {height: 100px !important;} #footer {margin-top: -30px;} #masthead {padding-left: 18px; padding-right: 12px;} ul.comment-list {height: 210px; overflow: hidden;} .yt-uix-pager-page-num {box-shadow: none !important; -webkit-box-shadow: none !important;}' ;

		addCSS(newcss,'ytOscreenshots');
	}
}

function ytVersType () {
	// determine if it is the watch7 interface (youtube)

	var d=getDOM();

	if (d.getElementById('watch7-container')) {
		return 'watch7';
	}
	var f1 = d.getElementById('movie_player');
	var f2 = d.getElementById('video-player');
	if ((f1 && f1.parentNode.id=='p') || (f2 && f2.parentNode.id=='p')) {
		return 'feather';
	}
	return 'normal';
}

// -----------------

var links = document.URL;
var vidtype = getVidType(links);
var debug = false;
//console.log('ytO: vidtype: '+vidtype+' '+links);

// debug for local files
if (debug) {vidtype='youtube';}

//throw '';

if (vidtype!=='NaN') {
	bug('ytO: vidtype: '+vidtype+' '+links);

	var thisbrowser='NaN';
	if (window.opera) {thisbrowser='opera'; var setstor=widget.preferences;} else {
		if (navigator.userAgent.indexOf('Firefox')!='-1') {thisbrowser='firefox'; d=content.document;}
		if (navigator.userAgent.indexOf('Safari')!='-1') {thisbrowser='safari';}
		if (navigator.userAgent.indexOf('Chrome')!='-1') {thisbrowser='chrome';}
		try {
			var setstor=localStorage;
		}
		catch (err) {
			browserFail();
			throw 'YTO ERROR: could not find localStorage.';
		}
	}
	bug('thisbrowser: '+thisbrowser);

	if (vidtype!='NaN' && ((thisbrowser!='firefox'&&window==window.parent) || (thisbrowser=='firefox'&&unsafeWindow.self == unsafeWindow.top)) && dupeCheck()) {

		//debugObj('ticker');
		//debugObj('privacy');
		//debugObj('screenshots');

		// find special youtube pages
		if (vidtype=='youtube') {
			// cleanup any time codes in opera url - chrome and safari are handled in yto_start.js
			if (thisbrowser=='opera' && setstor.youtube=='true' && setstor.InVideo!='default') {
				var newurl = cleanTimeURL (links);
				if (links!=newurl) { document.location=newurl; }
			}

			var ytType = ytVersType(links);
			var ytControls = false;
			var hangcount = 0;
			var waiter2; // for looping

			var thishost = window.location.host;
			var thispath = window.location.pathname;
			var ytPage = undefined;

			// find youtube page type
			if (thispath=='/') {ytPage='home';}
			if (thispath=='/watch') {ytPage='watch';}
			if (thispath.indexOf('/user/')!='-1') {ytPage='user';}
			if (thispath.indexOf('/channel')!='-1') {ytPage='channel';}

			// do not play with subdomains
			var parts = thishost.split('.');
			if (parts.length>0) {
				// this is overly complicated incase we want to do something in the future
				if (parts[0]!='www') {ytPage='subdomain';}
			}
		}

		// debug for local files
		if (debug) {ytPage='watch';}

		if (vidtype!='youtube' || (vidtype=='youtube' && ytPage!=undefined && ytPage!='subdomain')) {
			// write video object info to header
			defineVidType(vidtype);

			var options='';
			var waiter4; // for resizing

			bug('start for '+ vidtype +' in '+ thisbrowser +' (yto.js)');
			if (thisbrowser=='chrome') {
				// handler to listen for popup.html changes
				chrome.extension.onRequest.addListener(
					function(request, sender, sendResponse) {
						handlePopup (request.todo);
						// popup wants to know watch type of youtube
						if (request.greeting == 'type') {
							sendResponse({data: ytType});
						}
					}
				);

				// send message back to background.js that we want settings
				chrome.extension.sendRequest({greeting: 'youtube.js', todo: ''}, function(response) {
					bug('this is what we got from background.js: '+options);
					options=JSON.parse(response['settings']);
					//options.DownloadLinks='never';
					//console.log(options);
					bug('yto.js options: '+ response['settings']);
					gotOpts();
				});
			} else if (thisbrowser=='safari') {
				// create message listener for passing preferences
				safari.self.addEventListener('message', getSafariAnswer, false);

				bug('asking for settings from global page file ('+thisbrowser+')..');

				options.thispage=links;

				// ask for answer
				safari.self.tab.dispatchMessage('getPrefs','');
			} else if (thisbrowser=='firefox') {
				currentSettings=loadSettings();
				if (currentSettings) {
					// first load on page
					options=currentSettings;
					bug('yto.js options: '+options);
					if (options&&options.indexOf('null')!='0') {
						gotOpts();
					} else {
						bug('ytO ERROR: yto.js ('+thisbrowser+') did not get options.');
						self.postMessage('prefs');
					}
				} else {
					bug('ytO ERROR: yto.js ('+thisbrowser+') did get currentSettings from loadSettings()');
				}
			} else if (thisbrowser=='opera') {
				// create listener for popup events and preferences
				window.addEventListener('DOMContentLoaded', getOperaAnswer, false);
			}
		}

		bug('end youtube.js');
	}
}

/* EOF */