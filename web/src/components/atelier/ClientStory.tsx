"use client";
import Link from "next/link";
import { useState } from "react";
import { client, audById, obsById } from "@/lib/fixture";
import { chapters, identity, observationMarkers, itemById, looks, season, silhouette, wardrobe } from "@/lib/atelier";
import { photoCreditLine } from "@/lib/photos";
import { CompareSlider } from "./CompareSlider";
import { Garment } from "./Garment";
import { Portrait } from "./Portrait";
import { Label, Marker, Reveal, Spectrum, TextLink } from "./primitives";
import { AnnotatedPortrait, FocusWindow, ObservationList } from "./dossier/Assessment";
import { ClientNav } from "./dossier/ClientNav";
import { Connector } from "./dossier/Connector";
import { RecommendationRow, sortRecommendations } from "./dossier/Recommendations";
import { Filter, SelectField } from "./ui/controls";

const ch = (id: string) => chapters.find((c) => c.id === id)!;

/* A hand-off to the next chapter: a scroll cue that also names where you are going. */
function Onward({ to, className = "" }: { to: string; className?: string }) {
  const c = ch(to);
  return (
    <p className={`text-right ${className}`}>
      <a href={`#${c.id}`} className="label tone-muted tap group inline-flex items-center gap-3 py-2 hover:text-ink">
        <span className="travel pb-0.5">{c.n} · {c.label}</span>
        <span aria-hidden className="transition-transform duration-[var(--dur-ui)] group-hover:translate-y-0.5">↓</span>
      </a>
    </p>
  );
}

