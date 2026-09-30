// Pixel-diff two builds of the site. node pixdiff.js <urlA> <urlB> [routes...]  (fold + full page, 1440 and 390, animations frozen)
const L = require("./lib");
const [A, B, ...rt] = process.argv.slice(2);
const routes = rt.length ? rt : ["/", "/clients/marisol", "/wardrobe", "/looks", "/looks?ask=board", "/design-lab", "/concepts", "/nope"];
async function shot(b, url, vp) {
  const p = await L.newPage(b, vp, { reducedMotion: true });
  await p.goto(url, { waitUntil: "networkidle" });
  await p.addStyleTag({ content: "*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important} .js .mask,.js .rule-draw{clip-path:none!important;transform:none!important}" });
  await p.waitForTimeout(700);
  await L.sweep(p);
  const buf = await p.screenshot({ fullPage: true }); await p.context().close(); return buf;
}
(async () => {
  const b = await L.launch(); const cmp = await (await b.newContext()).newPage(); let bad = 0;
  for (const vp of [{ w: 1440, h: 900 }, { w: 390, h: 844 }]) for (const r of routes) {
    const [a, c] = [await shot(b, A + r, vp), await shot(b, B + r, vp)];
    const res = await cmp.evaluate(async ([a, c]) => {
      const load = (s) => new Promise((ok) => { const i = new Image(); i.onload = () => ok(i); i.src = "data:image/png;base64," + s; });
      const [x, y] = [await load(a), await load(c)];
      if (x.height !== y.height || x.width !== y.width) return { size: [x.width + "x" + x.height, y.width + "x" + y.height] };
      const cv = (i) => { const k = document.createElement("canvas"); k.width = i.width; k.height = i.height; const g = k.getContext("2d"); g.drawImage(i, 0, 0); return g.getImageData(0, 0, i.width, i.height).data; };
      const [d1, d2] = [cv(x), cv(y)]; let n = 0, max = 0, first = -1;
      for (let i = 0; i < d1.length; i += 4) { const d = Math.abs(d1[i] - d2[i]) + Math.abs(d1[i + 1] - d2[i + 1]) + Math.abs(d1[i + 2] - d2[i + 2]); if (d > 24) { n++; if (first < 0) first = Math.floor(i / 4 / x.width); } if (d > max) max = d; }
      return { diffPx: n, pct: +(100 * n / (d1.length / 4)).toFixed(4), max, firstDiffY: first };
    }, [a.toString("base64"), c.toString("base64")]);
    const ok = res.diffPx === 0; if (!ok) bad++;
    console.log((ok ? "SAME " : "DIFF ") + String(vp.w).padEnd(5) + r.padEnd(20) + JSON.stringify(res));
  }
  await b.close(); process.exit(bad ? 1 : 0);
})();
