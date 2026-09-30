# Image credits and the photograph pipeline

The client dossier uses **example photographs** in place of a real client. They are free-licence stock photographs of real people, used here only to judge layout, crop, colour and annotation as if real photography were in place. They are labelled in the product as examples (footer of the Studio and the dossier), the client is fictional, and the "direction" photograph is never presented as her result: the comparison says *Today* and *Reference*.

| Used as | Photograph | Photographer | Licence |
| --- | --- | --- | --- |
| "Today" (Marisol as she presents now) | [Woman in Knitted Cardigan](https://www.pexels.com/photo/11446748/) | Ilya Komov | Pexels License |
| "Reference" for the direction (Studio hero, silhouette close-up, comparison) | [Elegant Woman in Dark Pinstripe Suit Indoors](https://www.pexels.com/photo/32342054/) | Mert Coşkun | Pexels License |

Pexels' licence allows free use, including commercial, without attribution; credit is given anyway. The licence does not let anyone imply the person pictured endorses a product, and it excludes uses that portray a person in a bad light. Before this prototype is shown to anyone outside your own circle, decide whether stock-model faces should appear at all; the swap is one file (`web/src/lib/photos.ts`).

## How the photographs are prepared

Run `docs/audit/scripts/grade-photos.js` (needs `sharp`; it is deliberately not a project dependency). For each photograph:

1. **Crop** to 4:5 (portrait) or 16:10 (landscape) on the 2400 x 3600 original.
2. **Tone-map** so the black point is the page's ink (`#161411`) and the white point is ivory (`#f6f1e7`), per channel. The photograph then sits inside the palette instead of beside it.
3. **Ease saturation** (0.72 to 0.84) and nudge the cast toward ivory (`warm`); lift shadows with `gamma` where a garment would otherwise be a black slab.
4. **Export** two sizes as 4:4:4 JPEG at quality 80 (640 and 1200 wide; 800 and 1600 for landscape), about 20 to 130 KB each.
5. In the page, `<Portrait>` adds one shared finish (`.photo`): a fine grain and a soft falloff at the edges.

## Replacing them with a real client

1. Put the consented photograph through the same steps (a new job in the script).
2. Edit `web/src/lib/photos.ts`: paths, alt text, focal point.
3. Re-tune `observationMarkers` in `web/src/lib/atelier.ts`. They are percentages of the 4:5 frame and are tuned to the current "today" photograph.
4. Remove the credit lines (`photoCreditLine`) and this file's table.
Nothing else in the layout changes.

## Not done here

- A consent and privacy gate for real photographs (plan §5: login, per-client authorisation, private storage). These files are public assets in `web/public/`; a real client's photographs must not be.
- Alternative crops for different focal points at each breakpoint beyond the 4:5 / 16:10 pair.
