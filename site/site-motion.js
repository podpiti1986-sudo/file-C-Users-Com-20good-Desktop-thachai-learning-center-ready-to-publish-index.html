(() => {
  'use strict';
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const progress = document.createElement('div');
  progress.className = 'reading-progress';
  progress.setAttribute('aria-hidden', 'true');
  document.body.append(progress);
  const top = document.createElement('button');
  top.className = 'back-to-top';
  top.type = 'button';
  top.setAttribute('aria-label', 'กลับด้านบน');
  top.innerHTML = '<span aria-hidden="true">↑</span>';
  top.hidden = true;
  document.body.append(top);
  top.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: reduced.matches ? 'instant' : 'smooth' });
    document.querySelector('.header .brand')?.focus({ preventScroll: true });
  });
  let scheduled = false;
  function paint() {
    const range = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.transform = `scaleX(${range > 0 ? Math.min(1, Math.max(0, window.scrollY / range)) : 0})`;
    top.hidden = window.scrollY < 500;
    scheduled = false;
  }
  function schedule() {
    if (!scheduled) { scheduled = true; requestAnimationFrame(paint); }
  }
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule, { passive: true });
  window.addEventListener('load', schedule, { once: true });
  paint();
  if (!('IntersectionObserver' in window) || reduced.matches) return;
  const animations = new Set();
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      observer.unobserve(entry.target);
      if (reduced.matches || typeof entry.target.animate !== 'function') continue;
      const animation = entry.target.animate([
        { opacity: 0.15, transform: 'translateY(18px)' },
        { opacity: 1, transform: 'translateY(0)' }
      ], { duration: 520, easing: 'cubic-bezier(.2,.7,.3,1)' });
      animations.add(animation);
      animation.finished.then(() => animations.delete(animation)).catch(() => animations.delete(animation));
    }
  }, { threshold: 0.08 });
  document.querySelectorAll('.tile,.panel,.feature,.info-card,.school-section,.resource-card,.pl-card,.visitor-box').forEach(el => {
    if (!el.parentElement.closest('.info-card,.school-section,.panel')) observer.observe(el);
  });
  reduced.addEventListener('change', () => {
    if (!reduced.matches) return;
    observer.disconnect();
    animations.forEach(animation => animation.cancel());
    animations.clear();
  });
})();
