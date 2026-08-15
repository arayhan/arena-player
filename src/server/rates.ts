import "server-only";

import type { TimeSlot } from "@/domain/slots";

/**
 * THE RATE CARD, ABSENT AGAIN — TIME_SLOTS became eighteen 1-hour slots on
 * 2026-08-15, the same day the figures below arrived, and they do not survive
 * the change.
 *
 * // TODO(content): rate card. WHAT THE CLIENT GAVE, VERBATIM:
 * `08.00-12.00 = 400.000`, `12.00-18.00 = 600.000`, `> 18.00 = 800.000`. Every
 * one of those numbers priced a TWO-HOUR slot (`06.00 - 08.00`, etc) — they say
 * nothing about what one hour costs. DIVIDING BY TWO IS NOT A VALID READING:
 * nothing the client said confirms the rate is linear per hour rather than a
 * flat per-booking-block price, and hard rule 2 forbids inventing a number a
 * visitor would act on regardless. So rather than guess, every slot goes back
 * to unpriced until the client supplies an hourly figure — this file returns
 * no rates at all, and `/booking` falls back to "Nominal dikonfirmasi admin
 * via WhatsApp" exactly as it did before the rate card existed.
 *
 * THE OLD BRACKETS ARE KEPT BELOW, UNUSED, so the day an hourly figure arrives
 * this is a two-line change instead of a rediscovery of the reasoning above —
 * and so a "helpful" cleanup does not delete the one context that explains why
 * `rateCard()` deliberately returns nothing.
 *
 *   MORNING   400_000  (client's `08.00-12.00` bracket; 06.00-08.00 read as
 *                       morning too, since the day starts at 06.00)
 *   AFTERNOON 600_000  (client's `12.00-18.00` bracket)
 *   EVENING   800_000  (client's `> 18.00` bracket, taken as starting AT 18.00)
 *
 * SERVER-SIDE ON PURPOSE, and served from `/api/rates` rather than bundled into
 * the availability payload. Hard rule 2 says the landing page renders no number
 * of any kind, and `/` fetches availability — so the prices are never in a body
 * that page receives. That is the rule made structural instead of remembered.
 */
export interface SlotRate {
  slot: TimeSlot;
  /** Rupiah, as an integer. Never a formatted string — the client formats. */
  price: number;
}

/**
 * Empty until an hourly rate card exists. `GET /api/rates` returning `[]` is a
 * valid response under `assertRates` in booking-form.contract.ts (any number
 * of rows, zero included — the same shape `assertPaymentAccounts` already
 * allows for "the field has not given us an account yet"). `sumRates` and
 * `isFullyPriced` in booking-form.money.ts already treat "no rate for a slot"
 * as unpriced rather than free, so an empty rate card is not a special case
 * either function has to learn — /booking simply never clears the
 * `isFullyPriced` gate and shows no total.
 */
export function rateCard(): SlotRate[] {
  return [];
}
