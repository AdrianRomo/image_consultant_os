"use client";
import { useEffect, useId, useRef, useState } from "react";
import type { Audience, EarlierVersion, Observation, Recommendation } from "@/lib/fixture";
import { copy, say, type Copy } from "@/lib/copy";
import { formatDay } from "@/lib/clock";
import { available, currentVersion, type Action } from "@/lib/workflow";
import { TextLink } from "../primitives";
import { Button, Notice, Status, type StatusTone } from "../ui/controls";
import { Sheet } from "../ui/Overlay";

/* ------------------------------------------------------------------
   Recommendations as considered advice.
   Each is an editorial row: what to change, the next action, and a quiet
   line of context. Opening one reveals why, what it answers, and which part
   of the desired perception it serves.

   Two questions are answered on every row, in two visibly different ways:
     workflow    Draft, Awaiting review, Approved   (circles and a tick)
     visibility  Consultant only, Shared with <her> (squares)
   Both carry words, so neither depends on colour.
   ------------------------------------------------------------------ */

const workflowTone: Record<Recommendation["status"], StatusTone> = { Draft: "draft", Review: "review", Approved: "approved" };

export function StatusPair({ rec, t, who, className = "" }: { rec: Pick<Recommendation, "status" | "visibility">; t: Copy; who: string; className?: string }) {
  const shared = rec.visibility === "client";
  return (
    <span className={`flex flex-wrap items-center gap-x-5 gap-y-1 ${className}`}>
      <Status tone={workflowTone[rec.status]}>{t.status[rec.status]}</Status>
      <Status tone={shared ? "published" : "private"}>{shared ? t.visibility.client(who) : t.visibility.consultant}</Status>
    </span>
  );
}

/** One quiet sentence above the list: where the recommendations stand, and a way to see what the client sees. */
export function RecommendationSummary({ recs, t, who, previewHref }: { recs: readonly Recommendation[]; t: Copy; who: string; previewHref?: string }) {
  const n = (s: Recommendation["status"]) => recs.filter((r) => r.status === s).length;
  const shared = recs.filter((r) => r.visibility === "client").length;
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-1">
      <p className="meta">
        {t.summary.counts(n("Draft"), n("Review"), n("Approved"))}
        <span className="mx-2 opacity-40" aria-hidden>/</span>
        {t.summary.shared(shared, who)}
      </p>
      {previewHref && <TextLink href={previewHref} className="text-sm">{t.previewLink(who)}</TextLink>}
    </div>
  );
}

/* ---------------------------------------------------------------- Earlier and current wording */
type Fields = { title: string; why: string; next: string };
const fieldsOf = (v: EarlierVersion): Fields => ({ title: v.title, why: v.rationale, next: v.nextStep });

