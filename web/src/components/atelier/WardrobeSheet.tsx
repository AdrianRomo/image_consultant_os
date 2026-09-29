"use client";
import Link from "next/link";
import { useRef, useState } from "react";
import { categories, wardrobe, type Category, type WardrobeItem } from "@/lib/atelier";
import { Garment } from "./Garment";
import { Label, Marker, Reveal, TextLink } from "./primitives";

export function WardrobeSheet() {
  const [cat, setCat] = useState<"All" | Category>("All");
  const [open, setOpen] = useState<WardrobeItem | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const lastFocus = useRef<HTMLElement | null>(null);

  const shown = wardrobe.filter((w) => cat === "All" || w.category === cat).length;
  const count = (c: "All" | Category) => (c === "All" ? wardrobe.length : wardrobe.filter((w) => w.category === c).length);

  const show = (w: WardrobeItem, el: HTMLElement) => {
    lastFocus.current = el;
    setOpen(w);
    dialogRef.current?.showModal();
  };
  const hide = () => dialogRef.current?.close();

  return (
    <>
      <header className="grid grid-cols-12 items-end gap-x-6 gap-y-6">
        <div className="col-span-12 sm:col-span-9">
          <Label className="rise">Marisol Vega Ortiz</Label>
          <h1 className="display-l rise mt-4 uppercase" style={{ ["--d" as string]: "100ms" }}>Your <span className="italic-serif normal-case">wardrobe</span></h1>
        </div>
        <p className="rise col-span-12 sm:col-span-3 sm:text-right" style={{ ["--d" as string]: "240ms" }} aria-live="polite">
          <span className="numeral text-5xl leading-none">{shown}</span>
          <span className="label ml-2 text-warm">{shown === 1 ? "piece" : "pieces"}</span>
        </p>
      </header>

      <nav aria-label="Filter the wardrobe" className="rise mt-14 flex flex-wrap gap-x-7 gap-y-1 border-t border-ink/15 pt-4" style={{ ["--d" as string]: "360ms" }}>
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setCat(c)}
            aria-pressed={cat === c}
            className={`label py-2.5 ${cat === c ? "text-ink" : "text-warm hover:text-ink"}`}
          >
            <span className={`travel pb-0.5 ${cat === c ? "travel-static" : ""}`}>{c}</span>
            <span className="numeral ml-1.5 text-sm normal-case tracking-normal opacity-60">{count(c)}</span>
          </button>
        ))}
      </nav>

      {/* The contact sheet: composed on desktop, staggered pairs on small screens. */}
      <ul className="mt-12 grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-12 lg:gap-x-6 lg:gap-y-0">
        {wardrobe.map((w, i) => {
          const on = cat === "All" || w.category === cat;
          return (
            <Reveal
              as="li"
              key={w.id}
              delay={(i % 4) * 90}
              className={`list-none transition-opacity duration-500 lg:[grid-column:var(--gc)] lg:[grid-row:var(--gr)] lg:mt-[var(--mt)] lg:mb-10 ${i % 2 ? "mt-8 lg:mt-[var(--mt)]" : ""} ${on ? "" : "opacity-[0.14]"}`}
              style={{ ["--gc" as string]: `${w.layout.col} / span ${w.layout.span}`, ["--gr" as string]: w.layout.row, ["--mt" as string]: `${w.layout.mt}rem` }}
            >
              <button
                onClick={(e) => show(w, e.currentTarget)}
                disabled={!on}
                data-cursor="View"
                className="group block w-full text-left disabled:cursor-default"
                aria-label={`${w.name}, ${w.colorName}. Open details`}
              >
                <div className="frame bg-paper" style={{ aspectRatio: w.layout.ratio }}>
                  <div className="frame-inner flex h-full items-center justify-center p-[12%]">
                    <div
                      className="h-full w-full transition-transform duration-700 ease-out group-hover:rotate-[1.5deg] group-focus-visible:rotate-[1.5deg]"
                      style={{ transform: w.layout.tilt ? `rotate(${w.layout.tilt}deg)` : undefined }}
                    >
                      <Garment kind={w.kind} color={w.color} className="h-full w-full" />
                    </div>
                  </div>
                </div>
                <div className="mt-3 flex items-baseline justify-between gap-3">
                  <span className="text-sm">{w.name}</span>
                  <span className="numeral text-sm text-warm">{String(i + 1).padStart(2, "0")}</span>
                </div>
                <p className="meta flex flex-wrap items-center gap-x-3 transition-opacity duration-300 lg:opacity-0 lg:group-hover:opacity-100 lg:group-focus-visible:opacity-100">
                  <span>{w.colorName} · {w.worn}</span>
                  {!w.inPalette && w.slot !== "watch" && <span className="label text-cordovan">Outside palette</span>}
                </p>
              </button>
            </Reveal>
          );
        })}
      </ul>

      <Marker n="03" label="Looks" className="mt-24" />
      <div className="mt-8 flex flex-wrap items-baseline justify-between gap-4">
        <p className="statement max-w-[18ch]">Spring / Summer 2026</p>
        <TextLink href="/looks">Compose a look</TextLink>
      </div>

      <dialog
        ref={dialogRef}
        onClose={() => { setOpen(null); lastFocus.current?.focus(); }}
        onClick={(e) => { if (e.target === dialogRef.current) hide(); }}
        aria-label={open ? open.name : "Piece details"}
        className="m-0 ml-auto h-dvh max-h-none w-[min(30rem,100vw)] max-w-none border-l border-ink/15 bg-ivory p-0 text-ink"
      >
        {open && (
          <div className="flex h-full flex-col overflow-auto">
            <div className="flex items-center justify-between px-6 py-4">
              <Label>{open.category} · {open.season}</Label>
              <button onClick={hide} className="label py-2 text-warm hover:text-ink"><span className="travel pb-0.5">Close</span></button>
            </div>
            <div className="settle mx-6 bg-paper p-10" key={open.id}>
              <Garment kind={open.kind} color={open.color} label={`${open.name}, ${open.colorName}`} className="mx-auto h-72 w-full" />
            </div>
            <div className="px-6 pb-8 pt-8">
              <h2 className="display-m">{open.name}</h2>
              <p className="mt-4 flex items-center gap-3 text-sm">
                <span className="inline-block h-4 w-4 rounded-full border border-ink/20" style={{ background: open.color }} aria-hidden />
                {open.colorName} · {open.worn}
              </p>
              <Label className="mt-8">Consultant note</Label>
              <p className="statement mt-2 !text-[1.6rem]">{open.note}</p>
              <dl className="mt-8 grid grid-cols-2 gap-y-4 border-t border-ink/15 pt-5 text-sm">
                <div><dt className="label text-warm">Structure</dt><dd className="mt-1 capitalize">{open.structure}</dd></div>
                <div>
                  <dt className="label text-warm">Palette</dt>
                  <dd className={`mt-1 ${open.inPalette ? "" : "text-cordovan"}`}>{open.inPalette ? "Within her palette" : "Outside her palette"}</dd>
                </div>
              </dl>
              <div className="mt-8"><Link href={`/looks?add=${open.id}`} className="btn label">Compose with this piece →</Link></div>
            </div>
          </div>
        )}
      </dialog>
    </>
  );
}
