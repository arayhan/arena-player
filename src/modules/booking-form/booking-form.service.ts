import { z } from "zod";

import { isTimeSlot, TIME_SLOTS } from "@/domain/slots";
import { SLOT_STATUSES } from "@/domain/status";
import { apiClient } from "@/services/api-client";
import type { AvailabilityRow } from "@/utils/slot-display";

import type { BookingFormValues } from "./booking-form.schema";

/**
 * The availability GET, again — and the duplication is the rule working, not a
 * miss. `/` fetches the same endpoint from `home.service.ts` with native fetch
 * and a hand-written contract check, because zod costs 63.2KB gzip and the
 * landing page cannot spend it. Feature modules never import each other, so
 * this route reads the same endpoint through its own transport.
 *
 * ZOD IS ALREADY PAID FOR HERE. `/booking` loads it for the form schema, so
 * validating the response costs four lines instead of twenty, and the nine-entry
 * contract is checked rather than assumed: a nine-entry response that quietly
 * becomes eight renders as a missing row and nothing else.
 */
const availabilitySchema = z
  .array(
    z.object({
      slot: z.string().refine(isTimeSlot),
      status: z.enum(SLOT_STATUSES),
    }),
  )
  .length(TIME_SLOTS.length);

export async function fetchAvailability(
  date: string,
  signal?: AbortSignal,
): Promise<AvailabilityRow[]> {
  const response = await apiClient.get("/availability", { params: { date }, signal });

  // 400 is the documented answer for a date outside the window. It arrives as
  // an ordinary response because the instance never throws below 500, so it has
  // to be turned into one here or a malformed body would reach `parse`.
  if (response.status !== 200) {
    throw new Error(`availability request failed: ${response.status}`);
  }

  return availabilitySchema.parse(response.data) as AvailabilityRow[];
}

/** The 201 body. */
export interface BookingCreated {
  id: string;
  status: "pending";
}

/**
 * Everything the UI must tell apart. **409 and 429 are not interchangeable** —
 * showing the 409 copy to a rate-limited visitor tells them their slot was
 * taken when it was not.
 */
export type BookingOutcome =
  | { kind: "created"; booking: BookingCreated }
  | { kind: "slot_taken" }
  | { kind: "rate_limited" }
  | { kind: "validation_failed"; fields: Record<string, string> }
  | { kind: "server_error" };

/**
 * POST the booking.
 *
 * NO STATUS IS AN EXCEPTION HERE. The axios instance sets
 * `validateStatus: s => s < 500`, so 409, 429 and 400 all arrive as ordinary
 * responses and are mapped below. That is deliberate: turning them into throws
 * loses the response body, and the 400 body carries the `fields` map the form
 * needs to mark the right input.
 *
 * The field names are the contract from architecture.md. `slots`, not `time` —
 * `time` is the QUERY PARAM a human admin types into WhatsApp; `slots` is the
 * wire name matching TIME_SLOTS and the `time_slot` column.
 *
 * ONE FIELD PER SLOT, REPEATED, rather than a comma-joined string. `FormData`
 * carries repeated keys natively and the server reads them with `getAll`, so
 * nothing has to agree on a separator — and a separator is exactly where a slot
 * label containing " - " would have gone wrong.
 */
export async function createBooking(
  date: string,
  values: BookingFormValues,
): Promise<BookingOutcome> {
  const body = new FormData();
  body.append("date", date);
  for (const slot of values.slots) body.append("slots", slot);
  body.append("teamName", values.teamName);
  body.append("phone", values.phone);
  body.append("notes", values.notes ?? "");
  // Present and empty. The server distinguishes "absent" from "empty".
  body.append("website", values.website);
  if (values.proof) body.append("proof", values.proof);

  const response = await apiClient.post("/bookings", body);

  switch (response.status) {
    case 201:
      return { kind: "created", booking: response.data as BookingCreated };
    case 409:
      // The slot went between page load and submit. Nothing was wrong with
      // what they filled in — offer another slot, do not blame the form.
      return { kind: "slot_taken" };
    case 429:
      return { kind: "rate_limited" };
    case 400:
      return {
        kind: "validation_failed",
        fields: (response.data?.fields ?? {}) as Record<string, string>,
      };
    default:
      return { kind: "server_error" };
  }
}
