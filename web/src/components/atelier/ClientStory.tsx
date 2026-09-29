"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { client, audById } from "@/lib/fixture";
import { identity, itemById, looks, season, shade, silhouette, wardrobe } from "@/lib/atelier";
import { CompareSlider } from "./CompareSlider";
import { Garment } from "./Garment";
import { PortraitStudy } from "./PortraitStudy";
import { Dots, Label, Marker, Reveal, TextLink } from "./primitives";

// Marker positions on the synthetic portrait (% of the 4:5 frame), tuned to this illustration.
const markerAt: Record<string, { x: number; y: number }> = {
  "obs-1": { x: 27, y: 79 },
  "obs-2": { x: 36, y: 92 },
  "obs-3": { x: 50, y: 21 },
};

const chapters = [
  ["identity", "01", "Identity"],
  ["presence", "02", "Presence"],
  ["color", "03", "Color"],
  ["silhouette", "04", "Silhouette"],
  ["wardrobe", "05", "Wardrobe"],
  ["looks", "06", "Looks"],
  ["opportunities", "07", "Opportunities"],
  ["evolution", "08", "Evolution"],
] as const;

function ChapterRail() {
  const [active, setActive] = useState("identity");
  useEffect(() => {
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: "-40% 0px -55% 0px" },
    );
    chapters.forEach(([id]) => { const el = document.getElementById(id); if (el) io.observe(el); });
    return () => io.disconnect();
  }, []);
  return (
    <nav aria-label="Chapters" className="fixed left-[var(--gutter)] top-1/2 z-30 hidden -translate-y-1/2 2xl:block">
      <ol className="space-y-1">
        {chapters.map(([id, n, label]) => (
          <li key={id}>
            <a href={`#${id}`} aria-current={active === id ? "true" : undefined} className={`group flex items-center gap-3 py-1.5 ${active === id ? "text-ink" : "text-taupe hover:text-ink"}`}>
              <span className="numeral w-5 text-sm">{n}</span>
              <span className={`label transition-all duration-300 ${active === id ? "opacity-100" : "-translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-100"}`}>{label}</span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function ClientStory() {
  const [sel, setSel] = useState(client.observations[0].id);
  const [color, setColor] = useState<string | null>(null);
  const active = client.observations.find((o) => o.id === sel)!;
  const chosen = season.colors.find((c) => c.id === color);
  const first = client.name.split(" ")[0];
  const excerpt = ["w-ink-blazer", "w-camel-coat", "w-rust-blouse", "w-cognac-loafers", "w-steel-watch"].map((id) => itemById(id)!);
  const cardigan = wardrobe.find((w) => w.id === "w-grey-cardigan")!;

  return (
    <main id="main" className="mx-auto max-w-[1600px] px-[var(--gutter)] pb-10">
      <ChapterRail />

      {/* ============================================================ 01 IDENTITY */}
      <section id="identity" className="scroll-mt-20 pt-28 sm:pt-36">
        <Label className="rise">Client story · {client.engagement}</Label>
        <h1 className="display-l rise mt-4 uppercase" style={{ ["--d" as string]: "100ms" }}>
          {first}<br /><span className="italic-serif normal-case">Vega Ortiz</span>
        </h1>
        <Marker n="01" label="Identity" className="mt-12" />

        <div className="mt-14 grid grid-cols-12 gap-x-6 gap-y-14">
          <div className="col-span-12 lg:col-span-5 lg:pt-16">
            <p className="statement rise" style={{ ["--d" as string]: "300ms", fontSize: "clamp(2.6rem, 6vw, 5.5rem)" }}>{identity.statement}</p>
            <p className="lede rise mt-6" style={{ ["--d" as string]: "450ms" }}>{identity.subline}</p>

            <dl className="mt-16 max-w-sm space-y-8">
              <Reveal>
                <dt className="label text-warm">Archetype</dt>
                <dd className="headline mt-1">{identity.archetype}</dd>
              </Reveal>
              <Reveal delay={80}>
                <dt className="label text-warm">Palette</dt>
                <dd className="mt-3 flex gap-2.5" aria-label={season.colors.map((c) => c.name).join(", ")}>
                  {season.colors.map((c) => <span key={c.id} className="h-6 w-6 rounded-full border border-ink/15" style={{ background: c.hex }} />)}
                </dd>
              </Reveal>
              <Reveal delay={160}>
                <dt className="label text-warm">Signature</dt>
                <dd className="headline mt-1">{identity.signature.join(" / ")}</dd>
              </Reveal>
            </dl>
          </div>

          <div className="relative col-span-12 lg:col-span-6 lg:col-start-7">
            <Reveal mask delay={150} className="frame aspect-[4/5] w-full">
              <div className="frame-inner h-full w-full"><PortraitStudy outfit="jacket" className="h-full w-full" /></div>
            </Reveal>
            <Reveal delay={500} className="absolute -bottom-10 -left-4 hidden w-[34%] sm:block lg:-left-24">
              <div className="frame aspect-[4/3] border-[6px] border-ivory">
                <div className="frame-inner h-full w-full"><PortraitStudy outfit="jacket" crop="shoulders" decorative className="h-full w-full" /></div>
              </div>
              <p className="label mt-2 text-warm">Detail · the shoulder line</p>
            </Reveal>
            <p className="label mt-3 text-right text-warm"><span className="numeral text-sm normal-case tracking-normal">Fig. 01</span> · Proposed direction</p>
          </div>
        </div>
      </section>

      {/* ============================================================ 02 PRESENCE */}
      <section id="presence" className="scroll-mt-20 pt-32 sm:pt-52">
        <Marker n="02" label="Presence" />
        <div className="mt-16 grid grid-cols-12 gap-x-6">
          <Reveal className="col-span-12 lg:col-span-9 lg:col-start-3">
            <h2 className="display-m">
              {first} reads as composed and warm. The opportunity is not more visual complexity, but <span className="italic-serif">more structure around the shoulders</span> and fewer competing details.
            </h2>
          </Reveal>
        </div>

        <div className="mt-20 grid grid-cols-12 gap-x-6 gap-y-10">
          <div className="col-span-12 lg:col-span-4 lg:col-start-2">
            <Label>Desired perception</Label>
            <Reveal><p className="statement mt-3 !text-[clamp(1.6rem,2.8vw,2.4rem)]">{client.desiredPerception}</p></Reveal>
          </div>
          <div className="col-span-12 grid gap-8 sm:grid-cols-2 lg:col-span-5 lg:col-start-7">
            {client.audiences.map((a, i) => (
              <Reveal key={a.id} delay={i * 100} className="border-t border-ink pt-4">
                <Label>Who is looking</Label>
                <h3 className="headline mt-2">{a.name}</h3>
                <p className="body-copy mt-2 text-warm">{a.note}</p>
              </Reveal>
            ))}
          </div>
        </div>

        {/* Observation → Interpretation, with the portrait carrying the evidence */}
        <div className="mt-28 grid grid-cols-12 items-start gap-x-6 gap-y-12">
          <div className="col-span-12 sm:col-span-8 lg:col-span-4 lg:col-start-2">
            <div className="relative aspect-[4/5] w-full overflow-hidden">
              <PortraitStudy outfit="cardigan" bg="#d8d0c0" className="h-full w-full" label="Current appearance, with numbered observation markers" />
              {client.observations.map((o, i) => (
                <button
                  key={o.id}
                  onClick={() => setSel(o.id)}
                  aria-pressed={sel === o.id}
                  aria-label={`Observation ${i + 1}: ${o.title}`}
                  style={{ left: `${markerAt[o.id].x}%`, top: `${markerAt[o.id].y}%` }}
                  className={`absolute grid -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border text-xs transition-all duration-300 ${sel === o.id ? "h-9 w-9 border-cordovan bg-cordovan text-ivory" : "h-7 w-7 border-ivory bg-ink/70 text-ivory hover:bg-cordovan"}`}
                >
                  {i + 1}
                </button>
              ))}
              <div key={sel} className="drawn pointer-events-none absolute h-px bg-cordovan" style={{ left: `${markerAt[active.id].x}%`, top: `${markerAt[active.id].y}%`, width: `${100 - markerAt[active.id].x}%` }} />
            </div>
            <p className="label mt-3 text-warm">Fig. 02 · Current, with notes</p>
          </div>

          <div className="col-span-12 lg:col-span-5 lg:col-start-7 lg:pt-10">
            <ol className="border-t border-ink/15">
              {client.observations.map((o, i) => (
                <li key={o.id} className="border-b border-ink/15">
                  <button onClick={() => setSel(o.id)} aria-expanded={sel === o.id} className="group flex w-full items-baseline gap-5 py-5 text-left">
                    <span className={`numeral text-3xl transition-colors ${sel === o.id ? "text-cordovan" : "text-taupe"}`}>{i + 1}</span>
                    <span className="flex-1">
                      <span className="label text-warm">{o.area}</span>
                      <span className={`headline mt-1 block transition-transform duration-500 group-hover:translate-x-1.5 ${sel === o.id ? "" : "text-charcoal"}`}>{o.title}</span>
                    </span>
                  </button>
                  <div className={`grid transition-[grid-template-rows] duration-500 ease-out ${sel === o.id ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
                    <div className="overflow-hidden">
                      <div className="pb-6 pl-[3.25rem]">
                        <Label>Interpretation</Label>
                        <p className="body-copy mt-2">{o.detail}</p>
                        <div className="mt-3"><Link href="#opportunities" className="label travel py-2 text-cordovan">See the direction ↓</Link></div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* ============================================================ 03 COLOR */}
      <section id="color" className="scroll-mt-20 pt-32 sm:pt-52">
        <Marker n="03" label="Color" />
        <div className="mt-16 grid grid-cols-12 gap-x-6 gap-y-14">
          <div className="col-span-12 lg:col-span-7">
            <Reveal>
              <h2 className="display-l uppercase">{season.name}<br /><span className="italic-serif normal-case">/ {season.qualifier.toLowerCase()}</span></h2>
            </Reveal>
            <dl className="mt-10 grid max-w-xs gap-3">
              {season.measures.map((m) => (
                <Reveal key={m.label} className="flex items-center justify-between">
                  <dt className="label text-warm">{m.label}</dt>
                  <dd><Dots value={m.value} /></dd>
                </Reveal>
              ))}
            </dl>

            <ul className="mt-16 flex flex-wrap gap-x-4 gap-y-8 sm:gap-x-6" aria-label="Palette">
              {season.colors.map((c, i) => {
                const on = color === c.id;
                return (
                  <Reveal as="li" key={c.id} delay={i * 110} className="list-none">
                    <button onClick={() => setColor(on ? null : c.id)} aria-pressed={on} aria-label={`${c.name}, ${c.role}`} className="group flex flex-col items-center gap-3">
                      <span
                        className="block rounded-full border border-ink/10 transition-all duration-700 ease-out"
                        style={{ background: c.hex, width: on ? "clamp(5.5rem,10vw,8rem)" : "clamp(3.75rem,7vw,6rem)", height: on ? "clamp(5.5rem,10vw,8rem)" : "clamp(3.75rem,7vw,6rem)" }}
                      />
                      <span className={`label transition-opacity ${on ? "text-ink" : "text-warm group-hover:text-ink"}`}>{c.name}</span>
                    </button>
                  </Reveal>
                );
              })}
            </ul>

            <div className="mt-10 min-h-[5.5rem] max-w-md" aria-live="polite">
              {chosen ? (
                <div key={chosen.id} className="rise">
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
            <Reveal mask className="frame aspect-[3/4] w-full">
              <div className="frame-inner h-full w-full">
                <PortraitStudy outfit="jacket" crop="tall" bg={chosen ? shade(chosen.hex, 0.4) : "#dcd2bd"} skin="#c79f80" className="h-full w-full" label="Portrait; background tone follows the chosen colour" />
              </div>
            </Reveal>
            <p className="label mt-3 text-warm">Fig. 03 · {chosen ? `Against ${chosen.name.toLowerCase()}` : "Neutral ground"}</p>
          </div>
        </div>
      </section>

      {/* ============================================================ 04 SILHOUETTE */}
      <section id="silhouette" className="scroll-mt-20 pt-32 sm:pt-52">
        <Marker n="04" label="Silhouette" />
        <div className="mt-16 grid grid-cols-12 gap-x-6 gap-y-16">
          <div className="col-span-12 lg:col-span-4 lg:sticky lg:top-28 lg:self-start">
            <Reveal><h2 className="display-m">Structure at the top,<br /><span className="italic-serif">ease below.</span></h2></Reveal>
            <Reveal mask delay={150} className="frame mt-10 hidden aspect-[4/5] w-2/3 lg:block">
              <div className="frame-inner h-full w-full"><PortraitStudy outfit="jacket" crop="shoulders" decorative className="h-full w-full" /></div>
            </Reveal>
          </div>
          <ol className="col-span-12 lg:col-span-6 lg:col-start-7">
            {silhouette.principles.map((p, i) => (
              <Reveal as="li" key={p.n} className="list-none border-t border-ink/15 py-10" delay={i * 60}>
                <span className="numeral text-5xl text-taupe">{p.n}.</span>
                <h3 className="headline mt-4 !text-[clamp(1.8rem,3vw,2.6rem)]">{p.title}</h3>
                <p className="body-copy mt-4">{p.body}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* ============================================================ 05 WARDROBE */}
      <section id="wardrobe" className="scroll-mt-20 pt-32 sm:pt-52">
        <Marker n="05" label="Wardrobe" />
        <div className="mt-16 grid grid-cols-12 items-end gap-x-4 gap-y-10 lg:gap-x-6">
          <div className="col-span-12 lg:col-span-4">
            <Reveal>
              <p className="display-l numeral">{wardrobe.length}</p>
              <p className="label -mt-1 text-warm">Pieces, considered</p>
              <p className="body-copy mt-6 text-warm">
                Her most-worn layer, the {cardigan.name.toLowerCase()}, sits outside the palette and lets the shoulder collapse. {cardigan.note}
              </p>
              <div className="mt-4"><TextLink href="/wardrobe">Enter the wardrobe</TextLink></div>
            </Reveal>
          </div>
          {excerpt.map((w, i) => (
            <Reveal key={w.id} delay={i * 90} className={["col-span-6 lg:col-span-3", "col-span-6 lg:col-span-3 lg:mb-20", "col-span-4 lg:col-span-2", "col-span-4 lg:col-span-3 lg:-mb-6", "col-span-4 lg:col-span-1 lg:hidden"][i]}>
              <Link href="/wardrobe" className="group block" data-cursor="View">
                <div className="frame bg-paper p-[12%]"><div className="frame-inner"><Garment kind={w.kind} color={w.color} className="h-auto w-full" /></div></div>
                <p className="label mt-2 text-warm">{w.colorName}</p>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ============================================================ 06 LOOKS */}
      <section id="looks" className="scroll-mt-20 pt-32 sm:pt-52">
        <Marker n="06" label="Looks" />
        <ol className="mt-16">
          {looks.map((l, i) => {
            const pieces = Object.values(l.items).map((id) => itemById(id!)!);
            return (
              <Reveal as="li" key={l.id} className="list-none border-t border-ink/15 last:border-b">
                <Link href={`/looks?look=${l.id}`} className="group grid grid-cols-12 items-center gap-x-6 gap-y-6 py-10" data-cursor="Open">
                  <span className="numeral col-span-2 text-3xl text-taupe sm:col-span-1">{String(i + 1).padStart(2, "0")}</span>
                  <div className="col-span-10 sm:col-span-5 lg:col-span-4">
                    <h3 className="headline transition-transform duration-500 group-hover:translate-x-2">{l.title}</h3>
                    <p className="label mt-2 text-warm">{l.occasion}</p>
                    <p className="meta mt-2">{l.audienceNote}</p>
                  </div>
                  <div className="col-span-12 flex justify-end sm:col-span-6 lg:col-span-7">
                    <div className="flex -space-x-5 sm:-space-x-8">
                      {pieces.map((p, k) => (
                        <div key={p.id} className="w-16 transition-transform duration-500 sm:w-24 lg:w-28" style={{ transform: `translateY(${(k % 2) * 10}px) rotate(${(k % 3 - 1) * 2}deg)` }}>
                          <Garment kind={p.kind} color={p.color} className="h-auto w-full" />
                        </div>
                      ))}
                    </div>
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </ol>
        <div className="mt-6"><TextLink href="/looks">Compose a new look</TextLink></div>
      </section>

      {/* ============================================================ 07 OPPORTUNITIES */}
      <section id="opportunities" className="scroll-mt-20 pt-32 sm:pt-52">
        <Marker n="07" label="Opportunities" />
        <Reveal className="mt-16 max-w-3xl">
          <h2 className="display-m">What we noticed, what we <span className="italic-serif">recommend</span>, and what happens next.</h2>
        </Reveal>

        <div className="mt-20 space-y-4">
          {client.observations.map((o, oi) => {
            const recs = client.recommendations.filter((r) => r.observationId === o.id);
            return (
              <div key={o.id} className={`grid grid-cols-12 gap-x-6 gap-y-6 border-t border-ink/15 py-10 transition-opacity duration-500 ${o.id === sel ? "" : "opacity-80 hover:opacity-100"}`}>
                <div className="col-span-12 lg:col-span-4">
                  <Label>Observation · {o.area}</Label>
                  <h3 className="headline mt-3"><span className="numeral mr-3 text-taupe">{oi + 1}</span>{o.title}</h3>
                  <p className="body-copy mt-3 text-warm">{o.detail}</p>
                </div>
                <ul className="col-span-12 lg:col-span-7 lg:col-start-6">
                  {recs.map((r, ri) => (
                    <Reveal as="li" key={r.id} delay={ri * 100} className={`list-none ${ri ? "mt-10" : ""}`}>
                      <div className="flex items-baseline justify-between gap-6">
                        <Label>Recommendation{r.audienceId ? ` · ${audById(r.audienceId)!.name}` : ""}</Label>
                        {r.status === "Draft"
                          ? <span className="label flex items-center gap-2 text-cordovan"><span className="h-1.5 w-1.5 rounded-full bg-cordovan" aria-hidden />Awaiting review</span>
                          : <span className="label text-warm">Approved</span>}
                      </div>
                      <p className="statement mt-2 !text-[clamp(1.6rem,2.8vw,2.3rem)]">{r.title}</p>
                      <p className="body-copy mt-3">{r.rationale}</p>
                      <p className="mt-4 border-l border-ink pl-4 text-sm"><span className="label mr-3 text-warm">Next</span>{r.nextStep}</p>
                    </Reveal>
                  ))}
                </ul>
              </div>
            );
          })}
          <div className="border-t border-ink/15" />
        </div>
      </section>

      {/* ============================================================ 08 EVOLUTION */}
      <section id="evolution" className="scroll-mt-20 pt-32 sm:pt-52">
        <Marker n="08" label="Evolution" />
        <div className="mt-16 grid grid-cols-12 gap-x-6 gap-y-14">
          <div className="col-span-12 lg:col-span-6">
            <CompareSlider className="aspect-[4/5] w-full sm:aspect-[5/6]" />
            <p className="label mt-3 text-warm">Fig. 04 · Current against proposed direction. An illustration of intent, not a result.</p>
          </div>
          <div className="col-span-12 lg:col-span-5 lg:col-start-8 lg:pt-6">
            <Label tone="accent">{client.session.date}</Label>
            <Reveal><h2 className="display-m mt-3">{client.session.title}</h2></Reveal>
            <Reveal><p className="body-copy mt-6">{client.session.notes}</p></Reveal>
            <Reveal className="mt-10 grid gap-8 sm:grid-cols-2">
              <div>
                <Label>Decided</Label>
                <ul className="mt-3 space-y-2 text-sm">{client.session.decisions.map((d) => <li key={d} className="border-t border-ink/15 pt-2">{d}</li>)}</ul>
              </div>
              <div>
                <Label>Follow-ups</Label>
                <ul className="mt-3 space-y-2 text-sm">{client.session.followUps.map((d) => <li key={d} className="border-t border-ink/15 pt-2">{d}</li>)}</ul>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="on-dark -mx-[var(--gutter)] mt-32 bg-ink px-[var(--gutter)] py-24 text-ivory sm:mt-48 sm:py-32" aria-labelledby="plan-h">
        <div className="mx-auto grid max-w-[1600px] grid-cols-12 gap-x-6 gap-y-12">
          <div className="col-span-12 lg:col-span-4">
            <Label className="!text-taupe">{client.actionPlan.status} · not yet shared with {first}</Label>
            <h2 id="plan-h" className="display-m mt-4">The plan, <span className="italic-serif">in three moves.</span></h2>
          </div>
          <ol className="col-span-12 grid gap-10 sm:grid-cols-3 lg:col-span-8">
            {client.actionPlan.items.map((it, i) => (
              <Reveal as="li" key={it} delay={i * 110} className="list-none border-t border-ivory/30 pt-5">
                <span className="numeral text-5xl text-taupe">{i + 1}</span>
                <p className="mt-4 text-lg leading-snug">{it}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>
      <footer className="pt-10"><p className="meta">Synthetic client. No real person is represented.</p></footer>
    </main>
  );
}
