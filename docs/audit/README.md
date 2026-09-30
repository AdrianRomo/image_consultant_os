# Visual audit: screenshots and how they were made

- `before/` is the production build of `main` at `814fa5f`. `after/` is this iteration.
- Widths are identical in both: 1440, 1024, 768 and 390 px. Files ending `-fold` are the first screen. `-sNN` are 1,000–1,300 px slices of the full page, and `-sheetNN` are side-by-side slices for long narrow pages. `state-*` are interaction states. `conn-*` and `morph-*` (after only) show the annotation connector and the portrait morph mid-flight.
- Raw full-page captures were removed to keep the repository small; every image is regenerable with the scripts below. Review images are JPEG (quality 86).
- BEFORE `state-*` was recaptured from a worktree of the original commit (`814fa5f`) with the original selectors; AFTER uses `scripts/audit-states.js`, whose phone step taps a note (phones have no on-picture markers any more).
- Also here: `pixdiff.js` and `styldiff.js` (compare two builds pixel-wise and element by element, used to verify the CSS layering change), `fallback-test.js` (no View Transitions API), `dev-scan.js` (`next dev` warnings), `focus-test.js`, and `grade-photos.js` (crop and grade the photographs; needs `sharp`, see `../IMAGE_CREDITS.md`).

## Reproduce

Playwright is installed globally on the workstation (`/usr/share/nodejs`); it is not a project dependency, so the project stays lean.

```bash
cd web && npm run build && npx next start -p 3100 &      # port 3000 is used by another service on this machine
cd docs/audit/scripts
export NODE_PATH=/usr/share/nodejs
node audit-pages.js  http://localhost:3100 /tmp/shots / /clients/marisol /wardrobe /looks /design-lab   # 4 widths, fold + full page
node audit-states.js http://localhost:3100 /tmp/shots        # palette, drawer, filters, empty/miss, 404, reduced motion...
node metrics.js      http://localhost:3100 /tmp/metrics.json # targets under 44px, text under 12px, radii, shadows, blur
node a11y-test.js    http://localhost:3100                   # 25 behavioural + accessibility checks (exit 1 on failure)
node console-scan.js http://localhost:3100                   # console and hydration errors per route
node slice-cli.js /tmp/shots/x.png <W> <H> <sliceH> [cols]   # slices or contact sheets of a full-page capture
```

## Workflow, client view and supporting states (second iteration)

- `workflow/` holds the review images for this iteration (1440 and 390): the Studio's Today, the recommendation list and rows (approved and shared with the comparison open, awaiting review, the share confirmation), the client's page and the consultant's preview, empty and 404 states, the wardrobe drawer with its relations, the look with its pieces, and the lab sections in Spanish. Regenerate with `scripts/workflow-states.js`.
- `scripts/workflow-e2e.js <base>` drives the whole workflow through the real UI (39 checks: valid states only, the client's page after every step, a stale window refused, keyboard, focus, phone overflow). Run it against a fresh server; state is in memory.
- `scripts/share-boundary.js <base> [--after-share]` loads the client's page in a browser, records everything the server sends (HTML, RSC data, every script) and searches it for private strings. It scans the consultant's dossier as a positive control, so a blind scan cannot pass. `--after-share` first approves and shares every recommendation through the UI.
- `a11y-test.js` now expects three board recommendations and checks the client page, the preview and the client's 404 for structure.
- Reproduce: build and serve as above, restart the server before each script that mutates state, then `NODE_PATH=/usr/share/nodejs node scripts/<name>.js http://localhost:3100 [outDir]`.
