"use client";
import { useRef, useState, useSyncExternalStore } from "react";
import { copy, type Lang } from "@/lib/copy";
import { labContent } from "@/lib/lab";
import { client, type Recommendation } from "@/lib/fixture";
import { toClientView } from "@/lib/share";
import { apply, type Action } from "@/lib/workflow";
import { SharedEmpty, SharedRecommendationRow } from "../share/ClientPresentation";
import { AnnotatedPortrait, ObservationList } from "../atelier/dossier/Assessment";
import { RecommendationRow, StatusPair, type Feedback, type Workflow } from "../atelier/dossier/Recommendations";
import { openPalette } from "../atelier/CommandPalette";
import { Label } from "../atelier/primitives";
import { Button, EmptyState, Field, Filter, Notice, SelectField, Status, Tabs, TextArea, type StatusTone } from "../atelier/ui/controls";
import { Curtain, Drawer, Sheet } from "../atelier/ui/Overlay";

/* ---------------------------------------------------------------- Motion */
const tiers = [
  { token: "--dur-feedback", ms: 160, name: "Feedback", use: "Hover, press, a small state changing" },
  { token: "--dur-ui", ms: 260, name: "Interface", use: "Disclosure, tabs, a note opening" },
  { token: "--dur-panel", ms: 300, name: "Panel", use: "Drawers and dialogs" },
  { token: "--dur-spatial", ms: 520, name: "Spatial", use: "A portrait travelling between pages, an unmask, a connector line" },
];

const reducedQuery = "(prefers-reduced-motion: reduce)";
const subscribeReduced = (cb: () => void) => {
  const m = window.matchMedia(reducedQuery);
  m.addEventListener("change", cb);
  return () => m.removeEventListener("change", cb);
};

export function MotionDemo() {
  const [on, setOn] = useState(false);
  const [reduce, setReduce] = useState(false);
  const os = useSyncExternalStore(subscribeReduced, () => window.matchMedia(reducedQuery).matches, () => null);
  return (
    <div className={reduce ? "motion-reduced" : ""}>
      <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
        <Button onClick={() => setOn((v) => !v)}>{on ? "Return" : "Play all"}</Button>
        <label className="label tone-ink tap flex items-center gap-3">
          <input type="checkbox" checked={reduce} onChange={(e) => setReduce(e.target.checked)} className="h-4 w-4 accent-[var(--ink)]" />
          Reduced motion
        </label>
        <p className="meta">Your system preference: {os === null ? "…" : os ? "reduce" : "no preference"}. The product follows it automatically.</p>
      </div>
      <ul className="mt-8">
        {tiers.map((t) => (
          <li key={t.token} className="grid grid-cols-12 items-center gap-x-6 gap-y-3 border-t border-ink/15 py-6">
            <div className="col-span-12 sm:col-span-4">
              <p className="numeral text-4xl leading-none">{t.ms}<span className="label tone-muted ml-1 normal-case tracking-normal">ms</span></p>
              <p className="label tone-ink mt-2">{t.name}</p>
              <p className="meta mt-1">{t.use}</p>
            </div>
            <div className="col-span-12 sm:col-span-8" aria-hidden>
              <div className="relative h-6">
                <span className="absolute left-0 right-0 top-1/2 h-px bg-ink/25" />
                <span
                  className="absolute top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-ink"
                  style={{ left: on ? "calc(100% - 0.75rem)" : "0", transition: `left var(${t.token}) var(--ease-out)` }}
                />
              </div>
              <p className="meta mt-1">var({t.token}) · cubic-bezier(0.22, 1, 0.36, 1)</p>
            </div>
          </li>
        ))}
      </ul>
      <p className="body-copy tone-muted mt-2">
        With reduced motion, transforms, reveals and view transitions are removed and every state change is instant. Nothing depends on an animation finishing.
      </p>
    </div>
  );
}

/* ---------------------------------------------------------------- Controls */
const allTones: StatusTone[] = ["review", "draft", "approved", "published", "success", "error", "neutral"];
const toneLabel: Record<StatusTone, string> = {
  review: "Awaiting review", draft: "Draft", approved: "Approved", published: "Shared with Marisol", private: "Consultant only", success: "Saved", error: "Not saved", neutral: "Archived",
};

