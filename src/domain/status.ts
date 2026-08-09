/**
 * The two status vocabularies and the mapping between them.
 *
 * BYTE-IDENTICAL WITH arena-player-admin at this same path, and no
 * dependencies. The admin mutates these states; this site reads them. Two
 * implementations of the 4 to 3 mapping means the two apps disagree about
 * which slots are free.
 */

/** The four row states in `bookings.status`, matching the status_valid check. */
export const BOOKING_STATUSES = ["pending", "confirmed", "rejected", "expired"] as const;
export type BookingStatus = (typeof BOOKING_STATUSES)[number];

/** The three states GET /api/availability returns. There is no `past`. */
export const SLOT_STATUSES = ["available", "pending", "booked"] as const;
export type SlotStatus = (typeof SLOT_STATUSES)[number];

/**
 * MIRRORS `uniq_active_slot`'s WHERE clause in db/migrations/, and must keep
 * mirroring it. The partial index is the only anti-double-booking guard in the
 * system; if this list and that clause disagree, the guard quietly changes
 * meaning and nothing throws.
 */
export const ACTIVE_STATUSES = ["pending", "confirmed"] as const satisfies readonly BookingStatus[];
export type ActiveStatus = (typeof ACTIVE_STATUSES)[number];

export function isActiveStatus(status: BookingStatus): status is ActiveStatus {
  return (ACTIVE_STATUSES as readonly BookingStatus[]).includes(status);
}

/**
 * Row state to API state.
 *
 * `rejected` and `expired` map to AVAILABLE — the half that gets guessed
 * wrong. Guessing `booked` there blocks slots that are genuinely open, and
 * nothing errors: the client just renders a full day that is actually empty.
 * Every status outside ACTIVE_STATUSES is free again by definition, which is
 * the same rule uniq_active_slot enforces.
 */
export function toSlotStatus(rowStatus: BookingStatus): SlotStatus {
  switch (rowStatus) {
    case "pending":
      return "pending";
    case "confirmed":
      return "booked";
    case "rejected":
    case "expired":
      return "available";
  }
}
