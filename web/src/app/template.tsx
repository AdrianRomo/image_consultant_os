"use client";
import { usePathname } from "next/navigation";

const chapters: [string, string, string][] = [
  ["/clients", "01", "Clients"],
  ["/wardrobe", "02", "Wardrobe"],
  ["/looks", "03", "Looks"],
];

// A quiet chapter numeral between the main sections. Ignores input (pointer-events: none),
// never appears between ordinary in-page actions, and is skipped for reduced motion via CSS.
export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const ch = chapters.find(([p]) => pathname.startsWith(p));
  return (
    <>
      {ch && (
        <div className="page-curtain" aria-hidden key={ch[0]}>
          <div>
            <p className="numeral text-5xl text-warm">{ch[1]}</p>
            <p className="label mt-3">{ch[2]}</p>
          </div>
        </div>
      )}
      <div className={ch ? "page-enter" : ""}>{children}</div>
    </>
  );
}
