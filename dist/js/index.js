import { projects } from "./projects.js";
import { ProjectArchive } from "./archive.js";
import { HeroSequence, HeroPointer } from "./hero.js";
import { ProjectGallery } from "./selected-work.js";
import {
  reduced,
  listen,
  MagneticLink,
  SectionTransition,
  CustomCursor,
  PageTransition,
  disposeMotion,
} from "./motion.js";
import { initStack } from "./stack.js";
import { initAchievements } from "./achievements.js";

const g = window.gsap,
  ST = window.ScrollTrigger;
if (g && ST) g.registerPlugin(ST);
const ordered = [
  "poneglyph",
  "sheproof",
  "chrissoft",
  "codegarden",
  "crisismind",
  "nexus",
  "authforge",
  "travelpass",
].map((id) => projects.find((p) => p.id === id));
const showcaseProjects = [
  projects.find((p) => p.id === "poneglyph"),
  projects.find((p) => p.id === "sheproof"),
  projects.find((p) => p.id === "chrissoft"),
  projects.find((p) => p.id === "nexus"),
  projects.find((p) => p.id === "authforge"),
  projects.find((p) => p.id === "codegarden"),
].filter(Boolean);
const features = {
  poneglyph: [
    "Image and audio analysis",
    "Modality-specific detection",
    "Authenticity probabilities",
    "Confidence reporting",
  ],
  sheproof: [
    "Evidence registration",
    "Hash-based verification",
    "Tamper detection",
    "Private files kept off-chain",
  ],
  chrissoft: [
    "Billing and inventory",
    "Natural-language business queries",
    "Forecasting and anomaly-analysis direction",
    "Owner-controlled decisions",
  ],
  codegarden: [
    "Built-in Java editor",
    "Live JShell execution",
    "Automatic solution checking",
    "Coins, plant growth and saved progress",
  ],
  crisismind: [
    "Structured signal processing",
    "Anomaly explanations",
    "Risk insights",
    "Human analyst review",
  ],
  nexus: [
    "Sensor data fusion",
    "Risk detection",
    "Joint response planning",
    "Dashboard and escalation",
  ],
  authforge: [
    "Natural-language requests",
    "Structured outputs",
    "Governance constraints",
    "Review before execution",
  ],
  travelpass: [
    "Reusable credential concept",
    "Explicit consent",
    "Selective identity disclosure",
    "Credential revocation design",
  ],
};
const container = document.querySelector("#project-showcases");
const escape = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (char) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        char
      ],
  );
const linkFor = (p) => "#project=" + p.id;
container.innerHTML = `<div class="project-gallery" aria-label="Selected work projects">
<div class="project-gallery-stage">
<div class="gallery-floor" aria-hidden="true"></div>
${showcaseProjects
  .map(
    (
      p,
      i,
    ) => `<article class="project-showcase project-card" id="build-${p.id}" data-gallery-index="${i}">
  <a class="project-visual" href="${linkFor(p)}" data-project="${p.id}" data-cursor="VIEW" aria-label="View ${escape(p.title)}"><img src="${p.image}" alt="${escape(p.title)} logo" loading="lazy" width="160" height="90"><span class="project-panel-info"><small>${String(i + 1).padStart(2, "0")} / 06</small><strong>${escape(p.title)}</strong><em>${escape(p.category)}</em></span></a>
</article>`,
  )
  .join("")}
<div class="gallery-status" aria-live="polite"><span class="gallery-status-label">SELECTED WORK</span><strong><span id="gallery-current">01</span> / 06</strong></div>
</div>
</div>`;
document.querySelector(".archive-items").innerHTML = ordered
  .map(
    (p, i) =>
      `<div class="archive-item" style="--slot:${i}" data-archive-project="${p.id}"><i class="archive-trail" aria-hidden="true"></i><a href="${linkFor(p)}" data-project="${p.id}" data-cursor="VIEW" aria-label="View ${escape(p.title)}"><img src="${p.image}" alt="" loading="lazy" width="160" height="90"><span>${escape(p.title)}</span></a></div>`,
  )
  .join("");
document.querySelector(".archive-caption").textContent =
  `${String(ordered.length).padStart(2, "0")} selected builds`;

let lenis = null;
if (!reduced && window.Lenis && g) {
  lenis = new window.Lenis({ duration: 1.1, smoothWheel: true, anchors: true });
  if (ST) lenis.on("scroll", ST.update);
}
const tick = (time) => {
  if (!document.hidden) lenis?.raf(time * 1000);
};
g?.ticker.add(tick);
CustomCursor();
document.querySelectorAll(".magnetic").forEach(MagneticLink);
ProjectGallery(document.querySelector(".project-gallery"));
initStack(document.querySelector(".stack"));
initAchievements(document.querySelector(".achievements"));

const navigation = document.querySelector(".navigation");
listen(
  window,
  "scroll",
  () => navigation.classList.toggle("condensed", scrollY > 70),
  { passive: true },
);
const menu = document.querySelector("#mobile-menu"),
  toggle = document.querySelector(".menu-toggle");
