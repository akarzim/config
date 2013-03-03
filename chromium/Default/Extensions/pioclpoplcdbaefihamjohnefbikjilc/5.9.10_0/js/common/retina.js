function retinafy (evt) {
  if (devicePixelRatio < 1.5) return;
  var imgs = document.querySelectorAll("img");
  for (var i = 0; i < imgs.length; i++) {
    if (imgs[i].src.match(/@2x\.[a-z]+$/i)) {
      // Skip already-retina'ed stuff.
      continue;
    }
    if (!imgs[i].src || !imgs[i].src.match(/^(chrome|safari)-extension/)) {
      continue;
    }
    imgs[i].src = imgs[i].src.replace(/(\.(png|gif|jpg))$/i ,"@2x$1");
  }
}

function deretinafy (evt) {
  if (devicePixelRatio > 1.5) return;
  var imgs = document.querySelectorAll("img");
  for (var i = 0; i < imgs.length; i++) {
    if (!imgs[i].src || !imgs[i].src.match(/^(chrome|safari)-extension/)) {
      continue;
    }
    imgs[i].src = imgs[i].src.replace(/@2x(\.(png|gif|jpg))$/i ,"$1");
  }
}

window.addEventListener("DOMContentLoaded", function() {
  if (devicePixelRatio <= 1.5){
    deretinafy();
  }
  else {
    retinafy();
  }
});

window.matchMedia('screen and (-webkit-min-device-pixel-ratio: 1.5)').addListener(retinafy);
window.matchMedia('screen and (-webkit-max-device-pixel-ratio: 1.5)').addListener(deretinafy);

