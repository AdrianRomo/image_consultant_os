import type { Audience, Observation, Recommendation } from "./fixture";
import type { Lang } from "./copy";

// Sample content for /design-lab. Both languages carry a normal and a deliberately long version, so the
// patterns are judged against text that will actually arrive, not against the tidy fixture.
type Sample = {
  audience: Audience;
  observation: Observation;
  observation2: Observation;
  longObservation: Observation;
  rec: Recommendation;
  rec2: Recommendation;
  longRec: Recommendation;
  longName: string;
};

export const labContent: Record<Lang, Sample> = {
  en: {
    audience: { id: "a", name: "The board", note: "" },
    observation: {
      id: "s1", area: "Visual", title: "Soft tailoring dilutes authority", marker: { x: 0, y: 0 },
      detail: "Unstructured shoulder and low-contrast neutrals blur the silhouette on camera and in a boardroom.", noted: "Session 1 · 5 March",
    },
    observation2: {
      id: "s3", area: "Nonverbal", title: "Hands retreat when challenged", marker: { x: 0, y: 0 },
      detail: "When questioned, hands move out of view and pace quickens; the warmth of the opening is lost.", noted: "Session 2 · 12 March",
    },
    longObservation: {
      id: "s2", area: "Nonverbal", title: "Her hands retreat and her pace quickens whenever a director interrupts, and the warmth of her opening is lost", marker: { x: 0, y: 0 },
      detail: "When questioned, her hands move out of view, her pace rises and the first sentence of every answer becomes a qualification. The composure she shows in the opening minutes is the version the board should see throughout.", noted: "Session 2 · 12 March, mock board Q&A",
    },
    rec: {
      id: "r1", title: "Structured jacket in deep olive or ink", observationId: "s1", audienceId: "a", priority: "High", status: "Approved", serves: "Decisive",
      rationale: "Adds shoulder line and contrast to signal command without hardening her manner.", nextStep: "Two fittings booked before the March board meeting.",
    },
    rec2: {
      id: "r3", title: "Pause, then answer with open hands", observationId: "s3", audienceId: "a", priority: "Medium", status: "Draft", serves: "Decisive",
      rationale: "A one-breath pause plus visible hands keeps composure and reads as confidence.", nextStep: "Rehearse three challenge questions on camera, week 3.",
    },
    longRec: {
      id: "r2", title: "Replace the unstructured grey cardigan with a jacket built through the shoulder, in deep olive or ink, for every board appearance this quarter", observationId: "s2", audienceId: "a", priority: "Medium", status: "Draft", serves: "Decisive",
      rationale: "On camera the current layer collapses at the shoulder and reads as a softer, lower-status silhouette than the room expects from the person presenting the restructure. The jacket restores the line without changing her manner.",
      nextStep: "Two fittings booked before the March board meeting; confirm the tailor’s availability and the fabric swatches with Marisol by Friday.",
    },
    longName: "María de los Ángeles Fernández-Villaverde y Ortiz de Zárate",
  },
  es: {
    audience: { id: "a", name: "El consejo", note: "" },
    observation: {
      id: "s1", area: "Visual", title: "La ropa sin estructura diluye la autoridad", marker: { x: 0, y: 0 },
      detail: "Un hombro sin estructura y unos neutros de bajo contraste desdibujan la silueta ante la cámara y en la sala de juntas.", noted: "Sesión 1 · 5 de marzo",
    },
    observation2: {
      id: "s3", area: "Nonverbal", title: "Las manos se esconden ante el reto", marker: { x: 0, y: 0 },
      detail: "Al ser cuestionada, las manos salen de plano y el ritmo se acelera; se pierde la calidez de la apertura.", noted: "Sesión 2 · 12 de marzo",
    },
    longObservation: {
      id: "s2", area: "Nonverbal", title: "Sus manos se esconden y su ritmo se acelera cada vez que un consejero la interrumpe, y se pierde la calidez de su apertura", marker: { x: 0, y: 0 },
      detail: "Cuando la cuestionan, las manos salen de plano, el ritmo sube y la primera frase de cada respuesta se convierte en una salvedad. La serenidad que muestra en los primeros minutos es la versión que el consejo debería ver siempre.", noted: "Sesión 2 · 12 de marzo, simulacro de junta",
    },
    rec: {
      id: "r1", title: "Chaqueta estructurada en verde oliva profundo o azul tinta", observationId: "s1", audienceId: "a", priority: "High", status: "Approved", serves: "Decidida",
      rationale: "Aporta línea de hombro y contraste para transmitir mando sin endurecer su manera de ser.", nextStep: "Dos pruebas reservadas antes de la reunión del consejo de marzo.",
    },
    rec2: {
      id: "r3", title: "Pausa y respuesta con las manos abiertas", observationId: "s3", audienceId: "a", priority: "Medium", status: "Draft", serves: "Decidida",
      rationale: "Una pausa de un respiro y las manos a la vista mantienen la serenidad y transmiten confianza.", nextStep: "Ensayar tres preguntas difíciles ante la cámara, semana 3.",
    },
    longRec: {
      id: "r2", title: "Sustituir la rebeca gris sin estructura por una chaqueta con hombro definido, en verde oliva profundo o azul tinta, para todas las intervenciones ante el consejo de este trimestre", observationId: "s2", audienceId: "a", priority: "Medium", status: "Draft", serves: "Decidida",
      rationale: "Ante la cámara, la prenda actual se hunde en el hombro y transmite una silueta más blanda y de menor rango que la que la sala espera de quien presenta la reestructuración. La chaqueta recupera la línea sin cambiar su manera de ser.",
      nextStep: "Dos pruebas reservadas antes de la reunión del consejo de marzo; confirmar con Marisol la disponibilidad del sastre y las muestras de tejido antes del viernes.",
    },
    longName: "María de los Ángeles Fernández-Villaverde y Ortiz de Zárate",
  },
};
