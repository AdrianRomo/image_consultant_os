// Interaction-state captures. Usage: node audit-states.js <baseUrl> <outDir>
const L = require("./lib");
const path = require("path");
const fs = require("fs");
const base = process.argv[2];
const out = process.argv[3];
fs.mkdirSync(out, { recursive: true });
const f = (n) => path.join(out, n + ".png");

async function withPage(browser, vp, fn, opts) {
  const page = await L.newPage(browser, vp, opts);
  try { await fn(page); } catch (e) { console.log("STATE FAIL", e.message.split("\n")[0]); }
  if (page._errors.length) console.log("console errors:", page._errors.slice(0, 2));
  await page.context().close();
}

(async () => {
  const b = await L.launch();
  const D = { w: 1440, h: 900 }, M = { w: 390, h: 844 };

  // --- Studio hover + focus
  await withPage(b, D, async (p) => {
    await L.go(p, base + "/");
    await p.evaluate(() => document.getElementById("clients").scrollIntoView());
    await p.waitForTimeout(900);
    await p.locator("a[data-cursor='Open']").first().hover({ force: true });
    await p.waitForTimeout(700);
    await p.screenshot({ path: f("state-studio-row-hover-1440") });
  });
  await withPage(b, D, async (p) => {
    await L.go(p, base + "/");
    for (let i = 0; i < 3; i++) await p.keyboard.press("Tab");
    await p.waitForTimeout(400);
    await p.screenshot({ path: f("state-focus-nav-1440"), clip: { x: 0, y: 0, width: 1440, height: 120 } });
    for (let i = 0; i < 6; i++) await p.keyboard.press("Tab");
    await p.waitForTimeout(400);
    await p.screenshot({ path: f("state-focus-body-1440") });
  });

  // --- Command palette
  for (const vp of [D, M]) {
    await withPage(b, vp, async (p) => {
      await L.go(p, base + "/clients/marisol");
      await p.keyboard.press("Control+k");
      await p.waitForTimeout(500);
      await p.screenshot({ path: f(`state-palette-${vp.w}`) });
      await p.keyboard.type("war");
      await p.waitForTimeout(300);
      await p.screenshot({ path: f(`state-palette-typed-${vp.w}`) });
      await p.keyboard.press("Escape");
    });
  }

  // --- Wardrobe: filter, hover, drawer
  await withPage(b, D, async (p) => {
    await L.go(p, base + "/wardrobe");
    await p.click("button:has-text('Outerwear')");
    await p.waitForTimeout(800);
    await p.screenshot({ path: f("state-wardrobe-filter-1440") });
    await p.click("button:has-text('All')");
    await p.waitForTimeout(600);
    await p.evaluate(() => window.scrollTo(0, 500)); await p.waitForTimeout(500); await p.locator("button[aria-label^='Camel wrap coat']").hover({ force: true });
    await p.waitForTimeout(900);
    await p.screenshot({ path: f("state-wardrobe-hover-1440") });
    await p.locator("button[aria-label^='Camel wrap coat']").click({ force: true });
    await p.waitForTimeout(900);
    await p.screenshot({ path: f("state-wardrobe-drawer-1440") });
  });
  await withPage(b, M, async (p) => {
    await L.go(p, base + "/wardrobe");
    await p.click("button[aria-label^='Camel wrap coat']");
    await p.waitForTimeout(900);
    await p.screenshot({ path: f("state-wardrobe-drawer-390") });
  });

  // --- Looks: default, ask, empty, miss
  await withPage(b, D, async (p) => {
    await L.go(p, base + "/looks?ask=camera");
    await p.screenshot({ path: f("state-looks-ask-1440") });
    await p.fill("#ask", "a wedding in the mountains");
    await p.press("#ask", "Enter");
    await p.waitForTimeout(500);
    await p.screenshot({ path: f("state-looks-miss-1440") });
  });
  await withPage(b, D, async (p) => {
    await L.go(p, base + "/looks?look=look-camera");
    // remove every chosen piece to reach the empty state
    for (const slot of ["Outer layer", "Top", "Watch"]) {
      await p.click(`[role=tab]:has-text('${slot}')`);
      await p.waitForTimeout(150);
      const chosen = p.locator("ul.no-scrollbar button[aria-pressed='true']");
      if (await chosen.count()) await chosen.first().click();
      await p.waitForTimeout(200);
    }
    await p.waitForTimeout(500);
    await p.screenshot({ path: f("state-looks-empty-1440") });
  });
  await withPage(b, M, async (p) => {
    await L.go(p, base + "/looks?ask=board");
    await L.fullpage(p, f("state-looks-ask-390"));
  });

  // --- Client story: observation select, colour select
  await withPage(b, D, async (p) => {
    await L.go(p, base + "/clients/marisol");
    await p.locator("#presence").scrollIntoViewIfNeeded();
    await p.evaluate(() => document.getElementById("assessment").scrollIntoView());
    await p.evaluate(() => window.scrollBy(0, -60));
    await p.waitForTimeout(1200);
    await p.click("button[aria-label^='Observation 2']");
    await p.waitForTimeout(900);
    await p.screenshot({ path: f("state-observation-2-1440") });
  });
  await withPage(b, D, async (p) => {
    await L.go(p, base + "/clients/marisol");
    await p.evaluate(() => document.getElementById("colour").scrollIntoView());
    await p.waitForTimeout(1200);
    await p.click("button[aria-label^='Rust']");
    await p.waitForTimeout(1200);
    await p.screenshot({ path: f("state-color-rust-1440") });
  });
  await withPage(b, M, async (p) => {
    await L.go(p, base + "/clients/marisol");
    await p.evaluate(() => document.getElementById("assessment").scrollIntoView());
    await p.evaluate(() => window.scrollBy(0, 0));
    await p.waitForTimeout(1200);
    await p.screenshot({ path: f("state-observation-portrait-390") });
    // Phones have no on-picture markers: the sticky focus window follows the note you open.
    await p.click("button[aria-controls='obs-obs-2']");
    await p.waitForTimeout(900);
    await p.screenshot({ path: f("state-observation-after-tap-390") });
  });

  // --- Error / 404, mobile fold of Studio
  await withPage(b, D, async (p) => {
    await p.goto(base + "/clients/nobody", { waitUntil: "networkidle" });
    await p.waitForTimeout(800);
    await p.screenshot({ path: f("state-404-1440") });
  });
  await withPage(b, M, async (p) => {
    await L.go(p, base + "/");
    await p.screenshot({ path: f("state-studio-fold-390") });
  });

  // --- Reduced motion (page still legible, no reveals hidden)
  await withPage(b, D, async (p) => {
    await L.go(p, base + "/clients/marisol", 400);
    await p.evaluate(() => window.scrollTo(0, 2400));
    await p.waitForTimeout(300);
    await p.screenshot({ path: f("state-reduced-motion-1440") });
  }, { reducedMotion: true });

  await b.close();
})();
