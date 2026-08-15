import { rateCard } from "@/server/rates";

/**
 * `GET /api/rates` — nine `{ slot, price }` entries, canonical order.
 *
 * ITS OWN ENDPOINT, AND THAT IS HARD RULE 2 MADE STRUCTURAL. The landing page
 * renders no number of any kind and `/booking` is the exception; `/` fetches
 * availability, so keeping the prices out of THAT payload means the landing page
 * never receives a figure it could accidentally render. A `price` field on the
 * availability rows would have worked identically today and left the rule
 * depending on somebody remembering it.
 *
 * The figures are the client's own, supplied 2026-08-15 — see
 * `src/server/rates.ts` for the two brackets whose edges were confirmed rather
 * than guessed. **Prices are integers in rupiah**; formatting is the client's
 * job, so a currency decision never has to be made in two places.
 *
 * CACHED FOR A DAY at the edge. Rates change about once a year, and unlike
 * availability nothing here depends on the clock. `no-store` for the browser is
 * deliberate too: a visitor who reloads after the client changes a price should
 * see the new one without clearing anything.
 */
export async function GET(): Promise<Response> {
  return Response.json(rateCard(), {
    headers: { "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800" },
  });
}
