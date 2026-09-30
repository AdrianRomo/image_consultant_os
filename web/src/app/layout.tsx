import type { Metadata } from "next";
import { Playfair_Display, Cormorant_Garamond, Bricolage_Grotesque, Inter } from "next/font/google";
import "./globals.css";
import { SiteNav } from "@/components/atelier/SiteNav";
import { CursorLabel } from "@/components/atelier/CursorLabel";
import { CommandPalette } from "@/components/atelier/CommandPalette";

const playfair = Playfair_Display({ variable: "--font-playfair", subsets: ["latin"] });
const cormorant = Cormorant_Garamond({ variable: "--font-cormorant", subsets: ["latin"], weight: ["300", "400", "500", "600"], style: ["normal", "italic"] });
const bricolage = Bricolage_Grotesque({ variable: "--font-bricolage", subsets: ["latin"] });
const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });

export const metadata: Metadata = {
  title: { default: "Image Consultant OS", template: "%s · Image Consultant OS" },
  description: "A private atelier for personal image consulting. Prototype on synthetic data.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${cormorant.variable} ${bricolage.variable} ${inter.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
      </head>
      <body className="min-h-full flex flex-col">
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[80] focus:bg-ink focus:px-3 focus:py-2 focus:text-ivory">Skip to content</a>
        <SiteNav />
        {children}
        <CommandPalette />
        <CursorLabel />
      </body>
    </html>
  );
}
