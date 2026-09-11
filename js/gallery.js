(() => {
  const track = document.querySelector('.gallery-grid');
  if (!track) return;
  const slides = [...track.children];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  slides.forEach(slide => {
    const img = slide.querySelector('img');
    slide.style.setProperty('--photo', 'url("' + img.src + '")');
    slide.style.setProperty('--ratio', Number(img.getAttribute('width')) / Number(img.getAttribute('height')));
  });
  let active = 0;
  let frame;
  function update() {
    const center = track.getBoundingClientRect().left + track.clientWidth / 2;
    let nearest = Infinity;
    slides.forEach((slide, index) => {
      const rect = slide.getBoundingClientRect();
      const distance = Math.abs(rect.left + rect.width / 2 - center);
      if (distance < nearest) { nearest = distance; active = index; }
    });
    slides.forEach((slide, index) => slide.classList.toggle('is-active', index === active));
    frame = null;
  }
  function go(index) {
    const target = slides[Math.max(0, Math.min(slides.length - 1, index))];
    const rect = target.getBoundingClientRect();
    track.scrollBy({ left: rect.left + rect.width / 2 - track.getBoundingClientRect().left - track.clientWidth / 2, behavior: reduced.matches ? 'instant' : 'smooth' });
  }
  track.addEventListener('keydown', event => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    go(event.key === 'Home' ? 0 : event.key === 'End' ? slides.length - 1 : active + (event.key === 'ArrowRight' ? 1 : -1));
  });
  track.addEventListener('scroll', () => { if (!frame) frame = requestAnimationFrame(update); }, { passive: true });
  new ResizeObserver(update).observe(track);
  let drag;
  let settle;
  track.addEventListener('pointerdown', event => {
    if (event.pointerType !== 'mouse' || event.button !== 0) return;
    event.preventDefault();
    clearTimeout(settle);
    drag = { x: event.clientX, scroll: track.scrollLeft, id: event.pointerId, active };
    track.setPointerCapture(event.pointerId);
    track.classList.add('is-dragging');

  });
  track.addEventListener('pointermove', event => {
    if (!drag) return;
    track.scrollLeft = drag.scroll - (event.clientX - drag.x);
  });
  function endDrag() {
    if (!drag) return;
    const id = drag.id;
    const distance = track.scrollLeft - drag.scroll;
    const target = Math.abs(distance) > 45 ? drag.active + Math.sign(distance) : drag.active;
    drag = null;
    if (track.hasPointerCapture(id)) track.releasePointerCapture(id);
    go(target);
    settle = setTimeout(() => { track.classList.remove('is-dragging'); update(); }, reduced.matches ? 0 : 550);
  }
  track.addEventListener('pointerup', endDrag);
  track.addEventListener('pointercancel', endDrag);
  track.addEventListener('lostpointercapture', endDrag);
  track.addEventListener('dragstart', event => event.preventDefault());
  update();
})();
