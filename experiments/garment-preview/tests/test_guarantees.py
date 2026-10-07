import numpy as np
import pytest
from skimage import color

from conftest import make_scene
from garment_preview import labels as L
from garment_preview.masks import build_masks
from garment_preview.recolor import parse_hex, recolor
from garment_preview.verify import verify

TARGETS = ["#8a3b2a", "#c9a27a", "#f2efe6", "#1c2a4a", "#2f6b4f", "#b0306b"]


def run(garment_rgb, target_hex, **kw):
    rgb, labels = make_scene(garment_rgb)
    masks = build_masks(labels, "top", **kw)
    target = parse_hex(target_hex)
    out = recolor(rgb, masks.alpha, masks.hard, target)
    return rgb, labels, masks, target, out


def test_edit_mask_never_touches_the_person():
    _, labels = make_scene()
    for guard in (1, 2, 5):
        m = build_masks(labels, "top", guard_px=guard)
        assert not (m.hard & m.sacred).any()
        assert m.hard.any()


def test_alpha_is_zero_outside_the_hard_mask():
    _, labels = make_scene()
    m = build_masks(labels, "top")
    assert (m.alpha[~m.hard] == 0).all()
    assert m.alpha.max() == pytest.approx(1.0)


@pytest.mark.parametrize("garment_rgb", [(30, 40, 90), (240, 235, 225), (120, 120, 120)])
@pytest.mark.parametrize("target", TARGETS)
def test_nothing_outside_the_mask_changes(garment_rgb, target):
    rgb, _, masks, _, out = run(garment_rgb, target)
    assert out.shape == rgb.shape and out.dtype == np.uint8
    assert np.array_equal(out[~(masks.alpha > 0)], rgb[~(masks.alpha > 0)])
    assert np.array_equal(out[masks.sacred], rgb[masks.sacred])  # face, hair, skin, hands: byte-identical


@pytest.mark.parametrize("garment_rgb", [(30, 40, 90), (240, 235, 225), (120, 120, 120)])
@pytest.mark.parametrize("target", TARGETS)
def test_colour_lands_on_the_target_and_verifier_agrees(garment_rgb, target):
    rgb, _, masks, tgt, out = run(garment_rgb, target)
    report = verify(rgb, out, masks, tgt)
    assert report.ok, report.reasons
    assert report.delta_e2000 < 4.0
    assert report.sacred_changed == 0 and report.outside_changed == 0 and report.edit_overlaps_sacred == 0


def test_shading_survives_the_recolour():
    rgb, _, masks, _, out = run((30, 40, 90), "#c9a27a")
    inner = masks.alpha >= 0.99
    before = color.rgb2lab(rgb.astype(np.float64) / 255)[..., 0][inner]
    after = color.rgb2lab(out.astype(np.float64) / 255)[..., 0][inner]
    assert np.corrcoef(before, after)[0, 1] > 0.95  # folds and the left-to-right ramp are still there


def test_a_tampered_pixel_on_the_face_is_caught():
    rgb, labels, masks, tgt, out = run((30, 40, 90), "#8a3b2a")
    ys, xs = np.where(labels == L.FACE)
    out[ys[0], xs[0]] = (0, 0, 0)  # one face pixel altered
    report = verify(rgb, out, masks, tgt)
    assert not report.ok
    assert report.sacred_changed == 1 and report.outside_changed == 1


def test_a_change_outside_the_mask_is_caught_even_on_background():
    rgb, _, masks, tgt, out = run((30, 40, 90), "#8a3b2a")
    out[5, 5] = (0, 0, 0)
    report = verify(rgb, out, masks, tgt)
    assert not report.ok and report.outside_changed == 1


def test_a_mask_that_leaks_onto_skin_is_caught():
    rgb, labels = make_scene()
    masks = build_masks(labels, "top")
    leaky = masks.hard | (labels == L.ARMS)  # simulate a segmentation error that includes the arms
    from garment_preview.masks import Masks
    bad = Masks(hard=leaky, alpha=leaky.astype(np.float32), sacred=masks.sacred, garment_found=0, face_found=masks.face_found)
    out = recolor(rgb, bad.alpha, bad.hard, parse_hex("#8a3b2a"))
    report = verify(rgb, out, bad, parse_hex("#8a3b2a"))
    assert not report.ok and report.edit_overlaps_sacred > 0 and report.sacred_changed > 0


def test_missing_garment_is_a_failure_not_a_silent_pass():
    rgb, labels = make_scene()
    labels[labels == L.TOP] = L.BACKGROUND
    masks = build_masks(labels, "top")
    out = recolor(rgb, masks.alpha, masks.hard, parse_hex("#8a3b2a"))
    assert np.array_equal(out, rgb)
    report = verify(rgb, out, masks, parse_hex("#8a3b2a"))
    assert not report.ok and any("not found" in r for r in report.reasons)


def test_no_face_is_a_warning():
    rgb, labels = make_scene()
    labels[labels == L.FACE] = L.BACKGROUND
    masks = build_masks(labels, "top")
    out = recolor(rgb, masks.alpha, masks.hard, parse_hex("#8a3b2a"))
    report = verify(rgb, out, masks, parse_hex("#8a3b2a"))
    assert report.ok and any("no face" in w for w in report.warnings)


def test_unknown_garment_and_bad_hex_are_rejected():
    _, labels = make_scene()
    with pytest.raises(ValueError):
        build_masks(labels, "cape")
    for bad in ("", "#12", "#gggggg", "12345"):
        with pytest.raises(ValueError):
            parse_hex(bad)
    assert parse_hex("#abc") == (170, 187, 204)


def test_parser_labels_match_the_package():
    fashn = pytest.importorskip("fashn_human_parser")
    assert {int(k): v for k, v in fashn.IDS_TO_LABELS.items()} == L.NAMES
    assert set(fashn.IDENTITY_LABELS) <= {L.NAMES[i] for i in L.SACRED}


def test_a_second_material_in_the_mask_is_flagged_for_review():
    rgb, labels = make_scene((30, 40, 90))
    clean = build_masks(labels, "top")
    out = recolor(rgb, clean.alpha, clean.hard, parse_hex("#8a3b2a"))
    assert not any("different colour" in w for w in verify(rgb, out, clean, parse_hex("#8a3b2a")).warnings)
    # an inner white shirt that the parser also called "top": a quarter of the garment is another colour
    rgb2 = rgb.copy()
    rgb2[170:300, 150:230] = (235, 235, 230)
    mixed = build_masks(labels, "top")
    out2 = recolor(rgb2, mixed.alpha, mixed.hard, parse_hex("#8a3b2a"))
    report = verify(rgb2, out2, mixed, parse_hex("#8a3b2a"))
    assert report.ok  # nothing unsafe happened to the person...
    assert any("different colour" in w for w in report.warnings)  # ...but a person should look before this goes out
    assert report.mixed_fraction > 0.04