export function VersionCompare({ rec, t }: { rec: Recommendation; t: Copy }) {
  const [open, setOpen] = useState(false);
  const panel = useId();
  const earlier = rec.earlier?.[rec.earlier.length - 1];
  if (!earlier) return null;
  const now: Fields = { title: rec.title, why: rec.rationale, next: rec.nextStep };
  const then = fieldsOf(earlier);
  const keys = ["title", "why", "next"] as const;
  const changed = keys.filter((k) => now[k] !== then[k]);
  const same = keys.filter((k) => now[k] === then[k]);
  const c = t.compare;
  const head = (label: string, version: number, status: string, on: string, strong: boolean) => (
    <div>
      <p className={`label ${strong ? "tone-ink" : "tone-muted"}`}>{label} · {c.version(version)}</p>
      <p className="meta mt-1">{formatDay(on, { lang: t.lang })} · {status}</p>
    </div>
  );
  return (
    <div className="mt-6">
      <button onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-controls={panel} className="label tone-ink tap group inline-flex items-center py-2">
        <span className="travel pb-0.5">{open ? c.close : c.open(earlier.version)}</span>
      </button>
      <div id={panel} className={`grid transition-[grid-template-rows] duration-[var(--dur-ui)] ease-out ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
        <div className="overflow-hidden" inert={!open}>
          <div className="mt-4 border-t border-ink/15 pt-6">
            <div className="grid gap-x-10 gap-y-8 md:grid-cols-2">
              {head(c.earlier, earlier.version, t.status[earlier.status], earlier.on, false)}
              {head(c.current, currentVersion(rec), t.status[rec.status], rec.updated, true)}
              {changed.map((k) => (
                <div key={k} className="contents">
                  <div className="min-w-0">
                    <p className="label tone-muted">{c.fields[k]}</p>
                    <p className="body-copy tone-muted mt-2 break-words">{then[k]}</p>
                  </div>
                  <div className="min-w-0">
                    <p className="label tone-muted">{c.fields[k]}</p>
                    <p className="body-copy mt-2 break-words">{now[k]}</p>
                  </div>
                </div>
              ))}
            </div>
            {same.length > 0 && <p className="meta mt-6">{same.map((k) => c.fields[k]).join(" · ")}: {c.unchanged.toLowerCase()}.</p>}
            <p className="meta mt-6 max-w-[62ch]">{c.note}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- Moving a recommendation on */
export type Feedback = { id: string; kind: "done" | "error"; title: string; detail?: string; nonce: number };
export type Workflow = {
  pending: Action | null; // the action in flight, for this or any recommendation
  feedback: Feedback | null;
  onAction: (rec: Recommendation, action: Action) => void;
};

function WorkflowPanel({ rec, t, who, workflow }: { rec: Recommendation; t: Copy; who: string; workflow: Workflow }) {
  const box = useRef<HTMLDivElement>(null);
  const [confirm, setConfirm] = useState(false);
  const actions = available(rec);
  const busy = workflow.pending !== null;
  const mine = workflow.feedback?.id === rec.id ? workflow.feedback : null;

  // After a change the button that was pressed may be gone; land on the panel so the result is announced and
  // keyboard focus is not left on nothing.
  useEffect(() => { if (mine?.kind === "done") box.current?.focus({ preventScroll: true }); }, [mine?.kind, mine?.nonce]);

  const state = rec.status === "Approved" ? (rec.visibility === "client" ? t.stateLine.Shared(who) : t.stateLine.Approved(who)) : t.stateLine[rec.status];
  const primary = actions[0];
  const effect = primary ? say(t.actions[primary].effect as string | ((n: string) => string), who) : "";
  const label = (a: Action) => say(t.actions[a].label as string | ((n: string) => string), who);
  const go = (a: Action) => (a === "share" ? setConfirm(true) : workflow.onAction(rec, a));

  return (
    <div ref={box} tabIndex={-1} role="group" aria-label={state} className="mt-8 border-t border-ink/15 pt-6">
      <p className="meta">{state}</p>
      {actions.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-3">
          {actions.map((a, i) => (
            <Button
              key={a} variant={i === 0 && a !== "unshare" ? "solid" : a === "unshare" ? "outline" : "quiet"}
              busy={workflow.pending === a} disabled={busy && workflow.pending !== a} onClick={() => go(a)}
            >
              {label(a)}
            </Button>
          ))}
        </div>
      )}
      {effect && <p className="meta mt-3 max-w-[62ch]">{effect}</p>}
      {mine && (
        <div className="mt-4">
          <Notice tone={mine.kind === "done" ? "success" : "error"} title={mine.title}>{mine.detail}</Notice>
        </div>
      )}

      <div className="mt-6">
        <p className="label tone-muted">{t.record}</p>
        <ol className="mt-2 flex flex-wrap gap-x-7 gap-y-1">
          {rec.events.map((e, i) => (
            <li key={`${e.on}-${e.kind}-${e.to}-${i}`} className="meta list-none">
              <span className="tone-ink">{e.kind === "status" ? t.events.status[e.to] : say(t.events.visibility[e.to] as string | ((n: string) => string), who)}</span>
              {" · "}{formatDay(e.on, { lang: t.lang })}
            </li>
          ))}
        </ol>
      </div>

      <Sheet open={confirm} onClose={() => setConfirm(false)} label={t.confirmShare.title(who)}>
        <div className="px-6 py-6">
          <p className="headline">{t.confirmShare.title(who)}</p>
          <p className="body-copy mt-3">{t.confirmShare.body(who)}</p>
          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2">
            <Button variant="solid" onClick={() => { setConfirm(false); workflow.onAction(rec, "share"); }}>{t.confirmShare.confirm}</Button>
            <Button variant="quiet" onClick={() => setConfirm(false)}>{t.confirmShare.cancel}</Button>
          </div>
        </div>
      </Sheet>
    </div>
  );
}

/* ---------------------------------------------------------------- The row */
export function RecommendationRow({
  rec, number, audience, observation, observationNumber, open, onToggle, onShowObservation, who, workflow, t = copy.en,
}: {
  rec: Recommendation;
  number: number;
  audience?: Audience;
  observation: Observation;
  observationNumber: number;
  open: boolean;
  onToggle: () => void;
  onShowObservation: () => void;
  /** The client's first name, for the words that name her (Shared with Marisol). */
  who: string;
  /** When present, the row can move the recommendation on. Omitted in specimens that only show the wording. */
  workflow?: Workflow;
  t?: Copy;
}) {
  return (
    <li className="border-t border-ink/15" data-anchor={rec.id} id={`rec-${rec.id}`}>
      <h4 className="m-0 font-normal">
        <button
          onClick={onToggle} aria-expanded={open} aria-controls={`rec-body-${rec.id}`}
          className="group tap grid w-full grid-cols-[2.5rem_1fr] items-baseline gap-x-4 py-7 text-left sm:grid-cols-[3.25rem_1fr]"
        >
          <span className="numeral tone-faint text-4xl leading-none" aria-hidden>{String(number).padStart(2, "0")}</span>
          <span className="min-w-0">
            <StatusPair rec={rec} t={t} who={who} />
            <span className="label tone-muted mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
              <span className={rec.priority === "High" ? "tone-ink" : ""}>{t.priority[rec.priority]}</span>
              <span>{audience ? t.forAudience(audience.name) : t.forEvery}</span>
            </span>
            <span className="statement mt-2.5 block break-words !text-[clamp(1.6rem,2.7vw,2.4rem)] transition-transform duration-[var(--dur-ui)] group-hover:translate-x-1">{rec.title}</span>
            <span className="mt-3.5 block break-words text-sm leading-snug">
              <span className="label tone-muted mr-3">{t.next}</span>{rec.nextStep}
            </span>
          </span>
        </button>
      </h4>
      <div id={`rec-body-${rec.id}`} className={`grid transition-[grid-template-rows] duration-[var(--dur-ui)] ease-out ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
        <div className="overflow-hidden" inert={!open}>
          <div className="pb-9 pl-[2.5rem] sm:pl-[3.25rem]">
            <dl className="grid gap-x-8 gap-y-6 md:grid-cols-2">
              <div className="min-w-0 md:col-span-2">
                <dt className="label tone-muted">{t.why}</dt>
                <dd className="body-copy mt-2 break-words">{rec.rationale}</dd>
              </div>
              <div className="min-w-0">
                <dt className="label tone-muted">{t.because}</dt>
                <dd className="mt-2">
                  <button onClick={onShowObservation} className="group/o tap text-left">
                    <span className="numeral tone-accent mr-2 text-xl">{observationNumber}</span>
                    <span className="headline break-words !text-[1.25rem]"><span className="travel">{observation.title}</span></span>
                  </button>
                </dd>
              </div>
              <div className="min-w-0">
                <dt className="label tone-muted">{t.serves}</dt>
                <dd className="statement mt-2 !text-[1.6rem]">{rec.serves.toLowerCase()}</dd>
              </div>
              {rec.privateNote && (
                <div className="min-w-0 border-l border-ink pl-4 md:col-span-2">
                  <dt className="label tone-ink">{t.privateNote}<span className="tone-muted ml-3 font-normal normal-case tracking-normal">{t.privateNoteHint(who)}</span></dt>
                  <dd className="body-copy mt-2 break-words">{rec.privateNote}</dd>
                </div>
              )}
            </dl>
            <VersionCompare rec={rec} t={t} />
            {workflow && <WorkflowPanel rec={rec} t={t} who={who} workflow={workflow} />}
          </div>
        </div>
      </div>
    </li>
  );
}
