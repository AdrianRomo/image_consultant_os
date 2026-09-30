// Interaction states of the workflow, client view, wardrobe relations and supporting states.
//   node workflow-states.js <base> <outDir>      (NODE_PATH=/usr/share/nodejs)
// Run against a FRESH server: the last steps change state (the empty Studio and the empty client page).
const L = require("./lib");
const path = require("path");
const fs = require("fs");
const base = process.argv[2];
const out = process.argv[3];
fs.mkdirSync(out, { recursive: true });
const shot = (page, name, opts = {}) => page.screenshot({ path: path.join(out, name + ".png"), ...opts });
const el = (page, sel, name) => page.locator(sel).first().screenshot({ path: path.join(out, name + ".png") });

(async () => {
  const b = await L.launch();
  for (const w of [1440, 390]) {
    const p = await L.newPage(b, { w, h: w > 500 ? 900 : 844 });
    const tag = `-${w}`;

    // The Studio as it opens: the hero, and Today in the studio.
    await L.go(p, base + "/", 1500);
    await shot(p, "studio-fold" + tag);
    await el(p, "#today", "studio-today" + tag);
    await L.go(p, base + "/share/marisol", 1500);
    await shot(p, "share-fold" + tag);
    await L.go(p, base + "/clients/marisol/preview", 1500);
    await shot(p, "preview-fold" + tag);

    // The list, everything closed: what a consultant scans.
    await L.go(p, base + "/clients/marisol#opportunities", 1200);
    await p.evaluate(() => { document.querySelectorAll("[aria-expanded=true][aria-controls^=rec-body]").forEach((b) => b.click()); });
    await p.waitForTimeout(500);
    await el(p, "#opportunities", "rec-list-closed" + tag);

    // Approved and shared, with its private note, the earlier version compared, and the record.
    await L.go(p, base + "/clients/marisol#rec-rec-1", 1200);
    await p.getByRole("button", { name: /Compare with version 1/ }).click();
    await p.waitForTimeout(600);
    await el(p, "#rec-rec-1", "rec-shared-compare" + tag);

    // Approved but private: the share confirmation.
    await L.go(p, base + "/clients/marisol#rec-rec-2", 1200);
    await p.locator("#rec-rec-2").getByRole("button", { name: "Share with Marisol" }).click();
    await p.locator("dialog[open]").waitFor();
    await p.waitForTimeout(500);
    await shot(p, "share-confirm" + tag);
    await p.keyboard.press("Escape");

    // A draft, and an awaiting-review row.
    await L.go(p, base + "/clients/marisol#rec-rec-5", 1200);
    await el(p, "#rec-rec-5", "rec-draft" + tag);
    await L.go(p, base + "/clients/marisol#rec-rec-3", 1200);
    await shot(p, "rec-review-deeplink" + tag);

    // Wardrobe: a piece with looks and advice, and one with an observation.
    for (const id of ["w-ink-blazer", "w-grey-cardigan"]) {
      await L.go(p, base + "/wardrobe?item=" + id, 1200);
      await shot(p, "wardrobe-" + id + tag);
    }
    // Looks: a saved look, its pieces named.
    await L.go(p, base + "/looks?look=look-board", 1200);
    await shot(p, "looks-board" + tag, { fullPage: true });

    // Client pages that are not a client's page, and the studio's own 404.
    await L.go(p, base + "/share/nobody", 800);
    await shot(p, "share-404" + tag);
    await L.go(p, base + "/nonexistent", 800);
    await shot(p, "404" + tag);

    // Lab: patterns in Spanish with a long row open, the client's view, the states.
    await L.go(p, base + "/design-lab#patterns", 1200);
    await p.locator("#patterns").getByRole("button", { name: "Español" }).click();
    await p.locator("#patterns").getByRole("button", { name: "Long", exact: true }).click();
    await p.locator("#patterns [aria-controls^=rec-body]").first().click();
    await p.waitForTimeout(600);
    await el(p, "#patterns", "lab-patterns-es-long" + tag);
    await L.go(p, base + "/design-lab#client-view", 1200);
    await p.locator("#client-view").getByRole("button", { name: "Español" }).click();
    await p.waitForTimeout(300);
    await el(p, "#client-view", "lab-client-view-es" + tag);
    await L.go(p, base + "/design-lab#states", 1200);
    await el(p, "#states", "lab-states" + tag);
    await p.context().close();
  }

  // Mutating states last, once: approve what was waiting and withdraw both shared recommendations, then look at the
  // Studio with nothing waiting and at the client's page and the preview with nothing shared, at both widths.
  {
    const p = await L.newPage(b, { w: 1440, h: 900 });
    await L.go(p, base + "/clients/marisol#rec-rec-3", 1200);
    await p.locator("#rec-rec-3").getByRole("button", { name: "Approve", exact: true }).click();
    await p.locator("#rec-rec-3 [role=status]").waitFor();
    for (const id of ["rec-1", "rec-4"]) {
      await p.locator(`#rec-${id} h4 button`).click();
      await p.locator(`#rec-${id}`).getByRole("button", { name: "Stop sharing" }).click();
      await p.locator(`#rec-${id} [role=status]`).waitFor();
    }
    await p.context().close();
  }
  for (const w of [1440, 390]) {
    const p = await L.newPage(b, { w, h: w > 500 ? 900 : 844 });
    const tag = `-${w}`;
    await L.go(p, base + "/", 1000);
    await el(p, "#today", "studio-nothing-waiting" + tag);
    await L.go(p, base + "/share/marisol", 1000);
    await shot(p, "share-empty" + tag, { fullPage: true });
    await L.go(p, base + "/clients/marisol/preview", 1000);
    await shot(p, "preview-empty" + tag);
    await p.context().close();
  }
  await b.close();
  console.log("done", fs.readdirSync(out).length, "files");
})();
