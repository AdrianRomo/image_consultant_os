"""Choose which layer of a garment to recolour with a click.

The parser calls a blazer and the shirt under it both "top". A click, resolved by a promptable segmentation model
(SAM 2.1, Apache 2.0, ~73M parameters), says which one is meant. The result is only ever used to NARROW the parser's
garment mask (`build_masks(..., restrict=layer)` intersects it), so the segmentation model cannot widen an edit onto a
face, skin or the background: the guarantee in masks.py and verify.py is unchanged whatever SAM returns.

Points are fractions of the photo (0..1, x then y), so they mean the same at any resolution and are what a web
page would send.
"""
from __future__ import annotations

from dataclasses import dataclass

import numpy as np
from PIL import Image

from . import labels as L

MODEL_ID = "facebook/sam2.1-hiera-base-plus"
INSIDE_MIN = 0.85  # a candidate must be at least this much inside the parser's garment mask to be "a layer of it"


@dataclass(frozen=True)
class Layer:
    mask: np.ndarray  # bool HxW: the chosen layer, already intersected with the parser's garment mask
    candidate: int  # which of the model's candidates was chosen
    inside: float  # share of that candidate that lies inside the garment mask
    score: float  # the model's own confidence for it
    click_inside: bool  # whether the first positive click is inside the result


def to_pixels(points: list[tuple[float, float]], shape: tuple[int, int]) -> list[tuple[int, int]]:
    h, w = shape
    out = []
    for x, y in points:
        if not (0.0 <= x <= 1.0 and 0.0 <= y <= 1.0):
            raise ValueError(f"point {(x, y)} is not a fraction of the photo (0..1, 0..1)")
        out.append((min(w - 1, round(x * w)), min(h - 1, round(y * h))))
    return out


def garment_at(label_map: np.ndarray, point: tuple[float, float], radius_frac: float = 0.01) -> str | None:
    """The garment label under a click (most common garment label within a small window), or None."""
    (x, y), = to_pixels([point], label_map.shape)
    r = max(2, round(label_map.shape[1] * radius_frac))
    win = label_map[max(0, y - r) : y + r + 1, max(0, x - r) : x + r + 1]
    best, best_n = None, 0
    for name, ids in L.GARMENTS.items():
        n = int(np.isin(win, ids).sum())
        if n > best_n:
            best, best_n = name, n
    return best


def choose_candidate(candidates: list[np.ndarray], scores: list[float], wanted: np.ndarray) -> tuple[int, float]:
    """Pick the candidate that is "one whole layer of this garment".

    The model returns nested guesses for a click (a button, a sleeve, the whole jacket, sometimes the whole person).
    The one we want is the largest guess that still lies mostly inside the parser's garment mask: bigger than a part,
    but not spilling onto the person or the background. If none qualifies, take the one that is most inside."""
    inside = [float((c & wanted).sum()) / max(1, int(c.sum())) for c in candidates]
    area = [int((c & wanted).sum()) for c in candidates]
    ok = [i for i, v in enumerate(inside) if v >= INSIDE_MIN]
    if ok:
        best = max(ok, key=lambda i: (area[i], scores[i]))
    else:
        best = max(range(len(candidates)), key=lambda i: (inside[i], scores[i]))
    return best, inside[best]


class Segmenter:
    def __init__(self, model_id: str = MODEL_ID) -> None:
        import torch
        from transformers import Sam2Model, Sam2Processor

        self._torch = torch
        self._device = "cuda" if torch.cuda.is_available() else "cpu"
        self._processor = Sam2Processor.from_pretrained(model_id)
        self._model = Sam2Model.from_pretrained(model_id).to(self._device).eval()

    def candidates(self, rgb: np.ndarray, positive: list[tuple[int, int]], negative: list[tuple[int, int]]) -> tuple[list[np.ndarray], list[float]]:
        points = [list(p) for p in positive + negative]
        labels = [1] * len(positive) + [0] * len(negative)
        inputs = self._processor(images=Image.fromarray(rgb), input_points=[[points]], input_labels=[[labels]], return_tensors="pt").to(self._device)
        with self._torch.no_grad():
            out = self._model(**inputs, multimask_output=True)
        masks = self._processor.post_process_masks(out.pred_masks.cpu(), inputs["original_sizes"], binarize=True)[0][0]
        return [m.numpy() for m in masks], [float(s) for s in out.iou_scores.cpu().numpy().reshape(-1)]

    def layer(
        self,
        rgb: np.ndarray,
        wanted: np.ndarray,
        positive: list[tuple[float, float]],
        negative: list[tuple[float, float]] | None = None,
    ) -> Layer:
        """`wanted` is the parser's garment mask; `positive`/`negative` are fractional click points."""
        if not positive:
            raise ValueError("at least one positive point is needed")
        pos = to_pixels(positive, rgb.shape[:2])
        neg = to_pixels(negative or [], rgb.shape[:2])
        cands, scores = self.candidates(rgb, pos, neg)
        best, inside = choose_candidate(cands, scores, wanted)
        mask = cands[best] & wanted
        x, y = pos[0]
        return Layer(mask=mask, candidate=best, inside=inside, score=scores[best], click_inside=bool(mask[y, x]))
