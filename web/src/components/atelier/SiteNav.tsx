"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { openPalette } from "./CommandPalette";
import { Curtain } from "./ui/Overlay";

export const sections = [
  { href: "/", label: "Studio", match: (p: string) => p === "/" },
  { href: "/clients/marisol", label: "Clients", match: (p: string) => p.startsWith("/clients") },
  { href: "/wardrobe", label: "Wardrobe", match: (p: string) => p.startsWith("/wardrobe") },
  { href: "/looks", label: "Looks", match: (p: string) => p.startsWith("/looks") },
];

/** True once the page has scrolled a little. Used to draw the header's hairline. */
export function useScrolled(threshold = 8) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > threshold);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, [threshold]);
  return scrolled;
}

/* The software shell. It recedes: solid ground, one hairline once you scroll, no blur.
   Inside a client (/clients/*) the client is the context and this shell steps aside for ClientNav. */
export function SiteNav() {
  const pathname = usePathname();
  const scrolled = useScrolled();
  const [menu, setMenu] = useState(false);

  if (pathname.startsWith("/concepts") || pathname.startsWith("/clients")) return null;

  return (
    <>
      <header
        data-scrolled={scrolled}
        style={{ viewTransitionName: "site-header" }}
        className="fixed inset-x-0 top-0 z-40 border-b border-transparent bg-ivory transition-[border-color] duration-[var(--dur-ui)] data-[scrolled=true]:border-ink/15"
      >
        <div className="mx-auto flex h-[var(--header-h)] max-w-[1600px] items-center justify-between px-[var(--gutter)]">
          <Link href="/" className="label tone-ink tap whitespace-nowrap" aria-label="Image Consultant OS — Studio">
            Image Consultant <span className="numeral text-base normal-case tracking-normal">OS</span>
          </Link>

          <nav aria-label="Primary" className="hidden items-center gap-6 sm:flex lg:gap-9">
            {sections.map((s) => {
              const current = s.match(pathname);
              return (
                <Link
                  key={s.href} href={s.href} aria-current={current ? "page" : undefined}
                  className={`label hit relative py-2 ${current ? "tone-ink" : "tone-muted hover:text-ink"}`}
                >
                  <span className={`travel pb-0.5 ${current ? "travel-static" : ""}`}>{s.label}</span>
                </Link>
              );
            })}
            <button onClick={openPalette} className="label tone-muted hit relative flex items-center gap-2 py-2 hover:text-ink" aria-label="Open search and commands">
              <span className="travel pb-0.5">Search</span>
              <kbd className="rounded-[2px] border border-ink/25 px-1.5 py-0.5 text-xs tracking-normal">⌘K</kbd>
            </button>
          </nav>

          <button onClick={() => setMenu(true)} className="label tone-ink tap -mr-2 px-2 sm:hidden" aria-haspopup="dialog">
            Menu
          </button>
        </div>
      </header>

      <Curtain open={menu} onClose={() => setMenu(false)} label="Menu">
        <div className="flex h-full flex-col px-[var(--gutter)] pb-8">
          <div className="flex h-[var(--header-h)] items-center justify-between">
            <span className="label tone-muted">Image Consultant <span className="numeral text-base normal-case tracking-normal">OS</span></span>
            <button onClick={() => setMenu(false)} className="label tone-ink tap -mr-2 px-2">Close</button>
          </div>
          <nav aria-label="Menu" className="mt-10 flex-1">
            <ul>
              {sections.map((s) => (
                <li key={s.href} className="border-t border-ink/15 last:border-b">
                  <Link href={s.href} onClick={() => setMenu(false)} aria-current={s.match(pathname) ? "page" : undefined} className="display-m flex items-baseline justify-between py-5">
                    <span className={s.match(pathname) ? "italic-serif" : ""}>{s.label}</span>
                    <span aria-hidden className="label tone-muted">→</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <button onClick={() => { setMenu(false); requestAnimationFrame(() => openPalette()); }} className="btn self-start">Search</button>
        </div>
      </Curtain>
    </>
  );
}