function closeMenu() {
  menu.close();
  toggle.setAttribute("aria-expanded", "false");
  lenis?.start();
  toggle.focus();
}
listen(toggle, "click", () => {
  menu.showModal();
  toggle.setAttribute("aria-expanded", "true");
  lenis?.stop();
  if (g && !reduced)
    g.fromTo(
      menu.querySelectorAll("nav a"),
      { y: 70, opacity: 0 },
      { y: 0, opacity: 1, stagger: 0.09, duration: 0.7, ease: "power3.out" },
    );
});
listen(menu.querySelector(".menu-close"), "click", closeMenu);
listen(menu, "cancel", () => {
  toggle.setAttribute("aria-expanded", "false");
  lenis?.start();
});
menu
  .querySelectorAll("nav a")
  .forEach((a) => listen(a, "click", () => closeMenu()));

let motionContext = null;
if (g && ST && !reduced) {
  const mm = g.matchMedia();
  mm.add(
    { desktop: "(min-width: 901px)", mobile: "(max-width: 900px)" },
    (context) => {
      const mobile = context.conditions.mobile;
      motionContext = g.context(() => {
        HeroSequence(mobile);
        ProjectArchive(document.querySelector(".project-archive"), mobile);
        document.querySelectorAll("main>section").forEach(SectionTransition);
        g.fromTo(
          ".about-picture",
          { clipPath: "polygon(15% 28%,85% 20%,85% 75%,15% 82%)", y: 70 },
          {
            clipPath: "polygon(0 8%,100% 0,100% 92%,0 100%)",
            y: 0,
            ease: "none",
            scrollTrigger: {
              trigger: ".about",
              start: "top 80%",
              end: "center 55%",
              scrub: 1,
            },
          },
        );
        g.fromTo(
          ".about-backdrop",
          { xPercent: -15 },
          {
            xPercent: 10,
            ease: "none",
            scrollTrigger: {
              trigger: ".about",
              start: "top bottom",
              end: "bottom top",
              scrub: 1,
            },
          },
        );
        // Achievements legacy loop removed for Hall of Honors
        g.fromTo(
          ".contact-light",
          { opacity: 0 },
          {
            opacity: 1,
            ease: "none",
            scrollTrigger: {
              trigger: ".contact",
              start: "top bottom",
              end: "center center",
              scrub: 1,
            },
          },
        );
        g.fromTo(
          ".contact-backdrop",
          { yPercent: 30 },
          {
            yPercent: 0,
            ease: "none",
            scrollTrigger: {
              trigger: ".contact",
              start: "top bottom",
              end: "bottom bottom",
              scrub: 1,
            },
          },
        );
        if (!mobile)
          ST.create({
            onUpdate: (self) => {
              const active = [
                ...document.querySelectorAll(".project-title"),
              ].filter((el) => {
                const r = el.getBoundingClientRect();
                return r.bottom > 0 && r.top < innerHeight;
              });
              if (active.length)
                g.to(active, {
                  skewY: g.utils.clamp(-2, 2, self.getVelocity() / 1600),
                  duration: 0.25,
                  overwrite: true,
                  onComplete: () =>
                    g.to(active, { skewY: 0, duration: 0.5, overwrite: true }),
                });
            },
          });
      });
      return () => motionContext?.revert();
    },
  );
}
HeroPointer();

const dialog = document.querySelector(".case-study"),
  content = document.querySelector(".case-content");
const transition = PageTransition();
let activeId = null,
  returnFocus = null,
  returnHash = "#work";
