// Does anything private reach the browser on the client's page?
//
// Loads a route in a real browser and records EVERYTHING the server sends for it: the HTML, the RSC payload
// embedded in it, and every script and data file it loads. Then searches all of that for strings that only the
// consultant may see. "Hidden with CSS" would fail this; only data that was never sent passes.
//
//   node share-boundary.js <base> [--after-share]     (NODE_PATH=/usr/share/nodejs)
//
// It also scans the consultant's dossier as a POSITIVE CONTROL: those strings must be found there, otherwise a
// pass on the client's page would prove nothing (a blind scan passes everything).
const L = require("./lib");
const base = process.argv[2];

// Only the consultant may see these. (Approved-and-shared wording, e.g. "Structured jacket in deep olive or ink",
// is deliberately NOT here: the client is meant to see it.)
const PRIVATE = {
  "private note (rec-1)": "chair has called her jacket",
  "private note (rec-2)": "comfortable being filmed",
  "private note (rec-5)": "over-rehearse",
  "approved but unshared rec-2": "Pause, then answer with open hands",
  "awaiting review rec-3": "Lead team updates with a personal opening line",
  "draft rec-5": "one-page cue card",
  "earlier wording of rec-1": "navy blazer for board days",
  "session notes": "Mock board Q&amp;A|Mock board Q&A",
  "session decision": "Prioritise wardrobe structure over colour change",
  "action plan (draft)": "Wardrobe: structured jacket, two fittings|weekly rehearsal|The plan, in three moves",
  "observation title": "Hands retreat when challenged",
  "observation detail": "Cropped snapshot, flat light",
  "audience note": "Seven directors",
  "her role": "Northwind Logistics",
  "another client": "Lucía Herrera|Diego Flores",
  "the studio's search": "Where to?|Search and commands",
  "the studio's commands": "Compose a look|Design lab",
  "consultant workflow words": "Send for review|Return to draft|Reopen for review|Stop sharing",
};
// The one thing that should never be confused with private: the client's own shared content IS present.
const SHOULD_APPEAR = ["Structured jacket in deep olive or ink"];
// A link that is not a client's link must not carry a client's data either, shared or not.
const ONLY_FOR_A_REAL_LINK = ["Structured jacket in deep olive or ink", "Two fittings booked before the March board meeting", "stop asking whether I"];

// With --after-share the UI is first driven to approve and share EVERY recommendation. Then the wording of the
// ones that used to be held back is legitimately public, but everything else below must still never appear:
// the private notes above all.
const AFTER_SHARE = process.argv.includes("--after-share");
const NOW_SHARED = new Set(["approved but unshared rec-2", "awaiting review rec-3", "draft rec-5"]);

async function shareEverything(browser) {
  const p = await L.newPage(browser, { w: 1440, h: 900 });
  await L.go(p, base + "/clients/marisol#opportunities", 900);
  for (const id of ["rec-1", "rec-2", "rec-3", "rec-4", "rec-5"]) {
    const row = p.locator(`#rec-${id}`);
    if ((await row.locator("h4 button").getAttribute("aria-expanded")) !== "true") await row.locator("h4 button").click();
    for (let i = 0; i < 4; i++) {
      const step = ["Send for review", "Approve", "Share with Marisol"].map((n) => row.getByRole("button", { name: n, exact: true }));
      let acted = false;
      for (const b of step) {
        if (await b.count()) {
          await b.click();
          if (await p.locator("dialog[open]").count()) await p.locator("dialog[open]").getByRole("button", { name: "Share", exact: true }).click();
          await p.waitForTimeout(700);
          acted = true;
          break;
        }
      }
      if (!acted) break;
    }
  }
  const shared = await p.locator("h4 button", { hasText: "Shared with Marisol" }).count();
  console.log(`worst case: ${shared} of 5 recommendations approved and shared through the UI`);
  await p.context().close();
  return shared;
}

const has = (text, pattern) => pattern.split("|").some((p) => text.toLowerCase().includes(p.toLowerCase()));

