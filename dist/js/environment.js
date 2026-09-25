import { GardenAmbience } from "./ambience.js";
import { prepareHeroScene, heroSceneState, paintHeroScene, disposeHeroScene } from "./hero-scene.js";

const root = document.querySelector(".ink-environment");
const canvas = root.querySelector("canvas");
const ctx = canvas.getContext("2d", { alpha: false });
const motionQuery = matchMedia("(prefers-reduced-motion: reduce)");
const events = new AbortController();
const stopAudio = GardenAmbience(document.querySelector(".ambient-toggle"));
const image = new Image();
image.src = "assets/images/kaif/japanese-landscape.webp";
const cleanSky = new Image();
cleanSky.src = "assets/images/kaif/japanese-landscape-sunless.webp";
const g = window.gsap,
  ST = window.ScrollTrigger;
let width = innerWidth,
  height = innerHeight,
  dpr = 1,
  progress = 0,
  targetX = 0,
  pointerX = 0,
  last = 0;
let plate,
  sun,
  layers = [],
  trigger,
  projectTrigger,
  observer,
  frame,
  ready = false,
  active = true;
const W = 1672,
  H = 941;
function surface(w, h) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return c;
}
function clamp(value, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

function prepareLayers() {
  plate = surface(W, H);
  const p = plate.getContext("2d");
  p.drawImage(image, 0, 0, W, H);
  sun = surface(152, 152);
  const s = sun.getContext("2d");
  s.drawImage(image, 544, 86, 152, 152, 0, 0, 152, 152);
  const original = s.getImageData(0, 0, 152, 152);
  const repair = surface(320, 225),
    r = repair.getContext("2d");
  // Only this feathered sky patch uses the edited plate; the rest is original.
  r.drawImage(cleanSky, 515/W*cleanSky.naturalWidth, 45/H*cleanSky.naturalHeight,
    320/W*cleanSky.naturalWidth, 225/H*cleanSky.naturalHeight, 0, 0, 320, 225);
  const patch = r.getImageData(0, 0, 320, 225);
  for(let y=0;y<225;y++) for(let x=0;x<320;x++) {
    patch.data[(y*320+x)*4+3] = Math.round(255*clamp(Math.min(x/18,(319-x)/18,y/18,(224-y)/18)));
  }
  r.putImageData(patch,0,0);p.drawImage(repair,515,45);
  for (let y = 0; y < 152; y++)
    for (let x = 0; x < 152; x++) {
      const i = (y * 152 + x) * 4,
        dist = Math.hypot(x - 76, y - 74);
      const pigment =
        dist < 74
          ? clamp(
              (original.data[i] -
                Math.max(original.data[i + 1], original.data[i + 2]) -
                12) /
                38,
            )
          : 0;
      original.data[i + 3] = Math.round(pigment * 255);
    }
  s.putImageData(original, 0, 0);
  const patches = [
    { x: 570, y: 265, w: 740, h: 440, depth: 9, period: 31, amplitude: 1.4 },
    { x: 0, y: 428, w: 650, h: 513, depth: 15, period: 9, amplitude: 1.9 },
    { x: 1120, y: 348, w: 552, h: 593, depth: 18, period: 11, amplitude: 2.5 },
  ];
  layers = patches.map((spec, index) => {
    const tile = surface(spec.w, spec.h),
      t = tile.getContext("2d");
    t.drawImage(plate, spec.x, spec.y, spec.w, spec.h, 0, 0, spec.w, spec.h);
    t.globalCompositeOperation = "destination-in";
    const mask = t.createRadialGradient(
      spec.w * 0.5,
      spec.h * 0.55,
      0,
      spec.w * 0.5,
      spec.h * 0.55,
      spec.w * 0.65,
    );
    mask.addColorStop(0, "#000");
    mask.addColorStop(0.58, "#000");
    mask.addColorStop(1, "transparent");
    t.fillStyle = mask;
    t.fillRect(0, 0, spec.w, spec.h);
    return { ...spec, tile, index };
  });
  prepareHeroScene(plate);
}
function resize() {
  width = innerWidth;
  height = innerHeight;
  dpr = Math.min(devicePixelRatio || 1, width < 700 ? 1 : 1.5);
  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
  if (ready) render(performance.now() / 1000);
}
function render(time) {
  if (!ready || document.hidden || !active) return;
  // Only pause the covered 2D backdrop during the project world's full view.
  if (root.dataset.projectWorldActive === "true") return;
  const calm = motionQuery.matches,
    mobile = width < 700;
  const t = calm ? 0 : time;
  const heroScene = heroSceneState(calm);
  pointerX += (targetX - pointerX) * 0.035;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.fillStyle = "#333235";
  ctx.fillRect(0, 0, width, height);
  // Desktop fills the viewport. Portrait screens retain the full panorama,
  // with a low-contrast enlargement behind it extending the ink atmosphere.
  const cover = Math.max(width / W, height / H);
  if (mobile) {
    ctx.globalAlpha = 0.35;
    ctx.drawImage(plate, (width - W * cover) / 2, 0, W * cover, H * cover);
    ctx.globalAlpha = 1;
  }
  const scale = (mobile ? (width / W) * 1.05 : cover * 1.025) *
    (1 + heroScene.strength * heroScene.progress * 0.025);
  const artW = W * scale,
    artH = H * scale;
  const x = (width - artW) / 2 + (calm ? 0 : pointerX * 1.5);
  const y = mobile ? (height - artH) * 0.4 : (height - artH) / 2;
  ctx.save();
  ctx.translate(x, y - (calm ? 0 : progress * 5));
  ctx.scale(scale, scale);
  ctx.drawImage(plate, 0, 0);
  const rise = 34 - progress * 100;
  const sx = 620,
    sy = 160 + rise;
  const glow = ctx.createRadialGradient(sx, sy, 15, sx, sy, 155);
  glow.addColorStop(0, `rgba(180,17,27,${0.035 + progress * 0.035})`);
  glow.addColorStop(1, "transparent");
  ctx.fillStyle = glow;
  ctx.fillRect(sx - 155, sy - 155, 310, 310);
  ctx.save();
  ctx.globalAlpha = 0.76 + progress * 0.24;
  ctx.translate(sx, sy);
  const sunScale = 0.93 + progress * 0.09;
  ctx.scale(sunScale, sunScale);
  ctx.drawImage(sun, -76, -74);
  ctx.restore();
  // Foreground ridge occludes the lowered sun, creating an actual sunrise.
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(475, 145);
  ctx.lineTo(531, 179);
  ctx.lineTo(564, 198);
  ctx.lineTo(601, 218);
  ctx.lineTo(646, 250);
  ctx.lineTo(730, 290);
  ctx.lineTo(760, 355);
  ctx.lineTo(475, 355);
  ctx.closePath();
  ctx.clip();
  ctx.drawImage(plate, 0, 0);
  ctx.restore();
  for (const layer of layers) {
    const sway = calm
      ? 0
      : Math.sin((t / layer.period) * 2 * Math.PI + layer.index) *
        layer.amplitude * (1 + heroScene.strength * (layer.index ? 1.5 : 0));
    ctx.save();
    ctx.translate(layer.x + layer.w * 0.5, layer.y + layer.h);
    ctx.rotate(calm ? 0 : Math.sin(t / layer.period + layer.index) * 0.0025 *
      (1 + heroScene.strength * (layer.index ? 0.8 : 0)));
    ctx.globalAlpha = 0.8;
    ctx.drawImage(
      layer.tile,
      -layer.w * 0.5 + sway + (calm ? 0 : pointerX * (layer.index + 1) * 1.5),
      -layer.h - (calm ? 0 : progress * layer.depth * 0.5),
    );
    ctx.restore();
  }
  // A few soft mist veils; no full-image displacement or water sprites.
  for (let i = 0; i < 2; i++) {
    const mx = 730 + i * 300 + (calm ? 0 : Math.sin(t / (23 + i * 9)) * 24),
      my = 440 + i * 135;
    const mist = ctx.createRadialGradient(mx, my, 0, mx, my, 220);
    mist.addColorStop(
      0,
      `rgba(230,227,222,${0.025 + (calm ? 0 : Math.sin(t / 19 + i) * 0.008)})`,
    );
    mist.addColorStop(1, "transparent");
    ctx.save();
    ctx.scale(1, 0.38);
    ctx.fillStyle = mist;
    ctx.fillRect(mx - 230, my - 230, 460, 460);
    ctx.restore();
  }
  // Waterfall and river reflections use tiny moving highlights over real art.
  if (!calm) {
    ctx.save();
    ctx.globalAlpha = 0.045 + Math.sin(t * 0.7) * 0.015;
    ctx.strokeStyle = "#f1edea";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(474, 717);
    ctx.bezierCurveTo(486, 744, 525, 770, 510 + Math.sin(t) * 2, 854);
    ctx.stroke();
    ctx.globalAlpha = 0.035;
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      const rx = 670 + i * 63 + Math.sin(t * 0.45 + i) * 5;
      ctx.moveTo(rx, 901 + i * 5);
      ctx.lineTo(rx + 35, 901 + i * 5);
      ctx.stroke();
    }
    ctx.restore();
    const count = mobile ? 3 : 5;
    for (let i = 0; i < count; i++) {
      const phase = (t / (18 + i * 3) + i * 0.23) % 1;
      ctx.save();
      ctx.translate(
        120 + i * 310 + Math.sin(phase * 4 + i) * 18,
        440 + phase * 420,
      );
      ctx.rotate(phase * 1.4 + i);
      ctx.globalAlpha = 0.16 * Math.sin(phase * Math.PI);
      ctx.fillStyle = "#a5111e";
      ctx.beginPath();
      ctx.ellipse(0, 0, 3, 1.1, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }
  paintHeroScene(ctx, t, heroScene.strength, mobile);
  ctx.restore();
  if (mobile) {
    // Feather the panoramic panel into its extended atmospheric backdrop.
    const edge = ctx.createLinearGradient(0, y - 1, 0, y + artH + 1);
    edge.addColorStop(0, "#29282bd9");
    edge.addColorStop(0.12, "transparent");
    edge.addColorStop(0.84, "transparent");
    edge.addColorStop(1, "#252427e6");
    ctx.fillStyle = edge;
    ctx.fillRect(0, y - 1, width, artH + 2);
  }
  root.dataset.sunProgress = progress.toFixed(3);
}
function tick(time) {
  if (
    motionQuery.matches ||
    document.hidden ||
    !active ||
    time - last < 1 / (width < 700 ? 24 : 40)
  )
    return;
  last = time;
  render(time);
}
function fallbackScroll() {
  progress = clamp(
    scrollY / Math.max(1, document.documentElement.scrollHeight - innerHeight),
  );
  if (motionQuery.matches) render(performance.now() / 1000);
}
Promise.all([image.decode(), cleanSky.decode()])
  .then(() => {
    if (!ctx) throw new Error("Canvas unavailable");
    prepareLayers();
    ready = true;
    resize();
    document.documentElement.classList.add("landscape-ready");
    if (g && ST) {
      g.registerPlugin(ST);
      trigger = ST.create({
        id: "ink-sunrise",
        start: 0,
        end: "max",
        onUpdate: (self) => {
          progress = self.progress;
          if (motionQuery.matches) render(performance.now() / 1000);
        },
      });
      projectTrigger = ST.create({
        trigger: "#work",
        start: "top 75%",
        end: "bottom top",
        onToggle: (self) => root.classList.toggle("in-projects", self.isActive),
      });
      g.ticker.add(tick);
      ST.refresh();
    } else {
      window.addEventListener("scroll", fallbackScroll, {
        passive: true,
        signal: events.signal,
      });
      const loop = (time) => {
        tick(time / 1000);
        frame = requestAnimationFrame(loop);
      };
      frame = requestAnimationFrame(loop);
    }
    observer = new ResizeObserver(() => {
      trigger?.refresh();
      fallbackScroll();
    });
    observer.observe(document.querySelector("main"));
  })
  .catch(() => {
    canvas.style.display = "none";
    root.style.backgroundImage = `url("${image.src}")`;
    root.style.backgroundSize = "cover";
    document.documentElement.classList.add("landscape-ready");
  });
window.addEventListener("resize", resize, {
  signal: events.signal,
  passive: true,
});
window.addEventListener(
  "pointermove",
  (event) => {
    if (width > 900 && !motionQuery.matches)
      targetX = (event.clientX / width - 0.5) * 2;
  },
  { signal: events.signal, passive: true },
);
motionQuery.addEventListener("change", () => render(performance.now() / 1000), {
  signal: events.signal,
});
document.addEventListener(
  "visibilitychange",
  () => {
    active = !document.hidden;
    if (active) render(performance.now() / 1000);
  },
  { signal: events.signal },
);
window.addEventListener(
  "pagehide",
  () => {
    events.abort();
    observer?.disconnect();
    trigger?.kill();
    projectTrigger?.kill();
    g?.ticker.remove(tick);
    cancelAnimationFrame(frame);
    stopAudio();
    disposeHeroScene();
    layers = [];
    plate = null;
    sun = null;
  },
  { once: true },
);
