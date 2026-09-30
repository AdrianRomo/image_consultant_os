// Behaviour with no View Transitions API (Firefox < 144, older Safari): navigation must still work, no errors.
const L = require("./lib"); const base = process.argv[2];
(async () => {
  const b = await L.launch(); const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  await ctx.addInitScript(() => { try { delete Document.prototype.startViewTransition; } catch (e) {} Object.defineProperty(document, "startViewTransition", { value: undefined, configurable: true }); });
  const p = await ctx.newPage(); const errs = []; p.on("console", (m) => m.type() === "error" && errs.push(m.text())); p.on("pageerror", (e) => errs.push(e.message));
  await p.goto(base + "/", { waitUntil: "networkidle" });
  console.log("startViewTransition present:", await p.evaluate(() => typeof document.startViewTransition));
  await p.locator("a[data-cursor='Open']").first().click();
  await p.waitForURL("**/clients/marisol", { timeout: 8000 });
  await p.waitForTimeout(800);
  const ok = await p.evaluate(() => ({ h1: document.querySelector("h1")?.getAttribute("aria-label"), img: document.querySelector("#identity img")?.complete && document.querySelector("#identity img").naturalWidth > 0 }));
  console.log("arrived:", JSON.stringify(ok));
  await p.click("button[aria-label^='Observation 2']", { force: true }).catch(() => {});
  await p.goBack(); await p.waitForURL(base + "/", { timeout: 8000 });
  console.log("back to studio ok; errors:", errs.length ? errs : "none"); await b.close();
})();
