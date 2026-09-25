# Portfolio design notes

The visual system uses almost-black, deep burgundy, off-white and restrained red light. A controlled typography hierarchy, layered owner portraits and supplied project identities lead the composition. Hero type is capped at 160px, section headings at 88px and project headings at 80px; body text remains 16–18px with smaller metadata.

The hero alone has a centered composition: the name surrounds a softly masked portrait, with solid and outline lettering layered in front and behind. Three existing portrait assets (selected, about, info) crossfade through scroll-driven masks as the composition gains depth. The final portrait stays visible during pin release and drifts downward while Selected Work rises from below. Desktop pins for 210vh; mobile uses 160vh, milder zoom and no animated blur. Reduced motion retains the initial centered portrait without pinning. No new portrait imagery is generated.

The experience includes a short cinematic name intro, a scroll-through hero, eight alternating project compositions, masked portraits, a small technology strip and a full-screen mobile menu. Project navigation uses expanding imagery and three red panels; case studies are accessible native dialogs with keyboard dismissal and deep links. Reduced motion skips intense choreography.

The implementation is independently structured in plain HTML, CSS and JavaScript. GSAP, ScrollTrigger and Lenis are retained only as third-party motion utilities under their respective licenses.

Eight supplied project identity artworks are displayed at 100–160px, without cropping or stretching. Larger interface concepts give each project a visual focal point. Interface, workflow and stack diagrams are labeled conceptual portfolio visuals and do not claim production metrics.

Selected Work ends with a scroll-driven Project Archive: eight identities arrive from different directions, pause for hover or keyboard access, then converge into a translucent red-edged geometric container. One reversible ScrollTrigger timeline pins for 210vh on desktop or 180vh on mobile. Mobile uses a compact diagonal arrangement without WebGL. Links become inert during storage; reduced motion uses an unpinned static composition with accessible project links. The archive count is derived from the actual featured projects, not the six example names in the brief.
