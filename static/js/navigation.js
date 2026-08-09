(() => {
  const toggle = document.querySelector('.nav-toggle');
  const panel = document.querySelector('.nav-wrapper');
  if (!toggle || !panel) return;

  const links = [...panel.querySelectorAll('.menu-list a')];
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Háttér-felület, ami kattintásra bezárja a menüt.
  const backdrop = document.createElement('div');
  backdrop.className = 'nav-backdrop';
  backdrop.setAttribute('aria-hidden', 'true');
  document.body.appendChild(backdrop);

  let open = false, raf = 0, last = 0;

  function dropIn() {
    cancelAnimationFrame(raf);

    links.forEach(a => {
      a.style.opacity = 0;
      a.style.transform = 'translateX(-18px)';
    });
    panel.classList.add('is-open');
    panel.style.opacity = 1;


    if (reduce) {
      panel.style.transform = 'translateY(0) scaleY(1) scaleX(1)';
      revealLinks(0);
      return;
    }

    let y = -235;      // fentről érkezik
    let v = 0;         // sebesség
    const gravity = 1850;
    const bounce = 0.47;
    const floor = 0;
    last = performance.now();

    function frame(now) {
      const dt = Math.min((now - last) / 1000, 0.032);
      last = now;
      v += gravity * dt;
      y += v * dt;

      if (y >= floor) {
        y = floor;
        v = -v * bounce;
        if (Math.abs(v) < 150) {
          v = 0;
          settle();
          return;
        }
      }

      const stretch = Math.max(-0.065, Math.min(0.12, v / 3600));
      const squash = 1 - stretch * 0.62;
      const sway = Math.max(-0.018, Math.min(0.018, v / 13000));
      panel.style.transform =
      `translate3d(0,${y}px,0) scaleX(${squash.toFixed(4)}) scaleY(${(1 + stretch).toFixed(4)}) rotate(${sway}rad)`;

      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);
  }

  function settle() {
    const start = performance.now();
    const dur = 180;
    function ease(t) { return 1 - Math.pow(1 - t, 3); }
    function frame(now) {
      const t = Math.min(1, (now - start) / dur);
      const e = ease(t);
      const s = Math.sin((1 - t) * Math.PI) * 0.035;
      panel.style.transform =
      `translate3d(0,0,0) scaleX(${1 - s}) scaleY(${1 + s})`;
      if (t < 1) raf = requestAnimationFrame(frame);
      else {
        panel.style.transform = 'translate3d(0,0,0) scale(1)';
        revealLinks(25);
      }
    }
    raf = requestAnimationFrame(frame);
  }

  function revealLinks(delay) {
    links.forEach((a, i) => {
      setTimeout(() => {
        a.style.transition =
        'transform .38s cubic-bezier(.16,1,.3,1), opacity .22s ease';
        a.style.opacity = 1;
        a.style.transform = 'translateX(0)';
      }, delay + i * 32);
    });
  }

  function closeMenu() {
    if (!open) return;
    open = false;
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Menü megnyitása');
    backdrop.classList.remove('is-visible');
    cancelAnimationFrame(raf);

    if (reduce) {
      panel.classList.remove('is-open');
      panel.style.opacity = 0;
      return;
    }

    panel.style.transition = 'transform .28s cubic-bezier(.55,0,.9,.35), opacity .16s ease .1s';
    panel.style.transform = 'translateY(-14px) scaleY(.96)';
    panel.style.opacity = 0;
    setTimeout(() => {
      panel.classList.remove('is-open');
      panel.style.transition = '';
      panel.style.transform = '';
    }, 290);
  }

  function toggleMenu() {
    if (open) closeMenu();
    else {
      open = true;
      toggle.setAttribute('aria-expanded', 'true');
      toggle.setAttribute('aria-label', 'Menü bezárása');
      backdrop.classList.add('is-visible');
      dropIn();
    }
  }

  toggle.addEventListener('click', toggleMenu);
  backdrop.addEventListener('click', closeMenu);
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeMenu();
  });

    // Ha közben asztali méretre húzzák az ablakot, zárd be és töröld az inline stílusokat.
    const desktop = window.matchMedia('(min-width: 861px)');
    desktop.addEventListener('change', () => {
      if (desktop.matches) closeMenu();
    });
})();
