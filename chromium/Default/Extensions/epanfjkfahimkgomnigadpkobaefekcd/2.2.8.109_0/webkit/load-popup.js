var maxRetry=50;function popupLoaded(){var a=typeof chrome!="undefined"?chrome.extension.getBackgroundPage():safari.extension.globalPage.contentWindow;(!a.bridge||!a.DNTP)&&maxRetry-- >0?(console.log("waiting"),setTimeout(popupLoaded,500)):a.bridge.initPopover(null,a.getDataFromTab,document)}window.addEventListener("load",popupLoaded,!1);