# Image Consultant OS — product and design plan

**Working draft · September 2026**  
**Purpose:** A practical starting document for building locally with Claude Code or Codex.  
**Product hypothesis:** Give a public image consultant one place to assess a client, define the desired perception for specific audiences, create recommendations, and track implementation. The consultant's judgment remains authoritative; software makes the work easier to deliver and revisit.

## 1. The outcome we are trying to achieve

A consultant should be able to open a client's profile and answer: *Who is this person trying to reach? How do they want to be perceived? What did I observe? What did I recommend? What happened afterward?* A client should receive a coherent, attractive action plan rather than a loose collection of messages and files.

**First useful workflow:** Create client → record goals and audiences → complete an assessment → write recommendations linked to observations and goals → publish an action plan → record a follow-up. A report or client portal may follow once this flow works for a real engagement.

**Differentiator to test:** Recommendations connect a *target audience* and *desired perception* to specific visual, verbal, nonverbal, and digital choices. This is a hypothesis, not a proven market gap.

**Success for the first pilot:** Your friend uses the product on one real client (with consent), can find relevant context before a follow-up in under a minute, and prefers the resulting plan to her current manual process. Record actual time spent producing a deliverable before and after; do not invent a success percentage in advance.

## 2. Discovery before committing to features

Spend 45–60 minutes with your friend reviewing **one recent engagement from first contact through follow-up**. Ask her to show the real artifacts, with identifying details removed when needed.

1. What does the client buy, and what does the consultant deliver?
2. Which questions are always asked? Which depend on the service (executive image, personal styling, speaking, social presence, etc.)?
3. Where do notes, photos, palettes, reports, messages, and tasks live today?
4. Which steps are repeated or require copying information between tools?
5. What does she consider proprietary methodology, and which judgment must remain hers?
6. What does the client actually revisit after the session?
7. What can be stored or shared, and for how long? How is photo and recording consent handled?
8. What is the most frustrating step she would pay to eliminate?

**Deliverable:** `docs/WORKFLOW.md` with the current journey, pain points, sample anonymized artifacts, and an ordered list of opportunities. Pick a first workflow only after this interview. If assessment/report production is the biggest pain, lead with that; if ongoing client follow-up is the pain, lead with profile + action plan. Avoid building a wardrobe catalog simply because it demos well.

## 3. Product scope

### Pilot MVP — one consultant, one complete engagement

| Area | Required behavior |
| --- | --- |
| Clients | Create/search a client; store contact, context, goals, and privacy settings. |
| Strategy | Record target audiences and desired perception in plain language; note constraints and preferences. |
| Assessment | Consultant-defined sections, questions, observations, evidence, and status. Scores are optional and must have defined criteria if used. |
| Recommendations | Each item links to an observation and optionally an audience/goal; include rationale, priority, status, and a next step. |
| Action plan | Group approved recommendations into a readable, shareable view; preserve draft vs published state. |
| Sessions | Dated notes, decisions, and follow-up tasks. |
| Images/files | Consent-aware uploads with captions and access controls; no public URLs by default. |

**Do not block the pilot on:** AI-generated outfits, video interpretation, a full closet, calendar/payments, white labeling, multi-consultant billing, or arbitrary numeric “image scores.” A simple read-only client view may be included if her clients regularly revisit recommendations; otherwise start with a polished PDF or private share view.

### Later, ordered by observed demand

- Reusable assessment templates and branded report export.
- Consultant-reviewed AI extraction from session notes or consented transcripts. Show the source, allow correction, and never silently overwrite the record.
- Palette, wardrobe, outfits, and event guidance using consultant-approved rules.
- Multiple consultants, brand settings, booking, billing, and subscriptions only after several independent consultants validate the workflow.

## 4. Design exploration: three concepts, one page

Build three **equally complete** versions of the same fictional Client Profile, with identical content and viewport sizes. Include a desktop view, a mobile view, and one interaction state for each. Use **synthetic client imagery and data** for this exploration. The shared content should show a portrait, desired perception, two audiences, three assessment observations, four recommendations, one session, and an action-plan preview.

