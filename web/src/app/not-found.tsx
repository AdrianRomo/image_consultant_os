import Link from "next/link";

export const metadata = { title: "Not found" };

/* An unmatched URL. Next includes this in the data of EVERY page, so it must be safe for a client to receive:
   no studio header, no search, no client names, no links into the studio's pages. A missing client link is
   handled in the (share) group; a missing studio page is a plain, branded dead end with one way out. */
export default function NotFound() {
  return (
    <main id="main" className="mx-auto flex min-h-[86svh] max-w-[1600px] flex-col justify-center px-[var(--gutter)] pb-16 pt-16">
      <p className="label tone-muted">404 · Not found</p>
      <h1 className="display-l mt-6 max-w-[14ch]">That page is not <span className="italic-serif">here.</span></h1>
      <p className="lede mt-8">The link may be old or mistyped.</p>
      <div className="mt-8">
        <Link href="/" className="group tap inline-flex items-baseline gap-2 py-2"><span className="travel pb-0.5">Back to the start</span><span aria-hidden>→</span></Link>
      </div>
    </main>
  );
}
