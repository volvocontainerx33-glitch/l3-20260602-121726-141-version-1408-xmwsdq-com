(function () {
  var navButton = document.querySelector('.nav-toggle');
  var nav = document.querySelector('.main-nav');
  if (navButton && nav) {
    navButton.addEventListener('click', function () {
      nav.classList.toggle('open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var bgImages = Array.prototype.slice.call(document.querySelectorAll('[data-hero-bg]'));
  var posters = Array.prototype.slice.call(document.querySelectorAll('[data-hero-poster]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var current = 0;

  function showHero(index) {
    if (!slides.length) {
      return;
    }
    current = (index + slides.length) % slides.length;
    slides.forEach(function (item, i) {
      item.classList.toggle('active', i === current);
    });
    bgImages.forEach(function (item, i) {
      item.classList.toggle('active', i === current);
    });
    posters.forEach(function (item, i) {
      item.classList.toggle('active', i === current);
    });
    dots.forEach(function (item, i) {
      item.classList.toggle('active', i === current);
    });
  }

  dots.forEach(function (dot, i) {
    dot.addEventListener('click', function () {
      showHero(i);
    });
  });

  if (slides.length) {
    showHero(0);
    setInterval(function () {
      showHero(current + 1);
    }, 5200);
  }

  var searchForm = document.querySelector('[data-quick-search]');
  if (searchForm) {
    searchForm.addEventListener('submit', function (event) {
      event.preventDefault();
      var input = searchForm.querySelector('input');
      var q = input ? input.value.trim() : '';
      window.location.href = 'search.html' + (q ? '?q=' + encodeURIComponent(q) : '');
    });
  }

  var filterInput = document.querySelector('[data-filter-input]');
  var filterYear = document.querySelector('[data-filter-year]');
  var filterType = document.querySelector('[data-filter-type]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));
  var empty = document.querySelector('[data-empty-note]');

  function normalize(value) {
    return (value || '').toString().toLowerCase().trim();
  }

  function applyFilter() {
    if (!cards.length) {
      return;
    }
    var q = normalize(filterInput && filterInput.value);
    var year = filterYear ? filterYear.value : '';
    var type = filterType ? filterType.value : '';
    var visible = 0;
    cards.forEach(function (card) {
      var text = normalize(card.textContent + ' ' + card.dataset.title + ' ' + card.dataset.region + ' ' + card.dataset.genre);
      var ok = true;
      if (q && text.indexOf(q) === -1) {
        ok = false;
      }
      if (year && card.dataset.year !== year) {
        ok = false;
      }
      if (type && card.dataset.type !== type) {
        ok = false;
      }
      card.style.display = ok ? '' : 'none';
      if (ok) {
        visible += 1;
      }
    });
    if (empty) {
      empty.classList.toggle('active', visible === 0);
    }
  }

  if (filterInput || filterYear || filterType) {
    var params = new URLSearchParams(window.location.search);
    if (filterInput && params.get('q')) {
      filterInput.value = params.get('q');
    }
    [filterInput, filterYear, filterType].forEach(function (item) {
      if (item) {
        item.addEventListener('input', applyFilter);
        item.addEventListener('change', applyFilter);
      }
    });
    applyFilter();
  }

  window.MoviePlayer = {
    init: function (src) {
      var video = document.querySelector('[data-player-video]');
      var overlay = document.querySelector('[data-play-overlay]');
      var attached = false;
      if (!video || !src) {
        return;
      }

      function attach() {
        if (attached) {
          return;
        }
        attached = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = src;
        } else if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({ enableWorker: true });
          hls.loadSource(src);
          hls.attachMedia(video);
        } else {
          video.src = src;
        }
      }

      function start() {
        attach();
        if (overlay) {
          overlay.classList.add('hidden');
        }
        video.setAttribute('controls', 'controls');
        var request = video.play();
        if (request && request.catch) {
          request.catch(function () {});
        }
      }

      if (overlay) {
        overlay.addEventListener('click', start);
      }
      video.addEventListener('click', start, { once: true });
    }
  };
})();