| Concept | Visual character | Type and layout | Palette | Motion signature | Best fit |
| --- | --- | --- | --- | --- | --- |
| **A · Editorial fashion** | Magazine-like, confident, image-led | Oversized serif headlines, asymmetry, generous margins, fine rules | Ivory, ink, olive, restrained rust | Portrait continuity on navigation; annotation lines appear when selected | Consultant whose brand is expressive and style-led |
| **B · Quiet luxury** | Calm, discreet, high-touch | Smaller elegant serif, structured grid, soft surfaces, restrained radius | Cream, stone, charcoal, muted burgundy | Soft crossfades and precise drawer transitions | Executive or premium private clients |
| **C · Contemporary studio** | Bold, current, creative | Strong sans display, occasional editorial serif, graphic composition | Off-white, near-black, one vivid brand accent | Typography reveals and responsive image crops | Brand/personality consulting for creatives |

**Decision session with your friend:** Show all three without labeling a favorite. Ask which feels like *her* practice, which feels trustworthy to clients, and which makes assessment/action items easiest to use. Record her choice and what to borrow from the other concepts in `docs/DESIGN_DECISION.md`. Select one before building the design system. Do not combine all three into an inconsistent hybrid.

### Visual rules after selection

- Use portraits as meaningful content, with an elegant placeholder if absent. Keep consistent image ratios (4:5 portrait; 16:10 landscape).
- Strong typography and whitespace lead; thin dividers organize dense information. Use cards only when grouping improves comprehension.
- Content must remain legible and operational: editable fields, clear labels, readable long notes, obvious draft/published state, and useful empty states.
- Define semantic color tokens so the consultant's brand can evolve without manually recoloring every component.
- Design for Spanish and English text lengths. Choose one language for the initial pilot based on her clients; keep copy centralized.
- Avoid decorative grades of a person's attractiveness, deceptive before/after edits, and AI claims about character or confidence inferred from appearance.

### Motion vocabulary

| Interaction | Intent | Guideline |
| --- | --- | --- |
| Small feedback | Confirm hover, press, save | 120–180 ms, subtle color/opacity/position change |
| Tabs and drawers | Show state and spatial relationship | 200–320 ms; maintain focus and keyboard behavior |
| Client card → profile | Preserve visual continuity | 400–600 ms where technically reliable; simple fade fallback |
| Assessment sequence | Reveal hierarchy | Stagger only on first entry, not every revisit |
| Portrait annotations | Show what note refers to | Animate selected marker/line; the text must also work without motion |

Set shared duration/easing tokens rather than one-off values. Respect `prefers-reduced-motion`: remove transforms and large spatial motion; retain clear state changes. Make everything usable by keyboard and touch. Do not make a save or action depend on an animation finishing.

## 5. Suggested technical foundation

