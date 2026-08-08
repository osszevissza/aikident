const button = document.querySelector('#scrollToTopBtn')
if (button) {
  const toggleButton = () => button.classList.toggle('is-visible', window.scrollY > 500)
  toggleButton()
  window.addEventListener('scroll', toggleButton, { passive: true })
}
