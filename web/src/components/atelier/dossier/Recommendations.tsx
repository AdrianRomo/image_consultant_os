"use client";
import type { Audience, Observation, Recommendation } from "@/lib/fixture";
import { copy, type Copy } from "@/lib/copy";
import { Status } from "../ui/controls";

/* ------------------------------------------------------------------
   Recommendations as considered advice.
   Each is an editorial row: what to change, the next action, and a quiet
   line of context. Opening one reveals why, what it answers, and which part
   of the desired perception it serves. Status is a secondary label.
   Not a backlog: no boxes, no badges competing with the sentence.
   ------------------------------------------------------------------ */
const priorityRank = { High: 0, Medium: 1, Low: 2 } as const;
export const sortRecommendations = (recs: Recommendation[]) =>
  [...recs].sort((a, b) => priorityRank[a.priority] - priorityRank[b.priority]);

export function RecommendationRow({
  rec, number, audience, observation, observationNumber, open, onToggle, onShowObservation, t = copy.en,
}: {
  rec: Recommendation;
  number: number;
  audience?: Audience;
  observation: Observation;
  observationNumber: number;
  open: boolean;
  onToggle: () => void;
  onShowObservation: () => void;
  t?: Copy;
}) {
  const draft = rec.status === "Draft";
  return (
    <li className="border-t border-ink/15" data-anchor={rec.id} id={`rec-${rec.id}`}>
      <h4 className="m-0 font-normal">
        <button
          onClick={onToggle} aria-expanded={open} aria-controls={`rec-body-${rec.id}`}
          className="group tap grid w-full grid-cols-[2.5rem_1fr] items-baseline gap-x-4 py-7 text-left sm:grid-cols-[3.25rem_1fr]"
        >
          <span className="numeral tone-faint text-4xl leading-none" aria-hidden>{String(number).padStart(2, "0")}</span>
          <span className="min-w-0">
            <span className="label tone-muted flex flex-wrap items-center gap-x-4 gap-y-1">
              <span className={rec.priority === "High" ? "tone-ink" : ""}>{t.priority[rec.priority]}</span>
              <span>{audience ? t.forAudience(audience.name) : t.forEvery}</span>
              <Status tone={draft ? "review" : "approved"}>{draft ? t.awaiting : t.approved}</Status>
            </span>
            <span className="statement mt-2.5 block !text-[clamp(1.6rem,2.7vw,2.4rem)] transition-transform duration-[var(--dur-ui)] group-hover:translate-x-1">{rec.title}</span>
            <span className="mt-3.5 block text-sm leading-snug">
              <span className="label tone-muted mr-3">{t.next}</span>{rec.nextStep}
            </span>
          </span>
        </button>
      </h4>
      <div id={`rec-body-${rec.id}`} className={`grid transition-[grid-template-rows] duration-[var(--dur-ui)] ease-out ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
        <div className="overflow-hidden" inert={!open}>
          <dl className="grid gap-x-8 gap-y-6 pb-9 pl-[2.5rem] sm:pl-[3.25rem] md:grid-cols-2">
            <div className="md:col-span-2">
              <dt className="label tone-muted">{t.why}</dt>
              <dd className="body-copy mt-2">{rec.rationale}</dd>
            </div>
            <div>
              <dt className="label tone-muted">{t.because}</dt>
              <dd className="mt-2">
                <button onClick={onShowObservation} className="group/o tap text-left">
                  <span className="numeral tone-accent mr-2 text-xl">{observationNumber}</span>
                  <span className="headline !text-[1.25rem]"><span className="travel">{observation.title}</span></span>
                </button>
              </dd>
            </div>
            <div>
              <dt className="label tone-muted">{t.serves}</dt>
              <dd className="statement mt-2 !text-[1.6rem]">{rec.serves.toLowerCase()}</dd>
            </div>
          </dl>
        </div>
      </div>
    </li>
  );
}
