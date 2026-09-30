# Visual audit — Image Consultant OS

**Audited:** production build of `main` (commit `814fa5f`), served locally on `:3100`, synthetic data only.
**Method:** Playwright/Chromium at 1440, 1024, 768 and 390 px. Every route full-page and at the fold, plus interaction states. Screenshots were read slice by slice, not just skimmed as thumbnails. Numbers below come from a script (`metrics`), not from impression.
**Screenshots:** `docs/audit/before/` (BEFORE) and `docs/audit/after/` (AFTER), same four widths, same states. See `docs/audit/README.md` to regenerate them. Everything from the start of this file through *Coverage log* was written **before** any code changed; the *Outcome* section that follows was written after.

> **Reading note.** The brief names `Image_Consultant_OS_Plan.md`, `docs/DESIGN.md` and `docs/PRODUCT.md`. In this repo the plan is `plan.md`, and `DESIGN.md` / `PRODUCT.md` did not exist (the plan lists them as future files). I read `plan.md`, `DESIGN_DECISION.md`, `DECISIONS.md`, `HANDOFF.md`, `DEPLOY.md` and the code/tokens. `DESIGN.md` is created at the end of this iteration from what was actually built.
>
> **Route mapping.** The product has no separate strategy / assessment / recommendations / sessions pages. They are chapters of one client story at `/clients/marisol`: 01 Identity, 02 Presence (strategy + assessment), 07 Opportunities (recommendations), 08 Evolution (session + action plan). `/clients` (a list) is the "Clients" section of `/`. There was **no `/design-lab`** (404), and no loading, error or 404 design.

## What the measurements say first

The brief assumes a "polished SaaS" that needs its cards removed. That is mostly **not** what this build is, and I would rather say so than manufacture problems.

| Measure | Result | Reading |
| --- | --- | --- |
| Box shadows on rendered elements | **0** on all pages | Already luxury-restrained |
| Border radii in use | `2px`, `3px` buttons, circles (swatches/markers) | No `rounded-xl` habit |
| Fully-boxed elements (4-side border) | 0 on Studio, Wardrobe, Looks; 6–7 on the client story | Cards are essentially absent |
| Gradients / glass | header `backdrop-blur` + gradient; compare-slider handle blur | Two small offenders |
| Text below 12 px | **989 characters at 11 px** on the client story (labels) | Too small for the volume |
| `<Reveal>` fade-up wrappers | **36** usages, all `translateY(14px)` over 800 ms | The "fade-up everything" pattern |
| Full-screen page curtain | 900 ms ivory overlay on every section change | Effect for its own sake |
| Motion outside the brief's tiers | 800 ms reveal, 1100 ms mask, 900 ms image hover, `settle` with rotation | Off-system |
| Interactive targets under 44 px | 11–18 per page; nav 31–36 px tall; markers 28–36 px | Fails touch guidance |
| Contrast, `warm-gray` on ivory | 5.25:1 (AA) | Good |
| Contrast, `taupe` / nav numerals on ivory | **2.41:1** | Fails for informational numerals |
| Console errors | `/clients/nobody` (the stock 404) throws React **#418** hydration error | Real defect |
| Horizontal overflow | none, on any route at any width | Good |

So the problem is not "too much SaaS". It is that a strong typographic system is applied **uniformly and predictably**, and the flagship page does not yet do the job the brief describes.

---

## A. What is already excellent (protect these)

