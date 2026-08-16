import "server-only";

import { TIME_SLOTS, type TimeSlot } from "@/domain/slots";

import sql from "./db";

/**
 * THE RATE CARD, SUPPLIED — live in the client's `rate_card` table since
 * 2026-08-17, seeded by a migration `arena-player-admin` requested. The
 * placeholder era this file's header used to document is over: the 2026-08-15
 * figures priced a TWO-HOUR block and could not be divided into an hourly rate
 * without inventing a number; the client's real hourly pricelist replaces that
 * guess entirely, per slot per `day_type`.
 *
 * `day_type` IS `'weekday' | 'weekend'`, RESOLVED HERE, NOT IN THE CLIENT. A
 * Saturday/Sunday date reads `weekend`; any date in `public_holidays` also
 * reads `weekend`, same treatment, so a gazetted holiday prices the same as a
 * Sunday without a second code path. This mirrors `arena-player-admin`'s own
 * `src/server/pricing.ts`, which is NOT `src/domain/`'s byte-identical
 * contract — that guard covers slots/dates/status/phone specifically — so the
 * two implementations can drift, and are recorded here as a known duplication
 * rather than a shared file, matching the live schema's own comment on
 * `rate_card.time_slot_canonical`.
 */
export interface SlotRate {
  slot: TimeSlot;
  /** Rupiah, as an integer. Never a formatted string — the client formats. */
  price: number;
}

type DayType = "weekday" | "weekend";

/**
 * Saturday/Sunday via LOCAL date components, not a parsed instant — a plain
 * calendar date has no timezone to get wrong. `new Date(year, month - 1, day)`
 * and `.getDay()` are both local-time getters, so the weekday they agree on
 * does not depend on the host process's TZ the way `new Date(dateString)`
 * plus `.getUTCDay()` would.
 */
export function isWeekendDate(date: string): boolean {
  const [year, month, day] = date.split("-").map(Number);
  const weekday = new Date(year, month - 1, day).getDay();
  return weekday === 0 || weekday === 6;
}

async function dayTypeOf(date: string): Promise<DayType> {
  if (isWeekendDate(date)) return "weekend";

  const holidayRows = await sql<{ exists: boolean }[]>`
    select exists(select 1 from public_holidays where holiday_date::text = ${date}) as exists
  `;
  return holidayRows[0]?.exists ? "weekend" : "weekday";
}

/**
 * Every priced slot for one booking date, canonical order.
 *
 * SKIPS A SLOT `rate_card` HAS NO ROW FOR, rather than guessing one — the same
 * rule `booking-form.money.ts`'s `sumRates`/`isFullyPriced` already enforce on
 * the client side. Today every slot is priced for both day types, so this
 * never trims anything in practice; it stays defensive because the form's own
 * gate depends on it staying that way rather than on the row count being
 * assumed.
 */
export async function rateCard(date: string): Promise<SlotRate[]> {
  const dayType = await dayTypeOf(date);

  const rows = await sql<{ time_slot: TimeSlot; price_rupiah: number }[]>`
    select time_slot, price_rupiah
    from rate_card
    where day_type = ${dayType}
  `;

  const priceOf = new Map(rows.map((row) => [row.time_slot, row.price_rupiah]));
  return TIME_SLOTS.filter((slot) => priceOf.has(slot)).map((slot) => ({
    slot,
    price: priceOf.get(slot)!,
  }));
}
