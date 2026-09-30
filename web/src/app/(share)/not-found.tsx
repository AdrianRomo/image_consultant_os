// A client's link that does not lead anywhere. It speaks to the client, not about the studio, and says nothing
// about which links exist.
export default function ShareNotFound() {
  return (
    <main id="main" className="mx-auto flex min-h-[86svh] max-w-[1200px] flex-col justify-center px-[var(--gutter)] pb-16 pt-16">
      <p className="label tone-muted">404</p>
      <h1 className="display-l mt-6 max-w-[14ch]">This link is not <span className="italic-serif">available.</span></h1>
      <p className="lede mt-8">It may have been withdrawn or mistyped. Your consultant can send you a new one.</p>
    </main>
  );
}
