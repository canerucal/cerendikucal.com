(() => {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (!('IntersectionObserver' in window)) return;
  const targets = document.querySelectorAll('.section-heading, .about-heading, .about-copy, .reviews-heading, .contact-copy, .faq-heading, .treatment-card, .review-card, .cinematic-scene');
  let observer;
  function configure() {
    observer?.disconnect();
    targets.forEach(el => el.classList.remove('motion-pending'));
    if (reduced.matches) return;
    observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.remove('motion-pending');
        observer.unobserve(entry.target);
      }
    }, { threshold: 0.06, rootMargin: '0px 0px -24px 0px' });
    targets.forEach(el => {
      el.classList.add('motion-reveal');
      // Never hide already visible content, including direct anchor navigation.
      if (el.getBoundingClientRect().top >= window.innerHeight) {
        el.classList.add('motion-pending');
        observer.observe(el);
      }
    });
  }
  configure();
  reduced.addEventListener('change', configure);
  // Keyboard and in-page navigation must not wait for a decorative reveal.
  document.addEventListener('focusin', event => {
    event.target.closest('.motion-pending')?.classList.remove('motion-pending');
  });
  window.addEventListener('hashchange', () => {
    const id = decodeURIComponent(window.location.hash.slice(1));
    const section = document.getElementById(id);
    section?.classList.remove('motion-pending');
    section?.querySelectorAll('.motion-pending').forEach(el => el.classList.remove('motion-pending'));
  });
})();
