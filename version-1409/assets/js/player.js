(function () {
  var box = document.querySelector(".player-box[data-play-src]");

  if (!box) {
    return;
  }

  var video = box.querySelector("video");
  var button = box.querySelector(".play-layer");
  var src = box.getAttribute("data-play-src");
  var prepared = false;
  var stream = null;

  function attach() {
    if (prepared || !video || !src) {
      return;
    }

    prepared = true;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = src;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      stream = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      stream.loadSource(src);
      stream.attachMedia(video);
      return;
    }

    video.src = src;
  }

  function play() {
    attach();

    if (!video) {
      return;
    }

    var request = video.play();

    if (request && typeof request.catch === "function") {
      request.catch(function () {});
    }
  }

  if (button) {
    button.addEventListener("click", play);
  }

  if (video) {
    video.addEventListener("play", function () {
      box.classList.add("is-playing");
    });

    video.addEventListener("pause", function () {
      if (!video.ended) {
        box.classList.remove("is-playing");
      }
    });

    video.addEventListener("ended", function () {
      box.classList.remove("is-playing");
    });
  }

  window.addEventListener("pagehide", function () {
    if (stream && typeof stream.destroy === "function") {
      stream.destroy();
    }
  });
})();
