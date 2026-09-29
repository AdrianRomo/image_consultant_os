import { useId } from "react";
import { shade } from "@/lib/atelier";

// Synthetic placeholder portrait of the fictional client, richer than the Phase 1 stand-in.
// `outfit` lets the same figure show the current wardrobe vs the proposed direction.
// `crop` frames it differently — intentional cropping is part of the art direction.
const CROPS = {
  full: "0 0 400 500",
  wide: "0 60 400 250",
  shoulders: "60 150 280 350",
  face: "110 70 180 225",
  tall: "40 0 320 500",
} as const;

export function PortraitStudy({
  outfit = "jacket",
  bg = "#dcd2bd",
  skin = "#c79f80",
  crop = "full",
  className = "",
  label = "Synthetic placeholder portrait of the fictional client",
  decorative = false,
}: {
  outfit?: "jacket" | "cardigan";
  bg?: string;
  skin?: string;
  crop?: keyof typeof CROPS;
  className?: string;
  label?: string;
  decorative?: boolean;
}) {
  const id = useId().replace(/:/g, "");
  const hair = "#211c18";
  const jacket = "#232833";
  const cardi = "#b3aea4";
  return (
    <svg
      viewBox={CROPS[crop]}
      preserveAspectRatio="xMidYMid slice"
      role={decorative ? undefined : "img"}
      aria-label={decorative ? undefined : label}
      aria-hidden={decorative || undefined}
      className={className}
      style={{ transition: "all 700ms cubic-bezier(0.22,1,0.36,1)" }}
    >
      <defs>
        <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" style={{ stopColor: shade(bg, 0.12), transition: "stop-color 700ms" }} />
          <stop offset="1" style={{ stopColor: shade(bg, -0.1), transition: "stop-color 700ms" }} />
        </linearGradient>
        <radialGradient id={`${id}-light`} cx="0.3" cy="0.25" r="0.8">
          <stop offset="0" stopColor="#fff" stopOpacity="0.35" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${id}-skin`} x1="0" x2="1">
          <stop offset="0" stopColor={shade(skin, 0.08)} />
          <stop offset="1" stopColor={shade(skin, -0.14)} />
        </linearGradient>
      </defs>
      <rect x="-200" y="-100" width="800" height="800" fill={`url(#${id}-bg)`} />
      <rect x="-200" y="-100" width="800" height="800" fill={`url(#${id}-light)`} />

      {/* neck + shadow */}
      <path d="M176 262 L176 330 L224 330 L224 262 Z" fill={`url(#${id}-skin)`} />
      <path d="M176 300 Q200 322 224 300 L224 330 L176 330 Z" fill="#000" opacity="0.14" />

      {outfit === "jacket" ? (
        <g>
          {/* squared, built shoulders */}
          <path d="M-20 520 L-20 405 Q10 372 96 352 L160 332 L200 400 L240 332 L304 352 Q390 372 420 405 L420 520 Z" fill={jacket} />
          <path d="M96 352 L160 332 L200 400 L172 520 L110 520 Z" fill="#fff" opacity="0.04" />
          {/* lapels + shirt */}
          <path d="M160 332 L200 470 L240 332 L224 322 L200 380 L176 322 Z" fill="#ece4d1" />
          <path d="M160 332 L188 430 L160 520 L130 520 L150 380 Z" fill={shade(jacket, -0.3)} />
          <path d="M240 332 L212 430 L240 520 L270 520 L250 380 Z" fill={shade(jacket, -0.3)} />
          <path d="M96 352 Q200 330 304 352" stroke="#fff" strokeOpacity="0.08" strokeWidth="2" fill="none" />
        </g>
      ) : (
        <g>
          {/* sloped, soft shoulders, low contrast */}
          <path d="M-20 520 L-20 430 Q40 400 120 380 Q160 360 176 330 L224 330 Q240 360 280 380 Q360 400 420 430 L420 520 Z" fill={cardi} />
          <path d="M176 330 L200 500 L224 330 Q200 356 176 330 Z" fill="#d8d2c6" />
          <path d="M176 330 L188 520 M224 330 L212 520" stroke="#8f8a80" strokeWidth="1.2" opacity="0.6" fill="none" />
          <path d="M120 380 Q200 350 280 380" stroke="#000" strokeOpacity="0.06" strokeWidth="6" fill="none" />
        </g>
      )}

      {/* head */}
      <ellipse cx="200" cy="196" rx="62" ry="80" fill={`url(#${id}-skin)`} />
      <ellipse cx="180" cy="200" rx="4" ry="2.4" fill="#2d2622" opacity="0.7" />
      <ellipse cx="222" cy="200" rx="4" ry="2.4" fill="#2d2622" opacity="0.7" />
      <path d="M186 246 Q202 254 218 246" stroke="#8a4a3a" strokeWidth="2.4" fill="none" strokeLinecap="round" />
      <path d="M200 208 L196 232 L204 232" stroke="#000" strokeOpacity="0.12" strokeWidth="1.5" fill="none" />
      {/* hair */}
      <path d="M130 200 Q124 104 202 106 Q282 108 272 204 Q268 150 204 146 Q150 146 130 200 Z" fill={hair} />
      <path d="M130 200 Q126 250 146 276 Q134 236 138 206 Z" fill={hair} />
      <path d="M272 204 Q278 250 258 276 Q270 236 264 206 Z" fill={hair} />
    </svg>
  );
}
