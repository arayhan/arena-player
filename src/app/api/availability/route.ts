import { isWithinBookingWindow } from "@/domain/dates";
import { availabilityFor } from "@/server/availability";

/**
 * `GET /api/availability?date=YYYY-MM-DD` — the FIRM contract in
 * architecture.md, over the CLIENT'S REAL DATABASE as of 2026-08-17.
 *
 * The shape, the validation and the status vocabulary are unchanged from the
 * demo this replaced — `src/server/availability.ts` reads `bookings` and
 * `slot_blocks` from Supabase instead of generating a deterministic pattern.
 * `POST /api/bookings` is still a stub: `bookings.phone` is `NOT NULL` and
 * the phone field is hidden in the UI, which `docs/database.md` records as
 * blocking. A slot can now read `pending`/`booked` from a REAL row, but
 * nothing on this site can yet CREATE one.
 *
 * NOT CACHED, DELIBERATELY. Route handlers are uncached by default in this Next
 * and this one must stay that way: the response depends on the clock — today's
 * passed hours come back as `booked` — so a cached body would tell an evening
 * visitor the morning is still open. The 30s `s-maxage` the contract mentions
 * is still unapplied, alongside the lazy-expiry question architecture.md
 * records as unresolved.
 */
export async function GET(request: Request): Promise<Response> {
  const date = new URL(request.url).searchParams.get("date");

  if (!date || !isWithinBookingWindow(date)) {
    return Response.json({ error: "invalid_date" }, { status: 400 });
  }

  return Response.json(await availabilityFor(date));
}
