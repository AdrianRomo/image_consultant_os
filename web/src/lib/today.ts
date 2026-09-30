// "Today in the studio": what is in front of the consultant, derived from records that already exist.
// Nothing here is invented and nothing is a count with no decision attached: it is upcoming work, the things
// waiting on her judgement, and the single next thing worth doing.
import type { Appointment } from "./atelier.ts";
import { daysBetween } from "./clock.ts";
import type { Recommendation } from "./fixture.ts";
import { sortByPriority } from "./workflow.ts";

export type ClientRef = { slug: string; name: string; status?: "Analysis ready" };

export type Waiting =
  | { kind: "recommendation"; id: string; title: string; client: string; slug: string; priority: Recommendation["priority"]; href: string }
  // A client-level status with no dossier to open yet: shown as information, never as a link.
  | { kind: "analysis"; client: string; slug: string };

export type UpcomingItem = Appointment & { inDays: number; href?: string };

export type NextAction =
  | { kind: "review"; recommendationId: string; title: string; client: string; href: string }
  | { kind: "prepare"; what: string; who: string; inDays: number; href?: string };

export type Today = {
  date: string;
  upcoming: UpcomingItem[];
  waiting: Waiting[];
  drafts: number; // still being written; not waiting on a decision
  next: NextAction | null;
};

/**
 * The next action, by one rule that is easy to state to the consultant:
 * 1. a recommendation waiting on her decision, highest priority first;
 * 2. otherwise, preparing for the nearest appointment;
 * 3. otherwise, nothing: the studio says so.
 */
export function studioToday(input: {
  today: string;
  clients: readonly ClientRef[];
  appointments: readonly Appointment[];
  /** Live recommendations of the one client whose dossier is built. */
  recommendations: readonly Recommendation[];
  client: { slug: string; name: string };
}): Today {
  const { today, clients, appointments, recommendations, client } = input;
  const first = (n: string) => n.split(" ")[0];

  const upcoming = appointments
    .map((a) => ({ ...a, inDays: daysBetween(today, a.on), href: a.slug ? `/clients/${a.slug}` : undefined }))
    .filter((a) => a.inDays >= 0)
    .sort((a, b) => a.inDays - b.inDays);

  const reviewing = sortByPriority(recommendations.filter((r) => r.status === "Review"));
  const waiting: Waiting[] = [
    ...reviewing.map((r) => ({
      kind: "recommendation" as const, id: r.id, title: r.title, client: first(client.name), slug: client.slug,
      priority: r.priority, href: `/clients/${client.slug}#rec-${r.id}`,
    })),
    ...clients
      .filter((c) => c.status === "Analysis ready")
      .map((c) => ({ kind: "analysis" as const, client: first(c.name), slug: c.slug })),
  ];

  let next: NextAction | null = null;
  const top = reviewing[0];
  if (top) next = { kind: "review", recommendationId: top.id, title: top.title, client: first(client.name), href: `/clients/${client.slug}#rec-${top.id}` };
  else if (upcoming[0]) next = { kind: "prepare", what: upcoming[0].what, who: first(upcoming[0].who), inDays: upcoming[0].inDays, href: upcoming[0].href };

  return { date: today, upcoming, waiting, drafts: recommendations.filter((r) => r.status === "Draft").length, next };
}
