"""Does a click behave? Two experiments with the real parser and the real segmentation model (no mocks).

  python eval_clicks.py raw layers.json

A. Stability: for each photo in the layers file, take that click as the reference, then click 8 other places
   well inside the same layer and report how much the resulting edit area differs (IoU against the reference).
B. Wild clicks: 20 clicks anywhere at all (face, hair, wall, hands...) on 6 photos. Whatever the model returns, the
   person must come out untouched; this counts how often a bad click is also *noticed* (verifier fail or warning).
"""
import json
import sys
from pathlib import Path

import numpy as np
from scipy import ndimage as ndi

from garment_preview import labels as L
from garment_preview.layers import Segmenter, garment_at
from garment_preview.masks import build_masks, pick_garment
from garment_preview.parse import Parser, load_rgb
from garment_preview.recolor import parse_hex, recolor
from garment_preview.verify import verify

TARGET = parse_hex("#8a3b2a")
WILD_PHOTOS = ["px12311581", "px30479371", "px20411585", "px6787553", "px19434331", "px7550887"]


def edit(src, labels, seg, point, avoid=()):
    garment = garment_at(labels, point) or pick_garment(labels)
    layer = seg.layer(src, np.isin(labels, L.GARMENTS[garment]), [point], list(avoid))
    return garment, layer, build_masks(labels, garment, restrict=layer.mask)


def classify(report, layer):
    """The same three-way verdict the command line gives: a click outside the chosen layer is a warning."""
    warned = bool(report.warnings) or not layer.click_inside
    return "fail" if not report.ok else "warning" if warned else "clean"


def main(raw: str, layers_file: str) -> int:
    layers = json.loads(Path(layers_file).read_text())
    parser, seg = Parser(), Segmenter()
    rng = np.random.default_rng(7)
    cache = {}

    def load(stem):
        if stem not in cache:
            src = load_rgb(f"{raw}/{stem}.jpg")
            cache[stem] = (src, parser.labels(src))
        return cache[stem]

    print("A. stability of a click (IoU of the edit area against the reference click; 1.0 = identical)")
    for stem, entry in layers.items():
        src, labels = load(stem)
        h, w = labels.shape
        _, _, ref = edit(src, labels, seg, tuple(entry["point"][0]))
        inner = ndi.binary_erosion(ref.hard, iterations=max(5, w // 80))
        ys, xs = np.nonzero(inner)
        if len(ys) < 50:
            print(f"   {stem:<12} reference layer too thin to sample")
            continue
        ious = []
        for i in rng.choice(len(ys), 8, replace=False):
            _, _, m = edit(src, labels, seg, (xs[i] / (w - 1), ys[i] / (h - 1)))
            ious.append((m.hard & ref.hard).sum() / max(1, (m.hard | ref.hard).sum()))
        print(f"   {stem:<12} min {min(ious):.2f}  median {np.median(ious):.2f}  max {max(ious):.2f}")

    print("\nB. wild clicks anywhere on the photo, 20 per photo")
    clean_hits = 0
    tally = {"clean on a garment pixel the parser called person or background": 0, "clicks": 0, "person changed": 0, "outside mask changed": 0, "fail": 0, "warning": 0, "clean": 0}
    for stem in WILD_PHOTOS:
        src, labels = load(stem)
        outcome = {"fail": 0, "warning": 0, "clean": 0}
        for _ in range(20):
            point = (float(rng.random()), float(rng.random()))
            _, layer, masks = edit(src, labels, seg, point)
            result = recolor(src, masks.alpha, masks.hard, TARGET)
            report = verify(src, result, masks, TARGET)
            tally["clicks"] += 1
            tally["person changed"] += report.sacred_changed
            tally["outside mask changed"] += report.outside_changed
            key = classify(report, layer)
            if key == "clean":
                clean_hits += 1
                tally["clean on a garment pixel the parser called person or background"] += int(labels[int(point[1] * (labels.shape[0] - 1)), int(point[0] * (labels.shape[1] - 1))] not in sum(L.GARMENTS.values(), ()))
            outcome[key] += 1
            tally[key] += 1
        print(f"   {stem:<12} clean {outcome['clean']:>2}  warning {outcome['warning']:>2}  fail {outcome['fail']:>2}")
    print("\n   totals:", tally)
    return 1 if tally["person changed"] or tally["outside mask changed"] else 0


if __name__ == "__main__":
    sys.exit(main(*sys.argv[1:3]))
