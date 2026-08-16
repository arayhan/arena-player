import { describe, expect, it } from "vitest";

import { TIME_SLOTS } from "@/domain/slots";
import { SLOT_STATUSES } from "@/domain/status";

import { computeAvailability } from "./availability";

// 04:00Z is 12:00 at the field (Asia/Makassar, UTC+8).
const NOON = new Date("2026-08-09T04:00:00Z");
const DATE = "2026-08-09";

describe("computeAvailability", () => {
  it("returns all eighteen slots in canonical order, every time", () => {
    const rows = computeAvailability([], new Set(), DATE, NOON);
    expect(rows.map((r) => r.slot)).toEqual([...TIME_SLOTS]);
  });

  it("only ever emits the three contract statuses — there is no `past`", () => {
    const rows = computeAvailability(
      [
        { time_slot: "12.00 - 13.00", status: "pending" },
        { time_slot: "13.00 - 14.00", status: "confirmed" },
        { time_slot: "14.00 - 15.00", status: "rejected" },
        { time_slot: "15.00 - 16.00", status: "expired" },
      ],
      new Set(),
      DATE,
      NOON,
    );
    for (const status of rows.map((r) => r.status)) expect(SLOT_STATUSES).toContain(status);
  });

  it("marks today's elapsed hours booked regardless of row state", () => {
    // At 12:00 WITA the 06.00 and 07.00 slots have gone, and neither has a row.
    const rows = computeAvailability([], new Set(), DATE, NOON);
    expect(rows[0]).toEqual({ slot: "06.00 - 07.00", status: "booked" });
    expect(rows[1]).toEqual({ slot: "07.00 - 08.00", status: "booked" });
  });

  it("maps an active bookings row through toSlotStatus — pending stays pending, confirmed reads booked", () => {
    const rows = computeAvailability(
      [
        { time_slot: "20.00 - 21.00", status: "pending" },
        { time_slot: "21.00 - 22.00", status: "confirmed" },
      ],
      new Set(),
      DATE,
      NOON,
    );
    expect(rows.find((r) => r.slot === "20.00 - 21.00")).toEqual({
      slot: "20.00 - 21.00",
      status: "pending",
    });
    expect(rows.find((r) => r.slot === "21.00 - 22.00")).toEqual({
      slot: "21.00 - 22.00",
      status: "booked",
    });
  });

  it("reads a rejected or expired row as available, not booked", () => {
    const rows = computeAvailability(
      [
        { time_slot: "20.00 - 21.00", status: "rejected" },
        { time_slot: "21.00 - 22.00", status: "expired" },
      ],
      new Set(),
      DATE,
      NOON,
    );
    expect(rows.find((r) => r.slot === "20.00 - 21.00")?.status).toBe("available");
    expect(rows.find((r) => r.slot === "21.00 - 22.00")?.status).toBe("available");
  });

  it("a block wins over an active row for the same slot", () => {
    // Should not happen in practice, but the block is what a visitor cannot
    // act on regardless of why — it must never lose to a stale pending row.
    const rows = computeAvailability(
      [{ time_slot: "20.00 - 21.00", status: "pending" }],
      new Set(["20.00 - 21.00"]),
      DATE,
      NOON,
    );
    expect(rows.find((r) => r.slot === "20.00 - 21.00")?.status).toBe("booked");
  });

  it("a block with no bookings row still reads booked", () => {
    const rows = computeAvailability([], new Set(["20.00 - 21.00"]), DATE, NOON);
    expect(rows.find((r) => r.slot === "20.00 - 21.00")?.status).toBe("booked");
  });
});