1. **The Studio opening** (`before/studio-1440-fold.jpg`). `YOUR IMAGE,` in capitals over an indented italic *considered.*, with a 4:5 portrait pinned top-right and a small-caps figure caption. It is asymmetric, quiet and unmistakably editorial, and it needs no decoration. Keep the composition.
2. **The type pairing and its device vocabulary.** Cormorant for display and statements, Inter for reading and UI, tracked small caps for labels, italic Cormorant numerals (`01`, `Fig. 01`) and roman numerals (*i. ii. iii.*) in Silhouette. The italic-inside-roman emphasis (`more structure around the shoulders`) is the product's voice. Keep.
3. **Presence chapter** (`before/clients-marisol-1440-s02.jpg`, `-s03.jpg`). An indented display statement; the desired perception in italic; the two audiences as *ruled columns with no boxes*; then an annotated portrait beside an accordion of observations. This is the best single composition in the app and the seed of the flagship page.
4. **Ruled rows instead of cards.** `ClientRow`, the observation list, the looks list and the recommendations all rely on hairlines and alignment. Nothing sits in a box. This restraint is why the product does not read as SaaS.
5. **Recommendation geometry** (`before/clients-marisol-1440-s08.jpg`). Observation left, recommendation right, on a 4 / 7 split, with an italic statement and a `Next` left-rule. The *causal relationship is spatial*, which is exactly right. It needs enrichment, not replacement.
6. **Wardrobe contact sheet** (`before/wardrobe-1440-s02.jpg`). A 12-column composition with varied ratios, small tilts and staggered offsets. It reads like a catalogue page. Protect it.
7. **Colour chapter behaviour.** Selecting a swatch scales it and re-tints the portrait background (Fig. 03). This is a controlled image-context change tied to meaning, which is the kind of motion the brief asks for.
8. **The dark closing band** ("The plan, in three moves"). One full-bleed inversion used as a final beat. Effective because it is rare.
9. **Token discipline.** Ivory / ink / stone, one accent (cordovan) reserved for "awaiting review", selection and focus. Keep the palette exactly.
10. **Voice.** First-person consultant notes ("I would keep the silhouette structured…"), "Where to?" in the palette. Rare and valuable; keep every line.
11. **Accessibility foundations.** Skip link, `<main>`, native `<dialog>` with focus return, `aria-live` on results, the compare slider is a real range input (keyboard-correct for free), no horizontal overflow at any width.

## B. What still feels generic

Precise, by location. (Cards are *not* on this list because they are largely absent.)

| # | Where | Pattern | Why it reads generic |
| --- | --- | --- | --- |
| B1 | `ClientStory`, `Studio`: 36 × `<Reveal>` | Fade-and-rise on scroll for nearly every block | The default "AI landing page" entrance. Motion with no meaning; hides content until scrolled |
| B2 | `template.tsx` | Full-screen ivory curtain with a chapter numeral on every section change | 900 ms of effect that delays the destination; not continuity |
| B3 | `ClientStory`: 8 chapters | Every chapter opens with the same full-width hairline + right-aligned `0N / LABEL`, then `pt-52`, then a heading and a 2-column grid | Identical section template repeated 8×, so uniform rhythm and a predictable scroll |
| B4 | Identity block (`dl`: Archetype / Palette / Signature) | Label → value trio | Reads as a CRM profile's field list on the client's *first screen* |
| B5 | Studio "Active clients **03**"; Colour `Dots` (●●●●○) | Stat block / rating widget | A counter with no decision attached; a rating dot-row is a review-widget idiom |
| B6 | `SiteNav` header | `backdrop-blur-[6px]` over a gradient; numbered `00 Studio 01 Clients…`; on mobile a permanent second row of four tabs | Decorative blur; software-style indexing; a generic tab strip that costs ~90 px of every phone screen |
| B7 | `CompareSlider` | Filled `Current` / `Direction` chips; circular blurred handle | Glass-and-chip UI control laid over the most important image |
| B8 | Studio "Waiting for your judgement" | Label → headline → body → meta → link (5 tiers) per row | Icon-less "title + description" list item, one level too dense |
| B9 | Studio hero voice | "Your image, considered." addressed to the *client*, on the *consultant's* home screen | Brand-site voice on a private workspace |
| B10 | Studio clients | Text-only rows, no portrait | The client is a database row here, not a person |
| B11 | Palette swatches | Six equal circles | UI-kit colour dots rather than fabric or paint chips |

## C. What is visually weak

Ranked by damage.

### C1. The flagship page does not open like a flagship
- At 1440 × 900 the first screen (`before/clients-marisol-1440-fold.jpg`) holds the name, a rule, and the top of a headline. **The portrait starts at y = 614** and is cut off. On a 390 × 844 phone the portrait first appears at y ≈ 950, so **it is never in the first screen** (`before/clients-marisol-390-sheet01.jpg`).
- Desired perception and audiences first appear ~1,900 px down, and the recommendations (what should change next) at ~7,000 px, after Colour, Silhouette, Wardrobe and Looks. A consultant opening the profile to prepare for a session cannot see *what to do next* without scrolling through the styling material.
- The name banner and the portrait are two stacked bands separated by a rule, so they do not relate. The right ~55 % of the first screen is empty above the image.
- Name scale collapses on mobile (48 px against 128 px on desktop), so the "expressive scale" that makes the desktop special is lost on the device most likely to be in the consultant's hand.

