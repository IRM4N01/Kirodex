export function runSplash() {
  const splash = document.querySelector('#splash');
  if (!splash) return;

  const hide = () => {
    splash.classList.add('is-hidden');
    setTimeout(() => splash.remove(), 500);
  };

  const timer = setTimeout(hide, 1200);

  // Tap to skip
  splash.addEventListener('click', () => {
    clearTimeout(timer);
    hide();
  }, { once: true });
}