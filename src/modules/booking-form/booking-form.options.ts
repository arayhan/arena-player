import type { TimeSlot } from "@/domain/slots";
import { partitionSlots, type AvailabilityRow, type DisplayStatus } from "@/utils/slot-display";

import { formatRupiah, type SlotRate } from "./booking-form.money";

/**
 * One row of the time field's dropdown.
 *
 * THE COMPONENT RENDERS; THIS DECIDES. Every question the list has an opinion
 * about — which hours appear, in what order, which can be picked, which carry a
 * price — is answered here, in a pure function with a test beside it. The same
 * logic inside a component would be reachable only by mounting one, and this is
 * exactly the layer that can be wrong without looking wrong.
 */
export interface TimeOption {
  slot: TimeSlot;
  status: DisplayStatus;
  /** Only `available` hours can be chosen. The rest stay visible and reachable. */
  selectable: boolean;
  /** The state word a visitor reads: Tersedia, Terisi, Menunggu Konfirmasi, Sudah lewat. */
  statusLabel: string;
  /**
   * Set on selectable hours that have a rate. Nothing else has a price worth
   * quoting, and an hour whose rate has not arrived shows no figure at all —
   * a price is the one placeholder a visitor acts on.
   */
  priceLabel?: string;
}

/**
 * The four state words. Identical to `SlotCell`'s on the landing page, and
 * duplicated rather than imported for the reason the module rule states: feature
 * modules never import each other. Four Indonesian nouns are the cheapest thing
 * in this codebase to keep in two places, and `check:docs` guards the copy that
 * actually matters — the verbatim Ketentuan block.
 */
const STATUS_LABEL: Record<DisplayStatus, string> = {
  available: "Tersedia",
  pending: "Menunggu Konfirmasi",
  booked: "Terisi",
  elapsed: "Sudah lewat",
};

/**
 * Build the nine rows for one date.
 *
 * ELAPSED HOURS STAY IN THE LIST, DIMMED. Dropping them would make a day opened
 * at 19.00 look like a day with three hours on offer instead of a day that is
 * mostly behind us — and "why is 10.00 missing" has no answer on screen. The
 * same argument the landing grid settled: `elapsed` is its own state, not a
 * synonym for `booked`.
 *
 * ORDER IS THE DAY'S OWN. `partitionSlots` walks the rows in canonical order and
 * every elapsed hour precedes every live one on a single date, so concatenating
 * the two halves reproduces 06.00 → 24.00 exactly.
 *
 * `now` is injected so this is testable at any hour — a function that reads the
 * clock internally passes at 09.00 and fails at 21.00 on somebody else's
 * machine.
 */
export function buildTimeOptions(
  rows: readonly AvailabilityRow[],
  date: string,
  rates: readonly SlotRate[] = [],
  now: Date = new Date(),
): TimeOption[] {
  const { elapsed, live } = partitionSlots(rows, date, now);
  const priceOf = new Map(rates.map((rate) => [rate.slot, rate.price]));

  return [...elapsed, ...live].map(({ slot, status }) => {
    const selectable = status === "available";
    const price = priceOf.get(slot);

    return {
      slot,
      status,
      selectable,
      statusLabel: STATUS_LABEL[status],
      // A REAL FIGURE OR NONE. The client supplied the rate card on 2026-08-15,
      // so this is their number rather than a placeholder sentence — and if the
      // rates request has not landed, the row shows no price instead of a
      // guessed one. An invented price is the one placeholder a visitor acts on.
      ...(selectable && price !== undefined ? { priceLabel: formatRupiah(price) } : {}),
    };
  });
}
