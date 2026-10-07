"""Thin wrapper over the FASHN human parser so the rest of the code never imports the model."""
from __future__ import annotations

import numpy as np
from PIL import Image, ImageOps


def load_rgb(path: str) -> np.ndarray:
    """Load a photo as uint8 RGB with its EXIF orientation applied (phones store portraits rotated)."""
    return np.asarray(ImageOps.exif_transpose(Image.open(path)).convert("RGB"))


class Parser:
    def __init__(self) -> None:
        from fashn_human_parser import FashnHumanParser  # heavy import, kept lazy

        self._parser = FashnHumanParser()  # picks the GPU when there is one

    def labels(self, rgb: np.ndarray) -> np.ndarray:
        """HxW uint8 label map at the photo's own resolution."""
        out = self._parser.predict(Image.fromarray(rgb))
        if out.shape != rgb.shape[:2]:
            raise RuntimeError(f"parser returned {out.shape}, expected {rgb.shape[:2]}")
        return out.astype(np.uint8)
