import { LookStudio } from "@/components/atelier/LookStudio";

export const metadata = { title: "Looks" };

export default async function Page({ searchParams }: { searchParams: Promise<{ ask?: string; look?: string; add?: string }> }) {
  const { ask, look, add } = await searchParams;
  return (
    <main id="main" className="mx-auto max-w-[1600px] px-[var(--gutter)] pb-24 pt-32 sm:pt-40">
      <LookStudio initialAsk={ask} initialLook={look} initialAdd={add} />
    </main>
  );
}
