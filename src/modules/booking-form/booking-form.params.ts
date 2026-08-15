import { isBookingDateString, isPastSlot, isWithinBookingWindow } from "@/domain/dates";
import { isTimeSlot, type TimeSlot } from "@/domain/slots";

/**
 * The four states `/booking` can be entered in.
 *
 * `/` LINKS HERE AS OF 2026-08-15, AND THAT DID NOT MAKE ANY OF THIS
 * OPTIONAL. The order section's hand-off band now navigates to
 * `/booking?date=…&time=…` with both params built from state it already
 * validated, so the main path arrives `valid`. The second entry is unchanged:
 * a link pasted into WhatsApp by the admin, or sent by the bot later. That one
 * still arrives malformed or stale routinely — a link sitting in a chat has no
 * deploy and no rollback, and every link pasted before 2026-08-15 carries a
 * 2-hour slot string that is no longer a member of TIME_SLOTS and correctly
 * reads `unusable`. A blank form or a crash is still the one response this
 * route may never give.
 *
 * THE QUERY PARAM IS `time`, THE POST FIELD IS `slot`. That is deliberate and
 * documented in architecture.md so nobody harmonises them: `time` is the word a
 * human admin would guess when typing the link, `slot` is the wire name
 * matching TIME_SLOTS and the `time_slot` column. Renaming the param breaks
 * every link already sitting in a chat — the one place in this system with no
 * deploy and no rollback.
 */
export type BookingParams =
  | { kind: "valid"; date: string; slot: TimeSlot }
  /** Absent, unparseable, or not a real slot. */
  | { kind: "unusable" }
  /** Well-formed but past — the link has expired. Said plainly, not hidden. */
  | { kind: "expired"; date: string; slot: TimeSlot };

/**
 * `now` is injected so this is testable at any hour. A function that reads the
 * clock internally passes at 09.00 and fails at 21.00 on somebody else's
 * machine — the same trap `partitionSlots` avoids for the same reason.
 */
export function readBookingParams(
  date: string | null | undefined,
  time: string | null | undefined,
  now: Date = new Date(),
): BookingParams {
  if (!date || !time) return { kind: "unusable" };
  if (!isBookingDateString(date)) return { kind: "unusable" };

  // Validated against TIME_SLOTS, never a regex. `uniq_active_slot` compares
  // time_slot as TEXT, so "18.00-20.00" is a DIFFERENT slot to the database
  // than "18.00 - 20.00" — a near-miss format that passed a regex would book
  // the same hour twice with no error anywhere.
  if (!isTimeSlot(time)) return { kind: "unusable" };

  if (!isWithinBookingWindow(date, now)) return { kind: "expired", date, slot: time };
  if (isPastSlot(date, time, now)) return { kind: "expired", date, slot: time };

  // NOTE THE STATE THAT IS DELIBERATELY MISSING: "slot no longer available".
  // This function does not ask. Checking availability here and refusing to
  // render the form would be a check-then-insert race — two visitors both pass
  // the check, both submit, and the database is the only thing that can
  // actually arbitrate. The 409 on submit is the authority; see hard rule 1.
  return { kind: "valid", date, slot: time };
}
