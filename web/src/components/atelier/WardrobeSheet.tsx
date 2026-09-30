"use client";
import { useState } from "react";
import Link from "next/link";
import { categories, itemById, looksWith, nearestPaletteColour, wardrobe, wornWith, type Category, type WardrobeItem } from "@/lib/atelier";
import { client } from "@/lib/fixture";
import { Garment } from "./Garment";
import { Label, Marker, TextLink } from "./primitives";
import { ButtonLink, Filter } from "./ui/controls";
import { Drawer } from "./ui/Overlay";

export function WardrobeSheet({ initialItem }: { initialItem?: string }) {
  const [cat, setCat] = useState<"All" | Category>("All");
  // A piece can be opened from a link (/wardrobe?item=…), for instance from a look. Kept after closing so the drawer
  // never empties mid-slide.
  const [item, setItem] = useState<WardrobeItem | null>(() => (initialItem ? itemById(initialItem) ?? null : null));
  const [open, setOpen] = useState(() => !!(initialItem && itemById(initialItem)));

  const shown = wardrobe.filter((w) => cat === "All" || w.category === cat).length;
  const count = (c: "All" | Category) => (c === "All" ? wardrobe.length : wardrobe.filter((w) => w.category === c).length);

  return (
    <>
      <header className="grid grid-cols-12 items-end gap-x-6 gap-y-6">
        <div className="col-span-12 sm:col-span-9">
          <Label className="rise">Marisol Vega Ortiz</Label>
          <h1 className="display-l rise mt-4 uppercase" style={{ ["--d" as string]: "60ms" }}>Your <span className="italic-serif normal-case">wardrobe</span></h1>
        </div>
        <p className="rise col-span-12 sm:col-span-3 sm:text-right" style={{ ["--d" as string]: "160ms" }} aria-live="polite">
          <span className="numeral text-5xl leading-none">{shown}</span>
          <span className="label tone-muted ml-2">{shown === 1 ? "piece" : "pieces"}</span>
        </p>
      </header>

      <div className="mt-14 border-t border-ink/15 pt-4">
        <Filter
          label="Filter the wardrobe" value={cat} onChange={setCat}
          items={categories.map((c) => ({ id: c, label: c, count: count(c) }))}
        />
      </div>

      {/* The contact sheet: composed on desktop, staggered pairs on small screens. */}
      <ul className="mt-12 grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-12 lg:gap-x-6 lg:gap-y-0">
        {wardrobe.map((w, i) => {
          const on = cat === "All" || w.category === cat;
          return (
            <li
              key={w.id}
              className={`list-none transition-opacity duration-[var(--dur-ui)] lg:[grid-column:var(--gc)] lg:[grid-row:var(--gr)] lg:mt-[var(--mt)] lg:mb-10 ${i % 2 ? "mt-8 lg:mt-[var(--mt)]" : ""} ${on ? "" : "opacity-[0.14]"}`}
              style={{ ["--gc" as string]: `${w.layout.col} / span ${w.layout.span}`, ["--gr" as string]: w.layout.row, ["--mt" as string]: `${w.layout.mt}rem` }}
            >
              <button
                onClick={() => { setItem(w); setOpen(true); }}
                disabled={!on}
                data-cursor="View"
                className="group block w-full text-left disabled:cursor-default"
                aria-label={`${w.name}, ${w.colorName}. Open details`}
              >
                <div className="frame bg-paper" style={{ aspectRatio: w.layout.ratio }}>
                  <div className="frame-inner flex h-full items-center justify-center p-[12%]">
                    <div
                      className="h-full w-full transition-transform duration-[var(--dur-ui)] ease-out group-hover:rotate-[1.5deg] group-focus-visible:rotate-[1.5deg]"
                      style={{ transform: w.layout.tilt ? `rotate(${w.layout.tilt}deg)` : undefined }}
                    >
                      <Garment kind={w.kind} color={w.color} className="h-full w-full" />
                    </div>
                  </div>
                </div>
                <div className="mt-3 flex items-baseline justify-between gap-3">
                  <span className="text-sm">{w.name}</span>
                  <span className="numeral tone-muted text-sm" aria-hidden>{String(i + 1).padStart(2, "0")}</span>
                </div>
                <p className="meta flex flex-wrap items-center gap-x-3 transition-opacity duration-[var(--dur-feedback)] lg:opacity-0 lg:group-hover:opacity-100 lg:group-focus-visible:opacity-100">
                  <span>{w.colorName} · {w.worn}</span>
                  {looksWith(w.id).length > 0 && <span className="whitespace-nowrap">In {looksWith(w.id).length} {looksWith(w.id).length === 1 ? "look" : "looks"}</span>}
                  {!w.inPalette && w.slot !== "watch" && <span className="label tone-accent">Outside palette</span>}
                </p>
              </button>
            </li>
          );
        })}
      </ul>

      <Marker n="03" label="Looks" className="mt-24" />
      <div className="mt-8 flex flex-wrap items-baseline justify-between gap-4">
        <p className="statement max-w-[18ch]">Spring / Summer 2026</p>
        <TextLink href="/looks">Compose a look</TextLink>
      </div>

      <Drawer open={open} onClose={() => setOpen(false)} label={item ? item.name : "Piece details"}>
        {item && (
          <div className="flex h-full flex-col overflow-auto">
            <div className="flex items-center justify-between px-6 py-4">
              <Label>{item.category} · {item.season}</Label>
              <button onClick={() => setOpen(false)} className="label tone-muted tap -mr-2 px-2 hover:text-ink"><span className="travel pb-0.5">Close</span></button>
            </div>
            <div className="mx-6 bg-paper p-10" key={item.id}>
              <Garment kind={item.kind} color={item.color} label={`${item.name}, ${item.colorName}`} className="mx-auto h-72 w-full" />
            </div>
            <DrawerColour item={item} />
            <div className="px-6 pb-8 pt-6">
              <h2 className="display-m" style={{ fontSize: "clamp(2rem, 4vw, 2.75rem)" }}>{item.name}</h2>
              <Label className="mt-6">Consultant note</Label>
              <p className="statement mt-2 !text-[1.6rem]">{item.note}</p>
              <dl className="mt-6 grid grid-cols-2 gap-y-4 border-t border-ink/15 pt-5 text-sm">
                <div><dt className="label tone-muted">Structure</dt><dd className="mt-1 capitalize">{item.structure}</dd></div>
                <div><dt className="label tone-muted">Worn</dt><dd className="mt-1">{item.worn.replace(/^Worn /, "")}</dd></div>
              </dl>
              <DrawerRelations item={item} onNavigate={() => setOpen(false)} />
              <div className="mt-8"><ButtonLink href={`/looks?add=${item.id}`}>Compose with this piece →</ButtonLink></div>
            </div>
          </div>
        )}
      </Drawer>
    </>
  );
}

