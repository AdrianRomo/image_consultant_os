"use client";
import { useEffect, useRef, type ReactNode } from "react";

/* ------------------------------------------------------------------
   Overlays on the native <dialog>: modal semantics, Esc, focus trap and
   focus return come from the platform. The motion is ours (globals.css):
   drawers slide 300ms, sheets settle 260ms, the backdrop fades with them.
   Content is kept mounted by the caller while closing, so it does not
   vanish mid-slide.
   ------------------------------------------------------------------ */
function useDialogSync(open: boolean) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);
  return ref;
}

/* A click on the dialog element itself (its backdrop area) closes it; clicks on content do not. */
const closeOnBackdrop = (e: React.MouseEvent<HTMLDialogElement>) => {
  if (e.target === e.currentTarget) e.currentTarget.close();
};

export function Drawer({
  open, onClose, label, children, className = "",
}: { open: boolean; onClose: () => void; label: string; children: ReactNode; className?: string }) {
  const ref = useDialogSync(open);
  return (
    <dialog
      ref={ref} onClose={onClose} onClick={closeOnBackdrop} aria-label={label}
      className={`drawer m-0 ml-auto h-dvh max-h-none w-[min(30rem,100vw)] max-w-none border-l border-ink/15 bg-ivory p-0 ${className}`}
    >
      {children}
    </dialog>
  );
}

export function Sheet({
  open, onClose, label, children, className = "",
}: { open: boolean; onClose: () => void; label: string; children: ReactNode; className?: string }) {
  const ref = useDialogSync(open);
  return (
    <dialog
      ref={ref} onClose={onClose} onClick={closeOnBackdrop} aria-label={label}
      className={`sheet m-0 mx-auto mt-[12vh] w-[min(36rem,calc(100vw-2rem))] max-w-none border border-ink/20 bg-ivory p-0 ${className}`}
    >
      {children}
    </dialog>
  );
}

/* A full-screen sheet for small screens (the menu). */
export function Curtain({
  open, onClose, label, children,
}: { open: boolean; onClose: () => void; label: string; children: ReactNode }) {
  const ref = useDialogSync(open);
  return (
    <dialog
      ref={ref} onClose={onClose} onClick={closeOnBackdrop} aria-label={label}
      className="sheet m-0 h-dvh max-h-none w-screen max-w-none border-0 bg-ivory p-0"
    >
      {children}
    </dialog>
  );
}
