import { isWithinBookingWindow } from "@/domain/dates";
import { availabilityFor } from "@/server/demo-availability";

/**
 * `GET /api/availability?date=YYYY-MM-DD` — the FIRM contract in
 * architecture.md, over DEMO DATA.
 *
 * WHAT IS REAL HERE AND WHAT IS NOT. The shape, the validation and the status
 * vocabulary are the contract Phase 4 must keep. The rows themselves are
 * generated: `src/server/demo-availability.ts` derives a deterministic pattern
 * from the date, because there is no database yet. **Nothing on this site can
 * take a real booking until that changes**, and a page that looks finished is
 * exactly why this comment is at the top of the file rather than in a doc.
 *
 * NOT CACHED, DELIBERATELY. Route handlers are uncached by default in this Next
 * and this one must stay that way: the response depends on the clock — today's
 * passed hours come back as `booked` — so a cached body would tell an evening
 * visitor the morning is still open. The 30s `s-maxage` the contract mentions
 * belongs to the Phase 4 route, alongside the lazy-expiry question
 * architecture.md records as unresolved.
 */
export async function GET(request: Request): Promise<Response> {
  const date = new URL(request.url).searchParams.get("date");

  if (!date || !isWithinBookingWindow(date)) {
    return Response.json({ error: "invalid_date" }, { status: 400 });
  }

  return Response.json(availabilityFor(date));
}
