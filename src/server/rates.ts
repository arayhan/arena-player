import "server-only";

import { TIME_SLOTS, type TimeSlot } from "@/domain/slots";
import sql from "@/server/db";

/**
 * The rate card, live from Supabase's `rate_card` table (36 rows — every
 * `TimeSlot` priced once per `day_type`). See docs/database.md for the
 * schema; the client's own pricelist is reproduced there too.
 *
 * SERVER-SIDE ON PURPOSE, and served from `/api/rates` rather than bundled
 * into the availability payload. Hard rule 2 says the landing page renders
 * no number of any kind, and `/` fetches availability — so the prices are
 * never in a body that page receives. That is the rule made structural
 * instead of remembered.
 */
export interface SlotRate {
  slot: TimeSlot;
  /** Rupiah, as an integer. Never a formatted string — the client formats. */
  price: number;
}

type DayType = "weekday" | "weekend";

/**
 * Saturday or Sunday, by the CALENDAR DATE'S OWN COMPONENTS — not a UTC
 * shift. `new Date(year, month - 1, day)` builds a local-time date from the
 * `YYYY-MM-DD` string's digits directly, so it never crosses midnight the
 * way parsing the string with `new Date(dateString)` (UTC) or an
 * `Intl`/timezone call would on a WITA (UTC+8) machine. Exported for
 * testing — this is the one piece of `dayTypeOf` with no I/O.
 */
export function isWeekendDate(date: string): boolean {
  const [year, month, day] = date.split("-").map(Number);
  const weekday = new Date(year, month - 1, day).getDay();
  return weekday === 0 || weekday === 6;
}

/**
 * Weekend pricing also covers any date the admin has listed as a public
 * holiday — `public_holidays` is the one admin-managed override on top of
 * the plain Saturday/Sunday rule. `holiday_date::text` sidesteps the
 * postgres.js date-parser gotcha documented in db.ts.
 */
async function dayTypeOf(date: string): Promise<DayType> {
  if (isWeekendDate(date)) return "weekend";
  const holidayRows = await sql<{ exists: boolean }[]>`
    select exists(select 1 from public_holidays where holiday_date::text = ${date}) as exists
  `;
  return holidayRows[0]?.exists ? "weekend" : "weekday";
}

/**
 * The rate card for one booking date, in `TIME_SLOTS` canonical order. A
 * slot with no matching row is skipped rather than defaulted — `/booking`'s
 * `isFullyPriced` already treats a missing rate as unpriced, not free, so an
 * incomplete rate card degrades honestly instead of inventing a number.
 */
export async function rateCard(date: string): Promise<SlotRate[]> {
  const dayType = await dayTypeOf(date);
  const rows = await sql<{ time_slot: TimeSlot; price_rupiah: number }[]>`
    select time_slot, price_rupiah from rate_card where day_type = ${dayType}
  `;
  const priceOf = new Map(rows.map((row) => [row.time_slot, row.price_rupiah]));
  return TIME_SLOTS.filter((slot) => priceOf.has(slot)).map((slot) => ({
    slot,
    price: priceOf.get(slot)!,
  }));
}
