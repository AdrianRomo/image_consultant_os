import { Skeleton } from "@/components/atelier/ui/controls";

// The shape of the client's page, not a spinner: the heading block, the portrait, then the first recommendation.
export default function ShareLoading() {
  return (
    <main id="main" aria-busy="true" className="mx-auto max-w-[1200px] px-[var(--gutter)] pb-24 pt-8 sm:pt-12">
      <p role="status" className="sr-only">Loading</p>
      <Skeleton className="h-3 w-64" />
      <div className="mt-14 grid grid-cols-12 gap-x-6 gap-y-10">
        <div className="col-span-12 lg:col-span-6">
          <Skeleton className="h-[clamp(3rem,9vw,7rem)] w-[min(24rem,80%)]" />
          <Skeleton className="mt-4 h-[clamp(3rem,9vw,7rem)] w-[min(18rem,60%)]" />
          <Skeleton className="mt-12 h-8 w-[85%]" />
          <Skeleton className="mt-3 h-8 w-[60%]" />
        </div>
        <Skeleton className="col-span-8 col-start-3 aspect-[4/5] sm:col-span-6 sm:col-start-4 lg:col-span-5 lg:col-start-8" />
      </div>
      <div className="mt-24 space-y-4">
        <Skeleton className="h-3 w-32" />
        <Skeleton className="h-9 w-[70%]" />
        <Skeleton className="h-4 w-[90%]" />
        <Skeleton className="h-4 w-[75%]" />
      </div>
    </main>
  );
}
