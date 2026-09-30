// The studio's fictional calendar. Every date in the fixture (sessions, fittings, drafts) sits in March 2026,
// so "today" is fixed there too; reading the real clock would make "in 3 days" mean nothing. Swap
// STUDIO_TODAY for the real date when the fixture is replaced by real records.
//
// Dates are ISO days ("2026-03-14"). Formatting is by hand, not Intl, so the server and the browser can
// never disagree by a comma and cause a hydration mismatch.
import type { Lang } from "./copy.ts";

export const STUDIO_TODAY = "2026-03-14";

const parts = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  return { y, m, d };
};
const utc = (iso: string) => { const { y, m, d } = parts(iso); return Date.UTC(y, m - 1, d); };

/** Whole days from `from` to `to`; negative when `to` is earlier. */
export const daysBetween = (from: string, to: string) => Math.round((utc(to) - utc(from)) / 86_400_000);

const months = {
  en: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
  es: ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"],
} as const;
const weekdays = {
  en: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
  es: ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"],
} as const;

/** "14 March", "Sat 14 March", "Saturday 14 March"; Spanish: "14 de marzo", "sáb 14 de marzo". */
export function formatDay(iso: string, { weekday = false, lang = "en" }: { weekday?: false | "short" | "long"; lang?: Lang } = {}) {
  const { y, m, d } = parts(iso);
  const day = lang === "es" ? `${d} de ${months.es[m - 1]}` : `${d} ${months.en[m - 1]}`;
  if (!weekday) return day;
  const name = weekdays[lang][new Date(Date.UTC(y, m - 1, d)).getUTCDay()];
  return `${weekday === "short" ? name.slice(0, 3) : name} ${day}`;
}

/** "today", "tomorrow", "in 3 days", "2 days ago". */
export function relativeDay(days: number, lang: Lang = "en") {
  if (lang === "es") {
    if (days === 0) return "hoy";
    if (days === 1) return "mañana";
    if (days === -1) return "ayer";
    return days > 0 ? `dentro de ${days} días` : `hace ${-days} días`;
  }
  if (days === 0) return "today";
  if (days === 1) return "tomorrow";
  if (days === -1) return "yesterday";
  return days > 0 ? `in ${days} days` : `${-days} days ago`;
}
