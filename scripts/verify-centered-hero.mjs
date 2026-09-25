import { pathToFileURL } from 'node:url';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
const { chromium } = await import(pathToFileURL(process.env.PLAYWRIGHT_PATH));
const output = 'C:/tmp/kaif-centered-hero-qa';
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const baseline = process.argv.includes('--baseline');
const errors = [];
try {
  const calm = await browser.newPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
  await calm.goto('http://localhost:4000/', { waitUntil: 'networkidle' });
  await calm.evaluate(() => document.fonts.ready);
  const protectedState = await calm.evaluate(() => Object.fromEntries(
    ['.navigation', '.selected-work', '.about', '.achievements', '.contact', '#mobile-menu', '.ambient-toggle'].map(selector => {
      const el = document.querySelector(selector);
      return [selector, el.outerHTML];
    })));
  await calm.evaluate(() => { location.hash = 'project=sheproof'; });
  await calm.locator('.case-study[open]').waitFor();
  protectedState.case = await calm.locator('.case-content').evaluate(el => el.outerHTML);
  if (baseline) {
    await writeFile(output + '/protected.json', JSON.stringify(protectedState));
    console.log('Non-hero DOM and project page baseline saved.');
  } else {
    const normalize = record => Object.fromEntries(Object.entries(record).map(([key, html]) =>
      [key, html.replace(/style="([^"]*)"/g, (_, css) => `style="${css.split(';').map(s => s.trim()).filter(Boolean).sort().join(';')}"`)]));
    assert.deepEqual(normalize(protectedState), normalize(JSON.parse(await readFile(output + '/protected.json', 'utf8'))));
    await calm.keyboard.press('Escape');
    for (const [name, width, height] of [['desktop', 1440, 1000], ['mobile', 390, 844], ['ultrawide', 2560, 1080], ['short', 844, 390]]) {
      const page = await browser.newPage({ viewport: { width, height }, isMobile: name === 'mobile', hasTouch: name === 'mobile' });
      page.on('pageerror', e => errors.push(e.message));
      page.on('response', r => { if (r.status() >= 400 && r.url().includes('localhost')) errors.push(r.status() + ' ' + r.url()); });
      await page.goto('http://localhost:4000/', { waitUntil: 'networkidle' });
      await page.locator('.intro-film').waitFor({ state: 'detached' });
      await page.waitForTimeout(1400);
      assert.equal(await page.locator('.hero img').count(), 0);
      assert.equal(await page.locator('.hero h1').count(), 1);
      assert.equal(await page.locator('.hero-first').count(), 1);
      assert.equal(await page.locator('.hero-last').count(), 1);
      assert.equal(await page.locator('.ambient-toggle').getAttribute('aria-pressed'), 'false');
      const a = await page.locator('.ink-canvas').screenshot();
      await page.waitForTimeout(500);
      const b = await page.locator('.ink-canvas').screenshot();
      assert.notEqual(a.toString('base64'), b.toString('base64'), 'Scene should move while idle');
      await page.screenshot({ path: `${output}/${name}-initial.png` });
      for (const progress of [0, .3, .65, .9]) {
        await page.evaluate(progress => { const trigger = ScrollTrigger.getById('hero-sequence'); scrollTo(0, trigger.start + (trigger.end - trigger.start) * progress); }, progress);
        await page.waitForTimeout(1100);
        const state = await page.locator('.hero-composition').evaluate(el => {
          const r = el.getBoundingClientRect(), stage = document.querySelector('.hero-stage').getBoundingClientRect();
          return { dx: r.left + r.width / 2 - (stage.left + stage.width / 2), dy: r.top + r.height / 2 - (stage.top + stage.height / 2), scale: gsap.getProperty(el, 'scaleX'), width: r.width, overflow: document.documentElement.scrollWidth > innerWidth };
        });
        assert.ok(Math.abs(state.dx) < 1 && Math.abs(state.dy) < 1, `${name} center drift: ${JSON.stringify(state)}`);
        assert.equal(state.overflow, false);
        if (progress > 0) assert.ok(state.scale > 1);
        if (progress === .65) await page.screenshot({ path: `${output}/${name}-zoom.png` });
      }
      await page.locator('#build-poneglyph').scrollIntoViewIfNeeded();
      await page.waitForTimeout(1200);
      assert.equal(await page.locator('.gallery-item').count(), 6);
      await page.screenshot({ path: `${output}/${name}-work.png` });
      await page.locator('#about').scrollIntoViewIfNeeded();
      await page.waitForTimeout(800);
      const sceneState = await page.evaluate(async () => (await import('/js/hero-scene.js')).heroSceneState(false));
      assert.equal(sceneState.strength, 0, 'Extra scene motion must stop outside hero');
      await page.close();
    }
    await calm.evaluate(() => scrollTo(0, 0));
    await calm.waitForTimeout(500);
    const a = await calm.locator('.ink-canvas').screenshot();
    await calm.waitForTimeout(500);
    const b = await calm.locator('.ink-canvas').screenshot();
    assert.equal(a.toString('base64'), b.toString('base64'), 'Reduced motion should be still');
    assert.deepEqual(errors, []);
    console.log('PASS: centered zoom at four scroll states / four viewports, no hero images/duplicates, live idle scene, reduced motion, unchanged protected DOM and detail page.');
  }
} finally { await browser.close(); }
