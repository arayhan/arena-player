import { isPastSlot } from "@/domain/dates";
import type { TimeSlot } from "@/domain/slots";

import type { SlotAvailability } from "./home.types";

/**
 * A slot as the ORDER SECTION renders it, which is not quite what the API
 * returns.
 *
 * `GET /api/availability` knows three statuses. The UI needs four, because
 * "nobody booked this hour, it simply passed" and "somebody else has this
 * hour" are different facts and rendering them identically makes today look
 * sold out. The fourth is derived here, on the client.
 */
export type DisplayStatus = SlotAvailability["status"] | "elapsed";

export interface DisplaySlot {
  slot: TimeSlot;
  status: DisplayStatus;
}

export interface PartitionedSlots {
  /** Hours that have already passed today. Collapsed behind a disclosure. */
  elapsed: DisplaySlot[];
  /** Everything still bookable or still worth reading. Rendered directly. */
  live: DisplaySlot[];
}

/**
 * Split a day's availability into elapsed hours and live ones.
 *
 * THE API IS NOT WRONG AND DOES NOT CHANGE. It returns `booked` for today's
 * past slots, which is true from the database's point of view — the row is
 * unavailable. The client knows something the server was not asked: the
 * current time, and the canonical slot starts. So it derives "elapsed" itself,
 * `GET /api/availability` stays FIRM, and no Phase 4 contract change is owed.
 *
 * Why this matters more than it looks: with same-day booking as the primary
 * journey, someone opening the page at 19.00 saw 06.00 through 18.00 all
 * labelled "Terisi". The day read as sold out when six of those hours were
 * never available to them — the worst possible outcome for a product measured
 * on filling empty slots.
 *
 * `now` is injected rather than read from the clock so this is testable at any
 * hour. A function that consults `new Date()` internally passes at 09.00 and
 * fails at 21.00, and does so on somebody else's machine.
 */
export function partitionSlots(
  rows: readonly SlotAvailability[],
  date: string,
  now: Date = new Date(),
): PartitionedSlots {
  const elapsed: DisplaySlot[] = [];
  const live: DisplaySlot[] = [];

  for (const row of rows) {
    if (isPastSlot(date, row.slot, now)) {
      // Deliberately overrides whatever the server said. A past hour reads as
      // elapsed even if it was genuinely booked, because "you cannot have this,
      // it already happened" is the more useful fact and the more honest one:
      // the visitor was never in the running for it either way.
      elapsed.push({ slot: row.slot, status: "elapsed" });
    } else {
      live.push({ slot: row.slot, status: row.status });
    }
  }

  return { elapsed, live };
}

/** How many live slots a visitor can actually book right now. */
export function countAvailable(slots: readonly DisplaySlot[]): number {
  return slots.filter((s) => s.status === "available").length;
}

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
/** `2026-08-11` -> `11 Agu 2026`. The form the WhatsApp message uses. */
export function formatFullDate(date: string): string {
  const [year, month, dayOfMonth] = date.split("-").map(Number);
  return `${dayOfMonth} ${MONTH_NAMES[month - 1]} ${year}`;
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
