# Design

> A private luxury editorial experience that happens to contain extremely capable software.

This is the reference for how Image Consultant OS looks and moves. It was written from what is built and verified, not aspired to. The live version is **`/design-lab`**, which renders the same tokens, controls and dossier components the product uses. If this file and the lab disagree, the lab is right; fix this file.

Selected direction: Concept A (editorial fashion) as the base, with Concept B's calm and Concept C's audience filter borrowed. The consultant has not yet chosen (`DESIGN_DECISION.md` is still pending), so treat colour, type and layout as provisional until she does. Nothing in this document depends on which photographs are used.

Creative ratio: about **80% restraint, 15% expressive editorial, 5% magic**. If removing an effect makes the interface stronger, remove it.

## 1. Foundations

### Colour
Ivory and ink carry almost everything. Cordovan and olive appear **only where they mean something**: awaiting review, selection, focus, an error (cordovan); saved, approved (olive). Tokens live in `web/src/app/globals.css`; the lab computes the contrast from the hex values.

| Token | Value | Use | Contrast |
| --- | --- | --- | --- |
| `--ivory` / `--bg` | `#f5f1e8` | The ground | — |
| `--paper` | `#efe9dc` | Sunken plates: garments, placeholders | — |
| `--stone` | `#e2dac9` | Selection wash in menus | — |
| `--ink` / `--text` | `#171512` | Headings, rules, the inverse ground | 16.2:1 on ivory |
| `--charcoal` / `--text-body` | `#2d2a26` | Reading text | 12.7:1 |
| `--warm-gray` / `--text-muted` | `#6b6357` | Metadata, labels | 5.25:1 ivory, 4.89:1 paper |
| `--faint` / `--text-faint` | `#857a68` | Large decorative numerals only (≥ 24px) | 3.74:1 |
| `--taupe` | `#a99b86` | Secondary text on ink only | 6.7:1 on ink |
| `--cordovan` / `--accent`, `--danger` | `#7a3324` | Meaning only | 8.0:1 |
| `--olive` / `--positive` | `#5d6238` | Meaning only | 5.7:1 |

Rules: `--warm-gray` is the smallest-text colour and must not sit on stone (4.26:1). `--taupe` and `--faint` never carry information a user needs. A colour is never the only signal (see Status).

### Type
Two voices. **Cormorant Garamond** speaks about people and conclusions; **Inter** carries everything you operate.

| Class | Face | Size | Use |
| --- | --- | --- | --- |
| `.display-xl` | Cormorant 300, uppercase | 3.4–10rem, lh 0.88 | The opening statement of a page. Rare |
| `.name` | Cormorant 300 | `min(13.2vw, 21svh)`, 4.25–13rem, lh 0.86 | A client's name, once per dossier |
| `.display-l` | Cormorant 300 | 3–8rem | Page and chapter titles |
| `.display-m` | Cormorant 400 | 2.1–4.25rem | Chapter statements, drawer titles |
| `.statement` | Cormorant 300 italic | 1.9–3.5rem | Perceptions, conclusions, quotations |
| `.headline` | Cormorant 400 | 1.6–2.25rem | The name of a thing in a list |
| `.lede` / `.body-copy` | Inter 400 | 1–1.15rem / 0.95rem, 34ch / 52ch | Introductions, reading |
| `.label` | Inter 500, uppercase, 0.16em | **12px minimum** | Labels, controls, statuses |
| `.meta` | Inter 400 | 0.8125rem, warm gray | Attribution, hints |
| `.numeral` | Cormorant italic 300, lining figures | — | Chapter numbers, figure captions |

Hierarchy comes from family, scale, italic and whitespace, **never from making things bold**. Emphasis is italic inside roman. Headings use `text-wrap: balance`, paragraphs `pretty`. Allow ~25% more length for Spanish.

### Space and rhythm
Three rhythm tokens separate movements (`--rhythm-lg`, 5–12rem), chapters (`--rhythm-md`, 3.5–8rem) and the parts of a chapter (`--rhythm-sm`, 2.5–4.5rem). Rhythm is deliberately uneven. Page margin is `--gutter` (`clamp(1.25rem, 4vw, 3.5rem)`), grid is 12 columns with a 24px gutter, max width 1600px.

Separation is by **hairline and alignment, not by box**: `border-ink/15` for groups, `border-ink` where a group leads. Radius is `2px`, on controls only. Circles are reserved for portrait markers and small marks. There are no shadows and no gradients on the page (the floating search sheet alone has a soft drop).

