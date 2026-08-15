/**
 * The dropdown's contents, pinned.
 *
 * A wrong list here is not a crash and not a visual defect: it is a correct
 * looking field offering the wrong hours. The two failures worth a test are an
 * elapsed hour that renders as bookable, and a taken hour that quietly vanishes
 * so the day looks emptier than it is.
 */
import { describe, expect, it } from "vitest";

import { TIME_SLOTS } from "@/domain/slots";
import type { AvailabilityRow } from "@/utils/slot-display";

import { buildTimeOptions } from "./booking-form.options";

const allAvailable: AvailabilityRow[] = TIME_SLOTS.map((slot) => ({
  slot,
  status: "available" as const,
}));

/** 2026-08-11 is a Tuesday. The field is WITA (UTC+8), so 09:00Z is 17:00 local. */
const at = (utcHour: number) => new Date(Date.UTC(2026, 7, 11, utcHour, 0, 0));

describe("buildTimeOptions", () => {
  it("returns all nine hours in the day's own order", () => {
    const options = buildTimeOptions(allAvailable, "2026-08-11", at(9));
    expect(options).toHaveLength(9);
    expect(options.map((o) => o.slot)).toEqual([...TIME_SLOTS]);
  });

  it("keeps elapsed hours in the list rather than dropping them", () => {
    // 17.00 WITA: six hours have started. A day that looks like it has three
    // hours in it reads as nearly sold out; a day with six dimmed rows reads as
    // a day that is mostly behind us, which is the true and more useful fact.
    const options = buildTimeOptions(allAvailable, "2026-08-11", at(9));
    const elapsed = options.filter((o) => o.status === "elapsed");
    expect(elapsed).toHaveLength(6);
    expect(elapsed.every((o) => o.selectable)).toBe(false);
  });

  it("overrides a booked status on an hour that has already passed", () => {
    const booked: AvailabilityRow[] = TIME_SLOTS.map((slot) => ({
      slot,
      status: "booked" as const,
    }));
    const options = buildTimeOptions(booked, "2026-08-11", at(9));
    expect(options.slice(0, 6).every((o) => o.status === "elapsed")).toBe(true);
    expect(options.slice(6).every((o) => o.status === "booked")).toBe(true);
  });

  it("marks only available hours selectable", () => {
    const mixed: AvailabilityRow[] = [
      { slot: TIME_SLOTS[6], status: "available" },
      { slot: TIME_SLOTS[7], status: "pending" },
      { slot: TIME_SLOTS[8], status: "booked" },
    ];
    const options = buildTimeOptions(mixed, "2026-08-11", at(0));
    expect(options.map((o) => o.selectable)).toEqual([true, false, false]);
  });

  it("quotes a price on selectable hours only", () => {
    const mixed: AvailabilityRow[] = [
      { slot: TIME_SLOTS[6], status: "available" },
      { slot: TIME_SLOTS[7], status: "booked" },
    ];
    const [free, taken] = buildTimeOptions(mixed, "2026-08-11", at(0));
    expect(free.priceLabel).toBeTruthy();
    expect(taken.priceLabel).toBeUndefined();
  });

  it("carries the Indonesian state word for every status", () => {
    const rows: AvailabilityRow[] = [
      { slot: TIME_SLOTS[6], status: "available" },
      { slot: TIME_SLOTS[7], status: "pending" },
      { slot: TIME_SLOTS[8], status: "booked" },
    ];
    expect(buildTimeOptions(rows, "2026-08-11", at(0)).map((o) => o.statusLabel)).toEqual([
      "Tersedia",
      "Menunggu Konfirmasi",
      "Terisi",
    ]);
    expect(buildTimeOptions(allAvailable, "2026-08-11", at(9))[0].statusLabel).toBe("Sudah lewat");
  });
});