async function collect(browser, route) {
  const page = await L.newPage(browser, { w: 1440, h: 900 });
  const bodies = [];
  page.on("response", async (r) => {
    const type = r.headers()["content-type"] || "";
    if (!/html|javascript|json|text\/x-component|text\/plain/.test(type)) return;
    try { bodies.push({ url: r.url().replace(base, ""), text: await r.text() }); } catch { /* redirects, aborted */ }
  });
  await page.goto(base + route, { waitUntil: "networkidle" });
  await L.sweep(page); // scroll so anything lazy is requested too
  await page.waitForTimeout(500);
  const dom = await page.evaluate(() => document.documentElement.outerHTML);
  bodies.push({ url: "(rendered DOM)", text: dom });
  await page.context().close();
  return bodies;
}

(async () => {
  const browser = await L.launch();
  let failed = 0;
  if (AFTER_SHARE && (await shareEverything(browser)) !== 5) { console.log("FAIL  could not share everything to set up the worst case"); process.exit(1); }
  const isPrivate = ([what]) => !(AFTER_SHARE && NOW_SHARED.has(what));

  // 1. The client's page: nothing private may appear anywhere.
  const shareRoute = "/share/marisol";
  const shareBodies = await collect(browser, shareRoute);
  const total = shareBodies.reduce((n, b) => n + b.text.length, 0);
  console.log(`\n${shareRoute}: scanned ${shareBodies.length} responses, ${(total / 1024).toFixed(0)} KB (HTML, RSC data, scripts, rendered DOM)`);
  for (const [what, pattern] of Object.entries(PRIVATE).filter(isPrivate)) {
    const hits = shareBodies.filter((b) => has(b.text, pattern)).map((b) => b.url);
    if (hits.length) { failed++; console.log(`FAIL  ${what} found in: ${hits.slice(0, 3).join(", ")}`); }
    else console.log(`PASS  no ${what}`);
  }
  for (const s of SHOULD_APPEAR) {
    const ok = shareBodies.some((b) => has(b.text, s));
    if (!ok) failed++;
    console.log(`${ok ? "PASS" : "FAIL"}  shared content is present: “${s}”`);
  }

  // 2. Positive control: the same scan on the consultant's dossier must find the private strings.
  const dossier = await collect(browser, "/clients/marisol");
  const found = Object.entries(PRIVATE).filter(([, p]) => dossier.some((b) => has(b.text, p))).map(([w]) => w);
  const blind = found.length < 8;
  if (blind) failed++;
  console.log(`\n/clients/marisol (positive control): the scan found ${found.length} of ${Object.keys(PRIVATE).length} private strings there${blind ? "  FAIL: the scan is too blind to trust" : "  PASS: the scan can see them"}`);

  // 3. Direct URLs and near-misses. Extra query strings must not change what is sent; a link that is not a real
  //    client link must carry no client data at all (not even shared data), and no private data in any case.
  for (const [route, isClientLink] of [["/share/marisol?view=consultant&preview=1&status=all", true], ["/share/marisol/", true], ["/share/nobody", false], ["/share/Marisol", false], ["/share/marisol%2F..%2F", false]]) {
    const bodies = await collect(browser, route);
    const leak = Object.entries(PRIVATE).filter(isPrivate).filter(([, p]) => bodies.some((b) => has(b.text, p))).map(([w]) => w);
    if (!isClientLink) leak.push(...ONLY_FOR_A_REAL_LINK.filter((s) => bodies.some((b) => has(b.text, s))).map((s) => `client data “${s}”`));
    if (leak.length) failed++;
    console.log(`${leak.length ? "FAIL" : "PASS"}  ${route}${isClientLink ? "" : " (not a client link)"}: ${leak.length ? "leaked " + leak.join(", ") : "nothing"}`);
  }

  await browser.close();
  console.log(failed ? `\n${failed} check(s) FAILED` : "\nAll boundary checks passed");
  process.exit(failed ? 1 : 0);
})();
