// One scroll timeline, transform-only depth, and no perpetual animation loop.
export function ProjectArchive(section, mobile) {
  const g = window.gsap;
  const stage = section.querySelector(".archive-stage");
  const items = [...section.querySelectorAll(".archive-item")];
  const links = items.map((item) => item.querySelector("a"));
  const vault = section.querySelector(".archive-vault");
  const scene = section.querySelector(".archive-scene");
  const slots = mobile
    ? [
        [-0.27, -0.28],
        [0.22, -0.23],
        [-0.2, -0.11],
        [0.29, -0.06],
        [-0.29, 0.14],
        [0.23, 0.19],
        [-0.16, 0.31],
        [0.3, 0.34],
      ]
    : [
        [-0.33, -0.18],
        [-0.34, 0.12],
        [0.33, -0.18],
        [0.28, 0.26],
        [-0.13, -0.29],
        [0.13, -0.3],
        [-0.23, 0.29],
        [0.36, 0.08],
      ];
  const position = (i, axis) =>
    slots[i][axis] * (axis ? stage.clientHeight : stage.clientWidth);
  let interactive;
  const setInteraction = (enabled) => {
    if (interactive === enabled) return;
    interactive = enabled;
    section.classList.toggle("archive-interactive", enabled);
    items.forEach((item) => {
      item.inert = !enabled;
    });
    // Do not leave keyboard focus inside an object that is moving out of view.
    if (!enabled && links.includes(document.activeElement)) {
      section.querySelector(".archive-heading").focus({ preventScroll: true });
    }
  };
  section.classList.add("archive-animated");
  section.querySelector(".archive-heading").tabIndex = -1;
  g.set(items, { left: "50%", top: "50%", xPercent: -50, yPercent: -50 });
  setInteraction(false);
  const timeline = g.timeline({
    defaults: { ease: "power3.inOut" },
    scrollTrigger: {
      id: "project-archive",
      trigger: section,
      start: "top top",
      end: () => `+=${Math.round(innerHeight * (mobile ? 1.8 : 2.1))}`,
      pin: stage,
      scrub: 0.75,
      anticipatePin: 1,
      invalidateOnRefresh: true,
    },
    onUpdate() {
      const time = this.time();
      setInteraction(time >= 2.3 && time < 3.8);
    },
  });
  timeline
    .fromTo(
      section.querySelector(".archive-heading"),
      { opacity: 0, y: 18 },
      { opacity: 1, y: 0, duration: 0.7 },
      0,
    )
    .fromTo(
      section.querySelector(".archive-glow"),
      { opacity: 0, scale: 0.6 },
      { opacity: 0.7, scale: 1, duration: 3 },
      0,
    );
  items.forEach((item, i) => {
    const direction = i % 4;
    timeline.fromTo(
      item,
      {
        x: () =>
          position(i, 0) + (direction === 0 ? -160 : direction === 2 ? 160 : 0),
        y: () =>
          position(i, 1) + (direction === 1 ? 150 : direction === 3 ? -150 : 0),
        z: mobile ? 0 : 80 + (i % 3) * 40,
        rotation: i === 3 ? -12 : i % 2 ? 3 : -3,
        scale: 0.88,
        opacity: 0,
        clipPath: i === 4 ? "inset(0 100% 0 0)" : "inset(0 0% 0 0)",
      },
      {
        x: () => position(i, 0),
        y: () => position(i, 1),
        z: 0,
        rotation: 0,
        scale: 1,
        opacity: 1,
        clipPath: "inset(0 0% 0 0)",
        duration: 0.9,
        ease: "power3.out",
      },
      0.4 + i * 0.14,
    );
    const storeAt = 3.8 + i * 0.32;
    timeline
      .to(
        item,
        {
          x: (i - 3.5) * (mobile ? 12 : 21),
          y: (i - 3.5) * (mobile ? 3 : 5) + 14,
          z: mobile ? 0 : -100 - i * 6,
          scale: mobile ? 0.3 : 0.34,
          rotation: -8,
          duration: 1.15,
        },
        storeAt,
      )
      .fromTo(
        item.querySelector(".archive-trail"),
        { opacity: 0, scaleX: 0.2 },
        { opacity: 0.8, scaleX: 1, duration: 0.35 },
        storeAt,
      )
      .to(
        item.querySelector(".archive-trail"),
        { opacity: 0, scaleX: 0.05, duration: 0.5 },
        storeAt + 0.45,
      )
      .fromTo(
        section.querySelector(".vault-seam"),
        { stroke: "#69101b" },
        { stroke: "#ff2438", duration: 0.16, repeat: 1, yoyo: true },
        storeAt + 0.8,
      );
  });
  timeline
    .set(items, { clipPath: "none" }, 2.3)
    .fromTo(
      vault,
      { opacity: 0, scale: 0.6, rotationY: -18, rotationX: 10 },
      { opacity: 1, scale: 1, rotationY: 0, rotationX: 0, duration: 1.3 },
      2.5,
    )
    .fromTo(
      section.querySelector(".vault-lid"),
      { y: -24, rotation: -5 },
      { y: 0, rotation: 0, duration: 0.8 },
      7.25,
    )
    .to(items, { opacity: 0.65, duration: 0.7 }, 7.25)
    .to(vault, { scaleY: 0.82, duration: 0.8 }, 7.25)
    .fromTo(
      section.querySelector(".archive-caption"),
      { opacity: 0, y: 16 },
      { opacity: 1, y: 0, duration: 0.7 },
      7.6,
    )
    .to(scene, { y: -90, scale: 0.78, opacity: 0, duration: 1.2 }, 8.7)
    .to(
      section.querySelector(".archive-glow"),
      { opacity: 0, duration: 1 },
      8.8,
    )
    .to(
      section.querySelectorAll(".archive-heading,.archive-caption"),
      { opacity: 0, duration: 0.6 },
      9.3,
    );
  // Let the last artwork fall back before the pinned archive starts.
  g.to(
    document.querySelector(".project-showcase:last-child .project-visual img"),
    {
      scale: 0.84,
      opacity: 0.15,
      ease: "none",
      scrollTrigger: {
        trigger: section,
        start: "top bottom",
        end: "top top",
        scrub: 1,
      },
    },
  );
  return timeline;
}
