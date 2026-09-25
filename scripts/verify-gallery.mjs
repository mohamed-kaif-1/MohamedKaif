import { pathToFileURL } from 'node:url';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
const {chromium} = await import(pathToFileURL(process.env.PLAYWRIGHT_PATH));
const baseline = process.argv.includes('--baseline');
const output = 'C:/tmp/kaif-gallery-qa';
await mkdir(output,{recursive:true});
const browser = await chromium.launch({channel:'msedge',headless:true});
const hash = buffer => createHash('sha256').update(buffer).digest('hex');
const errors=[];
try {
  const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://localhost:4000/',{waitUntil:'networkidle'});
  await page.evaluate(()=>document.fonts.ready);
  const record={};
  for(const [name,selector] of Object.entries({hero:'.hero-stage',navigation:'.navigation',archive:'.project-archive',about:'.about',achievements:'.achievements',contact:'.contact'})) {
    const el=page.locator(selector);
    if(name!=='navigation') await el.scrollIntoViewIfNeeded();
    await page.waitForTimeout(200);
    record[name]={html:await el.evaluate(el=>el.outerHTML),image:hash(await el.screenshot({path:`${output}/${baseline?'before':'after'}-${name}.png`}))};
  }
  await page.locator('#build-poneglyph .project-visual').click();
  await page.waitForTimeout(200);
  record.case={html:await page.locator('.case-content').evaluate(el=>el.outerHTML),image:hash(await page.screenshot({path:`${output}/${baseline?'before':'after'}-case.png`}))};
  if(baseline) {
    await writeFile(output+'/baseline.json',JSON.stringify(record));
    console.log('Saved protected-section visual and DOM baselines.');
  } else {
    const before=JSON.parse(await readFile(output+'/baseline.json','utf8'));
    for(const name of Object.keys(record)) {
      assert.equal(record[name].html,before[name].html,`${name}: DOM changed`);
      assert.equal(record[name].image,before[name].image,`${name}: pixels changed`);
    }
    await page.keyboard.press('Escape');
    assert.deepEqual(errors,[]);
    console.log('Protected sections and case study: identical DOM and screenshots.');
  }
} finally {await browser.close();}
