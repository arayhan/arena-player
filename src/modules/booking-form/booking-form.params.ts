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
  | {
      kind: "valid";
      date: string;
      /** Every hour from the link that is still bookable, canonical order. */
      slots: TimeSlot[];
      /**
       * Hours the link asked for that have already started. Empty on a fresh
       * link; non-empty when a link has sat in a chat past some of its hours,
       * which is the case the form has to say something about rather than
       * silently shortening the booking.
       */
      expired: TimeSlot[];
    }
  /** Absent, unparseable, or not a real slot. */
  | { kind: "unusable" }
  /** Well-formed but every hour has passed. Said plainly, not hidden. */
  | { kind: "expired"; date: string; slots: TimeSlot[] };

/**
 * `now` is injected so this is testable at any hour. A function that reads the
 * clock internally passes at 09.00 and fails at 21.00 on somebody else's
 * machine — the same trap `partitionSlots` avoids for the same reason.
 */
export function readBookingParams(
  date: string | null | undefined,
  /**
   * One `time` or many. The URL repeats the key once per hour since
   * 2026-08-16 — `?time=20.00 - 21.00&time=21.00 - 22.00` — because a booking
   * may cover several and Next hands a repeated key back as an array. A link an
   * admin typed by hand still carries exactly one and still works: it is the
   * same parameter, read with `getAll` semantics instead of `get`.
   */
  time: string | string[] | null | undefined,
  now: Date = new Date(),
): BookingParams {
  if (!date || !time) return { kind: "unusable" };
  if (!isBookingDateString(date)) return { kind: "unusable" };

  const requested = (Array.isArray(time) ? time : [time]).filter(
    (value, index, all) => all.indexOf(value) === index,
  );

  // Validated against TIME_SLOTS, never a regex, and never repaired. The
  // `uniq_active_slot` index compares time_slot as TEXT, so "18.00-19.00" is a
  // DIFFERENT slot to the database than "18.00 - 19.00" — a near miss that
  // passed a pattern check would book the same hour twice with no error
  // anywhere. Anything unreadable is dropped rather than guessed at.
  const slots = requested.filter(isTimeSlot);
  if (slots.length === 0) return { kind: "unusable" };

  // A date outside the window expires the whole link regardless of the hours on
  // it: there is nothing on that date to keep.
  if (!isWithinBookingWindow(date, now)) return { kind: "expired", date, slots };

  const live = slots.filter((slot) => !isPastSlot(date, slot, now));
  const expired = slots.filter((slot) => isPastSlot(date, slot, now));

  // EVERY hour gone is a different state from SOME gone. The first has nothing
  // to open the form with and gets the notice; the second opens on the live
  // hours and names what it dropped, because silently shortening somebody's
  // booking is the one outcome worse than telling them.
  if (live.length === 0) return { kind: "expired", date, slots };

  // NOTE THE STATE THAT IS DELIBERATELY MISSING: "slot no longer available".
  // This function does not ask. Checking availability here and refusing to
  // render the form would be a check-then-insert race — two visitors both pass
  // the check, both submit, and the database is the only thing that can
  // actually arbitrate. The 409 on submit is the authority; see hard rule 1.
  return { kind: "valid", date, slots: live, expired };
}
