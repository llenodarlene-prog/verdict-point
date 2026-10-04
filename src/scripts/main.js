const button = document.querySelector('.menu-button');
const nav = document.querySelector('#primary-nav');
if (button && nav) {
  button.addEventListener('click', () => {
    const open = button.getAttribute('aria-expanded') === 'true';
    button.setAttribute('aria-expanded', String(!open));
    nav.dataset.open = String(!open);
  });
}

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const header = document.querySelector('.site-header');
const heroPhoto = document.querySelector('.hero--immersive .backdrop-photo');
let ticking = false;
function onScroll() {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => {
    const y = window.scrollY;
    if (header) header.classList.toggle('is-scrolled', y > 8);
    // The hero photograph drifts slightly slower than the page.
    if (heroPhoto && !reducedMotion && y < window.innerHeight * 1.2) heroPhoto.style.transform = `translate3d(0, ${Math.round(y * -0.08)}px, 0)`;
    ticking = false;
  });
}
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// Reveal sections as they enter the viewport. Anything already on screen stays visible, so nothing flashes.
const revealTargets = [...document.querySelectorAll('[data-reveal]')];
if (revealTargets.length && !reducedMotion && 'IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.remove('reveal-pending');
      observer.unobserve(entry.target);
    }
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  for (const element of revealTargets) {
    if (element.getBoundingClientRect().top < window.innerHeight * 0.92) continue;
    // Siblings arrive one after another.
    const index = [...element.parentElement.children].filter(child => child.hasAttribute('data-reveal')).indexOf(element);
    element.style.transitionDelay = `${Math.min(index, 5) * 80}ms`;
    element.classList.add('reveal-pending');
    observer.observe(element);
  }
}
