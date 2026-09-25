import {pathToFileURL} from 'node:url';
import {mkdir} from 'node:fs/promises';
import assert from 'node:assert/strict';
const {chromium}=await import(pathToFileURL(process.env.PLAYWRIGHT_PATH));
const browser=await chromium.launch({channel:'msedge',headless:true});
const output='C:/tmp/kaif-ink-qa';
await mkdir(output,{recursive:true});
const errors=[];
try {
  for(const [name,width,height] of [['desktop',1440,1000],['mobile',390,844],['ultrawide',2560,1080]]) {
    const page=await browser.newPage({viewport:{width,height},isMobile:name==='mobile',hasTouch:name==='mobile'});
    page.on('pageerror',e=>errors.push(e.message));
    page.on('response',r=>{if(r.status()>=400&&r.url().includes('localhost')) errors.push(r.status()+' '+r.url());});
    await page.goto('http://localhost:4000/',{waitUntil:'networkidle'});
    await page.locator('.intro-film').waitFor({state:'detached'});
    await page.waitForFunction(()=>document.documentElement.classList.contains('landscape-ready'));
    await page.waitForTimeout(1600);
    assert.equal(await page.locator('.ambient-toggle').getAttribute('aria-pressed'),'false');
    const geometry=await page.evaluate(()=>{
      const first=document.querySelector('.hero-name .hero-first'),last=document.querySelector('.hero-name .hero-last');
      const range=document.createRange();range.selectNodeContents(first);const a=range.getBoundingClientRect();range.selectNodeContents(last);const b=range.getBoundingClientRect();
      return {firstWidth:a.width/innerWidth,lastWidth:b.width/innerWidth,firstTop:a.top,lastBottom:b.bottom,viewportHeight:innerHeight,overflow:document.documentElement.scrollWidth>innerWidth};
    });
    console.log(name,geometry);
    assert.ok(geometry.firstWidth>.85&&geometry.firstWidth<1.01);
    assert.ok(geometry.lastWidth>.85&&geometry.lastWidth<1.03);
    assert.equal(geometry.overflow,false);
    await page.screenshot({path:`${output}/${name}-hero.png`});
    const start=+await page.locator('.ink-environment').getAttribute('data-sun-progress');
    await page.evaluate(()=>{const t=ScrollTrigger.getById('hero-sequence');scrollTo(0,t.end*.5);});
    await page.waitForTimeout(1400);
    await page.screenshot({path:`${output}/${name}-scroll.png`});
    assert.ok(+await page.locator('.ink-environment').getAttribute('data-sun-progress')>start);
    await page.evaluate(()=>scrollTo(0,document.documentElement.scrollHeight));
    await page.waitForTimeout(1500);
    assert.ok(+await page.locator('.ink-environment').getAttribute('data-sun-progress')>.98);
    await page.screenshot({path:`${output}/${name}-contact.png`});
    if(name==='desktop') {
      await page.locator('.ambient-toggle').click();
      await page.waitForTimeout(100);
      assert.equal(await page.locator('.ambient-toggle').getAttribute('aria-pressed'),'true');
      await page.locator('.ambient-toggle').click();
      assert.equal(await page.locator('.ambient-toggle').getAttribute('aria-pressed'),'false');
      assert.equal(await page.evaluate(()=>sessionStorage.getItem('kaif-garden-sound')),'off');
      await page.reload({waitUntil:'networkidle'});
      await page.locator('.intro-film').waitFor({state:'detached'});
      await page.waitForTimeout(1500);
      await page.locator('.hero-meta .text-link').click();
      await page.waitForTimeout(1300);
      assert.equal(await page.locator('.ambient-toggle').getAttribute('aria-pressed'),'false');
    }
    await page.close();
  }
  const calm=await browser.newPage({viewport:{width:320,height:640},reducedMotion:'reduce'});
  calm.on('pageerror',e=>errors.push(e.message));
  await calm.goto('http://localhost:4000/',{waitUntil:'networkidle'});
  await calm.waitForFunction(()=>document.documentElement.classList.contains('landscape-ready'));
  const pixelA=await calm.locator('.ink-canvas').screenshot();
  await calm.waitForTimeout(700);
  const pixelB=await calm.locator('.ink-canvas').screenshot();
  assert.ok(pixelA.equals(pixelB),'Reduced motion backdrop should not animate at rest');
  await calm.screenshot({path:output+'/small-reduced.png'});
  assert.deepEqual(errors,[]);
  console.log('PASS: fitted name, three viewports, sunrise, audio toggle/session preference, reduced motion, no browser errors.');
} finally {await browser.close();}
