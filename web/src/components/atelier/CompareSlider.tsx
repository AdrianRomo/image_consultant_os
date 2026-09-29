"use client";
import { useState } from "react";
import { PortraitStudy } from "./PortraitStudy";

// Full-height before/after with a draggable divider. A transparent native range input sits over the
// image, so pointer drag, touch and arrow keys all work with correct semantics.
// "After" is a proposed direction, not a claimed result.
export function CompareSlider({ className = "" }: { className?: string }) {
  const [v, setV] = useState(50);
  return (
    <div className={`compare-wrap relative select-none overflow-hidden ${className}`} data-cursor="Drag">
      <PortraitStudy outfit="jacket" crop="full" className="absolute inset-0 h-full w-full" label="Proposed direction: structured ink jacket" />
      <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - v}% 0 0)` }}>
        <PortraitStudy outfit="cardigan" bg="#d8d0c0" crop="full" className="h-full w-full" label="Current: soft grey cardigan" />
      </div>
      <div className="pointer-events-none absolute inset-y-0 w-px bg-ivory/90" style={{ left: `${v}%` }}>
        <span className="compare-handle absolute top-1/2 grid h-10 w-10 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-ivory/90 bg-ink/50 text-xs text-ivory backdrop-blur-sm" aria-hidden>↔</span>
      </div>
      <span className="label absolute left-3 top-3 bg-ivory/85 px-2 py-1 text-ink">Current</span>
      <span className="label absolute right-3 top-3 bg-ink/85 px-2 py-1 text-ivory">Direction</span>
      <input
        type="range" min={0} max={100} step={1} value={v}
        onChange={(e) => setV(+e.target.value)}
        className="compare-range"
        aria-label="Reveal: current on the left, proposed direction on the right"
        aria-valuetext={`${v}% current`}
      />
    </div>
  );
}
