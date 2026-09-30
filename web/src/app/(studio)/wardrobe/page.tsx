import { WardrobeSheet } from "@/components/atelier/WardrobeSheet";

export const metadata = { title: "Wardrobe" };

export default async function Page({ searchParams }: { searchParams: Promise<{ item?: string }> }) {
  const { item } = await searchParams;
  return (
    <main id="main" className="mx-auto max-w-[1600px] px-[var(--gutter)] pb-24 pt-32 sm:pt-40">
      <WardrobeSheet initialItem={item} />
    </main>
  );
}
