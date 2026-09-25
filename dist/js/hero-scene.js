// Hero-only additions to the existing shared scene. All coordinates are in the
// supplied 1672 x 941 artwork; no replacement imagery or independent RAF loop.
const hero = document.querySelector('.hero');
const clamp = n => Math.max(0, Math.min(1, n));
let waterfall, river, clouds;
function surface(w, h) {
  const canvas = document.createElement('canvas');
  canvas.width = w; canvas.height = h;
  return canvas;
}
function waterPatch(plate, x, y, w, h, falling) {
  const texture = surface(w, h), mask = surface(w, h), frame = surface(w, h);
  const paint = texture.getContext('2d');
  paint.drawImage(plate, x, y, w, h, 0, 0, w, h);
  const pixels = paint.getImageData(0, 0, w, h);
  for (let row = 0; row < h; row++) for (let col = 0; col < w; col++) {
    const at = (row * w + col) * 4;
    const r = pixels.data[at], g = pixels.data[at + 1], b = pixels.data[at + 2];
    const light = (r + g + b) / 3;
    const edge = clamp(Math.min(col / 14, (w - col - 1) / 14, row / 12, (h - row - 1) / 12));
    // Only the existing pale water is displaced, never nearby red trees/rocks.
    const water = clamp((light - (falling ? 125 : 150)) / 65) * clamp(1 - (Math.max(r, g, b) - Math.min(r, g, b)) / 48);
    pixels.data[at + 3] = Math.round(255 * edge * water);
  }
  mask.getContext('2d').putImageData(pixels, 0, 0);
  return { x, y, w, h, texture, mask, frame, ctx: frame.getContext('2d') };
}
export function prepareHeroScene(plate) {
  waterfall = waterPatch(plate, 442, 707, 140, 177, true);
  river = waterPatch(plate, 390, 867, 1040, 74, false);
  clouds = surface(420, 215);
  const c = clouds.getContext('2d');
  c.drawImage(plate, 690, 65, 420, 215, 0, 0, 420, 215);
  c.globalCompositeOperation = 'destination-in';
  const mask = c.createRadialGradient(210, 105, 15, 210, 105, 200);
  mask.addColorStop(0, '#000'); mask.addColorStop(1, 'transparent');
  c.fillStyle = mask; c.fillRect(0, 0, 420, 215);
}
export function heroSceneState(calm) {
  if (calm || !hero) return { strength: 0, progress: 0 };
  const rect = hero.getBoundingClientRect();
  // Exactly zero below the hero: the existing atmosphere elsewhere is intact.
  const strength = clamp(rect.bottom / innerHeight);
  const progress = clamp(-rect.top / Math.max(1, rect.height - innerHeight));
  return { strength: strength * strength * (3 - 2 * strength), progress };
}
export function paintHeroScene(ctx, time, strength, mobile) {
  if (!strength || !waterfall) return;
  ctx.save();
  // An actual cloud-texture layer, moving more slowly than the foreground.
  ctx.globalAlpha = strength * .22;
  ctx.drawImage(clouds, 690 + Math.sin(time / 28) * 11, 65 + Math.sin(time / 37) * 3);

  const fall = waterfall, f = fall.ctx;
  f.clearRect(0, 0, fall.w, fall.h);
  f.globalCompositeOperation = 'source-over';
  const travel = (time * 29) % fall.h;
  f.drawImage(fall.texture, Math.sin(time * .8) * 1.2, travel);
  f.drawImage(fall.texture, Math.sin(time * .8) * 1.2, travel - fall.h);
  f.globalCompositeOperation = 'destination-in';
  f.drawImage(fall.mask, 0, 0);
  ctx.globalAlpha = strength * .34;
  ctx.drawImage(fall.frame, fall.x, fall.y);

  const water = river, r = water.ctx;
  r.clearRect(0, 0, water.w, water.h);
  r.globalCompositeOperation = 'source-over';
  for (let row = 0; row < water.h; row += 3) {
    const offset = Math.sin(row * .22 - time * 1.3) * (1.2 + row * .035);
    r.drawImage(water.texture, 0, row, water.w, Math.min(3, water.h - row), offset, row, water.w, Math.min(3, water.h - row));
  }
  r.globalCompositeOperation = 'destination-in';
  r.drawImage(water.mask, 0, 0);
  ctx.globalAlpha = strength * .38;
  ctx.drawImage(water.frame, water.x, water.y);

  // Thin elliptical veils drift through the valley, not across the whole sky.
  for (let i = 0; i < 3; i++) {
    ctx.save();
    ctx.translate(770 + i * 150 + Math.sin(time / (17 + i * 5) + i) * 50, 490 + i * 100);
    ctx.scale(1, .22);
    const fog = ctx.createRadialGradient(0, 0, 8, 0, 0, 250);
    fog.addColorStop(0, `rgba(233,230,225,${strength * (.075 + Math.sin(time / 13 + i) * .012)})`);
    fog.addColorStop(1, 'transparent');
    ctx.globalAlpha = 1; ctx.fillStyle = fog; ctx.fillRect(-250, -250, 500, 500);
    ctx.restore();
  }
  const count = mobile ? 5 : 8;
  for (let i = 0; i < count; i++) {
    const phase = (time / (19 + i * 2.1) + i * .173) % 1;
    const size = mobile ? 8 + i % 3 : 4.5 + i % 4;
    ctx.save();
    ctx.translate(130 + i * (1450 / count) + Math.sin(phase * 6 + i) * 42 + phase * 55, 320 + phase * 575);
    ctx.rotate(Math.sin(phase * 5 + i) * .7 + phase * 2);
    ctx.scale(size, size * (.5 + Math.abs(Math.sin(time * .45 + i)) * .5));
    ctx.globalAlpha = strength * .68 * Math.sin(phase * Math.PI);
    ctx.fillStyle = i % 2 ? '#cf1621' : '#a6111a';
    ctx.beginPath();
    ctx.moveTo(0, -1); ctx.lineTo(.23, -.35); ctx.lineTo(.8, -.6);
    ctx.lineTo(.55, 0); ctx.lineTo(1, .25); ctx.lineTo(.25, .45);
    ctx.lineTo(0, .9); ctx.lineTo(-.25, .4); ctx.lineTo(-.8, .25);
    ctx.lineTo(-.5, -.15); ctx.lineTo(-.65, -.6); ctx.lineTo(-.2, -.35);
    ctx.closePath(); ctx.fill(); ctx.restore();
  }
  ctx.restore();
}
export function disposeHeroScene() { waterfall = river = clouds = null; }