### C2. Navigation does not know a client is open
- Inside a client, the header still shows the four *global* sections. The client is not the context, the software is.
- The chapter rail exists only at ≥ 1536 px (`2xl`). **At 1440 and below, which is most laptops and every tablet and phone, there is no way to see the chapters or jump between them.**
- At 768 px the wordmark wraps to two lines and collides with the nav (`before/clients-marisol-768-sheet01.jpg`).

### C3. Assessment annotation is half-connected
- The cordovan line from the selected marker stops at the portrait's right edge and never reaches the note it belongs to.
- Marker 2 ("Hands retreat when challenged") sits on the chest, and the portrait has no hands. The annotation points at nothing.
- Markers are 28–36 px, under the 44 px touch guidance, on the device where they matter most.
- The interpretation opens in an accordion, but observations carry no consultant authorship or date, so they read as system output. The brief says the consultant's judgment is the primary content.

### C4. Recommendations lack required content and relationships
- **Priority is not shown at all** (the fixture has it; the UI drops it). The brief asks for priority on every recommendation.
- Selecting a recommendation reveals nothing: no linked observation on the portrait, no desired perception it serves.
- Status sits far right on the same line as the audience label. On mobile the two collide and wrap (`before/clients-marisol-390-sheet02.jpg`, column 3).
- Rationale is always fully open, so the page is long and there is no scan mode.

### C5. Type and contrast details
- Labels are 11 px uppercase tracked; 989 characters of the client story are at that size.
- Nav numerals and unselected observation numerals are `taupe` on ivory at **2.4:1**.
- Studio status on mobile is a **colour-only dot** (the words are `hidden sm:inline`).
- Heading rags: "Structure at the / top, / ease below." leaves *top,* orphaned (`before/clients-marisol-1440-s05.jpg`).

### C6. Composition defects at 1440
- Wardrobe excerpt (chapter 05): the fourth plate (Cognac) wraps to a second row and strands bottom-left under a 700 px void (`before/clients-marisol-1440-s06.jpg`). This is an accident, not asymmetry.
- Silhouette chapter: a small sticky portrait crop with large dead space beneath it.
- Colour chapter: `min-h-[5.5rem]` reserves an empty gap under the swatches.
- Compare slider: at 50 % the handle sits *on the mouth*, so the interaction's chrome covers the most sensitive part of the image.
- Looks canvas: the title label stays "On camera" after every piece is removed (stale state).
- Chapter gaps are a constant `pt-52` (13 rem) even where content is thin: 10,613 px at 1440 and 12,296 px on mobile for what is roughly four screens of content.
- Duplicate numbering in Studio: `01 Clients` and `01 This week`. Dev-leak copy: "Not part of this preview".
- The Wardrobe drawer title uses `display-m` (68 px) inside a 30 rem panel and wraps to two lines (`before/state-wardrobe-drawer-1440.jpg`).

### C7. Image treatment
- The portrait is a vector illustration with a drawn smile and two dots for eyes. At 650 px wide it is the largest object on the page and it reads **avatar / clip-art**, which sets the perceived quality of everything around it. There is no light, depth, grain or crop intent.
- The page-wide grain layer (`body::before`, a 200 px `feTurbulence` tile, `mix-blend-mode: multiply`, fixed over the whole viewport) is **imperceptible**: I measured a blank ivory region at ±1/255 (σ = 0.44, 7 distinct colours). So the "tactile paper" it promises is not actually delivered, and it costs a full-viewport blended layer on every frame. *(Correction: my first read of the screenshots suggested a visible dot lattice. Pixel measurement showed that was a viewer artifact, not the page.)* Real tactility belongs on the photographs, where it can be seen.

