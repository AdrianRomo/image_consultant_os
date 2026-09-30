import test from "node:test";
import assert from "node:assert/strict";
import { client } from "./fixture.ts";
import type { Recommendation, Status, Visibility } from "./fixture.ts";
import { apply, available, canApply, currentVersion, isConsistent, rules, sortByPriority, WorkflowError, type Action } from "./workflow.ts";

const statuses: Status[] = ["Draft", "Review", "Approved"];
const visibilities: Visibility[] = ["consultant", "client"];
const actions = Object.keys(rules) as Action[];
const base = client.recommendations[0];
const rec = (status: Status, visibility: Visibility): Recommendation => ({ ...base, status, visibility, events: [] });
const key = (r: Pick<Recommendation, "status" | "visibility">) => `${r.status}/${r.visibility}`;

// The whole table, written out, so a change to the rules has to change a test.
const valid: Record<string, Action[]> = {
  "Draft/consultant": ["submit"],
  "Review/consultant": ["approve", "return"],
  "Approved/consultant": ["share", "reopen"],
  "Approved/client": ["unshare"],
};
// States that must never exist (a client can see something not yet approved). Nothing moves them forward;
// they can only be withdrawn.
const corrupt: Record<string, Action[]> = {
  "Draft/client": ["unshare"],
  "Review/client": ["unshare"],
};
const allowed = { ...valid, ...corrupt };

test("each state offers exactly the actions in the table, primary action first", () => {
  for (const [state, expected] of Object.entries(allowed)) {
    const [status, visibility] = state.split("/") as [Status, Visibility];
    assert.deepEqual(available(rec(status, visibility)), expected, state);
  }
});

test("every action is refused everywhere the table does not allow it", () => {
  for (const s of statuses) for (const v of visibilities) for (const a of actions) {
    const ok = (allowed[`${s}/${v}`] ?? []).includes(a);
    assert.equal(canApply(rec(s, v), a), ok, `${a} on ${s}/${v}`);
    if (!ok) assert.throws(() => apply(rec(s, v), a, "2026-03-14"), WorkflowError, `${a} on ${s}/${v}`);
  }
});

test("no sequence of actions can make a Draft or Review recommendation client-visible", () => {
  // Breadth-first over every state reachable from a new draft.
  const seen = new Set<string>();
  const queue: Recommendation[] = [rec("Draft", "consultant")];
  while (queue.length) {
    const r = queue.shift()!;
    if (seen.has(key(r))) continue;
    seen.add(key(r));
    assert.ok(isConsistent(r), `${key(r)} is reachable and inconsistent`);
    for (const a of available(r)) queue.push(apply(r, a, "2026-03-14"));
  }
  assert.deepEqual([...seen].sort(), Object.keys(valid).sort());
});

test("a corrupt record can only be withdrawn, and withdrawing it repairs it", () => {
  for (const [status, visibility] of [["Draft", "client"], ["Review", "client"]] as [Status, Visibility][]) {
    const bad = rec(status, visibility);
    assert.equal(isConsistent(bad), false);
    assert.deepEqual(available(bad), ["unshare"]);
    assert.ok(isConsistent(apply(bad, "unshare", "2026-03-14")));
  }
});

test("a shared recommendation must be withdrawn before it can be reopened", () => {
  const shared = rec("Approved", "client");
  assert.equal(canApply(shared, "reopen"), false);
  assert.throws(() => apply(shared, "reopen", "2026-03-14"), WorkflowError);
  const withdrawn = apply(shared, "unshare", "2026-03-14");
  assert.equal(withdrawn.visibility, "consultant");
  assert.equal(apply(withdrawn, "reopen", "2026-03-14").status, "Review");
});

test("the full journey records each change with its date and leaves the input untouched", () => {
  const start = rec("Draft", "consultant");
  const frozen = structuredClone(start);
  let r = apply(start, "submit", "2026-03-14");
  r = apply(r, "approve", "2026-03-15");
  r = apply(r, "share", "2026-03-16");
  assert.deepEqual(start, frozen, "the original was mutated");
  assert.deepEqual(r.events, [
    { on: "2026-03-14", kind: "status", to: "Review" },
    { on: "2026-03-15", kind: "status", to: "Approved" },
    { on: "2026-03-16", kind: "visibility", to: "client" },
  ]);
  assert.deepEqual([r.status, r.visibility], ["Approved", "client"]);
});

test("returning to draft and resubmitting is allowed", () => {
  const r = apply(apply(rec("Review", "consultant"), "return", "2026-03-14"), "submit", "2026-03-14");
  assert.equal(r.status, "Review");
});

test("the fixture starts in valid states and shows every stage and both visibilities", () => {
  const states = new Set(client.recommendations.map(key));
  for (const r of client.recommendations) assert.ok(isConsistent(r), r.id);
  assert.deepEqual([...states].sort(), Object.keys(valid).sort());
});

test("the recorded events of the fixture agree with each recommendation's current state", () => {
  for (const r of client.recommendations) {
    const lastStatus = [...r.events].reverse().find((e) => e.kind === "status");
    const lastVisibility = [...r.events].reverse().find((e) => e.kind === "visibility");
    assert.equal(lastStatus?.to, r.status, `${r.id} status`);
    assert.equal(lastVisibility?.to ?? "consultant", r.visibility, `${r.id} visibility`);
  }
});

test("priority sorting is stable and puts High first", () => {
  const sorted = sortByPriority(client.recommendations);
  assert.deepEqual(sorted.map((r) => r.priority), ["High", "High", "Medium", "Medium", "Medium"]);
  assert.deepEqual(sorted.filter((r) => r.priority === "Medium").map((r) => r.id), ["rec-3", "rec-4", "rec-5"]);
});

test("version numbers count the earlier wording", () => {
  assert.equal(currentVersion({}), 1);
  assert.equal(currentVersion(client.recommendations[0]), 2);
});
