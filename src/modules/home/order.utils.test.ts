/**
 * The elapsed split is the one piece of order-section logic that can be wrong
 * without looking wrong. A page opened at 19.00 that renders the whole day as
 * "Terisi" is not a crash and not a visual defect — it is a correct-looking
 * page telling the visitor the field is full when six of those hours simply
 * passed. So these tests pin the hour rather than trusting the clock.
 */
import { describe, expect, it } from "vitest";

import { TIME_SLOTS } from "@/domain/slots";

import type { SlotAvailability } from "./home.types";
import { countAvailable, formatPill, partitionSlots } from "./order.utils";

const allAvailable: SlotAvailability[] = TIME_SLOTS.map((slot) => ({
  slot,
  status: "available" as const,
}));

/** 2026-08-11 is a Tuesday. Jakarta is UTC+7, so 12:00Z is 19:00 local. */
const at = (utcHour: number) => new Date(Date.UTC(2026, 7, 11, utcHour, 0, 0));

describe("partitionSlots — the split that stops today reading as sold out", () => {
  it("returns every slot as live when the day has not started", () => {
    // 22:00Z on the 10th is 05:00 Jakarta on the 11th — before slot one.
    const { elapsed, live } = partitionSlots(
      allAvailable,
      "2026-08-11",
      new Date(Date.UTC(2026, 7, 10, 22, 0, 0)),
    );
    expect(elapsed).toHaveLength(0);
    expect(live).toHaveLength(9);
  });

  it("splits six elapsed and three live at 17.00 Jakarta — the motivating case", () => {
    // 10:00Z = 17:00 Jakarta. The last elapsed slot starts at 16.00.
    const { elapsed, live } = partitionSlots(allAvailable, "2026-08-11", at(10));
    expect(elapsed).toHaveLength(6);
    expect(live).toHaveLength(3);
    expect(live.map((s) => s.slot)).toEqual(["18.00 - 20.00", "20.00 - 22.00", "22.00 - 24.00"]);
  });

  it("counts a slot that has ALREADY STARTED as elapsed, not live", () => {
    // 12:00Z = 19:00 Jakarta, which is one hour INTO the 18.00-20.00 slot.
    // isPastSlot compares `currentHour >= slotStartHour`, so a running hour is
    // past — and that is right: nobody can book an hour already underway.
    //
    // This test exists because the first draft of it asserted 6 elapsed here,
    // reasoning from the mock in DESIGN.html rather than from the rule. The
    // code was correct and the expectation was not, which is the third time a
    // boundary assumption has been wrong in this repo before the code was.
    const { elapsed, live } = partitionSlots(allAvailable, "2026-08-11", at(12));
    expect(elapsed).toHaveLength(7);
    expect(live.map((s) => s.slot)).toEqual(["20.00 - 22.00", "22.00 - 24.00"]);
  });

  it("keeps all nine together — nothing is dropped by the split", () => {
    for (const hour of [0, 4, 8, 12, 16, 20]) {
      const { elapsed, live } = partitionSlots(allAvailable, "2026-08-11", at(hour));
      expect(elapsed.length + live.length).toBe(9);
    }
  });

  it("OVERRIDES a booked status on a past hour", () => {
    // The whole point. The API says booked; the client says elapsed, because
    // "it already happened" is the more useful and more honest fact.
    const rows: SlotAvailability[] = TIME_SLOTS.map((slot) => ({
      slot,
      status: "booked" as const,
    }));
    const { elapsed } = partitionSlots(rows, "2026-08-11", at(10));
    expect(elapsed).toHaveLength(6);
    expect(elapsed.every((s) => s.status === "elapsed")).toBe(true);
  });

  it("does NOT override a booked status on a future hour", () => {
    const rows: SlotAvailability[] = TIME_SLOTS.map((slot) => ({
      slot,
      status: "booked" as const,
    }));
    const { live } = partitionSlots(rows, "2026-08-11", at(12));
    expect(live.every((s) => s.status === "booked")).toBe(true);
  });

  it("treats an entire future date as live regardless of the hour", () => {
    const { elapsed, live } = partitionSlots(allAvailable, "2026-08-20", at(23));
    expect(elapsed).toHaveLength(0);
    expect(live).toHaveLength(9);
  });

  it("treats an entire past date as elapsed", () => {
    // isPastSlot returns true for any date strictly before today, so a date
    // behind the window collapses whole. It cannot be reached through the UI,
    // but a pasted URL can ask for it.
    const { elapsed, live } = partitionSlots(allAvailable, "2026-08-01", at(12));
    expect(elapsed).toHaveLength(9);
    expect(live).toHaveLength(0);
  });

  it("preserves canonical slot order within each partition", () => {
    const { elapsed, live } = partitionSlots(allAvailable, "2026-08-11", at(10));
    expect(elapsed.map((s) => s.slot)).toEqual(TIME_SLOTS.slice(0, 6));
    expect(live.map((s) => s.slot)).toEqual(TIME_SLOTS.slice(6));
  });

  it("handles an empty response without throwing", () => {
    expect(partitionSlots([], "2026-08-11", at(12))).toEqual({ elapsed: [], live: [] });
  });
});

describe("countAvailable — feeds the scarcity line", () => {
  it("counts only available, not pending or booked", () => {
    const { live } = partitionSlots(
      [
        { slot: "18.00 - 20.00", status: "pending" },
        { slot: "20.00 - 22.00", status: "available" },
        { slot: "22.00 - 24.00", status: "booked" },
      ],
      "2026-08-11",
      at(12),
    );
    expect(countAvailable(live)).toBe(1);
  });

  it("returns 0 for an empty list rather than throwing", () => {
    expect(countAvailable([])).toBe(0);
  });
});

describe("formatPill — Indonesian, and zone-proof", () => {
  it("names the weekday correctly", () => {
    // 2026-08-11 is a Tuesday.
    expect(formatPill("2026-08-11")).toEqual({ day: "Sel", label: "11 Agu" });
  });

  it("uses Indonesian month abbreviations, including the ones that differ", () => {
    // Mei, Agu, Okt and Des are where a copied English list goes wrong.
    expect(formatPill("2026-05-01").label).toBe("1 Mei");
    expect(formatPill("2026-08-01").label).toBe("1 Agu");
    expect(formatPill("2026-10-01").label).toBe("1 Okt");
    expect(formatPill("2026-12-01").label).toBe("1 Des");
  });

  it("does not shift the date across a timezone boundary", () => {
    // The suite pins TZ=UTC, but this is the defect the parse-by-split exists
    // to prevent: new Date("2026-01-01") is UTC midnight, and rendering that
    // anywhere west of Greenwich yields 31 Dec. The label must be the calendar
    // date it was handed, always.
    expect(formatPill("2026-01-01").label).toBe("1 Jan");
    expect(formatPill("2026-12-31").label).toBe("31 Des");
  });

  it("covers every weekday across one week", () => {
    // 2026-08-09 is a Sunday.
    const days = ["2026-08-09", "2026-08-10", "2026-08-11", "2026-08-12"].map(
      (d) => formatPill(d).day,
    );
    expect(days).toEqual(["Min", "Sen", "Sel", "Rab"]);
  });
});
