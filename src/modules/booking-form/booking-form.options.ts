import type { TimeSlot } from "@/domain/slots";
import { partitionSlots, type AvailabilityRow, type DisplayStatus } from "@/utils/slot-display";

import { SLOT_PRICE_LABEL } from "./booking-form.constants";

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
  /** Set on selectable hours only — nothing else has a price worth quoting. */
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
  now: Date = new Date(),
): TimeOption[] {
  const { elapsed, live } = partitionSlots(rows, date, now);

  return [...elapsed, ...live].map(({ slot, status }) => {
    const selectable = status === "available";
    return {
      slot,
      status,
      selectable,
      statusLabel: STATUS_LABEL[status],
      // TODO(content): rate card — the label is a placeholder sentence, never an
      // invented figure. See booking-form.constants.ts.
      ...(selectable ? { priceLabel: SLOT_PRICE_LABEL } : {}),
    };
  });
}
