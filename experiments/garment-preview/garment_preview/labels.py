"""Label ids of the FASHN human parser (18 classes, SegFormer-B4), and how this experiment uses them.

Source of the ids: https://github.com/fashn-AI/fashn-human-parser (checked 2026-10-06).
"""

BACKGROUND, FACE, HAIR, TOP, DRESS, SKIRT, PANTS, BELT, BAG = 0, 1, 2, 3, 4, 5, 6, 7, 8
HAT, SCARF, GLASSES, ARMS, HANDS, LEGS, FEET, TORSO, JEWELRY = 9, 10, 11, 12, 13, 14, 15, 16, 17

NAMES = {
    BACKGROUND: "background", FACE: "face", HAIR: "hair", TOP: "top", DRESS: "dress", SKIRT: "skirt",
    PANTS: "pants", BELT: "belt", BAG: "bag", HAT: "hat", SCARF: "scarf", GLASSES: "glasses", ARMS: "arms",
    HANDS: "hands", LEGS: "legs", FEET: "feet", TORSO: "torso", JEWELRY: "jewelry",
}

# What a consultant can ask to recolour. The edit mask is built from these labels only.
GARMENTS = {"top": (TOP,), "dress": (DRESS,), "skirt": (SKIRT,), "pants": (PANTS,)}

# Pixels that are the person (or what they carry), not the clothes. The edit mask may never touch these, whatever the
# model says: skin (face, arms, hands, legs, feet, torso), hair, glasses, jewellery, hat and bag. The parser's own
# `IDENTITY_LABELS` (face, hair, jewelry, bag, glasses, hat) are all included; skin is added because a complexion
# edit is what must never happen.
SACRED = (FACE, HAIR, ARMS, HANDS, LEGS, FEET, TORSO, GLASSES, JEWELRY, HAT, BAG)

# Within SACRED, what makes the person recognisable gets a wide safety margin; the rest of the body and the bag a
# narrow one. The parser works at 384 px wide, so one of its pixels is ~6 px on a 2400 px photo: a margin has to be
# at least that wide to be a margin at all, but a wide one around skin edges leaves a visible rim of the old colour.
IDENTITY = (FACE, HAIR, GLASSES, JEWELRY, HAT)
BODY = tuple(i for i in SACRED if i not in IDENTITY)
