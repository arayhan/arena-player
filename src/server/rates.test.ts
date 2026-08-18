import { describe, expect, it } from "vitest";

import { isWeekendDate } from "./rates";

describe("isWeekendDate", () => {
  it("reads Saturday and Sunday as weekend", () => {
    expect(isWeekendDate("2026-08-22")).toBe(true); // Saturday
    expect(isWeekendDate("2026-08-23")).toBe(true); // Sunday
  });

  it("reads an ordinary weekday as weekday", () => {
    expect(isWeekendDate("2026-08-17")).toBe(false); // Monday
    expect(isWeekendDate("2026-08-21")).toBe(false); // Friday
  });

  it("holds across a month boundary", () => {
    expect(isWeekendDate("2026-08-01")).toBe(true); // Saturday
  });

  it("holds across a year boundary", () => {
    expect(isWeekendDate("2027-01-01")).toBe(false); // Friday
  });
});
