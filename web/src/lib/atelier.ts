// Synthetic data for the atelier screens. Extends the Phase 1 fixture (fixture.ts).
// No real person, garment or brand is represented. The in-fiction "today" is 14 March 2026,
// two days after the fixture's session on 12 March.

export type Slot = "outer" | "top" | "bottom" | "shoes" | "bag" | "watch";
export type GarmentKind =
  | "blazer" | "coat" | "shirt" | "knit" | "cardigan" | "trousers" | "loafer" | "bag" | "watch";
export type Category = "Outerwear" | "Tops" | "Trousers" | "Shoes" | "Accessories";

export type WardrobeItem = {
  id: string;
  name: string;
  kind: GarmentKind;
  slot: Slot;
  category: Category;
  color: string;
  colorName: string;
  season: "Autumn / Winter" | "Spring / Summer" | "All year";
  structure: "high" | "medium" | "low";
  inPalette: boolean;
  worn: string; // last worn, plain language
  note: string; // consultant's one-liner
  // Composition on the wide contact sheet: 12-col grid position.
  layout: { row: number; col: number; span: number; mt: number; ratio: string; tilt?: number };
};

export const slots: { id: Slot; label: string }[] = [
  { id: "outer", label: "Outer layer" },
  { id: "top", label: "Top" },
  { id: "bottom", label: "Trousers" },
  { id: "shoes", label: "Shoes" },
  { id: "bag", label: "Bag" },
  { id: "watch", label: "Watch" },
];

export const wardrobe: WardrobeItem[] = [
  { id: "w-ink-blazer", name: "Ink structured blazer", kind: "blazer", slot: "outer", category: "Outerwear",
    color: "#232833", colorName: "Ink", season: "All year", structure: "high", inPalette: true,
    worn: "Worn 9 times", note: "The piece the board will remember. Keep the shoulder line.",
    layout: { row: 1, col: 1, span: 4, mt: 0, ratio: "4/5" } },
  { id: "w-rust-blouse", name: "Rust silk blouse", kind: "shirt", slot: "top", category: "Tops",
    color: "#a4532f", colorName: "Rust", season: "Autumn / Winter", structure: "medium", inPalette: true,
    worn: "Worn twice", note: "Warmth without softness. Wear under ink, not olive.",
    layout: { row: 1, col: 7, span: 3, mt: 5.5, ratio: "1/1", tilt: 1.5 } },
  { id: "w-steel-watch", name: "Steel field watch", kind: "watch", slot: "watch", category: "Accessories",
    color: "#b9b7b0", colorName: "Steel", season: "All year", structure: "high", inPalette: false,
    worn: "Daily", note: "Neutral, precise. It reads as intention when her hands are visible.",
    layout: { row: 1, col: 11, span: 2, mt: 1, ratio: "1/1", tilt: -2 } },

  { id: "w-stone-trousers", name: "Stone wide-leg trousers", kind: "trousers", slot: "bottom", category: "Trousers",
    color: "#b6a993", colorName: "Stone", season: "Spring / Summer", structure: "medium", inPalette: true,
    worn: "Worn 4 times", note: "Lightens the lower half so the jacket leads.",
    layout: { row: 2, col: 2, span: 3, mt: 3, ratio: "3/4" } },
  { id: "w-camel-coat", name: "Camel wrap coat", kind: "coat", slot: "outer", category: "Outerwear",
    color: "#b48a5f", colorName: "Camel", season: "Autumn / Winter", structure: "medium", inPalette: true,
    worn: "Worn 6 times", note: "Her warmest silhouette. Belt it, keep the lapel wide.",
    layout: { row: 2, col: 6, span: 5, mt: 0, ratio: "4/5" } },
  { id: "w-tan-bag", name: "Tan structured tote", kind: "bag", slot: "bag", category: "Accessories",
    color: "#94663c", colorName: "Tan", season: "All year", structure: "high", inPalette: true,
    worn: "Weekly", note: "A firm edge. Better than the slouchy one.",
    layout: { row: 2, col: 11, span: 2, mt: 7, ratio: "1/1", tilt: 2 } },

  { id: "w-ivory-shirt", name: "Ivory poplin shirt", kind: "shirt", slot: "top", category: "Tops",
    color: "#ece4d1", colorName: "Ivory", season: "All year", structure: "medium", inPalette: true,
    worn: "Worn 11 times", note: "The quiet workhorse. Crisp collar, sleeves pushed once.",
    layout: { row: 3, col: 1, span: 3, mt: 2.5, ratio: "1/1", tilt: -1.5 } },
  { id: "w-ink-trousers", name: "Ink tailored trousers", kind: "trousers", slot: "bottom", category: "Trousers",
    color: "#252a34", colorName: "Ink", season: "All year", structure: "high", inPalette: true,
    worn: "Worn 8 times", note: "Column line. Pairs with everything warm.",
    layout: { row: 3, col: 5, span: 3, mt: 6, ratio: "3/4" } },
  { id: "w-olive-blazer", name: "Olive wool blazer", kind: "blazer", slot: "outer", category: "Outerwear",
    color: "#5d6238", colorName: "Olive", season: "Autumn / Winter", structure: "high", inPalette: true,
    worn: "Worn 3 times", note: "Approachable authority. For the regional team.",
    layout: { row: 3, col: 9, span: 4, mt: 1, ratio: "4/5" } },

  { id: "w-cognac-loafers", name: "Cognac loafers", kind: "loafer", slot: "shoes", category: "Shoes",
    color: "#7b4a29", colorName: "Cognac", season: "All year", structure: "medium", inPalette: true,
    worn: "Weekly", note: "Warm ground for cool ink.",
    layout: { row: 4, col: 3, span: 3, mt: 1, ratio: "3/2" } },
  { id: "w-oat-knit", name: "Oat merino crewneck", kind: "knit", slot: "top", category: "Tops",
    color: "#cdb99a", colorName: "Oat", season: "Autumn / Winter", structure: "low", inPalette: true,
    worn: "Worn 5 times", note: "For team days. Soft on purpose, so pair it with structure.",
    layout: { row: 4, col: 7, span: 3, mt: 4.5, ratio: "1/1", tilt: 1 } },
  { id: "w-grey-cardigan", name: "Grey open cardigan", kind: "cardigan", slot: "top", category: "Tops",
    color: "#b3aea4", colorName: "Cool grey", season: "All year", structure: "low", inPalette: false,
    worn: "Worn 12 times", note: "Worn most, flatters least. The shoulder collapses on camera.",
    layout: { row: 4, col: 11, span: 2, mt: 0, ratio: "4/5", tilt: -1 } },
  { id: "w-charcoal-knit", name: "Charcoal fine knit", kind: "knit", slot: "top", category: "Tops",
    color: "#3d3b38", colorName: "Charcoal", season: "Autumn / Winter", structure: "low", inPalette: true,
    worn: "Worn 4 times", note: "A dark base that lets a rust scarf or watch speak.",
    layout: { row: 5, col: 2, span: 3, mt: 0, ratio: "1/1", tilt: -1 } },
];

