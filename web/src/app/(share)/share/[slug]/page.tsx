import { notFound } from "next/navigation";
import { ClientPresentation } from "@/components/share/ClientPresentation";
import { liveClientView } from "@/lib/live";

/* What the client opens. The page is fed by `toClientView` alone: a whitelist of fields of the recommendations
   that are approved and shared. It never receives a private note, a draft, a session note, another client or the
   consultant's chrome. The slug is checked before any data is read (lib/live.ts), and again in the layout beside
   this file, which is what makes an unknown link a 404 status. There is no login yet (plan §5). */
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const view = await liveClientView((await params).slug);
  if (!view) notFound();
  return <ClientPresentation view={view} />;
}
