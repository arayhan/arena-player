/**
 * `/booking` is only ever reached by a pasted link, so these are not edge
 * cases — they are the traffic. A blank form or a crash is the one response
 * this route may never give.
 */
import { describe, expect, it } from "vitest";

import { readBookingParams } from "./booking-form.params";

/** 2026-08-11, 10:00Z = 18:00 WITA. */
const NOW = new Date(Date.UTC(2026, 7, 11, 10, 0, 0));

describe("readBookingParams", () => {
  it("accepts a well-formed link for a future slot today", () => {
    expect(readBookingParams("2026-08-11", "20.00 - 21.00", NOW)).toEqual({
      kind: "valid",
      date: "2026-08-11",
      slots: ["20.00 - 21.00"],
      expired: [],
    });
  });

  it("treats missing params as unusable rather than crashing", () => {
    expect(readBookingParams(null, null, NOW).kind).toBe("unusable");
    expect(readBookingParams("2026-08-11", null, NOW).kind).toBe("unusable");
    expect(readBookingParams(null, "20.00 - 21.00", NOW).kind).toBe("unusable");
    expect(readBookingParams(undefined, undefined, NOW).kind).toBe("unusable");
  });

  it("rejects an unparseable date", () => {
    expect(readBookingParams("11-08-2026", "20.00 - 21.00", NOW).kind).toBe("unusable");
    expect(readBookingParams("besok", "20.00 - 21.00", NOW).kind).toBe("unusable");
    expect(readBookingParams("", "20.00 - 21.00", NOW).kind).toBe("unusable");
  });

  it("REJECTS A NEAR-MISS SLOT FORMAT — the one that would double-book", () => {
    // uniq_active_slot compares time_slot as TEXT. "20.00-21.00" without the
    // spaces is a DIFFERENT slot to the database, so a regex that accepted it
    // would let the same hour be booked twice with no error anywhere.
    for (const near of ["20.00-21.00", "20:00 - 21:00", "20.00 – 21.00", "8pm", "20.00 - 21.00 "]) {
      expect(readBookingParams("2026-08-11", near, NOW).kind).toBe("unusable");
    }
  });

  it("rejects a slot string from the retired 2-hour scheme", () => {
    // A link pasted before 2026-08-15 carries a 2-hour slot string. It is
    // WELL-FORMED, and it is not a member of the new TIME_SLOTS — unusable,
    // not valid and not expired, because it was never a real slot to begin
    // with under the current scheme.
    expect(readBookingParams("2026-08-11", "20.00 - 22.00", NOW).kind).toBe("unusable");
  });

  it("calls a slot that has already started expired, not valid", () => {
    // 18:00 WITA; the 17.00 slot is underway and cannot be booked.
    expect(readBookingParams("2026-08-11", "17.00 - 18.00", NOW).kind).toBe("expired");
  });

  it("calls a date behind the window expired", () => {
    expect(readBookingParams("2026-08-01", "20.00 - 21.00", NOW).kind).toBe("expired");
  });

  it("calls a date past the ~3-month window expired", () => {
    // The window from 2026-08-11 runs through 2026-11-10 — see
    // BOOKING_WINDOW_DAYS in src/domain/dates.ts.
    expect(readBookingParams("2026-12-01", "20.00 - 21.00", NOW).kind).toBe("expired");
  });

  it("keeps the date and slots on an expired link so the page can name them", () => {
    // "Jadwal ini sudah lewat" is more useful when it can say which hours.
    const result = readBookingParams("2026-08-11", "06.00 - 07.00", NOW);
    expect(result).toEqual({ kind: "expired", date: "2026-08-11", slots: ["06.00 - 07.00"] });
  });

  it("DOES NOT check availability — that would be a check-then-insert race", () => {
    // A slot someone else is mid-booking still yields `valid`. Two visitors
    // both pass any check we could write here; only the database can arbitrate,
    // and the 409 on submit is the authority. Hard rule 1.
    expect(readBookingParams("2026-08-11", "20.00 - 21.00", NOW).kind).toBe("valid");
  });

  it("accepts the last slot of the last day in the window", () => {
    // Boundary in the direction that silently loses a booking if wrong.
    // 2026-11-10 is the 92nd day counting 2026-08-11 as day one.
    expect(readBookingParams("2026-11-10", "23.00 - 24.00", NOW).kind).toBe("valid");
  });

  it("reads a repeated `time` as several hours, in the order given", () => {
    // The URL carries one `time` per booked hour since 2026-08-16.
    expect(readBookingParams("2026-08-11", ["20.00 - 21.00", "21.00 - 22.00"], NOW)).toEqual({
      kind: "valid",
      date: "2026-08-11",
      slots: ["20.00 - 21.00", "21.00 - 22.00"],
      expired: [],
    });
  });

  it("drops a duplicate hour rather than booking it twice", () => {
    const result = readBookingParams("2026-08-11", ["20.00 - 21.00", "20.00 - 21.00"], NOW);
    expect(result).toEqual({
      kind: "valid",
      date: "2026-08-11",
      slots: ["20.00 - 21.00"],
      expired: [],
    });
  });

  it("keeps the live hours and names the passed ones when a link is half stale", () => {
    // 18:00 WITA: 06.00 has gone, 20.00 has not. Shortening the booking in
    // silence is the one outcome worse than saying which hour was lost.
    expect(readBookingParams("2026-08-11", ["06.00 - 07.00", "20.00 - 21.00"], NOW)).toEqual({
      kind: "valid",
      date: "2026-08-11",
      slots: ["20.00 - 21.00"],
      expired: ["06.00 - 07.00"],
    });
  });

  it("expires the link only when EVERY hour on it has passed", () => {
    const result = readBookingParams("2026-08-11", ["06.00 - 07.00", "07.00 - 08.00"], NOW);
    expect(result).toEqual({
      kind: "expired",
      date: "2026-08-11",
      slots: ["06.00 - 07.00", "07.00 - 08.00"],
    });
  });

  it("ignores an unreadable hour among readable ones rather than repairing it", () => {
    // "20.00-21.00" is a DIFFERENT slot to uniq_active_slot, which compares
    // text. Repairing it here is how the same hour gets booked twice.
    expect(readBookingParams("2026-08-11", ["20.00-21.00", "20.00 - 21.00"], NOW)).toEqual({
      kind: "valid",
      date: "2026-08-11",
      slots: ["20.00 - 21.00"],
      expired: [],
    });
  });
});
