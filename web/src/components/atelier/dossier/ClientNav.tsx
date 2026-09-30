"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { chapters } from "@/lib/atelier";
import { openPalette } from "../CommandPalette";
import { useScrolled } from "../SiteNav";

/** Which chapter is under the reading line. */
export function useActiveChapter() {
  const [active, setActive] = useState<string>(chapters[0].id);
  useEffect(() => {
    const els = chapters.map((c) => document.getElementById(c.id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: "-45% 0px -50% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
  return active;
}

/* Inside a client, the client is the context. The software shell steps aside:
   one way back, the client's name, a chapter picker on small screens, and search. */
export function ClientNav({ name, engagement }: { name: string; engagement: string }) {
  const active = useActiveChapter();
  const scrolled = useScrolled();
  const current = chapters.find((c) => c.id === active) ?? chapters[0];

  const jump = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ block: "start" });
    history.replaceState(null, "", `#${id}`);
  };

  return (
    <>
      <header
        data-scrolled={scrolled}
        style={{ viewTransitionName: "site-header" }}
        className="fixed inset-x-0 top-0 z-40 border-b border-transparent bg-ivory transition-[border-color] duration-[var(--dur-ui)] data-[scrolled=true]:border-ink/15"
      >
        <div className="mx-auto flex h-[var(--header-h)] max-w-[1600px] items-center justify-between gap-6 px-[var(--gutter)]">
          <Link href="/" transitionTypes={["nav-back"]} className="label tone-ink tap group flex shrink-0 items-center gap-2 whitespace-nowrap">
            <span aria-hidden className="transition-transform duration-[var(--dur-ui)] group-hover:-translate-x-1">←</span>
            <span className="travel pb-0.5">Studio</span>
          </Link>

          <p className="label tone-muted hidden min-w-0 flex-1 truncate sm:block">
            <span className="tone-ink">{name}</span>
            <span className="hidden lg:inline"><span className="mx-3 opacity-40" aria-hidden>/</span>{engagement}</span>
          </p>

          <div className="flex shrink-0 items-center gap-6">
            <label className="lg:hidden">
              <span className="sr-only">Jump to chapter</span>
              <select className="select-quiet" value={current.id} onChange={(e) => jump(e.target.value)}>
                {chapters.map((c) => <option key={c.id} value={c.id}>{c.n} · {c.label}</option>)}
              </select>
            </label>
            <button onClick={openPalette} className="label tone-muted hit tap relative inline-flex items-center py-2 hover:text-ink" aria-label="Open search and commands">
              <span className="travel pb-0.5">Search</span>
            </button>
          </div>
        </div>
      </header>

      {/* Chapter rail: numerals only, so it never touches the page. The name appears on hover or focus. */}
      <nav aria-label="Chapters" className="fixed right-2 top-1/2 z-30 hidden -translate-y-1/2 lg:block">
        <ol>
          {chapters.map((c) => {
            const on = c.id === active;
            return (
              <li key={c.id}>
                <a
                  href={`#${c.id}`} aria-current={on ? "step" : undefined} aria-label={`${c.n} ${c.label}, ${c.sub}`}
                  className={`group relative flex h-7 w-7 items-center justify-center [@media(pointer:coarse)]:h-11 [@media(pointer:coarse)]:w-11 ${on ? "tone-ink" : "tone-muted hover:text-ink"}`}
                >
                  <span
                    className="label pointer-events-none absolute right-full mr-1 whitespace-nowrap bg-ivory px-2 py-1 opacity-0 transition-opacity duration-[var(--dur-feedback)] group-hover:opacity-100 group-focus-visible:opacity-100"
                    aria-hidden
                  >
                    {c.label}<span className="tone-muted ml-2 font-normal normal-case tracking-normal">{c.sub}</span>
                  </span>
                  <span className={`numeral text-sm ${on ? "font-medium" : ""}`}>{c.n}</span>
                  <span aria-hidden className={`absolute -left-0.5 h-px bg-ink transition-all duration-[var(--dur-ui)] ${on ? "w-2 opacity-100" : "w-0 opacity-0"}`} />
                </a>
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
