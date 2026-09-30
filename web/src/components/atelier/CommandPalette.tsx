"use client";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { chapters, consultations } from "@/lib/atelier";
import { Sheet } from "./ui/Overlay";

type Command = { id: string; label: string; hint: string; href: string };
const commands: Command[] = [
  { id: "studio", label: "Studio", hint: "Home", href: "/" },
  { id: "marisol", label: "Marisol Vega Ortiz", hint: "Client", href: "/clients/marisol" },
  ...chapters
    .filter((c) => ["presence", "assessment", "opportunities", "evolution"].includes(c.id))
    .map((c) => ({ id: `ch-${c.id}`, label: `Marisol · ${c.sub}`, hint: c.label, href: `/clients/marisol#${c.id}` })),
  { id: "wardrobe", label: "Wardrobe", hint: "Pieces", href: "/wardrobe" },
  { id: "looks", label: "Compose a look", hint: "Looks", href: "/looks" },
  ...consultations.map((c) => ({ id: c.id, label: c.prompt, hint: "Ask", href: `/looks?ask=${c.id}` })),
  { id: "lab", label: "Design lab", hint: "Reference", href: "/design-lab" },
];

export const PALETTE_EVENT = "icos:palette";
export const openPalette = () => window.dispatchEvent(new Event(PALETTE_EVENT));

/* Search and commands. Opens with ⌘K / Ctrl K or from any header's Search. */
export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);

  const results = useMemo(() => {
    const s = q.trim().toLowerCase();
    return s ? commands.filter((c) => (c.label + " " + c.hint).toLowerCase().includes(s)) : commands;
  }, [q]);

  useEffect(() => {
    const show = () => { setQ(""); setActive(0); setOpen(true); };
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => { if (!o) { setQ(""); setActive(0); } return !o; });
      }
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener(PALETTE_EVENT, show);
    return () => { window.removeEventListener("keydown", onKey); window.removeEventListener(PALETTE_EVENT, show); };
  }, []);

  const go = (c?: Command) => {
    if (!c) return;
    setOpen(false);
    router.push(c.href);
  };

  return (
    <Sheet open={open} onClose={() => setOpen(false)} label="Search and commands" className="shadow-[0_24px_60px_-30px_rgba(23,21,18,0.5)]">
      <div className="border-b border-ink/15 px-5 pb-3 pt-4">
        <label className="label tone-muted" htmlFor="cmd-input">Where to?</label>
        <input
          id="cmd-input"
          autoFocus
          value={q}
          onChange={(e) => { setQ(e.target.value); setActive(0); }}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => Math.min(a + 1, results.length - 1)); }
            if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
            if (e.key === "Enter") { e.preventDefault(); go(results[active]); }
          }}
          placeholder="A client, a piece, an occasion"
          className="field-input field-display mt-1"
          role="combobox"
          aria-expanded
          aria-controls="cmd-list"
          aria-activedescendant={results[active] ? `cmd-${results[active].id}` : undefined}
        />
      </div>
      <ul id="cmd-list" role="listbox" aria-label="Results" className="max-h-[50vh] overflow-auto py-2">
        {results.length === 0 && <li className="meta px-5 py-4">Nothing matches. Try “wardrobe” or “board”.</li>}
        {results.map((c, i) => (
          <li key={c.id} id={`cmd-${c.id}`} role="option" aria-selected={i === active}>
            <button
              onClick={() => go(c)}
              onMouseMove={() => setActive(i)}
              tabIndex={-1}
              className={`flex w-full items-baseline justify-between gap-4 px-5 py-3 text-left ${i === active ? "bg-stone/70" : ""}`}
            >
              <span>{c.label}</span>
              <span className="label tone-muted shrink-0">{c.hint}</span>
            </button>
          </li>
        ))}
      </ul>
    </Sheet>
  );
}
