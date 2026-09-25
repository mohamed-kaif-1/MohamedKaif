/* ==========================================================================
   HALL OF HONORS — ACHIEVEMENTS JS MODULE
   ========================================================================== */

export function initAchievements(section) {
  if (!section) return;

  const items = section.querySelectorAll(".honors-item");
  const cards = section.querySelectorAll(".plaque-card");
  const cords = section.querySelectorAll(".cord");

  // GSAP ScrollTrigger Entrance Animation if GSAP is available
  if (typeof window.gsap !== "undefined" && typeof window.ScrollTrigger !== "undefined") {
    const gsap = window.gsap;
    const ScrollTrigger = window.ScrollTrigger;

    // Set initial state
    gsap.set(cords, { scaleY: 0, transformOrigin: "top center" });
    gsap.set(items, { y: -35, opacity: 0 });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: "top 80%",
        toggleActions: "play none none reverse",
      },
    });

    // Step 1: Red cords draw downward
    tl.to(cords, {
      scaleY: 1,
      duration: 0.6,
      stagger: 0.05,
      ease: "power2.out",
    })
    // Step 2: Plaques descend into position
    .to(
      items,
      {
        y: 0,
        opacity: 1,
        duration: 0.7,
        stagger: 0.15,
        ease: "back.out(1.2)",
        clearProps: "y",
      },
      "-=0.3"
    );
  } else {
    // Fallback if GSAP is missing
    items.forEach((item) => {
      item.style.opacity = "1";
      item.style.transform = "none";
    });
    cords.forEach((cord) => {
      cord.style.transform = "none";
    });
  }

  // Pointer Hover 3D Tilt Effect for Desktop
  cards.forEach((card) => {
    let bounds;

    const onMouseEnter = () => {
      bounds = card.getBoundingClientRect();
    };

    const onMouseMove = (e) => {
      if (!bounds) bounds = card.getBoundingClientRect();
      const mouseX = e.clientX - bounds.left;
      const mouseY = e.clientY - bounds.top;

      const centerX = bounds.width / 2;
      const centerY = bounds.height / 2;

      // Max tilt 3.5 degrees
      const rotateX = ((mouseY - centerY) / centerY) * -3.5;
      const rotateY = ((mouseX - centerX) / centerX) * 3.5;

      card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-4px)`;
    };

    const onMouseLeave = () => {
      card.style.transform = "";
    };

    // Card Click / Tap Expansion Toggle
    const toggleExpand = (e) => {
      // Prevent double firing if event bubbled
      const current = card.getAttribute("aria-expanded") === "true";
      
      // Close any other open plaques
      cards.forEach((otherCard) => {
        if (otherCard !== card) {
          otherCard.setAttribute("aria-expanded", "false");
        }
      });

      card.setAttribute("aria-expanded", current ? "false" : "true");
    };

    card.addEventListener("mouseenter", onMouseEnter);
    card.addEventListener("mousemove", onMouseMove);
    card.addEventListener("mouseleave", onMouseLeave);

    card.addEventListener("click", toggleExpand);

    // Keyboard support
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        toggleExpand(e);
      }
    });
  });
}
