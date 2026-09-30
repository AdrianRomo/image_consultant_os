// Capture every route at 4 viewports: fold + full page. Usage: node audit-pages.js <baseUrl> <outDir> [routes...]
const L = require("./lib");
const path = require("path");
const fs = require("fs");

const base = process.argv[2];
const out = process.argv[3];
const routes = process.argv.slice(4).length ? process.argv.slice(4) : ["/", "/clients/marisol", "/wardrobe", "/looks"];
fs.mkdirSync(out, { recursive: true });

(async () => {
  const browser = await L.launch();
  const report = [];
  for (const vp of L.VIEWPORTS) {
    for (const r of routes) {
      const slug = (r === "/" ? "studio" : r.replace(/^\//, "").replace(/[\/?=&]/g, "-"));
      const page = await L.newPage(browser, vp);
      await L.go(page, base + r);
      const fold = path.join(out, `${slug}-${vp.w}-fold.png`);
      await page.screenshot({ path: fold });
      const full = path.join(out, `${slug}-${vp.w}.png`);
      const dims = await L.fullpage(page, full);
      const overflow = dims.w > dims.cw;
      report.push({ route: r, vp: vp.w, h: dims.h, overflowX: overflow, scrollW: dims.w, errors: page._errors.slice(0, 3) });
      await page.context().close();
    }
  }
  fs.writeFileSync(path.join(out, "report.json"), JSON.stringify(report, null, 2));
  console.table(report.map((x) => ({ route: x.route, vp: x.vp, height: x.h, overflowX: x.overflowX, errs: x.errors.length })));
  await browser.close();
})();
