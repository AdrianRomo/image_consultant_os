"""python -m garment_preview run PHOTO... --garment top --target '#8a3b2a' [--target ...] --out out/

For each photo and colour it writes, under --out:
  <photo>.<garment>.<hex>.png        the result, lossless (verification is on this file, not on a JPEG)
  <photo>.<garment>.mask.png         the edit mask (white = may change)
  <photo>.<garment>.<hex>.sheet.jpg  original | mask | result | pixels that changed
and one report.json with every check. Exit status is 1 when any check fails.
"""
from __future__ import annotations

import argparse
import json
import sys
import time
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw

from . import labels as L
from .masks import build_masks, pick_garment
from .parse import Parser, load_rgb
from .recolor import parse_hex, recolor
from .verify import DEFAULT_DELTA_E, verify

PANEL_H = 640


def _panel(arr: np.ndarray, caption: str) -> Image.Image:
    im = Image.fromarray(arr)
    im = im.resize((round(im.width * PANEL_H / im.height), PANEL_H), Image.LANCZOS)
    canvas = Image.new("RGB", (im.width, PANEL_H + 26), (22, 20, 17))
    canvas.paste(im, (0, 26))
    ImageDraw.Draw(canvas).text((8, 8), caption, fill=(246, 241, 231))
    return canvas


def _sheet(src, masks, out, report, hex_) -> Image.Image:
    tint = src.copy()
    live = masks.alpha > 0
    tint[live] = (0.5 * tint[live] + 0.5 * np.array([220, 60, 60])).astype(np.uint8)
    tint[masks.sacred & ~live] = (0.75 * tint[masks.sacred & ~live] + 0.25 * np.array([60, 120, 220])).astype(np.uint8)
    changed = np.where(np.any(src != out, axis=2)[..., None], 255, 0).astype(np.uint8).repeat(3, axis=2)
    verdict = "OK" if report.ok else "FAIL"
    panels = [
        _panel(src, "original"),
        _panel(tint, "red = may change, blue = person (protected)"),
        _panel(out, f"{hex_}  dE2000 {report.delta_e2000}  {verdict}"),
        _panel(changed, f"changed pixels: {int(np.any(src != out, axis=2).sum())}  on the person: {report.sacred_changed}"),
    ]
    sheet = Image.new("RGB", (sum(p.width for p in panels) + 6 * (len(panels) - 1), panels[0].height), (22, 20, 17))
    x = 0
    for p in panels:
        sheet.paste(p, (x, 0))
        x += p.width + 6
    return sheet


def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(prog="garment_preview")
    sub = ap.add_subparsers(dest="cmd", required=True)
    run = sub.add_parser("run", help="recolour a garment and verify the result")
    run.add_argument("photos", nargs="+")
    run.add_argument("--garment", choices=["auto", *sorted(L.GARMENTS)], default="top", help="auto = the largest garment found")
    run.add_argument("--target", action="append", required=True, help="hex colour; repeat for several")
    run.add_argument("--out", default="out")
    run.add_argument("--max-delta-e", type=float, default=DEFAULT_DELTA_E)
    args = ap.parse_args(argv)

    out_dir = Path(args.out)
    out_dir.mkdir(parents=True, exist_ok=True)
    parser = Parser()
    rows, failed = [], False
    for photo in args.photos:
        stem = Path(photo).stem
        src = load_rgb(photo)
        t0 = time.perf_counter()
        label_map = parser.labels(src)
        t_parse = time.perf_counter() - t0
        garment = pick_garment(label_map) if args.garment == "auto" else args.garment
        masks = build_masks(label_map, garment)
        Image.fromarray((masks.alpha * 255).astype(np.uint8)).save(out_dir / f"{stem}.{garment}.mask.png")
        for hex_ in args.target:
            tgt = parse_hex(hex_)
            tag = hex_.lstrip("#").lower()
            t1 = time.perf_counter()
            result = recolor(src, masks.alpha, masks.hard, tgt)
            t_edit = time.perf_counter() - t1
            png = out_dir / f"{stem}.{garment}.{tag}.png"
            Image.fromarray(result).save(png)
            # Verify the file that was written, not the array in memory.
            on_disk = np.asarray(Image.open(png).convert("RGB"))
            report = verify(src, on_disk, masks, tgt, max_delta_e=args.max_delta_e)
            _sheet(src, masks, on_disk, report, hex_).save(out_dir / f"{stem}.{garment}.{tag}.sheet.jpg", quality=90)
            failed |= not report.ok
            rows.append({"photo": photo, "garment": garment, "target": hex_, "parse_s": round(t_parse, 3), "edit_s": round(t_edit, 3), **report.to_dict()})
            flag = "FAIL" if not report.ok else "LOOK" if report.warnings else "ok  "
            print(f"{flag} {stem:<12} {garment:<5} {hex_}  dE2000 {report.delta_e2000:>5}  person px changed {report.sacred_changed}  skin-like {report.skin_like_fraction}  mixed {report.mixed_fraction}  edit {t_edit:.2f}s", *report.reasons, *[f"[warn] {w}" for w in report.warnings])
    (out_dir / "report.json").write_text(json.dumps(rows, indent=2))
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
