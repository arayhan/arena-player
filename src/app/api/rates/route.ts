import { isWithinBookingWindow } from "@/domain/dates";
import { rateCard } from "@/server/rates";

/**
 * `GET /api/rates?date=YYYY-MM-DD` — up to eighteen `{ slot, price }` entries,
 * canonical order. **Gained the `date` param on 2026-08-17** — the client's
 * real rate card prices weekday and weekend hours differently from 16.00
 * onward, so which price applies depends on which date is being booked. The
 * response SHAPE is unchanged from before that date; only the request is.
 *
 * ITS OWN ENDPOINT, AND THAT IS HARD RULE 2 MADE STRUCTURAL. The landing page
 * renders no number of any kind and `/booking` is the exception; `/` fetches
 * availability, so keeping the prices out of THAT payload means the landing page
 * never receives a figure it could accidentally render. A `price` field on the
 * availability rows would have worked identically today and left the rule
 * depending on somebody remembering it.
 *
 * The figures are the client's own, read live from `rate_card` — see
 * `src/server/rates.ts` for the weekday/weekend/holiday resolution. **Prices
 * are integers in rupiah**; formatting is the client's job, so a currency
 * decision never has to be made in two places.
 *
 * CACHED FOR A DAY at the edge, per unique `date` — a query string is part of
 * the cache key, so this stays correct even though the answer now varies by
 * date. Rates change about once a year and which weekday a date falls on
 * never changes at all, so a day's staleness costs nothing here the way it
 * would on the availability route.
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
