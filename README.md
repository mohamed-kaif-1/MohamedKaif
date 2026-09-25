# Mohamed Kaif — Portfolio

A dark red and black portfolio focused on Mohamed Kaif and his documented projects. Five sections: Hero, Selected Work, About, Achievements and Contact.

## Run locally

```sh
npm start
```

Open `http://localhost:4000`. No install or build step is required.

## Structure

- `dist/index.html` — complete single-page experience
- `dist/styles/index.css` — responsive visual system
- `dist/styles/hero.css` — scoped centered hero composition and work-section bridge
- `dist/js/index.js` — page orchestration, case studies and navigation
- `dist/js/projects.js` — documented project content
- `dist/js/motion.js` — reusable motion and interaction utilities
- `dist/js/archive.js` — responsive scroll-driven project archive interlude
- `dist/js/hero.js` — three-portrait scroll sequence and pointer depth
- `dist/js/vendor/` — local GSAP, ScrollTrigger and Lenis builds
- `dist/assets/images/kaif/` — portraits, project identity artwork and diagrams
- `server.mjs` — dependency-free local server

The legacy `/works/`, `/info/` and `/contact/` routes redirect to their corresponding sections in the new experience.

## Editing

Project copy lives in `dist/js/projects.js`; the case-study renderer lives in `dist/js/index.js`. Page content is in `dist/index.html`, while layout, responsive behavior and visual styling are in `dist/styles/index.css`.

The site respects `prefers-reduced-motion`, removes cursor effects on touch devices and lazy-loads case-study gallery imagery. Selected Work concludes with an eight-project archive animation before About; reduced motion keeps its links accessible without pinning.

## Browser verification

`scripts/verify-hero.mjs` checks centered desktop/mobile geometry, three loaded portrait assets, photo transitions, reverse scrolling, the Work CTA, the exit bridge and reduced motion. It uses the same `PLAYWRIGHT_PATH` setup below and saves screenshots to `C:/tmp/kaif-hero-qa`.

`scripts/verify-portfolio.mjs` checks desktop and mobile navigation, project transitions, direct links, reduced motion, horizontal overflow and browser errors against localhost:4000. Set `PLAYWRIGHT_PATH` to an installed Playwright package's `index.mjs`, then run the script with Node. Screenshots are written to `C:/tmp/kaif-red-qa` by default, or `QA_OUTPUT` if set.
