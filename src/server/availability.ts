import "server-only";

import { isPastSlot } from "@/domain/dates";
import { TIME_SLOTS, type TimeSlot } from "@/domain/slots";
import { toSlotStatus, type BookingStatus, type SlotStatus } from "@/domain/status";
import sql from "@/server/db";

export interface SlotAvailability {
  slot: TimeSlot;
  status: SlotStatus;
}

export type BookingSlotRow = {
  time_slot: TimeSlot;
  status: BookingStatus;
};

export type BlockedSlotRow = {
  time_slot: TimeSlot;
};

/**
 * Pure availability computation given a date, active bookings, admin slot blocks, and the clock.
 *
 * Priority / Mapping:
 * 1. Elapsed hours for today (WITA) map to 'booked'.
 * 2. Admin blocked slots (from `slot_blocks`) map to 'booked'.
 * 3. Confirmed bookings map to 'booked'.
 * 4. Pending bookings map to 'pending'.
 * 5. Everything else is 'available'.
 */
export function computeAvailability(
  date: string,
  bookings: readonly BookingSlotRow[],
  blocks: readonly BlockedSlotRow[],
  now: Date = new Date(),
): SlotAvailability[] {
  const bookingStatusBySlot = new Map(bookings.map((r) => [r.time_slot, r.status]));
  const blockedSlots = new Set(blocks.map((r) => r.time_slot));

  return TIME_SLOTS.map((slot) => {
    if (isPastSlot(date, slot, now)) {
      return { slot, status: "booked" as const };
    }
    if (blockedSlots.has(slot)) {
      return { slot, status: "booked" as const };
    }
    const bookingStatus = bookingStatusBySlot.get(slot);
    if (bookingStatus) {
      return { slot, status: toSlotStatus(bookingStatus) };
    }
    return { slot, status: "available" as const };
  });
}

/**
 * Reads live availability for one date from Supabase Postgres (`bookings` and `slot_blocks`).
 */
export async function availabilityFor(
  date: string,
  now: Date = new Date(),
): Promise<SlotAvailability[]> {
  const dbUrl =
    process.env.DATABASE_URL ??
    process.env.POSTGRES_URL ??
    process.env.SUPABASE_DATABASE_URL ??
    process.env.POSTGRES_PRISMA_URL;

  if (!dbUrl || process.env.NODE_ENV === "test") {
    return computeAvailability(date, [], [], now);
  }

  try {
    const [bookingRows, blockRows] = await Promise.all([
      sql<BookingSlotRow[]>`
        select time_slot, status
        from bookings
        where booking_date::text = ${date}
          and status in ('pending', 'confirmed')
      `,
      sql<BlockedSlotRow[]>`
        select time_slot
        from slot_blocks
        where block_date::text = ${date}
      `,
    ]);

    return computeAvailability(date, bookingRows, blockRows, now);
  } catch (error) {
    console.error(`Failed to query availability for date ${date}:`, error);
    return computeAvailability(date, [], [], now);
  }
}
