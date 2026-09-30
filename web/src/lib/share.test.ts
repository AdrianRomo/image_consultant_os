import test from "node:test";
import assert from "node:assert/strict";
import { client } from "./fixture.ts";
import type { Recommendation, Status, Visibility } from "./fixture.ts";
import { isShared, shareCounts, toClientView } from "./share.ts";
import { studioClients } from "./atelier.ts";

const view = (recs: readonly Recommendation[] = client.recommendations) => toClientView(client, recs);
const withState = (r: Recommendation, status: Status, visibility: Visibility): Recommendation => ({ ...r, status, visibility });

test("the client sees exactly the recommendations that are approved and shared, by priority", () => {
  const v = view();
  assert.deepEqual(v.recommendations.map((r) => r.id), ["rec-1", "rec-4"]);
});

test("only Approved and client-visible together are ever shown, for every combination", () => {
  for (const status of ["Draft", "Review", "Approved"] as Status[]) {
    for (const visibility of ["consultant", "client"] as Visibility[]) {
      const shown = view([withState(client.recommendations[0], status, visibility)]).recommendations.length;
      assert.equal(shown, status === "Approved" && visibility === "client" ? 1 : 0, `${status}/${visibility}`);
    }
  }
});

test("a corrupt record (client-visible but still a draft) is not shown either", () => {
  assert.equal(isShared({ status: "Draft", visibility: "client" }), false);
  assert.equal(view([withState(client.recommendations[0], "Draft", "client")]).recommendations.length, 0);
});

test("the view is built from a whitelist: no field of a record can leak by being added to it", () => {
  const rec = { ...withState(client.recommendations[0], "Approved", "client"), secretScribble: "SENTINEL-NEW-FIELD" } as Recommendation;
  const v = view([rec]);
  assert.deepEqual(Object.keys(v).sort(), ["first", "name", "perception", "recommendations", "sharedOn", "words"]);
  assert.deepEqual(Object.keys(v.recommendations[0]).sort(), ["forAudience", "id", "next", "number", "priority", "serves", "title", "why"]);
  assert.ok(!JSON.stringify(v).includes("SENTINEL-NEW-FIELD"));
});

test("nothing private appears anywhere in the serialised view, even with every recommendation shared", () => {
  // Worst case for the boundary: the consultant approved and shared everything.
  const all = client.recommendations.map((r) => withState(r, "Approved", "client"));
  const json = JSON.stringify(view(all));
  const forbidden: [string, string][] = [
    ...client.recommendations.filter((r) => r.privateNote).map((r): [string, string] => [`private note of ${r.id}`, r.privateNote!]),
    ["session notes", client.session.notes.slice(0, 40)],
    ["a session decision", client.session.decisions[0]],
    ["a follow-up", client.session.followUps[0]],
    ["the draft action plan", client.actionPlan.items[0]],
    ["an earlier version's wording", client.recommendations[0].earlier![0].title],
    ["an observation's detail", client.observations[1].detail],
    ["an audience note", client.audiences[0].note],
    ["her role", client.role],
    ...studioClients.filter((c) => c.slug !== "marisol").map((c): [string, string] => [`another client (${c.name})`, c.name]),
  ];
  for (const [what, text] of forbidden) assert.ok(!json.includes(text), `the client view contains ${what}`);
});

test("the client's numbering is contiguous, so a gap can never reveal a hidden recommendation", () => {
  // rec-1 and rec-4 are shared; rec-2 and rec-3 between them in the consultant's list are not.
  assert.deepEqual(view().recommendations.map((r) => r.number), [1, 2]);
});

test("the audience is named, not identified, and a recommendation for everyone has none", () => {
  const v = view();
  assert.equal(v.recommendations[0].forAudience, "The board");
  assert.equal(v.recommendations[1].forAudience, undefined); // rec-4 has no audience
});

test("sharedOn is the most recent share; with nothing shared there is no date and no recommendations", () => {
  assert.equal(view().sharedOn, "2026-03-13");
  const none = view(client.recommendations.map((r) => withState(r, "Approved", "consultant")));
  assert.equal(none.sharedOn, undefined);
  assert.deepEqual(none.recommendations, []);
});

test("counts for the preview bar are numbers only", () => {
  assert.deepEqual(shareCounts(client.recommendations), { shown: 2, held: 3 });
});
