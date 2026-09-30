// node slice-cli.js <png> <W> <H> <sliceH> [cols]   -> slices (cols omitted) or contact sheets
const L = require("./lib");
const [file, W, H, sh, cols] = process.argv.slice(2);
(async () => {
  const b = await L.launch();
  const r = cols ? await L.sheet(b, file, +W, +H, +sh, +cols) : await L.slice(b, file, +W, +H, +sh);
  console.log(r.join("\n"));
  await b.close();
})();
