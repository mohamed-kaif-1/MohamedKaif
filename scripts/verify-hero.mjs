import { pathToFileURL } from "node:url";
import { mkdir } from "node:fs/promises";
import assert from "node:assert/strict";
const { chromium } = await import(pathToFileURL(process.env.PLAYWRIGHT_PATH));
const browser = await chromium.launch({ channel: "msedge", headless: true });
const output = "C:/tmp/kaif-hero-qa";
await mkdir(output, { recursive: true });
const errors = [];
async function scrollPhase(page, progress, extra = 0) {
  await page.evaluate(
    ({ progress, extra }) => {
      const trigger = ScrollTrigger.getById("hero-sequence");
      window.scrollTo(
        0,
        trigger.start +
          (trigger.end - trigger.start) * progress +
          extra * innerHeight,
      );
    },
    { progress, extra },
  );
  await page.waitForTimeout(1400);
}
try {
  for (const [name, width, height] of [
    ["desktop", 1440, 1000],
    ["mobile", 390, 844],
  ]) {
    const page = await browser.newPage({
      viewport: { width, height },
      isMobile: name === "mobile",
      hasTouch: name === "mobile",
    });
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("response", (r) => {
      if (r.status() >= 400) errors.push(r.status() + " " + r.url());
    });
    await page.goto("http://localhost:4000/", { waitUntil: "networkidle" });
    await page.locator(".intro-film").waitFor({ state: "detached" });
    await page.waitForTimeout(1500);
    const geometry = await page.evaluate(() => {
      const name = document.querySelector(".hero-name").getBoundingClientRect();
      const portrait = document
        .querySelector(".hero-portrait-depth")
        .getBoundingClientRect();
      return {
        nameCenter: name.x + name.width / 2,
        photoCenter: portrait.x + portrait.width / 2,
        screen: innerWidth,
      };
    });
    assert.ok(Math.abs(geometry.nameCenter - geometry.screen / 2) < 2);
    assert.ok(Math.abs(geometry.photoCenter - geometry.screen / 2) < 2);
    assert.equal(
      await page
        .locator(".hero-photo img")
        .evaluateAll((imgs) =>
          imgs.every((i) => i.complete && i.naturalWidth > 0),
        ),
      true,
    );
    assert.equal(
      await page
        .locator(".hero-photo img")
        .evaluateAll((imgs) => new Set(imgs.map((i) => i.src)).size),
      3,
    );
    await page.screenshot({ path: output + "/" + name + "-initial.png" });
    await scrollPhase(page, 0.4);
    assert.ok(
      await page
        .locator(".hero-photo-second")
        .evaluate((el) => +getComputedStyle(el).opacity > 0.95),
    );
    await page.screenshot({ path: output + "/" + name + "-photo2.png" });
    await scrollPhase(page, 0.66);
    assert.ok(
      await page
        .locator(".hero-photo-third")
        .evaluate((el) => +getComputedStyle(el).opacity > 0.95),
    );
    await page.screenshot({ path: output + "/" + name + "-photo3.png" });
    await scrollPhase(page, 1, 0.35);
    const bridge = await page.locator("#work").boundingBox();
    assert.ok(bridge.y > 0 && bridge.y < height);
    await page.screenshot({ path: output + "/" + name + "-bridge.png" });
    await scrollPhase(page, 0);
    assert.ok(
      await page
        .locator(".hero-photo-first")
        .evaluate((el) => +getComputedStyle(el).opacity > 0.95),
    );
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
      false,
    );
    await page.locator(".hero-meta a").click();
    await page.waitForTimeout(1500);
    assert.equal(new URL(page.url()).hash, "#work");
    assert.ok(Math.abs((await page.locator("#work").boundingBox()).y) < 120);
    await page.close();
  }
  const calm = await browser.newPage({
    viewport: { width: 320, height: 640 },
    reducedMotion: "reduce",
  });
  await calm.goto("http://localhost:4000/", { waitUntil: "networkidle" });
  assert.equal(
    await calm.evaluate(() => !!ScrollTrigger.getById("hero-sequence")),
    false,
  );
  assert.equal(await calm.locator(".hero-photo-first").isVisible(), true);
  assert.equal(await calm.locator(".hero-photo-second").isVisible(), false);
  assert.equal(
    await calm.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
    false,
  );
  await calm.screenshot({ path: output + "/small-reduced.png" });
  assert.deepEqual(errors, []);
  console.log(
    JSON.stringify(
      {
        success: true,
        checks: [
          "centered composition",
          "three loaded real assets",
          "desktop/mobile photo phases",
          "continuous bridge",
          "reverse scroll",
          "work CTA",
          "reduced motion",
          "no overflow or runtime errors",
        ],
        screenshots: output,
      },
      null,
      2,
    ),
  );
} finally {
  await browser.close();
}