### Photography
Photography is a primitive, not an avatar. Two ratios only: **portrait 4:5**, **landscape 16:10**. Every photograph is **graded into the palette** (black point to ink, white point to ivory, saturation eased; `docs/IMAGE_CREDITS.md`) and shares one finish (`.photo`: a fine grain and a soft falloff at the edges, light enough not to dull the picture); the page itself carries no texture. A client with no portrait gets `PortraitPlaceholder` (initials, "Portrait to be added"), never a grey silhouette. Crops are intentional: the 4:5 frame and a 16:10 "collar and lapel" close-up.

The photographs today are **free-licence stock examples**, credited and labelled as such; the client is fictional and the "direction" picture is a *reference*, never her result (the comparison says Today / Reference). A consented photograph drops into `Portrait` via `lib/photos.ts` without changing any layout; re-tune `observationMarkers`. Never infer character or confidence from appearance; observations are the consultant's.

## 2. Motion

| Duration | Token | For |
| --- | --- | --- |
| 160ms | `--dur-feedback` | Hover, press, a small state changing |
| 260ms | `--dur-ui` | Disclosure, filters, a note opening |
| 300ms | `--dur-panel` | Drawers and dialogs |
| 520ms | `--dur-spatial` | A portrait travelling between pages, an unmask, a connector line |

Easing is `cubic-bezier(0.22, 1, 0.36, 1)` (`--ease-out`). Motion communicates continuity, hierarchy, feedback or spatial relationship. There is **no scroll-triggered fade-up, no page curtain, no ambient or looping animation, no bounce**.

- Photographs unmask once, from below, when first seen (`Reveal mask`). Chapter rules draw once (`Reveal draw`). Text does not animate on scroll.
- Route changes use the View Transitions API: the root crossfades in ~200ms, the header stays put, and a shared portrait morphs. The morph is a progressive enhancement; without support the page simply changes.
- **Reduced motion** (`prefers-reduced-motion`, or `.motion-reduced` on a subtree): transforms, reveals and view transitions are removed; every state change is instant and legible. Nothing depends on an animation finishing.

## 3. Components

All controls are native elements restyled once; there is no component library and no dependency. `web/src/components/atelier/`:

| Group | Where | Notes |
| --- | --- | --- |
| Button, ButtonLink | `ui/controls.tsx` | `outline`, `solid`, `quiet`. 44px minimum height. Uppercase label |
| Field, TextArea, SelectField | `ui/controls.tsx` | Underline fields. Hint, error (announced, glyph `!`), success (glyph `✓`). `hideLabel` keeps a real label |
| Filter | `ui/controls.tsx` | A group of toggle buttons that changes what a region shows |
| Tabs | `ui/controls.tsx` | Real tabs: arrow keys, Home, End; activation follows focus |
| Status | `ui/controls.tsx` | Glyph **and** words. Never colour alone, at any width. Circles and a tick say *where a recommendation is*; squares say *who can see it* |
| Skeleton, EmptyState, Notice | `ui/controls.tsx` | Skeletons are still, on purpose |
| Drawer, Sheet, Curtain | `ui/Overlay.tsx` | Native `<dialog>`: modal, Esc, focus trap and return |
| Portrait, PortraitPlaceholder | `Portrait.tsx` | Photographs from `lib/photos.ts`; ratios, finish, view-transition hook |
| Marker, Label, TextLink, Spectrum, Reveal | `primitives.tsx` | `Spectrum` replaces rating dots: a position between two poles |
| AnnotatedPortrait, FocusWindow, ObservationList | `dossier/Assessment.tsx` | Expert observation, not a form. The window is the phone version of the portrait |
| RecommendationRow | `dossier/Recommendations.tsx` | Editorial rows, expandable rationale, private note, earlier-versus-current comparison, and (in the dossier) the actions that move it on |
| StatusPair, RecommendationSummary, VersionCompare | `dossier/Recommendations.tsx` | The two questions as two signals; one quiet sentence above the list; the earlier and current wording side by side |
| ClientPresentation, SharedRecommendationRow | `components/share/` | The page a client opens. Renders a `ClientView` and nothing else: no controls, no status words, no navigation |
| Connector | `dossier/Connector.tsx` | Marker-to-note line |
| ClientNav | `dossier/ClientNav.tsx` | Client context header, chapter rail, chapter picker |
| SiteNav, CommandPalette | `SiteNav.tsx`, `CommandPalette.tsx` | The shell that recedes; ⌘K |

