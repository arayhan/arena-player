import "server-only";

/**
 * The seeded availability the demo runs on, and the ONLY availability this
 * project has until Phase 4 wires Neon.
 *
 * IT MOVED HERE FROM `src/mocks/` ON 2026-08-15, when the client asked for a
 * link they could open. MSW is a service worker and is compiled out of
 * production builds by hard rule, so a deployed URL had no API at all — the
 * generator had to become a real route's data source rather than a browser
 * fixture. `src/mocks/` is gone entirely; there is no second implementation of
 * this contract left to drift.
 *
 * TWO PROPERTIES MATTER MORE THAN THE DATA ITSELF.
 *
 * 1. It is DERIVED from TIME_SLOTS, never restated. A generator with its own
 *    slot strings is a second source of truth that drifts from src/domain/ in
 *    silence and only surfaces when the real backend lands.
 *
 * 2. It is DETERMINISTIC per date. Random statuses make the order section
 *    flicker on every refetch, which reads as a bug in the component being
 *    built rather than in the data feeding it — and makes a screenshot
 *    impossible to compare against the one from a minute ago.
 *
 * IT INVENTS AVAILABILITY, WHICH IS THE ONE THING IT IS ALLOWED TO INVENT.
 * Nobody transfers money to a slot status, and the client is being shown a
 * schedule board, not a booking ledger. Prices and account numbers are the
 * client's own content and live in `rates.ts` and `payment-accounts.ts`.
 */
import { TIME_SLOTS, type TimeSlot } from "@/domain/slots";
import { toSlotStatus, type BookingStatus, type SlotStatus } from "@/domain/status";
import { isPastSlot } from "@/domain/dates";

export interface SlotAvailability {
  slot: TimeSlot;
  status: SlotStatus;
}

/**
 * A small stable hash of the date string. Not cryptography — it only has to
 * give the same answer for the same date on every call, in every process.
 */
function seedOf(date: string): number {
  let hash = 0;
  for (const char of date) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return hash;
}

/**
 * One date in the window is FULLY BOOKED, on purpose. Phase 2 has to design
 * the sold-out day, and a mock that never produces one lets that state ship
 * as an empty grid nobody looked at.
 */
function isFullyBookedDate(date: string): boolean {
  return seedOf(date) % 7 === 0;
}

/** The row state the fake database would hold for this slot on this date. */
function rowStatusFor(date: string, index: number): BookingStatus | null {
  if (isFullyBookedDate(date)) return "confirmed";

  // Mixed and uneven, so the grid never looks like a repeating pattern.
  switch ((seedOf(date) + index * 5) % 6) {
    case 0:
      return "confirmed";
    case 1:
      return "pending";
    case 2:
      // Rejected maps to AVAILABLE. Present in the mock deliberately: it is
      // the mapping most likely to be implemented backwards, and a mock that
      // never emits it lets the wrong answer look right.
      return "rejected";
    default:
      return null;
  }
}

/**
 * The exact body GET /api/availability returns: always nine entries, always
 * in canonical order.
 *
 * The elapsed-hours override is the SERVER's simplification — for today, a
 * slot whose start hour has passed reads as `booked` regardless of row state.
 * The client does not consume that as "taken": it derives elapsed itself from
 * slotStartHour and renders one collapsed `Sudah lewat (N)` row. No `past`
 * status exists here, and adding one would break the FIRM contract.
 */
export function availabilityFor(date: string, now: Date = new Date()): SlotAvailability[] {
  return TIME_SLOTS.map((slot, index) => {
    if (isPastSlot(date, slot, now)) return { slot, status: "booked" as const };
    const row = rowStatusFor(date, index);
    return { slot, status: row === null ? ("available" as const) : toSlotStatus(row) };
  });
}
