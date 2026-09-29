"use client";
import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

/* ------------------------------------------------------------------
   Reveal — fades/rises (or unmasks) once when scrolled into view.
   Content is always in the DOM; without JS or with reduced motion it is simply visible.
   ------------------------------------------------------------------ */
export function Reveal({
  children,
  delay = 0,
  mask = false,
  as: Tag = "div",
  className = "",
  style,
}: {
  children: ReactNode;
  delay?: number;
  mask?: boolean;
  as?: "div" | "li" | "section" | "p" | "span";
  className?: string;
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLElement>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setSeen(true);
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const T = Tag as "div";
  // Mask reveals clip the inner element; the observed wrapper stays unclipped so it can intersect.
  if (mask) {
    return (
      <T ref={ref as React.RefObject<HTMLDivElement>} className={className} style={style}>
        <div className={`reveal-mask h-full w-full ${seen ? "in" : ""}`} style={{ ["--d" as string]: `${delay}ms` }}>{children}</div>
      </T>
    );
  }
  return (
    <T
      ref={ref as React.RefObject<HTMLDivElement>}
      className={`reveal ${seen ? "in" : ""} ${className}`}
      style={{ ...style, ["--d" as string]: `${delay}ms` }}
    >
      {children}
    </T>
  );
}

/* Section marker:  ──────────── 03 / WARDROBE */
export function Marker({ n, label, className = "", dark = false }: { n: string; label: string; className?: string; dark?: boolean }) {
  return (
    <Reveal className={`flex items-center gap-5 ${className}`}>
      <span className={`h-px flex-1 ${dark ? "bg-ivory/30" : "bg-ink/25"}`} aria-hidden />
      <span className="label tabular-nums">
        <span className="numeral text-base tracking-normal normal-case">{n}</span>
        <span className="mx-2 opacity-40">/</span>
        {label}
      </span>
    </Reveal>
  );
}

/* Small caps label */
export function Label({ children, className = "", tone = "warm" }: { children: ReactNode; className?: string; tone?: "warm" | "ink" | "accent" }) {
  const c = tone === "accent" ? "text-cordovan" : tone === "ink" ? "text-ink" : "text-warm";
  return <p className={`label ${c} ${className}`}>{children}</p>;
}

/* Text link with the travelling underline and a quiet arrow */
export function TextLink({ href, children, className = "" }: { href: string; children: ReactNode; className?: string }) {
  return (
    <Link href={href} className={`group inline-flex items-baseline gap-2 py-2 ${className}`}>
      <span className="travel pb-0.5">{children}</span>
      <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">→</span>
    </Link>
  );
}

/* ClientRow — typography and spacing instead of a card. */
export function ClientRow({
  name, focus, last, status, href, index,
}: {
  name: string; focus: string; last: string; status?: string; href?: string; index: number;
}) {
  const awaiting = status === "Draft to review" || status === "Analysis ready";
  const inner = (
    <>
      <span className="numeral w-8 shrink-0 pt-2 text-lg text-warm sm:w-12" aria-hidden>{String(index + 1).padStart(2, "0")}</span>
      <span className="min-w-0 flex-1">
        <span className="headline block transition-transform duration-500 ease-out group-hover:translate-x-2 group-focus-visible:translate-x-2">{name}</span>
        <span className="mt-1 block text-sm text-charcoal">{focus}</span>
        <span className="meta mt-1 flex flex-wrap items-center gap-x-3">
          <span>{last}</span>
        </span>
      </span>
      <span className="flex shrink-0 items-center gap-3 pt-2 text-sm">
        {awaiting && (
          <span className="label flex items-center gap-2 text-cordovan">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-cordovan" aria-hidden />
            <span className="hidden sm:inline">{status}</span>
            <span className="sr-only sm:hidden">{status}</span>
          </span>
        )}
        {href && <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">→</span>}
      </span>
    </>
  );
  const cls = "group flex items-start gap-3 border-t border-ink/15 py-6 sm:gap-6 sm:py-7";
  return (
    <Reveal as="li" delay={index * 100} className="list-none">
      {href ? (
        <Link href={href} className={cls} data-cursor="Open">{inner}</Link>
      ) : (
        <div className={cls}>{inner}</div>
      )}
    </Reveal>
  );
}

/* Palette dots — meaningful colour only */
export function Dots({ value, max = 5 }: { value: number; max?: number }) {
  return (
    <span className="inline-flex gap-1.5" role="img" aria-label={`${value} of ${max}`}>
      {Array.from({ length: max }).map((_, i) => (
        <span key={i} className={`h-2 w-2 rounded-full border border-ink ${i < value ? "bg-ink" : ""}`} />
      ))}
    </span>
  );
}