export function ControlsDemo() {
  const [tab, setTab] = useState("outer");
  const [filter, setFilter] = useState("all");
  const [name, setName] = useState("");
  const invalid = name.length > 0 && name.trim().length < 3;
  return (
    <div className="space-y-20">
      <div>
        <Label>Buttons</Label>
        <div className="mt-5 space-y-6">
          {(["outline", "solid", "quiet"] as const).map((v) => (
            <div key={v} className="flex flex-wrap items-center gap-x-6 gap-y-4">
              <p className="label tone-muted w-20 shrink-0">{v}</p>
              <Button variant={v}>Default</Button>
              <Button variant={v} className="is-hover">Hover</Button>
              <Button variant={v} className="is-active">Pressed</Button>
              <Button variant={v} className="is-focus">Focus</Button>
              <Button variant={v} disabled>Disabled</Button>
            </div>
          ))}
        </div>
        <p className="meta mt-5">44px minimum height, 2px radius, tracked small caps. Hover and pressed are specimens; real controls respond to the pointer and to the keyboard.</p>
        <div className="on-dark -mx-[var(--gutter)] mt-8 bg-ink px-[var(--gutter)] py-8">
          <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
            <p className="label tone-inverse-muted">On ink</p>
            <Button>Default</Button><Button className="is-focus">Focus</Button>
          </div>
        </div>
      </div>

      <div>
        <Label>Fields</Label>
        <div className="mt-6 grid gap-x-10 gap-y-10 md:grid-cols-2">
          <Field label="Occasion" placeholder="What are you dressing for?" hint="A sentence is enough." />
          <Field label="Occasion, hover" className="is-hover" defaultValue="Dinner with the board" />
          <Field label="Occasion, focus" className="is-focus" defaultValue="Dinner with the board" />
          <Field label="Occasion, disabled" disabled defaultValue="Locked once the plan is published" />
          <Field
            label="Client name (try two letters)" value={name} onChange={(e) => setName(e.target.value)}
            error={invalid ? "A name needs at least three letters." : undefined}
            success={name.trim().length >= 3 ? "Saved to the dossier." : undefined}
            hint="Validation is announced, marked with a glyph, and never colour alone."
          />
          <Field label="Error, static" defaultValue="M" error="A name needs at least three letters." />
          <Field label="Success, static" defaultValue="Marisol" success="Saved to the dossier." />
          <SelectField label="Language" hint="Interface and client-facing copy.">
            <option>English</option><option>Español</option>
          </SelectField>
          <div className="md:col-span-2">
            <TextArea label="Session note" hint="Private. Never shown to the client." defaultValue="Strongest moment: her opening on the restructure. Weakest: the answer to the cost question, where pace rose and gestures disappeared." />
          </div>
        </div>
      </div>

      <div>
        <Label>Filter, tabs and status</Label>
        <div className="mt-5 max-w-2xl">
          <Filter
            label="Sample filter" value={filter} onChange={setFilter}
            items={[{ id: "all", label: "All", count: 4 }, { id: "board", label: "The board", count: 2 }, { id: "team", label: "Regional leadership team", count: 1 }]}
          />
          <div className="mt-10">
            <Tabs
              label="Sample tabs" value={tab} onChange={setTab}
              items={[{ id: "outer", label: "Outer layer", mark: true }, { id: "top", label: "Top" }, { id: "shoes", label: "Shoes" }]}
            >
              <p className="body-copy mt-5">Selected: <strong className="font-medium">{tab}</strong>. Arrow keys, Home and End move between tabs; the panel follows focus.</p>
            </Tabs>
          </div>
        </div>
        <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-4">
          {allTones.map((t) => <Status key={t} tone={t}>{toneLabel[t]}</Status>)}
        </div>
        <p className="meta mt-4">Every status has a glyph shape and words. On a phone the words remain; only the colour is optional. Two questions are answered in two shapes: <strong className="font-medium">where a recommendation is</strong> (circles and a tick: draft, awaiting review, approved) and <strong className="font-medium">who can see it</strong> (squares: consultant only, shared).</p>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- Patterns, EN/ES, normal/long */
/* The same rules the product runs (lib/workflow.ts), applied locally so the lab needs no server. */
function useLocalWorkflow(initial: Recommendation[], t: (typeof copy)[Lang], who: string) {
  const [recs, setRecs] = useState(initial);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const nonce = useRef(0);
  const workflow: Workflow = {
    pending: null,
    feedback,
    onAction: (rec: Recommendation, action: Action) => {
      setRecs((cur) => cur.map((r) => (r.id === rec.id ? apply(r, action, "2026-03-14") : r)));
      setFeedback({ id: rec.id, kind: "done", ...t.done[action](who), nonce: ++nonce.current });
    },
  };
  return { recs, workflow };
}

export function PatternsDemo() {
  const [lang, setLang] = useState<Lang>("en");
  const [long, setLong] = useState(false);
  const [sel, setSel] = useState("s1");
  const [open, setOpen] = useState<string | null>(null);
  const t = copy[lang];
  const c = labContent[lang];
  const obs = long ? [c.longObservation, c.observation] : [c.observation, c.observation2];
  // Each language keeps its own working copies, so a state changed in English is not carried into Spanish.
  const en = useLocalWorkflow([labContent.en.rec, labContent.en.rec2, labContent.en.longRec], copy.en, "Marisol");
  const es = useLocalWorkflow([labContent.es.rec, labContent.es.rec2, labContent.es.longRec], copy.es, "Marisol");
  const local = lang === "en" ? en : es;
  const recs = long ? [local.recs[2], local.recs[0]] : [local.recs[0], local.recs[1]];
  return (
    <div lang={lang}>
      <div className="flex flex-wrap items-baseline gap-x-10 gap-y-2">
        <Filter label="Language" value={lang} onChange={setLang} items={[{ id: "en", label: "English" }, { id: "es", label: "Español" }]} />
        <Filter label="Copy length" value={long ? "long" : "normal"} onChange={(v) => setLong(v === "long")} items={[{ id: "normal", label: "Typical" }, { id: "long", label: "Long" }]} />
      </div>
      <div className="mt-8 grid grid-cols-12 gap-x-8 gap-y-14">
        <div className="col-span-12 lg:col-span-6">
          <Label>Observation</Label>
          <div className="mt-4">
            <ObservationList t={t} observations={obs} selectedId={sel} onSelect={setSel} />
          </div>
        </div>
        <div className="col-span-12 lg:col-span-6">
          <Label>Recommendation</Label>
          <ol className="mt-4 border-b border-ink/15">
            {recs.map((r, i) => (
              <RecommendationRow
                key={r.id} t={t} rec={r} number={i + 1} audience={c.audience} observation={obs[0]} observationNumber={1} who="Marisol" workflow={local.workflow}
                open={open === r.id} onToggle={() => setOpen(open === r.id ? null : r.id)} onShowObservation={() => setSel(obs[0].id)}
              />
            ))}
          </ol>
        </div>
      </div>
      <p className="meta mt-8">
        Labels come from a dictionary (<code>lib/copy.ts</code>), so “Siguiente paso” and “Pendiente de revisión” are the real Spanish strings, not English stretched. Open a row to move it on: these buttons run the product’s own transition rules on a local copy, so nothing is saved. Client name at length: <span className="italic-serif text-base">{c.longName}</span>
      </p>
    </div>
  );
}

/* ---------------------------------------------------------------- Overlays */
export function OverlaysDemo() {
  const [drawer, setDrawer] = useState(false);
  const [sheet, setSheet] = useState(false);
  const [curtain, setCurtain] = useState(false);
  return (
    <div>
      <div className="flex flex-wrap gap-4">
        <Button onClick={() => setDrawer(true)} aria-haspopup="dialog">Drawer</Button>
        <Button onClick={() => setSheet(true)} aria-haspopup="dialog">Sheet</Button>
        <Button onClick={() => setCurtain(true)} aria-haspopup="dialog">Full-screen menu</Button>
        <Button variant="quiet" onClick={openPalette}>Search ⌘K</Button>
      </div>
      <p className="meta mt-5">Native <code>&lt;dialog&gt;</code>: modal, Esc closes, focus is trapped and returned to the button that opened it. Drawer slides in 300ms; sheet settles in 260ms; the backdrop follows.</p>

      <Drawer open={drawer} onClose={() => setDrawer(false)} label="Drawer specimen">
        <div className="flex h-full flex-col px-6 py-4">
          <div className="flex items-center justify-between"><Label>Drawer</Label><button onClick={() => setDrawer(false)} className="label tone-muted tap -mr-2 px-2 hover:text-ink"><span className="travel pb-0.5">Close</span></button></div>
          <h3 className="display-m mt-8" style={{ fontSize: "clamp(2rem,4vw,2.75rem)" }}>Camel wrap coat</h3>
          <p className="statement mt-4 !text-[1.6rem]">Her warmest silhouette. Belt it, keep the lapel wide.</p>
          <p className="meta mt-auto pb-4">Esc, the Close control, or a click outside all return focus to where you were.</p>
        </div>
      </Drawer>
      <Sheet open={sheet} onClose={() => setSheet(false)} label="Sheet specimen">
        <div className="px-6 py-6">
          <Label>Sheet</Label>
          <p className="headline mt-3">Publish this plan to Marisol?</p>
          <p className="body-copy mt-3">She will see three moves and nothing from your private notes.</p>
          <div className="mt-6 flex gap-4"><Button variant="solid" onClick={() => setSheet(false)}>Publish</Button><Button variant="quiet" onClick={() => setSheet(false)}>Not yet</Button></div>
        </div>
      </Sheet>
      <Curtain open={curtain} onClose={() => setCurtain(false)} label="Menu specimen">
        <div className="flex h-full flex-col px-[var(--gutter)] pb-8">
          <div className="flex h-[var(--header-h)] items-center justify-between"><Label>Menu</Label><button onClick={() => setCurtain(false)} className="label tone-ink tap -mr-2 px-2">Close</button></div>
          <p className="display-m mt-10">Studio</p><p className="display-m italic-serif mt-4">Clients</p><p className="display-m mt-4">Wardrobe</p>
        </div>
      </Curtain>
    </div>
  );
}

/* ---------------------------------------------------------------- States */
function Boom({ armed }: { armed: boolean }) {
  if (armed) throw new Error("Design lab: previewing the error state");
  return null;
}

export function StatesDemo() {
  const [armed, setArmed] = useState(false);
  return (
    <div className="grid grid-cols-12 gap-x-8 gap-y-14">
      <Boom armed={armed} />
      <div className="col-span-12 md:col-span-6">
        <Label>Empty</Label>
        <EmptyState title="No observations yet." action={<Button>Add the first observation</Button>}>
          Start with what you noticed, not what you concluded. The recommendation comes after.
        </EmptyState>
      </div>
      <div className="col-span-12 space-y-8 md:col-span-6">
        <Label>Feedback</Label>
        <Notice tone="success" title="Plan saved as draft">Nothing is shared with Marisol until you publish.</Notice>
        <Notice tone="error" title="Could not save">The connection dropped. Your changes are still on this page; try again.</Notice>
        <Notice title="Analysis ready">Diego’s observations are complete and waiting for interpretation.</Notice>
        <Notice tone="error" title={copy.en.errors.stale.title}>{copy.en.errors.stale.detail}</Notice>
        <Notice tone="error" title={copy.es.errors.stale.title}>{copy.es.errors.stale.detail}</Notice>
      </div>
      <div className="col-span-12 md:col-span-6">
        <Label>Empty, with a next step</Label>
        <EmptyState title={copy.en.emptyAudience("the board")}>{copy.en.emptyAudienceBody}</EmptyState>
        <EmptyState title={copy.es.emptyAudience("el consejo")}>{copy.es.emptyAudienceBody}</EmptyState>
      </div>
      <div className="col-span-12 md:col-span-6">
        <Label>Working</Label>
        <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-4">
          <Button variant="solid" busy>{copy.en.actions.approve.label}</Button>
          <Button disabled>{copy.en.actions.return.label}</Button>
        </div>
        <p className="meta mt-4">While a change is saved, the button pressed shows the busy cursor and the others are disabled, so two changes cannot cross. If the recommendation changed elsewhere, the request is refused and the page shows what is true now.</p>
      </div>
      <div className="col-span-12">
        <Label>Error boundary</Label>
        <p className="body-copy tone-muted mt-3 max-w-xl">This replaces the page with the real error screen, and Try again returns you here. 404 and loading below are the real screens too.</p>
        <div className="mt-5 flex flex-wrap items-center gap-x-8 gap-y-2">
          <Button onClick={() => setArmed(true)}>Preview the error screen</Button>
          <a href="/this-page-does-not-exist" className="label tone-ink tap inline-flex items-center"><span className="travel pb-0.5">Preview the 404 →</span></a>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- Annotated portrait */
export function AnnotationDemo() {
  const [sel, setSel] = useState(client.observations[0].id);
  return (
    <div className="grid grid-cols-12 items-start gap-x-8 gap-y-8">
      <div className="col-span-12 sm:col-span-6 lg:col-span-4">
        <AnnotatedPortrait observations={client.observations} selectedId={sel} onSelect={setSel} caption="Fig. 02 · markers are buttons, 44px to touch" />
      </div>
      <div className="col-span-12 sm:col-span-6 lg:col-span-6 lg:col-start-6">
        <ObservationList observations={client.observations} selectedId={sel} onSelect={setSel} />
        <p className="meta mt-6">On wide screens a fine connector line runs from the marker to its note (see the dossier). Without it, the open note and the highlighted marker carry the same information.</p>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- The client's page */
export function ShareDemo() {
  const [lang, setLang] = useState<Lang>("en");
  const [long, setLong] = useState(false);
  const t = copy[lang];
  const c = labContent[lang];
  const profile = { name: "Marisol Vega Ortiz", desiredPerception: "", inHerWords: { quote: "", source: "" }, audiences: [c.audience] };
  const shared = (long ? [c.longRec, c.rec] : [c.rec, c.rec2]).map((r) => ({ ...r, status: "Approved" as const, visibility: "client" as const }));
  const rows = toClientView(profile, shared).recommendations;
  return (
    <div lang={lang}>
      <div className="flex flex-wrap items-baseline gap-x-10 gap-y-2">
        <Filter label="Language" value={lang} onChange={setLang} items={[{ id: "en", label: "English" }, { id: "es", label: "Español" }]} />
        <Filter label="Copy length" value={long ? "long" : "normal"} onChange={(v) => setLong(v === "long")} items={[{ id: "normal", label: "Typical" }, { id: "long", label: "Long" }]} />
      </div>
      <div className="mt-8 grid grid-cols-12 gap-x-8 gap-y-14">
        <div className="col-span-12 lg:col-span-7">
          <Label>What the client reads</Label>
          <ol className="mt-4 border-b border-ink/15">
            {rows.map((r) => <SharedRecommendationRow key={r.id} r={r} t={t} />)}
          </ol>
        </div>
        <div className="col-span-12 lg:col-span-4 lg:col-start-9">
          <Label>Nothing shared yet</Label>
          <div className="mt-4"><SharedEmpty t={t} /></div>
        </div>
      </div>
      <div className="mt-14 grid grid-cols-12 gap-x-8 gap-y-8">
        <div className="col-span-12 lg:col-span-7">
          <Label>The two questions, on one recommendation</Label>
          <ul className="mt-4 space-y-4">
            {([["Draft", "consultant"], ["Review", "consultant"], ["Approved", "consultant"], ["Approved", "client"]] as const).map(([status, visibility]) => (
              <li key={status + visibility} className="border-t border-ink/15 pt-4"><StatusPair rec={{ status, visibility }} t={t} who="Marisol" /></li>
            ))}
          </ul>
        </div>
        <p className="meta col-span-12 lg:col-span-4 lg:col-start-9">
          A client’s page has no status words, no controls and no navigation. It is built from a whitelist of fields, so a private note, a draft or another client cannot appear there even by mistake. The consultant previews the very same page at <code>/clients/marisol/preview</code>.
        </p>
      </div>
    </div>
  );
}
