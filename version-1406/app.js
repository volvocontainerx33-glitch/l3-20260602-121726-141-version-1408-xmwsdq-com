(function () {
  var navButton = document.querySelector('.nav-toggle');
  var nav = document.querySelector('.site-nav');
  if (navButton && nav) {
    navButton.addEventListener('click', function () {
      nav.classList.toggle('open');
    });
  }

  var carousel = document.querySelector('[data-hero-carousel]');
  if (carousel) {
    var slides = Array.prototype.slice.call(carousel.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('.hero-dot'));
    var current = 0;
    var show = function (next) {
      slides[current].classList.remove('active');
      dots[current].classList.remove('active');
      current = next;
      slides[current].classList.add('active');
      dots[current].classList.add('active');
    };
    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
      });
    });
    window.setInterval(function () {
      show((current + 1) % slides.length);
    }, 5200);
  }

  var filterInput = document.querySelector('.live-filter');
  var yearSelect = document.querySelector('.year-filter');
  var target = document.querySelector('.filter-target');
  var runFilter = function () {
    if (!target) {
      return;
    }
    var query = filterInput ? filterInput.value.trim().toLowerCase() : '';
    var year = yearSelect ? yearSelect.value : '';
    var cards = Array.prototype.slice.call(target.querySelectorAll('.movie-card'));
    cards.forEach(function (card) {
      var haystack = [
        card.getAttribute('data-title'),
        card.getAttribute('data-year'),
        card.getAttribute('data-region'),
        card.getAttribute('data-genre'),
        card.textContent
      ].join(' ').toLowerCase();
      var matchesQuery = !query || haystack.indexOf(query) >= 0;
      var matchesYear = !year || card.getAttribute('data-year') === year;
      card.classList.toggle('hidden-by-filter', !(matchesQuery && matchesYear));
    });
  };
  if (filterInput) {
    var params = new URLSearchParams(window.location.search);
    if (params.get('q')) {
      filterInput.value = params.get('q');
    }
    filterInput.addEventListener('input', runFilter);
  }
  if (yearSelect) {
    yearSelect.addEventListener('change', runFilter);
  }
  runFilter();

  var players = Array.prototype.slice.call(document.querySelectorAll('.player-box'));
  players.forEach(function (box) {
    var video = box.querySelector('video');
    var button = box.querySelector('.play-mask');
    if (!video || !button) {
      return;
    }
    var src = video.getAttribute('data-stream');
    var hlsInstance = null;
    var start = function () {
      if (!src) {
        return;
      }
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = hlsInstance || new window.Hls();
        hlsInstance.loadSource(src);
        hlsInstance.attachMedia(video);
      } else {
        video.src = src;
      }
      button.classList.add('hidden');
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {});
      }
    };
    button.addEventListener('click', start);
    video.addEventListener('click', function () {
      if (video.paused) {
        start();
      }
    });
  });
})();
