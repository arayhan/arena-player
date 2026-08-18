import { describe, expect, it } from "vitest";

import { TIME_SLOTS } from "@/domain/slots";
import { computeAvailability } from "./availability";

describe("computeAvailability", () => {
  const futureDate = "2099-01-01";
  const mockNow = new Date("2099-01-01T05:00:00+08:00");

  it("returns all eighteen slots in canonical order as available when no bookings or blocks exist", () => {
    const result = computeAvailability(futureDate, [], [], mockNow);
    expect(result).toHaveLength(TIME_SLOTS.length);
    expect(result.map((r) => r.slot)).toEqual([...TIME_SLOTS]);
    expect(result.every((r) => r.status === "available")).toBe(true);
  });

  it("marks confirmed bookings as 'booked'", () => {
    const result = computeAvailability(
      futureDate,
      [{ time_slot: TIME_SLOTS[2], status: "confirmed" }],
      [],
      mockNow,
    );
    expect(result[2].status).toBe("booked");
    expect(result[0].status).toBe("available");
  });

  it("marks pending bookings as 'pending'", () => {
    const result = computeAvailability(
      futureDate,
      [{ time_slot: TIME_SLOTS[3], status: "pending" }],
      [],
      mockNow,
    );
    expect(result[3].status).toBe("pending");
    expect(result[0].status).toBe("available");
  });

  it("treats rejected and expired bookings as 'available'", () => {
    const result = computeAvailability(
      futureDate,
      [
        { time_slot: TIME_SLOTS[4], status: "rejected" },
        { time_slot: TIME_SLOTS[5], status: "expired" },
      ],
      [],
      mockNow,
    );
    expect(result[4].status).toBe("available");
    expect(result[5].status).toBe("available");
  });

  it("marks administrative slot_blocks as 'booked'", () => {
    const result = computeAvailability(futureDate, [], [{ time_slot: TIME_SLOTS[6] }], mockNow);
    expect(result[6].status).toBe("booked");
    expect(result[0].status).toBe("available");
  });

  it("marks elapsed slots for today as 'booked'", () => {
    const today = "2026-08-20";
    // Clock at 10:30 WITA means slots 06:00, 07:00, 08:00, 09:00, 10:00 are elapsed
    const nowAt1030WITA = new Date("2026-08-20T10:30:00+08:00");
    const result = computeAvailability(today, [], [], nowAt1030WITA);

    expect(result[0].status).toBe("booked"); // 06:00 - 07:00
    expect(result[1].status).toBe("booked"); // 07:00 - 08:00
    expect(result[2].status).toBe("booked"); // 08:00 - 09:00
    expect(result[3].status).toBe("booked"); // 09:00 - 10:00
    expect(result[4].status).toBe("booked"); // 10:00 - 11:00
    expect(result[5].status).toBe("available"); // 11:00 - 12:00
  });
});
