// Crop and grade the example photographs into web/public/portraits/.
// Not a project dependency: run it in a scratch directory (`npm i sharp`), with the originals downloaded to ../raw/:
//   raw/today.jpg      https://images.pexels.com/photos/11446748/pexels-photo-11446748.jpeg?auto=compress&cs=tinysrgb&w=2400
//   raw/direction.jpg  https://images.pexels.com/photos/32342054/pexels-photo-32342054.jpeg?auto=compress&cs=tinysrgb&w=2400
// Credits and licence: docs/IMAGE_CREDITS.md. To reuse for a new photograph, add a job below: `region` is the crop
// on the 2400x3600 original (keep it 4:5 for portraits, 16:10 for landscape), `sat` eases saturation, `warm` nudges the
// cast toward ivory, `gamma` > 1 lifts shadows. Then re-tune the marker positions in web/src/lib/atelier.ts.
const sharp = require("sharp");
// Tone-map black -> ink, white -> ivory (per channel), then ease saturation. Photographs then live inside the palette.
const BLACK = [22, 20, 17], WHITE = [246, 241, 231];
const gain = BLACK.map((b, i) => (WHITE[i] - b) / 255);
// `warm` nudges the cast toward the page's ivory before the tone-map (R up, B down).
const grade = (img, sat = 0.86, warm = [1, 1, 1], gamma = 1) => (gamma !== 1 ? img.gamma(gamma) : img).modulate({ saturation: sat }).linear(gain.map((g, i) => g * warm[i]), BLACK);
const jobs = [
  // name, source, extract region (on the 2400x3600 original), out sizes
  { name: "today", src: "../raw/today.jpg", region: { left: 0, top: 130, width: 2400, height: 3000 }, sizes: [[1200, 1500], [640, 800]], sat: 0.84, warm: [1.035, 1.0, 0.93] },
  { name: "direction", src: "../raw/direction.jpg", region: { left: 0, top: 240, width: 2400, height: 3000 }, sizes: [[1200, 1500], [640, 800]], sat: 0.72 },
  { name: "direction-wide", src: "../raw/direction.jpg", region: { left: 0, top: 1900, width: 2400, height: 1500 }, sizes: [[1600, 1000], [800, 500]], sat: 0.72, gamma: 1.6 },
];
(async () => {
  for (const j of jobs) {
    for (const [w, h] of j.sizes) {
      const f = `out/${j.name}-${w}.jpg`;
      await grade(sharp(j.src).extract(j.region).resize(w, h, { kernel: "lanczos3" }), j.sat, j.warm, j.gamma).jpeg({ quality: 80, mozjpeg: true, chromaSubsampling: "4:4:4" }).toFile(f);
      console.log(f, (require("fs").statSync(f).size / 1024).toFixed(0) + "KB");
    }
  }
})();