Copy for reusable patterns comes from `web/src/lib/copy.ts` (English and Spanish). Domain enums (`area`, `priority`) are keys; what people read comes from the dictionary.

### States
Every state speaks in the product's voice: first person, calm, specific about what to do next. Branded `not-found.tsx`, `error.tsx` (this version of Next calls the recovery function **`retry`**, not `reset`), `global-error.tsx` and `loading.tsx` (the shape of a page, not a spinner). Empty, saved, failed and validation patterns are in the lab.

## 4. The client dossier (the flagship)

It opens as a person, then becomes operational. Read in four movements:

1. **The read.** 01 Identity, 02 Presence (strategy).
2. **The advice.** 03 Assessment, 04 Opportunities (recommendations).
3. **The craft.** 05 Colour, 06 Silhouette, 07 Wardrobe, 08 Looks.
4. **The record.** 09 Evolution (sessions and plan).

Each chapter has an editorial title and a plain name the consultant would search for (`chapters` in `lib/atelier.ts`).

**The first screen, at every width, must answer:** who she is (portrait, name), who she wants to influence (audiences), how she wants to be perceived (the statement), what I have noticed (marker 1 pinned to the picture), and what happens next (the next action). On a phone the portrait comes first and the name interlocks with its lower edge.

**The stage.** From 03 through 04 one portrait stays in place while the notes and the advice move past it. Markers are buttons. On wide screens a fine line runs from the selected marker to its note, and from a recommendation to the observation that motivated it. **On phones** the picture cannot sit beside the notes, so a 2:1 window of it sticks under the header and pans and zooms (520ms) to whichever observation is open.

**Recommendations** are numbered editorial rows: two quiet signals (below), priority and audience; the sentence; the next action; and, on opening, why, the observation it answers, the part of her desired perception it serves, the consultant's private note, an earlier-versus-current comparison when there is one, and the actions that move it on. Sorted by priority. A link such as `/clients/marisol#rec-rec-3` (from the Studio, the wardrobe, search) lands on the row opened with its observation lit on the portrait: the person, the observation and the recommendation stay connected.

### Workflow and the client's view

Two questions, always answered apart and never in the same words as the *audiences* (the board, the team):

| Question | Values | Shape | Words |
| --- | --- | --- | --- |
| Where is it? (workflow) | Draft → Awaiting review → Approved | circle, filled circle, tick | Draft, Awaiting review, Approved |
| Who can see it? (visibility) | Consultant only, Shared with the client | hollow square, solid square | Consultant only, Shared with Marisol |

One rule ties them: **only an approved recommendation can be shared**, and `lib/workflow.ts` makes anything else impossible (tests enumerate every state and action). Approving does not share; sharing is a separate, confirmed step (a sheet that says what the client will and will not see); a shared recommendation is withdrawn before it can be reopened, so pulling something back from a client is never a side effect. Buttons say what they do and, under the primary one, what follows from it. A change is announced in a live region and focus moves to it.

**What a client can see** is built, not filtered: `toClientView` (`lib/share.ts`) returns a new object from a whitelist of fields of the approved-and-shared recommendations. Private notes, drafts, session notes, the action-plan draft, observations and other clients are never passed in, so they cannot be hidden by a CSS rule that fails, because they are never sent (`docs/audit/scripts/share-boundary.js` checks the HTML, the RSC data and every script). The client's own numbering is contiguous, so a gap cannot reveal a hidden item. The consultant previews the same component with the same object at `/clients/marisol/preview`; the only difference is a bar outside the presentation that shows counts, never titles. The client's page lives in the `(share)` route group, which has none of the studio's chrome (its ⌘K search lists every client).

**Earlier and current** is a comparison of *wording* between two versions of one recommendation, each labelled with its version, date and state, with a line saying so. It never says or implies a result. Looks and the client's direction have no history in the data, so they have no comparison.

## 5. Navigation

The software shell recedes: solid ground, one hairline once you scroll, **no blur, no gradient**. Outside a client: wordmark, four places, search (a one-row header with a full-screen menu on phones). **Inside a client the client is the context**: one way back, her name, a chapter rail of numerals at ≥ 1024px (the name appears on hover or focus), a native chapter picker below that, and search. Chapters end in a quiet hand-off to the next. A client's own page (`/share/…`) has no shell at all.

## 6. Signature interactions

Five, deliberately. Each works without motion.

