import { describe, expect, it } from "vitest";

import { TIME_SLOTS } from "@/domain/slots";
import { SLOT_STATUSES } from "@/domain/status";
import { bookingWindow } from "@/domain/dates";

import { availabilityFor } from "./demo-availability";

// 04:00Z is 12:00 at the field. It was 05:00Z with a comment reading "12:00 in
// Jakarta", which stopped being true the moment the zone moved to WITA — that
// instant is 13:00 there, so both the constant's name and its comment were
// describing the old pin. Corrected rather than deleted, because a fixed
// mid-day instant is what these tests want and `NOON` should mean noon.
const NOON = new Date("2026-08-09T04:00:00Z");

describe("availabilityFor", () => {
  it("returns all nine slots in canonical order, every time", () => {
    for (const date of bookingWindow(NOON)) {
      const rows = availabilityFor(date, NOON);
      expect(rows.map((r) => r.slot)).toEqual([...TIME_SLOTS]);
    }
  });

  it("only ever emits the three contract statuses — there is no `past`", () => {
    // A fourth status here would contradict the FIRM contract, and Phase 2
    // would build a state the Phase 4 route can never produce.
    const seen = new Set(
      bookingWindow(NOON).flatMap((d) => availabilityFor(d, NOON).map((r) => r.status)),
    );
    for (const status of seen) expect(SLOT_STATUSES).toContain(status);
  });

  it("is deterministic — the same date gives the same answer", () => {
    // Random statuses make the order section flicker on every refetch, which
    // reads as a bug in the component rather than in the data behind it.
    expect(availabilityFor("2026-08-12", NOON)).toEqual(availabilityFor("2026-08-12", NOON));
  });

  it("is not uniform across the window", () => {
    // A mock that is all-available lets Phase 2 ship having only ever seen
    // one state.
    const statuses = new Set(
      bookingWindow(NOON).flatMap((d) => availabilityFor(d, NOON).map((r) => r.status)),
    );
    expect(statuses.size).toBeGreaterThan(1);
  });

  it("produces at least one fully booked date, so that state gets designed", () => {
    const soldOut = bookingWindow(NOON).filter((date) =>
      availabilityFor(date, NOON).every((r) => r.status === "booked"),
    );
    expect(soldOut.length).toBeGreaterThan(0);
  });

  it("marks today's elapsed hours booked, which is the server-side simplification", () => {
    // At 12:00 Jakarta the 06.00 and 08.00 slots have gone. The CLIENT renders
    // those as `Sudah lewat`, but the wire format says booked.
    const today = availabilityFor("2026-08-09", NOON);
    expect(today[0]).toEqual({ slot: "06.00 - 08.00", status: "booked" });
    expect(today[1]).toEqual({ slot: "08.00 - 10.00", status: "booked" });
  });

  it("hardcodes no slot string — every one comes from TIME_SLOTS", () => {
    // The real guard is check:docs; this is the same assertion from inside the
    // suite, so a hardcoded string fails the tests too rather than only the
    // doc check somebody might not have run.
    const rows = availabilityFor("2026-08-15", NOON);
    expect(rows.every((r) => (TIME_SLOTS as readonly string[]).includes(r.slot))).toBe(true);
  });
});
