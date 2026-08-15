import type { TimeSlot } from "@/domain/slots";

import { formatFullDate } from "@/utils/slot-display";

// THE PILL FORMATTER CAME BACK HERE ON 2026-08-15. It moved to
// src/utils/slot-display.ts that morning so `/booking`'s picker could share
// it; that picker became a pair of select fields the same day and stopped
// rendering pills at all. A helper with one consumer belongs to that
// consumer — `DatePills` — not to a shared folder.
// Indonesian day and month abbreviations, HAND-WRITTEN RATHER THAN LOCALISED.
//
// date-fns ships an `id` locale and using it would be the obvious move. It is
// also several kilobytes to render nineteen short strings that will never
// change, on a page with a 240KB ceiling that already spends 126.5KB on the
// framework. The whole need is 7 day names and 12 month names.
//
// This is not a general i18n solution and must not grow into one. Every string
// a visitor reads on this site is Indonesian by design — there is no second
// locale to serve, so there is nothing for a locale system to switch between.
export const DAY_NAMES = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"] as const;
const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Mei",
  "Jun",
  "Jul",
  "Agu",
  "Sep",
  "Okt",
  "Nov",
  "Des",
] as const;

// The unabbreviated names, for the calendar's month headings only. A heading
// gets a whole row to itself and is read once, where a pill is scanned in a
// scrolling strip of fourteen — so the abbreviation that earns its place above
// does not earn it here.
const MONTH_NAMES_FULL = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
] as const;

/**
 * The two lines of a date pill, for a `YYYY-MM-DD` string.
 *
 * PARSED AS PLAIN NUMBERS, NEVER THROUGH `new Date(string)`. `new Date("2026-08-11")`
 * parses as UTC midnight and then renders in the viewer's local zone, so a
 * visitor west of Greenwich sees the previous day on every pill. The string is
 * already the Jakarta calendar date the rest of the system agreed on; splitting
 * it keeps it that way.
 *
 * `withYear` EXISTS BECAUSE THE WINDOW GREW TO 92 DAYS ON 2026-08-15 and can
 * now straddle a year boundary. `1 Jan` and `1 Jan` are two different, equally
 * bookable dates for anyone opening the site in December, and a bare label
 * cannot tell them apart. The caller decides — `DatePills` sets it only for
 * dates outside the window's opening year, so the common case still reads
 * `11 Agu` rather than paying four characters a visitor does not need.
 */
export function formatPill(
  date: string,
  { withYear = false }: { withYear?: boolean } = {},
): { day: string; label: string } {
  const [year, month, dayOfMonth] = date.split("-").map(Number);

  // Zeller-free: Date.UTC is only used to get the weekday index, and both the
  // construction and the read are UTC, so no zone ever enters.
  const weekday = new Date(Date.UTC(year, month - 1, dayOfMonth)).getUTCDay();

  return {
    day: DAY_NAMES[weekday],
    label: `${dayOfMonth} ${MONTH_NAMES[month - 1]}${withYear ? ` ${year}` : ""}`,
  };
}

/** One square in a calendar month. `date` is null when the day is not bookable. */
export interface CalendarDay {
  /**
   * The bookable `YYYY-MM-DD`, or `null` for a day that exists in the month but
   * not in the booking window — yesterday, or day 93. Kept as a cell rather
   * than dropped so the month's geometry stays a real calendar: a visitor
   * locates "next Saturday" by its column, and a grid with holes punched in it
   * loses the only thing a calendar is better at than a list.
   */
  date: string | null;
  dayOfMonth: number;
}

export interface CalendarMonth {
  /** `YYYY-MM`. Stable, so it is also the React key. */
  key: string;
  /** `Agustus 2026` — the year is never dropped, see `formatPill`'s note. */
  label: string;
  /** Blank cells before day 1. Sunday-first, matching `DAY_NAMES`. */
  leading: number;
  days: CalendarDay[];
}

/**
 * The booking window, redrawn as calendar months.
 *
 * WHY THIS IS NOT A LIST. `bookingWindow()` returns 92 consecutive strings, and
 * ninety-two of anything in one horizontal strip is a row nobody reaches the end
 * of. A month grid is the shape the question already has in the visitor's head
 * — "the Saturday after next" is a position, not an offset — and it is the only
 * layout where the far end of the window costs the same number of taps as the
 * near end.
 *
 * ZONE-PROOF THE SAME WAY `formatPill` IS. Every `Date` here is constructed and
 * read in UTC and is used only for arithmetic on a calendar the caller already
 * decided; no local zone can enter, and `toISOString()` is never called.
 * `Date.UTC(year, month, 0)` is day zero of the FOLLOWING month, which is the
 * last day of this one — the standard trick, and it gets February right in a
 * leap year without a table.
 */
export function calendarMonths(dates: readonly string[]): CalendarMonth[] {
  const bookable = new Set(dates);
  const months: CalendarMonth[] = [];
  const seen = new Set<string>();

  for (const date of dates) {
    const key = date.slice(0, 7);
    if (seen.has(key)) continue;
    seen.add(key);

    const [year, month] = key.split("-").map(Number);
    const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
    const leading = new Date(Date.UTC(year, month - 1, 1)).getUTCDay();

    const days: CalendarDay[] = [];
    for (let dayOfMonth = 1; dayOfMonth <= daysInMonth; dayOfMonth += 1) {
      const iso = `${key}-${String(dayOfMonth).padStart(2, "0")}`;
      days.push({ date: bookable.has(iso) ? iso : null, dayOfMonth });
    }

    months.push({ key, label: `${MONTH_NAMES_FULL[month - 1]} ${year}`, leading, days });
  }

  return months;
}

/**
 * The `wa.me` deep link for a chosen slot.
 *
 * NOTHING IN `src/modules/home/` CALLS THIS AS OF 2026-08-15, AND IT IS KEPT ON
 * PURPOSE. WhatsApp did not leave the journey; it moved to the far side of the
 * database write. The order section's hand-off now goes to
 * `/booking?date=…&time=…`, and WhatsApp is where the visitor goes AFTER
 * submitting — to confirm with the admin. This builder is the same message in
 * the same shape, so wiring it to the post-submit step is an import, not a
 * rewrite. Deleting it is a separate decision and not one this change made.
 *
 * ONE DESTINATION STILL HOLDS, FOR THE WHATSAPP STEP. On mobile `wa.me`
 * deep-links into the WhatsApp app rather than opening a tab, so pairing it
 * with a same-tab navigation is exactly the combination in-app webviews and
 * popup blockers handle inconsistently — the Instagram in-app browser is the
 * primary traffic here. Wherever this href is rendered, it is one anchor with
 * nothing racing it. That hazard is specific to `wa.me`: it never applied to a
 * same-origin route, which is why the hand-off could move without inheriting it.
 *
 * The message is prefilled so the admin receives the date and slot without the
 * visitor retyping them, and so the eventual bot can parse one known shape.
 */
export function whatsappLink(numberInWaForm: string, date: string, slot: TimeSlot): string {
  const text = `Halo, saya mau booking lapangan Arena Player tanggal ${formatFullDate(date)} jam ${slot}`;
  return `https://wa.me/${numberInWaForm}?text=${encodeURIComponent(text)}`;
}