function renderCase(p) {
  const index = ordered.indexOf(p),
    next = ordered[(index + 1) % ordered.length];
  const flow = p.process.split(" → ");
  content.innerHTML = `<article>
<header class="case-hero"><span class="eyebrow">Project / ${String(index + 1).padStart(2, "0")}</span><h2 id="case-title">${escape(p.title)}</h2><p>${escape(p.line)}</p>
<dl class="case-meta"><div><dt>FOCUS</dt><dd>${escape(p.role)}</dd></div><div><dt>YEAR</dt><dd>${p.year}</dd></div><div><dt>STACK</dt><dd>${escape(p.tags.join(" / "))}</dd></div></dl></header>
<img class="case-logo" src="${p.image}" alt="${escape(p.title)} identity">
<img class="case-image" src="${p.preview}" alt="${escape(p.title)} interface concept with illustrative sample data">
<div class="case-body">
<section class="case-block"><h3>Problem</h3><p>${escape(p.problem)}</p></section>
<section class="case-block"><h3>Solution</h3><p>${escape(p.idea)}</p></section>
<section class="case-block"><h3>How it works</h3><div class="case-flow">${flow.map((step) => "<span>" + escape(step) + "</span>").join("")}</div></section>
<section class="case-block"><h3>Technical approach</h3><ul>${p.architecture.map((x) => "<li>" + escape(x) + "</li>").join("")}</ul></section>
<section class="case-block"><h3>Tech stack</h3><p>${escape(p.tags.join(" / "))}</p></section>
<section class="case-block"><h3>Key features</h3><ul>${features[p.id].map((x) => "<li>" + escape(x) + "</li>").join("")}</ul></section>
<section class="case-block"><h3>Engineering challenge</h3><p>${escape(p.challenge)}</p></section>
<section class="case-block"><h3>Result</h3><p>${escape(p.result)}</p></section>
</div>
<div class="case-gallery"><figure><img src="${p.preview}" alt="${escape(p.title)} interface concept" loading="lazy"><figcaption>Interface concept · illustrative sample data</figcaption></figure><figure><img src="${p.workflow}" alt="${escape(p.title)} workflow diagram" loading="lazy"><figcaption>Workflow overview</figcaption></figure></div>
${p.link ? '<div class="case-body"><section class="case-block"><h3>Links</h3><p><a href="' + p.link + '" target="_blank" rel="noopener noreferrer">View repository ↗</a></p></section></div>' : ""}
<a href="${linkFor(next)}" class="case-next" data-project="${next.id}"><small>Next project ↗</small><strong>${escape(next.title)}</strong></a></article>`;
}
function showCase(id, push = true, source = null) {
  const p = ordered.find((item) => item.id === id);
  if (!p) return;
  if (!dialog.open) {
    returnFocus = document.activeElement;
    returnHash = location.hash.startsWith("#project=")
      ? "#work"
      : location.hash || "#work";
  }
  transition(() => {
    renderCase(p);
    activeId = id;
    if (!dialog.open) dialog.showModal();
    dialog.scrollTop = 0;
    lenis?.stop();
    document.body.style.overflow = "hidden";
    if (push) history.pushState({ project: id }, "", linkFor(p));
    document.querySelector(".case-close").focus({ preventScroll: true });
  }, source);
}
function hideCase(updateHistory = true) {
  if (!dialog.open) return;
  transition(
    () => {
      dialog.close();
      activeId = null;
      document.body.style.overflow = "";
      lenis?.start();
      if (updateHistory) history.pushState(null, "", returnHash);
      returnFocus?.focus({ preventScroll: true });
    },
    null,
    true,
  );
}
listen(document, "click", (e) => {
  const link = e.target.closest("[data-project]");
  if (!link || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;
  e.preventDefault();
  showCase(
    link.dataset.project,
    true,
    link.closest(".project-showcase")?.querySelector(".project-visual"),
  );
});
listen(document.querySelector(".case-close"), "click", () => hideCase());
listen(dialog, "cancel", (e) => {
  e.preventDefault();
  hideCase();
});
listen(window, "popstate", () => {
  const id = location.hash.startsWith("#project=")
    ? location.hash.slice(9)
    : null;
  if (id && id !== activeId) showCase(id, false);
  else if (!id) hideCase(false);
});

async function intro() {
  const film = document.querySelector(".intro-film");
  if (!g || reduced) {
    film.remove();
    return;
  }
  document.documentElement.classList.add("motion-ready");
  lenis?.stop();
  await g
    .timeline()
    .from(".intro-name", { opacity: 0, letterSpacing: ".05em", duration: 0.4 })
    .to(
      ".intro-name",
      { letterSpacing: ".7em", opacity: 0, duration: 0.5 },
      0.35,
    )
    .to(".intro-line", { scaleX: 1, duration: 0.5, ease: "power3.inOut" }, 0.25)
    .to(".intro-word", { opacity: 1, scale: 1, duration: 0.25 }, 0.7)
    .to(film, { backgroundColor: "#43090f", duration: 0.2 }, 0.85)
    .to(
      ".intro-word",
      { opacity: 0, scale: 1.08, duration: 0.35, ease: "power3.inOut" },
      0.95,
    )
    .to(film, { opacity: 0, duration: 0.45 }, 1.05);
  film.remove();
  lenis?.start();
  g.timeline()
    .from(".hero-entrance", {
      opacity: 0,
      scale: 0.97,
      duration: 1.1,
      ease: "power3.out",
    })
    .from(".hero-bottom", { opacity: 0, y: 14, duration: 0.7 }, 0.35)
    .from(".navigation", { y: -20, opacity: 0, duration: 0.6 }, 0.5);
}
await intro();
ST?.refresh();
if (location.hash.startsWith("#project="))
  showCase(location.hash.slice(9), false);
else if (location.hash && document.querySelector(location.hash))
  lenis
    ? lenis.scrollTo(location.hash, { immediate: true })
    : document.querySelector(location.hash).scrollIntoView();
listen(document, "visibilitychange", () =>
  document.documentElement.classList.toggle("tab-hidden", document.hidden),
);
listen(
  window,
  "pagehide",
  () => {
    g?.ticker.remove(tick);
    lenis?.destroy();
    motionContext?.revert();
    ST?.getAll().forEach((t) => t.kill());
    disposeMotion();
  },
  { once: true },
);
