import { reduced } from "./motion.js";

export const skillGroups = [
  {
    id: "code",
    title: "CODE",
    num: "01",
    kanji: "巻の一 · 言語",
    seal: "CODE",
    align: "left",
    offset: "clamp(16px, 8vw, 110px)",
    skills: [
      { name: "Python", hint: "Language", scale: "lg" },
      { name: "Java", hint: "Language", scale: "md" },
      { name: "C", hint: "Language", scale: "sm" },
      { name: "C++", hint: "Language", scale: "sm" },
      { name: "JavaScript", hint: "Language", scale: "md" },
      { name: "TypeScript", hint: "Language", scale: "lg" },
    ],
  },
  {
    id: "web",
    title: "FRONTEND",
    num: "02",
    kanji: "巻の二 · 電脳表現",
    seal: "WEB",
    align: "right",
    offset: "clamp(16px, 10vw, 140px)",
    skills: [
      { name: "React", hint: "Frontend", scale: "lg" },
      { name: "Next.js", hint: "Frontend", scale: "md" },
      { name: "Vite", hint: "Build Tool", scale: "sm" },
      { name: "Tailwind CSS", hint: "Styling", scale: "sm" },
      { name: "Three.js", hint: "3D / WebGL", scale: "md" },
    ],
  },
  {
    id: "api",
    title: "BACKEND",
    num: "03",
    kanji: "巻の三 · 基底構造",
    seal: "API",
    align: "left",
    offset: "clamp(16px, 6vw, 80px)",
    skills: [
      { name: "Node.js", hint: "Backend", scale: "md" },
      { name: "Express.js", hint: "Backend", scale: "sm" },
      { name: "FastAPI", hint: "Backend", scale: "lg" },
      { name: "Spring Boot", hint: "Backend", scale: "md" },
      { name: "REST APIs", hint: "Backend", scale: "sm" },
      { name: "MVC", hint: "Architecture", scale: "sm" },
    ],
  },
  {
    id: "ai",
    title: "AI / ML",
    num: "04",
    kanji: "巻の四 · 人工知能",
    seal: "AI",
    align: "right",
    offset: "clamp(16px, 12vw, 160px)",
    skills: [
      { name: "PyTorch", hint: "AI / ML", scale: "lg" },
      { name: "Hugging Face", hint: "AI / ML", scale: "md" },
      { name: "AI Agents", hint: "AI / ML", scale: "lg" },
    ],
  },
  {
    id: "data",
    title: "DATA / WEB3",
    num: "05",
    kanji: "巻の五 · 分散基盤",
    seal: "DATA",
    align: "left",
    offset: "clamp(16px, 7vw, 95px)",
    skills: [
      { name: "PostgreSQL", hint: "Database", scale: "lg" },
      { name: "MySQL", hint: "Database", scale: "md" },
      { name: "MongoDB", hint: "Database", scale: "sm" },
      { name: "Supabase", hint: "Backend / DB", scale: "md" },
      { name: "Solidity", hint: "Web3", scale: "lg" },
      { name: "Ethereum", hint: "Web3", scale: "md" },
      { name: "Hardhat", hint: "Web3", scale: "sm" },
      { name: "SHA-256", hint: "Cryptography", scale: "sm" },
    ],
  },
  {
    id: "tool",
    title: "TOOLS",
    num: "06",
    kanji: "巻の六 · 道具基盤",
    seal: "TOOL",
    align: "right",
    offset: "clamp(16px, 11vw, 150px)",
    skills: [
      { name: "Git", hint: "Version Control", scale: "lg" },
      { name: "GitHub", hint: "Collaboration", scale: "md" },
      { name: "Netlify", hint: "Deployment", scale: "sm" },
      { name: "Vercel", hint: "Deployment", scale: "sm" },
      { name: "Figma", hint: "Design", scale: "md" },
      { name: "Canva", hint: "Design", scale: "sm" },
    ],
  },
];

const escape = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (char) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        char
      ],
  );

