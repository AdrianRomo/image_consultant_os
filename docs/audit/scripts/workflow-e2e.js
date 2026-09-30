// Drives the recommendation workflow through the real UI and checks, after every step, what the client's page
// would show. Run against a FRESH server (state is in memory and this changes it; restart to reset):
//   node workflow-e2e.js <base>        (NODE_PATH=/usr/share/nodejs)
const L = require("./lib");
const base = process.argv[2];
const results = [];
const ok = (name, pass, detail = "") => { results.push(pass); console.log((pass ? "PASS " : "FAIL ") + name + (detail ? "  — " + detail : "")); };

const REC3 = "Lead team updates with a personal opening line";
const clientSees = async (title) => (await (await fetch(base + "/share/marisol")).text()).includes(title);
const row = (p, id) => p.locator(`#rec-${id}`);
const btn = (p, id, name) => row(p, id).getByRole("button", { name, exact: true });
const words = (p, id) => row(p, id).locator("h4 button").innerText();
// What a person perceives: wait (briefly) for the row to show the state, rather than reading it once.
const shows = async (p, id, re) => { try { await p.waitForFunction(([id, src]) => new RegExp(src, "i").test(document.querySelector(`#rec-${id} h4 button`)?.textContent || ""), [id, re.source], { timeout: 4000 }); return true; } catch { return false; } };

