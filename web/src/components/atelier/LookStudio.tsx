"use client";
import { useMemo, useState } from "react";
import { consultations, itemById, looks, readLook, slots, wardrobe, type Slot } from "@/lib/atelier";
import { Garment } from "./Garment";
import { Label, Reveal } from "./primitives";

type Items = Partial<Record<Slot, string>>;

// Where each slot settles on the canvas, as % of the frame. Overlap is deliberate: it reads as a flat-lay.
const place: Record<Slot, { l: number; t: number; w: number; z: number; r: number }> = {
  bottom: { l: 24, t: 40, w: 36, z: 1, r: 0 },
  top: { l: 46, t: 8, w: 40, z: 2, r: 1.5 },
  outer: { l: 3, t: 3, w: 52, z: 3, r: -1 },
  shoes: { l: 56, t: 70, w: 38, z: 4, r: 1 },
  bag: { l: 3, t: 64, w: 24, z: 4, r: -2 },
  watch: { l: 76, t: 44, w: 16, z: 4, r: 2 },
};

const match = (text: string) => {
  const t = text.toLowerCase();
  if (/board|dinner/.test(t)) return "board";
  if (/team|restructur|regional|present/.test(t)) return "team";
  if (/camera|investor|call|video/.test(t)) return "camera";
  return null;
};

