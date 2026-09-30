// Prove the Studio -> profile portrait morph: sample frames during the navigation and read the animation state.
const L = require("./lib");
const base = process.argv[2], out = process.argv[3];
(async () => {
  const b = await L.launch();
  const p = await L.newPage(b, { w: 1440, h: 900 });
  await L.go(p, base + "/", 1500);
  await p.locator("#clients").scrollIntoViewIfNeeded();
  await p.evaluate(() => document.getElementById("clients").scrollIntoView());
  await p.waitForTimeout(800);
  await p.screenshot({ path: out + "/morph-0-studio.png" });
  // record whether a view transition actually starts, and what it animates
  await p.evaluate(() => {
    window.__vt = { started: 0, names: [] };
    const orig = document.startViewTransition?.bind(document);
    if (orig) document.startViewTransition = (...a) => { window.__vt.started++; const t = orig(...a); t.ready.then(() => { window.__vt.names = document.getAnimations().map((x) => x.effect && x.effect.pseudoElement).filter(Boolean); }).catch(() => {}); return t; };
  });
  const link = p.locator("a[data-cursor='Open']").first();
  await link.click();
  for (const [i, ms] of [[1, 110], [2, 130], [3, 130]]) { await p.waitForTimeout(ms); await p.screenshot({ path: `${out}/morph-${i}.png` }); }
  await p.waitForTimeout(900);
  const info = await p.evaluate(() => ({ url: location.pathname, vt: window.__vt }));
  console.log(JSON.stringify(info));
  console.log("errors:", p._errors.length ? p._errors : "none");
  await b.close();
})();
