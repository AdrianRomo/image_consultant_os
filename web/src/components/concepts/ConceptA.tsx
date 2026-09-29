"use client";
import { useState } from "react";
import { client, audById, obsById } from "@/lib/fixture";
import { Portrait } from "./Portrait";

// Concept A — editorial fashion: ivory, ink, olive, rust; oversized serif; annotation lines on the portrait.
export function ConceptA() {
  const [sel, setSel] = useState(client.observations[0].id);
  const active = obsById(sel)!;
  const serif = "font-[family-name:var(--font-playfair)]";
  return (
    <div className="min-h-screen bg-[#f4efe4] text-[#1d1b17]">
      <header className="mx-auto flex max-w-6xl items-baseline justify-between border-b border-[#1d1b17]/30 px-6 py-4 text-xs uppercase tracking-[0.25em]">
        <span>Image Consultant OS</span>
        <span className="text-[#8a3f22]">{client.engagement}</span>
      </header>

      <main className="mx-auto max-w-6xl px-6 pb-24">
        <section className="grid gap-10 pt-10 md:grid-cols-12">
          <div className="md:col-span-7 md:pt-8">
            <p className="text-xs uppercase tracking-[0.3em] text-[#5a6135]">Client profile</p>
            <h1 className={`${serif} anim-fade-up mt-4 text-5xl leading-[0.95] sm:text-7xl md:text-8xl`}>
              Marisol <em className="text-[#5a6135]">Vega</em> Ortiz
            </h1>
            <p className="mt-4 text-sm text-[#1d1b17]/70">{client.role} · {client.location}</p>
            <blockquote className={`${serif} mt-10 max-w-xl border-l-2 border-[#8a3f22] pl-5 text-2xl italic leading-snug sm:text-3xl`}>
              {client.desiredPerception}
            </blockquote>
            <p className="mt-2 pl-5 text-xs uppercase tracking-[0.2em] text-[#8a3f22]">Desired perception</p>
          </div>

          <div className="md:col-span-5">
            <div className="relative mx-auto aspect-[4/5] w-full max-w-sm overflow-hidden md:max-w-none">
              <Portrait bg="#dcd3bd" tone="#c79f80" ink="#1d1b17" className="h-full w-full" />
              {client.observations.map((o, i) => (
                <button
                  key={o.id}
                  onClick={() => setSel(o.id)}
                  aria-pressed={sel === o.id}
                  aria-label={`Observation ${i + 1}: ${o.title}`}
                  style={{ left: `${o.marker.x}%`, top: `${o.marker.y}%` }}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full border text-xs font-semibold transition-all duration-150 ${
                    sel === o.id
                      ? "h-9 w-9 border-[#8a3f22] bg-[#8a3f22] text-[#f4efe4]"
                      : "h-7 w-7 border-[#f4efe4] bg-[#1d1b17]/70 text-[#f4efe4] hover:bg-[#8a3f22]"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <div
                key={sel}
                className="anim-draw pointer-events-none absolute h-px bg-[#8a3f22]"
                style={{ left: `${active.marker.x}%`, top: `${active.marker.y}%`, width: `${100 - active.marker.x}%` }}
              />
            </div>
            <p key={sel + "t"} className="anim-fade-in mt-4 text-sm leading-relaxed">
              <span className="text-xs uppercase tracking-[0.2em] text-[#8a3f22]">{active.area} · Note {client.observations.indexOf(active) + 1}</span>
              <br />
              <strong>{active.title}.</strong> {active.detail}
            </p>
          </div>
        </section>

        <hr className="my-14 border-[#1d1b17]/30" />

        <section className="grid gap-10 md:grid-cols-12">
          <h2 className={`${serif} text-3xl md:col-span-3`}>Audiences</h2>
          <div className="grid gap-8 sm:grid-cols-2 md:col-span-9">
            {client.audiences.map((a) => (
              <div key={a.id} className="border-t border-[#1d1b17] pt-3">
                <h3 className={`${serif} text-xl`}>{a.name}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#1d1b17]/75">{a.note}</p>
              </div>
            ))}
          </div>
        </section>

        <hr className="my-14 border-[#1d1b17]/30" />

        <section className="grid gap-10 md:grid-cols-12">
          <h2 className={`${serif} text-3xl md:col-span-3`}>Assessment</h2>
          <ol className="md:col-span-9">
            {client.observations.map((o, i) => (
              <li key={o.id}>
                <button
                  onClick={() => setSel(o.id)}
                  className={`flex w-full gap-5 border-t border-[#1d1b17]/30 py-4 text-left transition-colors duration-150 ${sel === o.id ? "text-[#8a3f22]" : "hover:text-[#5a6135]"}`}
                >
                  <span className={`${serif} text-3xl italic`}>{i + 1}</span>
                  <span>
                    <span className="text-xs uppercase tracking-[0.2em]">{o.area}</span>
                    <span className="block text-lg font-medium">{o.title}</span>
                    <span className="block text-sm text-[#1d1b17]/70">{o.detail}</span>
                  </span>
                </button>
              </li>
            ))}
          </ol>
        </section>

        <hr className="my-14 border-[#1d1b17]/30" />

        <section className="grid gap-10 md:grid-cols-12">
          <h2 className={`${serif} text-3xl md:col-span-3`}>Recommendations</h2>
          <ul className="md:col-span-9">
            {client.recommendations.map((r) => {
              const focused = r.observationId === sel;
              return (
                <li key={r.id} className={`grid gap-1 border-t border-[#1d1b17]/30 py-4 transition-opacity duration-150 sm:grid-cols-[1fr_auto] ${focused ? "" : "opacity-60"}`}>
                  <div>
                    <h3 className="text-lg font-medium">{r.title}</h3>
                    <p className="text-sm text-[#1d1b17]/75">{r.rationale}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.15em] text-[#5a6135]">
                      Note {client.observations.findIndex((o) => o.id === r.observationId) + 1}
                      {r.audienceId && ` · ${audById(r.audienceId)!.name}`} · Next: {r.nextStep}
                    </p>
                  </div>
                  <div className="text-xs uppercase tracking-[0.2em] sm:text-right">
                    <span className="text-[#8a3f22]">{r.priority}</span>
                    <br />
                    {r.status}
                  </div>
                </li>
              );
            })}
          </ul>
        </section>

        <hr className="my-14 border-[#1d1b17]/30" />

        <section className="grid gap-10 md:grid-cols-12">
          <h2 className={`${serif} text-3xl md:col-span-3`}>Session</h2>
          <div className="md:col-span-5">
            <p className="text-xs uppercase tracking-[0.2em] text-[#8a3f22]">{client.session.date}</p>
            <h3 className={`${serif} mt-1 text-xl`}>{client.session.title}</h3>
            <p className="mt-3 text-sm leading-relaxed">{client.session.notes}</p>
          </div>
          <div className="md:col-span-4">
            <p className="text-xs uppercase tracking-[0.2em]">Follow-ups</p>
            <ul className="mt-2 space-y-1 text-sm">
              {client.session.followUps.map((f) => <li key={f}>— {f}</li>)}
            </ul>
          </div>
        </section>

        <section className="mt-16 bg-[#1d1b17] p-8 text-[#f4efe4]">
          <div className="flex items-baseline justify-between">
            <h2 className={`${serif} text-3xl`}>Action plan</h2>
            <span className="text-xs uppercase tracking-[0.25em] text-[#d99b7d]">{client.actionPlan.status} · not shared</span>
          </div>
          <ol className="mt-5 grid gap-4 sm:grid-cols-3">
            {client.actionPlan.items.map((it, i) => (
              <li key={it} className="border-t border-[#f4efe4]/40 pt-3 text-sm">
                <span className={`${serif} text-2xl italic text-[#d99b7d]`}>{i + 1}</span>
                <br />
                {it}
              </li>
            ))}
          </ol>
        </section>
      </main>
    </div>
  );
}