(async () => {
  const b = await L.launch();
  const p = await L.newPage(b, { w: 1440, h: 900 });

  // A. A deep link opens the recommendation and lights the observation that motivated it.
  await L.go(p, base + "/clients/marisol#rec-rec-3", 900);
  ok("deep link opens the recommendation", (await p.locator("#rec-rec-3 h4 button").getAttribute("aria-expanded")) === "true");
  ok("…and lights its observation on the portrait", (await p.locator("[data-marker='obs-2']").getAttribute("aria-pressed")) === "true");

  // B. Awaiting review: approve or return; nothing about sharing yet.
  ok("awaiting review offers Approve and Return to draft", (await btn(p, "rec-3", "Approve").count()) === 1 && (await btn(p, "rec-3", "Return to draft").count()) === 1);
  ok("…and does not offer Share", (await row(p, "rec-3").getByRole("button", { name: /^Share with/ }).count()) === 0);
  ok("the row says what it is: awaiting review, consultant only", /awaiting review/i.test(await words(p, "rec-3")) && /consultant only/i.test(await words(p, "rec-3")));

  // C. Approve. It must NOT become visible to the client.
  await btn(p, "rec-3", "Approve").click();
  await p.locator("#rec-rec-3 [role=status]").waitFor();
  ok("approving says so, and that it is not shared", /approved[\s\S]*not shared with marisol/i.test(await p.locator("#rec-rec-3 [role=status]").innerText()));
  ok("the row now reads approved, consultant only", /approved/i.test(await words(p, "rec-3")) && /consultant only/i.test(await words(p, "rec-3")));
  ok("focus moves to the panel that reports the change", await p.evaluate(() => document.activeElement?.getAttribute("role") === "group" && !!document.activeElement.closest("#rec-rec-3")));
  ok("the client still cannot see it after approval", !(await clientSees(REC3)));
  ok("Share and Reopen are now offered", (await btn(p, "rec-3", "Share with Marisol").count()) === 1 && (await btn(p, "rec-3", "Reopen for review").count()) === 1);

  // D. Sharing asks first. Escape declines; nothing changes.
  await btn(p, "rec-3", "Share with Marisol").click();
  await p.locator("dialog[open]").waitFor();
  ok("sharing asks for confirmation", /Share this with Marisol\?/.test(await p.locator("dialog[open]").innerText()));
  ok("…and says what stays hidden", /private notes/i.test(await p.locator("dialog[open]").innerText()));
  await p.keyboard.press("Escape");
  await p.waitForTimeout(400);
  ok("Escape returns focus to the button that asked", await p.evaluate(() => /share with marisol/i.test(document.activeElement?.textContent || "")));
  ok("Escape declines: still consultant only, client still cannot see it", /consultant only/i.test(await words(p, "rec-3")) && !(await clientSees(REC3)));

  // E. Confirm. Now, and only now, the client sees it.
  await btn(p, "rec-3", "Share with Marisol").click();
  await p.locator("dialog[open]").getByRole("button", { name: "Share", exact: true }).click();
  await p.waitForFunction(() => /Shared with Marisol/.test(document.querySelector("#rec-rec-3 [role=status]")?.textContent || ""));
  ok("the row reads shared with Marisol", /shared with marisol/i.test(await words(p, "rec-3")));
  ok("the client now sees exactly this recommendation added", await clientSees(REC3));
  ok("a shared recommendation cannot be reopened; it can only be withdrawn", (await btn(p, "rec-3", "Reopen for review").count()) === 0 && (await btn(p, "rec-3", "Stop sharing").count()) === 1);

  // F. The consultant's preview matches, and counts only.
  const pv = await L.newPage(b, { w: 1440, h: 900 });
  await L.go(pv, base + "/clients/marisol/preview", 600);
  const preview = await pv.locator("body").innerText();
  ok("the preview shows what the client sees, and counts what is held back", preview.includes(REC3) && /3 shared/i.test(preview) && /2 held back/i.test(preview));
  ok("the preview lists no held-back title", !/one-page cue card/i.test(preview) && !/Pause, then answer/i.test(preview));
  await pv.context().close();

  // G. Withdraw.
  await btn(p, "rec-3", "Stop sharing").click();
  await p.waitForFunction(() => /No longer shared/.test(document.querySelector("#rec-rec-3 [role=status]")?.textContent || ""));
  ok("withdrawing removes it from the client's page at once", !(await clientSees(REC3)));

  // H. A draft can only be sent for review: never approved or shared directly.
  await row(p, "rec-5").locator("h4 button").click();
  await p.waitForTimeout(400);
  ok("a draft offers only Send for review", (await btn(p, "rec-5", "Send for review").count()) === 1 && (await row(p, "rec-5").getByRole("button", { name: /Approve|Share with/ }).count()) === 0);

  // I. Two windows: the second is out of date and must be refused, not applied.
  const p2 = await L.newPage(b, { w: 1440, h: 900 });
  await L.go(p2, base + "/clients/marisol#rec-rec-5", 900);
  await btn(p, "rec-5", "Send for review").click();
  await p.waitForFunction(() => /Sent for review/.test(document.querySelector("#rec-rec-5 [role=status]")?.textContent || ""));
  ok("window one sends it for review", await shows(p, "rec-5", /awaiting review/));
  await btn(p2, "rec-5", "Send for review").click(); // window two still believes it is a draft
  await p2.locator("#rec-rec-5 [role=alert]").waitFor();
  ok("window two is told it changed elsewhere", /changed in another window/i.test(await p2.locator("#rec-rec-5 [role=alert]").innerText()));
  ok("…and now shows the true state", await shows(p2, "rec-5", /awaiting review/));

  // J. Keyboard only: focus the button, press Enter.
  await p2.locator("#rec-rec-5").getByRole("button", { name: "Approve", exact: true }).focus();
  await p2.keyboard.press("Enter");
  await p2.locator("#rec-rec-5 [role=status]").waitFor();
  ok("a change can be made with the keyboard alone", await shows(p2, "rec-5", /approved/));

  // K. The Studio follows the records.
  await L.go(p, base + "/", 900);
  const studio = await p.locator("main").innerText();
  ok("the Studio no longer lists what was approved as waiting", !/Lead team updates with a personal opening line/.test(studio.split("Coming up")[0].split("Waiting for your judgement")[1] || ""));
  ok("…and says nothing is waiting for a decision", /No recommendation is waiting for your decision|Nothing to decide/.test(studio));
  ok("…and the next action falls back to the nearest appointment", /fitting · structured jacket/i.test(studio) && /start here/i.test(studio));

  // Closed rows keep their controls out of the tab order.
  await L.go(p, base + "/clients/marisol", 900);
  ok("collapsed recommendations are inert, with all their buttons", await p.evaluate(() => [...document.querySelectorAll("[id^=rec-body-]")].every((b) => b.querySelector(":scope > [inert]") && b.querySelectorAll("button:not([inert] *)").length === 0)));

  // L. Earlier and current wording, with dates and states; never a result.
  await L.go(p, base + "/clients/marisol#rec-rec-1", 900);
  const cmp = row(p, "rec-1").getByRole("button", { name: /Compare with version 1/ });
  ok("a recommendation with an earlier version offers a comparison", (await cmp.count()) === 1);
  ok("one without an earlier version does not", (await row(p, "rec-2").getByRole("button", { name: /Compare with/ }).count()) === 0);
  await cmp.click();
  await p.waitForTimeout(400);
  const t = await row(p, "rec-1").innerText();
  ok("the comparison labels both versions with a date and a state", /earlier · version 1/i.test(t) && /current · version 2/i.test(t) && /5 march · draft/i.test(t) && /12 march · approved/i.test(t));
  ok("it shows the earlier wording next to the current", /A navy blazer for board days/.test(t) && /Structured jacket in deep olive or ink/.test(t));
  ok("it says it compares wording, not results", /says nothing about results/i.test(t));

  // M. On a phone: every message and the confirmation must fit the screen (a no-wrap label once pushed the page wide).
  const fits = (pg) => pg.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth);
  const m1 = await L.newPage(b, { w: 390, h: 844 }), m2 = await L.newPage(b, { w: 390, h: 844 });
  await L.go(m1, base + "/clients/marisol#rec-rec-2", 900);
  await L.go(m2, base + "/clients/marisol#rec-rec-2", 900);
  ok("phone: the recommendation opens without overflow", await fits(m1));
  await btn(m1, "rec-2", "Share with Marisol").click();
  await m1.locator("dialog[open]").waitFor();
  ok("phone: the confirmation fits the screen", await m1.evaluate(() => { const r = document.querySelector("dialog[open]").getBoundingClientRect(); return r.left >= 0 && r.right <= innerWidth; }) && await fits(m1));
  await m1.locator("dialog[open]").getByRole("button", { name: "Share", exact: true }).click();
  await m1.locator("#rec-rec-2 [role=status]").waitFor();
  ok("phone: the confirmation message fits", await fits(m1));
  await btn(m2, "rec-2", "Share with Marisol").click(); // m2 still believes it is not shared
  await m2.locator("dialog[open]").getByRole("button", { name: "Share", exact: true }).click();
  await m2.locator("#rec-rec-2 [role=alert]").waitFor();
  ok("phone: the out-of-date message fits", await fits(m2));

  ok("no console errors", [p, p2, m1, m2].every((x) => x._errors.length === 0), [p, p2, m1, m2].flatMap((x) => x._errors).slice(0, 2).join(" | "));
  await b.close();
  const failed = results.filter((r) => !r).length;
  console.log(failed ? `\n${failed} FAILED of ${results.length}` : `\nAll ${results.length} workflow checks passed`);
  process.exit(failed ? 1 : 0);
})();
