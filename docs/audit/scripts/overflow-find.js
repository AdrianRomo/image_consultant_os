const L = require("./lib");
const [base, route, ...ws] = process.argv.slice(2);
(async () => {
  const b = await L.launch();
  for (const w of ws.map(Number)) {
    const p = await L.newPage(b, { w, h: 900 });
    await L.go(p, base + route, 800);
    const bad = await p.evaluate(() => {
      const vw = document.documentElement.clientWidth; const out = [];
      document.querySelectorAll("body *").forEach((el) => {
        const r = el.getBoundingClientRect(); if (r.width === 0) return;
        if (r.right > vw + 1 && !el.closest("[data-scroll-ok], table, iframe")) {
          const cs = getComputedStyle(el); if (cs.position === "fixed") return;
          out.push(`${el.tagName.toLowerCase()}.${(el.className && el.className.toString().slice(0, 60)) || ""} right=${Math.round(r.right)} w=${Math.round(r.width)} :: ${(el.textContent || "").trim().slice(0, 30)}`);
        }
      });
      return { vw, scrollW: document.documentElement.scrollWidth, out: out.slice(0, 10) };
    });
    console.log(w, JSON.stringify(bad, null, 1));
    await p.context().close();
  }
  await b.close();
})();
