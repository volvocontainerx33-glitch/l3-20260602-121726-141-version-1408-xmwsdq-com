(function() {
    var menuButton = document.querySelector('.menu-toggle');
    var mobileMenu = document.querySelector('.mobile-menu');

    if (menuButton && mobileMenu) {
        menuButton.addEventListener('click', function() {
            var expanded = menuButton.getAttribute('aria-expanded') === 'true';
            menuButton.setAttribute('aria-expanded', String(!expanded));
            mobileMenu.hidden = expanded;
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
    var prev = document.querySelector('.hero-prev');
    var next = document.querySelector('.hero-next');
    var current = 0;
    var timer = null;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function(slide, slideIndex) {
            slide.classList.toggle('active', slideIndex === current);
        });
        dots.forEach(function(dot, dotIndex) {
            dot.classList.toggle('active', dotIndex === current);
        });
    }

    function startTimer() {
        if (slides.length < 2) {
            return;
        }
        timer = window.setInterval(function() {
            showSlide(current + 1);
        }, 5200);
    }

    function resetTimer() {
        if (timer) {
            window.clearInterval(timer);
        }
        startTimer();
    }

    dots.forEach(function(dot, index) {
        dot.addEventListener('click', function() {
            showSlide(index);
            resetTimer();
        });
    });

    if (prev) {
        prev.addEventListener('click', function() {
            showSlide(current - 1);
            resetTimer();
        });
    }

    if (next) {
        next.addEventListener('click', function() {
            showSlide(current + 1);
            resetTimer();
        });
    }

    startTimer();

    var filterInput = document.querySelector('.filter-input');
    if (filterInput) {
        var cards = Array.prototype.slice.call(document.querySelectorAll('[data-filter-text]'));
        filterInput.addEventListener('input', function() {
            var query = filterInput.value.trim().toLowerCase();
            cards.forEach(function(card) {
                var text = (card.getAttribute('data-filter-text') || '').toLowerCase();
                card.hidden = query && text.indexOf(query) === -1;
            });
        });
    }

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    var searchResults = document.getElementById('searchResults');
    var searchInput = document.getElementById('searchInput');
    var searchTitle = document.getElementById('searchTitle');
    var searchSummary = document.getElementById('searchSummary');

    if (searchResults && searchInput && window.movieSearchData) {
        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get('q') || '';
        searchInput.value = initialQuery;

        function renderSearch(query) {
            var normalized = query.trim().toLowerCase();
            var data = window.movieSearchData;
            var result = normalized
                ? data.filter(function(movie) {
                    return [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.tags, movie.summary]
                        .join(' ')
                        .toLowerCase()
                        .indexOf(normalized) !== -1;
                }).slice(0, 120)
                : data.slice(0, 48);

            if (searchTitle) {
                searchTitle.textContent = normalized ? '搜索结果' : '推荐影片';
            }
            if (searchSummary) {
                searchSummary.textContent = normalized ? '已根据关键词匹配影片标题、地区、年份、类型和标签。' : '可通过标题、地区、年份、类型或标签检索影片。';
            }

            searchResults.innerHTML = result.map(function(movie) {
                return '<article class="movie-card">' +
                    '<a class="poster-link" href="' + escapeHtml(movie.link) + '">' +
                    '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
                    '<span class="poster-shade"></span>' +
                    '<strong class="card-score">' + escapeHtml(movie.score) + '</strong>' +
                    '</a>' +
                    '<div class="card-body">' +
                    '<div class="card-tags"><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.year) + '</span></div>' +
                    '<h2><a href="' + escapeHtml(movie.link) + '">' + escapeHtml(movie.title) + '</a></h2>' +
                    '<p>' + escapeHtml(movie.summary) + '</p>' +
                    '</div>' +
                    '</article>';
            }).join('');
        }

        renderSearch(initialQuery);
        searchInput.addEventListener('input', function() {
            renderSearch(searchInput.value);
        });
    }
})();

function mountMoviePlayer(streamUrl) {
    var video = document.querySelector('.movie-video');
    var button = document.querySelector('.play-cover');
    var hls = null;
    var started = false;

    if (!video || !button || !streamUrl) {
        return;
    }

    function play() {
        if (!started) {
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = streamUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(streamUrl);
                hls.attachMedia(video);
            } else {
                video.src = streamUrl;
            }
            started = true;
        }

        button.classList.add('is-hidden');
        video.controls = true;
        var promise = video.play();
        if (promise && typeof promise.catch === 'function') {
            promise.catch(function() {
                button.classList.remove('is-hidden');
            });
        }
    }

    button.addEventListener('click', play);
    video.addEventListener('click', function() {
        if (!started) {
            play();
        }
    });
    video.addEventListener('play', function() {
        button.classList.add('is-hidden');
    });
    video.addEventListener('pause', function() {
        if (video.currentTime === 0 || video.ended) {
            button.classList.remove('is-hidden');
        }
    });
    window.addEventListener('pagehide', function() {
        if (hls) {
            hls.destroy();
        }
    });
}
