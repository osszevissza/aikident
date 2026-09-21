/* Aiki Dent Fogászat — progressive enhancement only. */
(function () {
  'use strict';

  /* --- sticky header shadow ------------------------------------------- */
  var header = document.getElementById('site-header');
  if (header) {
    var onScroll = function () {
      header.classList.toggle('is-stuck', window.scrollY > 12);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* --- mobile drawer --------------------------------------------------- */
  var drawer = document.getElementById('drawer');
  if (drawer) {
    var openers = document.querySelectorAll('[data-drawer-open]');
    var closers = drawer.querySelectorAll('[data-drawer-close]');
    var lastFocus = null;

    var open = function () {
      lastFocus = document.activeElement;
      drawer.hidden = false;
      /* next frame so the transition runs */
      requestAnimationFrame(function () {
        drawer.classList.add('is-open');
      });
      document.body.classList.add('is-locked');
      openers.forEach(function (b) { b.setAttribute('aria-expanded', 'true'); });
      var first = drawer.querySelector('.drawer__close');
      if (first) first.focus();
    };

    var close = function () {
      drawer.classList.remove('is-open');
      document.body.classList.remove('is-locked');
      openers.forEach(function (b) { b.setAttribute('aria-expanded', 'false'); });
      window.setTimeout(function () { drawer.hidden = true; }, 380);
      if (lastFocus) lastFocus.focus();
    };

    openers.forEach(function (b) { b.addEventListener('click', open); });
    closers.forEach(function (b) { b.addEventListener('click', close); });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && drawer.classList.contains('is-open')) close();
    });

    /* keep focus inside the panel while it is open */
    drawer.addEventListener('keydown', function (e) {
      if (e.key !== 'Tab' || !drawer.classList.contains('is-open')) return;
      var f = drawer.querySelectorAll('a[href], button, input, textarea, select');
      if (!f.length) return;
      var first = f[0];
      var last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
  }

  /* --- scroll reveal --------------------------------------------------- */
  var reveals = document.querySelectorAll('.reveal');
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (reveals.length) {
    if (reduced || !('IntersectionObserver' in window)) {
      reveals.forEach(function (el) { el.classList.add('is-in'); });
    } else {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-in');
            io.unobserve(entry.target);
          }
        });
      }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
      reveals.forEach(function (el) { io.observe(el); });
    }
  }

  /* --- contact / intake forms (demo: no backend) ----------------------- */
  var form = document.querySelector('[data-demo-form]');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var status = form.querySelector('[data-form-status]');
      if (status) {
        status.hidden = false;
        status.textContent = 'Köszönjük! Ez egy bemutató űrlap — éles környezetben itt küldenénk el az adatokat. Kérjük, addig hívjon minket a +36 30 193 2714 számon.';
      }
    });
  }

  var intake = document.querySelector('[data-intake-form]');
  if (intake) {
    var intakeStatus = intake.querySelector('[data-form-status]');
    intake.addEventListener('submit', function (e) {
      e.preventDefault();
      if (intakeStatus) {
        intakeStatus.hidden = false;
        intakeStatus.textContent = 'Köszönjük! Ez egy bemutató adatlap — éles környezetben itt küldenénk el az adatokat a rendelőnek.';
      }
    });
    var printBtn = intake.querySelector('[data-print]');
    if (printBtn) {
      printBtn.addEventListener('click', function () { window.print(); });
    }
  }

  /* --- scroll to top --------------------------------------------------- */
  var toTop = document.querySelector('[data-to-top]');
  if (toTop) {
    var calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var SHOW_AFTER = 480;
    var queued = false;

    var syncTop = function () {
      toTop.classList.toggle('is-visible', window.scrollY > SHOW_AFTER);
    };
    syncTop();
    window.addEventListener('scroll', function () {
      if (queued) return;
      queued = true;
      requestAnimationFrame(function () { syncTop(); queued = false; });
    }, { passive: true });

    /* the global stylesheet sets `html { scroll-behavior: smooth }`; turn it off
       for the duration so we own the timing instead of the browser's default */
    var scrollInstant = function (y) {
      var root = document.documentElement;
      var previous = root.style.scrollBehavior;
      root.style.scrollBehavior = 'auto';
      window.scrollTo(0, y);
      root.style.scrollBehavior = previous;
    };

    toTop.addEventListener('click', function () {
      var start = window.scrollY;
      if (start <= 0) return;

      var main = document.getElementById('main');
      var land = function () {
        /* the control hides itself at the top, so hand focus to the content
           rather than leaving keyboard users with nothing focused */
        if (main) main.focus({ preventScroll: true });
      };

      if (calm) { scrollInstant(0); land(); return; }

      /* snappy and distance-aware: ~320ms for a short hop, capped at 620ms */
      var duration = Math.min(620, 320 + start * 0.05);
      var t0 = performance.now();
      var root = document.documentElement;
      var previous = root.style.scrollBehavior;
      root.style.scrollBehavior = 'auto';

      var step = function (now) {
        var p = Math.min((now - t0) / duration, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        window.scrollTo(0, Math.round(start * (1 - eased)));
        if (p < 1) {
          requestAnimationFrame(step);
        } else {
          root.style.scrollBehavior = previous;
          land();
        }
      };
      requestAnimationFrame(step);
    });
  }
})();
