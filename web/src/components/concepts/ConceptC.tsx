"use client";
import { useState } from "react";
import { client, audById, obsById } from "@/lib/fixture";
import { Portrait } from "./Portrait";

// Concept C — contemporary studio: off-white, near-black, one vivid accent; bold sans; audience filter.
export function ConceptC() {
  const [aud, setAud] = useState<string>("all");
  const shown = client.recommendations.filter((r) => aud === "all" || r.audienceId === aud);
  const display = "font-[family-name:var(--font-bricolage)]";
  const accent = "#ff4d2e";
  const words = client.desiredPerception.split(" ");

  return (
    <div className="min-h-screen bg-[#f7f6f2] text-[#111]">
      <header className="flex items-center justify-between px-6 py-4 text-sm font-medium">
        <span className={`${display} text-lg font-bold`}>ICOS<span style={{ color: accent }}>.</span></span>
        <span className="rounded-full border border-[#111] px-3 py-1 text-xs">{client.engagement}</span>
      </header>

      <main className="mx-auto max-w-6xl px-6 pb-24">
        <section className="grid items-end gap-8 pt-6 md:grid-cols-[1.4fr_1fr]">
          <div>
            <h1 className={`${display} text-6xl leading-[0.9] font-extrabold tracking-tight sm:text-8xl`}>
              {client.name.split(" ").slice(0, 2).map((w, i) => (
                <span key={w} className="anim-fade-up block" style={{ animationDelay: `${i * 90}ms` }}>{w}</span>
              ))}
            </h1>
            <p className="mt-4 text-sm text-[#111]/70">{client.role} · {client.location}</p>
            <p className={`${display} mt-8 max-w-xl text-2xl leading-tight font-semibold sm:text-3xl`}>
              {words.map((w, i) => (
                <span
                  key={i}
                  className="anim-fade-up mr-[0.25em] inline-block"
                  style={{ animationDelay: `${200 + i * 35}ms`, color: /decisive|warm/i.test(w) ? accent : undefined }}
                >
                  {w}
                </span>
              ))}
            </p>
          </div>
          <div className="relative mx-auto w-full max-w-sm md:max-w-none">
            <div className="aspect-[4/5] overflow-hidden md:aspect-[4/5] rounded-[2rem_2rem_2rem_0]" style={{ backgroundColor: accent }}>
              <Portrait bg={accent} tone="#f2c9b1" ink="#111" className="h-full w-full" />
            </div>
            <span className={`${display} absolute -bottom-3 -left-2 rotate-[-4deg] bg-[#111] px-3 py-1 text-sm font-bold text-[#f7f6f2]`}>
              Desired perception ↑
            </span>
          </div>
        </section>

        <section className="mt-20 grid gap-4 md:grid-cols-2">
          {client.audiences.map((a, i) => (
            <div key={a.id} className={`rounded-2xl p-6 ${i === 0 ? "bg-[#111] text-[#f7f6f2]" : "border-2 border-[#111]"}`}>
              <p className="text-xs font-semibold tracking-widest uppercase" style={{ color: i === 0 ? accent : undefined }}>Audience 0{i + 1}</p>
              <h2 className={`${display} mt-1 text-3xl font-bold`}>{a.name}</h2>
              <p className="mt-2 text-sm opacity-80">{a.note}</p>
            </div>
          ))}
        </section>

        <section className="mt-20">
          <h2 className={`${display} text-4xl font-extrabold`}>What I observed</h2>
          <ul className="mt-6 grid gap-4 md:grid-cols-3">
            {client.observations.map((o, i) => (
              <li key={o.id} className="border-t-4 border-[#111] pt-3">
                <span className={`${display} text-6xl font-extrabold`} style={{ color: accent }}>{i + 1}</span>
                <p className="text-xs font-semibold tracking-widest uppercase">{o.area}</p>
                <h3 className={`${display} text-xl font-bold`}>{o.title}</h3>
                <p className="mt-1 text-sm text-[#111]/75">{o.detail}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-20">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 className={`${display} text-4xl font-extrabold`}>What to do</h2>
            <div role="group" aria-label="Filter recommendations by audience" className="flex flex-wrap gap-2">
              {[{ id: "all", name: "All" }, ...client.audiences].map((a) => (
                <button
                  key={a.id}
                  onClick={() => setAud(a.id)}
                  aria-pressed={aud === a.id}
                  className={`rounded-full border-2 border-[#111] px-4 py-1.5 text-sm font-semibold transition-colors duration-150 ${aud === a.id ? "bg-[#111] text-[#f7f6f2]" : "hover:bg-[#111]/10"}`}
                >
                  {a.name}
                </button>
              ))}
            </div>
          </div>
          <ul className="mt-6 grid gap-3" aria-live="polite">
            {shown.map((r) => (
              <li key={r.id} className="anim-fade-in grid gap-2 rounded-2xl border-2 border-[#111] p-5 sm:grid-cols-[1fr_auto]">
                <div>
                  <h3 className={`${display} text-xl font-bold`}>{r.title}</h3>
                  <p className="text-sm text-[#111]/75">{r.rationale}</p>
                  <p className="mt-2 text-xs font-medium">
                    From: {obsById(r.observationId)!.title}{r.audienceId && ` → ${audById(r.audienceId)!.name}`} · Next: {r.nextStep}
                  </p>
                </div>
                <div className="flex gap-2 text-xs font-bold sm:flex-col sm:items-end">
                  <span className="rounded-full px-3 py-1 text-white" style={{ backgroundColor: r.priority === "High" ? accent : "#111" }}>{r.priority}</span>
                  <span className="rounded-full border border-[#111] px-3 py-1">{r.status}</span>
                </div>
              </li>
            ))}
            {shown.length === 0 && <li className="text-sm">No recommendations for this audience yet.</li>}
          </ul>
        </section>

        <section className="mt-20 grid gap-6 md:grid-cols-2">
          <div>
            <p className="text-xs font-semibold tracking-widest uppercase">{client.session.date}</p>
            <h2 className={`${display} text-3xl font-bold`}>{client.session.title}</h2>
            <p className="mt-3 text-sm leading-relaxed">{client.session.notes}</p>
            <ul className="mt-4 flex flex-wrap gap-2 text-xs font-semibold">
              {client.session.followUps.map((f) => <li key={f} className="rounded-full bg-[#111]/10 px-3 py-1">{f}</li>)}
            </ul>
          </div>
          <div className="rounded-2xl p-6 text-[#111]" style={{ backgroundColor: accent }}>
            <div className="flex items-center justify-between">
              <h2 className={`${display} text-3xl font-extrabold`}>Action plan</h2>
              <span className="rounded-full bg-[#111] px-3 py-1 text-xs font-bold text-[#f7f6f2]">{client.actionPlan.status}</span>
            </div>
            <ol className="mt-4 space-y-2 font-semibold">
              {client.actionPlan.items.map((it, i) => <li key={it}>{i + 1}. {it}</li>)}
            </ol>
          </div>
        </section>
      </main>
    </div>
  );
}
