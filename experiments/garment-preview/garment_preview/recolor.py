"""Deterministic recolour: no generative model, so nothing can invent or alter a face.

Inside the edit mask the garment's colour is replaced and its shading is kept: the original lightness *variation*
(folds, seams, texture) is carried over, centred on the target's lightness, and the chroma is the target's. Pixels
outside `alpha > 0` are copied from the source untouched.

Two refinements found on real photographs (docs in README, "What the first real photographs showed"):
- Lightness variation is split in two. Broad shading (folds, light falling off) is scaled so a dark garment
  recoloured light still has body; fine detail (knit, pinstripes, film grain) is scaled far less, or the grain of a
  near-black garment is amplified into noise.
- The colour is calibrated in a loop: after rendering, the median colour of the garment is measured, and the
  residual to the target is fed back, so dark sources and gamut clipping do not leave the result a shade off.
"""
from __future__ import annotations

import numpy as np
from scipy import ndimage as ndi
from skimage import color

HEX_DIGITS = set("0123456789abcdefABCDEF")
CALIBRATION_ROUNDS = 5
CALIBRATION_SAMPLE = 150_000  # pixels used to measure the median while calibrating
CALIBRATION_DONE = 0.25  # dE2000 at which calibration stops


def parse_hex(value: str) -> tuple[int, int, int]:
    s = value.strip().lstrip("#")
    if len(s) == 3:
        s = "".join(c * 2 for c in s)
    if len(s) != 6 or not set(s) <= HEX_DIGITS:
        raise ValueError(f"not a hex colour: {value!r}")
    return int(s[0:2], 16), int(s[2:4], 16), int(s[4:6], 16)


def rgb_to_lab(rgb: tuple[int, int, int] | np.ndarray) -> np.ndarray:
    arr = np.asarray(rgb, dtype=np.float64).reshape(1, 1, 3) / 255.0
    return color.rgb2lab(arr).reshape(3)


def shading_gain(source_mean_l: float, target_l: float) -> float:
    """How much of the original broad lightness variation to keep.

    A dark garment recoloured to a light one has little lightness variation to carry over (folds in black cloth are
    subtle), so the variation is amplified a little; a light garment recoloured dark is compressed a little. The gain
    is the square root of the lightness ratio, clamped, so the effect is gentle. 1.0 means "keep exactly".
    """
    return float(np.clip(np.sqrt((target_l + 10.0) / (source_mean_l + 10.0)), 0.6, 2.5))


def _render(l_low, l_high, mean_l, g_low, g_high, t_lab) -> np.ndarray:
    lab = np.empty(l_low.shape + (3,), np.float64)
    lab[..., 0] = np.clip(t_lab[0] + (l_low - mean_l) * g_low + l_high * g_high, 0.0, 100.0)
    lab[..., 1] = t_lab[1]
    lab[..., 2] = t_lab[2]
    return np.clip(color.lab2rgb(lab), 0.0, 1.0)


def _median_lab(rgb01: np.ndarray) -> np.ndarray:
    return np.median(color.rgb2lab(rgb01.reshape(-1, 1, 3)).reshape(-1, 3), axis=0)


def recolor(
    src: np.ndarray,
    alpha: np.ndarray,
    hard: np.ndarray,
    target_rgb: tuple[int, int, int],
    *,
    gain: float | None = None,
    texture_gain_cap: float = 1.3,
    calibrate: bool = True,
) -> np.ndarray:
    """Return a copy of `src` (uint8 HxWx3) with the masked area recoloured to `target_rgb`.

    `alpha` (float, 0 outside `hard`) is the blend weight, `hard` the pixels the lightness statistics come from.
    Every pixel where alpha == 0 is returned byte-for-byte as it was in `src`.
    """
    if src.dtype != np.uint8 or src.ndim != 3 or src.shape[2] != 3:
        raise ValueError("src must be an HxWx3 uint8 RGB array")
    if alpha.shape != src.shape[:2] or hard.shape != src.shape[:2]:
        raise ValueError("masks must match the image size")
    if np.any(alpha[~hard] != 0):
        raise ValueError("alpha must be 0 outside the hard mask")
    out = src.copy()
    live = alpha > 0
    if not live.any():
        return out

    ys, xs = np.where(live)
    y0, y1, x0, x1 = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
    crop = src[y0:y1, x0:x1].astype(np.float64) / 255.0
    lab = color.rgb2lab(crop)
    inside = hard[y0:y1, x0:x1]
    core = alpha[y0:y1, x0:x1] >= 0.99
    if core.sum() < 50:
        core = inside
    l_chan = lab[..., 0]
    mean_l = float(l_chan[inside].mean())

    # Broad shading vs fine detail. Sigma is a fraction of the width so it means the same at any resolution.
    sigma = max(1.5, 0.003 * src.shape[1])
    l_low = ndi.gaussian_filter(l_chan, sigma)
    l_high = l_chan - l_low

    t_lab = rgb_to_lab(target_rgb)
    g_low = shading_gain(mean_l, t_lab[0]) if gain is None else gain
    g_high = min(g_low, texture_gain_cap)

    # Calibration measures on a fixed random sample of the interior, so five rounds stay cheap on a 2400x3600 photo.
    pick = np.flatnonzero(core.ravel())
    if len(pick) > CALIBRATION_SAMPLE:
        pick = np.random.default_rng(0).choice(pick, CALIBRATION_SAMPLE, replace=False)
    flat = lambda a: a.reshape(-1)[pick]  # noqa: E731
    sample = (flat(l_low), flat(l_high))

    t_eff = t_lab.copy()
    if calibrate:
        for _ in range(CALIBRATION_ROUNDS):
            got = _median_lab(_render(sample[0], sample[1], mean_l, g_low, g_high, t_eff))
            err = t_lab - got
            if float(color.deltaE_ciede2000(got.reshape(1, 1, 3), t_lab.reshape(1, 1, 3)).item()) < CALIBRATION_DONE:
                break
            t_eff = t_eff + err
            t_eff[0] = np.clip(t_eff[0], 0.0, 100.0)
            t_eff[1:] = np.clip(t_eff[1:], -110.0, 110.0)
    recoloured = _render(l_low, l_high, mean_l, g_low, g_high, t_eff) * 255.0

    a = alpha[y0:y1, x0:x1].astype(np.float64)[..., None]
    blended = a * recoloured + (1.0 - a) * src[y0:y1, x0:x1].astype(np.float64)
    region = out[y0:y1, x0:x1]
    live_crop = live[y0:y1, x0:x1]
    region[live_crop] = np.rint(blended[live_crop]).astype(np.uint8)
    return out
