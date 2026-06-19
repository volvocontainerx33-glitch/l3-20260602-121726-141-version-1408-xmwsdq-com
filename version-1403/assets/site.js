
(function () {
    function qs(selector, root) {
        return (root || document).querySelector(selector);
    }

    function qsa(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function formatViews(value) {
        if (value >= 10000) {
            return (value / 10000).toFixed(1) + '万';
        }
        return String(value);
    }

    function initMobileMenu() {
        var button = qs('[data-menu-toggle]');
        var panel = qs('[data-mobile-panel]');
        if (!button || !panel) {
            return;
        }
        button.addEventListener('click', function () {
            panel.classList.toggle('is-open');
        });
    }

    function initHero() {
        var slides = qsa('[data-hero-slide]');
        var dots = qsa('[data-hero-dot]');
        if (!slides.length) {
            return;
        }
        var current = 0;
        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === current);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === current);
            });
        }
        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                show(i);
            });
        });
        window.setInterval(function () {
            show(current + 1);
        }, 5200);
    }

    function initImageFallback() {
        qsa('img').forEach(function (img) {
            img.addEventListener('error', function () {
                img.classList.add('image-fallback');
                img.alt = img.alt || '封面图片';
            }, { once: true });
        });
    }

    function initLocalFilters() {
        qsa('[data-filter-bar]').forEach(function (bar) {
            var input = qs('[data-filter-input]', bar);
            var year = qs('[data-year-select]', bar);
            var count = qs('[data-filter-count]', bar);
            var list = qs('[data-filter-list]');
            if (!list) {
                return;
            }
            var cards = qsa('[data-card]', list);
            function apply() {
                var keyword = input ? input.value.trim().toLowerCase() : '';
                var selectedYear = year ? year.value : '';
                var visible = 0;
                cards.forEach(function (card) {
                    var haystack = [
                        card.getAttribute('data-title'),
                        card.getAttribute('data-region'),
                        card.getAttribute('data-genre'),
                        card.getAttribute('data-year')
                    ].join(' ').toLowerCase();
                    var matchKeyword = !keyword || haystack.indexOf(keyword) >= 0;
                    var matchYear = !selectedYear || card.getAttribute('data-year') === selectedYear;
                    var shouldShow = matchKeyword && matchYear;
                    card.style.display = shouldShow ? '' : 'none';
                    if (shouldShow) {
                        visible += 1;
                    }
                });
                if (count) {
                    count.textContent = visible + ' 部影片';
                }
            }
            if (input) {
                input.addEventListener('input', apply);
            }
            if (year) {
                year.addEventListener('change', apply);
            }
        });
    }

    function loadHlsLibrary(callback) {
        if (window.Hls) {
            callback();
            return;
        }
        var existing = qs('script[data-hls-loader]');
        if (existing) {
            existing.addEventListener('load', callback, { once: true });
            return;
        }
        var script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.18/dist/hls.min.js';
        script.async = true;
        script.setAttribute('data-hls-loader', 'true');
        script.addEventListener('load', callback, { once: true });
        document.head.appendChild(script);
    }

    function setupPlayer(video) {
        var src = video.getAttribute('data-hls-src');
        if (!src) {
            return;
        }
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = src;
            return;
        }
        loadHlsLibrary(function () {
            if (!window.Hls || !window.Hls.isSupported()) {
                return;
            }
            var hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(src);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.ERROR, function (event, data) {
                if (!data || !data.fatal) {
                    return;
                }
                if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                    hls.startLoad();
                } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                    hls.recoverMediaError();
                } else {
                    hls.destroy();
                }
            });
        });
    }

    function initPlayers() {
        qsa('video[data-hls-src]').forEach(function (video) {
            setupPlayer(video);
            var card = video.closest('.player-card');
            var overlay = card ? qs('[data-player-start]', card) : null;
            if (overlay) {
                overlay.addEventListener('click', function () {
                    overlay.classList.add('is-hidden');
                    video.play().catch(function () {
                        overlay.classList.remove('is-hidden');
                    });
                });
                video.addEventListener('play', function () {
                    overlay.classList.add('is-hidden');
                });
            }
        });
    }

    function createCard(movie) {
        var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
            return '<span>' + escapeHtml(tag) + '</span>';
        }).join('');
        return [
            '<article class="movie-card">',
            '    <a class="movie-card__cover" href="' + escapeHtml(movie.url) + '">',
            '        <img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
            '        <span class="movie-card__badge">' + escapeHtml(movie.yearText) + '</span>',
            '        <span class="movie-card__play">立即观看</span>',
            '    </a>',
            '    <div class="movie-card__body">',
            '        <a class="movie-card__title" href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a>',
            '        <p>' + escapeHtml(movie.oneLine || '') + '</p>',
            '        <div class="movie-card__meta">',
            '            <span>' + escapeHtml(movie.region) + '</span>',
            '            <span>' + escapeHtml(movie.type) + '</span>',
            '            <span>' + formatViews(movie.views || 0) + ' 次</span>',
            '        </div>',
            '        <div class="movie-card__tags">' + tags + '</div>',
            '    </div>',
            '</article>'
        ].join('');
    }

    function escapeHtml(value) {
        return String(value).replace(/[&<>"']/g, function (char) {
            return {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#39;'
            }[char];
        });
    }

    function initSearchPage() {
        var resultBox = qs('[data-search-results]');
        if (!resultBox || !window.MOVIE_DATA) {
            return;
        }
        var input = qs('[data-search-page-input]');
        var year = qs('[data-search-year]');
        var category = qs('[data-search-category]');
        var summary = qs('[data-search-summary]');
        var params = new URLSearchParams(window.location.search);
        if (params.get('q') && input) {
            input.value = params.get('q');
        }
        function apply() {
            var keyword = input ? input.value.trim().toLowerCase() : '';
            var selectedYear = year ? year.value : '';
            var selectedCategory = category ? category.value : '';
            var matches = window.MOVIE_DATA.filter(function (movie) {
                var haystack = [
                    movie.title,
                    movie.region,
                    movie.type,
                    movie.genre,
                    movie.yearText,
                    movie.categoryName,
                    (movie.tags || []).join(' '),
                    movie.oneLine
                ].join(' ').toLowerCase();
                return (!keyword || haystack.indexOf(keyword) >= 0) &&
                    (!selectedYear || String(movie.year) === selectedYear) &&
                    (!selectedCategory || movie.categorySlug === selectedCategory);
            }).sort(function (a, b) {
                return (b.year - a.year) || (b.views - a.views);
            }).slice(0, 120);
            resultBox.innerHTML = matches.length ? matches.map(createCard).join('') : '<div class="no-results">没有找到匹配影片。</div>';
            if (summary) {
                summary.textContent = '找到 ' + matches.length + ' 条结果；最多展示 120 条，可继续缩小关键词。';
            }
            initImageFallback();
        }
        [input, year, category].forEach(function (control) {
            if (control) {
                control.addEventListener('input', apply);
                control.addEventListener('change', apply);
            }
        });
        apply();
    }

    document.addEventListener('DOMContentLoaded', function () {
        initMobileMenu();
        initHero();
        initImageFallback();
        initLocalFilters();
        initPlayers();
        initSearchPage();
    });
})();
