# Decisions

- 2026-09-28 — Repo layout: `web/` (Next.js 16 App Router, TS, Tailwind 4). `api/` deferred to Phase 3.
- 2026-09-28 — Phase 0 (consultant interview) NOT yet done. Phase 1 started early on synthetic data at the owner's request. `WORKFLOW.md` / `PRODUCT.md` are still to be written after the interview; treat Phase 1 output as provisional.
- 2026-09-28 — Concept routes use neutral labels (Concept A/B/C) so the consultant sees no implied favorite. Key: A = Editorial fashion, B = Quiet luxury, C = Contemporary studio.
- All client data in `web/src/lib/fixture.ts` is fictional; portrait is a synthetic SVG placeholder.
- 2026-09-29 — Visual elevation pass. Chapters of the client story reordered so *advice precedes craft* (Identity, Presence, Assessment, Opportunities, then Colour, Silhouette, Wardrobe, Looks, Evolution), each with an editorial title and a plain-language name. Why: the consultant opening a profile must see what to do next without scrolling through styling material.
- 2026-09-29 — Colour analysis is shown as a position between two poles (`Spectrum`), never as a score. Why: plan §4 forbids arbitrary numeric scores; a rating-dot row read as one.
- 2026-09-29 — No scroll-triggered animation and no page curtain. Motion is limited to four durations (160 / 260 / 300 / 520ms) and only for continuity, hierarchy, feedback or spatial relationship. Shared portrait uses the View Transitions API (Chromium-first, falls back to a plain page change).
- 2026-09-29 — Controls are native elements restyled once (`ui/controls.tsx`, `ui/Overlay.tsx`); no shadcn/Radix/Base UI dependency was added. Why: the identity must not drift toward a library default, and the app needed none.
- 2026-09-29 — Copy for reusable dossier patterns comes from `lib/copy.ts` (EN/ES); domain enums are keys, not display text. The rest of the product is still English-inline until the pilot language is chosen.
- 2026-09-29 — The page carries no texture; photographs share one visible grain-and-falloff finish (`.photo`). The old page-wide grain measured ±1/255 (imperceptible) and cost a full-viewport blended layer.
- 2026-09-29 — Studio hero copy ("Your image, considered.") kept: it reads as the studio's own tagline and the hero composition was to be preserved.
- 2026-09-29 — Portraits are now **credited free-licence stock photographs** graded into the palette (`docs/IMAGE_CREDITS.md`), replacing the illustration. They are examples: the client is fictional, and the "direction" photograph is a *reference* (a different person), labelled Today / Reference, never her result. Swapping in a consented photograph is one file (`lib/photos.ts`) plus re-tuning `observationMarkers`. Why: the brief treats photography as a first-class primitive and an illustration could never carry it. Open question for the owner: whether stock faces should appear at all outside your own circle.
- 2026-09-29 — The product's CSS classes live in `@layer components` so Tailwind utilities win (`DESIGN.md` §8). Motion, reduced motion, dialogs, focus and view transitions stay unlayered on purpose. Verified by pixel and computed-style diffs.
- 2026-09-29 — On phones the assessment portrait becomes a sticky 2:1 "focus window" that pans and zooms to the open observation, instead of a connector line.
- 2026-09-29 — Spanish for the whole product is deferred until the pilot language is chosen with the consultant (plan §4); only the dossier patterns are dictionary-driven.

