# Garment preview: recolour a garment without touching the person

**Status: provisional experiment (stage 0a), 2026-10-06.** Offline only: a command-line tool that runs on the
workstation. It is not wired into the web app, exposes no endpoint, and must only be fed synthetic or stock photographs
(no consent, storage or login exists yet; see `plan.md` §5 and `docs/DECISIONS.md`, 2026-10-06).

The consultant wants to show a client a recommended colour on the client's own photograph, with no chance of the face
or complexion changing. A model cannot promise that, so the guarantee is built from the pipeline:

1. **Parse** the photo into 18 classes with the FASHN human parser (SegFormer-B4, 64M parameters, runs in ~0.1 to 0.3 s).
2. **Mask** (`masks.py`): the edit area is the requested garment *minus* everything that is the person (face, hair,
   skin, glasses, jewellery, hat, bag), each grown by a safety margin: wide around identity (face, hair, glasses,
   jewellery, hat), narrow around other skin. Feathering happens inside the mask only, so `alpha == 0` wherever the
   mask is false.
3. **Edit** (`recolor.py`): deterministic Lab recolour, **no generative model**. Lightness variation (folds, knit,
   pinstripes) is kept; colour is replaced and calibrated so the garment's median colour lands on the target hex.
   Every pixel with `alpha == 0` is returned byte-for-byte.
4. **Verify** (`verify.py`), independently of the edit and on the saved PNG, not the array in memory: nothing outside
   the mask changed; no person pixel changed; the mask does not overlap the person; the garment was found and is a
   plausible size; the median colour is within dE2000 4 of the target. A face-less photo is a warning.

`tests/` proves these hold and that the verifier fails when they do not (a tampered face pixel, a mask that leaks onto
an arm, a missing garment, a change on the background). Breaking `masks.py` on purpose makes 40 of 46 tests fail.

## Run

```bash
cd experiments/garment-preview
python3 -m venv .venv && .venv/bin/pip install -r requirements.txt   # ~6 GB (CUDA 13 PyTorch); requirements.lock.txt has the tested versions
.venv/bin/python -m pytest -q                                          # no model needed
mkdir -p raw && cp /path/to/photo.jpg raw/                             # raw/ and out/ are git-ignored
.venv/bin/python -m garment_preview run raw/photo.jpg --garment top --target '#8a3b2a' --target '#c9a27a' --out out
```

`--garment` is `top`, `dress`, `skirt` or `pants`. Per photo and colour it writes a lossless PNG, the mask, and a
contact sheet (original | mask | result | pixels that changed) into `out/`, plus `out/report.json`. Exit status is 1 if
any check fails. The two photographs used so far are the Pexels originals listed in `docs/audit/scripts/grade-photos.js`
(credits: `docs/IMAGE_CREDITS.md`); they are not committed.

## What 24 real photographs showed (details and per-photo verdicts: `corpus.md`)

- **The person guarantee held.** Person pixels changed: 0 in every run; colour error 0.0 to 0.35 dE2000 after
  calibration (up to 3.96 before it, on a near-black suit). No face, hair, hand or arm was altered in any of the 24.
- **The mask is the weak part, and the automatic checks cannot see it.** They trust the parser's labels, so they pass even
  when the mask is wrong. Looking at contact sheets: **14 of 24 usable as they are, 8 layered, 2 bad.**
  - **Layered clothing (8 of 24, a third):** a blazer and the shirt, tee, turtleneck or knit under it share the parser's
    `top` label, so both are recoloured and the inner layer often turns bright. The consultant has to be able to choose
    the layer; "recolour the top" is not a unit she thinks in.
  - **Bad masks (2 of 24):** a dark embellished dress against a sheer white curtain (blotchy, curtain recoloured) and a
    scarf over a velvet top (pale discs, holes).
  - **Multi-person:** the parser handled a group of four and recoloured everyone's top. A client photo must have one person.
- **A mixed-colour flag** (`verify.py`, `MIXED_WARN`) marks an edit whose area was partly a very different colour in the
  original. It flagged 8 of the 10 layered or bad masks and none of the 14 usable ones (it missed a collar and some
  cuffs). The threshold was tuned on these same photographs: indicative, not proven. It is a "look at this" flag, not a failure.
- **A skin-colour second opinion** (`skin_like_fraction`) is weak: a mask deliberately extended onto arms and legs
  raised it from 0.275 to 0.407 (warning threshold 0.30), but a beige cardigan already scores 0.275. It will fire on
  skin-toned garments and could miss a leak on others. Kept as a warning; do not rely on it.
- **A rim of old colour at skin and hair edges.** The parser's mask is 384 px wide, so one of its pixels is 5 to 6 px on a
  2000 to 2400 px photo. A narrower margin around body skin (wide around face and hair) reduced it to a hairline; hair
  crossing a dark coat still leaves a dark fringe.
- **A halo where a garment fades into bright light** (the backlit pinstripe suit): those pixels are part garment, part
  glare, and a hard mask cannot recolour only the garment part. That needs alpha matting.
- **Grain** on near-black garments was amplified when their variation was stretched; splitting broad shading from fine
  detail fixed most of it.
- **JPEG:** the guarantee is on decoded pixels. Saving a JPEG re-encodes the whole frame, face included, so deliver
  lossless (PNG or lossless WebP) when "pixel-identical" matters, or say "visually identical" for a q95+ JPEG.

## Not done (next, in this order)

1. **Choosing the layer.** Let the consultant pick which part of the photo to recolour (a click, resolved with a
   segmentation model prompted by a point such as SAM, or colour regions that she confirms), instead of "all `top`".
   This is the largest quality gain: a third of the photographs need it. An automatic split by colour is risky (it would
   cut pinstripes and lit-versus-shaded cloth), so the person decides.
2. Edge matting for glare and soft edges, and for hair over a dark garment.
3. A larger, consented, consultant-supplied set before any reliability claim (this one is 24 stock photos, one reviewer).
   Compare mask quality across skin tones deliberately; here nothing looked skin-tone-dependent, but 24 is too few to say.
4. Fabric change (generative, masked): evaluate FLUX.2 klein 4B (Apache 2.0, accepts a reference swatch) and SDXL
   inpaint against this deterministic baseline, always composited back through the same mask and verified the same way.
5. A `PhotoStore` interface (local private folder first) and pre-generated previews in the app (stage 0b), after the
   consultant has judged the look. No live GPU endpoint until the app has login (`docs/DEPLOY.md`). Reject
   multi-person photos or ask which person.

## Licences and data

The parser inherits the **NVIDIA Source Code License for SegFormer**; read its commercial terms before any paid use.
The method here (Lab arithmetic) has no model licence. Photographs: Pexels licence, stock only.

## Revert

Nothing outside this folder was changed, no service was touched, and ComfyUI was not modified.

```bash
rm -r experiments/garment-preview/.venv experiments/garment-preview/out experiments/garment-preview/raw   # 6 GB
# model weights (~250 MB) live in the Hugging Face cache: remove the folder
#   ~/.cache/huggingface/hub/models--fashn-ai--fashn-human-parser   (and its blob under hub/blobs/)
git switch main && git branch -D experiment-garment-preview                                              # drops the code
```
