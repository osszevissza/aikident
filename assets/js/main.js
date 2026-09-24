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

  /* --- intake sheet: print, or save to a file on the patient's own device --- */
  /* The form is never submitted: there is no backend and the practice does not
     collect personal data through the site. "Saving" builds a self-contained HTML
     copy of the filled sheet in the browser and hands it to the browser's download
     machinery — deliberately a Blob and an <a download>, so nothing is transmitted
     anywhere (no fetch, no form action, no third-party script). */
  var intake = document.querySelector('[data-intake-form]');
  if (intake) {
    var intakeStatus = document.querySelector('[data-intake-status]');

    var printBtn = intake.querySelector('[data-print]');
    if (printBtn) {
      printBtn.addEventListener('click', function () { window.print(); });
    }

    var escapeHtml = function (s) {
      return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
        .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    };

    /* the saved file reuses the sheet's own markup, so a field added to the form
       appears in the saved copy without touching this code */
    var sheetFile = function (container) {
      var clone = container.cloneNode(true);
      var live = container.querySelectorAll('input, textarea, select');
      var copy = clone.querySelectorAll('input, textarea, select');
      for (var i = 0; i < live.length; i++) {
        var from = live[i], to = copy[i];
        if (!to) continue;
        if (from.type === 'checkbox' || from.type === 'radio') {
          if (from.checked) to.setAttribute('checked', 'checked');
          else to.removeAttribute('checked');
        } else if (from.tagName === 'TEXTAREA') {
          to.textContent = from.value;
        } else {
          to.setAttribute('value', from.value);
        }
      }
      var actions = clone.querySelector('.iform__actions');
      if (actions && actions.parentNode) actions.parentNode.removeChild(actions);
      var heading = document.querySelector('.iform__head h2');
      var title = heading ? heading.textContent.trim() : 'Új páciens adatlap';
      var style = [
        'body{font:15px/1.6 -apple-system,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;color:#24141a;margin:24px auto;max-width:800px;padding:0 16px}',
        'h2{font-size:22px;margin:0 0 4px}address{font-style:normal;font-size:13px;color:#4b3940}',
        '.iform__head{display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap}',
        '.iform__note{border:1px solid #ddd;border-radius:6px;padding:10px 12px;font-size:13px}',
        '.iform__set{border:0;padding:0;margin:0 0 20px}',
        '.iform__grouplabel{font-weight:600;margin:18px 0 8px}',
        '.iform__grid{display:grid;grid-template-columns:1fr 1fr;gap:12px 18px}',
        '.iform__f{display:grid;gap:2px}.iform__f--wide{grid-column:1/-1}',
        '.iform__f label{font-size:12px;color:#5c0d23}',
        '.iform__f input,.iform__f textarea{border:0;border-bottom:1px solid #999;padding:4px 2px;font:inherit;width:100%;background:none}',
        '.iform__opts{display:grid;gap:6px}.iform__opt{display:flex;gap:8px;align-items:flex-start;font-size:13px}',
        '.iform__consent{font-size:12px;color:#4b3940}.iform__sign{display:grid;grid-template-columns:1fr 1fr;gap:18px}',
        '.saved-note{margin-top:24px;padding-top:10px;border-top:1px solid #ddd;font-size:12px;color:#4b3940}',
        '@media (max-width:640px){.iform__grid,.iform__sign{grid-template-columns:1fr}}',
        '@media print{body{margin:0;max-width:none}.iform__f input,.iform__f textarea{border-bottom-color:#333}}'
      ].join('');
      return '<!doctype html>\n<html lang="hu">\n<head>\n<meta charset="utf-8">\n' +
        '<title>' + escapeHtml(title) + '</title>\n<style>' + style + '</style>\n</head>\n<body>\n' +
        clone.outerHTML +
        '\n<p class="saved-note">Ez a fájl az Ön gépén maradt: a honlap nem kapott belőle adatot, ' +
        'és nem is tárolja. Kinyomtatva vagy PDF-be mentve hozza magával az első vizitre.</p>\n' +
        '</body>\n</html>\n';
    };

    var saveBtn = intake.querySelector('[data-save]');
    if (saveBtn) {
      saveBtn.addEventListener('click', function () {
        var container = intake.closest('.iform') || intake;
        var now = new Date();
        var stamp = now.getFullYear() + '-' +
          String(now.getMonth() + 1).replace(/^(\d)$/, '0$1') + '-' +
          String(now.getDate()).replace(/^(\d)$/, '0$1');
        var name = 'aiki-dent-adatlap-' + stamp + '.html';
        var blob = new Blob([sheetFile(container)], { type: 'text/html;charset=utf-8' });
        var url = URL.createObjectURL(blob);
        var link = document.createElement('a');
        link.href = url;
        link.download = name;
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
        window.setTimeout(function () { URL.revokeObjectURL(url); }, 2000);
        if (intakeStatus) {
          intakeStatus.hidden = false;
          intakeStatus.textContent = 'Elmentve a gépére: ' + name +
            ' — ezt a fájlt bármikor kinyomtathatja, vagy PDF-be mentheti belőle.';
        }
      });
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
