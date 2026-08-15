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
const DAY_NAMES = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"] as const;
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

/**
 * The two lines of a date pill, for a `YYYY-MM-DD` string.
 *
 * PARSED AS PLAIN NUMBERS, NEVER THROUGH `new Date(string)`. `new Date("2026-08-11")`
 * parses as UTC midnight and then renders in the viewer's local zone, so a
 * visitor west of Greenwich sees the previous day on every pill. The string is
 * already the Jakarta calendar date the rest of the system agreed on; splitting
 * it keeps it that way.
 */
export function formatPill(date: string): { day: string; label: string } {
  const [year, month, dayOfMonth] = date.split("-").map(Number);

  // Zeller-free: Date.UTC is only used to get the weekday index, and both the
  // construction and the read are UTC, so no zone ever enters.
  const weekday = new Date(Date.UTC(year, month - 1, dayOfMonth)).getUTCDay();

  return {
    day: DAY_NAMES[weekday],
    label: `${dayOfMonth} ${MONTH_NAMES[month - 1]}`,
  };
}

/**
 * The `wa.me` deep link for a chosen slot.
 *
 * ONE DESTINATION, NOT TWO. On mobile `wa.me` deep-links into the WhatsApp app
 * rather than opening a tab, so pairing it with a same-tab navigation is
 * exactly the combination in-app webviews and popup blockers handle
 * inconsistently — and the Instagram in-app browser is the primary traffic.
 * One user action, one destination, no race between them. That is why this
 * returns a plain href for an anchor rather than something a click handler
 * calls alongside a route change.
 *
 * The message is prefilled so the admin receives the date and slot without the
 * visitor retyping them, and so the eventual bot can parse one known shape.
 */
export function whatsappLink(numberInWaForm: string, date: string, slot: TimeSlot): string {
  const text = `Halo, saya mau booking lapangan Arena Player tanggal ${formatFullDate(date)} jam ${slot}`;
  return `https://wa.me/${numberInWaForm}?text=${encodeURIComponent(text)}`;
}
