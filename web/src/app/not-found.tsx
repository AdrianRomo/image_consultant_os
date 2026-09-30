import Link from "next/link";
import { TextLink } from "@/components/atelier/primitives";

export const metadata = { title: "Not found" };

// Rendered inside the root layout, so the studio's header and skip link are still there.
export default function NotFound() {
  return (
    <main id="main" className="mx-auto flex min-h-[86svh] max-w-[1600px] flex-col justify-center px-[var(--gutter)] pb-16 pt-32">
      <p className="label tone-muted">404 · Not found</p>
      <h1 className="display-l mt-6 max-w-[14ch]">That page is not <span className="italic-serif">in the studio.</span></h1>
      <p className="lede mt-8">The link may be old, or the client may not be part of this preview.</p>
      <div className="mt-8 flex flex-wrap gap-x-10 gap-y-1">
        <TextLink href="/">Back to the Studio</TextLink>
        <TextLink href="/clients/marisol">Marisol’s dossier</TextLink>
        <Link href="/wardrobe" className="group tap inline-flex items-baseline gap-2 py-2"><span className="travel pb-0.5">The wardrobe</span><span aria-hidden>→</span></Link>
      </div>
    </main>
  );
}
