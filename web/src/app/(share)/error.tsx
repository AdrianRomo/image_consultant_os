"use client";
import { Button } from "@/components/atelier/ui/controls";

// In this version of Next the recovery call is `retry` (re-fetch and re-render), not `reset`.
export default function ShareError({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <main id="main" className="mx-auto flex min-h-[86svh] max-w-[1200px] flex-col justify-center px-[var(--gutter)] pb-16 pt-16">
      <p role="alert" className="label tone-accent">Something did not open</p>
      <h1 className="display-l mt-6 max-w-[16ch]">This page did not <span className="italic-serif">open as it should.</span></h1>
      <p className="lede mt-8">Nothing has been changed. Try again in a moment.</p>
      <div className="mt-8"><Button variant="solid" onClick={() => retry()}>Try again</Button></div>
    </main>
  );
}
