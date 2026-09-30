import test from "node:test";
import assert from "node:assert/strict";
import { client } from "./fixture.ts";
import { itemById, looks, looksWith, nearestPaletteColour, piecesOf, wardrobe, wornWith } from "./atelier.ts";

test("the looks a piece appears in are read from the looks themselves", () => {
  assert.deepEqual(looksWith("w-ink-blazer").map((l) => l.id), ["look-board", "look-camera"]);
  assert.deepEqual(looksWith("w-camel-coat"), []);
});

test("every piece of every look exists in the wardrobe, and the relation is symmetric", () => {
  for (const l of looks) for (const p of piecesOf(l.items)) {
    assert.ok(itemById(p.id), p.id);
    assert.ok(looksWith(p.id).some((x) => x.id === l.id), `${p.id} does not list ${l.id}`);
  }
  for (const l of looks) assert.equal(piecesOf(l.items).length, Object.keys(l.items).length, l.id);
});

test("the pieces of a look come in the order a person dresses", () => {
  assert.deepEqual(piecesOf(looks[0].items).map((p) => p.slot), ["outer", "top", "bottom", "shoes", "watch"]);
});

test("worn-with lists other pieces once, never the piece itself", () => {
  const w = wornWith("w-ink-blazer").map((p) => p.id);
  assert.ok(!w.includes("w-ink-blazer"));
  assert.equal(new Set(w).size, w.length);
  assert.ok(w.includes("w-ivory-shirt") && w.includes("w-rust-blouse"));
});

test("the nearest palette colour of a piece that has an exact match is that colour", () => {
  assert.equal(nearestPaletteColour(itemById("w-ink-blazer")!.color).id, "ink");
  assert.equal(nearestPaletteColour(itemById("w-olive-blazer")!.color).id, "olive");
  assert.equal(nearestPaletteColour(itemById("w-rust-blouse")!.color).id, "rust");
});

test("nearness follows how colours look, not their channel values", () => {
  // In plain RGB, cognac is closer to olive green than to rust; a colour consultant would never say so.
  const near = (id: string) => nearestPaletteColour(itemById(id)!.color).id;
  assert.equal(near("w-cognac-loafers"), "rust");
  assert.equal(near("w-tan-bag"), "camel");
  assert.equal(near("w-stone-trousers"), "oat");
  assert.equal(near("w-charcoal-knit"), "ink");
});

test("links from a piece to the advice point at records that exist", () => {
  const linked = wardrobe.filter((w) => w.rec || w.obs);
  assert.ok(linked.length >= 3);
  for (const w of linked) {
    if (w.rec) assert.ok(client.recommendations.some((r) => r.id === w.rec), `${w.id} -> ${w.rec}`);
    if (w.obs) assert.ok(client.observations.some((o) => o.id === w.obs), `${w.id} -> ${w.obs}`);
  }
});
