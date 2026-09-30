import type { ReactNode } from "react";
import { CommandPalette } from "./CommandPalette";
import { CursorLabel } from "./CursorLabel";
import { SiteNav } from "./SiteNav";

/* The consultant's shell: header, ⌘K search and the cursor label. The search lists every client and command, so
   this shell must never wrap anything a client can open. Routes a client can reach live in the (share) group,
   whose layout does not include it. */
export function StudioChrome({ children }: { children: ReactNode }) {
  return (
    <>
      <SiteNav />
      {children}
      <CommandPalette />
      <CursorLabel />
    </>
  );
}
