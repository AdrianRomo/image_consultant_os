import test from "node:test";
import assert from "node:assert/strict";
import { client } from "./fixture.ts";
import type { Recommendation, Status } from "./fixture.ts";
import { studioClients, upcoming } from "./atelier.ts";
import { STUDIO_TODAY, daysBetween, formatDay, relativeDay } from "./clock.ts";
import { studioToday } from "./today.ts";

const build = (recommendations: readonly Recommendation[] = client.recommendations, appointments = upcoming, today = STUDIO_TODAY) =>
  studioToday({ today, clients: studioClients, appointments, recommendations, client: { slug: "marisol", name: client.name } });
const inState = (status: Status) => client.recommendations.map((r) => ({ ...r, status }));

test("the next action is the recommendation waiting on a decision", () => {
  const t = build();
  assert.equal(t.next?.kind, "review");
  assert.deepEqual(t.next && t.next.kind === "review" && t.next.href, "/clients/marisol#rec-rec-3");
});

test("among several waiting, the highest priority comes first", () => {
  const recs = client.recommendations.map((r) => (r.id === "rec-1" || r.id === "rec-3" ? { ...r, status: "Review" as const } : r));
  const t = build(recs);
  assert.deepEqual(t.waiting.filter((w) => w.kind === "recommendation").map((w) => w.kind === "recommendation" && w.id), ["rec-1", "rec-3"]);
  assert.equal(t.next?.kind === "review" && t.next.recommendationId, "rec-1");
});

test("with nothing waiting, the next action is to prepare for the nearest appointment", () => {
  const t = build(inState("Approved"));
  assert.equal(t.next?.kind, "prepare");
  assert.deepEqual(t.next?.kind === "prepare" && [t.next.what, t.next.inDays, t.next.href], ["Fitting · structured jacket", 3, "/clients/marisol"]);
});

test("with nothing waiting and nothing booked, there is no next action", () => {
  assert.equal(build(inState("Approved"), []).next, null);
});

test("past appointments are dropped and the rest are in date order with days to go", () => {
  const t = build(client.recommendations, [...upcoming, { on: "2026-03-10", what: "Old", who: "X" }].reverse());
  assert.deepEqual(t.upcoming.map((u) => [u.on, u.inDays]), [["2026-03-17", 3], ["2026-03-19", 5], ["2026-03-23", 9]]);
});

test("an appointment links to a dossier only when one exists", () => {
  const [fitting, , colour] = build().upcoming;
  assert.equal(fitting.href, "/clients/marisol");
  assert.equal(colour.href, undefined);
});

test("a client-level 'analysis ready' is listed as information, never as a link", () => {
  const diego = build().waiting.find((w) => w.kind === "analysis");
  assert.ok(diego && !("href" in diego));
});

test("drafts are counted apart from what waits for a decision", () => {
  assert.equal(build().drafts, 1);
  assert.equal(build().waiting.filter((w) => w.kind === "recommendation").length, 1);
});

test("dates come from the studio's fictional calendar and format the same everywhere", () => {
  assert.equal(daysBetween("2026-03-14", "2026-03-17"), 3);
  assert.equal(daysBetween("2026-03-14", "2026-03-10"), -4);
  assert.equal(formatDay("2026-03-14"), "14 March");
  assert.equal(formatDay("2026-03-14", { weekday: "long" }), "Saturday 14 March");
  assert.equal(formatDay("2026-03-17", { weekday: "short" }), "Tue 17 March");
  assert.equal(formatDay("2026-03-14", { lang: "es", weekday: "long" }), "sábado 14 de marzo");
  assert.deepEqual([0, 1, 3, -2].map((d) => relativeDay(d)), ["today", "tomorrow", "in 3 days", "2 days ago"]);
  assert.deepEqual([0, 1, 3, -2].map((d) => relativeDay(d, "es")), ["hoy", "mañana", "dentro de 3 días", "hace 2 días"]);
});
