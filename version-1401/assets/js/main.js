(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function initMenu() {
    var button = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-site-nav]");
    if (!button || !nav) {
      return;
    }
    button.addEventListener("click", function () {
      nav.classList.toggle("open");
    });
  }

  function initHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    if (slides.length < 2) {
      return;
    }
    var current = 0;
    function show(index) {
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
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
      });
    });
    setInterval(function () {
      show(current + 1);
    }, 5000);
  }

  function cardText(card) {
    return [
      card.getAttribute("data-title"),
      card.getAttribute("data-region"),
      card.getAttribute("data-genre"),
      card.getAttribute("data-tags")
    ].join(" ").toLowerCase();
  }

  function sortCards(area, value) {
    var cards = Array.prototype.slice.call(area.querySelectorAll(".movie-card"));
    cards.sort(function (a, b) {
      var ay = Number(a.getAttribute("data-year")) || 0;
      var by = Number(b.getAttribute("data-year")) || 0;
      var at = a.getAttribute("data-title") || "";
      var bt = b.getAttribute("data-title") || "";
      if (value === "year-asc") {
        return ay - by || at.localeCompare(bt, "zh-Hans-CN");
      }
      if (value === "title-asc") {
        return at.localeCompare(bt, "zh-Hans-CN");
      }
      return by - ay || at.localeCompare(bt, "zh-Hans-CN");
    });
    cards.forEach(function (card) {
      area.appendChild(card);
    });
  }

  function initFilters() {
    var input = document.querySelector(".js-search");
    var select = document.querySelector(".js-sort");
    var area = document.querySelector(".filter-area");
    if (!area) {
      return;
    }
    function apply() {
      var query = input ? input.value.trim().toLowerCase() : "";
      var cards = Array.prototype.slice.call(area.querySelectorAll(".movie-card"));
      cards.forEach(function (card) {
        var matched = !query || cardText(card).indexOf(query) !== -1;
        card.classList.toggle("is-hidden", !matched);
      });
    }
    if (input) {
      input.addEventListener("input", apply);
    }
    if (select) {
      select.addEventListener("change", function () {
        sortCards(area, select.value);
        apply();
      });
      sortCards(area, select.value);
    }
    apply();
  }

  window.setupMoviePlayer = function (videoId, buttonId, sourceUrl) {
    var video = document.getElementById(videoId);
    var button = document.getElementById(buttonId);
    if (!video || !sourceUrl) {
      return;
    }
    var loaded = false;
    function loadAndPlay() {
      if (!loaded) {
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = sourceUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls();
          hls.loadSource(sourceUrl);
          hls.attachMedia(video);
        } else {
          video.src = sourceUrl;
        }
        loaded = true;
      }
      if (button) {
        button.classList.add("is-hidden");
      }
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {});
      }
    }
    if (button) {
      button.addEventListener("click", loadAndPlay);
    }
    video.addEventListener("click", function () {
      if (!loaded) {
        loadAndPlay();
      }
    });
  };

  ready(function () {
    initMenu();
    initHero();
    initFilters();
  });
})();
