(function () {
  var menuButton = document.querySelector(".menu-toggle");
  var mobileNav = document.querySelector(".mobile-nav");

  if (menuButton && mobileNav) {
    menuButton.addEventListener("click", function () {
      mobileNav.classList.toggle("is-open");
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
  var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
  var index = 0;

  function setSlide(next) {
    if (!slides.length) {
      return;
    }

    index = (next + slides.length) % slides.length;

    slides.forEach(function (slide, i) {
      slide.classList.toggle("is-active", i === index);
    });

    dots.forEach(function (dot, i) {
      dot.classList.toggle("is-active", i === index);
    });
  }

  dots.forEach(function (dot) {
    dot.addEventListener("click", function () {
      setSlide(parseInt(dot.getAttribute("data-hero-dot"), 10));
    });
  });

  if (slides.length > 1) {
    setInterval(function () {
      setSlide(index + 1);
    }, 5200);
  }

  var search = document.querySelector(".library-search");
  var yearSelect = document.querySelector(".library-select");
  var cards = Array.prototype.slice.call(document.querySelectorAll("[data-library-grid] .movie-card"));

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function applyFilters() {
    var keyword = normalize(search && search.value);
    var year = normalize(yearSelect && yearSelect.value);

    cards.forEach(function (card) {
      var haystack = normalize([
        card.getAttribute("data-title"),
        card.getAttribute("data-year"),
        card.getAttribute("data-region"),
        card.getAttribute("data-genre")
      ].join(" "));
      var cardYear = normalize(card.getAttribute("data-year"));
      var matched = (!keyword || haystack.indexOf(keyword) !== -1) && (!year || cardYear === year);
      card.classList.toggle("is-hidden", !matched);
    });
  }

  if (search || yearSelect) {
    var params = new URLSearchParams(window.location.search);
    var q = params.get("q");

    if (q && search) {
      search.value = q;
    }

    if (search) {
      search.addEventListener("input", applyFilters);
    }

    if (yearSelect) {
      yearSelect.addEventListener("change", applyFilters);
    }

    applyFilters();
  }
})();
