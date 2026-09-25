import { pathToFileURL } from 'node:url';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
const { chromium } = await import(pathToFileURL(process.env.PLAYWRIGHT_PATH));
const output = 'C:/tmp/kaif-project-world-qa';
await mkdir(output, { recursive: true });
const baseline = process.argv.includes('--baseline');
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const errors = [];
const normalize = value => value.replace(/style="([^"]*)"/g, (_, css) => `style="${css.split(';').map(s => s.trim()).filter(Boolean).sort().join(';')}"`);
try {
  const calm = await browser.newPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
  await calm.goto('http://localhost:4000/', { waitUntil: 'networkidle' });
  await calm.evaluate(() => document.fonts.ready);
  const record = await calm.evaluate(() => Object.fromEntries(['.hero', '.navigation', '.project-archive', '.about', '.achievements', '.contact', '#mobile-menu', '.ambient-toggle'].map(selector => [selector, document.querySelector(selector).outerHTML])));
  await calm.evaluate(() => { location.hash = 'project=sheproof'; });
  await calm.locator('.case-study[open]').waitFor();
  record.case = await calm.locator('.case-content').evaluate(el => el.outerHTML);
  if (baseline) {
    await writeFile(output + '/protected.json', JSON.stringify(record));
    console.log('Protected hero, sections, archive, menu, sound and project route baseline saved.');
  } else {
    const before = JSON.parse(await readFile(output + '/protected.json', 'utf8'));
    for (const key of Object.keys(record)) assert.equal(normalize(record[key]), normalize(before[key]), key + ' changed');
    await calm.keyboard.press('Escape');
    assert.equal(await calm.locator('.world-item').count(), 6);
    assert.equal(await calm.locator('.project-world-canvas').count(), 0);
    await calm.locator('#build-poneglyph a').click();
    await calm.locator('.case-study[open]').waitFor();
    assert.equal(await calm.locator('#case-title').textContent(), 'Poneglyph');
    for (const [name, width, height] of [['desktop', 1440, 1000], ['mobile', 390, 844]]) {
      const page = await browser.newPage({ viewport: { width, height }, isMobile: name === 'mobile', hasTouch: name === 'mobile' });
      page.on('pageerror', e => errors.push(e.message));
      page.on('console', e => { if (e.type() === 'error') errors.push(e.text()); });
      await page.goto('http://localhost:4000/', { waitUntil: 'networkidle' });
      await page.locator('.intro-film').waitFor({ state: 'detached' });
      await page.locator('.project-gallery[data-world="ready"]').waitFor();
      assert.equal(await page.locator('.project-world-canvas').count(), 1);
      assert.equal(await page.evaluate(() => ScrollTrigger.getAll().filter(t => t.vars.id === 'project-world').length), 1);
      for (const [label, progress] of [['waterfall', .1], ['tree', .26], ['pagoda', .42], ['river', .58], ['mountain', .74], ['foreground', .9], ['backward', .26]]) {
        await page.evaluate(progress => { const s = ScrollTrigger.getById('project-world'); scrollTo(0, s.start + (s.end - s.start) * progress); }, progress);
        await page.waitForTimeout(2100);
        const state = await page.locator('.project-gallery').evaluate(el => ({ active: el.dataset.activeProject, progress: +el.dataset.cameraProgress, overflow: document.documentElement.scrollWidth > innerWidth }));
        assert.ok(Math.abs(state.progress - progress) < .035, JSON.stringify(state));
        assert.equal(state.overflow, false);
        await page.screenshot({ path: `${output}/${name}-${label}.png` });
      }
      const stillCamera = await page.locator('.project-gallery').getAttribute('data-camera-position');
      const imageA = await page.locator('.project-world-canvas').screenshot();
      await page.waitForTimeout(650);
      const imageB = await page.locator('.project-world-canvas').screenshot();
      assert.notEqual(imageA.toString('base64'), imageB.toString('base64'), 'Environment must animate while idle');
      console.log(name, 'idle camera', stillCamera);
      await page.mouse.wheel(0, 160);
      await page.waitForTimeout(1000);
      await page.mouse.wheel(0, -95);
      await page.waitForTimeout(1000);
      await page.getByRole('button', { name: 'Focus Poneglyph' }).click();
      await page.waitForTimeout(2200);
      await page.locator('#build-poneglyph a').click();
      await page.locator('.case-study[open]').waitFor();
      assert.equal(await page.locator('#case-title').textContent(), 'Poneglyph');
      await page.keyboard.press('Escape');
      await page.waitForTimeout(1200);
      await page.setViewportSize({ width: name === 'mobile' ? 844 : 1024, height: name === 'mobile' ? 390 : 768 });
      await page.waitForTimeout(1500);
      assert.equal(await page.locator('.project-world-canvas').count(), 1);
      await page.locator('#about').scrollIntoViewIfNeeded();
      await page.waitForTimeout(1600);
      assert.equal(await page.locator('.ink-environment').getAttribute('data-project-world-active'), null);
      assert.equal(await page.locator('.project-world-canvas').evaluate(el => +el.style.opacity), 0);
      await page.close();
    }
    const fallback = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await fallback.addInitScript(() => { const original = HTMLCanvasElement.prototype.getContext; HTMLCanvasElement.prototype.getContext = function(type, ...args) { return type === 'webgl2' ? null : original.call(this, type, ...args); }; });
    await fallback.goto('http://localhost:4000/', { waitUntil: 'networkidle' });
    await fallback.locator('.project-gallery[data-world="fallback"]').waitFor();
    assert.equal(await fallback.locator('.world-item a').count(), 6);
    assert.deepEqual(errors, []);
    console.log('PASS: protected sections unchanged; one scene/trigger; six shots; reverse/wheel/resize; idle animation; routes; reduced-motion and no-WebGL fallback; free section exit.');
  }
} finally { await browser.close(); }
