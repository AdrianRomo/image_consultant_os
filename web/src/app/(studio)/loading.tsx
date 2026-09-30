import { Skeleton } from "@/components/atelier/ui/controls";

// The shape of a page, not a spinner: a label, a title, then the first block. Still on purpose.
export default function Loading() {
  return (
    <main id="main" aria-busy="true" className="mx-auto max-w-[1600px] px-[var(--gutter)] pb-24 pt-32 sm:pt-40">
      <p role="status" className="sr-only">Loading</p>
      <Skeleton className="h-3 w-40" />
      <Skeleton className="mt-6 h-[clamp(3rem,9vw,7rem)] w-[min(38rem,80%)]" />
      <Skeleton className="mt-4 h-[clamp(3rem,9vw,7rem)] w-[min(26rem,55%)]" />
      <div className="mt-14 grid grid-cols-12 gap-x-6 gap-y-10">
        <Skeleton className="col-span-12 aspect-[4/5] lg:col-span-5" />
        <div className="col-span-12 space-y-4 lg:col-span-5 lg:col-start-8">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-8 w-[85%]" />
          <Skeleton className="h-8 w-[60%]" />
          <Skeleton className="mt-8 h-4 w-full" />
          <Skeleton className="h-4 w-[92%]" />
          <Skeleton className="h-4 w-[70%]" />
        </div>
      </div>
    </main>
  );
}
