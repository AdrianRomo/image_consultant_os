// Verify the marker->note connector, the sticky stage, and the recommendation interaction at 1440 and keyboard use.
const L = require("./lib");
const base = process.argv[2], out = process.argv[3];
(async () => {
  const b = await L.launch();
  const p = await L.newPage(b, { w: 1440, h: 900 });
  await L.go(p, base + "/clients/marisol", 1200);
  await p.evaluate(() => document.getElementById("assessment").scrollIntoView());
  await p.evaluate(() => window.scrollBy(0, -60));
  await p.waitForTimeout(1000);
  await p.screenshot({ path: out + "/conn-1-assessment.png" });
  await p.click("button[aria-label^='Observation 2']");
  await p.waitForTimeout(1000);
  await p.screenshot({ path: out + "/conn-2-obs2.png" });
  // scroll to recommendations, open the third (team) one
  await p.evaluate(() => document.getElementById("opportunities").scrollIntoView());
  await p.evaluate(() => window.scrollBy(0, 240));
  await p.waitForTimeout(600);
  await p.click("#rec-rec-3 button[aria-expanded]");
  await p.waitForTimeout(1100);
  await p.screenshot({ path: out + "/conn-3-rec3.png" });
  const st = await p.evaluate(() => ({ expanded: document.querySelector("#rec-rec-3 button[aria-expanded]").getAttribute("aria-expanded"), pressed: [...document.querySelectorAll("[data-marker]")].map((m) => m.dataset.marker + ":" + m.getAttribute("aria-pressed")), paths: document.querySelectorAll("svg .connector").length }));
  console.log(JSON.stringify(st));
  // keyboard: Tab to a marker, Enter selects
  await p.keyboard.press("Tab");
  console.log("errors:", p._errors.length ? p._errors : "none");
  await b.close();
})();
