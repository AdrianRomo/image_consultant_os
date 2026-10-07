"""A drawn scene with a known label map, so the guarantees can be tested without the parser model."""
import numpy as np
import pytest

from garment_preview import labels as L

H, W = 500, 400


def make_scene(garment_rgb=(30, 40, 90), seed=0):
    """Returns (rgb uint8 HxWx3, label map HxW). Layout: background; hair + face on top; a torso garment (with a
    horizontal shading ramp, folds and noise) touching the neck and both arms; hands at the bottom."""
    rng = np.random.default_rng(seed)
    labels = np.full((H, W), L.BACKGROUND, np.uint8)
    rgb = np.empty((H, W, 3), np.uint8)
    rgb[:] = (200, 200, 195)

    yy, xx = np.mgrid[0:H, 0:W]
    face = (xx - 200) ** 2 + (yy - 90) ** 2 < 55**2
    hair = ((xx - 200) ** 2 + (yy - 70) ** 2 < 70**2) & ~face & (yy < 110)
    garment = (yy >= 150) & (yy < 380) & (xx >= 110) & (xx < 290)
    arms = ((xx >= 70) & (xx < 110) | (xx >= 290) & (xx < 330)) & (yy >= 150) & (yy < 380)
    neck = (yy >= 140) & (yy < 150) & (xx >= 180) & (xx < 220)
    hands = (yy >= 380) & (yy < 420) & ((xx >= 70) & (xx < 110) | (xx >= 290) & (xx < 330))

    labels[garment] = L.TOP
    labels[face] = L.FACE
    labels[hair] = L.HAIR
    labels[arms] = L.ARMS
    labels[neck] = L.TORSO
    labels[hands] = L.HANDS

    skin = np.array((224, 172, 140), np.float64)
    for m in (face, arms, neck, hands):
        rgb[m] = skin
    rgb[hair] = (40, 28, 20)

    g = np.array(garment_rgb, np.float64)
    ramp = 0.75 + 0.5 * (xx - 110) / 180.0  # left darker, right lighter
    folds = 1.0 + 0.08 * np.sin(yy / 9.0)
    shade = np.clip(ramp * folds, 0.3, 1.6)[..., None]
    noise = rng.normal(0, 1.5, (H, W, 1))
    rgb[garment] = np.clip(g * shade[garment] + noise[garment], 0, 255)
    return rgb, labels


@pytest.fixture
def scene():
    return make_scene()