export const itemById = (id: string) => wardrobe.find((w) => w.id === id);
export const categories: ("All" | Category)[] = ["All", "Outerwear", "Tops", "Trousers", "Shoes", "Accessories"];

// ---------------------------------------------------------------- Colour

export const season = {
  name: "Autumn",
  qualifier: "Soft",
  // Positions on a spectrum, not scores: each has two poles.
  measures: [
    { label: "Warmth", value: 4, low: "Cool", high: "Warm" },
    { label: "Contrast", value: 2, low: "Soft", high: "Sharp" },
    { label: "Saturation", value: 3, low: "Muted", high: "Rich" },
  ],
  colors: [
    { id: "olive", name: "Olive", hex: "#5d6238", role: "Anchor",
      note: "Reads as calm command. Best near the face when the room is warm-toned." },
    { id: "ink", name: "Ink", hex: "#232833", role: "Structure",
      note: "Deeper than black, kinder to her skin. Use for tailoring." },
    { id: "camel", name: "Camel", hex: "#b48a5f", role: "Warmth",
      note: "The colour of listening. Coats, bags, a belt." },
    { id: "rust", name: "Rust", hex: "#a4532f", role: "Accent",
      note: "One piece at a time. Silk, or something that catches light." },
    { id: "oat", name: "Oat", hex: "#cdb99a", role: "Ease",
      note: "Softens a hard silhouette. Knits and trousers." },
    { id: "ivory", name: "Ivory", hex: "#ece4d1", role: "Light",
      note: "Brightens the face without the coldness of optic white." },
  ],
  avoid: "Stark black, optic white, icy pastels",
};

// ---------------------------------------------------------------- Identity

export const identity = {
  archetype: "Modern Classic",
  signature: ["Structure", "Warmth", "Restraint"],
  statement: "Quiet authority.",
  subline: "Decisive without hardness. Warm without softness.",
};

