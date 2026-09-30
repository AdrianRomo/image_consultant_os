// Which routes throw console/page errors? node console-scan.js <base> [routes...]
const L = require("./lib");
const base = process.argv[2];
const routes = process.argv.slice(3).length ? process.argv.slice(3) : ["/", "/clients/marisol", "/wardrobe", "/looks", "/looks?ask=board", "/clients/nobody", "/concepts"];
(async () => {
  const b = await L.launch();
  for (const vp of [{ w: 1440, h: 900 }, { w: 390, h: 844 }]) {
    for (const r of routes) {
      const p = await L.newPage(b, vp);
      const resp = await p.goto(base + r, { waitUntil: "networkidle" }).catch((e) => ({ status: () => "ERR " + e.message }));
      await p.waitForTimeout(1200);
      console.log(String(vp.w).padEnd(5), r.padEnd(20), "status", resp.status(), "errors:", p._errors.length ? JSON.stringify(p._errors.map((e) => e.slice(0, 110))) : "none");
      await p.context().close();
    }
  }
  await b.close();
})();
