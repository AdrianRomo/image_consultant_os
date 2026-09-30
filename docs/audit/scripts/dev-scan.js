const L = require("./lib"); const base = process.argv[2];
(async () => { const b = await L.launch();
  for (const vp of [{ w: 1440, h: 900 }, { w: 390, h: 844 }]) for (const r of ["/", "/clients/marisol", "/wardrobe", "/looks?ask=board", "/design-lab", "/nope"]) {
    const p = await L.newPage(b, vp); const msgs = [];
    p.on("console", (m) => { if (["error", "warning"].includes(m.type())) msgs.push(m.type() + ": " + m.text().slice(0, 160)); });
    await p.goto(base + r, { waitUntil: "networkidle", timeout: 90000 }).catch((e) => msgs.push("goto: " + e.message.slice(0, 80)));
    await p.waitForTimeout(1500);
    const real = msgs.filter((m) => !/Failed to load resource.*404/.test(m) && !/Download the React DevTools/.test(m));
    console.log(String(vp.w).padEnd(5), r.padEnd(18), real.length ? JSON.stringify(real) : "clean");
    await p.context().close(); }
  await b.close(); })();