### C8. State design
- **404:** the stock Next.js page (system sans on white) under our header, with a hydration error (React #418). This is the least-designed screen in the product.
- No loading or skeleton state, and no error boundary (`error.tsx`).
- Empty states: only Looks has one, and it is one grey line of text.
- The command palette focus ring is a hard rectangle around the input; the row hints wrap ("ASK YOUR CONSULTANT").
- Large row links (`ClientRow`) get a full rectangular cordovan focus ring at 4 px offset, which reads as a form field rather than a row.

### C9. Motion audit
| Item | Now | Verdict |
| --- | --- | --- |
| Scroll reveal | 14 px rise, 800 ms, ×36 | Delete for text; keep only for portraits |
| Mask reveal | 1100 ms clip | Too slow; 480 ms |
| Page curtain | 900 ms, blocks sight | Delete; replace with continuity |
| Image hover | 900 ms scale 1.03 | 240 ms crop drift or none |
| `settle` (drawer image, look pieces) | translateY + **rotate(-1.2°)** | Playful; delete the rotation |
| Drawer / dialog | instant open | Add 280 ms slide + 200 ms backdrop |
| Tailwind hover translations | ignore `prefers-reduced-motion` | Fix globally |
| Durations | tokens exist, but 800 ms and `duration-500/700` are used ad hoc | One token set on the 120–180 / 200–320 / 400–600 scale |

## D. What is missing emotionally

The build looks like *beautiful software about a wardrobe*. It does not yet feel like software *a private consultant would sit down with a client to use*. Four missing layers:

1. **A person, not a role.** Marisol appears as a title, an archetype and a list of fields. Nowhere is there her own voice. The session notes hold it ("she asked for a written cue card") but the profile never lets her speak. One pull-quote in her words would do more than another layout.
2. **Photographic materiality.** Real portraiture has light, grain and a chosen crop. The current illustration is flat and cartoon-like, so the "Marisol" the whole product revolves around never becomes someone you feel you know.
3. **The consultant's hand.** Observations are unattributed and undated. Discretion and craft are conveyed by a signed, dated note far more than by any effect ("Noted 12 March, after session 2").
4. **Arrival.** Opening a client should feel like opening a dossier that belongs to that person. Today it is a route change with a curtain. There is no object that travels from the roster into the profile, so the client never becomes "the context".

The missing emotional layer is **being known**: a person's face, their words, and the consultant's judgment, arriving before the software does.

---

## Prioritised changes

Ranked by product and visual impact. Items marked ◆ are the signature interactions.

| Rank | Change | Fixes |
| --- | --- | --- |
| 1 | **Flagship opening.** Portrait + name + desired perception + audiences + one-line editorial read in the first viewport, at every width; operational metadata demoted | C1, B4 |
| 2 | **Client context navigation** (works at all widths): slim client bar, chapter index visible ≥ 1024, chapter picker on mobile, "next chapter" hand-offs | C2, B6 |
| 3 ◆ | **Portrait continuity.** Studio roster with real portrait plates that morph into the profile hero (View Transitions), and one persistent portrait across Presence → Opportunities | C7, D4, B10 |
| 4 ◆ | **Annotated assessment.** Connecting line reaches the note; markers ≥ 44 px; consultant attribution and date | C3, D3 |
| 5 ◆ | **Recommendations as considered advice.** Numbered editorial rows, priority, audience, "because" link to the observation, expandable rationale, status as a quiet secondary; selecting one lights its observation on the portrait and states the perception goal it serves | C4 |
| 6 | Reorder chapters so *advice* precedes *craft* (Opportunities directly after Presence), with plain-language sublabels | C1 |
| 7 | **Motion system.** One token set; delete scroll fade-up and the curtain; 480 ms portrait unmask, 180 ms feedback, 280 ms drawers; real reduced-motion | C9, B1, B2 |
| 8 | **Portrait treatment.** Refined synthetic portrait, shared photographic finish, dignified placeholder for clients with no portrait | C7, D2 |
| 9 | **Primitives + `/design-lab`.** Button, Field, Select, Tabs, Status, Dialog/Drawer, Row, Recommendation, Observation, Portrait, consumed by the app | B-series, brief §13/§18 |
| 10 | **State design.** Branded 404, error boundary, loading skeleton, empty states, validation and success patterns; fix #418 | C8 |
| 11 | **Typography and contrast.** 12 px minimum label, balanced headings, informational numerals ≥ 4.5:1, touch targets ≥ 44 px, status never colour-only | C5 |
| 12 | **Mobile art direction.** Portrait first, larger name, one-row header with a menu, chapters tightened | C1, B6 |
| 13 | Composition defects: wardrobe excerpt orphan, silhouette rag/dead space, colour gap, slider handle, stale look title, duplicate numbering, dev-leak copy | C6 |
| 14 | Micro-details: replace the invisible page grain with a visible finish on photographs only, scrollbar, focus treatment on rows and the palette, header blur | C7, C8 |

**Deliberately not changing:** the palette, the font pairing, the Studio hero composition, the wardrobe contact sheet, the Presence composition (it is extended, not replaced), the first-person consultant voice, the no-card principle, and the synthetic-data rule. Nothing here adds a dependency.

**Cannot be fixed in code:** real photography. The portrait remains a synthetic stand-in until consented photographs exist (`HANDOFF.md`). The treatment work makes the stand-in dignified and makes real photos drop in without layout change; it does not pretend to replace them.

## Coverage log

Inspected at 1440 / 1024 / 768 / 390: Studio (`/`), client story (`/clients/marisol`), Wardrobe, Looks, plus the command palette, wardrobe drawer, wardrobe filter, hover and keyboard-focus states, observation and colour selection, Looks ask / miss / empty states, mobile navigation, 404, reduced-motion, and `/design-lab` (absent). Not inspected: `/concepts/*` (Phase 1 exploration, deliberately untouched), Safari and Firefox, real touch hardware, screen-reader output.

---

# Outcome

Implemented on branch `visual-elevation-pass` in two passes. **Pass 1** did the design work below with a synthetic illustrated portrait. **Pass 2** closed the gaps pass 1 left open: example photography graded into the palette, a phone version of the annotation, and a structural fix for the CSS-layering hazard. Typecheck, lint, the production build and `next dev` are clean; 25 scripted behaviour and accessibility checks pass; no console errors on any route.

## What changed, against each finding

| Finding | What was done | Status |
| --- | --- | --- |
| **C1** Flagship does not open like a flagship | Rebuilt the opening: portrait, interlocking name, desired perception, both audiences, observation 1 pinned to the picture and the next action, all in the first screen at 1440, 1024 and 390. Portrait first on phones | Fixed |
| **C2** Navigation ignores the client | Client-context header (back, name, search), a chapter rail at ≥ 1024px (numerals only, name on hover), a native chapter picker below that, hand-off links between chapters. Wordmark wrap at 768 fixed | Fixed |
| **C3** Half-connected annotation | Elbow line from marker to note (and from a recommendation to its observation) at ≥ 1024px; **on phones a sticky window of the photograph pans and zooms to the open note** (pass 2); 44px+ hit areas; "Noted · Session 2 · 12 March" attribution. Marker 2 sits on the frame edge on purpose: her hands are out of view | Fixed |
| **C4** Recommendations | Numbered editorial rows sorted by priority; priority shown; status is a quiet, wrapped-safe label; expandable why / because / serves; audience filter (buttons on desktop, a select on phones) | Fixed |
| **C5** Type and contrast | Labels are 12px minimum (was 11px × 989 characters); status has words at every width; nav numerals removed; decorative numerals ≥ 3:1 and `aria-hidden`; headings balanced | Fixed |
| **C6** Composition defects | Wardrobe orphan, silhouette rag and dead space, colour gap, slider handle on the mouth, stale look title, duplicate numbering, dev-leak copy, drawer title: all fixed | Fixed |
| **C7** Image treatment | Pass 1: a lit illustration. **Pass 2: real example photographs** (credited stock, `IMAGE_CREDITS.md`), each cropped and tone-mapped so black is the page's ink and white is its ivory; one grain-and-falloff finish; dignified placeholder plates; the invisible page grain is gone. The colour chapter now drapes fabric across her shoulders instead of tinting a wall | Fixed |
| **C8** States | Branded 404, error boundary, global error, loading skeleton, empty / feedback / validation patterns; React #418 removed | Fixed |
| **C9** Motion | One four-value token set (160 / 260 / 300 / 520ms); scroll fade-up and page curtain deleted; drawers and sheets now animate; reduced motion covers Tailwind transitions and view transitions | Fixed |
| **B1, B2** Fade-up everywhere; curtain | 36 `Reveal` wrappers → 3 (photograph unmasks and rule draws); curtain deleted | Removed |
| **B3** Identical chapter template | Compositions now differ per chapter (statement + gap, sticky stage, paint-chip palette, wide shoulder-line image, triptych, plates, rows) and rhythm has three sizes. The hairline marker remains as the one shared opener | Reduced |
| **B4** Field list as first screen | Replaced by the hero; archetype survives as a caption | Removed |
| **B5** Stat block, rating dots | "03 active clients" replaced by a sentence; dots replaced by a labelled spectrum | Removed |
| **B6** Blur, numbering, tab strip | No blur or gradient; numeric prefixes dropped; one-row mobile header with a full-screen menu | Removed |
| **B7** Glass slider | Solid handle at shoulder height, typographic labels; it now compares *Today* with a *Reference*, and says so | Removed |
| **B8** Five-tier list rows | Four tiers; rationale left to the dossier | Reduced |
| **B9** Studio voice | Reviewed and **kept**: on a consultant's home screen it reads as the studio's own tagline, and the hero composition was to be preserved | Kept |
| **B10** Clients as rows | A roster of portrait plates that steps down in size; the origin of the morph | Fixed |
| **B11** Colour circles | Paint-chip rectangles that lift when chosen | Fixed |
| **D1–D4** Emotional layer | Her words as a pull-quote; the consultant's dated hand on every note; a portrait with a gaze; and an arrival, where the roster portrait travels into the hero | Addressed |

## Measured, before → after

| Measure | Before | After |
| --- | --- | --- |
| Text under 12px (client page, characters) | 991 | **0** |
| Backdrop blur elements | 1–2 per page | **0** |
| Scroll fade-up wrappers | 36 | **0** (3 photograph unmasks and rule draws remain) |
| Page curtain | 900ms on every section change | **deleted** |
| Duration values in use | 800, 900, 1100ms and `duration-300/500/700` | **4 tokens**; 0 hard-coded |
| Targets under 44px, 390px, Studio / Wardrobe / Looks | 10 / 13 / 17 | **0 / 0 / 0** (the hidden skip link excluded) |
| Targets under 44px, 390px, client page | 14 | **0** (the hidden skip link excluded) |
| Targets under 44px, 1440px, client page | 14 | **30**, because of the new nine-numeral chapter rail (28px, above WCAG's 24px minimum; 44px on touch) |
| Shadows / radii on the page at rest | 0 / 2px and circles | 0 / 2px and circles |
| Console errors | React #418 on the 404 | **none** (the 404 status line only) |
| `/design-lab` | 404 | 13 sections, built from the product's own components |
| Client page height, 1440 / 1024 / 768 / 390 | 10,613 / 9,711 / 13,167 / 12,296 px | 10,231 / 8,717 / 11,380 / 11,886 px |
| Scripted behaviour and accessibility checks | none | **25 of 25**; production build, `next dev` (12 route and width combinations) and a no-View-Transitions run all clean |
| Custom classes that silently lost to Tailwind utilities | ~15 elements | **0** (classes moved to `@layer components`; verified by pixel diff and per-element computed-style diff) |

Page height fell on desktop and tablet and slightly on phones, even though content was *added* (her words, the perception gap, priority, "because", the focus window).

## Before and after

**Client profile, first screen, 1440** — the portrait was below the fold and the page opened on a name banner

| Before | After |
| --- | --- |
| <img src="audit/before/clients-marisol-1440-fold.jpg" width="620" alt="Before: Client profile, first screen, 1440"> | <img src="audit/after/clients-marisol-1440-fold.jpg" width="620" alt="After: Client profile, first screen, 1440"> |

**Client profile, first screen, 390** — the portrait never appeared in the first screen

| Before | After |
| --- | --- |
| <img src="audit/before/clients-marisol-390-fold.jpg" width="260" alt="Before: Client profile, first screen, 390"> | <img src="audit/after/clients-marisol-390-fold.jpg" width="260" alt="After: Client profile, first screen, 390"> |

**Client profile, 1024**

| Before | After |
| --- | --- |
| <img src="audit/before/clients-marisol-1024-fold.jpg" width="520" alt="Before: Client profile, 1024"> | <img src="audit/after/clients-marisol-1024-fold.jpg" width="520" alt="After: Client profile, 1024"> |

**Client profile, 768** — wordmark no longer wraps; name interlocks with the portrait

| Before | After |
| --- | --- |
| <img src="audit/before/clients-marisol-768-fold.jpg" width="400" alt="Before: Client profile, 768"> | <img src="audit/after/clients-marisol-768-fold.jpg" width="400" alt="After: Client profile, 768"> |

**Studio roster** — text rows and a stat block → portrait plates, the origin of the morph

| Before | After |
| --- | --- |
| <img src="audit/before/studio-1440-s02.jpg" width="620" alt="Before: Studio roster"> | <img src="audit/after/studio-1440-s02.jpg" width="620" alt="After: Studio roster"> |

**Assessment, observation 2 selected** — the line stopped at the frame; now it reaches the note

| Before | After |
| --- | --- |
| <img src="audit/before/state-observation-2-1440.jpg" width="620" alt="Before: Assessment, observation 2 selected"> | <img src="audit/after/conn-2-obs2.jpg" width="620" alt="After: Assessment, observation 2 selected"> |

**Recommendations** — priority added; opening a row lights its observation on the persistent portrait

| Before | After |
| --- | --- |
| <img src="audit/before/clients-marisol-1440-s08.jpg" width="620" alt="Before: Recommendations"> | <img src="audit/after/conn-3-rec3.jpg" width="620" alt="After: Recommendations"> |

**Colour** — dots and circles → spectra and paint chips; the portrait's ground follows the choice

| Before | After |
| --- | --- |
| <img src="audit/before/clients-marisol-1440-s05.jpg" width="620" alt="Before: Colour"> | <img src="audit/after/state-color-rust-1440.jpg" width="620" alt="After: Colour"> |

**Mobile client dossier** — four consecutive screens

| Before | After |
| --- | --- |
| <img src="audit/before/clients-marisol-390-sheet01.jpg" width="620" alt="Before: Mobile client dossier"> | <img src="audit/after/clients-marisol-390-sheet01.jpg" width="620" alt="After: Mobile client dossier"> |

**Mobile Studio** — one-row header with Menu; status words visible

| Before | After |
| --- | --- |
| <img src="audit/before/studio-390-sheet01.jpg" width="520" alt="Before: Mobile Studio"> | <img src="audit/after/studio-390-sheet01.jpg" width="520" alt="After: Mobile Studio"> |

**Command palette** — chapter jumps; underline focus instead of a boxed ring

| Before | After |
| --- | --- |
| <img src="audit/before/state-palette-1440.jpg" width="620" alt="Before: Command palette"> | <img src="audit/after/state-palette-1440.jpg" width="620" alt="After: Command palette"> |

**Wardrobe drawer** — now slides in 300ms; title fits

| Before | After |
| --- | --- |
| <img src="audit/before/state-wardrobe-drawer-1440.jpg" width="620" alt="Before: Wardrobe drawer"> | <img src="audit/after/state-wardrobe-drawer-1440.jpg" width="620" alt="After: Wardrobe drawer"> |

**404** — the stock page, with a hydration error → the studio's voice

| Before | After |
| --- | --- |
| <img src="audit/before/state-404-1440.jpg" width="620" alt="Before: 404"> | <img src="audit/after/state-404-1440.jpg" width="620" alt="After: 404"> |

**Mobile assessment: the sticky focus window** — before, the picture and the notes were on different screens

| Before | After (window on note 1, then note 3, then scrolled into the recommendations) |
| --- | --- |
| <img src="audit/before/state-observation-after-tap-390.jpg" width="260" alt="Before: tapping a note on a phone"> | <img src="audit/after/focus-sheet.jpg" width="640" alt="After: the focus window follows the open note"> |

### New, with no "before"

| Portrait morph (Studio → profile), frames at ~110 / 240 / 370ms | `audit/after/morph-1.jpg`, `morph-2.jpg`, `morph-3.jpg` |
| --- | --- |
| Connector, first observation | `audit/after/conn-1-assessment.jpg` |
| Mobile focus window, note 1 / note 3 / scrolled | `audit/after/focus-1.jpg`, `focus-3.jpg`, `focus-scrolled.jpg` |
| Design lab, first screen and sections | `audit/after/design-lab-1440-fold.jpg`, `-s01`, `-s04`, `-s07`, `-s10`, `-s12` |

## Signature interactions

1. **Portrait continuity.** The roster portrait physically travels into the profile hero (520ms, shared-element view transition), with the client's name layered above it in flight. Verified frame by frame (`morph-*.jpg`). Falls back to a plain page change.
2. **Annotation connector.** A fine elbow line from the selected marker to its note (≥ 1024px), drawn once per selection and tracking scroll; on phones, a sticky focus window that pans and zooms to the note.
3. **Recommendation connection.** Opening a recommendation lights the observation that motivated it on the persistent portrait and states the perception it serves.
4. **Chapter navigation.** Rail, picker and hand-off links; four movements, each chapter named editorially and in plain words.
5. **Image in context.** Choosing a colour drapes it across her shoulders, as a colour analyst would; the compare slider reveals today against a reference with the handle at the shoulder. On phones the focus window pans and zooms to the open note.

All are additive: with motion removed, the open note, the highlighted marker and the listed text carry the same information.

## Responsive issues fixed

Portrait below the fold at every width; name scale collapsing on phones; missing chapter navigation below 1536px; wordmark wrapping at 768; two-row mobile header; assessment portrait and notes on different screens on phones; recommendation label and status colliding on phones; colour-only status on phones; the design lab and every page stretching to fit a wide child (`body > main { width: 100% }`).

## Accessibility issues fixed

Labels below 12px; sub-44px targets on touch; colour-only status; informational numerals at 2.4:1; collapsed content still focusable (now `inert`); dialogs closing without focus return in the new overlay code (verified); the palette's boxed focus ring; missing error boundary; reduced motion ignoring Tailwind transitions and view transitions; a quiet button that flashed solid on press; observation `area` rendered from an English enum (now a dictionary key).

## Second pass: what was closed, and what was not

| Gap from pass 1 | Result |
| --- | --- |
| The portrait was an illustration | **Closed for the prototype.** Two credited example photographs, graded into the palette; markers re-tuned to them; `Portrait` reads from `lib/photos.ts`, so a consented photograph is a one-file swap. The remaining gap is *consented* photography of a real client, which no code can supply |
| Connector desktop-only | **Closed.** Sticky focus window on phones |
| Unlayered custom classes beat Tailwind utilities | **Closed.** `@layer components`, verified by pixel and computed-style diffs. Three intended differences surfaced (active chapter numeral medium weight, snug leading on the annotation label, 1.02rem notes in Looks) plus two in the lab that finally honour their own `normal-case` and `max-w-xl` |
| `next dev` untested | **Closed.** No hydration or dev warnings on 12 route and width combinations |
| View transitions Chromium-first | **Partly closed.** Tested with the API removed: navigation, the photograph and back-navigation all work, no errors. Real Safari and Firefox are still untested (only Playwright's 2023 builds exist on this machine, which say nothing about current engines) |
| Looks flat-lay "overlaps awkwardly" | **Retracted.** Re-inspected all three looks: the jacket overlaps the waistband naturally and pieces are balanced. Nothing changed |
| Mobile targets | **Closed.** Zero targets under 44px at 390px on every page |

## Remaining imperfections

Plainly:

- **The photographs are stock examples, not a client.** They are graded so they belong, but they are real people who are not "Marisol", and the "reference" photograph is a different person from "today". Both are labelled as examples and the comparison says *Today* and *Reference*. Before anyone outside your circle sees this, decide whether stock faces should appear at all (`IMAGE_CREDITS.md`). Real client photography also needs the privacy gate in plan §5 (login, private storage); these files are public assets.
- **The slider splits two faces.** Honest, but at some positions it shows half of each face. A same-person before/after is not something an example photograph can give.
- **Real Safari and Firefox are untested** (see above). View transitions are Chromium-first; the fallback is proven.
- **Not tested:** screen readers, real touch hardware.
- **English only outside the dossier patterns.** Observation and recommendation patterns take a dictionary and are shown in Spanish in the lab; the rest of the product's strings are inline. Translating them is gated on choosing the pilot language (plan §4), which needs the consultant, so it was deliberately not started.
- **Wardrobe and Looks were restyled, not redesigned** (controls, motion, states, drawer). Their garments are still flat vector cut-outs, consistent with each other and with the palette, but not photography.
- **The mobile chapter picker is a native `<select>`**, so its open menu is the operating system's. Chosen for accessibility.
- `docs/PRODUCT.md` and `docs/WORKFLOW.md` still do not exist (they come from the consultant interview, Phase 0, which has not happened); `DESIGN_DECISION.md` is still pending her choice. Neither can be written from code.

## The five quality tests, answered

- **Screenshot.** With photographs graded into the palette, the Studio hero, the client dossier's first screen and the assessment stage read as an art-directed product for a high-end consultant, not a SaaS app. The remaining caveat is that the faces are stock examples, not her.
- **Restraint.** Yes. Net effects removed: scroll fade-up, page curtain, blur, the invisible grain, rotation on landing, rating dots, stat block, chip labels. Net effects added: the connector and the morph, each carrying meaning.
- **Identity.** No SaaS product has an interlocking name, a perception gap set as type, or a line from the picture to the note. The hairline chapter marker and the dark closing band are the parts most like anything else.
- **Luxury.** Quality comes from type, proportion, photography treatment, whitespace and craft; there are no shadows or gradients on the page.
- **Consultant.** The workflow is legible without explanation: plain names sit beside every editorial chapter title, priority and next action are on every row, and status has words. Not yet tested with the consultant herself.
