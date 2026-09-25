import { projects } from './projects.js';

// The existing GSAP ticker is our only animation clock. Never intercept wheel
// or touch events; this component only observes the normal document scroll.
export function ProjectGallery(gallery) {
  if (!gallery) return;
  const g = window.gsap, ST = window.ScrollTrigger;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const events = new AbortController();
  const on = (el, name, fn, options = {}) => el.addEventListener(name, fn, { ...options, signal: events.signal });
  const esc = text => String(text).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const original = [...gallery.querySelectorAll('.project-card')];
  const selected = original.map(el => projects.find(p => p.id === el.querySelector('[data-project]').dataset.project)).filter(Boolean);
  const stage = gallery.querySelector('.project-gallery-stage');
  // Keep the seven existing hero-entry targets/timing without editing hero.js.
  const compatibility = original[0].cloneNode(true);
  compatibility.removeAttribute('id'); stage.prepend(compatibility);
  stage.classList.add('world-compat');
  stage.hidden = true; stage.inert = true; stage.setAttribute('aria-hidden', 'true');
  stage.querySelectorAll('[id]').forEach(el => el.removeAttribute('id'));
  const ui = document.createElement('div');
  ui.className = 'world-ui';
  ui.innerHTML = `<div class="world-hud" aria-hidden="true"><span>SELECTED WORK <i></i> <b class="world-current">01</b> / 06</span><span class="world-zone">Waterfall</span></div>
    <div class="world-items" role="list" aria-label="Project journey">
      ${selected.map((p, i) => `<article class="world-item" id="build-${p.id}" role="listitem">
        <a href="#project=${p.id}" data-project="${p.id}" data-cursor="VIEW" aria-label="View ${esc(p.title)} project" aria-describedby="world-description-${p.id}">
          <img src="${p.image}" alt="" width="1672" height="941" decoding="async">
          <span class="world-caption"><small>${String(i + 1).padStart(2, '0')} / ${esc(p.category)}</small><strong>${esc(p.title)}</strong><span id="world-description-${p.id}">${esc(p.line)}</span><em>View project ↗</em></span>
        </a></article>`).join('')}
    </div>
    <nav class="world-waypoints" aria-label="Project waypoints">${selected.map((p,i) => `<button type="button" aria-label="Focus ${esc(p.title)}" data-waypoint="${i}">${String(i+1).padStart(2,'0')}</button>`).join('')}</nav>
    <a class="world-skip" href="#archive">To archive ↓</a>
    <div class="world-progress" aria-hidden="true"><i></i></div>`;
  gallery.append(ui);
  const cards = [...ui.querySelectorAll('.world-item')];
  const buttons = [...ui.querySelectorAll('[data-waypoint]')];
  const root = document.querySelector('.ink-environment');
  const state = { progress: 0 };
  const focusTimes = [.1, .26, .42, .58, .74, .9];
  const zones = ['Waterfall', 'Red branches', 'Pagoda', 'River valley', 'Mountain mist', 'Foreground garden'];
  let world, timeline, near = false, ticking = false, disposed = false;
  let current = 0, last = 0, velocity = 0, previousScroll = scrollY, active = -1, loading;
  const clamp = (n, lo = 0, hi = 1) => Math.max(lo, Math.min(hi, n));
  function focusProject(index) {
    if (!timeline || gallery.dataset.world !== 'ready') return;
    const trigger = timeline.scrollTrigger;
    window.scrollTo({ top: trigger.start + (trigger.end - trigger.start) * focusTimes[index], behavior: 'smooth' });
  }
  buttons.forEach((button, i) => on(button, 'click', () => focusProject(i)));
  cards.forEach((card, i) => on(card.querySelector('a'), 'focus', () => {
    if (Math.abs(current - focusTimes[i]) > .055) focusProject(i);
  }));
  function hideWorld() {
    if (world) world.canvas.style.opacity = '0';
    ui.style.setProperty('--world-visibility', '0');
    delete root.dataset.projectWorldActive;
    if (gallery.dataset.world === 'ready') ui.inert = true;
  }
  function frame(time) {
    if (!world || document.hidden || !near || reduced.matches) return;
    const interval = innerWidth < 700 ? 1 / 30 : 1 / 45;
    if (time - last < interval) return;
    const dt = Math.min(.06, Math.max(.001, time - last || interval)); last = time;
    const rect = gallery.getBoundingClientRect();
    const visibility = clamp((innerHeight - rect.top) / (innerHeight * .75)) * clamp(rect.bottom / (innerHeight * .8));
    if (visibility <= 0) { hideWorld(); return; }
    ui.inert = false;
    const speed = Math.min(1, Math.abs(scrollY - previousScroll) / Math.max(1, dt * 2600));
    previousScroll = scrollY;
    velocity += (speed - velocity) * (1 - Math.exp(-dt / .3));
    current += (state.progress - current) * (1 - Math.exp(-dt / (.10 + velocity * .12)));
    const items = world.render(time, current, velocity, dt);
    const clip = `inset(${Math.max(0, rect.top)}px 0 ${Math.max(0, innerHeight - rect.bottom)}px 0)`;
    world.canvas.style.opacity = visibility.toFixed(3); world.canvas.style.clipPath = clip;
    ui.style.clipPath = clip; ui.style.setProperty('--world-visibility', visibility.toFixed(3));
    if (visibility > .995) root.dataset.projectWorldActive = 'true';
    else delete root.dataset.projectWorldActive;
    let nearest = 0;
    focusTimes.forEach((at, i) => { if (Math.abs(at - current) < Math.abs(focusTimes[nearest] - current)) nearest = i; });
    if (active !== nearest) {
      active = nearest;
      ui.querySelector('.world-current').textContent = String(active + 1).padStart(2, '0');
      ui.querySelector('.world-zone').textContent = zones[active];
      buttons.forEach((button, i) => button.setAttribute('aria-current', String(i === active)));
      gallery.dataset.activeProject = selected[active].id;
    }
    items.forEach((item, i) => {
      cards[i].style.transform = `translate3d(${(item.x - item.width / 2).toFixed(2)}px,${(item.y - item.width * 941 / 1672 / 2).toFixed(2)}px,0) scale(${(item.width / 360).toFixed(4)})`;
      cards[i].style.opacity = item.opacity.toFixed(3);
      cards[i].querySelector('.world-caption').style.opacity = (.10 + .90 * item.focus).toFixed(3);
      cards[i].style.zIndex = i === active ? '3' : '1';
      cards[i].style.pointerEvents = item.opacity > .18 ? 'auto' : 'none';
      cards[i].dataset.phase = item.state;
    });
    ui.querySelector('.world-progress i').style.transform = `scaleX(${current})`;
    gallery.dataset.cameraProgress = current.toFixed(4);
    gallery.dataset.cameraPosition = world.camera.position.toArray().map(n => n.toFixed(3)).join(',');
  }
  function sync() {
    const run = world && near && !document.hidden && !reduced.matches;
    if (run && !ticking) { last = 0; previousScroll = scrollY; g.ticker.add(frame); ticking = true; }
    if (!run && ticking) { g.ticker.remove(frame); ticking = false; }
    if (!run) hideWorld();
  }
  function fallback() {
    if (ticking) g?.ticker.remove(frame);
    ticking = false; timeline?.kill(); timeline = null; world?.dispose(); world = null;
    delete root.dataset.projectWorldActive;
    gallery.dataset.world = 'fallback'; ui.inert = false; ui.removeAttribute('style');
    cards.forEach(card => { card.removeAttribute('style'); card.querySelector('.world-caption').removeAttribute('style'); }); ST?.refresh();
  }
  async function start() {
    if (disposed || world || loading) return;
    if (reduced.matches || !g || !ST) { fallback(); return; }
    gallery.dataset.world = 'loading'; loading = true;
    try {
      const { createProjectWorld } = await import('./project-world.js');
      const result = await createProjectWorld(selected, root);
      if (disposed || reduced.matches) { result.dispose(); return; }
      world = result; on(world.canvas, 'webglcontextlost', fallback);
      gallery.dataset.world = 'ready'; ui.inert = true;
      state.progress = 0;
      timeline = g.timeline({ scrollTrigger: {
        id: 'project-world', trigger: gallery, start: 'top top', end: 'bottom bottom', scrub: 1, invalidateOnRefresh: true,
      } }).to(state, { progress: 1, duration: 1, ease: 'none' });
      ST.refresh();
      const trigger = timeline.scrollTrigger;
      current = clamp((scrollY - trigger.start) / Math.max(1, trigger.end - trigger.start)); state.progress = current; sync();
    } catch (error) { gallery.dataset.worldError = error.message; fallback(); }
    finally { loading = false; }
  }
  const observer = new IntersectionObserver(entries => { near = entries[0].isIntersecting; sync(); }, { rootMargin: '100% 0px' });
  observer.observe(gallery);
  on(window, 'resize', () => { world?.resize(); ST?.refresh(); }, { passive: true });
  on(document, 'visibilitychange', sync);
  on(reduced, 'change', () => { if (reduced.matches) fallback(); else start(); });
  on(window, 'pagehide', () => {
    disposed = true; events.abort(); observer.disconnect(); timeline?.kill();
    if (ticking) g?.ticker.remove(frame);
    world?.dispose(); delete root.dataset.projectWorldActive;
  }, { once: true });
  start();
}
