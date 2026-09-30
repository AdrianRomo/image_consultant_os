// Fully fictional, synthetic client data. No real person is represented.

export type Audience = { id: string; name: string; note: string };
export type Observation = {
  id: string;
  area: "Visual" | "Verbal" | "Nonverbal" | "Digital";
  title: string;
  detail: string;
  // Position of the portrait marker, in % of the 4:5 portrait frame.
  marker: { x: number; y: number };
  // Consultant attribution: when and where this was noted.
  noted: string;
};
export type Recommendation = {
  id: string;
  title: string;
  rationale: string;
  observationId: string;
  audienceId?: string;
  priority: "High" | "Medium" | "Low";
  status: "Approved" | "Draft";
  nextStep: string;
  // Which part of the desired perception this serves.
  serves: string;
};
export type ClientProfile = {
  name: string;
  role: string;
  location: string;
  engagement: string;
  desiredPerception: string;
  // How she reads today, and how she wants to read. The difference is the engagement.
  traits: { now: string[]; wanted: string[] };
  // Her own words, from intake. Synthetic.
  inHerWords: { quote: string; source: string };
  audiences: Audience[];
  observations: Observation[];
  recommendations: Recommendation[];
  session: { date: string; title: string; notes: string; decisions: string[]; followUps: string[] };
  actionPlan: { status: "Draft" | "Published"; items: string[] };
};

export const client: ClientProfile = {
  name: "Marisol Vega Ortiz",
  role: "Chief Operating Officer, Northwind Logistics (fictional)",
  location: "Madrid",
  engagement: "Executive presence · 8 weeks",
  desiredPerception:
    "Decisive and warm. Someone the board trusts with hard calls and the team trusts to hear them out.",
  traits: { now: ["Composed", "Warm"], wanted: ["Decisive", "Warm"] },
  inHerWords: {
    quote: "I don’t need to be more intimidating. I need them to stop asking whether I’m sure.",
    source: "Intake conversation, 3 March",
  },
  audiences: [
    {
      id: "aud-board",
      name: "The board",
      note: "Seven directors, quarterly. Wants clarity, composure and evidence of command.",
    },
    {
      id: "aud-team",
      name: "Regional leadership team",
      note: "Twelve managers, weekly. Wants approachability without losing authority.",
    },
  ],
  observations: [
    {
      id: "obs-1",
      area: "Visual",
      title: "Soft tailoring dilutes authority",
      detail:
        "Unstructured shoulder and low-contrast neutrals blur the silhouette on camera and in a boardroom.",
      marker: { x: 50, y: 42 },
      noted: "Session 1 · 5 March",
    },
    {
      id: "obs-2",
      area: "Nonverbal",
      title: "Hands retreat when challenged",
      detail:
        "When questioned, hands move out of view and pace quickens; the warmth of the opening is lost.",
      marker: { x: 38, y: 68 },
      noted: "Session 2 · 12 March",
    },
    {
      id: "obs-3",
      area: "Digital",
      title: "Profile photo reads as junior",
      detail:
        "Cropped snapshot, flat light, and a headline that lists tasks rather than scope of responsibility.",
      marker: { x: 52, y: 20 },
      noted: "Session 1 · 5 March",
    },
  ],
  recommendations: [
    {
      id: "rec-1",
      title: "Structured jacket in deep olive or ink",
      rationale: "Adds shoulder line and contrast to signal command without hardening her manner.",
      observationId: "obs-1",
      audienceId: "aud-board",
      priority: "High",
      status: "Approved",
      nextStep: "Two fittings booked before the March board meeting.",
      serves: "Decisive",
    },
    {
      id: "rec-2",
      title: "Pause, then answer with open hands",
      rationale: "A one-breath pause plus visible hands keeps composure and reads as confidence.",
      observationId: "obs-2",
      audienceId: "aud-board",
      priority: "High",
      status: "Approved",
      nextStep: "Rehearse three challenge questions on camera, week 3.",
      serves: "Decisive",
    },
    {
      id: "rec-3",
      title: "Lead team updates with a personal opening line",
      rationale: "Keeps the warmth she already has and sets the tone before decisions are delivered.",
      observationId: "obs-2",
      audienceId: "aud-team",
      priority: "Medium",
      status: "Draft",
      nextStep: "Draft three opening lines for review.",
      serves: "Warm",
    },
    {
      id: "rec-4",
      title: "New portrait and scope-led headline",
      rationale: "Aligns the first digital impression with the role she holds today.",
      observationId: "obs-3",
      priority: "Medium",
      status: "Approved",
      nextStep: "Photographer shortlist by Friday.",
      serves: "Decisive",
    },
  ],
  session: {
    date: "12 March 2026",
    title: "Session 2 · Presence under challenge",
    notes:
      "Mock board Q&A recorded with consent for review only. Strongest moment: her opening on the logistics restructure. Weakest: the response to the CFO's cost question, where pace rose and gestures disappeared. She was receptive and asked for a written cue card.",
    decisions: ["Prioritise wardrobe structure over colour change", "Rehearse challenge responses weekly"],
    followUps: ["Send cue card by Monday", "Confirm fitting dates", "Review headline draft"],
  },
  actionPlan: {
    status: "Draft",
    items: [
      "Wardrobe: structured jacket, two fittings",
      "Delivery: pause and open hands, weekly rehearsal",
      "Digital: new portrait, scope-led headline",
    ],
  },
};

export const recById = (id: string) => client.recommendations.find((r) => r.id === id);
export const obsById = (id: string) => client.observations.find((o) => o.id === id);
export const audById = (id?: string) => client.audiences.find((a) => a.id === id);