export const silhouette = {
  principles: [
    { n: "i", title: "Build the shoulder.", body: "A defined shoulder line does the work her voice already does. It gives the eye a place to rest and reads as command before she speaks." },
    { n: "ii", title: "Soften the edges, not the frame.", body: "Warmth comes from fabric and colour, not from removing structure. Silk under tailoring; wool that drapes but holds." },
    { n: "iii", title: "One line, top to toe.", body: "A column of ink with one warm interruption. Fewer competing details, a clearer figure on camera." },
  ],
};

// ---------------------------------------------------------------- Clients / studio

export type StudioClient = {
  slug: string;
  name: string;
  initials: string;
  focus: string;
  last: string;
  status?: "Analysis ready" | "Draft to review";
  href?: string;
  hasPortrait: boolean;
};

export const studioClients: StudioClient[] = [
  { slug: "marisol", name: "Marisol Vega Ortiz", initials: "MV", focus: "Executive presence", last: "Last session · 2 days ago", status: "Draft to review", href: "/clients/marisol", hasPortrait: true },
  { slug: "lucia", name: "Lucía Herrera", initials: "LH", focus: "Wardrobe refinement", last: "Last session · 6 days ago", hasPortrait: false },
  { slug: "diego", name: "Diego Flores", initials: "DF", focus: "Personal branding", last: "Observations complete", status: "Analysis ready", hasPortrait: false },
];

export const upcoming = [
  { when: "Tue 17 March", what: "Fitting · structured jacket", who: "Marisol Vega Ortiz" },
  { when: "Thu 19 March", what: "Session 3 · Presence under challenge", who: "Marisol Vega Ortiz" },
  { when: "Mon 23 March", what: "Colour review", who: "Lucía Herrera" },
];

// ---------------------------------------------------------------- Looks

export type Look = {
  id: string;
  title: string;
  occasion: string;
  audienceNote: string;
  items: Partial<Record<Slot, string>>;
};

export const looks: Look[] = [
  { id: "look-board", title: "The board, Thursday", occasion: "Quarterly board meeting", audienceNote: "For seven directors who want composure.",
    items: { outer: "w-ink-blazer", top: "w-ivory-shirt", bottom: "w-ink-trousers", shoes: "w-cognac-loafers", watch: "w-steel-watch" } },
  { id: "look-team", title: "Regional team, Monday", occasion: "Weekly leadership call", audienceNote: "Approachable, still in charge.",
    items: { outer: "w-olive-blazer", top: "w-oat-knit", bottom: "w-stone-trousers", shoes: "w-cognac-loafers", bag: "w-tan-bag" } },
  { id: "look-camera", title: "On camera", occasion: "Investor call", audienceNote: "Shoulders and colour do everything.",
    items: { outer: "w-ink-blazer", top: "w-rust-blouse", watch: "w-steel-watch" } },
];

// Small, deterministic reading of a look. Used by the builder; not a score.
function luminance(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => v / 255);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function readLook(items: Partial<Record<Slot, string>>) {
  const chosen = (Object.values(items).map((id) => itemById(id!)).filter(Boolean)) as WardrobeItem[];
  const notes: string[] = [];
  if (chosen.length === 0) return { notes, inPalette: 0, total: 0 };
  const outer = items.outer ? itemById(items.outer) : undefined;
  const top = items.top ? itemById(items.top) : undefined;
  const bottom = items.bottom ? itemById(items.bottom) : undefined;

  if (outer?.structure === "high") notes.push("The shoulder is doing the work. Let the jacket lead.");
  else if (outer) notes.push("A softer outer layer. Keep the rest crisp so authority does not dissolve.");
  else if (top?.structure === "low") notes.push("Without structure at the shoulder, this reads gentle rather than commanding.");

  const outside = chosen.filter((c) => !c.inPalette && c.slot !== "watch");
  if (outside.length) notes.push(`The ${outside[0].name.toLowerCase()} sits outside her palette and will read cooler than the rest.`);
  else if (chosen.length >= 3) notes.push("Everything here belongs to her warm, soft palette.");

  if (top && bottom) {
    const d = Math.abs(luminance(top.color) - luminance(bottom.color));
    notes.push(d > 0.35 ? "Clear contrast between top and trousers. Confident, a little formal." : "Tonal between top and trousers. Quiet, and easy to hold together.");
  }
  return { notes: notes.slice(0, 3), inPalette: chosen.filter((c) => c.inPalette).length, total: chosen.length };
}

