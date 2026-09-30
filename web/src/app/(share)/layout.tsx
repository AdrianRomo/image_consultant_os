import type { Metadata } from "next";
import type { ReactNode } from "react";

/* Everything a client can open lives in this group. It has no layout chrome on purpose: the studio's header, its
   ⌘K search (which lists every client) and its cursor label belong to the (studio) group and are never loaded here.
   Not indexed, and titled for the person reading it rather than for the product. */
export const metadata: Metadata = {
  title: { absolute: "Prepared for you" },
  description: "A private page from your image consultant.",
  robots: { index: false, follow: false },
};

export default function ShareLayout({ children }: { children: ReactNode }) {
  return children;
}
