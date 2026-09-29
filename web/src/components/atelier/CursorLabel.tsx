"use client";
import { useEffect, useRef } from "react";

// A quiet cursor label ("VIEW →") for elements carrying data-cursor. Fine pointers only.
export function CursorLabel() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el = ref.current!;
    let raf = 0;
    const move = (e: PointerEvent) => {
      const t = (e.target as HTMLElement | null)?.closest<HTMLElement>("[data-cursor]");
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        if (t && !document.querySelector("dialog[open]")) {
          el.textContent = `${t.dataset.cursor} →`;
          el.style.opacity = "1";
          el.style.transform = `translate(${e.clientX + 16}px, ${e.clientY + 14}px)`;
        } else {
          el.style.opacity = "0";
        }
      });
    };
    const leave = () => { el.style.opacity = "0"; };
    window.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("pointerleave", leave);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", move);
      document.removeEventListener("pointerleave", leave);
    };
  }, []);
  return (
    <div
      ref={ref}
      aria-hidden
      className="cursor-label label rounded-[2px] bg-ink px-2.5 py-1.5 text-ivory"
      style={{ opacity: 0 }}
    />
  );
}
