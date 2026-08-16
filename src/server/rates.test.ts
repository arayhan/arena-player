import { describe, expect, it } from "vitest";

import { isWeekendDate } from "./rates";

/**
 * Only the pure boundary logic — the day-type decision `rate_card` prices
 * against. `rateCard()` and `dayTypeOf()` need `sql`, the same live-database
 * dependency `src/server/availability.ts`'s `availabilityFor()` has, so they
 * stay unverified by `check:unit` for the same reason and are proven against
 * the real schema separately instead.
 */
describe("isWeekendDate", () => {
  it("2026-08-22 is a Saturday", () => {
    expect(isWeekendDate("2026-08-22")).toBe(true);
  });

  it("2026-08-23 is a Sunday", () => {
    expect(isWeekendDate("2026-08-23")).toBe(true);
  });

  it("2026-08-17 is a Monday", () => {
    expect(isWeekendDate("2026-08-17")).toBe(false);
  });

  it("2026-08-21 is a Friday", () => {
    expect(isWeekendDate("2026-08-21")).toBe(false);
  });

  it("holds across a month boundary — 2026-08-01 is a Saturday", () => {
    expect(isWeekendDate("2026-08-01")).toBe(true);
  });

  it("holds across a year boundary — 2027-01-01 is a Friday", () => {
    expect(isWeekendDate("2027-01-01")).toBe(false);
  });
});
