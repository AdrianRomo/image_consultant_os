"use server";
import { revalidatePath } from "next/cache";
import { move } from "@/lib/store";
import { isAction, isStatus, isVisibility, type Action } from "@/lib/workflow";

/* The one way a recommendation changes. A Server Action is a public POST endpoint, so nothing is trusted:
   every argument is validated, the caller says which state it believes the recommendation is in (a stale
   click is refused, never applied), and the return value is only what the page needs to say what happened.
   There is no login in this prototype, so anyone who can open the app can call this; see docs/DEPLOY.md. */
export type MoveResult = { ok: true } | { ok: false; reason: "stale" | "not-allowed" | "not-found" | "invalid" };

// Every route that shows a recommendation or what the client can see.
const affected = ["/", "/clients/marisol", "/clients/marisol/preview", "/share/marisol"];

export async function moveRecommendation(
  id: string, action: Action, expected: { status: string; visibility: string },
): Promise<MoveResult> {
  if (typeof id !== "string" || !isAction(action) || !isStatus(expected?.status) || !isVisibility(expected?.visibility)) {
    return { ok: false, reason: "invalid" };
  }
  const result = move(id, action, { status: expected.status, visibility: expected.visibility });
  // Also on a stale refusal: the page then re-renders with the state the store really has.
  for (const path of affected) revalidatePath(path);
  return result.ok ? { ok: true } : { ok: false, reason: result.reason };
}
