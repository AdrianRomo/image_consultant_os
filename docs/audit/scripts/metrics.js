// Measured audit: touch targets, tiny text, radii, heading outline, contrast. node metrics.js <base> [out.json]
const L = require("./lib");
const base = process.argv[2];
const routes = ["/", "/clients/marisol", "/wardrobe", "/looks"];

function lum(rgb) {
  const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
  return 0.2126 * f(rgb[0]) + 0.7152 * f(rgb[1]) + 0.0722 * f(rgb[2]);
}

(async () => {
  const b = await L.launch();
  const result = {};
  for (const vp of [{ w: 1440, h: 900 }, { w: 390, h: 844 }]) {
    for (const r of routes) {
      const p = await L.newPage(b, vp);
      await L.go(p, base + r, 1500);
      await L.sweep(p);
      const data = await p.evaluate(() => {
        const vis = (el) => { const s = getComputedStyle(el); const r = el.getBoundingClientRect(); return s.visibility !== "hidden" && s.display !== "none" && r.width > 0 && r.height > 0; };
        const small = [];
        document.querySelectorAll("a, button, input, [role=button], summary").forEach((el) => {
          if (!vis(el)) return;
          const r = el.getBoundingClientRect();
          if (el.closest("[aria-hidden=true]")) return;
          if (r.height < 44 || r.width < 44) small.push({ t: (el.getAttribute("aria-label") || el.textContent || "").trim().slice(0, 28), w: Math.round(r.width), h: Math.round(r.height) });
        });
        const sizes = {};
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
        let n;
        while ((n = walker.nextNode())) {
          if (!n.textContent.trim()) continue;
          const el = n.parentElement; if (!el || !vis(el)) continue;
          const fs = Math.round(parseFloat(getComputedStyle(el).fontSize) * 10) / 10;
          sizes[fs] = (sizes[fs] || 0) + n.textContent.trim().length;
        }
        const radii = {};
        document.querySelectorAll("*").forEach((el) => { const br = getComputedStyle(el).borderTopLeftRadius; if (br !== "0px" && vis(el)) radii[br] = (radii[br] || 0) + 1; });
        const headings = [...document.querySelectorAll("h1,h2,h3,h4")].map((h) => h.tagName + ":" + h.textContent.trim().slice(0, 30));
        const imgs = [...document.querySelectorAll("svg[role=img]")].map((s) => s.getAttribute("aria-label")).length;
        const boxes = [...document.querySelectorAll("*")].filter((el) => { const s = getComputedStyle(el); return vis(el) && (parseFloat(s.borderTopWidth) > 0 && parseFloat(s.borderRightWidth) > 0 && parseFloat(s.borderBottomWidth) > 0 && parseFloat(s.borderLeftWidth) > 0) && el.getBoundingClientRect().width > 40; }).length;
        const shadows = [...document.querySelectorAll("*")].filter((el) => vis(el) && getComputedStyle(el).boxShadow !== "none").length;
        const blur = [...document.querySelectorAll("*")].filter((el) => { const s = getComputedStyle(el); return vis(el) && (s.backdropFilter !== "none"); }).length;
        return { small, sizes, radii, headings, imgs, boxes, shadows, blur, docW: document.documentElement.scrollWidth, vw: innerWidth };
      });
      result[`${vp.w}${r}`] = data;
      await p.context().close();
    }
  }
  // contrast for key pairs (page-independent)
  const pairs = { "warm on ivory": [[107, 99, 87], [245, 241, 232]], "taupe on ivory": [[169, 155, 134], [245, 241, 232]], "cordovan on ivory": [[122, 51, 36], [245, 241, 232]], "taupe on ink": [[169, 155, 134], [23, 21, 18]], "warm@60% on ivory": [[107 * 0.6 + 245 * 0.4, 99 * 0.6 + 241 * 0.4, 87 * 0.6 + 232 * 0.4], [245, 241, 232]] };
  const contrast = {};
  for (const [k, [a, bg]] of Object.entries(pairs)) { const l1 = lum(a), l2 = lum(bg); contrast[k] = ((Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05)).toFixed(2); }
  console.log("CONTRAST", JSON.stringify(contrast));
  for (const [k, v] of Object.entries(result)) {
    const tiny = Object.entries(v.sizes).filter(([s]) => +s < 12).map(([s, c]) => `${s}px:${c}ch`).join(" ");
    console.log(`\n== ${k}  overflow:${v.docW > v.vw}  h-tags:${v.headings.length}  h1:${v.headings.filter((h) => h.startsWith("H1")).length}  boxedEls:${v.boxes}  shadows:${v.shadows}  backdrop-blur:${v.blur}`);
    console.log("   text <12px:", tiny || "none", "| radii:", JSON.stringify(v.radii));
    console.log("   targets <44px:", v.small.length, v.small.slice(0, 8).map((s) => `${s.t}(${s.w}x${s.h})`).join("; "));
  }
  require("fs").writeFileSync(process.argv[3] || "metrics.json", JSON.stringify(result, null, 1));
  await b.close();
})();
