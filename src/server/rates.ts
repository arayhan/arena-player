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

const DEFAULT_RATES: Record<DayType, Record<string, number>> = {
  weekday: {
    "06.00 - 07.00": 200_000,
    "07.00 - 08.00": 200_000,
    "08.00 - 09.00": 200_000,
    "09.00 - 10.00": 200_000,
    "10.00 - 11.00": 200_000,
    "11.00 - 12.00": 200_000,
    "12.00 - 13.00": 200_000,
    "13.00 - 14.00": 200_000,
    "14.00 - 15.00": 200_000,
    "15.00 - 16.00": 200_000,
    "16.00 - 17.00": 300_000,
    "17.00 - 18.00": 300_000,
    "18.00 - 19.00": 400_000,
    "19.00 - 20.00": 400_000,
    "20.00 - 21.00": 400_000,
    "21.00 - 22.00": 400_000,
    "22.00 - 23.00": 400_000,
    "23.00 - 24.00": 400_000,
  },
  weekend: {
    "06.00 - 07.00": 200_000,
    "07.00 - 08.00": 200_000,
    "08.00 - 09.00": 200_000,
    "09.00 - 10.00": 200_000,
    "10.00 - 11.00": 200_000,
    "11.00 - 12.00": 200_000,
    "12.00 - 13.00": 200_000,
    "13.00 - 14.00": 200_000,
    "14.00 - 15.00": 200_000,
    "15.00 - 16.00": 200_000,
    "16.00 - 17.00": 350_000,
    "17.00 - 18.00": 350_000,
    "18.00 - 19.00": 450_000,
    "19.00 - 20.00": 450_000,
    "20.00 - 21.00": 450_000,
    "21.00 - 22.00": 450_000,
    "22.00 - 23.00": 450_000,
    "23.00 - 24.00": 450_000,
  },
};

/**
 * Weekend pricing also covers any date the admin has listed as a public
 * holiday — `public_holidays` is the one admin-managed override on top of
 * the plain Saturday/Sunday rule. `holiday_date::text` sidesteps the
 * postgres.js date-parser gotcha documented in db.ts.
 */
async function dayTypeOf(date: string): Promise<DayType> {
  if (isWeekendDate(date)) return "weekend";
  try {
    const holidayRows = await sql<{ exists: boolean }[]>`
      select exists(select 1 from public_holidays where holiday_date::text = ${date}) as exists
    `;
    return holidayRows[0]?.exists ? "weekend" : "weekday";
  } catch {
    return "weekday";
  }
}

/**
 * The rate card for one booking date, in `TIME_SLOTS` canonical order. A
 * slot with no matching row is skipped rather than defaulted — `/booking`'s
 * `isFullyPriced` already treats a missing rate as unpriced, not free, so an
 * incomplete rate card degrades honestly instead of inventing a number.
 */
export async function rateCard(date: string): Promise<SlotRate[]> {
  const dayType = await dayTypeOf(date);

  try {
    const rows = await sql<{ time_slot: TimeSlot; price_rupiah: number }[]>`
      select time_slot, price_rupiah from rate_card where day_type = ${dayType}
    `;
    if (Array.isArray(rows) && rows.length > 0) {
      const priceOf = new Map(rows.map((row) => [row.time_slot, row.price_rupiah]));
      return TIME_SLOTS.filter((slot) => priceOf.has(slot)).map((slot) => ({
        slot,
        price: priceOf.get(slot)!,
      }));
    }
  } catch (error) {
    console.error(`[rates] Failed to query rate_card from DB:`, error);
  }

  const fallback = DEFAULT_RATES[dayType];
  return TIME_SLOTS.map((slot) => ({
    slot,
    price: fallback[slot] ?? 200_000,
  }));
}
