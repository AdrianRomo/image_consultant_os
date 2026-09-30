// What a client can see, and nothing else.
//
// `toClientView` is the boundary. It receives the consultant's records and returns a NEW object built field by
// field from a whitelist: it never spreads a record, never copies "the rest", and never receives what a client
// must not see (private notes, session notes, the action-plan draft, other clients). A recommendation is
// included only when it is Approved AND shared with the client. Anything added to the fixture later is
// therefore private by default; to show it, add it here deliberately.
//
// Both /share/[slug] (what the client opens) and /clients/[slug]/preview (what the consultant checks) render
// this same object, so the preview cannot drift from the real thing.
import type { ClientProfile, Recommendation } from "./fixture.ts";
import { sortByPriority } from "./workflow.ts";

export type SharedRecommendation = {
  number: number; // the client's own numbering, contiguous, so a gap can never reveal a hidden one
  id: string;
  title: string;
  why: string;
  next: string;
  priority: Recommendation["priority"];
  forAudience?: string;
  serves: string;
};

export type ClientView = {
  name: string;
  first: string;
  perception: string;
  words: { quote: string; source: string };
  sharedOn?: string; // ISO day of the most recent thing the consultant shared
  recommendations: SharedRecommendation[];
};

/** Approved and shared. The one definition of "the client can see this". */
export const isShared = (r: Pick<Recommendation, "status" | "visibility">) => r.status === "Approved" && r.visibility === "client";

const sharedOnDate = (r: Recommendation) => {
  const shared = r.events.filter((e) => e.kind === "visibility" && e.to === "client").map((e) => e.on);
  return shared.length ? shared[shared.length - 1] : undefined;
};

export function toClientView(
  profile: Pick<ClientProfile, "name" | "desiredPerception" | "inHerWords" | "audiences">,
  recommendations: readonly Recommendation[],
): ClientView {
  const shared = sortByPriority(recommendations.filter(isShared));
  const dates = shared.map(sharedOnDate).filter((d): d is string => !!d).sort();
  return {
    name: profile.name,
    first: profile.name.split(" ")[0],
    perception: profile.desiredPerception,
    words: { quote: profile.inHerWords.quote, source: profile.inHerWords.source },
    sharedOn: dates.length ? dates[dates.length - 1] : undefined,
    recommendations: shared.map((r, i) => ({
      number: i + 1,
      id: r.id,
      title: r.title,
      why: r.rationale,
      next: r.nextStep,
      priority: r.priority,
      forAudience: profile.audiences.find((a) => a.id === r.audienceId)?.name,
      serves: r.serves,
    })),
  };
}

/** For the consultant's preview bar only: how many are shown and how many are held back. Counts, never titles. */
export const shareCounts = (recommendations: readonly Recommendation[]) => {
  const shown = recommendations.filter(isShared).length;
  return { shown, held: recommendations.length - shown };
};
