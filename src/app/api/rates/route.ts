import { isWithinBookingWindow } from "@/domain/dates";
import { rateCard } from "@/server/rates";

/**
 * `GET /api/rates?date=YYYY-MM-DD` — the rate card for one booking date.
 *
 * ITS OWN ENDPOINT, AND THAT IS HARD RULE 2 MADE STRUCTURAL. The landing page
 * renders no number of any kind and `/booking` is the exception; `/` fetches
 * availability, so keeping the prices out of THAT payload means the landing
 * page never receives a figure it could accidentally render. A `price` field
 * on the availability rows would have worked identically today and left the
 * rule depending on somebody remembering it.
 *
 * `date` GAINED 2026-08-17, mirroring `GET /api/availability`'s contract —
 * weekday, weekend, and public-holiday hours price differently, so the rate
 * card is no longer a single flat list. Same 400 on missing/malformed/
 * out-of-window as availability.
 *
 * **Prices are integers in rupiah**; formatting is the client's job, so a
 * currency decision is never made in two places.
 *
 * CACHED FOR A DAY at the edge, per date. Rates change about once a year,
 * and once resolved for a given date the answer doesn't depend on the clock
 * the way availability does.
 */
export async function GET(request: Request): Promise<Response> {
  const date = new URL(request.url).searchParams.get("date");

  if (!date || !isWithinBookingWindow(date)) {
    return Response.json({ error: "invalid_date" }, { status: 400 });
  }

  return Response.json(await rateCard(date), {
    headers: { "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800" },
  });
}
