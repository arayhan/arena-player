import type { TimeSlot } from "@/domain/slots";
import { apiClient } from "@/services/api-client";

import type { BookingFormValues } from "./booking-form.schema";

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
 * The field names are the contract from architecture.md. `slot`, not `time` —
 * `time` is the QUERY PARAM a human admin types into WhatsApp; `slot` is the
 * wire name matching TIME_SLOTS and the `time_slot` column.
 */
export async function createBooking(
  date: string,
  slot: TimeSlot,
  values: BookingFormValues,
): Promise<BookingOutcome> {
  const body = new FormData();
  body.append("date", date);
  body.append("slot", slot);
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
