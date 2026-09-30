// Copy for the reusable dossier patterns, centralised so the product can be read in Spanish or English.
// The pilot ships in one language (plan §4: choose from her clients); these patterns already take a
// dictionary so Spanish lengths are exercised in /design-lab rather than discovered late.
export type Lang = "en" | "es";

export const copy = {
  en: {
    // Domain enums stay stable keys; what people read comes from here.
    areas: { Visual: "Visual", Verbal: "Verbal", Nonverbal: "Nonverbal", Digital: "Digital" },
    priority: { High: "High priority", Medium: "Medium priority", Low: "Low priority" },
    forAudience: (n: string) => `For ${n}`,
    forEvery: "For every audience",
    next: "Next",
    why: "Why",
    because: "Because I noticed",
    serves: "Serves her perception as",
    awaiting: "Awaiting review",
    approved: "Approved",
    interpretation: "Interpretation",
    noted: "Noted",
    seeRecommend: "See what I recommend ↓",
    observation: (i: number, t: string) => `Observation ${i}: ${t}`,
  },
  es: {
    areas: { Visual: "Visual", Verbal: "Verbal", Nonverbal: "No verbal", Digital: "Digital" },
    priority: { High: "Prioridad alta", Medium: "Prioridad media", Low: "Prioridad baja" },
    forAudience: (n: string) => `Para ${n}`,
    forEvery: "Para todas las audiencias",
    next: "Siguiente paso",
    why: "Por qué",
    because: "Porque observé",
    serves: "Refuerza su percepción como",
    awaiting: "Pendiente de revisión",
    approved: "Aprobada",
    interpretation: "Interpretación",
    noted: "Anotado",
    seeRecommend: "Ver lo que recomiendo ↓",
    observation: (i: number, t: string) => `Observación ${i}: ${t}`,
  },
} as const;
export type Copy = (typeof copy)[Lang];
