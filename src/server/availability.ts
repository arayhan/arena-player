import "server-only";

import { TIME_SLOTS, type TimeSlot } from "@/domain/slots";
import { toSlotStatus, type BookingStatus, type SlotStatus } from "@/domain/status";
import { isPastSlot } from "@/domain/dates";

import sql from "./db";

export interface SlotAvailability {
  slot: TimeSlot;
  status: SlotStatus;
}

/** One `bookings` row, exactly as the query below selects it. */
interface BookingRow {
  time_slot: TimeSlot;
  status: BookingStatus;
}

/**
 * The wire format `GET /api/availability` returns: always eighteen entries,
 * always in canonical order — unchanged since the demo mock this replaces.
 *
 * PRECEDENCE, HIGHEST FIRST, AND IT IS DELIBERATE:
 *
 *   1. `blockedSlots` — an admin's manual block (maintenance, private hire).
 *      Unconditionally `booked`. A block is inert to a visitor regardless of
 *      why it exists, and it can coexist with no `bookings` row at all.
 *   2. A `bookings` row's own status, through `toSlotStatus` — the same 4-to-3
 *      mapping `src/domain/status.ts` documents (pending/confirmed map
 *      through; rejected/expired read as available).
 *   3. `isPastSlot` — the server-side simplification that was already true of
 *      the mock this replaces: today's elapsed hours read `booked` regardless
 *      of row state, and the client collapses them into one `Sudah lewat (N)`
 *      row rather than treating it as a fourth status.
 *   4. Otherwise `available` — no row, no block, not yet elapsed.
 *
 * PURE, AND DELIBERATELY SEPARATE FROM THE QUERY BELOW. This is the piece
 * `availability.test.ts` exercises with no database — the same split
 * `booking-form.money.ts` and `booking-form.contract.ts` already use for
 * logic versus I/O in this codebase.
 */
export function computeAvailability(
  rows: readonly BookingRow[],
  blockedSlots: ReadonlySet<TimeSlot>,
  date: string,
  now: Date,
): SlotAvailability[] {
  const byRowStatus = new Map(rows.map((row) => [row.time_slot, row.status]));

  return TIME_SLOTS.map((slot) => {
    if (blockedSlots.has(slot)) return { slot, status: "booked" as const };

    const rowStatus = byRowStatus.get(slot);
    if (rowStatus !== undefined) return { slot, status: toSlotStatus(rowStatus) };

    if (isPastSlot(date, slot, now)) return { slot, status: "booked" as const };

    return { slot, status: "available" as const };
  });
}

/**
 * `GET /api/availability`'s data source, live since 2026-08-17. Replaces
 * `src/server/demo-availability.ts`'s deterministic mock — deleted rather
 * than kept as a fallback, per this codebase's own stance on dead exported
 * surface (`downPayment()`, commit `787fed8`).
 *
 * TWO QUERIES, NOT ONE JOIN. `bookings` and `slot_blocks` are independent
 * signals — a block can exist with no booking row and vice versa — and two
 * small indexed reads on one date are clearer than a join whose NULL-handling
 * has to be reasoned about every time this file is read again.
 *
 * `booking_date::text` IN BOTH QUERIES, NOT A BARE COLUMN SELECT. See the
 * comment on `sql` in `./db.ts` — postgres.js parses `date` columns into JS
 * `Date` by default, the same silent day-shift class of bug `docs/database.md`
 * documents for the Neon driver. Casting here is the mitigation.
 */
export async function availabilityFor(
  date: string,
  now: Date = new Date(),
): Promise<SlotAvailability[]> {
  const [bookingRows, blockRows] = await Promise.all([
    sql<BookingRow[]>`
      select time_slot, status
      from bookings
      where booking_date::text = ${date}
        and status in ('pending', 'confirmed')
    `,
    sql<{ time_slot: TimeSlot }[]>`
      select time_slot
      from slot_blocks
      where block_date::text = ${date}
    `,
  ]);

  const blockedSlots = new Set(blockRows.map((row) => row.time_slot));
  return computeAvailability(bookingRows, blockedSlots, date, now);
}