function renderStack(section) {
  const mount = section.querySelector("[data-stack-mount]");
  if (!mount) return;

  mount.innerHTML = `
<div class="ninja-manuscripts-flow" data-ninja-flow>
  ${skillGroups
    .map(
      (group, index) => `
  <div
    class="ninja-scroll-anchor ninja-scroll-anchor--${group.align}"
    data-scroll-anchor
    style="--anchor-offset: ${group.offset};"
  >
    <article
      class="ninja-scroll"
      data-ninja-scroll
      data-scroll-id="${group.id}"
      data-scroll-index="${index}"
      data-skill-count="${group.skills.length}"
    >
      <button
        type="button"
        class="ninja-scroll__trigger"
        data-scroll-trigger
        aria-expanded="false"
        aria-controls="ninja-body-${group.id}"
        data-cursor="OPEN"
      >
        <span class="sr-only">Open ${escape(group.title)} manuscript scroll</span>

        <div class="ninja-assembly" data-scroll-assembly>
          
          <!-- LEFT VERTICAL WOODEN ROLLER -->
          <div class="ninja-roller ninja-roller--left" data-roller-left aria-hidden="true">
            <span class="roller-cap roller-cap--top"></span>
            <div class="roller-wood">
              <span class="roller-sheen"></span>
            </div>
            <span class="roller-cap roller-cap--bottom"></span>
          </div>

          <!-- WARM BROWN PARCHMENT BODY (Directly connects to rollers with zero gap) -->
          <div class="ninja-paper-wrap" data-scroll-paper-wrap id="ninja-body-${group.id}">
            
            <!-- Real Curled Paper Lips on Left and Right edges -->
            <span class="ninja-curl ninja-curl--left" aria-hidden="true"></span>
            <span class="ninja-curl ninja-curl--right" aria-hidden="true"></span>

            <div class="ninja-paper">
              <span class="ninja-paper__fibers" aria-hidden="true"></span>
              <span class="ninja-paper__grain" aria-hidden="true"></span>
              <span class="ninja-paper__rim ninja-paper__rim--top" aria-hidden="true"></span>
              <span class="ninja-paper__rim ninja-paper__rim--bottom" aria-hidden="true"></span>

              <!-- CLOSED STATE: ROLLED CYLINDRICAL PARCHMENT BUNDLE (║▓║) -->
              <div class="ninja-rolled-bundle" data-rolled-bundle>
                <span class="bundle-texture" aria-hidden="true"></span>
                <span class="bundle-cord" aria-hidden="true"></span>
                <div class="bundle-seal-badge" aria-hidden="true">
                  <span class="bundle-seal-mark">${escape(group.seal)}</span>
                </div>
                <span class="bundle-num" aria-hidden="true">${group.num}</span>
              </div>

              <!-- OPEN STATE: MANUSCRIPT CONTENT (Revealed in place) -->
              <div class="ninja-open-content" data-open-content>
                <header class="ninja-header">
                  <div class="ninja-header__titles">
                    <span class="ninja-kanji" data-ink-kanji aria-hidden="true">${escape(group.kanji)}</span>
                    <h3 class="ninja-title" data-ink-title>
                      <span>${escape(group.title)}</span>
                    </h3>
                  </div>
                  <div class="ninja-header__side">
                    <span class="ninja-index">${group.num}</span>
                    <span class="ninja-close-hint" aria-hidden="true">close ×</span>
                  </div>
                </header>

                <ul class="ninja-skills-grid" aria-label="${escape(group.title)} skills">
                  ${group.skills
                    .map(
                      (skill, sIndex) => `
                    <li
                      class="ninja-skill-item ninja-skill-item--${skill.scale}"
                      data-ink-skill
                      tabindex="0"
                      style="--skill-i: ${sIndex};"
                    >
                      <span class="ninja-skill-name">${escape(skill.name)}</span>
                      <span class="ninja-skill-hint">${escape(skill.hint)}</span>
                      <span class="ninja-skill-line" aria-hidden="true"></span>
                    </li>`,
                    )
                    .join("")}
                </ul>

                <div class="ninja-seal" data-ink-seal aria-label="${escape(group.seal)} seal" aria-hidden="true">
                  <span class="seal-mark">${escape(group.seal)}</span>
                  <span class="seal-kanji">印</span>
                </div>
              </div>

            </div>
          </div>

          <!-- RIGHT VERTICAL WOODEN ROLLER -->
          <div class="ninja-roller ninja-roller--right" data-roller-right aria-hidden="true">
            <span class="roller-cap roller-cap--top"></span>
            <div class="roller-wood">
              <span class="roller-sheen"></span>
            </div>
            <span class="roller-cap roller-cap--bottom"></span>
          </div>

        </div>
      </button>
    </article>
  </div>`,
    )
    .join("")}
</div>`;
}

