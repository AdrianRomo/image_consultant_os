import { ViewTransition, type ReactNode } from "react";
import { photos, type PhotoSubject } from "@/lib/photos";

/* ------------------------------------------------------------------
   Portrait: photography as a primitive, not an avatar.
   Two ratios only: portrait 4:5 and landscape 16:10. Every photograph shares
   one finish (.photo). Pass `tx` to make the plate a shared element that
   morphs between routes (Studio roster -> profile hero). Children (a drape,
   a marker) sit inside the plate, under the finish.
   ------------------------------------------------------------------ */
export type PortraitRatio = "portrait" | "landscape";
const ratioClass: Record<PortraitRatio, string> = { portrait: "aspect-[4/5]", landscape: "aspect-[16/10]" };

export function Portrait({
  subject = "today",
  ratio = "portrait",
  tx,
  label,
  decorative,
  priority,
  sizes = "(min-width: 1024px) 40vw, 90vw",
  className = "",
  children,
}: {
  subject?: PhotoSubject;
  ratio?: PortraitRatio;
  tx?: string;
  label?: string;
  decorative?: boolean;
  priority?: boolean;
  sizes?: string;
  className?: string;
  children?: ReactNode;
}) {
  const p = photos[subject];
  const wide = ratio === "landscape" && p.wide;
  const img = wide ? p.wide! : p.bust;
  const alt = decorative ? "" : label ?? (wide ? p.wideAlt : p.alt) ?? "";
  const plate = (
    <div className={`photo ${ratioClass[ratio]} w-full ${className}`}>
      {/* Plain <img>: pre-sized, pre-graded assets with an explicit srcset; no runtime optimiser is needed. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={img.src} srcSet={img.srcSet} sizes={sizes} width={img.width} height={img.height} alt={alt}
        loading={priority ? "eager" : "lazy"} fetchPriority={priority ? "high" : "auto"} decoding="async"
        className="absolute inset-0 h-full w-full object-cover"
        style={{ objectPosition: wide ? "50% 50%" : ratio === "landscape" ? "50% 40%" : p.position }}
      />
      {children}
    </div>
  );
  return tx ? <ViewTransition name={tx} share="morph" default="none">{plate}</ViewTransition> : plate;
}

/* No portrait yet: a quiet plate with initials, not a grey silhouette. Same ratio, same finish. */
export function PortraitPlaceholder({
  initials, name, tx, className = "",
}: { initials: string; name: string; tx?: string; className?: string }) {
  const plate = (
    <div role="img" aria-label={`No portrait yet for ${name}`} className={`photo aspect-[4/5] w-full ${className}`}>
      <span className="numeral tone-faint absolute inset-0 grid place-items-center text-[clamp(3.5rem,8vw,7rem)] leading-none" aria-hidden>{initials}</span>
      <span className="label tone-muted absolute bottom-3 left-4 right-4" aria-hidden>Portrait to be added</span>
    </div>
  );
  return tx ? <ViewTransition name={tx} share="morph" default="none">{plate}</ViewTransition> : plate;
}
