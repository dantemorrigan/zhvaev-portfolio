/* ============================================================
   Никита Жваев — interactions
   cursor · reactive bg · parallax · reveal · theme · skills
   ============================================================ */
(function () {
  "use strict";

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* ---------- Theme ---------- */
  const root = document.documentElement;
  const toggle = document.getElementById("themeToggle");
  function applyTheme(t) {
    if (t === "dark") root.setAttribute("data-theme", "dark");
    else root.removeAttribute("data-theme");
    try { localStorage.setItem("nz-theme", t); } catch (e) {}
  }
  const saved = (function () { try { return localStorage.getItem("nz-theme"); } catch (e) { return null; } })();
  if (saved) applyTheme(saved);
  else if (window.matchMedia("(prefers-color-scheme: dark)").matches) applyTheme("dark");
  toggle && toggle.addEventListener("click", function () {
    applyTheme(root.getAttribute("data-theme") === "dark" ? "light" : "dark");
  });

  /* ---------- Custom cursor ---------- */
  if (finePointer && !prefersReduced) {
    document.body.classList.add("has-cursor");
    const dot = document.getElementById("cursorDot");
    const ring = document.getElementById("cursorRing");
    let mx = window.innerWidth / 2, my = window.innerHeight / 2;
    let rx = mx, ry = my;
    window.addEventListener("mousemove", function (e) {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%, -50%)`;
    });
    (function loop() {
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`;
      requestAnimationFrame(loop);
    })();
    const hoverSel = "a, button, .role-chip, .tag, .proj, .cert, .c-link";
    document.querySelectorAll(hoverSel).forEach(function (el) {
      el.addEventListener("mouseenter", () => ring.classList.add("is-hover"));
      el.addEventListener("mouseleave", () => ring.classList.remove("is-hover"));
    });
    window.addEventListener("mouseout", function (e) {
      if (!e.relatedTarget) { dot.style.opacity = "0"; ring.style.opacity = "0"; }
    });
    window.addEventListener("mouseover", function () {
      dot.style.opacity = "1"; ring.style.opacity = "1";
    });
  }

  /* ---------- Reactive background ---------- */
  const glow = document.getElementById("bgGlow");
  const grid = document.getElementById("bgGrid");
  let tgx = window.innerWidth / 2, tgy = window.innerHeight / 2;
  let cgx = tgx, cgy = tgy;
  if (!prefersReduced) {
    window.addEventListener("mousemove", function (e) { tgx = e.clientX; tgy = e.clientY; }, { passive: true });
    (function bgLoop() {
      cgx += (tgx - cgx) * 0.06;
      cgy += (tgy - cgy) * 0.06;
      if (glow) glow.style.transform = `translate3d(${cgx}px, ${cgy}px, 0) translate(-50%, -50%)`;
      // subtle grid parallax based on offset from centre
      const ox = (cgx / window.innerWidth - 0.5) * 24;
      const oy = (cgy / window.innerHeight - 0.5) * 24;
      if (grid) grid.style.transform = `translate3d(${ox}px, ${oy}px, 0)`;
      requestAnimationFrame(bgLoop);
    })();
  }

  /* ---------- Hero parallax + intro ---------- */
  const heroName = document.getElementById("heroName");
  const avatar = document.getElementById("avatarWrap");
  if (!prefersReduced) {
    window.addEventListener("mousemove", function (e) {
      const dx = (e.clientX / window.innerWidth - 0.5);
      const dy = (e.clientY / window.innerHeight - 0.5);
      if (heroName) heroName.style.transform = `translate(${dx * 18}px, ${dy * 10}px)`;
      if (avatar) avatar.style.transform = `translate(${dx * -26}px, ${dy * -16}px)`;
    }, { passive: true });
    // hero scroll parallax
    window.addEventListener("scroll", function () {
      const y = window.scrollY;
      if (heroName && y < window.innerHeight) heroName.style.opacity = String(Math.max(0, 1 - y / (window.innerHeight * 0.8)));
    }, { passive: true });
  }

  let heroRevealed = false;
  function revealHeroName() {
    if (heroRevealed || !heroName) return;
    heroRevealed = true;
    heroName.querySelectorAll(".ln span").forEach(function (s, i) {
      s.style.transition = "transform 0.9s cubic-bezier(0.22,1,0.36,1)";
      s.style.transitionDelay = (0.15 + i * 0.1) + "s";
      s.style.transform = "translateY(0)";
    });
  }
  // Safety: never leave the name clipped even if boot is skipped/blocked.
  window.addEventListener("load", revealHeroName);
  setTimeout(revealHeroName, 1800);

  /* ---------- Boot intro ---------- */
  const boot = document.getElementById("boot");
  const bootCount = document.getElementById("bootCount");
  function finishBoot() {
    boot && boot.classList.add("done");
    revealHeroName();
    setTimeout(() => { boot && boot.remove(); }, 800);
  }
  if (boot && !prefersReduced) {
    let n = 0;
    const iv = setInterval(function () {
      n += Math.floor(Math.random() * 11) + 6;
      if (n >= 100) { n = 100; clearInterval(iv); setTimeout(finishBoot, 320); }
      bootCount.textContent = String(n).padStart(2, "0");
    }, 90);
  } else {
    finishBoot();
  }

  /* ---------- Scroll reveal ---------- */
  const revealEls = Array.from(document.querySelectorAll("[data-reveal]"));
  function show(el) {
    if (el.classList.contains("in")) return;
    el.classList.add("in");
    animateSkills(el);
  }
  let io = null;
  if ("IntersectionObserver" in window) {
    io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { show(en.target); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    revealEls.forEach((el) => io.observe(el));
  }
  // Fallback 1 — reveal anything already in (or near) the viewport on load.
  function revealInView() {
    const vh = window.innerHeight || document.documentElement.clientHeight;
    revealEls.forEach(function (el) {
      const r = el.getBoundingClientRect();
      if (r.top < vh * 0.92 && r.bottom > 0) { show(el); io && io.unobserve(el); }
    });
  }
  window.addEventListener("load", revealInView);
  revealInView();
  // Fallback 2 — safety net: never leave content hidden.
  setTimeout(function () { revealEls.forEach(show); }, 1600);

  /* ---------- Skill bars ---------- */
  var skillsDone = false;
  function animateSkills(scope) {
    const bars = document.querySelectorAll("#skillBars .skill-fill");
    if (skillsDone || !bars.length) return;
    const wrap = document.getElementById("skillBars");
    if (scope !== wrap && !(scope.contains && scope.contains(wrap))) return;
    skillsDone = true;
    bars.forEach(function (b, i) {
      setTimeout(() => { b.style.width = (b.dataset.pct || 0) + "%"; }, 120 + i * 110);
    });
  }

  /* ---------- Nav state + scroll progress + scrollspy ---------- */
  const nav = document.getElementById("nav");
  const scrollBar = document.getElementById("scrollBar");
  const navLinks = Array.from(document.querySelectorAll(".nav-links a[href^='#']"));
  const sections = navLinks
    .map((a) => document.querySelector(a.getAttribute("href")))
    .filter(Boolean);

  function onScroll() {
    const y = window.scrollY;
    nav && nav.classList.toggle("scrolled", y > 40);
    const h = document.documentElement.scrollHeight - window.innerHeight;
    if (scrollBar) scrollBar.style.width = (h > 0 ? (y / h) * 100 : 0) + "%";

    let current = null;
    const mid = y + window.innerHeight * 0.32;
    sections.forEach(function (sec) {
      if (sec.offsetTop <= mid) current = sec.id;
    });
    navLinks.forEach(function (a) {
      a.classList.toggle("active", a.getAttribute("href") === "#" + current);
    });
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Lightbox ---------- */
  const lb = document.getElementById("lightbox");
  const lbImg = document.getElementById("lightboxImg");
  const lbCap = document.getElementById("lightboxCap");
  const lbClose = document.getElementById("lightboxClose");
  function openLb(src, cap) {
    if (!lb) return;
    lbImg.src = src;
    lbImg.alt = cap || "";
    lbCap.textContent = cap || "";
    lb.classList.add("open");
    document.body.style.overflow = "hidden";
  }
  function closeLb() {
    if (!lb) return;
    lb.classList.remove("open");
    document.body.style.overflow = "";
    setTimeout(() => { if (!lb.classList.contains("open")) lbImg.removeAttribute("src"); }, 400);
  }
  document.querySelectorAll(".cert").forEach(function (fig) {
    fig.addEventListener("click", function () {
      openLb(fig.getAttribute("data-full"), fig.getAttribute("data-cap"));
    });
  });
  lbClose && lbClose.addEventListener("click", closeLb);
  lb && lb.addEventListener("click", function (e) { if (e.target === lb) closeLb(); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeLb(); });

})();
