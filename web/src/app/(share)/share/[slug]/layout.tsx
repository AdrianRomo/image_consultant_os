import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { clientSlug } from "@/lib/fixture";

/* The link is checked here, above this segment's loading boundary, so an unknown link is a real 404 and not a
   200 that streams a "not found" message after the loading skeleton. The same answer for every unknown link. */
export default async function ShareSlugLayout({ children, params }: { children: ReactNode; params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (slug !== clientSlug) notFound();
  return children;
}