// ---------------------------------------------------------------- Consultation (scripted prototype)

export type Consultation = {
  id: string;
  prompt: string;
  items: Partial<Record<Slot, string>>;
  notes: string[];
  refinements: { id: string; label: string; swap: Partial<Record<Slot, string>>; note: string }[];
};

export const consultations: Consultation[] = [
  { id: "board", prompt: "Dinner with the board on Thursday evening",
    items: { outer: "w-ink-blazer", top: "w-ivory-shirt", bottom: "w-ink-trousers", shoes: "w-cognac-loafers", watch: "w-steel-watch" },
    notes: ["I would keep the silhouette structured and the palette warm.", "Let the jacket do most of the work."],
    refinements: [
      { id: "warmer", label: "Warmer", swap: { top: "w-rust-blouse" }, note: "The rust silk brings the warmth up. Keep everything else still." },
      { id: "softer", label: "Softer", swap: { outer: "w-olive-blazer" }, note: "Olive reads more approachable. Authority stays in the cut." },
    ] },
  { id: "team", prompt: "Presenting the restructure to the regional team",
    items: { outer: "w-olive-blazer", top: "w-oat-knit", bottom: "w-stone-trousers", shoes: "w-cognac-loafers", bag: "w-tan-bag" },
    notes: ["Approachable first, then decisive.", "Oat under olive is gentle. The tailoring keeps it honest."],
    refinements: [
      { id: "sharper", label: "Sharper", swap: { outer: "w-ink-blazer", bottom: "w-ink-trousers" }, note: "Ink and ink. Clearer, and a step more formal than the room may want." },
      { id: "lighter", label: "Lighter", swap: { top: "w-ivory-shirt" }, note: "A crisp shirt lifts the face and keeps the palette intact." },
    ] },
  { id: "camera", prompt: "Investor call, on camera",
    items: { outer: "w-ink-blazer", top: "w-rust-blouse", watch: "w-steel-watch" },
    notes: ["Only the top half will be seen. Spend everything there.", "Ink shoulder, one warm interruption, nothing else competing."],
    refinements: [
      { id: "quieter", label: "Quieter", swap: { top: "w-ivory-shirt" }, note: "Ivory against ink is calm and lights the face evenly." },
      { id: "warmer", label: "Warmer", swap: { outer: "w-camel-coat" }, note: "Camel is warmer but softer at the shoulder on camera. I would keep ink." },
    ] },
];

// ---------------------------------------------------------------- Colour helpers

export function shade(hex: string, amt: number) {
  const n = parseInt(hex.slice(1), 16);
  const f = (v: number) => Math.max(0, Math.min(255, Math.round(v + (amt < 0 ? v : 255 - v) * amt)));
  const r = f((n >> 16) & 255), g = f((n >> 8) & 255), b = f(n & 255);
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
}

// ---------------------------------------------------------------- Client dossier structure

// The client story is read in four movements. `sub` is the plain-language name a consultant
// would search for; the chapter title is the editorial one.
export const chapters = [
  { id: "identity", n: "01", label: "Identity", sub: "Client" },
  { id: "presence", n: "02", label: "Presence", sub: "Strategy" },
  { id: "assessment", n: "03", label: "Assessment", sub: "Observations" },
  { id: "opportunities", n: "04", label: "Opportunities", sub: "Recommendations" },
  { id: "colour", n: "05", label: "Colour", sub: "Palette" },
  { id: "silhouette", n: "06", label: "Silhouette", sub: "Line" },
  { id: "wardrobe", n: "07", label: "Wardrobe", sub: "Pieces" },
  { id: "looks", n: "08", label: "Looks", sub: "Occasions" },
  { id: "evolution", n: "09", label: "Evolution", sub: "Sessions and plan" },
] as const;
export type ChapterId = (typeof chapters)[number]["id"];

// Marker positions on the portrait, in % of the 4:5 frame of the "today" photograph. They are tuned to that
// photograph: obs-1 sits on the cardigan where it slips off the shoulder, obs-2 on the lower frame edge on
// purpose (her hands are out of view), obs-3 on the hair. Re-tune them when the photograph changes.
export const observationMarkers: Record<string, { x: number; y: number }> = {
  "obs-1": { x: 71, y: 56 },
  "obs-2": { x: 46, y: 95 },
  "obs-3": { x: 45, y: 17 },
};
