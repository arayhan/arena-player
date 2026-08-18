import { isWithinBookingWindow } from "@/domain/dates";
import { availabilityFor } from "@/server/availability";

/**
 * `GET /api/availability?date=YYYY-MM-DD` — live Supabase availability query.
 *
 * Reads active bookings (`bookings` with status pending/confirmed) and administrative
 * slot blocks (`slot_blocks`) from Supabase Postgres.
 */
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request): Promise<Response> {
  const date = new URL(request.url).searchParams.get("date");

  if (!date || !isWithinBookingWindow(date)) {
    return Response.json({ error: "invalid_date" }, { status: 400 });
  }

  const availability = await availabilityFor(date);
  return Response.json(availability);
}
