"""Turn a label map into the one thing the edit is allowed to touch.

The guarantee of this experiment starts here: `hard` (where pixels may change) is built from garment labels and then
has everything near the person (face, hair, skin, glasses, jewellery) subtracted. `alpha` is a soft version of `hard`
that is exactly 0 wherever `hard` is False, so feathering can never spread an edit outside the mask.
"""
from __future__ import annotations

from dataclasses import dataclass

import numpy as np
from scipy import ndimage as ndi

from . import labels


@dataclass(frozen=True)
class Masks:
    hard: np.ndarray  # bool HxW: pixels the edit may change
    alpha: np.ndarray  # float32 HxW in [0, 1]: blend weight, 0 outside `hard`
    sacred: np.ndarray  # bool HxW: the person (never edited, never inside `hard`)
    garment_found: int  # pixels the parser labelled as the requested garment, before any trimming
    face_found: int  # pixels the parser labelled as face
    face: np.ndarray | None = None  # bool HxW: face pixels, for the colour-based second opinion in verify.py


def _disk(radius: int) -> np.ndarray:
    y, x = np.ogrid[-radius : radius + 1, -radius : radius + 1]
    return (x * x + y * y) <= radius * radius


def _grow(mask: np.ndarray, radius: int) -> np.ndarray:
    return ndi.binary_dilation(mask, structure=_disk(radius)) if radius > 0 else mask


def _drop_specks(mask: np.ndarray, min_fraction: float) -> np.ndarray:
    """Remove connected pieces smaller than `min_fraction` of the largest piece (parser noise, stray labels)."""
    pieces, n = ndi.label(mask)
    if n <= 1:
        return mask
    sizes = ndi.sum(mask, pieces, index=np.arange(1, n + 1))
    keep = np.flatnonzero(sizes >= sizes.max() * min_fraction) + 1
    return np.isin(pieces, keep)


def build_masks(
    label_map: np.ndarray,
    garment: str,
    *,
    guard_px: int | None = None,
    body_guard_px: int | None = None,
    erode_px: int | None = None,
    feather_px: float | None = None,
    min_piece: float = 0.02,
    restrict: np.ndarray | None = None,
) -> Masks:
    """`garment` is a key of `labels.GARMENTS`. Pixel radii default to a fraction of the image width.

    `guard_px` is the margin kept around face, hair, glasses, jewellery and hat; `body_guard_px` the narrower one
    around the rest of the skin and the bag.

    `restrict` (bool HxW, e.g. one layer chosen with a click) can only NARROW the edit: it is intersected with the
    garment mask, so whatever produced it can never widen an edit onto the person or the background."""
    if garment not in labels.GARMENTS:
        raise ValueError(f"unknown garment {garment!r}; choose from {sorted(labels.GARMENTS)}")
    width = label_map.shape[1]
    guard_px = max(2, round(width * 0.005)) if guard_px is None else guard_px
    body_guard_px = max(1, round(width * 0.0008)) if body_guard_px is None else body_guard_px
    erode_px = max(1, round(width * 0.001)) if erode_px is None else erode_px
    feather_px = max(0.5, width * 0.0015) if feather_px is None else feather_px

    wanted = np.isin(label_map, labels.GARMENTS[garment])
    if restrict is not None and restrict.shape != wanted.shape:
        raise ValueError("restrict must match the label map's size")
    sacred = np.isin(label_map, labels.SACRED)
    # Subtract the person (grown by a margin that is wide for identity, narrow for body skin), then pull the edge
    # in a little so the soft edge never reaches the boundary the parser drew.
    keep_out = _grow(np.isin(label_map, labels.IDENTITY), guard_px) | _grow(np.isin(label_map, labels.BODY), body_guard_px)
    hard = wanted & ~keep_out & ~sacred
    if restrict is not None:
        hard &= restrict
    if erode_px:
        hard = ndi.binary_erosion(hard, structure=_disk(erode_px))
    hard = _drop_specks(hard, min_piece)
    # Feather inside the mask only: blur, then multiply by the hard mask so alpha is 0 wherever hard is False.
    alpha = ndi.gaussian_filter(hard.astype(np.float32), sigma=feather_px) * hard
    # Rescale so the interior is a clean 1.0 (the blur lowers values near thin parts of the mask).
    peak = float(alpha.max())
    if peak > 0:
        alpha = np.clip(alpha / peak, 0.0, 1.0).astype(np.float32)
        alpha[~hard] = 0.0
    return Masks(
        hard=hard,
        alpha=alpha,
        sacred=sacred,
        garment_found=int(wanted.sum()),
        face_found=int((label_map == labels.FACE).sum()),
        face=label_map == labels.FACE,
    )


def pick_garment(label_map: np.ndarray) -> str:
    """The garment with the most pixels (top, dress, skirt or pants). Falls back to "top" when none is found, so the
    verifier reports "garment not found" instead of this function guessing."""
    counts = {name: int(np.isin(label_map, ids).sum()) for name, ids in labels.GARMENTS.items()}
    best = max(counts, key=counts.get)
    return best if counts[best] else "top"
