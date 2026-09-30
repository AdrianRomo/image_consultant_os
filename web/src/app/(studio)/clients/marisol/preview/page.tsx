import type { Metadata } from "next";
import Link from "next/link";
import { ClientPresentation } from "@/components/share/ClientPresentation";
import { client, clientSlug } from "@/lib/fixture";
import { liveRecommendations } from "@/lib/live";
import { shareCounts, toClientView } from "@/lib/share";

export const metadata: Metadata = { title: "What Marisol sees", robots: { index: false, follow: false } };

/* The consultant's check before she shares. Below the bar this is the client's page, the very same component
   fed by the very same `toClientView` as /share/marisol, so what she sees here is what Marisol gets. The bar is
   the only thing that is not the client's: it sits outside the presentation, and it shows counts, never titles. */
export default async function Preview() {
  const recs = await liveRecommendations();
  const view = toClientView(client, recs);
  const { shown, held } = shareCounts(recs);
  return (
    <>
      <header className="fixed inset-x-0 top-0 z-40 border-b border-ink/15 bg-ivory">
        <div className="mx-auto flex h-[var(--header-h)] max-w-[1600px] items-center justify-between gap-6 px-[var(--gutter)]">
          <Link href="/clients/marisol#opportunities" className="label tone-ink tap group flex shrink-0 items-center gap-2 whitespace-nowrap">
            <span aria-hidden className="transition-transform duration-[var(--dur-ui)] group-hover:-translate-x-1">←</span>
            <span className="travel pb-0.5">Dossier</span>
          </Link>
          <p className="label tone-muted min-w-0 flex-1 truncate text-center sm:text-left">
            <span className="tone-ink">Preview</span>
            <span className="hidden sm:inline"><span className="mx-3 opacity-40" aria-hidden>/</span>Exactly what {view.first} sees</span>
          </p>
          <div className="flex shrink-0 items-center gap-6">
            <p className="meta hidden md:block">{shown} shared · {held} held back</p>
            <a href={`/share/${clientSlug}`} target="_blank" rel="noopener" className="label tone-ink tap group inline-flex items-center gap-2 whitespace-nowrap">
              <span className="travel pb-0.5">Open her link<span className="sr-only"> (opens in a new tab)</span></span>
              <span aria-hidden>↗</span>
            </a>
          </div>
        </div>
      </header>
      <div className="pt-[var(--header-h)]">
        <ClientPresentation view={view} />
      </div>
    </>
  );
}