1. **Portrait continuity.** The roster portrait morphs into the profile hero (520ms). Shared element via `<ViewTransition name="portrait-…" share="morph">`; the title has its own plain `view-transition-name` so it stays above the travelling image.
2. **Annotation connector.** Marker to note, 520ms draw, tracks scroll (at 1024px and above). On phones the sticky focus window pans and zooms to the open note instead. Without either, the open note and the highlighted marker say the same thing.
3. **Recommendation connection.** Opening a recommendation lights its observation on the portrait and states the perception it serves.
4. **Chapter navigation.** Rail, picker and hand-off links turn the dossier into chapters rather than tabs.
5. **Image in context.** Choosing a colour drapes it across her shoulders, as a colour analyst would; the compare slider reveals today against a reference with the handle at shoulder height.

## 7. Accessibility and language

- Everything is keyboard-operable and focus is always visible: a 2px cordovan ring, 3px offset (ivory on ink); fields thicken their underline; rows that are entirely links use `focus-inset`.
- Touch targets are ≥ 44px on coarse pointers. Small visual targets (markers, header links) grow an invisible hit area with `.hit`.
- Collapsed disclosures are `inert`. Overlays are native dialogs. Forms have real labels; errors are announced and tied to their field.
- Portraits have alternatives; decorative crops are hidden. One `h1` per page.
- Feedback is a short title and, if needed, one sentence (`Notice`): titles sit in a no-wrap status label, so a whole sentence in one overflows a phone. After a change, focus lands on the panel that announces it; a dialog returns focus to the button that opened it; a closed row's controls are `inert`.
- Spanish and long text are exercised in `/design-lab` (Patterns, Client view) at 390px, not assumed.
- Verified by `docs/audit/scripts/a11y-test.js` (25 checks), the production build and `next dev` (no warnings), and a run with the View Transitions API removed (navigation and back still work). Not yet done: a screen-reader pass, real Safari and Firefox (only Playwright's 2023 builds are available here, which cannot say anything about current engines), real-device touch.

## 8. Implementation rules (learned the hard way)

- **Layers.** The product's classes (typography, controls, photo finish) live in `@layer components`, so a Tailwind utility on an element always wins: `text-ink` overrides `.meta`'s colour, `hidden` hides a `.btn`. What must beat utilities stays **unlayered on purpose**: motion, reduced motion, dialogs, focus, view transitions. When you add a rule ask which side of that line it is on. (They were all unlayered until the second pass, which silently defeated utilities; the move was verified with a pixel diff and a computed-style diff of every element.)
- `.tone-*` sets colour on an element that already has a component class (`meta tone-accent`); it sits after them in the layer, so it wins.
- `body` is a flex column and pages centre `main` with `mx-auto`, which would size it to its content. `body > main { width: 100% }` prevents a wide table or grid from stretching the page.
- React's `<ViewTransition>` only names an element that animates. To layer an element above a morph, give it a plain `view-transition-name` and define its pseudo-element animations in CSS.
- `error.tsx` receives `retry`. Check `web/node_modules/next/dist/docs/` before using a Next API from memory (`web/AGENTS.md`).
- Photographs are plain `<img>` with a pre-built `srcset` (`lib/photos.ts`): assets are already cropped, graded and sized, so no runtime optimiser is needed and the standalone build stays small.
- **Route groups.** `(studio)` carries the consultant's chrome; `(share)` carries none. Anything a client can open belongs in `(share)`, never under `(studio)`.
- **`not-found.tsx` at the root is included in the data of every page**, so it must be safe for a client to receive: neutral, no studio header, no client names, no links into the studio.
- **A page checks its own slug before it reads any data.** Next renders a page and its layouts side by side, so relying on a layout's `notFound()` still puts the page's data in a 404 response. The layout check only makes the status a real 404.
- **Server Actions are public POST endpoints.** Validate every argument, take only a reference and the caller's belief about the current state, refuse a stale request, and return only what the page needs to say what happened.
- **Size a name to its column**, not to the viewport (`cqw` on a container): a long first name scales down instead of breaking mid-word.
- Do not add scroll-triggered animation, decorative blur, a second radius or a colour for decoration.

## 9. Quality tests (used to judge this iteration)

Screenshot (would a stranger call it an unusually beautiful product for a high-end image consultant, or a nice SaaS app?), restraint (does removing an effect make it stronger?), identity (could it belong to twenty unrelated SaaS products?), luxury (does quality come from type, proportion, imagery, whitespace and craft rather than effects?), consultant (can she understand the workflow instantly?).