export function LookStudio({ initialAsk, initialLook, initialAdd }: { initialAsk?: string; initialLook?: string; initialAdd?: string }) {
  const startConsult = consultations.find((c) => c.id === initialAsk) ?? null;
  const startLook = looks.find((l) => l.id === initialLook) ?? looks[0];
  const [items, setItems] = useState<Items>(() => {
    const base: Items = startConsult ? { ...startConsult.items } : { ...startLook.items };
    const add = initialAdd ? itemById(initialAdd) : undefined;
    if (add) base[add.slot] = add.id;
    return base;
  });
  const [consult, setConsult] = useState(startConsult);
  const [refine, setRefine] = useState<string | null>(null);
  const [prompt, setPrompt] = useState(startConsult?.prompt ?? "");
  const [miss, setMiss] = useState(false);
  const [slot, setSlot] = useState<Slot>("outer");
  const title = consult ? consult.prompt : startLook.title;

  const reading = useMemo(() => readLook(items), [items]);
  const refinement = consult?.refinements.find((r) => r.id === refine);
  const chosen = Object.values(items).map((id) => itemById(id!)!).filter(Boolean);

  const ask = (id: string | null) => {
    setRefine(null);
    if (!id) { setMiss(true); return; }
    setMiss(false);
    const c = consultations.find((x) => x.id === id)!;
    setConsult(c);
    setPrompt(c.prompt);
    setItems({ ...c.items });
  };
  const choose = (id: string) => {
    const it = itemById(id)!;
    setRefine(null);
    setConsult(null);
    setItems((cur) => {
      const next = { ...cur };
      if (next[it.slot] === id) delete next[it.slot];
      else next[it.slot] = id;
      return next;
    });
  };
  const applyRefinement = (r: NonNullable<typeof consult>["refinements"][number]) => {
    setRefine(r.id);
    setItems({ ...consult!.items, ...r.swap });
  };

  return (
    <>
      <header className="grid grid-cols-12 gap-x-6 gap-y-4">
        <div className="col-span-12 lg:col-span-9">
          <Label className="rise">Marisol Vega Ortiz</Label>
          <h1 className="display-l rise mt-4" style={{ ["--d" as string]: "100ms" }}>
            <span className="uppercase">Compose</span> <span className="italic-serif">a look</span>
          </h1>
        </div>
      </header>

      <div className="mt-14 grid grid-cols-12 gap-x-6 gap-y-14">
        {/* ------------------------------------------------ Canvas */}
        <div className="col-span-12 sm:col-span-9 lg:col-span-6">
          <div className="relative aspect-[4/5] w-full overflow-hidden bg-paper" role="img" aria-label={`Look composition: ${chosen.map((c) => c.name).join(", ") || "empty"}`}>
            {(Object.keys(place) as Slot[]).map((s) => {
              const it = items[s] ? itemById(items[s]!) : undefined;
              if (!it) return null;
              const p = place[s];
              return (
                <div key={s + it.id} className="settle absolute" style={{ left: `${p.l}%`, top: `${p.t}%`, width: `${p.w}%`, zIndex: p.z }}>
                  <div style={{ transform: `rotate(${p.r}deg)` }}><Garment kind={it.kind} color={it.color} className="h-auto w-full" /></div>
                </div>
              );
            })}
            {chosen.length === 0 && <p className="meta absolute inset-0 grid place-items-center">Choose a piece to begin.</p>}
            <p className="label absolute bottom-3 left-4 text-warm">{title}</p>
          </div>
        </div>

        {/* ------------------------------------------------ Consultation */}
        <div className="col-span-12 lg:col-span-5 lg:col-start-8">
          <Label>Ask your consultant</Label>
          <form onSubmit={(e) => { e.preventDefault(); ask(match(prompt)); }} className="mt-3">
            <label htmlFor="ask" className="sr-only">What are you dressing for?</label>
            <input
              id="ask"
              value={prompt}
              onChange={(e) => { setPrompt(e.target.value); setMiss(false); }}
              placeholder="What are you dressing for?"
              className="w-full font-[family-name:var(--font-cormorant)] text-[1.5rem] leading-tight border-b border-ink/40 bg-transparent pb-3 outline-none transition-colors placeholder:text-taupe focus:border-ink"
            />
            <div className="mt-4 flex flex-wrap items-baseline gap-x-6 gap-y-1">
              <button type="submit" className="label travel py-2">Explore directions ↗</button>
            </div>
          </form>
          <ul className="mt-4 space-y-0.5">
            {consultations.map((c) => (
              <li key={c.id}>
                <button onClick={() => ask(c.id)} className="group py-1.5 text-left text-sm text-warm hover:text-ink">
                  <span className="travel">{c.prompt}</span> <span aria-hidden>↗</span>
                </button>
              </li>
            ))}
          </ul>
          {miss && <p className="meta mt-3" role="status">I have no direction for that in this preview. Try one of the occasions above.</p>}

          <div className="mt-12 border-t border-ink/15 pt-6" aria-live="polite">
            <Label tone="accent">Consultant notes</Label>
            {consult ? (
              <div key={consult.id + (refine ?? "")} className="rise">
                {consult.notes.map((n) => <p key={n} className="statement mt-3 !text-[clamp(1.5rem,2.4vw,2.1rem)]">{n}</p>)}
                {refinement && <p className="body-copy mt-4">{refinement.note}</p>}
                <div className="mt-6 flex flex-wrap items-baseline gap-x-6">
                  <Label>Refine</Label>
                  {consult.refinements.map((r) => (
                    <button key={r.id} onClick={() => applyRefinement(r)} aria-pressed={refine === r.id} className={`label travel py-2 ${refine === r.id ? "travel-static text-ink" : "text-warm hover:text-ink"}`}>{r.label}</button>
                  ))}
                </div>
              </div>
            ) : reading.notes.length ? (
              <div key={reading.notes.join()} className="rise">
                {reading.notes.map((n) => <p key={n} className="body-copy mt-3 text-[1.02rem]">{n}</p>)}
              </div>
            ) : (
              <p className="meta mt-3">Add a few pieces and I will tell you how they work together.</p>
            )}
          </div>

          {chosen.length > 0 && (
            <div className="mt-8 flex items-center justify-between border-t border-ink/15 pt-5">
              <ul className="flex gap-2" aria-label="Colours in this look">
                {chosen.map((c) => <li key={c.id} className="h-5 w-5 rounded-full border border-ink/15" style={{ background: c.color }} title={c.colorName} />)}
              </ul>
              <p className="meta"><span className="numeral text-lg text-ink">{reading.inPalette}</span> of {reading.total} in her palette</p>
            </div>
          )}
        </div>
      </div>

      {/* ------------------------------------------------ Picker */}
      <section aria-labelledby="pick-h" className="mt-24">
        <Reveal>
          <h2 id="pick-h" className="label text-ink">From the wardrobe</h2>
        </Reveal>
        <div className="mt-4 flex flex-wrap gap-x-7 gap-y-1 border-t border-ink/15 pt-3" role="group" aria-label="Piece type">
          {slots.map((s) => (
            <button key={s.id} onClick={() => setSlot(s.id)} aria-pressed={slot === s.id} className={`label py-2.5 ${slot === s.id ? "text-ink" : "text-warm hover:text-ink"}`}>
              <span className={`travel pb-0.5 ${slot === s.id ? "travel-static" : ""}`}>{s.label}</span>
              {items[s.id] && <span className="ml-2 inline-block h-1.5 w-1.5 rounded-full bg-cordovan align-middle" aria-label="chosen" />}
            </button>
          ))}
        </div>
        <ul className="no-scrollbar mt-6 flex gap-4 overflow-x-auto pb-2 sm:gap-6">
          {wardrobe.filter((w) => w.slot === slot).map((w) => {
            const on = items[w.slot] === w.id;
            return (
              <li key={w.id} className="w-36 shrink-0 sm:w-48">
                <button onClick={() => choose(w.id)} aria-pressed={on} className="group block w-full text-left">
                  <div className={`frame bg-paper p-[12%] transition-[outline-color] duration-300 outline outline-1 outline-offset-4 ${on ? "outline-ink" : "outline-transparent"}`}>
                    <div className="frame-inner"><Garment kind={w.kind} color={w.color} className="aspect-[5/6] h-auto w-full" /></div>
                  </div>
                  <p className="mt-2 text-sm">{w.name}</p>
                  <p className="meta">{on ? "In this look · tap to remove" : w.inPalette ? w.colorName : `${w.colorName} · outside palette`}</p>
                </button>
              </li>
            );
          })}
        </ul>
        <p className="meta mt-10">Consultant notes in this preview are scripted for three occasions. Nothing is generated or saved.</p>
      </section>
    </>
  );
}