export function ClientStory() {
  const [sel, setSel] = useState<string>(client.observations[0].id); // the observation the portrait is showing
  const [openRec, setOpenRec] = useState<string | null>(null);
  const [audience, setAudience] = useState<string>("all");
  const [colour, setColour] = useState<string | null>(null);

  const chosen = season.colors.find((c) => c.id === colour);
  const first = client.name.split(" ")[0];
  const [lead, ...restOfPerception] = client.desiredPerception.split(/(?<=\.)\s+/);
  const recs = sortRecommendations(client.recommendations);
  const nextUp = recs.find((r) => r.status === "Approved") ?? recs[0];
  const shown = recs.filter((r) => audience === "all" || r.audienceId === audience);
  const anchorId = openRec ?? sel;
  const cardigan = wardrobe.find((w) => w.id === "w-grey-cardigan")!;
  const excerpt = ["w-ink-blazer", "w-camel-coat", "w-rust-blouse"].map((id) => itemById(id)!);

  const audienceItems = [
    { id: "all", label: "All", count: recs.length },
    ...client.audiences.map((a) => ({ id: a.id, label: a.name, count: recs.filter((r) => r.audienceId === a.id).length })),
  ];

  const showObservation = (id: string) => { setSel(id); setOpenRec(null); };
  const toggleRec = (id: string, observationId: string) => {
    setOpenRec((cur) => (cur === id ? null : id));
    setSel(observationId);
  };

  return (
    <main id="main" className="mx-auto max-w-[1600px] px-[var(--gutter)] pb-10">
      <ClientNav name={client.name} engagement={client.engagement} />
      <Connector markerId={sel} anchorId={anchorId} />

      {/* ============================================================ 01 IDENTITY
          Who she is, who she wants to influence, how she wants to be seen, what I have noticed,
          what happens next. All on the first screen, at every width. */}
      <section id="identity" aria-labelledby="client-name" className="pt-[calc(var(--header-h)+1.25rem)] lg:pt-[calc(var(--header-h)+2rem)]">
        <div className="grid grid-cols-12 gap-x-6">
          <div className="col-span-12 sm:col-span-9 sm:col-start-4 lg:col-span-5 lg:col-start-7 lg:row-start-1">
            <p className="label tone-muted mb-4 lg:hidden">Client dossier</p>
            <div className="relative">
              <Portrait tx="portrait-marisol" subject="today" priority label="Marisol Vega Ortiz as she presents today" sizes="(min-width: 1024px) 40vw, 92vw" />
              {/* The observation that matters most, pinned to the picture. */}
              <a
                href="#assessment" onClick={() => showObservation(client.observations[0].id)}
                className="group absolute flex flex-row-reverse items-center gap-2.5"
                style={{ right: `${100 - observationMarkers["obs-1"].x}%`, top: `${observationMarkers["obs-1"].y}%`, transform: "translate(14px, -50%)" }}
                aria-label={`Observation 1: ${client.observations[0].title}. Go to the assessment.`}
              >
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-cordovan bg-cordovan text-xs text-ivory">1</span>
                <span aria-hidden className="h-px w-7 bg-ink/70" />
                <span className="label tone-ink max-w-[9.5rem] leading-snug bg-ivory/90 px-2 py-1" aria-hidden>{client.observations[0].title}</span>
              </a>
            </div>
            <p className="label tone-muted mt-3 hidden flex-wrap justify-between gap-x-6 lg:flex">
              <span><span className="numeral text-sm normal-case tracking-normal">Fig. 01</span> · {first} today</span>
              <span>{identity.archetype}</span>
            </p>
          </div>

          <div className="relative z-10 col-span-12 lg:col-span-7 lg:col-start-1 lg:row-start-1">
            <p className="label tone-muted hidden lg:mt-1 lg:block">Client dossier</p>
            {/* A plain view-transition-name (not React's): the title gets its own layer so it stays above the
                portrait while the portrait travels in. React only names elements that animate, and this one does not. */}
            <h1
              id="client-name" aria-label={client.name}
              className="name relative -mt-[0.3em] lg:mt-5"
              style={{ fontSize: "clamp(4.25rem, min(13.2vw, 21svh), 13rem)", viewTransitionName: "client-name" }}
            >
              <span className="block uppercase">{first}</span>
              <span className="italic-serif block pl-[0.5em] normal-case">Vega Ortiz</span>
            </h1>
            <p className="meta mt-9 lg:mt-10">{client.role} · {client.location}</p>
            <p className="label tone-muted mt-2 lg:hidden">{identity.archetype}</p>

            <p className="statement mt-9 lg:mt-8" style={{ fontSize: "clamp(2.3rem, 3.7vw, 3.5rem)" }}>{lead}</p>
            <p className="lede mt-3">{restOfPerception.join(" ")}</p>

            <div className="mt-9 grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:mt-8 lg:w-[85%]">
              {client.audiences.map((a) => (
                <div key={a.id} className="border-t border-ink pt-3">
                  <p className="label tone-muted">For</p>
                  <p className="headline mt-1 !text-[1.4rem]">{a.name}</p>
                  <p className="meta mt-1 max-w-[32ch] lg:max-xl:hidden">{a.note}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 lg:mt-5">
              <p className="label tone-muted">Next</p>
              <TextLink href={`#rec-${nextUp.id}`} arrow="↓" className="!py-1.5 text-[0.95rem] leading-snug">{nextUp.nextStep}</TextLink>
            </div>
          </div>
        </div>
        <Onward to="presence" className="mt-10 lg:mt-14" />
      </section>

      {/* ============================================================ 02 PRESENCE (strategy) */}
      <section id="presence" aria-labelledby="presence-h" className="pt-[var(--rhythm-md)]">
        <Marker n={ch("presence").n} label={ch("presence").label} sub={ch("presence").sub} />
        <div className="mt-14 grid grid-cols-12 gap-x-6">
          <div className="col-span-12 lg:col-span-9 lg:col-start-3">
            <h2 id="presence-h" className="display-m">
              {first} reads as composed and warm. The opportunity is not more visual complexity, but <span className="italic-serif">more structure around the shoulders</span> and fewer competing details.
            </h2>
          </div>
        </div>

        {/* The gap is the engagement. */}
        <div className="mt-[var(--rhythm-sm)] grid grid-cols-12 items-baseline gap-x-6 gap-y-8">
          <div className="col-span-12 sm:col-span-6 lg:col-span-4 lg:col-start-3">
            <Label>Reads as, today</Label>
            <p className="statement mt-2" style={{ fontSize: "clamp(2rem, 3.4vw, 3rem)" }}>{client.traits.now.join(", ")}.</p>
          </div>
          <div className="col-span-12 sm:col-span-6 lg:col-span-4 lg:col-start-7">
            <Label tone="accent">Wants to read as</Label>
            <p className="statement mt-2" style={{ fontSize: "clamp(2rem, 3.4vw, 3rem)" }}>
              {client.traits.wanted.map((t, i) => (
                <span key={t}>
                  {client.traits.now.includes(t) ? t : <span className="border-b border-cordovan pb-[0.04em]">{t}</span>}
                  {i < client.traits.wanted.length - 1 ? ", " : "."}
                </span>
              ))}
            </p>
          </div>
        </div>

        <div className="mt-[var(--rhythm-sm)] grid grid-cols-12 gap-x-6 gap-y-10">
          <div className="col-span-12 grid gap-x-8 gap-y-8 sm:grid-cols-2 lg:col-span-8 lg:col-start-3">
            {client.audiences.map((a) => (
              <div key={a.id} className="border-t border-ink pt-4">
                <Label>Who is looking</Label>
                <h3 className="headline mt-2">{a.name}</h3>
                <p className="body-copy tone-muted mt-2">{a.note}</p>
              </div>
            ))}
          </div>
        </div>

        <figure className="mt-[var(--rhythm-md)] grid grid-cols-12 gap-x-6">
          <blockquote className="col-span-12 m-0 lg:col-span-8 lg:col-start-3">
            <p className="statement" style={{ fontSize: "clamp(2rem, 4.2vw, 3.75rem)" }}>“{client.inHerWords.quote.replace(/^[“"]|[”"]$/g, "")}”</p>
            <figcaption className="label tone-muted mt-5">In her words · {client.inHerWords.source}</figcaption>
          </blockquote>
        </figure>
      </section>

      {/* ============================================================ 03 ASSESSMENT + 04 OPPORTUNITIES
          One persistent portrait: the picture stays while the notes and the advice move past it. */}
      <div className="mt-[var(--rhythm-lg)] grid grid-cols-12 gap-x-6">
        {/* Phones: a window of the photograph sticks under the header and follows the open note. */}
        <FocusWindow
          observations={client.observations} selectedId={sel}
          className="sticky top-[var(--header-h)] z-30 col-span-12 mb-8 lg:hidden"
        />
        <aside className="col-span-12 hidden lg:col-span-5 lg:mb-0 lg:block" aria-label="Portrait with notes">
          <div className="lg:sticky lg:top-24">
            <AnnotatedPortrait
              observations={client.observations}
              selectedId={sel}
              onSelect={showObservation}
              caption={`Fig. 02 · ${first} today, with my notes`}
            />
          </div>
        </aside>

        <div className="col-span-12 lg:col-span-6 lg:col-start-7">
          <section id="assessment" aria-labelledby="assessment-h">
            <Marker n={ch("assessment").n} label={ch("assessment").label} sub={ch("assessment").sub} />
            <h2 id="assessment-h" className="display-m mt-10" style={{ fontSize: "clamp(2.1rem, 4vw, 3.4rem)" }}>
              Three things <span className="italic-serif">I noticed.</span>
            </h2>
            <p className="lede tone-muted mt-4">Choose a note and the picture shows where it lives.</p>
            <div className="mt-10">
              <ObservationList observations={client.observations} selectedId={sel} onSelect={showObservation} />
            </div>
          </section>

          <section id="opportunities" aria-labelledby="opportunities-h" className="pt-[var(--rhythm-md)]">
            <Marker n={ch("opportunities").n} label={ch("opportunities").label} sub={ch("opportunities").sub} />
            <h2 id="opportunities-h" className="display-m mt-10" style={{ fontSize: "clamp(2.1rem, 4vw, 3.4rem)" }}>
              What I would change, <span className="italic-serif">and in what order.</span>
            </h2>
            <div className="mt-8">
              <div className="hidden sm:block">
                <Filter label="Show recommendations for" items={audienceItems} value={audience} onChange={setAudience} />
              </div>
              <div className="sm:hidden">
                <SelectField label="Show recommendations for" value={audience} onChange={(e) => setAudience(e.target.value)}>
                  {audienceItems.map((a) => <option key={a.id} value={a.id}>{a.label} ({a.count})</option>)}
                </SelectField>
              </div>
            </div>
            <ol className="mt-4 border-b border-ink/15" aria-live="polite">
              {shown.map((r) => (
                <RecommendationRow
                  key={r.id} rec={r} number={recs.indexOf(r) + 1}
                  audience={audById(r.audienceId)}
                  observation={obsById(r.observationId)!}
                  observationNumber={client.observations.findIndex((o) => o.id === r.observationId) + 1}
                  open={openRec === r.id}
                  onToggle={() => toggleRec(r.id, r.observationId)}
                  onShowObservation={() => { showObservation(r.observationId); document.getElementById("assessment")?.scrollIntoView(); }}
                />
              ))}
            </ol>
            <Onward to="colour" className="mt-10" />
          </section>
        </div>
      </div>

      {/* ============================================================ 05 COLOUR */}
      <section id="colour" aria-labelledby="colour-h" className="pt-[var(--rhythm-lg)]">
        <Marker n={ch("colour").n} label={ch("colour").label} sub={ch("colour").sub} />
        <div className="mt-14 grid grid-cols-12 gap-x-6 gap-y-14">
          <div className="col-span-12 lg:col-span-7">
            <h2 id="colour-h" className="display-l uppercase">{season.name}<br /><span className="italic-serif normal-case">/ {season.qualifier.toLowerCase()}</span></h2>

            <div className="mt-12 grid max-w-lg gap-8 sm:grid-cols-3">
              {season.measures.map((m) => <Spectrum key={m.label} {...m} />)}
            </div>

            <ul className="mt-16 grid grid-cols-3 gap-x-3 gap-y-8 sm:grid-cols-6 sm:gap-x-4" aria-label="Palette">
              {season.colors.map((c) => {
                const on = colour === c.id;
                return (
                  <li key={c.id} className="list-none">
                    <button onClick={() => setColour(on ? null : c.id)} aria-pressed={on} aria-label={`${c.name}, ${c.role}`} className="group block w-full text-left">
                      <span
                        className="block aspect-[3/4] w-full border border-ink/10 transition-transform duration-[var(--dur-ui)] ease-out group-hover:-translate-y-1.5"
                        style={{ background: c.hex, transform: on ? "translateY(-0.75rem)" : undefined }}
                      />
                      <span className={`label mt-3 block ${on ? "tone-ink" : "tone-muted group-hover:text-ink"}`}>{c.name}</span>
                    </button>
                  </li>
                );
              })}
            </ul>

            <div className="mt-10 min-h-[4.75rem] max-w-md" aria-live="polite">
              {chosen ? (
                <div key={chosen.id}>
                  <Label tone="accent">{chosen.role}</Label>
                  <p className="statement mt-2 !text-[1.75rem]">{chosen.note}</p>
                </div>
              ) : (
                <p className="meta">Choose a colour to see how it works with her.</p>
              )}
            </div>
            <p className="meta mt-6">Best avoided · {season.avoid}</p>
          </div>

          <div className="col-span-12 sm:col-span-8 lg:col-span-4 lg:col-start-9">
            <Reveal mask className="w-full">
              <Portrait subject="today" label="Marisol with the chosen colour draped across the shoulders" sizes="(min-width: 1024px) 34vw, 92vw">
                {/* The colour analyst's drape: fabric held at the collarbone, so the eye judges colour against skin. */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 transition-[clip-path,background-color] duration-[var(--dur-ui)] ease-out"
                  style={{ background: chosen?.hex ?? "transparent", clipPath: chosen ? "ellipse(92% 31% at 50% 108%)" : "ellipse(92% 0% at 50% 108%)" }}
                />
              </Portrait>
            </Reveal>
            <p className="label tone-muted mt-3">Fig. 03 · {chosen ? `Draped in ${chosen.name.toLowerCase()}` : "Undraped"}</p>
          </div>
        </div>
      </section>

      {/* ============================================================ 06 SILHOUETTE */}
      <section id="silhouette" aria-labelledby="silhouette-h" className="pt-[var(--rhythm-lg)]">
        <Marker n={ch("silhouette").n} label={ch("silhouette").label} sub={ch("silhouette").sub} />
        <div className="mt-14 grid grid-cols-12 items-end gap-x-6 gap-y-10">
          <div className="col-span-12 lg:col-span-8">
            <Reveal mask className="w-full">
              <Portrait subject="direction" ratio="landscape" sizes="(min-width: 1024px) 64vw, 92vw" />
            </Reveal>
            <p className="label tone-muted mt-3">Fig. 04 · The line at the collar and lapel. A reference for the direction</p>
          </div>
          <div className="col-span-12 lg:col-span-4">
            <h2 id="silhouette-h" className="display-m">Structure at the top, <span className="italic-serif">ease below.</span></h2>
          </div>
        </div>
        <ol className="mt-[var(--rhythm-sm)] grid gap-x-8 gap-y-2 md:grid-cols-3">
          {silhouette.principles.map((p) => (
            <li key={p.n} className="list-none border-t border-ink/15 py-8">
              <span className="numeral tone-faint text-5xl">{p.n}.</span>
              <h3 className="headline mt-4">{p.title}</h3>
              <p className="body-copy mt-4">{p.body}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* ============================================================ 07 WARDROBE */}
      <section id="wardrobe" aria-labelledby="wardrobe-h" className="pt-[var(--rhythm-lg)]">
        <Marker n={ch("wardrobe").n} label={ch("wardrobe").label} sub={ch("wardrobe").sub} />
        <div className="mt-14 grid grid-cols-12 items-end gap-x-4 gap-y-10 lg:gap-x-6">
          <div className="col-span-12 lg:col-span-4">
            <h2 id="wardrobe-h" className="display-m">{wardrobe.length} pieces, <span className="italic-serif">considered.</span></h2>
            <p className="body-copy tone-muted mt-6">
              Her most-worn layer, the {cardigan.name.toLowerCase()}, sits outside the palette and lets the shoulder collapse. {cardigan.note}
            </p>
            <div className="mt-4"><TextLink href="/wardrobe">Enter the wardrobe</TextLink></div>
          </div>
          {excerpt.map((w, i) => (
            <div key={w.id} className={["col-span-6 lg:col-span-3 lg:col-start-5", "col-span-6 lg:col-span-3 lg:mb-20", "col-span-6 col-start-4 lg:col-span-2 lg:col-start-auto lg:-mb-2"][i]}>
              <Link href="/wardrobe" className="group block" data-cursor="View">
                <div className="frame bg-paper p-[12%]"><div className="frame-inner"><Garment kind={w.kind} color={w.color} className="h-auto w-full" /></div></div>
                <p className="label tone-muted mt-2">{w.colorName} · {w.category}</p>
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* ============================================================ 08 LOOKS */}
      <section id="looks" aria-labelledby="looks-h" className="pt-[var(--rhythm-lg)]">
        <Marker n={ch("looks").n} label={ch("looks").label} sub={ch("looks").sub} />
        <h2 id="looks-h" className="sr-only">Looks for the occasions ahead</h2>
        <ol className="mt-14">
          {looks.map((l, i) => {
            const pieces = Object.values(l.items).map((id) => itemById(id!)!);
            return (
              <li key={l.id} className="list-none border-t border-ink/15 last:border-b">
                <Link href={`/looks?look=${l.id}`} className="group focus-inset grid grid-cols-12 items-center gap-x-6 gap-y-6 py-10" data-cursor="Open">
                  <span className="numeral tone-faint col-span-2 text-3xl sm:col-span-1" aria-hidden>{String(i + 1).padStart(2, "0")}</span>
                  <div className="col-span-10 sm:col-span-5 lg:col-span-4">
                    <h3 className="headline transition-transform duration-[var(--dur-ui)] group-hover:translate-x-2">{l.title}</h3>
                    <p className="label tone-muted mt-2">{l.occasion}</p>
                    <p className="meta mt-2">{l.audienceNote}</p>
                  </div>
                  <div className="col-span-12 flex justify-end sm:col-span-6 lg:col-span-7" aria-hidden>
                    <div className="flex -space-x-5 sm:-space-x-8">
                      {pieces.map((p, k) => (
                        <div key={p.id} className="w-16 sm:w-24 lg:w-28" style={{ transform: `translateY(${(k % 2) * 10}px) rotate(${(k % 3 - 1) * 2}deg)` }}>
                          <Garment kind={p.kind} color={p.color} className="h-auto w-full" />
                        </div>
                      ))}
                    </div>
                  </div>
                </Link>
              </li>
            );
          })}
        </ol>
        <div className="mt-6 flex flex-wrap items-baseline justify-between gap-4">
          <TextLink href="/looks">Compose a new look</TextLink>
          <Onward to="evolution" />
        </div>
      </section>

      {/* ============================================================ 09 EVOLUTION (sessions and plan) */}
      <section id="evolution" aria-labelledby="evolution-h" className="pt-[var(--rhythm-lg)]">
        <Marker n={ch("evolution").n} label={ch("evolution").label} sub={ch("evolution").sub} />
        <div className="mt-14 grid grid-cols-12 gap-x-6 gap-y-14">
          <div className="col-span-12 lg:col-span-6">
            <CompareSlider className="aspect-[4/5] w-full" />
            <p className="label tone-muted mt-3">Fig. 05 · Today, against a reference for the direction. Intent, not a result.</p>
          </div>
          <div className="col-span-12 lg:col-span-5 lg:col-start-8 lg:pt-6">
            <Label tone="accent">{client.session.date}</Label>
            <h2 id="evolution-h" className="display-m mt-3" style={{ fontSize: "clamp(2.1rem, 3.8vw, 3.4rem)" }}>{client.session.title}</h2>
            <p className="body-copy mt-6">{client.session.notes}</p>
            <div className="mt-10 grid gap-8 sm:grid-cols-2">
              <div>
                <Label>Decided</Label>
                <ul className="mt-3 space-y-2 text-sm">{client.session.decisions.map((d) => <li key={d} className="border-t border-ink/15 pt-2">{d}</li>)}</ul>
              </div>
              <div>
                <Label>Follow-ups</Label>
                <ul className="mt-3 space-y-2 text-sm">{client.session.followUps.map((d) => <li key={d} className="border-t border-ink/15 pt-2">{d}</li>)}</ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="on-dark -mx-[var(--gutter)] mt-[var(--rhythm-lg)] bg-ink px-[var(--gutter)] py-24 text-ivory sm:py-32" aria-labelledby="plan-h">
        <div className="mx-auto grid max-w-[1600px] grid-cols-12 gap-x-6 gap-y-12">
          <div className="col-span-12 lg:col-span-4">
            <Label className="tone-inverse-muted">{client.actionPlan.status} · not yet shared with {first}</Label>
            <h2 id="plan-h" className="display-m mt-4">The plan, <span className="italic-serif">in three moves.</span></h2>
          </div>
          <ol className="col-span-12 grid gap-10 sm:grid-cols-3 lg:col-span-8">
            {client.actionPlan.items.map((it, i) => (
              <li key={it} className="list-none border-t border-ivory/30 pt-5">
                <span className="numeral tone-inverse-muted text-5xl">{i + 1}</span>
                <p className="mt-4 text-lg leading-snug">{it}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>
      <footer className="pt-10"><p className="meta max-w-[62ch]">A fictional client. The photographs are examples, not a portrait of a real client. {photoCreditLine}</p></footer>
    </main>
  );
}