**Frontend:** Next.js App Router + TypeScript + Tailwind CSS. Use shadcn/ui primitives with one consistent underlying component library (Base UI or Radix, chosen during setup), then style them to the selected concept. Use Motion for React only where motion carries meaning. Official starting points: [Next.js](https://nextjs.org/docs/app/getting-started/installation), [shadcn/ui](https://ui.shadcn.com/docs/installation/next), [Motion](https://motion.dev/docs/react), and [reduced-motion guidance](https://motion.dev/docs/react-use-reduced-motion).

**Backend:** Django + DRF + PostgreSQL is a natural fit for your existing strengths. Keep domain logic in the API, not scattered between React components. Store uploaded media in private object storage with signed, short-lived access; start with local private storage in development. Use a single repository with `web/` and `api/` unless you already have a preferred local template.

**Pilot shortcuts:** Start the UI exploration with typed fixtures and a thin mock data adapter. After choosing a visual direction, implement persistent domain records and replace fixtures screen by screen. Use Django admin for internal repair and data inspection, not as the consultant experience. Choose an auth approach before collecting real client data; use a local synthetic dataset until access control is in place.

**Core records:** `Consultant`, `Client`, `Audience`, `PerceptionGoal`, `AssessmentTemplate`, `Assessment`, `Observation`, `Recommendation`, `ActionPlan`, `Session`, `MediaAsset`. Keep an explicit `consultant_id` ownership boundary on client-related records so a future multi-tenant model is feasible. Record publication status and timestamps; preserve the consultant's edits. Do not require scores to store meaningful qualitative assessments.

**Privacy gate before real client data:** Login, per-client authorization, private media, consent for photo/recording use, deletion/export path, and an explicit boundary between internal notes and client-visible content. Treat AI processing of photos/transcripts as a separate opt-in design decision.

## 6. Repository and working documents

```text
image-consultant-os/
├── README.md
├── CLAUDE.md                  # or AGENTS.md for Codex; concise repo instructions
├── docs/
│   ├── WORKFLOW.md           # observed workflow and prioritized pain
│   ├── PRODUCT.md            # MVP behavior, user stories, exclusions
│   ├── DESIGN.md             # selected art direction, tokens, layout, motion
│   ├── DESIGN_DECISION.md    # concepts, feedback, final choice
│   └── DECISIONS.md          # short architecture and product decisions
├── web/                       # Next.js app, /design-lab, concepts, real UI
└── api/                       # Django/DRF app and migrations
```

`/design-lab` should show typography, colors, spacing, buttons, form controls, portrait treatments, recommendation rows, mobile behavior, focus states, loading/empty/error states, and reduced-motion examples. Keep it as a living reference while building subsequent pages.

## 7. Build sequence and gates

### Phase 0 — Observe and define (roughly 1–2 sessions)

- Interview your friend and document the real engagement.
- Collect two or three **anonymized** examples of her current assessment/report/action plan.
- Agree on the first painful workflow and what a successful pilot would mean.

**Gate:** She confirms `WORKFLOW.md` reflects her practice; `PRODUCT.md` lists only the pilot workflow.

### Phase 1 — Explore the visual direction (roughly 2–4 focused days)

- Scaffold `web/`; create one typed synthetic Client Profile fixture.
- Implement concepts A, B, C as separate routes or previews using the same data and interactions.
- Show desktop and mobile at the same widths. Capture screenshots and note tradeoffs.
- Review with your friend and record the decision.

**Gate:** One concept chosen; no production API work required yet.

### Phase 2 — Establish the design system and flagship page (roughly 3–5 days)

- Convert the winning concept into tokens and reusable components in `/design-lab`.
- Build the Client Profile with real navigation among strategy, assessment, recommendations, and sessions using fixture data.
- Polish long names, missing portraits, empty states, narrow mobile layouts, keyboard focus, contrast, and reduced motion.
- Do a visual QA pass using screenshots at desktop and mobile sizes. Inspect the result yourself; ask Claude/Codex to critique the screenshots and fix specific issues.

**Gate:** The profile is attractive *and* usable for a full engagement. Your friend can explain the page without a walkthrough.

### Phase 3 — Make the consultant workflow real (roughly 1–2 weeks)

- Create Django models, migrations, API serializers/views, and authorization boundaries.
- Implement client create/search; strategy; assessment entry; recommendations; action-plan draft/publish; session history; private uploads if essential to the chosen workflow.
- Add explicit saving states and validation. Use realistic seed data and test a complete journey.

**Gate:** She completes a simulated engagement end-to-end without manual database changes or placeholder buttons.

### Phase 4 — Pilot and learn (1–3 engagements)

- Onboard her; use real client data only after the privacy gate.
- Observe a session without taking over; log friction, missing fields, confusing copy, and time-consuming steps.
- Fix blockers and the top three repeated problems. Decide whether the next feature is templates, reports, client view, or something else based on use.

**Gate:** She chooses to use it again for the next engagement and can identify a concrete improvement over her current process.

Time ranges are planning estimates for a focused solo build, not promises. Re-scope if discovery changes the product.

## 8. How to work with Claude Code or Codex

Give the agent **one phase and one reviewable outcome at a time**. Ask it to inspect the repo and relevant docs, state assumptions, make a small implementation plan, implement, run the project's checks, and report exact files changed plus any remaining issues. Review the running UI after each phase. Commit when a gate passes. Keep product decisions in `docs/DECISIONS.md` so the next session does not reinvent them.

### Prompt 1 — discovery synthesis

```text
We are designing Image Consultant OS. Read this plan completely.
I will give you notes and anonymized artifacts from a real public image
consultant's engagement. Extract the actual workflow, artifacts, repeated
steps, pain points, and questions we still need to ask. Write docs/WORKFLOW.md
and a narrowly scoped docs/PRODUCT.md. Separate observed facts from
hypotheses. Do not start coding or add features merely because they are
possible. Show me the proposed MVP workflow for review.
```

### Prompt 2 — three visual concepts

```text
Read Image_Consultant_OS_Plan.md, docs/WORKFLOW.md, and docs/PRODUCT.md.
Create three distinct Client Profile visual concepts: Editorial Fashion,
Quiet Luxury, and Contemporary Studio. Use identical typed fictional data,
content, viewport sizes, and primary tasks in all three. Implement separate
preview routes and a small index to compare them. Include desktop/mobile and
one meaningful interaction per concept. Use real layout and typography,
not wireframes or generic dashboard cards. No backend or real client data yet.
Provide screenshots, identify strengths/tradeoffs, and wait for the visual
selection before turning one concept into the system-wide design language.
```

### Prompt 3 — selected design system

```text
The selected concept and feedback are in docs/DESIGN_DECISION.md. Create
and document design tokens, typography, spacing, colors, image ratios,
components, and motion in docs/DESIGN.md. Build /design-lab and one polished
Client Profile using the shared fictional fixture. Use accessible primitives
for controls and Motion for React only where it helps continuity or feedback.
Support keyboard navigation, touch, responsive layouts, and reduced motion.
Perform a second pass on screenshots for spacing, typography, alignment,
contrast, empty states, and focus states. Report what you inspected.
```

### Prompt 4 — functional MVP

```text
Read docs/WORKFLOW.md, docs/PRODUCT.md, docs/DESIGN.md, and the existing code.
Implement the first complete consultant engagement workflow. Propose the
minimal data model and API contracts before editing; keep the chosen design.
Add persistence, authorization boundaries, validation, and clear draft versus
published behavior. Replace fixtures only for implemented screens. Exercise
create client → define goals/audiences → assess → recommend → publish plan →
record follow-up. Report what works, what still uses fixtures, and any privacy
requirements before real client data is entered.
```

### Prompt 5 — visual and usability audit

```text
Run the application and inspect every MVP screen at a desktop and narrow
mobile viewport. Walk through the complete consultant workflow with a
realistic, synthetic client. Identify specific issues in hierarchy, readability,
spacing, responsive behavior, state feedback, accessibility, and motion. Fix
the highest-impact issues, then run the relevant checks again. Do not change
the product scope or selected art direction. Give me a concise before/after
summary and screenshots.
```

## 9. Definition of done for the pilot

- A consultant can finish the complete workflow without leaving the app for an essential step.
- Client-visible material clearly differs from private notes, and publishing is deliberate.
- Every recommendation has a reason and a next action; the target audience/goal is visible when relevant.
- The UI works at desktop and phone sizes; images have appropriate alternatives; keyboard focus and reduced motion are handled.
- Loading, empty, validation, save-success, and error states are clear.
- One real consultant has evaluated the look and the workflow. Observed feedback and the next decision are written down.

## 10. Your first local session

1. Create an `image-consultant-os` directory and put **this file at its root**.
2. Interview your friend and save anonymized notes/artifacts in `docs/`.
3. Run **Prompt 1** with Claude Code or Codex. Review the MVP choice yourself.
4. Run **Prompt 2**, compare the three concepts with her, and write the decision.
5. Proceed to Prompt 3 only after the choice; then implement the working workflow with Prompt 4.

The first thing to build is **three versions of the same client page**. The first thing to learn is **which part of her real work deserves the product**. Both decisions should be made with her before expanding scope.

## 11. Model routing for the first iteration

**Principle:** Assign one model to each bounded deliverable. A stronger model reviews a result at a decision gate; it does not repeat the entire implementation. Keep decisions in repository files so a new model can start from a short, reliable handoff.

| Phase or task | Default model | Escalation | Deliverable and stopping point |
| --- | --- | --- | --- |
| Interview-note extraction and open questions | Claude Haiku 4.5 or GPT-6 Luna | Sonnet 5.5 or Sol if the notes are ambiguous | `docs/WORKFLOW.md`; distinguish observations from hypotheses. Stop for your review. |
| Three Client Profile concepts | Claude Sonnet 5.5 | Opus 5.5 if visual quality stalls after specific feedback | Three comparable preview routes, mobile/desktop screenshots, tradeoffs. Stop before making a final selection. |
| One independent visual critique | Claude Opus 5.5 **or** GPT-6 Astra | None by default | A short, prioritized critique of the three concepts. You and the consultant choose. |
| Selected design system and flagship page | Claude Sonnet 5.5 | Opus 5.5 for a narrowly scoped visual review | `docs/DESIGN.md`, `/design-lab`, polished Client Profile, screenshots. |
| Data model and working Django/API flow | GPT-6 Sol | GPT-6 Astra for a difficult domain or security decision | One vertical slice at a time, with migrations and relevant checks. |
| Small, well-specified changes | GPT-6 Luna or Claude Haiku 4.5 | Sol or Sonnet if the change touches several parts of the product | One focused edit and the check relevant to it. |
| Final end-to-end review | GPT-6 Astra **or** Claude Opus 5.5 | None by default | Prioritized findings and concrete reproduction steps. Sol/Sonnet implements the fixes. |

These are starting assignments, not a benchmark claim that one provider always makes better UI or backend code. Choose the models actually available on your subscriptions. As of September 2026, official model catalogs list [Claude's current models](https://platform.claude.com/docs/en/models/overview) and [Codex models](https://developers.openai.com/codex/models); check the local picker before using an exact ID. API token prices and subscription usage limits are different billing mechanisms, so compare your own usage before optimizing around a published price.

### Spending rules

1. **Default to ordinary reasoning effort.** Increase it only when the first attempt exposes a concrete hard problem. Avoid Max/Ultra or automatic parallel agents for a routine page or CRUD task.
2. **Give each agent a finish line.** For example: “Implement the three concepts, capture screenshots, report tradeoffs, then stop.” Avoid “build the whole product and make it beautiful.”
3. **Do not ask two premium models to implement the same feature.** Use the second as a reviewer with a specific question and a limited set of files/screenshots.
4. **Do not make every new model reread the entire repository and conversation.** Provide the plan, the current decision files, the relevant code area, and the last handoff. Let it inspect more only if necessary.
5. **Keep one owner for each implementation slice.** Sonnet owns the selected visual system; Sol owns the API slice. Change owners at a documented boundary rather than during a half-finished edit.
6. **Review work in the browser.** A visual issue described with a screenshot and a precise correction is cheaper to fix than repeated requests to “make it more premium.”
7. **Measure after a few tasks.** Note the model, task, number of turns, quality of the accepted result, and any retry. Route future tasks using that evidence rather than model reputation alone.

### Handoff format for every agent session

Ask the model to finish with this block; save lasting decisions in `docs/DECISIONS.md` or `docs/DESIGN_DECISION.md`:

```md
## Handoff
- Goal completed:
- Files changed:
- Decisions made and why:
- Checks run and results:
- Known gaps or risks:
- Exact next task:
```

Then start a new model with a small prompt:

```text
Read Image_Consultant_OS_Plan.md and the relevant docs/ decision files.
Read the previous handoff below. Your task is [one concrete outcome].
Inspect only the code needed for that task, expand as necessary, and do not
redo completed work. Report changed files, checks, and the next handoff.

[Paste the latest handoff]
```

### Starting commands

```bash
claude --model claude-sonnet-5-5
codex -m gpt-6-sol
```

For a focused task, change the model in a new session or use the tool's model selector. Claude Code documents the `--model` flag in its [model configuration guide](https://support.claude.com/en/articles/11940350-claude-code-model-configuration); Codex documents `-m` and `/model` in its [model guide](https://developers.openai.com/codex/models). The available models depend on your account and rollout.

## 12. Local tools and plugins: install only what helps the next phase

**Recommended minimum for the visual iteration:** Node.js, your preferred package manager, Git, Claude Code/Codex, and **one browser-control route** so the agent can open the running app, inspect desktop/mobile layouts, interact with controls, and capture screenshots. Browser access is the most useful addition for a design-heavy product. If your agent already has working browser control, use it; do not connect a second browser tool merely to have more plugins.

### Browser control: Playwright MCP (recommended if no browser tool exists)

The [official Playwright MCP server](https://playwright.dev/mcp/introduction) lets an agent navigate the local app, inspect its accessibility tree, interact with it, and capture screenshots. It requires Node.js 20 or newer. Add it to the tool you will use for UI implementation:

```bash
# Claude Code
claude mcp add playwright npx @playwright/mcp@latest

# Codex CLI
codex mcp add playwright -- npx @playwright/mcp@latest
```

The commands follow the [Playwright setup guide](https://playwright.dev/mcp/introduction) and [Codex MCP syntax](https://developers.openai.com/codex/mcp). Restart the agent if needed, confirm the server is visible, then ask it to open the local development URL and take a screenshot. Playwright MCP uses accessibility snapshots for interactions; **explicitly request screenshots for visual critique**. Keep the browser on the local app and use fictional clients during design exploration.

Add this instruction to the UI implementation prompt:

```text
After each page is implemented, run the local app. Inspect it in the browser
at a desktop width and a narrow phone width. Capture screenshots, look for
layout and typography defects, test the main interaction with keyboard and
pointer, fix the concrete issues, and show me the resulting screenshots.
Do not claim a visual QA pass was done if the browser was unavailable.
```

### Component and animation tooling

- **shadcn/ui CLI:** Set it up as part of the Next.js project, not as a separate global plugin. Add only the accessible primitives the page needs; consult its current [component docs and CLI](https://ui.shadcn.com/docs/cli). Restyle them to your chosen art direction.
- **Motion for React:** Install the package when you implement an interaction that needs it. For simple hover/focus effects use CSS. The optional [official `motion-react` agent skill](https://motion.dev/docs/react-app-builders) can help the agent choose correctly and avoid invalid imports:

  ```bash
  npx skills add https://motion.dev --skill motion-react
  ```

  Read the skill's installation prompt before accepting it. Its documentation says it works without an MCP server or account; add it during Phase 2 if animation work is actually underway.
- **Playwright Test:** Add project tests later for the few critical paths (create client, assess, publish action plan). You can capture screenshots during design exploration without maintaining a large visual snapshot suite. If you add screenshot comparisons, keep the browser/OS environment consistent and review baseline changes deliberately; see [Playwright visual comparisons](https://playwright.dev/docs/test-snapshots).

### Optional, only when the need appears

- **Figma integration:** Useful if your friend already has a brand system or you make approved Figma designs. The design work can start from reference images and the three coded concepts without it.
- **Current documentation tools:** Use official documentation and the shadcn CLI's `docs` command for component APIs. Add a docs MCP only if the agent repeatedly guesses outdated APIs.
- **Accessibility automation:** Add an accessibility checker once the first full page exists; follow its findings with manual keyboard, focus, contrast, and screen-reader checks.

**Skip for the first iteration:** Large UI effect collections, several browser MCP servers, paid animation kits, stock-image MCPs, and a pile of unrelated design plugins. They do not substitute for a clear `DESIGN.md`, good reference imagery, a running browser, and your friend's feedback.
