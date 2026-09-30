// Re-encode PNG screenshots as JPEG (quality 86) in place. node to-jpeg.js <dir...>
const L = require("./lib"); const fs = require("fs"); const path = require("path");
(async () => {
  const b = await L.launch(); let n = 0, before = 0, after = 0;
  for (const dir of process.argv.slice(2)) {
    for (const f of fs.readdirSync(dir).filter((x) => x.endsWith(".png"))) {
      const file = path.join(dir, f); const buf = fs.readFileSync(file);
      const w = buf.readUInt32BE(16), h = buf.readUInt32BE(20);
      const ctx = await b.newContext({ viewport: { width: w, height: h } }); const p = await ctx.newPage();
      await p.setContent(`<body style="margin:0"><img src="data:image/png;base64,${buf.toString("base64")}" style="display:block;width:${w}px;height:${h}px"></body>`);
      const out = file.replace(/\.png$/, ".jpg");
      await p.screenshot({ path: out, type: "jpeg", quality: 86 });
      before += buf.length; after += fs.statSync(out).size; fs.unlinkSync(file); n++; await ctx.close();
    }
  }
  console.log(`${n} files: ${(before / 1e6).toFixed(1)}MB -> ${(after / 1e6).toFixed(1)}MB`);
  await b.close();
})();
