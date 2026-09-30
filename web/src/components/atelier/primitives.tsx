"use client";
import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

/* ------------------------------------------------------------------
   Editorial primitives. Motion here is deliberately scarce: photographs
   unmask once, chapter rules draw once. Text never fades up on scroll.
   Content is always in the DOM; without JS or with reduced motion it is
   simply visible.
   ------------------------------------------------------------------ */

/** True once the element has been seen (never resets). */
export function useSeen<T extends HTMLElement>(margin = "0px 0px -8% 0px") {
  const ref = useRef<T>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || seen) return;
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setSeen(true); io.disconnect(); } },
      { rootMargin: margin, threshold: 0.08 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [margin, seen]);
  return [ref, seen] as const;
}

/** Wrapper. By default inert. `mask` unmasks a photograph once; `draw` draws a rule once. */
export function Reveal({
  children, delay = 0, mask = false, draw = false, as: Tag = "div", className = "", style,
}: {
  children?: ReactNode;
  delay?: number;
  mask?: boolean;
  draw?: boolean;
  as?: "div" | "li" | "section" | "p" | "span";
  className?: string;
  style?: CSSProperties;
}) {
  const [ref, seen] = useSeen<HTMLElement>();
  const T = Tag as "div";
  const d = { ["--d" as string]: `${delay}ms` };
  if (mask) {
    // The observed wrapper stays unclipped so it can intersect; the inner element is clipped.
    return (
      <T ref={ref as React.RefObject<HTMLDivElement>} className={className} style={style}>
        <div className={`mask h-full w-full ${seen ? "in" : ""}`} style={d}>{children}</div>
      </T>
    );
  }
  if (draw) {
    return <T ref={ref as React.RefObject<HTMLDivElement>} className={`rule-draw ${seen ? "in" : ""} ${className}`} style={{ ...style, ...d }}>{children}</T>;
  }
  return <T className={className} style={style}>{children}</T>;
}

/* Chapter marker:  ──────────── 03 / ASSESSMENT  Observations */
export function Marker({
  n, label, sub, className = "", dark = false,
}: { n: string; label: string; sub?: string; className?: string; dark?: boolean }) {
  const [ref, seen] = useSeen<HTMLDivElement>();
  return (
    <div ref={ref} className={`flex items-center gap-5 ${className}`}>
      <span className={`rule-draw ${seen ? "in" : ""} h-px flex-1 ${dark ? "bg-ivory/30" : "bg-ink/25"}`} aria-hidden />
      <span className="label tabular-nums">
        <span className="numeral text-base tracking-normal normal-case">{n}</span>
        <span className="mx-2 opacity-40">/</span>
        {label}
        {sub && <span className="tone-muted ml-3 hidden font-normal normal-case tracking-normal sm:inline">{sub}</span>}
      </span>
    </div>
  );
}

/* Small caps label */
export function Label({ children, className = "", tone = "warm" }: { children: ReactNode; className?: string; tone?: "warm" | "ink" | "accent" }) {
  const c = tone === "accent" ? "tone-accent" : tone === "ink" ? "tone-ink" : "tone-muted";
  return <p className={`label ${c} ${className}`}>{children}</p>;
}

/* Text link with the travelling underline and a quiet arrow */
export function TextLink({ href, children, className = "", arrow = "→" }: { href: string; children: ReactNode; className?: string; arrow?: string }) {
  return (
    <Link href={href} className={`group tap inline-flex items-baseline gap-2 py-2 ${className}`}>
      <span className="travel pb-0.5">{children}</span>
      <span aria-hidden className="transition-transform duration-[var(--dur-ui)] group-hover:translate-x-1">{arrow}</span>
    </Link>
  );
}

/* A position on a spectrum between two poles. Says where she sits, not how she scores. */
export function Spectrum({
  label, value, max = 5, low, high,
}: { label: string; value: number; max?: number; low: string; high: string }) {
  const pct = ((value - 1) / (max - 1)) * 100;
  return (
    <div role="img" aria-label={`${label}: ${value} of ${max}, between ${low.toLowerCase()} and ${high.toLowerCase()}`}>
      <div className="flex items-baseline justify-between">
        <span className="label tone-ink">{label}</span>
      </div>
      <div className="relative mt-3 h-px bg-ink/30" aria-hidden>
        <span className="absolute top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-ink" style={{ left: `${pct}%` }} />
      </div>
      <div className="label tone-muted mt-2.5 flex justify-between" aria-hidden>
        <span>{low}</span><span>{high}</span>
      </div>
    </div>
  );
}
