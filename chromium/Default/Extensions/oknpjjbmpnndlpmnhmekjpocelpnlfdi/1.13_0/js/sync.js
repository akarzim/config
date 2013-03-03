// Make the request for the user profile
chrome.extension.sendRequest({message: 'sync_profile_request'}, function(sync_profile){
    // Alert the page that the extension has been synced
    var script = document.createElement('script');
    script.setAttribute('type', 'text/javascript');
    script.setAttribute('charset', 'UTF-8');
    script.innerHTML = [
        '(function(){',
            'try {',
                'readability.extensions.browser_synced("'+escape(JSON.stringify(sync_profile))+'");',
            '}catch(e){};',
        '}())'].join('');
    document.body.appendChild(script);
});
