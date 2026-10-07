"""Independent checks on a finished edit. These read only the source, the result and the masks; they share no code
path with the recolour, so a bug there cannot hide here."""
from __future__ import annotations

from dataclasses import asdict, dataclass, field

import numpy as np
from skimage import color

from .masks import Masks
from .recolor import rgb_to_lab

DEFAULT_DELTA_E = 4.0  # CIEDE2000 between the garment's median colour and the target; ~2 is "just noticeable", ~5 is "different shade"
MIN_GARMENT_FRACTION = 0.01  # less than 1% of the picture is "no garment found"
MAX_GARMENT_FRACTION = 0.70
SKIN_LIKE_WARN = 0.30  # share of edited pixels that already looked like the face's own colour before the edit
SKIN_AB_RADIUS = 8.0  # distance in the Lab a-b plane to the face's median
SKIN_L_RADIUS = 25.0
MIXED_FAR = 40.0  # Lab distance from the mask's median colour that counts as "a different colour"
MIXED_WARN = 0.04  # share of the edited area that is a different colour. Tuned on 24 photographs by eye: it flagged 8 of the 10
# visibly wrong masks (an inner shirt, a scarf, a curtain) and none of the 14 good ones. Indicative, not proven.


@dataclass
class Report:
    ok: bool
    reasons: list[str] = field(default_factory=list)
    warnings: list[str] = field(default_factory=list)
    sacred_pixels: int = 0
    sacred_changed: int = 0
    outside_changed: int = 0
    edit_overlaps_sacred: int = 0
    garment_fraction: float = 0.0
    face_found: int = 0
    target_lab: list[float] = field(default_factory=list)
    achieved_lab: list[float] = field(default_factory=list)
    delta_e2000: float = float("nan")
    skin_like_fraction: float | None = None
    mixed_fraction: float | None = None

    def to_dict(self) -> dict:
        return asdict(self)


def _median_lab(rgb: np.ndarray, where: np.ndarray) -> np.ndarray:
    px = rgb[where].astype(np.float64).reshape(-1, 1, 3) / 255.0
    return np.median(color.rgb2lab(px).reshape(-1, 3), axis=0)


def skin_like_fraction(src: np.ndarray, masks: Masks) -> float | None:
    """A second opinion that does not trust the parser's labels: of the pixels about to be edited, what share had the
    same colour as this person's face in the *original* photo? A leak of the mask onto an arm or neck shows up here
    even when the parser called those pixels "garment". A beige knit also scores high, so this is a warning for the
    consultant to look, never a failure."""
    if masks.face is None or masks.face.sum() < 200:
        return None
    core = masks.alpha >= 0.99
    if core.sum() < 50:
        return None
    rng = np.random.default_rng(0)

    def sample(where):
        idx = np.flatnonzero(where.ravel())
        idx = rng.choice(idx, min(len(idx), 100_000), replace=False)
        return color.rgb2lab(src.reshape(-1, 3)[idx].reshape(-1, 1, 3).astype(np.float64) / 255.0).reshape(-1, 3)

    face = np.median(sample(masks.face), axis=0)
    lab = sample(core)
    near = (np.hypot(lab[:, 1] - face[1], lab[:, 2] - face[2]) < SKIN_AB_RADIUS) & (np.abs(lab[:, 0] - face[0]) < SKIN_L_RADIUS)
    return float(near.mean())


def mixed_fraction(src: np.ndarray, masks: Masks) -> float | None:
    """How much of the edit area was, in the original, a very different colour from the rest of it? One garment is
    mostly one colour (shading and stripes aside); a blazer with a shirt under it, a scarf or a curtain that the parser
    called "garment" are not. The parser cannot tell the consultant that, so this does."""
    core = masks.alpha >= 0.99
    if core.sum() < 50:
        return None
    idx = np.flatnonzero(core.ravel())
    idx = np.random.default_rng(0).choice(idx, min(len(idx), 30_000), replace=False)
    lab = color.rgb2lab(src.reshape(-1, 3)[idx].reshape(-1, 1, 3).astype(np.float64) / 255.0).reshape(-1, 3)
    return float((np.linalg.norm(lab - np.median(lab, axis=0), axis=1) > MIXED_FAR).mean())


def verify(
    src: np.ndarray,
    result: np.ndarray,
    masks: Masks,
    target_rgb: tuple[int, int, int],
    *,
    max_delta_e: float = DEFAULT_DELTA_E,
) -> Report:
    reasons: list[str] = []
    warnings: list[str] = []
    changed = np.any(src != result, axis=2)

    sacred_changed = int((changed & masks.sacred).sum())
    outside_changed = int((changed & ~(masks.alpha > 0)).sum())
    overlap = int((masks.hard & masks.sacred).sum())
    if sacred_changed:
        reasons.append(f"{sacred_changed} person pixels (face, hair, skin, accessories) changed")
    if outside_changed:
        reasons.append(f"{outside_changed} pixels outside the edit mask changed")
    if overlap:
        reasons.append(f"the edit mask overlaps the person by {overlap} pixels")

    fraction = float(masks.hard.sum()) / masks.hard.size
    if fraction < MIN_GARMENT_FRACTION:
        reasons.append(f"garment covers only {fraction:.2%} of the picture; probably not found")
    elif fraction > MAX_GARMENT_FRACTION:
        reasons.append(f"garment covers {fraction:.0%} of the picture; probably a wrong mask")

    if masks.face_found == 0:
        warnings.append("no face found: the face guard has nothing to protect, check the photo by eye")

    target_lab = rgb_to_lab(target_rgb)
    achieved = np.full(3, np.nan)
    de = float("nan")
    # Judge the colour on the interior of the mask (alpha ~ 1), where nothing is blended with the old colour.
    core = masks.alpha >= 0.99
    if core.sum() >= 50:
        achieved = _median_lab(result, core)
        de = float(color.deltaE_ciede2000(achieved.reshape(1, 1, 3), target_lab.reshape(1, 1, 3)).item())
        if de > max_delta_e:
            reasons.append(f"colour is off target by dE2000 {de:.1f} (limit {max_delta_e})")
    elif fraction >= MIN_GARMENT_FRACTION:
        warnings.append("mask interior too small to measure the colour")

    skin_like = skin_like_fraction(src, masks)
    if skin_like is not None and skin_like > SKIN_LIKE_WARN:
        warnings.append(f"{skin_like:.0%} of the edited pixels were the same colour as this person's face before the edit: check the mask by eye")

    mixed = mixed_fraction(src, masks)
    if mixed is not None and mixed > MIXED_WARN:
        warnings.append(f"{mixed:.0%} of the edited area was a very different colour from the rest (an inner layer, a scarf or the background?): check which parts changed")

    return Report(
        ok=not reasons,
        reasons=reasons,
        warnings=warnings,
        sacred_pixels=int(masks.sacred.sum()),
        sacred_changed=sacred_changed,
        outside_changed=outside_changed,
        edit_overlaps_sacred=overlap,
        garment_fraction=round(fraction, 4),
        face_found=masks.face_found,
        target_lab=[round(float(v), 2) for v in target_lab],
        achieved_lab=[round(float(v), 2) for v in achieved],
        delta_e2000=round(de, 2) if de == de else de,
        skin_like_fraction=None if skin_like is None else round(skin_like, 3),
        mixed_fraction=None if mixed is None else round(mixed, 3),
    )
