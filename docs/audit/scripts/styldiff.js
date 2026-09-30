const L = require("./lib");
const [A, B, route, w = 1440] = process.argv.slice(2);
const PROPS = ["color", "fontSize", "fontFamily", "fontWeight", "fontStyle", "letterSpacing", "lineHeight", "textTransform", "display", "maxWidth", "minHeight", "minWidth", "paddingTop", "paddingBottom", "paddingLeft", "paddingRight", "marginTop", "marginBottom", "marginLeft", "marginRight", "width", "height", "borderTopWidth", "borderTopColor", "backgroundColor", "position", "textWrap", "gap", "opacity", "transform"];
async function collect(b, url) {
  const p = await L.newPage(b, { w: +w, h: 900 }, { reducedMotion: true });
  await p.goto(url, { waitUntil: "networkidle" });
  await p.addStyleTag({ content: "*,*::before,*::after{animation:none!important;transition:none!important}" });
  await p.waitForTimeout(500);
  const r = await p.evaluate((PROPS) => [...document.body.querySelectorAll("*")].map((el) => { const s = getComputedStyle(el); const o = { tag: el.tagName.toLowerCase(), cls: (el.getAttribute("class") || "").toString().slice(0, 90), txt: (el.children.length ? "" : (el.textContent || "")).trim().slice(0, 30) }; PROPS.forEach((k) => (o[k] = s[k])); return o; }), PROPS);
  await p.context().close(); return r;
}
(async () => {
  const b = await L.launch(); const [x, y] = [await collect(b, A + route), await collect(b, B + route)];
  console.log("elements", x.length, y.length); const seen = new Map();
  for (let i = 0; i < Math.min(x.length, y.length); i++) {
    const d = PROPS.filter((k) => x[i][k] !== y[i][k]); if (!d.length) continue;
    const key = x[i].cls + "|" + d.join(",");
    if (!seen.has(key)) seen.set(key, { n: 0, ex: `${x[i].tag}.${x[i].cls} "${x[i].txt}"`, d: d.map((k) => `${k}: ${x[i][k]} -> ${y[i][k]}`) });
    seen.get(key).n++;
  }
  for (const v of seen.values()) console.log(`x${v.n}  ${v.ex}\n     ${v.d.join(" | ")}`);
  if (!seen.size) console.log("no computed-style differences"); await b.close();
})();
