"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { consultations } from "@/lib/atelier";

export const sections = [
  { href: "/", n: "00", label: "Studio", match: (p: string) => p === "/" },
  { href: "/clients/marisol", n: "01", label: "Clients", match: (p: string) => p.startsWith("/clients") },
  { href: "/wardrobe", n: "02", label: "Wardrobe", match: (p: string) => p.startsWith("/wardrobe") },
  { href: "/looks", n: "03", label: "Looks", match: (p: string) => p.startsWith("/looks") },
];

type Command = { id: string; label: string; hint: string; href: string };
const commands: Command[] = [
  { id: "studio", label: "Studio", hint: "Home", href: "/" },
  { id: "marisol", label: "Marisol Vega Ortiz", hint: "Client story", href: "/clients/marisol" },
  { id: "wardrobe", label: "Wardrobe", hint: "Contact sheet", href: "/wardrobe" },
  { id: "looks", label: "Compose a look", hint: "Looks", href: "/looks" },
  ...consultations.map((c) => ({ id: c.id, label: c.prompt, hint: "Ask your consultant", href: `/looks?ask=${c.id}` })),
  { id: "concepts", label: "Design concepts", hint: "Phase 1 exploration", href: "/concepts" },
];

export function SiteNav() {
  const pathname = usePathname();
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);

  const results = useMemo(() => {
    const s = q.trim().toLowerCase();
    return s ? commands.filter((c) => (c.label + " " + c.hint).toLowerCase().includes(s)) : commands;
  }, [q]);

  const open = () => {
    setQ("");
    setActive(0);
    dialogRef.current?.showModal();
    requestAnimationFrame(() => inputRef.current?.focus());
  };
  const close = () => dialogRef.current?.close();
  const go = (c?: Command) => {
    if (!c) return;
    close();
    router.push(c.href);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (dialogRef.current?.open) close();
        else open();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const inConcepts = pathname.startsWith("/concepts");
  if (inConcepts) return null;

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-40 mix-blend-normal">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between px-[var(--gutter)] py-4 backdrop-blur-[6px]" style={{ background: "linear-gradient(var(--ivory) 30%, transparent)" }}>
          <Link href="/" className="label text-ink" aria-label="Image Consultant OS — Studio">
            Image Consultant <span className="numeral text-base normal-case tracking-normal">OS</span>
          </Link>
          <nav aria-label="Primary" className="flex items-center gap-5 sm:gap-8">
            {sections.map((s) => {
              const current = s.match(pathname);
              return (
                <Link
                  key={s.href}
                  href={s.href}
                  aria-current={current ? "page" : undefined}
                  className={`label group hidden py-2 sm:inline-block ${current ? "text-ink" : "text-warm hover:text-ink"}`}
                >
                  <span className="numeral mr-1.5 text-sm normal-case tracking-normal opacity-60">{s.n}</span>
                  <span className={`travel pb-0.5 ${current ? "travel-static" : ""}`}>{s.label}</span>
                </Link>
              );
            })}
            <button onClick={open} className="label flex items-center gap-2 py-2 text-warm hover:text-ink" aria-label="Open search and commands">
              <span className="travel pb-0.5">Search</span>
              <kbd className="hidden rounded-[2px] border border-ink/25 px-1.5 py-0.5 text-[10px] tracking-normal sm:inline">⌘K</kbd>
            </button>
          </nav>
        </div>
        {/* mobile: bottom-of-header secondary row */}
        <nav aria-label="Primary mobile" className="flex justify-between gap-2 px-[var(--gutter)] pb-2 sm:hidden">
          {sections.map((s) => {
            const current = s.match(pathname);
            return (
              <Link key={s.href} href={s.href} aria-current={current ? "page" : undefined}
                className={`label py-2 ${current ? "text-ink" : "text-warm"}`}>
                <span className={`pb-0.5 ${current ? "border-b border-ink" : ""}`}>{s.label}</span>
              </Link>
            );
          })}
        </nav>
      </header>

      <dialog
        ref={dialogRef}
        aria-label="Search and commands"
        onClick={(e) => { if (e.target === dialogRef.current) close(); }}
        className="m-0 mx-auto mt-[12vh] w-[min(36rem,calc(100vw-2rem))] rounded-[4px] border border-ink/20 bg-ivory p-0 text-ink shadow-[0_24px_60px_-30px_rgba(23,21,18,0.5)]"
      >
        <div className="border-b border-ink/15 px-5 py-4">
          <label className="label text-warm" htmlFor="cmd-input">Where to?</label>
          <input
            id="cmd-input"
            ref={inputRef}
            value={q}
            onChange={(e) => { setQ(e.target.value); setActive(0); }}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => Math.min(a + 1, results.length - 1)); }
              if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
              if (e.key === "Enter") { e.preventDefault(); go(results[active]); }
            }}
            placeholder="A client, a piece, an occasion"
            className="headline mt-1 w-full bg-transparent outline-none placeholder:text-taupe"
            role="combobox"
            aria-expanded
            aria-controls="cmd-list"
            aria-activedescendant={results[active] ? `cmd-${results[active].id}` : undefined}
          />
        </div>
        <ul id="cmd-list" role="listbox" className="max-h-[50vh] overflow-auto py-2">
          {results.length === 0 && <li className="meta px-5 py-4">Nothing matches. Try “wardrobe” or “board”.</li>}
          {results.map((c, i) => (
            <li key={c.id} id={`cmd-${c.id}`} role="option" aria-selected={i === active}>
              <button
                onClick={() => go(c)}
                onMouseMove={() => setActive(i)}
                className={`flex w-full items-baseline justify-between gap-4 px-5 py-3 text-left ${i === active ? "bg-stone/70" : ""}`}
              >
                <span>{c.label}</span>
                <span className="label text-warm">{c.hint}</span>
              </button>
            </li>
          ))}
        </ul>
      </dialog>
    </>
  );
}
