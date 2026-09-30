// The prototype's only mutable state: the recommendations of the one client whose dossier is built.
//
// This is an in-memory store, on purpose. There is no database yet (plan §5: the Django API and its privacy
// gate come after the design decision), so a change lives as long as the server process and returns to the
// fixture when the server restarts. It sits on `globalThis` so every route and every Server Action in one
// process sees the same copy, including under hot reload. Only server code may import this file; the client
// bundle receives the result of a query, never the store.
//
// The interface is the one a real database would need: list, and one guarded move. `move` refuses when the
// caller's idea of the current state is out of date, so two open tabs cannot silently overwrite each other.
import { client } from "./fixture.ts";
import type { Recommendation, Status, Visibility } from "./fixture.ts";
import { STUDIO_TODAY } from "./clock.ts";
import { apply, canApply, isConsistent, type Action } from "./workflow.ts";

type Store = { recommendations: Recommendation[] };
const KEY = Symbol.for("icos.recommendations");
const seed = (): Store => ({ recommendations: structuredClone(client.recommendations) });
const store = (): Store => {
  const g = globalThis as unknown as Record<symbol, Store | undefined>;
  return (g[KEY] ??= seed());
};

/** Copies, so a caller can never change the store by changing what it was given. */
export const listRecommendations = (): Recommendation[] => structuredClone(store().recommendations);

export type Move =
  | { ok: true; recommendation: Recommendation }
  | { ok: false; reason: "not-found" | "stale" | "not-allowed"; recommendation?: Recommendation };

export function move(id: string, action: Action, expected: { status: Status; visibility: Visibility }, on: string = STUDIO_TODAY): Move {
  const list = store().recommendations;
  const i = list.findIndex((r) => r.id === id);
  if (i < 0) return { ok: false, reason: "not-found" };
  const current = list[i];
  if (current.status !== expected.status || current.visibility !== expected.visibility) {
    return { ok: false, reason: "stale", recommendation: structuredClone(current) };
  }
  if (!canApply(current, action)) return { ok: false, reason: "not-allowed", recommendation: structuredClone(current) };
  const next = apply(current, action, on);
  if (!isConsistent(next)) return { ok: false, reason: "not-allowed", recommendation: structuredClone(current) };
  list[i] = next;
  return { ok: true, recommendation: structuredClone(next) };
}

/** Back to the fixture. For tests and for a demo reset. */
export const resetStore = () => { (globalThis as unknown as Record<symbol, Store | undefined>)[KEY] = seed(); };
