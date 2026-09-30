import test, { beforeEach } from "node:test";
import assert from "node:assert/strict";
import { client } from "./fixture.ts";
import { listRecommendations, move, resetStore } from "./store.ts";
import { toClientView } from "./share.ts";

beforeEach(() => resetStore());
const seen = () => toClientView(client, listRecommendations()).recommendations.map((r) => r.id);
const at = (id: string) => listRecommendations().find((r) => r.id === id)!;

test("the store starts as the fixture, and what it returns cannot be used to change it", () => {
  const list = listRecommendations();
  assert.deepEqual(list.map((r) => r.id), client.recommendations.map((r) => r.id));
  list[0].title = "tampered";
  list[0].visibility = "consultant";
  assert.equal(at("rec-1").title, client.recommendations[0].title);
  assert.equal(at("rec-1").visibility, "client");
});

test("a recommendation moves from review to approved to shared, and only then does the client see it", () => {
  assert.deepEqual(seen(), ["rec-1", "rec-4"]);
  let r = move("rec-3", "approve", { status: "Review", visibility: "consultant" });
  assert.ok(r.ok);
  assert.deepEqual(seen(), ["rec-1", "rec-4"], "approving alone must not share it");
  r = move("rec-3", "share", { status: "Approved", visibility: "consultant" });
  assert.ok(r.ok);
  assert.deepEqual(seen(), ["rec-1", "rec-3", "rec-4"]); // High first, then the Medium ones in their own order
  assert.deepEqual(at("rec-3").events.slice(-2), [
    { on: "2026-03-14", kind: "status", to: "Approved" },
    { on: "2026-03-14", kind: "visibility", to: "client" },
  ]);
});

test("withdrawing a shared recommendation takes it out of the client view at once", () => {
  assert.ok(move("rec-1", "unshare", { status: "Approved", visibility: "client" }).ok);
  assert.deepEqual(seen(), ["rec-4"]);
});

test("a draft can be submitted but never shared", () => {
  const share = move("rec-5", "share", { status: "Draft", visibility: "consultant" });
  assert.deepEqual(share.ok, false);
  assert.equal(!share.ok && share.reason, "not-allowed");
  assert.ok(move("rec-5", "submit", { status: "Draft", visibility: "consultant" }).ok);
  assert.ok(!seen().includes("rec-5"));
});

test("a stale request is refused and returns the current record", () => {
  assert.ok(move("rec-3", "approve", { status: "Review", visibility: "consultant" }).ok); // tab one
  const second = move("rec-3", "return", { status: "Review", visibility: "consultant" }); // tab two, out of date
  assert.equal(second.ok, false);
  assert.equal(!second.ok && second.reason, "stale");
  assert.equal(!second.ok && second.recommendation?.status, "Approved");
  assert.equal(at("rec-3").status, "Approved", "the stale request must change nothing");
});

test("an unknown recommendation is not found", () => {
  const r = move("rec-99", "approve", { status: "Review", visibility: "consultant" });
  assert.equal(!r.ok && r.reason, "not-found");
});

test("resetStore returns to the fixture", () => {
  move("rec-1", "unshare", { status: "Approved", visibility: "client" });
  resetStore();
  assert.equal(at("rec-1").visibility, "client");
});