/* The actual colour, as a flat chip. The illustration is shaded, so its tone drifts; the chip is the fabric's
   own colour, and the palette colour it sits closest to says how it works with her. */
function DrawerColour({ item }: { item: WardrobeItem }) {
  const near = nearestPaletteColour(item.color);
  return (
    <div className="mx-6 mt-4 flex items-center gap-4">
      <span className="h-10 w-16 shrink-0 border border-ink/15" style={{ background: item.color }} aria-hidden />
      <div className="min-w-0">
        <p className="label tone-ink">{item.colorName}</p>
        {item.inPalette && <p className="meta mt-0.5">Nearest in her palette: {near.name}, {near.role.toLowerCase()}</p>}
        {!item.inPalette && item.slot !== "watch" && <p className="meta tone-accent mt-0.5">Outside her palette. Nearest: {near.name}</p>}
      </div>
    </div>
  );
}

/* How this piece meets the rest of the studio: the looks it is worn in, what it is worn with, and the advice it
   belongs to. Everything here is derived from the looks and the fixture's own links, never typed twice. */
function DrawerRelations({ item, onNavigate }: { item: WardrobeItem; onNavigate: () => void }) {
  const inLooks = looksWith(item.id);
  const withPieces = wornWith(item.id);
  const rec = item.rec ? client.recommendations.find((r) => r.id === item.rec) : undefined;
  const obs = item.obs ? client.observations.find((o) => o.id === item.obs) : undefined;
  return (
    <div className="mt-8 space-y-8 border-t border-ink/15 pt-6">
      <div>
        <Label>Worn in</Label>
        {inLooks.length === 0 ? (
          <p className="meta mt-2">Not in any look yet.</p>
        ) : (
          <ul className="mt-2">
            {inLooks.map((l) => (
              <li key={l.id} className="list-none border-t border-ink/15 first:border-t-0">
                <Link href={`/looks?look=${l.id}`} className="group focus-inset flex items-baseline justify-between gap-4 py-3">
                  <span className="min-w-0">
                    <span className="headline block !text-[1.3rem]"><span className="travel">{l.title}</span></span>
                    <span className="meta block">{l.occasion}</span>
                  </span>
                  <span aria-hidden className="transition-transform duration-[var(--dur-ui)] group-hover:translate-x-1">→</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
        {withPieces.length > 0 && <p className="meta mt-3">With {withPieces.map((p) => p.name.toLowerCase()).join(", ")}.</p>}
      </div>
      {(rec || obs) && (
        <div>
          <Label>{rec ? "Part of the advice" : "What I noticed"}</Label>
          {rec && (
            <p className="mt-2">
              <Link href={`/clients/marisol#rec-${rec.id}`} onClick={onNavigate} className="group tap block">
                <span className="statement block !text-[1.35rem]"><span className="travel">{rec.title}</span></span>
              </Link>
            </p>
          )}
          {obs && (
            <p className="mt-2">
              <Link href={`/clients/marisol#observation-${obs.id}`} onClick={onNavigate} className="group tap block">
                <span className="statement block !text-[1.35rem]"><span className="travel">{obs.title}</span></span>
              </Link>
            </p>
          )}
        </div>
      )}
    </div>
  );
}
