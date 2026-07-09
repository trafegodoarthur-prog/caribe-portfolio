/* ============================================================
   Caribé Tráfego Pago — interações
   ============================================================ */
(function () {
  "use strict";

  var WHATSAPP = "5579998036643";
  var nav = document.getElementById("nav");
  var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- nav scroll state + reading progress ---------- */
  var progressBar = document.getElementById("progressBar");
  var waFloat = document.querySelector(".wa-float");

  function onScroll() {
    var y = window.scrollY || document.documentElement.scrollTop;
    if (nav) nav.classList.toggle("scrolled", y > 40);

    var h = document.documentElement;
    var max = h.scrollHeight - h.clientHeight;
    var pct = max > 0 ? (y / max) * 100 : 0;
    if (progressBar) progressBar.style.width = pct + "%";

    if (waFloat) waFloat.classList.toggle("show", y > 600);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- mobile menu ---------- */
  var menuBtn = document.getElementById("navMenu");
  if (menuBtn) {
    menuBtn.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
    });
    nav.querySelectorAll(".nav__links a").forEach(function (a) {
      a.addEventListener("click", function () {
        nav.classList.remove("open");
        menuBtn.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---------- reveal on scroll ---------- */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !prefersReduced) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------- stat count-up ---------- */
  function formatNumber(value, decimals) {
    var fixed = value.toFixed(decimals);
    var parts = fixed.split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return decimals > 0 ? parts[0] + "," + parts[1] : parts[0];
  }

  function animateStat(el) {
    var target = parseFloat(el.getAttribute("data-target"));
    var decimals = parseInt(el.getAttribute("data-decimals") || "0", 10);
    var prefix = el.getAttribute("data-prefix") || "";
    var suffix = el.getAttribute("data-suffix") || "";
    if (prefersReduced) {
      el.textContent = prefix + formatNumber(target, decimals) + suffix;
      return;
    }
    var duration = 1800;
    var start = null;
    function step(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
      el.textContent = prefix + formatNumber(target * eased, decimals) + suffix;
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = prefix + formatNumber(target, decimals) + suffix;
    }
    requestAnimationFrame(step);
  }

  var statNums = document.querySelectorAll(".stat__num");
  if ("IntersectionObserver" in window) {
    var statIO = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            animateStat(e.target);
            statIO.unobserve(e.target);
          }
        });
      },
      { threshold: 0.5 }
    );
    statNums.forEach(function (el) { statIO.observe(el); });
  } else {
    statNums.forEach(animateStat);
  }

  /* ---------- curve draw trigger ---------- */
  var curve = document.querySelector(".curve");
  if (curve && "IntersectionObserver" in window) {
    var curveIO = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { e.target.classList.add("in"); curveIO.unobserve(e.target); }
        });
      },
      { threshold: 0.4 }
    );
    curveIO.observe(curve);
  }

  /* ---------- FAQ smooth accordion ---------- */
  var faqItems = document.querySelectorAll(".faq__item");
  faqItems.forEach(function (item) {
    var answer = item.querySelector(".faq__a");
    var summary = item.querySelector("summary");
    summary.addEventListener("click", function (ev) {
      ev.preventDefault();
      var isOpen = item.hasAttribute("open");
      if (isOpen) {
        answer.style.maxHeight = answer.scrollHeight + "px";
        requestAnimationFrame(function () { answer.style.maxHeight = "0px"; });
        answer.addEventListener("transitionend", function te() {
          item.removeAttribute("open");
          answer.removeEventListener("transitionend", te);
        });
      } else {
        // close siblings (one-open accordion)
        faqItems.forEach(function (other) {
          if (other !== item && other.hasAttribute("open")) {
            var oa = other.querySelector(".faq__a");
            oa.style.maxHeight = "0px";
            other.removeAttribute("open");
          }
        });
        item.setAttribute("open", "");
        answer.style.maxHeight = answer.scrollHeight + "px";
      }
    });
  });
  window.addEventListener("resize", function () {
    faqItems.forEach(function (item) {
      if (item.hasAttribute("open")) {
        var a = item.querySelector(".faq__a");
        a.style.maxHeight = a.scrollHeight + "px";
      }
    });
  });

  /* ---------- lead form -> WhatsApp ---------- */
  var form = document.getElementById("leadForm");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var nome = (document.getElementById("nome").value || "").trim();
      var livro = (document.getElementById("livro").value || "").trim();
      var fase = document.getElementById("fase").value || "";

      var msg = "Olá, Caribé! Vim pelo site. ";
      msg += "Meu nome é " + (nome || "(autora)");
      msg += livro ? " e meu livro é " + livro + "." : ".";
      msg += " Fase: " + fase + ".";
      msg += " Quero conversar sobre o tráfego do meu lançamento.";

      var url = "https://wa.me/" + WHATSAPP + "?text=" + encodeURIComponent(msg);
      window.open(url, "_blank", "noopener");
    });
  }

  /* ---------- lightbox (pódio na amazon) ---------- */
  var lightbox = document.getElementById("lightbox");
  var lightboxImg = document.getElementById("lightboxImg");
  var lightboxClose = document.getElementById("lightboxClose");

  function openLightbox(src, alt) {
    if (!lightbox) return;
    lightboxImg.src = src;
    lightboxImg.alt = alt || "";
    lightbox.classList.add("open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }
  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove("open");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    lightboxImg.src = "";
  }

  document.querySelectorAll(".trophy[href]").forEach(function (t) {
    t.addEventListener("click", function (e) {
      e.preventDefault();
      var img = t.querySelector("img");
      openLightbox(t.getAttribute("href"), img ? img.alt : "");
    });
  });
  if (lightboxClose) lightboxClose.addEventListener("click", closeLightbox);
  if (lightbox) {
    lightbox.addEventListener("click", function (e) {
      if (e.target === lightbox) closeLightbox();
    });
  }
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && lightbox && lightbox.classList.contains("open")) closeLightbox();
  });

  /* ---------- footer year ---------- */
  var ano = document.getElementById("ano");
  if (ano) ano.textContent = new Date().getFullYear();
})();
