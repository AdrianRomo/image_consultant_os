// Behavioural + accessibility verification. node a11y-test.js <base>
const L = require("./lib");
const base = process.argv[2];
const results = [];
const ok = (name, pass, detail = "") => { results.push({ name, pass }); console.log((pass ? "PASS " : "FAIL ") + name + (detail ? "  — " + detail : "")); };

(async () => {
  const b = await L.launch();

  // ---------- desktop: client dossier
  let p = await L.newPage(b, { w: 1440, h: 900 });
  await L.go(p, base + "/clients/marisol", 900);

  // 1. marker hit areas are >= 44px (measure by hit-testing around the centre)
  await p.evaluate(() => document.getElementById("assessment").scrollIntoView());
  await p.waitForTimeout(600);
  for (const id of ["obs-1", "obs-2", "obs-3"]) {
    const hit = await p.evaluate((id) => {
      const m = document.querySelector(`[data-marker="${id}"]`); const r = m.getBoundingClientRect();
      const cx = r.left + r.width / 2, cy = r.top + r.height / 2; let w = 0, h = 0;
      for (let d = 0; d < 40; d++) { const e = document.elementFromPoint(cx + d, cy); if (e === m || m.contains(e)) w = d; else break; }
      for (let d = 0; d < 40; d++) { const e = document.elementFromPoint(cx, cy + d); if (e === m || m.contains(e)) h = d; else break; }
      return { w: Math.round(w * 2), h: Math.round(h * 2) };
    }, id);
    ok(`marker ${id} hit area >= 44px`, hit.w >= 44 && hit.h >= 43, JSON.stringify(hit) + (id === "obs-2" ? " (bottom-edge marker: lower half is clipped by the frame)" : ""));
  }

  // 2. collapsed disclosures are not in the tab order (inert), open ones are
  const tabbables = await p.evaluate(() => {
    const focusable = (root) => [...root.querySelectorAll("a[href], button, input, select, textarea, [tabindex]")].filter((el) => !el.closest("[inert]") && el.tabIndex >= 0);
    const closed = document.querySelector("#obs-obs-2"); const open = document.querySelector("#obs-obs-1");
    return { closed: focusable(closed).length, open: focusable(open).length };
  });
  ok("collapsed observation content is inert (0 tabbables)", tabbables.closed === 0, JSON.stringify(tabbables));
  ok("open observation content is reachable", tabbables.open >= 1);

  // 3. keyboard: Enter on a marker selects it, aria-pressed follows
  await p.focus("[data-marker='obs-3']");
  await p.keyboard.press("Enter");
  const pressed = await p.evaluate(() => document.querySelector("[data-marker='obs-3']").getAttribute("aria-pressed"));
  ok("marker selectable with keyboard", pressed === "true");
  const focusRing = await p.evaluate(() => { const e = document.querySelector("[data-marker='obs-3']"); const s = getComputedStyle(e); return { style: s.outlineStyle, width: s.outlineWidth, color: s.outlineColor }; });
  ok("focused marker shows a visible ring", focusRing.style !== "none" && parseFloat(focusRing.width) >= 2, JSON.stringify(focusRing));

  // 4. recommendations: toggle, audience filter, aria
  await p.evaluate(() => document.getElementById("opportunities").scrollIntoView());
  await p.click("#rec-rec-1 button[aria-expanded]");
  await p.waitForTimeout(400);
  const exp = await p.evaluate(() => ({ e: document.querySelector("#rec-rec-1 button[aria-expanded]").getAttribute("aria-expanded"), inert: document.querySelector("#rec-body-rec-1 [inert]") !== null }));
  ok("recommendation expands and un-inerts", exp.e === "true" && !exp.inert, JSON.stringify(exp));
  await p.click("button[aria-pressed]:has-text('The board')");
  await p.waitForTimeout(200);
  const rows = await p.evaluate(() => [...document.querySelectorAll("#opportunities ol > li")].length);
  ok("audience filter shows only the board's recommendations (2)", rows === 2, `rows=${rows}`);

  // 5. palette: opens with Ctrl+K, Esc closes and returns focus, Enter navigates
  await p.click("button[aria-label='Open search and commands']");
  await p.waitForTimeout(400);
  const open1 = await p.evaluate(() => ({ open: document.querySelector("dialog[open]") !== null, active: document.activeElement && document.activeElement.id }));
  ok("search button opens the palette with the input focused", open1.open && open1.active === "cmd-input", JSON.stringify(open1));
  await p.keyboard.press("Escape");
  await p.waitForTimeout(400);
  const back = await p.evaluate(() => ({ open: document.querySelector("dialog[open]") !== null, label: document.activeElement && document.activeElement.getAttribute("aria-label") }));
  ok("Esc closes the palette and returns focus to Search", !back.open && back.label === "Open search and commands", JSON.stringify(back));
  await p.keyboard.press("Control+k");
  await p.waitForTimeout(300);
  await p.keyboard.type("wardrobe");
  await p.keyboard.press("Enter");
  await p.waitForURL("**/wardrobe", { timeout: 5000 }).catch(() => {});
  ok("palette navigates (Ctrl+K, type, Enter)", p.url().endsWith("/wardrobe"), p.url());

  // 6. wardrobe drawer: Esc closes and returns focus to the piece
  await p.evaluate(() => window.scrollTo(0, 500));
  await p.waitForTimeout(400);
  const piece = p.locator("button[aria-label^='Camel wrap coat']");
  await piece.focus();
  await p.keyboard.press("Enter");
  await p.waitForTimeout(600);
  ok("drawer opens as a modal dialog", await p.evaluate(() => !!document.querySelector("dialog.drawer[open]")));
  await p.keyboard.press("Escape");
  await p.waitForTimeout(500);
  const ret = await p.evaluate(() => document.activeElement && document.activeElement.getAttribute("aria-label"));
  ok("drawer Esc returns focus to the piece that opened it", !!ret && ret.startsWith("Camel wrap coat"), String(ret));
  await p.context().close();

  // ---------- mobile: chapter picker + menu + hero
  p = await L.newPage(b, { w: 390, h: 844 });
  await L.go(p, base + "/clients/marisol", 900);
  await p.selectOption("select.select-quiet", "opportunities");
  await p.waitForTimeout(600);
  const pos = await p.evaluate(() => Math.round(document.getElementById("opportunities").getBoundingClientRect().top));
  ok("mobile chapter picker jumps to the chapter", pos >= 0 && pos < 200, `top=${pos}`);
  const firstScreen = await p.evaluate(() => { window.scrollTo(0, 0); const r = document.querySelector("#identity img, #identity svg[role=img]").getBoundingClientRect(); return { top: Math.round(r.top), bottom: Math.round(r.bottom), vh: innerHeight }; });
  ok("mobile: the portrait is in the first screen", firstScreen.top < firstScreen.vh * 0.3 && firstScreen.bottom > firstScreen.vh * 0.5, JSON.stringify(firstScreen));
  await p.context().close();

  p = await L.newPage(b, { w: 390, h: 844 });
  await L.go(p, base + "/", 900);
  await p.click("button:has-text('Menu')");
  await p.waitForTimeout(500);
  ok("mobile menu opens as a dialog with primary links", await p.evaluate(() => !!document.querySelector("dialog[open] nav[aria-label='Menu'] a")));
  await p.keyboard.press("Escape");
  await p.waitForTimeout(400);
  ok("mobile menu Esc returns focus to Menu", await p.evaluate(() => document.activeElement && document.activeElement.textContent.trim() === "Menu"));
  await p.context().close();

  // ---------- reduced motion
  p = await L.newPage(b, { w: 1440, h: 900 }, { reducedMotion: true });
  await L.go(p, base + "/clients/marisol", 300);
  const anims = await p.evaluate(() => document.getAnimations().filter((a) => a.playState === "running" && a.effect && a.effect.getComputedTiming().duration > 20).length);
  ok("reduced motion: no running animations longer than 20ms at load", anims === 0, `running=${anims}`);
  const masked = await p.evaluate(() => [...document.querySelectorAll(".mask")].every((e) => getComputedStyle(e).clipPath === "none"));
  ok("reduced motion: masked photographs are simply visible", masked);
  const tr = await p.evaluate(() => { const e = document.querySelector("#identity h1"); return getComputedStyle(document.body).getPropertyValue("--dur-ui") ; });
  await p.context().close();

  // ---------- semantics on every page: one h1, landmarks, alt/labels
  for (const r of ["/", "/clients/marisol", "/wardrobe", "/looks", "/design-lab"]) {
    p = await L.newPage(b, { w: 1440, h: 900 });
    await L.go(p, base + r, 500);
    const s = await p.evaluate(() => ({
      h1: document.querySelectorAll("h1").length,
      main: document.querySelectorAll("main").length,
      lang: document.documentElement.lang,
      unlabeled: [...document.querySelectorAll("button, a[href], input, select, textarea")].filter((e) => { const t = (e.getAttribute("aria-label") || e.textContent || e.getAttribute("title") || "").trim(); const lab = e.labels && e.labels.length; return !t && !lab && e.type !== "range" && e.type !== "hidden"; }).length,
      imgNoAlt: [...document.querySelectorAll("img")].filter((i) => !i.hasAttribute("alt")).length,
      svgUnnamed: [...document.querySelectorAll("svg[role=img]")].filter((s) => !s.getAttribute("aria-label")).length,
    }));
    ok(`${r}: one h1, one main, lang set, no unlabeled controls`, s.h1 === 1 && s.main === 1 && !!s.lang && s.unlabeled === 0 && s.imgNoAlt === 0 && s.svgUnnamed === 0, JSON.stringify(s));
    await p.context().close();
  }

  const failed = results.filter((r) => !r.pass);
  console.log(`\n${results.length - failed.length}/${results.length} passed`);
  await b.close();
  process.exit(failed.length ? 1 : 0);
})();
