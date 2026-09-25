const g = window.gsap;
export const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
export const fine = matchMedia("(pointer:fine)").matches;
const listeners = new AbortController();
const cleanup = [];
export function listen(target, event, callback, options = {}) {
  target.addEventListener(event, callback, {
    ...options,
    signal: listeners.signal,
  });
}
export function AnimatedText(element, options = {}) {
  if (!g || reduced) return;
  g.from(element, {
    y: 45,
    opacity: 0,
    duration: 0.9,
    ease: "power3.out",
    ...options,
  });
}
export function MaskReveal(element, options = {}) {
  if (!g || reduced) return;
  g.fromTo(
    element,
    { clipPath: "inset(16% 12% 16% 12%)" },
    { clipPath: "inset(0% 0% 0% 0%)", ease: "none", ...options },
  );
}
export function MagneticLink(element) {
  if (!g || reduced || !fine) return;
  listen(element, "pointermove", (e) => {
    const r = element.getBoundingClientRect();
    g.to(element, {
      x: (e.clientX - r.left - r.width / 2) * 0.1,
      y: (e.clientY - r.top - r.height / 2) * 0.2,
      duration: 0.6,
      ease: "power3.out",
    });
  });
  listen(element, "pointerleave", () =>
    g.to(element, { x: 0, y: 0, duration: 0.8, ease: "elastic.out(1,.5)" }),
  );
}
export function SmoothImage(element) {
  if (!g || reduced || !fine) return;
  listen(element, "pointermove", (e) => {
    const r = element.getBoundingClientRect();
    g.to(element.querySelector("img"), {
      x: (e.clientX - r.left - r.width / 2) * 0.025,
      y: (e.clientY - r.top - r.height / 2) * 0.025,
      rotationY: (e.clientX - r.left - r.width / 2) / 150,
      duration: 0.8,
      ease: "power3.out",
    });
  });
  listen(element, "pointerleave", () =>
    g.to(element.querySelector("img"), {
      x: 0,
      y: 0,
      rotationY: 0,
      duration: 1,
    }),
  );
}
export function ProjectGallery(gallery) {
  if (!gallery) return;
  const cards = [...gallery.querySelectorAll(".project-card")];
  const current = gallery.querySelector("#gallery-current");
  const stage = gallery.querySelector(".project-gallery-stage");
  let position = 0;
  let target = 0;
  let pointerX = 0;
  let pointerY = 0;
  const clamp = (value) => Math.max(0, Math.min(cards.length - 1, value));
  const paint = (value, immediate = false) => {
    position = value;
    const active = Math.round(value);
    if (current) current.textContent = String(active + 1).padStart(2, "0");
    cards.forEach((card, index) => {
      const offset = index - value;
      const distance = Math.abs(offset);
      const side = offset < 0 ? -1 : 1;
      const x = offset * 55;
      const z = distance < 1.5 ? -distance * 260 : -520;
      const rotation = side * -22 * Math.min(distance, 1);
      const scale = distance < 1 ? 1 - distance * 0.16 : Math.max(0.56, 0.84 - (distance - 1) * 0.12);
      const opacity = distance < 1.8 ? 1 - Math.max(0, distance - 1) * 0.42 : 0;
      const values = {
        x: `${x}vw`,
        z,
        rotationY: rotation,
        scale,
        opacity,
        filter: distance < 0.6 ? "brightness(1) saturate(1)" : "brightness(.68) saturate(.7)",
      };
      card.classList.toggle("is-active", index === active);
      if (g) g.to(card, { ...values, duration: immediate ? 0 : 0.5, ease: "power3.inOut", overwrite: true });
      else Object.assign(card.style, { transform: `translate3d(calc(-50% + ${x}vw), -50%, ${z}px) rotateY(${rotation}deg) scale(${scale})`, opacity });
    });
  };
  const setTarget = (value) => {
    target = clamp(value);
    paint(target);
  };
  paint(0, true);
  cards.forEach((card, index) => {
    listen(card, "focusin", () => setTarget(index));
    listen(card, "click", (event) => {
      if (!card.classList.contains("is-active")) {
        event.preventDefault();
        event.stopPropagation();
        setTarget(index);
      }
    });
  });
  if (g && window.ScrollTrigger && !reduced) {
    ScrollTrigger.create({
      trigger: gallery,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => setTarget(self.progress * (cards.length - 1)),
    });
  }
  let dragging = false;
  let dragStart = 0;
  listen(stage, "pointerdown", (event) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    dragging = true;
    dragStart = event.clientX;
    stage.setPointerCapture?.(event.pointerId);
  });
  listen(stage, "pointermove", (event) => {
    if (dragging) setTarget(target - (event.clientX - dragStart) / innerWidth * 1.4);
    dragStart = event.clientX;
    pointerX = (event.clientX / innerWidth - 0.5) * 2;
    pointerY = (event.clientY / innerHeight - 0.5) * 2;
    stage.style.setProperty("--gallery-camera-x", `${pointerX * -1.2}deg`);
    stage.style.setProperty("--gallery-camera-y", `${pointerY * 0.5}deg`);
  });
  listen(stage, "pointerup", () => { dragging = false; });
  listen(stage, "pointercancel", () => { dragging = false; });
}
export function ProjectShowcase(element, index, mobile) {
  if (!g || !window.ScrollTrigger || reduced) return;
  const visual = element.querySelector(".project-visual");
  const title = element.querySelector(".project-title");
  const trigger = {
    trigger: element,
    start: "top 85%",
    end: "bottom 20%",
    scrub: 1,
  };
  const strength = mobile ? 0.35 : 1;
  const patterns = [
    () =>
      g.fromTo(
        visual,
        { scale: 0.78 },
        { scale: 1, ease: "none", scrollTrigger: trigger },
      ),
    () =>
      g.fromTo(
        visual,
        { xPercent: -8 * strength },
        { xPercent: 4 * strength, ease: "none", scrollTrigger: trigger },
      ),
    () =>
      g.fromTo(
        visual,
        { y: 85 * strength, rotation: 3 * strength },
        {
          y: -45 * strength,
          rotation: -1 * strength,
          ease: "none",
          scrollTrigger: trigger,
        },
      ),
    () => MaskReveal(visual, { scrollTrigger: trigger }),
    () =>
      g.fromTo(
        visual,
        { rotationY: 10 * strength, scale: 0.9 },
        {
          rotationY: -3 * strength,
          scale: 1,
          ease: "none",
          scrollTrigger: trigger,
        },
      ),
    () =>
      g.fromTo(
        visual,
        { rotation: -4 * strength, y: 65 * strength },
        {
          rotation: 2 * strength,
          y: -30 * strength,
          ease: "none",
          scrollTrigger: trigger,
        },
      ),
    () =>
      g.fromTo(
        visual,
        { clipPath: "inset(0 18% 0 18%)" },
        { clipPath: "inset(0 0% 0 0%)", ease: "none", scrollTrigger: trigger },
      ),
    () =>
      g.fromTo(
        visual,
        { scale: 0.86, rotationX: 8 * strength },
        { scale: 1, rotationX: 0, ease: "none", scrollTrigger: trigger },
      ),
  ];
  patterns[index % patterns.length]();
  g.fromTo(
    title,
    { x: -25 * strength },
    { x: 30 * strength, ease: "none", scrollTrigger: trigger },
  );
  AnimatedText(element.querySelector(".project-meta"), {
    scrollTrigger: { trigger: visual, start: "top 60%" },
  });
}
export function SectionTransition(element) {
  if (!g || !window.ScrollTrigger || reduced) return;
  element
    .querySelectorAll("[data-reveal]")
    .forEach((el) =>
      AnimatedText(el, { scrollTrigger: { trigger: el, start: "top 88%" } }),
    );
}
export function CustomCursor() {
  if (!g || reduced || !fine) return () => {};
  const dot = document.querySelector(".cursor"),
    ring = document.querySelector(".cursor-ring");
  document.body.classList.add("cursor-enabled");
  let x = -100,
    y = -100,
    rx = -100,
    ry = -100;
  listen(document, "pointermove", (e) => {
    x = e.clientX;
    y = e.clientY;
  });
  listen(document, "pointerover", (e) => {
    const link = e.target.closest("a,button");
    dot.classList.toggle("view", !!link);
    dot.querySelector("span").textContent =
      link?.dataset.cursor || (link?.matches("[data-project]") ? "VIEW" : "↗");
  });
  const tick = () => {
    rx += (x - rx) * 0.12;
    ry += (y - ry) * 0.12;
    g.set(dot, { x, y, xPercent: -50, yPercent: -50 });
    g.set(ring, { x: rx, y: ry, xPercent: -50, yPercent: -50 });
  };
  g.ticker.add(tick);
  cleanup.push(() => g.ticker.remove(tick));
}
export function PageTransition() {
  const layer = document.querySelector(".page-transition"),
    panels = layer.querySelectorAll(":scope > i"),
    image = layer.querySelector(".transition-image");
  let busy = false;
  return async function transition(change, source = null, reverse = false) {
    if (busy) return;
    busy = true;
    if (!g || reduced) {
      change();
      busy = false;
      return;
    }
    layer.style.visibility = "visible";
    layer.showPopover?.();
    try {
      if (source && !reverse) {
        const rect = source.getBoundingClientRect();
        image.replaceChildren(source.querySelector("img").cloneNode());
        g.set(image, {
          left: rect.left,
          top: rect.top,
          width: rect.width,
          height: rect.height,
          opacity: 1,
        });
        await g.to(image, {
          left: 0,
          top: 0,
          width: innerWidth,
          height: innerHeight,
          duration: 0.55,
          ease: "power3.inOut",
        });
      }
      await g.to(panels, {
        scaleY: 1,
        duration: 0.4,
        stagger: 0.055,
        ease: "power3.inOut",
        transformOrigin: reverse ? "top" : "bottom",
      });
      change();
      if (layer.hidePopover) {
        layer.hidePopover();
        layer.showPopover();
      }
      image.replaceChildren();
      g.set(image, { opacity: 0 });
      await g.to(panels, {
        scaleY: 0,
        duration: 0.5,
        stagger: 0.055,
        ease: "power3.inOut",
        transformOrigin: reverse ? "bottom" : "top",
      });
    } finally {
      layer.hidePopover?.();
      layer.style.visibility = "hidden";
      busy = false;
    }
  };
}
export function disposeMotion() {
  listeners.abort();
  cleanup.forEach((fn) => fn());
}
