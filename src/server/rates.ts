import "server-only";

import { TIME_SLOTS, type TimeSlot } from "@/domain/slots";

/**
 * THE RATE CARD — the client's own figures, supplied 2026-08-15.
 *
 * This closes the seventh placeholder category in CLAUDE.md hard rule 3 — the
 * rate card. Until this file existed the
 * form said "Harga menyusul" and **no number could be invented**, because an
 * invented price is the one placeholder a visitor acts on: they arrive at the
 * WhatsApp chat expecting a figure this project made up. These are not made up.
 *
 * WHAT THE CLIENT GAVE, VERBATIM: `08.00-12.00 = 400.000`,
 * `12.00-18.00 = 600.000`, `> 18.00 = 800.000`. Two slots fall outside those
 * words and the reading was CONFIRMED rather than guessed:
 *
 *   06.00 - 08.00  takes the morning rate  — the day starts at 06.00, and the
 *                  client's first bracket describes the morning, not a window
 *                  that leaves the first slot unpriced.
 *   18.00 - 20.00  takes the evening rate  — "> 18.00" starts AT 18.00, so the
 *                  whole evening is peak rather than only its second half.
 *
 * PER SLOT, WHICH IS PER TWO HOURS. A booking covering several slots costs the
 * sum; the form shows that total and the 50% DP the payment copy promises.
 *
 * SERVER-SIDE ON PURPOSE, and served from `/api/rates` rather than bundled into
 * the availability payload. Hard rule 2 says the landing page renders no number
 * of any kind, and `/` fetches availability — so the prices are never in a body
 * that page receives. That is the rule made structural instead of remembered.
 */
const MORNING = 400_000;
const AFTERNOON = 600_000;
const EVENING = 800_000;

/** The hour a slot starts, from its canonical label: `18.00 - 20.00` → 18. */
function startHourOf(slot: TimeSlot): number {
  return Number(slot.slice(0, 2));
}

export function priceForSlot(slot: TimeSlot): number {
  const hour = startHourOf(slot);
  if (hour < 12) return MORNING;
  if (hour < 18) return AFTERNOON;
  return EVENING;
}

export interface SlotRate {
  slot: TimeSlot;
  /** Rupiah, as an integer. Never a formatted string — the client formats. */
  price: number;
}

/**
 * All nine, in canonical order, derived from `TIME_SLOTS` rather than restated.
 * A hand-written list here is a second source of truth for the slot strings,
 * which `check:domain` guards precisely because a one-character drift disables
 * anti-double-booking in both apps with no error.
 */
export function rateCard(): SlotRate[] {
  return TIME_SLOTS.map((slot) => ({ slot, price: priceForSlot(slot) }));
}
