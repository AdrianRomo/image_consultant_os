// Shared Playwright helpers for the ICOS visual audit. Run with NODE_PATH=/usr/share/nodejs
const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

const VIEWPORTS = [
  { w: 1440, h: 900 },
  { w: 1024, h: 768 },
  { w: 768, h: 1024 },
  { w: 390, h: 844 },
];

async function launch() {
  try {
    return await chromium.launch();
  } catch (e) {
    return await chromium.launch({ executablePath: "/usr/bin/google-chrome" });
  }
}

async function newPage(browser, vp, opts = {}) {
  const ctx = await browser.newContext({
    viewport: { width: vp.w, height: vp.h },
    deviceScaleFactor: 1,
    hasTouch: vp.w < 800,
    isMobile: vp.w < 500,
    reducedMotion: opts.reducedMotion ? "reduce" : "no-preference",
    locale: opts.locale || "en-US",
  });
  const page = await ctx.newPage();
  const errors = [];
  page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
  page.on("pageerror", (e) => errors.push("pageerror: " + e.message));
  page._errors = errors;
  return page;
}

// Scroll through so IntersectionObserver reveals fire, then return to top.
async function sweep(page) {
  const h = await page.evaluate(() => document.documentElement.scrollHeight);
  const step = Math.max(300, Math.floor((await page.evaluate(() => innerHeight)) * 0.6));
  for (let y = 0; y < h; y += step) {
    await page.evaluate((yy) => window.scrollTo(0, yy), y);
    await page.waitForTimeout(90);
  }
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await page.waitForTimeout(500);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(500);
}

async function go(page, url, settle = 1600) {
  await page.goto(url, { waitUntil: "networkidle" });
  await page.waitForTimeout(settle); // page curtain / rise animations
}

async function fullpage(page, file) {
  await sweep(page);
  await page.screenshot({ path: file, fullPage: true });
  const dims = await page.evaluate(() => ({ w: document.documentElement.scrollWidth, h: document.documentElement.scrollHeight, cw: document.documentElement.clientWidth }));
  return dims;
}

// Cut a full-page PNG into slices of sliceH px, saved as file-sNN.png
async function slice(browser, file, W, H, sliceH) {
  const n = Math.ceil(H / sliceH);
  const ctx = await browser.newContext({ viewport: { width: W, height: sliceH } });
  const p = await ctx.newPage();
  const b64 = fs.readFileSync(file).toString("base64");
  const out = [];
  for (let i = 0; i < n; i++) {
    await p.setContent(`<body style="margin:0;background:#fff"><div style="width:${W}px;height:${sliceH}px;background:url(data:image/png;base64,${b64}) 0 -${i * sliceH}px no-repeat"></div></body>`);
    const f = file.replace(/\.png$/, `-s${String(i + 1).padStart(2, "0")}.png`);
    await p.screenshot({ path: f });
    out.push(f);
  }
  await ctx.close();
  return out;
}

// Contact sheet: lay slices out in `cols` columns to inspect long mobile pages in one image.
async function sheet(browser, file, W, H, sliceH, cols) {
  const n = Math.ceil(H / sliceH);
  const gap = 16;
  const ctx = await browser.newContext({ viewport: { width: cols * W + (cols + 1) * gap, height: sliceH + 2 * gap } });
  const p = await ctx.newPage();
  const b64 = fs.readFileSync(file).toString("base64");
  const outs = [];
  for (let start = 0; start < n; start += cols) {
    let html = `<body style="margin:0;background:#888;display:flex;gap:${gap}px;padding:${gap}px">`;
    for (let c = 0; c < cols && start + c < n; c++) {
      html += `<div style="flex:none;width:${W}px;height:${sliceH}px;background:url(data:image/png;base64,${b64}) 0 -${(start + c) * sliceH}px no-repeat"></div>`;
    }
    html += "</body>";
    await p.setContent(html);
    const f = file.replace(/\.png$/, `-sheet${String(start / cols + 1).padStart(2, "0")}.png`);
    await p.screenshot({ path: f });
    outs.push(f);
  }
  await ctx.close();
  return outs;
}

module.exports = { VIEWPORTS, launch, newPage, sweep, go, fullpage, slice, sheet };
