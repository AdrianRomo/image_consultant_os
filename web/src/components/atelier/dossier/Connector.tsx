"use client";
import { useCallback, useEffect, useRef, useState } from "react";

/* ------------------------------------------------------------------
   A fine line from a marker on the portrait to the note it belongs to.
   Elbow-shaped: across the picture, through the gutter, into the text.
   It is drawn once per selection (520ms), tracks scroll, and is purely
   additive: the selected note is highlighted and readable without it.
   Markers and notes are found by data attributes so this stays decoupled.
   ------------------------------------------------------------------ */
type Geo = { d: string; ax: number; ay: number };

export function Connector({ markerId, anchorId }: { markerId: string; anchorId: string }) {
  const [geo, setGeo] = useState<Geo | null>(null);
  const raf = useRef(0);

  const compute = useCallback(() => {
    if (window.innerWidth < 1024) { setGeo(null); return; }
    const m = document.querySelector<HTMLElement>(`[data-marker="${markerId}"]`);
    const a = document.querySelector<HTMLElement>(`[data-anchor="${anchorId}"]`);
    const p = document.querySelector<HTMLElement>("[data-stage-portrait]");
    if (!m || !a || !p) { setGeo(null); return; }
    const mr = m.getBoundingClientRect(), ar = a.getBoundingClientRect(), pr = p.getBoundingClientRect();
    const vh = window.innerHeight;
    const ay = ar.top + 30; // level with the first line of the note
    const ax = ar.left - 12;
    const mx = mr.left + mr.width / 2, my = mr.top + mr.height / 2;
    if (ay < 76 || ay > vh - 24 || pr.bottom < 76 || pr.top > vh) { setGeo(null); return; }
    const ex = pr.right + (ax - pr.right) / 2;
    setGeo({ d: `M${mx} ${my} H${ex} V${ay} H${ax}`, ax, ay });
  }, [markerId, anchorId]);

  useEffect(() => {
    const schedule = () => { cancelAnimationFrame(raf.current); raf.current = requestAnimationFrame(compute); };
    // Follow the accordion while it moves, then rest.
    const t0 = performance.now();
    const follow = () => { compute(); if (performance.now() - t0 < 700) raf.current = requestAnimationFrame(follow); };
    follow();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(raf.current);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [compute]);

  if (!geo) return null;
  return (
    <svg aria-hidden className="pointer-events-none fixed inset-0 z-20 h-full w-full">
      <path key={`${markerId}:${anchorId}`} d={geo.d} pathLength={1} className="connector" fill="none" stroke="var(--cordovan)" strokeWidth="1.25" />
      <circle cx={geo.ax} cy={geo.ay} r="2.5" fill="var(--cordovan)" />
    </svg>
  );
}
