# Test corpus and verdicts (2026-10-06)

24 stock photographs, Pexels licence, **not committed** (`raw/` is git-ignored). To rebuild: download each id with
`https://images.pexels.com/photos/<id>/pexels-photo-<id>.jpeg?auto=compress&cs=tinysrgb&w=2000` (page: `https://www.pexels.com/photo/<id>/`).
`today` and `direction` are the two portraits already credited in `docs/IMAGE_CREDITS.md` (downloaded at w=2400).

Chosen to vary skin tone, hair (curly, covered, grey), garment (blazer, turtleneck, shirt, cardigan, dress, abaya, scarf),
pose (hands near the body, arms crossed), framing (close-up to full body), lighting (studio, backlit, window, outdoor),
age, and one deliberate stress test with four people.

Run: `python -m garment_preview run raw/*.jpg --garment auto --target '#8a3b2a' --out out/corpus`.

**Automatic checks, all 24:** person pixels changed 0; colour error at most 0.07 dE2000; no check failed.
These checks trust the parser's labels, so they say nothing about whether the *mask is right*. The verdicts below are
from looking at contact sheets (thumbnails, one reviewer): a judgement, not ground truth.

| Photo (id) | What it is | Verdict | Flagged by the mixed-colour check |
| --- | --- | --- | --- |
| 19002588 | woman, black blazer, hands on hips | clean | no |
| 19434331 | man, black turtleneck, arms crossed | clean | no |
| 6338326 | man, brown turtleneck, beard | clean | no |
| 6625777 | older man, yellow turtleneck | clean | no |
| 6702630 | woman, black suit; auto picked `pants` | clean | no |
| 7550887 | woman, blue blouse, arms crossed | clean | no |
| 8560470 | woman, white shirt, on sofa | clean | no |
| today | woman, cardigan (the Studio portrait) | clean | no |
| direction | woman, pinstripe suit, backlit | minor: halo where the suit fades into window glare | no |
| 13908745 | curly hair, white blazer | minor: thin light rim along the hair | no |
| 6923485 | older woman, white shirt, profile | minor: small notch at the lower right | no |
| 7249418 | yellow hijab and robe | minor: one fabric split by labels; the head part stays yellow | no |
| 8911858 | navy abaya and veil | minor: veil and abaya treated as one garment | no |
| 8837181 | four women standing | every person's top is recoloured (multi-person) | no |
| 12311581 | man, black blazer over burgundy shirt | **layered**: shirt recoloured too | yes |
| 20411585 | man, black blazer over white shirt | **layered** | yes |
| 30479371 | blonde woman, black coat over grey turtleneck | **layered**; dark fringe where hair crosses the coat | yes |
| 9161849 | black blazer over printed white tee | **layered** | yes |
| 1792828 | curly hair, tweed coat over pink knit | **layered** | yes |
| 6787553 | orange cardigan over patterned blouse | **layered** | yes |
| 10228177 | black blazer, grey shirt cuffs | **layered** (cuffs only) | no (miss) |
| 5092526 | man in profile, white collar | **layered** (collar only) | no (miss) |
| 36211841 | hijab, embellished dark dress, white curtain | **bad**: blotchy mask, sheer curtain recoloured | yes |
| 9393440 | teal scarf over burgundy velvet | **bad**: pale discs on the scarf, holes in the garment | yes |

Totals: 14 usable as they are (8 clean, 6 minor), 8 layered, 2 bad. The flag caught 8 of the 10 layered or bad masks and
none of the 14 usable ones. The threshold (0.04) was tuned on these same photographs, so treat it as indicative.
