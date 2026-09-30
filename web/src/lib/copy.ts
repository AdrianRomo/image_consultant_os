// Copy for the reusable dossier patterns, centralised so the product can be read in Spanish or English.
// The pilot ships in one language (plan §4: choose from her clients); these patterns already take a
// dictionary so Spanish lengths are exercised in /design-lab rather than discovered late.
//
// Two rules for the words below, because they were chosen to be told apart at a glance:
//   * WORKFLOW (status) is where a recommendation is in the consultant's process: draft, awaiting review, approved.
//   * VISIBILITY is who can see it: "consultant only" or "shared with <client>".
// "Audience" always means the people the client wants to influence (the board, the team), never visibility.
import type { Action } from "./workflow.ts";

export type Lang = "en" | "es";
export type Msg = { title: string; detail?: string };

export const copy = {
  en: {
    lang: "en" as Lang,
    // Domain enums stay stable keys; what people read comes from here.
    areas: { Visual: "Visual", Verbal: "Verbal", Nonverbal: "Nonverbal", Digital: "Digital" },
    priority: { High: "High priority", Medium: "Medium priority", Low: "Low priority" },
    forAudience: (n: string) => `For ${n}`,
    forEvery: "For every audience",
    next: "Next",
    why: "Why",
    because: "Because I noticed",
    serves: "Serves her perception as",
    interpretation: "Interpretation",
    noted: "Noted",
    seeRecommend: "See what I recommend ↓",
    observation: (i: number, t: string) => `Observation ${i}: ${t}`,

    // Workflow and visibility
    status: { Draft: "Draft", Review: "Awaiting review", Approved: "Approved" },
    visibility: { consultant: "Consultant only", client: (n: string) => `Shared with ${n}` },
    stateLine: {
      Draft: "Still being written. Only you can see it.",
      Review: "Ready for your decision. Only you can see it.",
      Approved: (n: string) => `Approved. ${n} cannot see it yet.`,
      Shared: (n: string) => `Approved and shared. ${n} can see the recommendation, why, and the next step.`,
    },
    actions: {
      submit: { label: "Send for review", effect: "Marks it ready for your decision. Nothing is shared." },
      approve: { label: "Approve", effect: "Approving does not share it. Sharing is a separate step." },
      return: { label: "Return to draft", effect: "" },
      reopen: { label: "Reopen for review", effect: "" },
      share: { label: (n: string) => `Share with ${n}`, effect: (n: string) => `${n} will see the recommendation, why, and the next step. Nothing from your private notes.` },
      unshare: { label: "Stop sharing", effect: (n: string) => `${n} will no longer see it.` },
    } satisfies Record<Action, { label: string | ((n: string) => string); effect: string | ((n: string) => string) }>,
    // Feedback is a short title and, where it helps, one sentence. Titles stay short: they sit in a status label.
    done: {
      submit: (): Msg => ({ title: "Sent for review" }),
      approve: (n: string): Msg => ({ title: "Approved", detail: `Not shared with ${n}.` }),
      return: (): Msg => ({ title: "Back in draft" }),
      reopen: (): Msg => ({ title: "Reopened for review" }),
      share: (n: string): Msg => ({ title: `Shared with ${n}` }),
      unshare: (n: string): Msg => ({ title: "No longer shared", detail: `${n} can no longer see it.` }),
    },
    errors: {
      stale: { title: "Changed elsewhere", detail: "This recommendation changed in another window. It now shows its current state." } as Msg,
      failed: { title: "Not saved", detail: "That did not save. Nothing changed. Try again." } as Msg,
    },
    confirmShare: {
      title: (n: string) => `Share this with ${n}?`,
      body: (n: string) => `${n} will see the recommendation, why, and the next step. Your private notes, other drafts and anything not yet shared stay hidden.`,
      confirm: "Share",
      cancel: "Not yet",
    },
    privateNote: "Private note",
    privateNoteHint: (n: string) => `Never shown to ${n}`,
    previewLink: (n: string) => `Preview what ${n} sees`,
    record: "Record",
    events: {
      status: { Draft: "Drafted", Review: "Sent for review", Approved: "Approved" },
      visibility: { consultant: "Withdrawn", client: (n: string) => `Shared with ${n}` },
    },
    summary: {
      counts: (draft: number, review: number, approved: number) =>
        [draft && `${draft} in draft`, review && `${review} awaiting review`, approved && `${approved} approved`].filter(Boolean).join(" · "),
      shared: (n: number, who: string) => (n === 0 ? `Nothing shared with ${who} yet` : `${n} shared with ${who}`),
    },
    emptyAudience: (n: string) => `Nothing for ${n} yet.`,
    emptyAudienceBody: "Recommendations appear here as you write them.",

    // Earlier and current wording
    compare: {
      open: (v: number) => `Compare with version ${v}`,
      close: "Hide the comparison",
      earlier: "Earlier",
      current: "Current",
      version: (n: number) => `Version ${n}`,
      fields: { title: "Recommendation", why: "Why", next: "Next step" },
      unchanged: "Unchanged",
      note: "This compares how the advice was worded. It says nothing about results.",
    },

    // The page a client opens
    share: {
      preparedFor: "Prepared for you by your image consultant",
      sharedOn: (d: string) => `Shared ${d}`,
      working: "What we are working towards",
      words: "In your words",
      heading: "What I recommend, and why",
      why: "Why",
      next: "Next",
      helps: "Helps you come across as",
      priorityLabel: "Priority",
      emptyTitle: "Nothing has been shared with you yet.",
      emptyBody: "When your consultant shares a recommendation, it will appear here.",
      footnote: "This page shows only what your consultant has chosen to share with you.",
    },
  },
  es: {
    lang: "es" as Lang,
    areas: { Visual: "Visual", Verbal: "Verbal", Nonverbal: "No verbal", Digital: "Digital" },
    priority: { High: "Prioridad alta", Medium: "Prioridad media", Low: "Prioridad baja" },
    forAudience: (n: string) => `Para ${n}`,
    forEvery: "Para todas las audiencias",
    next: "Siguiente paso",
    why: "Por qué",
    because: "Porque observé",
    serves: "Refuerza su percepción como",
    interpretation: "Interpretación",
    noted: "Anotado",
    seeRecommend: "Ver lo que recomiendo ↓",
    observation: (i: number, t: string) => `Observación ${i}: ${t}`,

    status: { Draft: "Borrador", Review: "Pendiente de revisión", Approved: "Aprobada" },
    visibility: { consultant: "Solo consultora", client: (n: string) => `Compartida con ${n}` },
    stateLine: {
      Draft: "Aún en redacción. Solo tú puedes verla.",
      Review: "Lista para tu decisión. Solo tú puedes verla.",
      Approved: (n: string) => `Aprobada. ${n} todavía no puede verla.`,
      Shared: (n: string) => `Aprobada y compartida. ${n} puede ver la recomendación, el porqué y el siguiente paso.`,
    },
    actions: {
      submit: { label: "Enviar a revisión", effect: "La marca como lista para tu decisión. No se comparte nada." },
      approve: { label: "Aprobar", effect: "Aprobar no la comparte. Compartir es un paso aparte." },
      return: { label: "Volver a borrador", effect: "" },
      reopen: { label: "Reabrir para revisión", effect: "" },
      share: { label: (n: string) => `Compartir con ${n}`, effect: (n: string) => `${n} verá la recomendación, el porqué y el siguiente paso. Nada de tus notas privadas.` },
      unshare: { label: "Dejar de compartir", effect: (n: string) => `${n} dejará de verla.` },
    } satisfies Record<Action, { label: string | ((n: string) => string); effect: string | ((n: string) => string) }>,
    done: {
      submit: (): Msg => ({ title: "Enviada a revisión" }),
      approve: (n: string): Msg => ({ title: "Aprobada", detail: `No compartida con ${n}.` }),
      return: (): Msg => ({ title: "De nuevo en borrador" }),
      reopen: (): Msg => ({ title: "Reabierta para revisión" }),
      share: (n: string): Msg => ({ title: `Compartida con ${n}` }),
      unshare: (n: string): Msg => ({ title: "Ya no se comparte", detail: `${n} ya no puede verla.` }),
    },
    errors: {
      stale: { title: "Cambió en otro lugar", detail: "Esta recomendación cambió en otra ventana. Ahora muestra su estado actual." } as Msg,
      failed: { title: "No se guardó", detail: "No se guardó. No ha cambiado nada. Inténtalo de nuevo." } as Msg,
    },
    confirmShare: {
      title: (n: string) => `¿Compartir esto con ${n}?`,
      body: (n: string) => `${n} verá la recomendación, el porqué y el siguiente paso. Tus notas privadas, otros borradores y todo lo que aún no hayas compartido siguen ocultos.`,
      confirm: "Compartir",
      cancel: "Todavía no",
    },
    privateNote: "Nota privada",
    privateNoteHint: (n: string) => `Nunca se muestra a ${n}`,
    previewLink: (n: string) => `Ver lo que ve ${n}`,
    record: "Historial",
    events: {
      status: { Draft: "Redactada", Review: "Enviada a revisión", Approved: "Aprobada" },
      visibility: { consultant: "Retirada", client: (n: string) => `Compartida con ${n}` },
    },
    summary: {
      counts: (draft: number, review: number, approved: number) =>
        [draft && `${draft} en borrador`, review && `${review} pendiente${review === 1 ? "" : "s"} de revisión`, approved && `${approved} aprobada${approved === 1 ? "" : "s"}`].filter(Boolean).join(" · "),
      shared: (n: number, who: string) => (n === 0 ? `Nada compartido con ${who} todavía` : `${n} compartida${n === 1 ? "" : "s"} con ${who}`),
    },
    emptyAudience: (n: string) => `Aún no hay nada para ${n}.`,
    emptyAudienceBody: "Las recomendaciones aparecen aquí a medida que las redactas.",

    compare: {
      open: (v: number) => `Comparar con la versión ${v}`,
      close: "Ocultar la comparación",
      earlier: "Anterior",
      current: "Actual",
      version: (n: number) => `Versión ${n}`,
      fields: { title: "Recomendación", why: "Por qué", next: "Siguiente paso" },
      unchanged: "Sin cambios",
      note: "Esto compara cómo estaba redactado el consejo. No dice nada sobre resultados.",
    },

    share: {
      preparedFor: "Preparado para ti por tu consultora de imagen",
      sharedOn: (d: string) => `Compartido el ${d}`,
      working: "Hacia dónde trabajamos",
      words: "En tus palabras",
      heading: "Lo que recomiendo, y por qué",
      why: "Por qué",
      next: "Siguiente paso",
      helps: "Te ayuda a proyectarte como",
      priorityLabel: "Prioridad",
      emptyTitle: "Todavía no se ha compartido nada contigo.",
      emptyBody: "Cuando tu consultora comparta una recomendación, aparecerá aquí.",
      footnote: "Esta página muestra solo lo que tu consultora ha decidido compartir contigo.",
    },
  },
} as const;
export type Copy = (typeof copy)[Lang];

/** Some entries are a string, others a function of the client's first name. */
export const say = <A extends unknown[]>(v: string | ((...a: A) => string), ...a: A) => (typeof v === "function" ? v(...a) : v);
