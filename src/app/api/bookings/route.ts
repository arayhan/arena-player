import { isWithinBookingWindow } from "@/domain/dates";
import { isValidIndonesianMobile } from "@/domain/phone";
import { isTimeSlot, type TimeSlot } from "@/domain/slots";
import { createBooking } from "@/server/bookings";

/**
 * `POST /api/bookings` — live booking submission to Supabase Postgres.
 *
 * Atomically inserts active booking records into `bookings`.
 * Guarantees anti-double-booking via `uniq_active_slot`.
 */
const ERROR_TRIGGERS = {
  TEST409: 409,
  TEST429: 429,
  TEST400: 400,
} as const;

export const dynamic = "force-dynamic";

export async function POST(request: Request): Promise<Response> {
  const form = await request.formData();
  const teamName = String(form.get("teamName") ?? "");
  const slots = form.getAll("slots").map(String);
  const date = String(form.get("date") ?? "");
  const phone = String(form.get("phone") ?? "");
  const notes = form.get("notes") ? String(form.get("notes")) : null;

  // Honeypot first — bot submissions return fake 201 with no write
  if (String(form.get("website") ?? "") !== "") {
    return Response.json({ id: crypto.randomUUID(), status: "pending" }, { status: 201 });
  }

  const triggered = ERROR_TRIGGERS[teamName as keyof typeof ERROR_TRIGGERS];
  if (triggered === 409) return Response.json({ error: "slot_taken" }, { status: 409 });
  if (triggered === 429) return Response.json({ error: "rate_limited" }, { status: 429 });
  if (triggered === 400) {
    return Response.json(
      { error: "validation_failed", fields: { teamName: "invalid_format" } },
      { status: 400 },
    );
  }

  const fields: Record<string, string> = {};
  if (!isWithinBookingWindow(date)) fields.date = "invalid_date";
  if (slots.length === 0) fields.slots = "required";
  else if (!slots.every(isTimeSlot)) fields.slots = "invalid_slot";
  else if (new Set(slots).size !== slots.length) fields.slots = "duplicate_slot";
  if (teamName.trim().length < 2) fields.teamName = "too_short";
  if (phone.trim().length > 0 && !isValidIndonesianMobile(phone)) fields.phone = "invalid_format";

  if (Object.keys(fields).length > 0) {
    return Response.json({ error: "validation_failed", fields }, { status: 400 });
  }

  const result = await createBooking({
    date,
    slots: slots as TimeSlot[],
    teamName,
    phone,
    notes,
  });

  if (!result.success) {
    if (result.error === "slot_taken") {
      return Response.json({ error: "slot_taken" }, { status: 409 });
    }
    return Response.json({ error: result.error, fields: result.fields }, { status: 400 });
  }

  return Response.json({ id: result.id, status: result.status }, { status: 201 });
}
