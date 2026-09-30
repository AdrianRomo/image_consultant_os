"use client";
import { useEffect } from "react";
import { TextLink } from "@/components/atelier/primitives";
import { Button } from "@/components/atelier/ui/controls";

// In this version of Next the recovery call is `retry` (re-fetch and re-render), not `reset`.
export default function ErrorState({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => { console.error(error); }, [error]);
  return (
    <main id="main" className="mx-auto flex min-h-[86svh] max-w-[1600px] flex-col justify-center px-[var(--gutter)] pb-16 pt-32">
      <p role="alert" className="label tone-accent">Something did not open</p>
      <h1 className="display-l mt-6 max-w-[16ch]">That did not open <span className="italic-serif">as it should.</span></h1>
      <p className="lede mt-8">Nothing has been lost. This preview keeps no client data.</p>
      <div className="mt-8 flex flex-wrap items-center gap-x-10 gap-y-3">
        <Button variant="solid" onClick={() => retry()}>Try again</Button>
        <TextLink href="/">Back to the Studio</TextLink>
      </div>
      {error.digest && <p className="meta mt-10">Reference {error.digest}</p>}
    </main>
  );
}
