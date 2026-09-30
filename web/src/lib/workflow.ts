// How a recommendation moves. Two questions, kept apart:
//
//   status      Draft -> Review -> Approved     where it is in the consultant's own process
//   visibility  consultant | client             who can see it
//
// One rule ties them: a recommendation can be visible to the client only once it is Approved. Nothing here
// may ever produce a Draft or Review recommendation that the client can see, so every transition is checked
// against that, and `isConsistent` lets the store and the tests assert it.
import type { Recommendation, RecommendationEvent, Status, Visibility } from "./fixture.ts";

export type Action = "submit" | "approve" | "return" | "reopen" | "share" | "unshare";

type Rule = {
  needs: { status?: Status; visibility?: Visibility };
  sets: { status?: Status; visibility?: Visibility };
};

export const rules: Record<Action, Rule> = {
  submit: { needs: { status: "Draft" }, sets: { status: "Review" } },
  approve: { needs: { status: "Review" }, sets: { status: "Approved" } },
  return: { needs: { status: "Review" }, sets: { status: "Draft" } },
  // Reopening or sharing needs the recommendation to be private again or still private. A shared one must be
  // withdrawn first, on purpose: pulling something back from a client is never a side effect.
  reopen: { needs: { status: "Approved", visibility: "consultant" }, sets: { status: "Review" } },
  share: { needs: { status: "Approved", visibility: "consultant" }, sets: { visibility: "client" } },
  // Withdrawing needs only that the client can currently see it. That also makes it the repair for a record that
  // should never exist (client-visible but not Approved): it can always be pulled back, never pushed forward.
  unshare: { needs: { visibility: "client" }, sets: { visibility: "consultant" } },
};

export const isAction = (v: unknown): v is Action => typeof v === "string" && Object.hasOwn(rules, v);
export const isStatus = (v: unknown): v is Status => v === "Draft" || v === "Review" || v === "Approved";
export const isVisibility = (v: unknown): v is Visibility => v === "consultant" || v === "client";

type State = Pick<Recommendation, "status" | "visibility">;

/** The invariant. A client-visible recommendation must be Approved. */
export const isConsistent = (r: State) => r.visibility === "consultant" || r.status === "Approved";

export const canApply = (r: State, action: Action) => {
  if (!isConsistent(r) && action !== "unshare") return false; // never move a corrupt record forward
  const { needs } = rules[action];
  return (needs.status === undefined || r.status === needs.status) && (needs.visibility === undefined || r.visibility === needs.visibility);
};

// Primary action first: the one that moves the recommendation forward. `unshare` is last everywhere; it is only
// ever available when the client can see the recommendation.
const order: Record<Status, Action[]> = {
  Draft: ["submit", "unshare"],
  Review: ["approve", "return", "unshare"],
  Approved: ["share", "reopen", "unshare"],
};
export const available = (r: State): Action[] => order[r.status].filter((a) => canApply(r, a));

export class WorkflowError extends Error {
  constructor(public action: Action, public from: State) {
    super(`Cannot ${action} a recommendation that is ${from.status} and ${from.visibility}-visible`);
    this.name = "WorkflowError";
  }
}

/** Returns the recommendation after `action`, with the change recorded on `on` (an ISO day). Never mutates. */
export function apply(r: Recommendation, action: Action, on: string): Recommendation {
  if (!canApply(r, action)) throw new WorkflowError(action, r);
  const { sets } = rules[action];
  const events: RecommendationEvent[] = [...r.events];
  if (sets.status) events.push({ on, kind: "status", to: sets.status });
  if (sets.visibility) events.push({ on, kind: "visibility", to: sets.visibility });
  const next = { ...r, ...sets, events };
  if (!isConsistent(next)) throw new WorkflowError(action, r); // unreachable with the rules above; kept as a guard
  return next;
}

const priorityRank = { High: 0, Medium: 1, Low: 2 } as const;
/** High priority first; recommendations of equal priority keep their order. */
export const sortByPriority = <T extends Pick<Recommendation, "priority">>(recs: readonly T[]) =>
  [...recs].sort((a, b) => priorityRank[a.priority] - priorityRank[b.priority]);

/** Version number of the current wording: 1 until it has been revised. */
export const currentVersion = (r: Pick<Recommendation, "earlier">) => (r.earlier?.length ?? 0) + 1;
