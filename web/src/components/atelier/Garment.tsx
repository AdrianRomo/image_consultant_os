import { useId } from "react";
import { shade, type GarmentKind } from "@/lib/atelier";

// Flat, quiet garment illustrations (synthetic stand-ins for cutout photography).
// Each is drawn on a 200×240 canvas; the colour is the garment's real colour so
// palettes and looks read truthfully.
export function Garment({
  kind,
  color,
  label,
  className = "",
}: {
  kind: GarmentKind;
  color: string;
  label?: string;
  className?: string;
}) {
  const id = useId().replace(/:/g, "");
  const dark = shade(color, -0.28);
  const deep = shade(color, -0.45);
  const light = shade(color, 0.16);
  const stroke = { stroke: deep, strokeWidth: 1, strokeLinejoin: "round" as const, strokeLinecap: "round" as const, fill: "none", opacity: 0.55 };

  const defs = (
    <defs>
      <linearGradient id={`${id}-l`} x1="0" x2="1" y1="0" y2="0">
        <stop offset="0" stopColor="#000" stopOpacity="0.16" />
        <stop offset="0.35" stopColor="#fff" stopOpacity="0.07" />
        <stop offset="1" stopColor="#000" stopOpacity="0.2" />
      </linearGradient>
      <filter id={`${id}-s`} x="-20%" y="-10%" width="140%" height="130%">
        <feDropShadow dx="0" dy="5" stdDeviation="5" floodColor="#2d2a26" floodOpacity="0.16" />
      </filter>
    </defs>
  );

  let body: React.ReactNode;
  switch (kind) {
    case "blazer":
    case "coat": {
      const long = kind === "coat";
      const hem = long ? 232 : 208;
      body = (
        <g filter={`url(#${id}-s)`}>
          {/* sleeves */}
          <path d="M60 34 L26 62 L14 196 L42 200 L52 116 Z" fill={color} />
          <path d="M140 34 L174 62 L186 196 L158 200 L148 116 Z" fill={color} />
          {/* torso */}
          <path d={`M60 34 L88 20 L100 46 L112 20 L140 34 L150 116 L150 ${hem} L50 ${hem} L50 116 Z`} fill={color} />
          <path d={`M60 34 L88 20 L100 46 L112 20 L140 34 L150 116 L150 ${hem} L50 ${hem} L50 116 Z`} fill={`url(#${id}-l)`} />
          {/* opening + lapels */}
          <path d={`M88 20 L100 ${long ? 150 : 132} L112 20 L100 46 Z`} fill={deep} opacity="0.9" />
          <path d={`M88 20 L74 62 L${long ? 92 : 94} 88 L100 46 Z`} fill={dark} />
          <path d={`M112 20 L126 62 L${long ? 108 : 106} 88 L100 46 Z`} fill={dark} />
          <path d={`M100 ${long ? 150 : 132} L100 ${hem}`} {...stroke} />
          <circle cx="100" cy={long ? 166 : 148} r="2.4" fill={deep} />
          {long && <path d="M50 150 Q100 160 150 150 L150 158 Q100 168 50 158 Z" fill={dark} opacity="0.8" />}
          <path d={`M62 ${long ? 176 : 158} h22 M116 ${long ? 176 : 158} h22`} {...stroke} strokeWidth={1.4} />
          <path d="M42 200 L52 116 M158 200 L148 116" {...stroke} />
        </g>
      );
      break;
    }
    case "shirt":
      body = (
        <g filter={`url(#${id}-s)`}>
          <path d="M70 34 L28 60 L16 150 L44 156 L54 100 Z" fill={color} />
          <path d="M130 34 L172 60 L184 150 L156 156 L146 100 Z" fill={color} />
          <path d="M70 34 L100 44 L130 34 L146 100 L146 206 L54 206 L54 100 Z" fill={color} />
          <path d="M70 34 L100 44 L130 34 L146 100 L146 206 L54 206 L54 100 Z" fill={`url(#${id}-l)`} />
          <path d="M70 34 L100 64 L86 30 Z" fill={light} />
          <path d="M130 34 L100 64 L114 30 Z" fill={light} />
          <path d="M70 34 L86 30 L100 44 L100 64 Z M130 34 L114 30 L100 44 L100 64 Z" {...stroke} />
          <path d="M100 64 L100 206" {...stroke} />
          {[86, 110, 134, 158, 182].map((y) => <circle key={y} cx="104" cy={y} r="1.6" fill={deep} opacity="0.55" />)}
          <path d="M16 150 L44 156" {...stroke} />
        </g>
      );
      break;
    case "knit":
      body = (
        <g filter={`url(#${id}-s)`}>
          <path d="M66 34 L26 66 L14 190 L44 196 L54 112 Z" fill={color} />
          <path d="M134 34 L174 66 L186 190 L156 196 L146 112 Z" fill={color} />
          <path d="M66 34 Q100 52 134 34 L146 112 L146 200 L54 200 L54 112 Z" fill={color} />
          <path d="M66 34 Q100 52 134 34 L146 112 L146 200 L54 200 L54 112 Z" fill={`url(#${id}-l)`} />
          <path d="M78 33 Q100 60 122 33" fill="none" stroke={dark} strokeWidth="5" strokeLinecap="round" />
          <rect x="54" y="192" width="92" height="12" rx="1" fill={dark} />
          <path d="M14 190 L44 196" stroke={dark} strokeWidth="7" strokeLinecap="round" />
          <path d="M186 190 L156 196" stroke={dark} strokeWidth="7" strokeLinecap="round" />
          {[70, 96, 122, 148].map((y) => <path key={y} d={`M62 ${y} H138`} {...stroke} opacity={0.18} />)}
        </g>
      );
      break;
    case "cardigan":
      body = (
        <g filter={`url(#${id}-s)`}>
          <path d="M66 34 L26 66 L14 190 L44 196 L54 112 Z" fill={color} />
          <path d="M134 34 L174 66 L186 190 L156 196 L146 112 Z" fill={color} />
          <path d="M66 34 Q100 50 134 34 L146 112 L146 206 L54 206 L54 112 Z" fill={color} />
          <path d="M66 34 Q100 50 134 34 L146 112 L146 206 L54 206 L54 112 Z" fill={`url(#${id}-l)`} />
          <path d="M86 36 L96 206 L104 206 L114 36 Z" fill={deep} opacity="0.55" />
          <path d="M96 60 L96 206 M104 60 L104 206" {...stroke} />
          {[84, 112, 140, 168].map((y) => <circle key={y} cx="100" cy={y} r="2" fill={deep} />)}
        </g>
      );
      break;
    case "trousers":
      body = (
        <g filter={`url(#${id}-s)`}>
          <path d="M64 14 H136 L152 232 L106 232 L100 84 L94 232 L48 232 Z" fill={color} />
          <path d="M64 14 H136 L152 232 L106 232 L100 84 L94 232 L48 232 Z" fill={`url(#${id}-l)`} />
          <rect x="64" y="14" width="72" height="12" fill={dark} />
          <path d="M100 26 L100 84" {...stroke} />
          <path d="M72 30 L68 150 M128 30 L132 150" {...stroke} opacity={0.3} />
          <circle cx="100" cy="20" r="2" fill={deep} />
        </g>
      );
      break;
    case "loafer":
      body = (
        <g filter={`url(#${id}-s)`}>
          {[0, 1].map((i) => (
            <g key={i} transform={`translate(${i ? 10 : 0} ${i ? 70 : 0})`}>
              <path d="M16 90 C16 66 40 58 66 62 L96 72 C128 74 156 80 170 96 L170 108 L16 108 Z" fill={color} />
              <path d="M16 90 C16 66 40 58 66 62 L96 72 C128 74 156 80 170 96 L170 108 L16 108 Z" fill={`url(#${id}-l)`} />
              <path d="M66 62 C74 76 96 78 118 76 C126 76 128 84 120 84" {...stroke} />
              <rect x="16" y="104" width="154" height="8" rx="2" fill={deep} />
              <rect x="16" y="112" width="30" height="6" rx="1" fill={deep} />
            </g>
          ))}
        </g>
      );
      break;
    case "bag":
      body = (
        <g filter={`url(#${id}-s)`}>
          <path d="M68 78 C68 30 132 30 132 78" fill="none" stroke={dark} strokeWidth="7" strokeLinecap="round" />
          <path d="M34 78 H166 L176 200 H24 Z" fill={color} />
          <path d="M34 78 H166 L176 200 H24 Z" fill={`url(#${id}-l)`} />
          <path d="M34 78 H166 L162 96 H38 Z" fill={dark} opacity="0.7" />
          <rect x="92" y="94" width="16" height="22" rx="2" fill={deep} opacity="0.8" />
          <path d="M24 200 L34 78" {...stroke} />
        </g>
      );
      break;
    case "watch":
      body = (
        <g filter={`url(#${id}-s)`}>
          <path d="M84 20 H116 L120 84 H80 Z" fill={dark} />
          <path d="M80 156 H120 L116 220 H84 Z" fill={dark} />
          <circle cx="100" cy="120" r="46" fill={light} />
          <circle cx="100" cy="120" r="46" fill="none" stroke={deep} strokeWidth="2" opacity="0.6" />
          <circle cx="100" cy="120" r="38" fill="#f1ede3" />
          {Array.from({ length: 12 }).map((_, i) => {
            const a = (i * Math.PI) / 6;
            const r = (v: number) => v.toFixed(2);
            return <path key={i} d={`M${r(100 + Math.sin(a) * 33)} ${r(120 - Math.cos(a) * 33)} L${r(100 + Math.sin(a) * 37)} ${r(120 - Math.cos(a) * 37)}`} stroke="#2d2a26" strokeWidth={i % 3 ? 1 : 1.8} />;
          })}
          <path d="M100 120 L100 98 M100 120 L116 128" stroke="#2d2a26" strokeWidth="2" strokeLinecap="round" />
          <circle cx="100" cy="120" r="2.4" fill="#2d2a26" />
        </g>
      );
      break;
  }

  return (
    <svg viewBox={kind === "loafer" ? "0 70 200 120" : "0 0 200 240"} role={label ? "img" : undefined} aria-label={label} aria-hidden={label ? undefined : true} className={className}>
      {defs}
      {body}
    </svg>
  );
}
