import Link from "next/link";

const concepts = [
  { href: "/concepts/a", label: "Concept 1", blurb: "Client Profile, version one" },
  { href: "/concepts/b", label: "Concept 2", blurb: "Client Profile, version two" },
  { href: "/concepts/c", label: "Concept 3", blurb: "Client Profile, version three" },
];

// Labels are deliberately neutral so the consultant can react without a favorite implied.
export default function Index() {
  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">Client Profile — three concepts</h1>
      <p className="mt-3 text-neutral-600">
        Identical fictional content and tasks in each. Synthetic data only. Open each on desktop and phone width.
      </p>
      <ul className="mt-10 divide-y divide-neutral-200 border-y border-neutral-200">
        {concepts.map((c) => (
          <li key={c.href}>
            <Link href={c.href} className="flex items-baseline justify-between py-5 hover:bg-neutral-50">
              <span className="text-lg font-medium">{c.label}</span>
              <span className="text-sm text-neutral-500">{c.blurb} →</span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
