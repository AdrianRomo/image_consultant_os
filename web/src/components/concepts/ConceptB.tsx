"use client";
import { useEffect, useRef, useState } from "react";
import { client, audById, obsById } from "@/lib/fixture";
import { Portrait } from "./Portrait";

// Concept B — quiet luxury: cream, stone, charcoal, muted burgundy; structured grid; precise drawer.
export function ConceptB() {
  const [openId, setOpenId] = useState<string | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const rec = client.recommendations.find((r) => r.id === openId);
  const serif = "font-[family-name:var(--font-cormorant)]";

  useEffect(() => {
    if (openId) closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpenId(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openId]);

  const close = () => {
    setOpenId(null);
    opener.current?.focus();
  };

  return (
    <div className="min-h-screen bg-[#f6f1e8] text-[#2b2a28]">
      <header className="border-b border-[#d8d0c2] bg-[#f6f1e8]/90 px-6 py-5">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <span className={`${serif} text-xl tracking-wide`}>Image Consultant OS</span>
          <span className="text-xs tracking-[0.2em] text-[#6b6a66] uppercase">{client.engagement}</span>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-8 px-6 py-10 lg:grid-cols-[320px_1fr]">
        <aside className="space-y-6">
          <div className="aspect-[4/5] overflow-hidden rounded-md border border-[#d8d0c2] bg-[#e7dfd0]">
            <Portrait bg="#e3dccd" tone="#c4a88e" ink="#3a3836" className="h-full w-full" />
          </div>
          <div>
            <h1 className={`${serif} text-4xl leading-tight`}>{client.name}</h1>
            <p className="mt-1 text-sm text-[#6b6a66]">{client.role}</p>
            <p className="text-sm text-[#6b6a66]">{client.location}</p>
          </div>
          <div className="rounded-md bg-[#ebe4d6] p-5">
            <p className="text-[11px] tracking-[0.2em] text-[#7a2e3a] uppercase">Desired perception</p>
            <p className={`${serif} mt-2 text-xl leading-snug`}>{client.desiredPerception}</p>
          </div>
        </aside>

        <div className="space-y-10">
          <section aria-labelledby="aud">
            <h2 id="aud" className={`${serif} border-b border-[#d8d0c2] pb-2 text-2xl`}>Audiences</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {client.audiences.map((a) => (
                <div key={a.id} className="rounded-md border border-[#d8d0c2] p-4">
                  <h3 className="font-medium">{a.name}</h3>
                  <p className="mt-1 text-sm text-[#5b5a56]">{a.note}</p>
                </div>
              ))}
            </div>
          </section>

          <section aria-labelledby="ass">
            <h2 id="ass" className={`${serif} border-b border-[#d8d0c2] pb-2 text-2xl`}>Assessment</h2>
            <dl className="mt-2 divide-y divide-[#e2dacc]">
              {client.observations.map((o) => (
                <div key={o.id} className="grid gap-1 py-3 sm:grid-cols-[110px_1fr]">
                  <dt className="text-[11px] tracking-[0.2em] text-[#7a2e3a] uppercase">{o.area}</dt>
                  <dd>
                    <span className="font-medium">{o.title}.</span>{" "}
                    <span className="text-sm text-[#5b5a56]">{o.detail}</span>
                  </dd>
                </div>
              ))}
            </dl>
          </section>

          <section aria-labelledby="rec">
            <h2 id="rec" className={`${serif} border-b border-[#d8d0c2] pb-2 text-2xl`}>Recommendations</h2>
            <ul className="mt-2 divide-y divide-[#e2dacc]">
              {client.recommendations.map((r) => (
                <li key={r.id}>
                  <button
                    onClick={(e) => {
                      opener.current = e.currentTarget;
                      setOpenId(r.id);
                    }}
                    className="flex w-full items-center justify-between gap-4 py-4 text-left transition-colors duration-150 hover:bg-[#efe8da]"
                  >
                    <span>
                      <span className="block font-medium">{r.title}</span>
                      <span className="text-sm text-[#6b6a66]">{r.priority} priority · {r.status}</span>
                    </span>
                    <span aria-hidden className="text-[#7a2e3a]">›</span>
                  </button>
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="ses" className="grid gap-6 sm:grid-cols-2">
            <div>
              <h2 id="ses" className={`${serif} border-b border-[#d8d0c2] pb-2 text-2xl`}>Session</h2>
              <p className="mt-3 text-[11px] tracking-[0.2em] text-[#7a2e3a] uppercase">{client.session.date}</p>
              <h3 className="font-medium">{client.session.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#5b5a56]">{client.session.notes}</p>
              <ul className="mt-3 list-disc pl-5 text-sm">
                {client.session.followUps.map((f) => <li key={f}>{f}</li>)}
              </ul>
            </div>
            <div className="rounded-md bg-[#2f2d2b] p-6 text-[#f1ebe0]">
              <div className="flex items-baseline justify-between">
                <h2 className={`${serif} text-2xl`}>Action plan</h2>
                <span className="rounded-full border border-[#d9a2ab] px-3 py-0.5 text-[11px] tracking-widest text-[#d9a2ab] uppercase">
                  {client.actionPlan.status}
                </span>
              </div>
              <ul className="mt-4 space-y-3 text-sm">
                {client.actionPlan.items.map((it) => <li key={it} className="border-t border-white/20 pt-3">{it}</li>)}
              </ul>
            </div>
          </section>
        </div>
      </main>

      {rec && (
        <div className="fixed inset-0 z-20" role="dialog" aria-modal="true" aria-label={rec.title}>
          <div onClick={close} className="anim-fade-in absolute inset-0 bg-[#2b2a28]/40" />
          <aside className="drawer absolute top-0 right-0 flex h-full w-full max-w-md flex-col gap-4 overflow-y-auto bg-[#f6f1e8] p-8 shadow-xl">
            <button ref={closeRef} onClick={close} className="self-end text-sm text-[#6b6a66] underline underline-offset-4">Close</button>
            <p className="text-[11px] tracking-[0.2em] text-[#7a2e3a] uppercase">{rec.priority} priority · {rec.status}</p>
            <h2 className={`${serif} text-3xl leading-tight`}>{rec.title}</h2>
            <p className="text-sm leading-relaxed">{rec.rationale}</p>
            <div className="border-t border-[#d8d0c2] pt-3 text-sm">
              <p className="text-[11px] tracking-[0.2em] text-[#6b6a66] uppercase">Based on observation</p>
              <p>{obsById(rec.observationId)!.title}</p>
            </div>
            {rec.audienceId && (
              <div className="border-t border-[#d8d0c2] pt-3 text-sm">
                <p className="text-[11px] tracking-[0.2em] text-[#6b6a66] uppercase">For audience</p>
                <p>{audById(rec.audienceId)!.name}</p>
              </div>
            )}
            <div className="border-t border-[#d8d0c2] pt-3 text-sm">
              <p className="text-[11px] tracking-[0.2em] text-[#6b6a66] uppercase">Next step</p>
              <p>{rec.nextStep}</p>
            </div>
          </aside>
          <style>{`
            @keyframes drawer-in { from { transform: translateX(32px); opacity: 0 } to { transform: none; opacity: 1 } }
            .drawer { animation: drawer-in var(--dur-panel) var(--ease-out) both }
            @media (prefers-reduced-motion: reduce) { .drawer { animation: fade-in var(--dur-feedback) linear both } }
          `}</style>
        </div>
      )}
    </div>
  );
}
