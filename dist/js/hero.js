import { listen } from "./motion.js";

// Fit the visible glyphs, not just their line boxes. This keeps the actual ink
// centered at every aspect ratio while giving KAIF the dominant second line.
const fitStage = document.querySelector(".hero-stage");
const fitComposition = document.querySelector(".hero-composition");
const measure = document.createElement("canvas").getContext("2d");
let fitFrame;
function fitHeroName() {
  const width = fitStage.clientWidth;
  measure.font = `100px ${getComputedStyle(document.querySelector(".hero-name")).fontFamily}`;
  const metrics = [measure.measureText("MOHAMED"), measure.measureText("KAIF")];
  const sizes = [(width * .94) / ((metrics[0].width - 6 * 3.5) / 100),
    (width * .96) / ((metrics[1].width - 3 * 4.5) / 100)];
  const ink = metrics.map((m, i) => (m.actualBoundingBoxAscent + m.actualBoundingBoxDescent) * sizes[i] / 100);
  const targetHeight = Math.max(150, Math.min(fitStage.clientHeight * .75, fitStage.clientHeight - (width < 601 ? 280 : 220)));
  const gap = Math.max(6, fitStage.clientHeight * .009);
  const stretch = Math.min(4, (targetHeight - gap) / (ink[0] + ink[1]));
  const inkTop = metrics.map((m, i) => {
    const line = i === 0 ? .8 : .78;
    const ascent = m.fontBoundingBoxAscent ?? 90;
    const descent = m.fontBoundingBoxDescent ?? 22;
    return ((line * 100 - ascent - descent) / 2 + ascent - m.actualBoundingBoxAscent) * sizes[i] / 100 * stretch;
  });
  fitComposition.style.setProperty("--first-font", `${sizes[0]}px`);
  fitComposition.style.setProperty("--last-font", `${sizes[1]}px`);
  // Correct side bearings and trailing tracking so visible ink, not merely
  // the advance width, is horizontally symmetrical around the zoom axis.
  metrics.forEach((m, i) => {
    const tracking = i === 0 ? -3.5 : -4.5;
    const offset = -(m.actualBoundingBoxRight - m.actualBoundingBoxLeft - m.width - tracking) * sizes[i] / 200;
    fitComposition.style.setProperty(i === 0 ? "--first-ink-offset" : "--last-ink-offset", `${offset}px`);
  });
  fitComposition.style.setProperty("--word-stretch", stretch);
  fitComposition.style.setProperty("--first-top", `${-inkTop[0]}px`);
  fitComposition.style.setProperty("--last-top", `${ink[0] * stretch + gap - inkTop[1]}px`);
  fitComposition.style.setProperty("--name-height", `${(ink[0] + ink[1]) * stretch + gap}px`);
}
const fitObserver = new ResizeObserver(() => {
  cancelAnimationFrame(fitFrame);
  fitFrame = requestAnimationFrame(fitHeroName);
});
fitObserver.observe(fitStage);
document.fonts.ready.then(fitHeroName);
fitHeroName();
listen(window, "pagehide", () => {
  fitObserver.disconnect();
  cancelAnimationFrame(fitFrame);
}, { once: true });

export function HeroSequence(mobile) {
  const g = window.gsap;
  const stage = document.querySelector(".hero-stage");
  const timeline = g.timeline({
    defaults: { ease: "none" },
    scrollTrigger: {
      id: "hero-sequence",
      trigger: ".hero",
      start: "top top",
      end: () => `+=${Math.round(innerHeight * (mobile ? 1.6 : 2.1))}`,
      pin: stage,
      scrub: .8,
      anticipatePin: 1,
      invalidateOnRefresh: true,
    },
  });
  // A single center-anchored scale. No x/y tween, perspective, portrait, or
  // cloned project media. The final fade only begins once the letters overscan.
  timeline
    .fromTo(".hero-composition", { scale: 1, opacity: 1 },
      { scale: mobile ? 4.8 : 5.5, duration: 7, ease: "power1.in" }, 0)
    .to(".hero-composition", { opacity: 0, duration: 1.25, ease: "power1.inOut" }, 5.6)
    .to(".hero-meta", { opacity: 0, duration: 1.2 }, .15);

  // Keep the existing Selected Work entrance exactly timed. It belongs to the
  // established handoff; its component, layout and animations are untouched.
  timeline
    .fromTo(".selected-work .work-heading",
      { y: 70, opacity: 0 },
      { y: 0, opacity: 1, duration: 1.2, ease: "power2.out" }, 4.55)
    .fromTo(".selected-work .project-gallery-stage",
      { y: 150, scale: mobile ? .92 : .78, opacity: .12 },
      { y: 0, scale: 1, opacity: 1, duration: 2.2, ease: "power2.out" }, 4.25)
    .fromTo(".selected-work .gallery-floor",
      { opacity: 0, scale: .72, yPercent: 18 },
      { opacity: mobile ? .3 : .5, scale: 1, yPercent: 0, duration: 2.1, ease: "power2.out" }, 4.45)
    .fromTo(".selected-work .project-showcase",
      { z: -900, scale: .62, opacity: 0 },
      { z: 0, scale: 1, opacity: 1, duration: 2, stagger: .08, ease: "power3.out" }, 4.52);
  return timeline;
}

// Retain the public hook used by the bootstrap; type deliberately has no
// pointer parallax so the zoom axis cannot drift away from the viewport center.
export function HeroPointer() {}
