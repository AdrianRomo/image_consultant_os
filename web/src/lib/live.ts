import { connection } from "next/server";
import { client, clientSlug } from "./fixture.ts";
import { listRecommendations } from "./store.ts";
import { toClientView, type ClientView } from "./share.ts";

/* Recommendations as they are right now. The store lives in server memory and changes between requests, so any
   page that reads it must be rendered per request, never prerendered at build: `connection()` says so. */
export async function liveRecommendations() {
  await connection();
  return listRecommendations();
}

/* The client's view for a link, or null when the link is not one. The slug is checked BEFORE any record is read,
   here and not only in a layout: Next renders a page and its layouts side by side, so a page that ignored its
   slug would still put a client's data into the response of a link that is then answered with 404. */
export async function liveClientView(slug: string): Promise<ClientView | null> {
  if (slug !== clientSlug) return null;
  await connection();
  return toClientView(client, listRecommendations());
}
