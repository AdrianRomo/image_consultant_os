import { WardrobeSheet } from "@/components/atelier/WardrobeSheet";

export const metadata = { title: "Wardrobe" };

export default function Page() {
  return (
    <main id="main" className="mx-auto max-w-[1600px] px-[var(--gutter)] pb-24 pt-32 sm:pt-40">
      <WardrobeSheet />
    </main>
  );
}
