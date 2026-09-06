(() => {
  document.documentElement.classList.add('js');

  const imgs = document.querySelectorAll('.media-motif img');
  if (!imgs.length) return;

  if (!('IntersectionObserver' in window)) {
    imgs.forEach(img => img.classList.add('is-visible'));
    return;
  }

  const io = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      }
    }
  }, { threshold: 0.5 });

  imgs.forEach(img => io.observe(img));
})();
