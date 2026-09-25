import { pathToFileURL } from 'node:url';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
const { chromium } = await import(pathToFileURL(process.env.PLAYWRIGHT_PATH));
const output = 'C:/tmp/kaif-selected-work-qa';
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const baseline = process.argv.includes('--baseline');
const errors = [];
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
  page.on('pageerror', e => errors.push(e.message));
  await page.goto('http://localhost:4000/', { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  const protectedSelectors = ['.hero', '.navigation', '.project-archive', '.about', '.achievements', '.contact', '#mobile-menu'];
  const record = await page.evaluate(selectors => Object.fromEntries(selectors.map(selector => {
    const el = document.querySelector(selector);
    return [selector, { html: el.outerHTML, color: getComputedStyle(el).color, font: getComputedStyle(el).font, width: el.clientWidth, height: el.clientHeight }];
  })), protectedSelectors);
  await page.screenshot({ path: `${output}/${baseline ? 'before' : 'after'}-hero.png` });
  await page.evaluate(() => { location.hash = 'project=poneglyph'; });
  await page.locator('.case-study[open]').waitFor();
  record.case = await page.locator('.case-content').evaluate(el => el.outerHTML);
  if (baseline) {
    await writeFile(`${output}/protected.json`, JSON.stringify(record));
    console.log('Protected DOM, section dimensions, typography and case baseline saved.');
  } else {
    assert.deepEqual(record, JSON.parse(await readFile(`${output}/protected.json`, 'utf8')), 'Protected section regression');
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('.gallery-item').count(), 6);
    assert.equal(await page.locator('.archive-item').count(), 8);
    for (const width of [1440, 768, 390]) {
      await page.setViewportSize({ width, height: 900 });
      await page.locator('.gallery-item').first().scrollIntoViewIfNeeded();
      await page.screenshot({ path: `${output}/gallery-${width}.png` });
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
      const links = await page.locator('.gallery-item .project-visual').evaluateAll(els => els.map(e => e.getAttribute('href')));
      assert.equal(new Set(links).size, 6);
    }
    await page.locator('.gallery-item').first().locator('.project-visual').click();
    await page.locator('.case-study[open]').waitFor();
    assert.equal(await page.locator('#case-title').textContent(), 'Poneglyph');
    await page.keyboard.press('Escape');
    const motion = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    motion.on('pageerror', e => errors.push(e.message));
    await motion.goto('http://localhost:4000/', { waitUntil: 'networkidle' });
    await motion.locator('.intro-film').waitFor({ state: 'detached' });
    await motion.locator('.gallery-item').nth(2).scrollIntoViewIfNeeded();
    await motion.waitForTimeout(1800);
    await motion.screenshot({ path: `${output}/gallery-motion.png` });
    assert.equal(await motion.locator('.gallery-item.is-active').count(), 1);
    await motion.getByRole('button', { name: 'Overview', exact: true }).click();
    await motion.waitForTimeout(1200);
    await motion.screenshot({ path: `${output}/gallery-overview.png` });
    assert.equal(await motion.locator('.project-gallery').getAttribute('data-layout'), 'overview');
    await motion.getByRole('button', { name: 'Explore', exact: true }).click();
    await motion.locator('#build-codegarden .gallery-title').focus();
    await motion.keyboard.press('Enter');
    await motion.locator('.case-study[open]').waitFor();
    assert.equal(await motion.locator('#case-title').textContent(), 'Code Garden');
    assert.deepEqual(errors, []);
    console.log('PASS: protected sections and case unchanged; desktop/tablet/mobile; overview FLIP; keyboard routing; no JS errors.');
  }
} finally { await browser.close(); }
