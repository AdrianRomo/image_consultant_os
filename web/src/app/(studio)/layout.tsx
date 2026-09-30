import type { ReactNode } from "react";
import { StudioChrome } from "@/components/atelier/StudioChrome";

export default function StudioLayout({ children }: { children: ReactNode }) {
  return <StudioChrome>{children}</StudioChrome>;
}
