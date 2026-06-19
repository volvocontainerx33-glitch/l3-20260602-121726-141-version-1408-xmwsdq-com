(function () {
    var fallbackVideoUrl = "https://customer-7t103rn8rocxo5v6.cloudflarestream.com/e398cb38b257828eeedbcaa0ae2856da/manifest/video.m3u8";

    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
        } else {
            document.addEventListener("DOMContentLoaded", fn);
        }
    }

    function setupMobileNav() {
        var toggle = document.querySelector("[data-nav-toggle]");
        var nav = document.querySelector("[data-mobile-nav]");

        if (!toggle || !nav) {
            return;
        }

        toggle.addEventListener("click", function () {
            nav.classList.toggle("is-open");
        });
    }

    function setupHero() {
        var hero = document.querySelector("[data-hero]");

        if (!hero) {
            return;
        }

        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
            });
        }

        function play() {
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        if (slides.length < 2) {
            show(0);
            return;
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener("click", function () {
                window.clearInterval(timer);
                show(dotIndex);
                play();
            });
        });

        show(0);
        play();
    }

    function yearMatches(cardYear, selectedYear) {
        if (!selectedYear) {
            return true;
        }

        var numericYear = parseInt(cardYear || "0", 10);
        var filterYear = parseInt(selectedYear, 10);

        if (filterYear === 1990) {
            return numericYear > 0 && numericYear < 2000;
        }

        if (filterYear === 2000) {
            return numericYear >= 2000 && numericYear < 2010;
        }

        if (filterYear === 2010) {
            return numericYear >= 2010 && numericYear < 2020;
        }

        return numericYear === filterYear;
    }

    function setupFilters() {
        var panels = Array.prototype.slice.call(document.querySelectorAll("[data-filter-panel]"));

        panels.forEach(function (panel) {
            var input = panel.querySelector("[data-filter-input]");
            var region = panel.querySelector("[data-filter-region]");
            var year = panel.querySelector("[data-filter-year]");
            var reset = panel.querySelector("[data-filter-reset]");
            var count = panel.querySelector("[data-filter-count]");
            var scope = panel.closest("main") || document;
            var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card, .rank-row"));
            var empty = scope.querySelector("[data-empty-state]");

            function apply() {
                var keyword = (input && input.value || "").trim().toLowerCase();
                var selectedRegion = region && region.value || "";
                var selectedYear = year && year.value || "";
                var visible = 0;

                cards.forEach(function (card) {
                    var haystack = [
                        card.getAttribute("data-title"),
                        card.getAttribute("data-region"),
                        card.getAttribute("data-genre"),
                        card.getAttribute("data-type"),
                        card.getAttribute("data-tags")
                    ].join(" ").toLowerCase();
                    var cardRegion = card.getAttribute("data-region") || "";
                    var cardYear = card.getAttribute("data-year") || "";
                    var matchedKeyword = !keyword || haystack.indexOf(keyword) !== -1;
                    var matchedRegion = !selectedRegion || cardRegion.indexOf(selectedRegion) !== -1;
                    var matchedYear = yearMatches(cardYear, selectedYear);
                    var matched = matchedKeyword && matchedRegion && matchedYear;

                    card.style.display = matched ? "" : "none";

                    if (matched) {
                        visible += 1;
                    }
                });

                if (count) {
                    count.textContent = "当前显示 " + visible + " 部影片";
                }

                if (empty) {
                    empty.classList.toggle("is-visible", visible === 0);
                }
            }

            [input, region, year].forEach(function (control) {
                if (!control) {
                    return;
                }

                control.addEventListener("input", apply);
                control.addEventListener("change", apply);
            });

            if (reset) {
                reset.addEventListener("click", function () {
                    if (input) {
                        input.value = "";
                    }

                    if (region) {
                        region.value = "";
                    }

                    if (year) {
                        year.value = "";
                    }

                    apply();
                });
            }

            apply();
        });
    }

    function setupPlayer() {
        var video = document.querySelector("[data-player-video]");
        var button = document.querySelector("[data-player-button]");
        var overlay = document.querySelector("[data-player-overlay]");

        if (!video || !button) {
            return;
        }

        function startPlayer() {
            var source = video.getAttribute("data-src") || fallbackVideoUrl;

            if (!source) {
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls();
                hls.loadSource(source);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    video.play().catch(function () {
                        video.controls = true;
                    });
                });
            } else {
                video.src = source;
                video.play().catch(function () {
                    video.controls = true;
                });
            }

            video.controls = true;

            if (overlay) {
                overlay.classList.add("is-hidden");
            }
        }

        button.addEventListener("click", startPlayer);
    }

    ready(function () {
        setupMobileNav();
        setupHero();
        setupFilters();
        setupPlayer();
    });
}());
