import numpy as np
import pytest

from conftest import H, W, make_scene
from garment_preview import labels as L
from garment_preview.layers import choose_candidate, garment_at, to_pixels
from garment_preview.masks import build_masks
from garment_preview.recolor import parse_hex, recolor
from garment_preview.verify import verify


def layered_scene():
    """A blazer (dark blue, upper part) over a shirt (white, lower part): the parser calls both 'top'."""
    rgb, labels = make_scene((30, 40, 90))
    rgb[270:380, 110:290] = (235, 235, 230)  # the shirt; its label is still TOP
    shirt = np.zeros((H, W), bool)
    shirt[270:380, 110:290] = True
    return rgb, labels, shirt


@pytest.mark.parametrize("seed", range(6))
def test_a_restriction_can_only_narrow_never_widen(seed):
    _, labels = make_scene()
    free = build_masks(labels, "top")
    rng = np.random.default_rng(seed)
    wild = [
        np.ones((H, W), bool),  # "the model says everything"
        np.zeros((H, W), bool),
        rng.random((H, W)) > 0.5,
        np.isin(labels, (L.FACE, L.HAIR, L.ARMS, L.HANDS, L.TORSO)),  # the model picked the person
        np.isin(labels, (L.BACKGROUND,)),
    ]
    for restrict in wild:
        m = build_masks(labels, "top", restrict=restrict)
        assert not (m.hard & ~free.hard).any()  # nothing outside what the parser allowed
        assert not (m.hard & m.sacred).any()  # nothing on the person
        assert (m.alpha[~m.hard] == 0).all()


def test_choosing_one_layer_leaves_the_other_byte_identical_and_passes_verification():
    rgb, labels, shirt = layered_scene()
    outer = ~shirt  # the click chose the blazer
    masks = build_masks(labels, "top", restrict=outer)
    target = parse_hex("#8a3b2a")
    out = recolor(rgb, masks.alpha, masks.hard, target)
    inner_core = shirt & (np.isin(labels, (L.TOP,)))
    assert np.array_equal(out[inner_core], rgb[inner_core])  # the shirt is exactly as it was
    report = verify(rgb, out, masks, target)
    assert report.ok, report.reasons
    assert report.delta_e2000 < 1.0  # and the blazer lands on the colour (not dragged by the shirt)
    assert not any("different colour" in w for w in report.warnings)  # the mixed-colour flag is quiet once one layer is chosen


def test_without_a_choice_both_layers_are_recoloured_and_the_flag_fires():
    rgb, labels, _ = layered_scene()
    masks = build_masks(labels, "top")
    target = parse_hex("#8a3b2a")
    report = verify(rgb, recolor(rgb, masks.alpha, masks.hard, target), masks, target)
    assert any("different colour" in w for w in report.warnings)


def test_restrict_size_must_match():
    _, labels = make_scene()
    with pytest.raises(ValueError):
        build_masks(labels, "top", restrict=np.ones((3, 3), bool))


def test_points_are_fractions_of_the_photo():
    assert to_pixels([(0.0, 0.0), (1.0, 1.0), (0.5, 0.25)], (400, 200)) == [(0, 0), (199, 399), (100, 100)]
    for bad in [(1.2, 0.5), (-0.1, 0.5), (200, 300)]:
        with pytest.raises(ValueError):
            to_pixels([bad], (400, 200))


def test_garment_at_reads_the_label_under_the_click():
    _, labels = make_scene()
    assert garment_at(labels, (200 / W, 260 / H)) == "top"
    assert garment_at(labels, (0.02, 0.02)) is None  # background


def test_choose_candidate_takes_the_largest_guess_that_stays_inside_the_garment():
    wanted = np.zeros((100, 100), bool)
    wanted[20:90, 20:90] = True
    button = np.zeros_like(wanted); button[50:54, 50:54] = True  # a part
    jacket = np.zeros_like(wanted); jacket[20:90, 20:90] = True  # the whole layer
    person = np.zeros_like(wanted); person[0:100, 0:100] = True  # spills far outside
    idx, inside = choose_candidate([button, jacket, person], [0.9, 0.8, 0.95], wanted)
    assert idx == 1 and inside == pytest.approx(1.0)


def test_choose_candidate_falls_back_to_the_most_inside_when_none_qualifies():
    wanted = np.zeros((100, 100), bool)
    wanted[0:10, 0:10] = True
    a = np.zeros_like(wanted); a[0:50, 0:50] = True  # 4% inside
    b = np.zeros_like(wanted); b[0:20, 0:20] = True  # 25% inside
    idx, _ = choose_candidate([a, b], [0.9, 0.5], wanted)
    assert idx == 1
