"use client";
import { useState } from "react";
import { photos } from "@/lib/photos";

// Full-height reveal with a draggable divider. A transparent native range input sits over the image, so
// pointer drag, touch and arrow keys all work with correct semantics.
// The right-hand image is a *reference* for the direction (a different person, chosen for the cut and the
// colour), never a claimed result. The handle rides at shoulder height so it never sits on a face.
export function CompareSlider({ className = "" }: { className?: string }) {
  const [v, setV] = useState(50);
  const today = photos.today.bust, ref = photos.direction.bust;
  return (
    <div className={`compare-wrap photo select-none ${className}`} data-cursor="Drag">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={ref.src} srcSet={ref.srcSet} sizes="(min-width: 1024px) 45vw, 92vw" width={ref.width} height={ref.height} alt={photos.direction.alt} loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover" style={{ objectPosition: "50% 30%" }} />
      <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - v}% 0 0)` }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={today.src} srcSet={today.srcSet} sizes="(min-width: 1024px) 45vw, 92vw" width={today.width} height={today.height} alt={photos.today.alt} loading="lazy" decoding="async" className="h-full w-full object-cover" style={{ objectPosition: photos.today.position }} />
      </div>
      <div className="pointer-events-none absolute inset-y-0 w-px bg-ivory/90" style={{ left: `${v}%` }}>
        <span className="compare-handle absolute top-[78%] grid h-10 w-10 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-ink bg-ivory text-xs text-ink" aria-hidden>↔</span>
      </div>
      <span className="label absolute left-4 top-4 bg-ivory/90 px-2 py-1 tone-ink">Today</span>
      <span className="label absolute right-4 top-4 bg-ivory/90 px-2 py-1 tone-ink">Reference</span>
      <input
        type="range" min={0} max={100} step={1} value={v}
        onChange={(e) => setV(+e.target.value)}
        className="compare-range"
        aria-label="Reveal: her today on the left, a reference for the direction on the right"
        aria-valuetext={`${v}% today`}
      />
    </div>
  );
}
