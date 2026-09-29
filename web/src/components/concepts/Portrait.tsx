// Synthetic placeholder portrait (abstract figure, not a real person). 4:5 ratio.
export function Portrait({
  tone = "#c9b8a2",
  bg = "#e9e1d3",
  ink = "#2a2622",
  className = "",
}: {
  tone?: string;
  bg?: string;
  ink?: string;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 400 500"
      role="img"
      aria-label="Synthetic placeholder portrait of the fictional client"
      className={className}
      preserveAspectRatio="xMidYMid slice"
    >
      <rect width="400" height="500" fill={bg} />
      <path d="M0 500 L0 400 Q200 330 400 400 L400 500 Z" fill={ink} opacity="0.92" />
      <path d="M150 360 L200 420 L250 360 L232 330 L168 330 Z" fill={tone} />
      <rect x="180" y="270" width="40" height="70" fill={tone} />
      <ellipse cx="200" cy="200" rx="66" ry="82" fill={tone} />
      <path d="M130 190 Q135 105 205 110 Q275 112 272 200 Q262 150 200 150 Q150 150 130 190Z" fill={ink} opacity="0.85" />
    </svg>
  );
}
