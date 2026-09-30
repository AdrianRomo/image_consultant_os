import { ClientStory } from "@/components/atelier/ClientStory";
import { liveRecommendations } from "@/lib/live";

export const metadata = { title: "Marisol Vega Ortiz" };

export default async function Page() {
  return <ClientStory recommendations={await liveRecommendations()} />;
}
