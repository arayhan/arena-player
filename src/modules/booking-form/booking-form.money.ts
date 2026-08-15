import type { TimeSlot } from "@/domain/slots";

/**
 * The money the visitor is about to pay, formatted and totalled in one place.
 *
 * PURE AND TESTED, because this is arithmetic somebody transfers against. A sum
 * inlined in JSX is a sum nothing checks, and the failure mode is not a crash —
 * it is a total that is quietly wrong on the one screen where being wrong costs
 * the client a dispute.
 */

/** One slot's price, as `GET /api/rates` sends it: rupiah, integer. */
export interface SlotRate {
  slot: TimeSlot;
  price: number;
}

/**
 * `400000` → `Rp 400.000`.
 *
 * `Intl.NumberFormat("id-ID")` RATHER THAN A HAND-ROLLED SPLITTER, and it costs
 * zero bytes: the formatter is in the platform, and Indonesian groups thousands
 * with `.` where a naive `toLocaleString()` on a machine set to en-US would
 * produce `400,000` — the same digits, the wrong currency convention, on a page
 * whose entire audience reads the other one.
 *
 * `Rp` is prefixed by hand rather than through `style: "currency"`, which emits
 * `Rp 400.000,00`. There are no sen in a field rental and two zero decimals on
 * every price is noise a visitor has to read past.
 */
export function formatRupiah(amount: number): string {
  return `Rp ${new Intl.NumberFormat("id-ID").format(amount)}`;
}

/**
 * What the selected hours cost together.
 *
 * SKIPS A SLOT IT HAS NO RATE FOR rather than guessing one. If the rates request
 * failed or a new slot exists that the rate card has not caught up with, the
 * total under-reports instead of inventing a figure — and the form only shows a
 * total once every selected slot is priced, so an under-report never reaches the
 * screen. Inventing is the one thing money code may never do.
 */
export function sumRates(selected: readonly TimeSlot[], rates: readonly SlotRate[]): number {
  const priceOf = new Map(rates.map((rate) => [rate.slot, rate.price]));
  return selected.reduce((total, slot) => total + (priceOf.get(slot) ?? 0), 0);
}

/** True when every selected hour has a price — the condition for showing a total. */
export function isFullyPriced(selected: readonly TimeSlot[], rates: readonly SlotRate[]): boolean {
  const priced = new Set(rates.map((rate) => rate.slot));
  return selected.length > 0 && selected.every((slot) => priced.has(slot));
}

/**
 * The down payment the payment copy promises: **"Transfer DP 50% dari harga
 * sewa."**
 *
 * ROUNDED UP TO THE NEAREST RUPIAH. Half of an odd total is a fraction of a
 * rupiah, which does not exist as a transferable amount; rounding up means the
 * visitor never transfers less than half and the admin never has to ask for one
 * more rupiah.
 */
export function downPayment(total: number): number {
  return Math.ceil(total / 2);
}
