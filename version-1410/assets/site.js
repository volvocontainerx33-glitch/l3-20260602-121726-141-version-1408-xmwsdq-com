// Static movie site interactions: readable, uncompressed.
(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function initHeroSlider() {
        var slider = document.querySelector('[data-hero-slider]');
        if (!slider) {
            return;
        }
        var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
        if (!slides.length) {
            return;
        }
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot')) || 0);
                start();
            });
        });

        slider.addEventListener('mouseenter', stop);
        slider.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function initFilters() {
        var scope = document.querySelector('[data-filter-scope]');
        var list = document.querySelector('[data-filter-list]');
        if (!list) {
            return;
        }

        var cards = Array.prototype.slice.call(list.querySelectorAll('.movie-card'));
        var searchInput = scope ? scope.querySelector('[data-local-search]') : null;
        var yearFilter = scope ? scope.querySelector('[data-year-filter]') : null;
        var regionFilter = scope ? scope.querySelector('[data-region-filter]') : null;
        var typeFilter = scope ? scope.querySelector('[data-type-filter]') : null;
        var countNode = scope ? scope.querySelector('[data-filter-count]') : null;
        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get('q');

        if (searchInput && initialQuery) {
            searchInput.value = initialQuery;
        }

        function cardText(card) {
            return normalize([
                card.getAttribute('data-title'),
                card.getAttribute('data-year'),
                card.getAttribute('data-region'),
                card.getAttribute('data-type'),
                card.getAttribute('data-genre'),
                card.innerText
            ].join(' '));
        }

        function apply() {
            var query = normalize(searchInput ? searchInput.value : '');
            var year = normalize(yearFilter ? yearFilter.value : '');
            var region = normalize(regionFilter ? regionFilter.value : '');
            var type = normalize(typeFilter ? typeFilter.value : '');
            var visible = 0;

            cards.forEach(function (card) {
                var content = cardText(card);
                var match = true;
                if (query && content.indexOf(query) === -1) {
                    match = false;
                }
                if (year && normalize(card.getAttribute('data-year')) !== year) {
                    match = false;
                }
                if (region && normalize(card.getAttribute('data-region')) !== region) {
                    match = false;
                }
                if (type && normalize(card.getAttribute('data-type')) !== type) {
                    match = false;
                }
                card.classList.toggle('is-hidden', !match);
                if (match) {
                    visible += 1;
                }
            });

            if (countNode) {
                countNode.textContent = visible + ' 部';
            }
        }

        [searchInput, yearFilter, regionFilter, typeFilter].forEach(function (control) {
            if (control) {
                control.addEventListener('input', apply);
                control.addEventListener('change', apply);
            }
        });

        apply();
    }

    function initVideoPlayers() {
        var players = Array.prototype.slice.call(document.querySelectorAll('[data-video-player]'));
        players.forEach(function (shell) {
            var button = shell.querySelector('[data-play-video]');
            var video = shell.querySelector('video');
            var src = shell.getAttribute('data-video-src');
            if (!button || !video || !src) {
                return;
            }

            function startPlayback() {
                if (window.Hls && window.Hls.isSupported()) {
                    var hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(src);
                    hls.attachMedia(video);
                    hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        video.play().catch(function () {});
                    });
                } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = src;
                    video.addEventListener('loadedmetadata', function () {
                        video.play().catch(function () {});
                    }, { once: true });
                } else {
                    video.src = src;
                    video.play().catch(function () {});
                }
                shell.classList.add('is-playing');
            }

            button.addEventListener('click', startPlayback);
        });
    }

    function initImageFallback() {
        document.addEventListener('error', function (event) {
            var target = event.target;
            if (target && target.tagName === 'IMG') {
                target.classList.add('image-missing');
                target.alt = target.alt || '影片封面';
            }
        }, true);
    }

    ready(function () {
        initHeroSlider();
        initFilters();
        initVideoPlayers();
        initImageFallback();
    });
})();
