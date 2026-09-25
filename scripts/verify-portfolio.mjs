// Run with PLAYWRIGHT_PATH pointing at an installed Playwright package.
import { pathToFileURL } from "node:url";
import { mkdir } from "node:fs/promises";
import assert from "node:assert/strict";
const { chromium } = await import(
  pathToFileURL(process.env.PLAYWRIGHT_PATH).href
);
const browser = await chromium.launch({ channel: "msedge", headless: true });
const output = process.env.QA_OUTPUT || "C:/tmp/kaif-red-qa";
await mkdir(output, { recursive: true });
const errors = [];
async function archiveAt(page, progress) {
  await page.evaluate((progress) => {
    const trigger = window.ScrollTrigger.getById("project-archive");
    window.scrollTo(
      0,
      trigger.start + (trigger.end - trigger.start) * progress,
    );
  }, progress);
  await page.waitForTimeout(1300); // Allow the declared .75-second scrub to settle.
}
async function verifyArchive(page, prefix) {
  assert.equal(await page.locator(".archive-item").count(), 8);
  await archiveAt(page, 0.28);
  assert.equal(
    await page
      .locator(".project-archive")
      .evaluate((el) => el.classList.contains("archive-interactive")),
    true,
  );
  assert.equal(await page.locator(".archive-item[inert]").count(), 0);
  await page.screenshot({ path: output + `/${prefix}-archive-arrival.png` });
  await archiveAt(page, 0.53);
  assert.equal(await page.locator(".archive-item[inert]").count(), 8);
  await page.screenshot({ path: output + `/${prefix}-archive-storing.png` });
  await archiveAt(page, 0.84);
  assert.equal(
    await page.locator(".archive-caption").textContent(),
    "08 selected builds",
  );
  assert.ok(
    await page
      .locator(".archive-caption")
      .evaluate((el) => +getComputedStyle(el).opacity > 0.9),
  );
  await page.screenshot({ path: output + `/${prefix}-archive-stored.png` });
  await archiveAt(page, 0.28);
  assert.equal(await page.locator(".archive-item[inert]").count(), 0);
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
    false,
  );
}
try {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
  });
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("response", (response) => {
    if (response.status() >= 400 && response.url().includes("localhost"))
      errors.push(response.status() + " " + response.url());
  });
  await page.goto("http://localhost:4000/", { waitUntil: "networkidle" });
  await page.locator(".intro-film").waitFor({ state: "detached" });
  await page.waitForTimeout(1600);
  assert.equal(await page.locator("main > section").count(), 5);
  assert.equal(await page.locator(".project-showcase").count(), 8);
  await page.screenshot({ path: output + "/desktop.png" });
  await page
    .locator("#build-poneglyph .project-visual")
    .scrollIntoViewIfNeeded();
  await page.waitForTimeout(1300);
  await page.screenshot({ path: output + "/work.png" });
  await page.locator("#build-poneglyph .project-visual").click();
  await page.waitForTimeout(1800);
  assert.equal(
    await page.locator(".case-study").evaluate((el) => el.open),
    true,
  );
  assert.equal(await page.locator("#case-title").textContent(), "Poneglyph");
  await page.screenshot({ path: output + "/case.png" });
  await page.locator(".case-next").click();
  await page.waitForTimeout(1300);
  assert.equal(await page.locator("#case-title").textContent(), "SheProof");
  await page.keyboard.press("Escape");
  await page.waitForTimeout(1300);
  assert.equal(
    await page.locator(".case-study").evaluate((el) => el.open),
    false,
  );
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
    false,
  );
  await verifyArchive(page, "desktop");
  await page.locator('[data-archive-project="codegarden"] a').focus();
  await page.keyboard.press("Enter");
  await page.waitForTimeout(1400);
  assert.equal(await page.locator("#case-title").textContent(), "Code Garden");
  await page.keyboard.press("Escape");
  await page.waitForTimeout(1400);
  assert.equal(
    await page
      .locator('[data-archive-project="codegarden"] a')
      .evaluate((el) => el === document.activeElement),
    true,
  );
  const mobile = await browser.newPage({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    deviceScaleFactor: 1,
  });
  mobile.on("pageerror", (e) => errors.push(e.message));
  await mobile.goto("http://localhost:4000/", { waitUntil: "networkidle" });
  await mobile.locator(".intro-film").waitFor({ state: "detached" });
  await mobile.waitForTimeout(1600);
  await mobile.screenshot({ path: output + "/mobile.png" });
  await mobile.getByRole("button", { name: "Open menu", exact: true }).click();
  await mobile.waitForTimeout(700);
  assert.equal(
    await mobile.locator("#mobile-menu").evaluate((el) => el.open),
    true,
  );
  await mobile
    .locator("#mobile-menu")
    .getByRole("link", { name: "About", exact: true })
    .click();
  await mobile.waitForTimeout(1400);
  assert.equal(
    await mobile.locator("#mobile-menu").evaluate((el) => el.open),
    false,
  );
  assert.equal(
    await mobile.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
    false,
  );
  await mobile.screenshot({ path: output + "/mobile-about.png" });
  await verifyArchive(mobile, "mobile");
  await archiveAt(mobile, 0.98);
  await mobile.locator("#about").scrollIntoViewIfNeeded();
  await mobile.waitForTimeout(1200);
  await mobile.screenshot({ path: output + "/mobile-archive-exit.png" });
  const calm = await browser.newPage({
    viewport: { width: 390, height: 844 },
    reducedMotion: "reduce",
  });
  calm.on("pageerror", (e) => errors.push(e.message));
  await calm.goto("http://localhost:4000/#project=codegarden", {
    waitUntil: "networkidle",
  });
  assert.equal(
    await calm.locator(".case-study").evaluate((el) => el.open),
    true,
  );
  assert.equal(await calm.locator("#case-title").textContent(), "Code Garden");
  assert.equal(await calm.locator(".cursor").isVisible(), false);
  await calm.screenshot({ path: output + "/mobile-case.png" });
  await calm.keyboard.press("Escape");
  assert.equal(
    await calm.locator(".case-study").evaluate((el) => el.open),
    false,
  );
  await calm.locator(".archive-stage").scrollIntoViewIfNeeded();
  assert.equal(await calm.locator(".archive-item[inert]").count(), 0);
  assert.equal(
    await calm.evaluate(
      () => !!window.ScrollTrigger.getById("project-archive"),
    ),
    false,
  );
  await calm.screenshot({ path: output + "/reduced-archive.png" });
  await page.setViewportSize({ width: 768, height: 1024 });
  await page.waitForTimeout(700);
  await archiveAt(page, 0.28);
  assert.equal(
    await page.evaluate(
      () =>
        window.ScrollTrigger.getAll().filter(
          (t) => t.vars.id === "project-archive",
        ).length,
    ),
    1,
  );
  assert.equal(await page.locator(".archive-item[inert]").count(), 0);
  await page.setViewportSize({ width: 320, height: 640 });
  await page.waitForTimeout(700);
  await archiveAt(page, 0.28);
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
    false,
  );
  const bounds = await page.locator(".archive-item").evaluateAll((elements) =>
    elements.map((el) => {
      const r = el.getBoundingClientRect();
      return { left: r.left, right: r.right };
    }),
  );
  assert.ok(bounds.every((r) => r.left >= 0 && r.right <= 320));
  await page.screenshot({ path: output + "/small-mobile-archive.png" });
  assert.deepEqual(errors, []);
  console.log(
    JSON.stringify(
      {
        success: true,
        checks: [
          "five sections",
          "eight projects",
          "desktop open/next/close",
          "mobile menu",
          "horizontal overflow",
          "reduced motion",
          "direct project link",
          "runtime and HTTP errors",
          "desktop and mobile archive arrival/storage/reversal",
          "archive keyboard case link and focus restoration",
          "reduced-motion archive fallback",
          "responsive resize and 320px archive bounds",
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