export function initStack(section) {
  if (!section) return;
  renderStack(section);

  const g = window.gsap;
  const manuscripts = section.querySelectorAll("[data-ninja-scroll]");
  const intro = section.querySelector(".stack-intro");
  const eyebrow = section.querySelector(".stack-eyebrow");

  if (!manuscripts.length) return;

  // Header entrance
  if (intro && g && !reduced) {
    g.fromTo(
      intro,
      { opacity: 0, y: 14 },
      {
        opacity: 1,
        y: 0,
        duration: 0.5,
        ease: "power2.out",
        scrollTrigger: {
          trigger: section,
          start: "top 85%",
          toggleActions: "play none none none",
        },
      },
    );
  }
  if (eyebrow && g && !reduced) {
    g.fromTo(
      eyebrow,
      { opacity: 0, x: -10 },
      {
        opacity: 1,
        x: 0,
        duration: 0.45,
        ease: "power2.out",
        scrollTrigger: {
          trigger: section,
          start: "top 85%",
          toggleActions: "play none none none",
        },
      },
    );
  }

  let activeManuscript = null;
  let isAnimating = false;

  // Compute compact in-place open dimensions (48vw - 55vw desktop, max ~560px)
  const getTargetDimensions = (manuscript) => {
    const vw = window.innerWidth;
    const isMobile = vw <= 900;
    const skillCount = parseInt(manuscript?.dataset.skillCount || "4", 10);
    const targetW = isMobile
      ? Math.min(vw * 0.88, 430)
      : Math.min(Math.max(vw * 0.48, 360), 560);
    // Dynamic height based on number of skills
    let targetH = 175;
    if (isMobile) {
      targetH = skillCount > 6 ? 240 : skillCount > 4 ? 210 : 185;
    } else {
      targetH = skillCount > 6 ? 195 : skillCount <= 3 ? 160 : 175;
    }
    return { targetW, targetH, isMobile };
  };

  const closeScroll = (manuscript) => {
    if (!manuscript || !manuscript.classList.contains("is-open")) return;
    const trigger = manuscript.querySelector("[data-scroll-trigger]");
    const assembly = manuscript.querySelector("[data-scroll-assembly]");
    const bundle = manuscript.querySelector("[data-rolled-bundle]");
    const openContent = manuscript.querySelector("[data-open-content]");
    const kanji = manuscript.querySelector("[data-ink-kanji]");
    const title = manuscript.querySelector("[data-ink-title]");
    const skills = manuscript.querySelectorAll("[data-ink-skill]");
    const seal = manuscript.querySelector("[data-ink-seal]");

    trigger.setAttribute("aria-expanded", "false");
    trigger.setAttribute("data-cursor", "OPEN");

    if (!g || reduced) {
      manuscript.classList.remove("is-open");
      return;
    }

    const tl = g.timeline({
      onComplete: () => {
        manuscript.classList.remove("is-open");
        manuscript.classList.remove("is-busy");
        isAnimating = false;
        if (activeManuscript === manuscript) activeManuscript = null;
        g.set([assembly, bundle, openContent], { clearProps: "all" });
      },
    });

    manuscript.classList.add("is-busy");

    // Fast ink fade on open content
    tl.to(
      [seal, skills, title, kanji],
      {
        opacity: 0,
        duration: 0.14,
        ease: "power2.in",
      },
      0,
    );

    // Rollers and paper roll inward in place to compact closed size (60px)
    tl.to(
      assembly,
      {
        width: 60,
        height: 140,
        duration: 0.52,
        ease: "power3.inOut",
      },
      0.05,
    );

    // Fade rolled bundle back in
    tl.to(
      bundle,
      {
        opacity: 1,
        duration: 0.22,
        ease: "power2.out",
      },
      0.22,
    );
  };

  const openScroll = (manuscript) => {
    if (manuscript.classList.contains("is-open") || isAnimating) return;

    // Accordion: close previous open scroll in its place
    if (activeManuscript && activeManuscript !== manuscript) {
      closeScroll(activeManuscript);
    }

    activeManuscript = manuscript;
    isAnimating = true;

    const trigger = manuscript.querySelector("[data-scroll-trigger]");
    const assembly = manuscript.querySelector("[data-scroll-assembly]");
    const bundle = manuscript.querySelector("[data-rolled-bundle]");
    const openContent = manuscript.querySelector("[data-open-content]");
    const kanji = manuscript.querySelector("[data-ink-kanji]");
    const title = manuscript.querySelector("[data-ink-title]");
    const skills = manuscript.querySelectorAll("[data-ink-skill]");
    const seal = manuscript.querySelector("[data-ink-seal]");

    trigger.setAttribute("aria-expanded", "true");
    trigger.setAttribute("data-cursor", "CLOSE");
    manuscript.classList.add("is-open");
    manuscript.classList.add("is-busy");

    if (!g || reduced) {
      manuscript.classList.remove("is-busy");
      isAnimating = false;
      return;
    }

    const { targetW, targetH } = getTargetDimensions(manuscript);

    // Prepare initial state
    g.set(assembly, { width: 60, height: 140, scale: 1 });
    g.set(bundle, { opacity: 1 });
    g.set(openContent, { opacity: 1 });

    if (kanji) g.set(kanji, { opacity: 0, y: 5, filter: "blur(2px)" });
    if (title) g.set(title, { opacity: 0, y: 7, filter: "blur(2px)" });
    if (skills.length) g.set(skills, { opacity: 0, y: 6, filter: "blur(2px)" });
    if (seal) g.set(seal, { opacity: 0, scale: 1.15, rotation: -2 });

    const tl = g.timeline({
      onComplete: () => {
        manuscript.classList.remove("is-busy");
        isAnimating = false;
      },
    });

    // 1. Subtle tactile press
    tl.to(assembly, { scale: 0.98, duration: 0.05, ease: "power2.out" }, 0);
    tl.to(assembly, { scale: 1, duration: 0.09, ease: "power2.inOut" }, 0.05);

    // Cross-fade closed bundle as paper expands
    tl.to(bundle, { opacity: 0, duration: 0.12, ease: "power2.out" }, 0.05);

    // 2. Physical horizontal unroll: assembly width expands in place
    tl.to(
      assembly,
      {
        width: targetW,
        height: targetH,
        duration: 0.62,
        ease: "power3.out",
      },
      0.05,
    );

    // 3. Title and Japanese inscription ink in
    if (kanji) {
      tl.to(
        kanji,
        {
          opacity: 0.9,
          y: 0,
          filter: "blur(0px)",
          duration: 0.25,
          ease: "power2.out",
        },
        0.28,
      );
    }
    if (title) {
      tl.to(
        title,
        {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 0.28,
          ease: "power2.out",
        },
        0.32,
      );
    }

    // 4. Skills ink reveal with calm stagger
    if (skills.length) {
      tl.to(
        skills,
        {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 0.24,
          stagger: 0.04,
          ease: "power2.out",
        },
        0.4,
      );
    }

    // 5. Red Hanko seal stamps down
    if (seal) {
      tl.to(
        seal,
        {
          opacity: 1,
          scale: 1,
          rotation: -1,
          duration: 0.14,
          ease: "power4.out",
        },
        0.54,
      );
    }
  };

  // Click & tap handler: opens or closes in place
  manuscripts.forEach((manuscript) => {
    const trigger = manuscript.querySelector("[data-scroll-trigger]");
    if (!trigger) return;

    trigger.addEventListener("click", (e) => {
      if (e.target.closest(".ninja-skill-item")) return;

      if (manuscript.classList.contains("is-open")) {
        closeScroll(manuscript);
      } else {
        openScroll(manuscript);
      }
    });
  });

  // Re-sync open scroll width on resize without changing anchor
  window.addEventListener(
    "resize",
    () => {
      if (!activeManuscript || isAnimating || !g) return;
      const { targetW, targetH } = getTargetDimensions(activeManuscript);
      const assembly = activeManuscript.querySelector("[data-scroll-assembly]");
      if (assembly) {
        g.set(assembly, { width: targetW, height: targetH });
      }
    },
    { passive: true },
  );
}
