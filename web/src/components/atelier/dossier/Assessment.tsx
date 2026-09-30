"use client";
import Link from "next/link";
import { observationMarkers } from "@/lib/atelier";
import { copy, type Copy } from "@/lib/copy";
import type { Observation } from "@/lib/fixture";
import { photos } from "@/lib/photos";
import { Portrait } from "../Portrait";

/* ------------------------------------------------------------------
   Assessment as expert observation, not a form.
   The picture carries the evidence (numbered markers); the notes carry
   the judgment (hierarchy, attribution, progressive disclosure).
   ------------------------------------------------------------------ */

/** The sticky portrait with markers. `data-stage-portrait` and `data-marker` are what Connector reads. */
export function AnnotatedPortrait({
  observations, selectedId, onSelect, caption, t = copy.en,
}: {
  observations: Observation[];
  selectedId: string;
  onSelect: (id: string) => void;
  caption?: string;
  t?: Copy;
}) {
  return (
    <figure className="m-0">
      <div className="relative" style={{ width: "min(100%, calc((100svh - 9rem) * 0.8))" }} data-stage-portrait>
        <Portrait subject="today" label="Marisol as she presents today, with numbered observation markers" sizes="(min-width: 1024px) 42vw, 92vw" />
        {observations.map((o, i) => {
          const at = observationMarkers[o.id];
          const on = selectedId === o.id;
          return (
            <button
              key={o.id} data-marker={o.id} onClick={() => onSelect(o.id)} aria-pressed={on}
              aria-label={t.observation(i + 1, o.title)}
              style={{ left: `${at.x}%`, top: `${at.y}%` }}
              className={`hit absolute grid -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border text-xs transition-[width,height,background-color,border-color] duration-[var(--dur-ui)] ${
                on ? "h-9 w-9 border-cordovan bg-cordovan text-ivory" : "h-7 w-7 border-ivory bg-ink/75 text-ivory hover:bg-cordovan"
              }`}
            >
              {i + 1}
            </button>
          );
        })}
      </div>
      {caption && <figcaption className="label tone-muted mt-3">{caption}</figcaption>}
    </figure>
  );
}

/** The consultant's notes. One open at a time; the open one is the one the portrait is showing. */
export function ObservationList({
  observations, selectedId, onSelect, t = copy.en,
}: { observations: Observation[]; selectedId: string; onSelect: (id: string) => void; t?: Copy }) {
  return (
    <ol className="border-t border-ink/15">
      {observations.map((o, i) => {
        const open = selectedId === o.id;
        return (
          <li key={o.id} className="border-b border-ink/15" data-anchor={o.id}>
            <h4 className="m-0 font-normal">
              <button
                onClick={() => onSelect(o.id)} aria-expanded={open} aria-controls={`obs-${o.id}`}
                className="group tap flex w-full items-baseline gap-5 py-5 text-left"
              >
                <span className={`numeral text-3xl transition-colors duration-[var(--dur-feedback)] ${open ? "tone-accent" : "tone-faint"}`} aria-hidden>{i + 1}</span>
                <span className="min-w-0 flex-1">
                  <span className="label tone-muted block">{t.areas[o.area]}</span>
                  <span className={`headline mt-1 block transition-transform duration-[var(--dur-ui)] group-hover:translate-x-1 ${open ? "" : "tone-body"}`}>{o.title}</span>
                </span>
              </button>
            </h4>
            <div id={`obs-${o.id}`} className={`grid transition-[grid-template-rows] duration-[var(--dur-ui)] ease-out ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
              <div className="overflow-hidden" inert={!open}>
                <div className="pb-7 pl-[3.25rem]">
                  <p className="label tone-muted">{t.interpretation}</p>
                  <p className="body-copy mt-2">{o.detail}</p>
                  <p className="meta mt-4"><span className="italic-serif text-base">{t.noted}</span> · {o.noted}</p>
                  <Link href="#opportunities" className="label tone-accent tap mt-2 inline-flex items-center py-2">
                    <span className="travel pb-0.5">{t.seeRecommend}</span>
                  </Link>
                </div>
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

/* ------------------------------------------------------------------
   Phones: the picture cannot sit beside the notes, so a window of it sticks under the header and
   pans and zooms to whichever observation is open (520ms). It is the small-screen equivalent of the
   connector line: selecting a note moves the picture to where the note lives. Purely a crop change;
   the note itself is readable without it.
   ------------------------------------------------------------------ */
const ZOOM = 1.7;          // the photograph is shown at 170% of the window's width
const WINDOW_AR = 2;       // window is 2:1; the photograph is 4:5
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

export function FocusWindow({
  observations, selectedId, className = "",
}: { observations: Observation[]; selectedId: string; className?: string }) {
  const i = Math.max(0, observations.findIndex((o) => o.id === selectedId));
  const o = observations[i];
  const at = observationMarkers[o.id];
  const img = photos.today.bust;
  // Offsets in units of the photograph's own size (what translate(%) needs), keeping the marker centred
  // but never showing beyond the photograph's edge.
  const imgH = (ZOOM * 5) / 4;               // photograph height in window widths
  const winH = 1 / WINDOW_AR;                // window height in window widths
  const x = clamp(0.5 / ZOOM - at.x / 100, (1 - ZOOM) / ZOOM, 0);
  const y = clamp(winH / 2 / imgH - at.y / 100, (winH - imgH) / imgH, 0);
  return (
    <div className={`bg-ivory pb-3 pt-2 ${className}`}>
      <div
        role="img" aria-label={`Detail of the photograph, framed on observation ${i + 1}: ${o.title}`}
        className="photo relative w-full"
        style={{ aspectRatio: `${WINDOW_AR} / 1` }}
      >
        <div
          aria-hidden
          className="absolute left-0 top-0 aspect-[4/5] transition-transform duration-[var(--dur-spatial)] ease-out"
          style={{ width: `${ZOOM * 100}%`, transform: `translate(${x * 100}%, ${y * 100}%)` }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={img.src} srcSet={img.srcSet} sizes="170vw" alt="" width={img.width} height={img.height} loading="lazy" decoding="async" className="h-full w-full object-cover" style={{ objectPosition: photos.today.position }} />
          {observations.map((ob, k) => {
            const m = observationMarkers[ob.id];
            const on = ob.id === selectedId;
            return (
              <span
                key={ob.id} style={{ left: `${m.x}%`, top: `${m.y}%` }}
                className={`absolute grid -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border text-xs transition-[opacity,background-color] duration-[var(--dur-ui)] ${on ? "h-8 w-8 border-cordovan bg-cordovan text-ivory" : "h-6 w-6 border-ivory bg-ink/60 text-ivory opacity-70"}`}
              >{k + 1}</span>
            );
          })}
        </div>
      </div>
      <p className="label tone-muted mt-2 whitespace-nowrap" aria-hidden>
        <span className="numeral text-sm normal-case tracking-normal">Fig. 02</span> · Detail {i + 1} of {observations.length}
      </p>
    </div>
  );
}
