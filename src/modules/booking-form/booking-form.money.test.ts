/**
 * Money is the one thing on this page a visitor acts on with their bank app
 * open. A wrong total does not crash, does not look wrong, and is only found
 * when somebody transfers the wrong amount — so it gets its own tests.
 */
import { describe, expect, it } from "vitest";

import { TIME_SLOTS } from "@/domain/slots";

import { formatRupiah, isFullyPriced, sumRates } from "./booking-form.money";

const rates = [
  { slot: TIME_SLOTS[0], price: 400_000 },
  { slot: TIME_SLOTS[6], price: 800_000 },
  { slot: TIME_SLOTS[7], price: 800_000 },
];

describe("formatRupiah", () => {
  it("groups thousands the Indonesian way, with dots", () => {
    // The failure this pins: `toLocaleString()` on a machine set to en-US
    // produces "400,000" — the same digits under the other convention, on a
    // page whose entire audience reads this one.
    expect(formatRupiah(400_000)).toBe("Rp 400.000");
    expect(formatRupiah(1_600_000)).toBe("Rp 1.600.000");
  });

  it("shows no decimals", () => {
    // `style: "currency"` would emit "Rp 400.000,00". There are no sen in a
    // field rental and two zeroes on every price is noise to read past.
    expect(formatRupiah(800_000)).not.toContain(",");
  });

  it("handles zero without a special case", () => {
    expect(formatRupiah(0)).toBe("Rp 0");
  });
});

describe("sumRates", () => {
  it("adds the selected hours", () => {
    expect(sumRates([TIME_SLOTS[6], TIME_SLOTS[7]], rates)).toBe(1_600_000);
  });

  it("is zero for an empty selection", () => {
    expect(sumRates([], rates)).toBe(0);
  });

  it("skips an unpriced slot rather than inventing a figure", () => {
    // Under-reporting is recoverable; a made-up price is not. `isFullyPriced`
    // is what keeps an under-report off the screen.
    expect(sumRates([TIME_SLOTS[0], TIME_SLOTS[3]], rates)).toBe(400_000);
  });
});

describe("isFullyPriced — the gate on showing a total at all", () => {
  it("is false when any selected hour has no rate", () => {
    expect(isFullyPriced([TIME_SLOTS[0], TIME_SLOTS[3]], rates)).toBe(false);
  });

  it("is false for an empty selection", () => {
    expect(isFullyPriced([], rates)).toBe(false);
  });

  it("is true when every selected hour is priced", () => {
    expect(isFullyPriced([TIME_SLOTS[6], TIME_SLOTS[7]], rates)).toBe(true);
  });
});
