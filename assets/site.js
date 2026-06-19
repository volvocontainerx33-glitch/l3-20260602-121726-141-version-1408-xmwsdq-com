document.addEventListener("DOMContentLoaded", function () {
  var header = document.querySelector(".site-header");
  var menuToggle = document.querySelector(".menu-toggle");

  if (header && menuToggle) {
    menuToggle.addEventListener("click", function () {
      var opened = header.classList.toggle("open");
      menuToggle.setAttribute("aria-expanded", opened ? "true" : "false");
    });
  }

  document.querySelectorAll("[data-hero-slider]").forEach(function (slider) {
    var slides = Array.from(slider.querySelectorAll(".hero-slide"));
    var dots = Array.from(slider.querySelectorAll(".hero-dot"));
    var current = 0;

    function show(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === current);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        var index = parseInt(dot.getAttribute("data-slide"), 10);
        show(index);
      });
    });

    if (slides.length > 1) {
      setInterval(function () {
        show(current + 1);
      }, 5200);
    }
  });

  document.querySelectorAll(".filter-panel").forEach(function (panel) {
    var selector = panel.getAttribute("data-scope") || ".movie-grid";
    var scope = document.querySelector(selector);
    var input = panel.querySelector(".filter-input");
    var region = panel.querySelector(".filter-region");
    var type = panel.querySelector(".filter-type");
    var empty = document.querySelector(".empty-state");

    if (!scope) {
      return;
    }

    var items = Array.from(scope.querySelectorAll(".searchable-item"));

    function apply() {
      var keyword = input ? input.value.trim().toLowerCase() : "";
      var regionValue = region ? region.value : "";
      var typeValue = type ? type.value : "";
      var visible = 0;

      items.forEach(function (item) {
        var text = item.getAttribute("data-search") || "";
        var itemRegion = item.getAttribute("data-region") || "";
        var itemType = item.getAttribute("data-type") || "";
        var matched = true;

        if (keyword && text.indexOf(keyword) === -1) {
          matched = false;
        }

        if (regionValue && itemRegion !== regionValue) {
          matched = false;
        }

        if (typeValue && itemType !== typeValue) {
          matched = false;
        }

        item.hidden = !matched;
        if (matched) {
          visible += 1;
        }
      });

      if (empty) {
        empty.hidden = visible !== 0;
      }
    }

    [input, region, type].forEach(function (control) {
      if (control) {
        control.addEventListener("input", apply);
        control.addEventListener("change", apply);
      }
    });

    var params = new URLSearchParams(window.location.search);
    var query = params.get("q");
    if (query && input) {
      input.value = query;
    }
    apply();
  });

  document.querySelectorAll(".player-shell").forEach(function (shell) {
    var video = shell.querySelector("video");
    var layer = shell.querySelector(".play-layer");
    var started = false;
    var hlsInstance = null;

    if (!video || !layer) {
      return;
    }

    function start() {
      var src = video.getAttribute("data-video-src");

      if (!src) {
        return;
      }

      if (!started) {
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = src;
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(src);
          hlsInstance.attachMedia(video);
        } else {
          video.src = src;
        }
        started = true;
      }

      layer.classList.add("hidden");
      video.setAttribute("controls", "controls");
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {});
      }
    }

    layer.addEventListener("click", start);
    video.addEventListener("click", function () {
      if (!started) {
        start();
      }
    });

    window.addEventListener("pagehide", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  });
});
