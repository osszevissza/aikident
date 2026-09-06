(() => {
  if (!('IntersectionObserver' in window)) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const options = {
    root: null,
    rootMargin: '0px',
    threshold: 0.5,
  };

  const observer = new IntersectionObserver(fuggveny, options);

  const figyelendok = document.querySelectorAll('.media-motif img');

  for (const figyelendo of figyelendok) {
    figyelendo.style.filter = 'grayscale(95%) sepia(10%)';
    observer.observe(figyelendo);
  }

  function fuggveny(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.filter = 'grayscale(0%) sepia(0%)';
      } else {
        entry.target.style.filter = 'grayscale(95%) sepia(10%)';
      }
    });
  }
})();
