/**
 * The display helpers both surfaces share, tested where they now live.
 *
 * MOVED OUT OF `src/modules/home/order.utils.test.ts` ON 2026-08-15 with the
 * code they cover. The elapsed split is the one piece of this logic that can be
 * wrong without LOOKING wrong: a page opened at 19.00 that renders the whole day
 * as "Terisi" is not a crash and not a visual defect — it is a correct-looking
 * page telling the visitor the field is full when several of those hours simply
 * passed. So these tests pin the hour rather than trusting the clock.
 */
import { describe, expect, it } from "vitest";

import { TIME_SLOTS } from "@/domain/slots";

import type { AvailabilityRow, DisplaySlot } from "./slot-display";
import { countAvailable, formatFullDate, longestFreeRun, partitionSlots } from "./slot-display";

const allAvailable: AvailabilityRow[] = TIME_SLOTS.map((slot) => ({
  slot,
  status: "available" as const,
}));

/** 2026-08-11 is a Tuesday. The field (Lombok) is WITA UTC+8, so 11:00Z is 19:00 local. */
const at = (utcHour: number) => new Date(Date.UTC(2026, 7, 11, utcHour, 0, 0));

describe("partitionSlots — the split that stops today reading as sold out", () => {
  it("returns every slot as live when the day has not started", () => {
    // 21:00Z on the 10th is 05:00 WITA on the 11th — before slot one.
    const { elapsed, live } = partitionSlots(
      allAvailable,
      "2026-08-11",
      new Date(Date.UTC(2026, 7, 10, 21, 0, 0)),
    );
    expect(elapsed).toHaveLength(0);
    expect(live).toHaveLength(18);
  });

  it("splits twelve elapsed and six live at 17.00 WITA — the motivating case", () => {
    // 09:00Z = 17:00 WITA. The last elapsed slot starts at 17.00 (inclusive
    // boundary — a slot starting NOW cannot be sold either).
    const { elapsed, live } = partitionSlots(allAvailable, "2026-08-11", at(9));
    expect(elapsed).toHaveLength(12);
    expect(live).toHaveLength(6);
    expect(live.map((s) => s.slot)).toEqual([
      "18.00 - 19.00",
      "19.00 - 20.00",
      "20.00 - 21.00",
      "21.00 - 22.00",
      "22.00 - 23.00",
      "23.00 - 24.00",
    ]);
  });

  it("counts a slot that has ALREADY STARTED as elapsed, not live", () => {
    // 11:00Z = 19:00 WITA, which is the moment the 19.00-20.00 slot begins.
    // isPastSlot compares `currentHour >= slotStartHour`, so a slot starting
    // NOW is past — and that is right: nobody can book an hour already
    // underway.
    //
    // This test exists because the first draft of it asserted a smaller
    // elapsed count here, reasoning from the mock in DESIGN.html rather than
    // from the rule. The code was correct and the expectation was not, which
    // is the third time a boundary assumption has been wrong in this repo
    // before the code was.
    const { elapsed, live } = partitionSlots(allAvailable, "2026-08-11", at(11));
    expect(elapsed).toHaveLength(14);
    expect(live.map((s) => s.slot)).toEqual([
      "20.00 - 21.00",
      "21.00 - 22.00",
      "22.00 - 23.00",
      "23.00 - 24.00",
    ]);
  });

  it("keeps all eighteen together — nothing is dropped by the split", () => {
    for (const hour of [0, 4, 8, 12, 16, 20]) {
      const { elapsed, live } = partitionSlots(allAvailable, "2026-08-11", at(hour));
      expect(elapsed.length + live.length).toBe(18);
    }
  });

  it("OVERRIDES a booked status on a past hour", () => {
    // The whole point. The API says booked; the client says elapsed, because
    // "it already happened" is the more useful and more honest fact.
    const rows: AvailabilityRow[] = TIME_SLOTS.map((slot) => ({
      slot,
      status: "booked" as const,
    }));
    const { elapsed } = partitionSlots(rows, "2026-08-11", at(9));
    expect(elapsed).toHaveLength(12);
    expect(elapsed.every((s) => s.status === "elapsed")).toBe(true);
  });

  it("does NOT override a booked status on a future hour", () => {
    const rows: AvailabilityRow[] = TIME_SLOTS.map((slot) => ({
      slot,
      status: "booked" as const,
    }));
    const { live } = partitionSlots(rows, "2026-08-11", at(11));
    expect(live.every((s) => s.status === "booked")).toBe(true);
  });

  it("treats an entire future date as live regardless of the hour", () => {
    const { elapsed, live } = partitionSlots(allAvailable, "2026-08-20", at(23));
    expect(elapsed).toHaveLength(0);
    expect(live).toHaveLength(18);
  });

  it("treats an entire past date as elapsed", () => {
    // isPastSlot returns true for any date strictly before today, so a date
    // behind the window collapses whole. It cannot be reached through the UI,
    // but a pasted URL can ask for it.
    const { elapsed, live } = partitionSlots(allAvailable, "2026-08-01", at(12));
    expect(elapsed).toHaveLength(18);
    expect(live).toHaveLength(0);
  });

  it("preserves canonical slot order within each partition", () => {
    const { elapsed, live } = partitionSlots(allAvailable, "2026-08-11", at(9));
    expect(elapsed.map((s) => s.slot)).toEqual(TIME_SLOTS.slice(0, 12));
    expect(live.map((s) => s.slot)).toEqual(TIME_SLOTS.slice(12));
  });

  it("handles an empty response without throwing", () => {
    expect(partitionSlots([], "2026-08-11", at(12))).toEqual({ elapsed: [], live: [] });
  });
});

describe("longestFreeRun — the anti-dilution rules ARE the design", () => {
  const run = (...statuses: DisplaySlot["status"][]): DisplaySlot[] =>
    statuses.map((status, i) => ({ slot: TIME_SLOTS[i], status }));

  it("returns null for a run below the six-slot threshold", () => {
    // Five is ordinary — most days have a run at least that long — so
    // badging it would read as decoration rather than a real signal.
    expect(
      longestFreeRun(
        run("available", "available", "available", "available", "available", "booked"),
      ),
    ).toBeNull();
  });

  it("returns six slots as SIX HOURS — the unit a visitor reads", () => {
    // MIN_RUN_SLOTS is 6 since 2026-08-15 (1-hour slots): the design was
    // always "six hours, rare enough to be worth saying," never "three slots."
    expect(
      longestFreeRun(
        run("available", "available", "available", "available", "available", "available"),
      ),
    ).toEqual({ startSlot: TIME_SLOTS[0], slots: 6, hours: 6 });
  });

  it("returns only the LONGEST run when a day has several", () => {
    const result = longestFreeRun(
      run(
        "available",
        "available",
        "available",
        "available",
        "available",
        "available",
        "booked",
        "available",
        "available",
        "available",
        "available",
        "available",
        "available",
        "available",
        "available",
      ),
    );
    expect(result?.slots).toBe(8);
    expect(result?.startSlot).toBe(TIME_SLOTS[7]);
  });

  it("gives an earlier run the tie — it leaves the evening open behind it", () => {
    const result = longestFreeRun(
      run(
        "available",
        "available",
        "available",
        "available",
        "available",
        "available",
        "booked",
        "available",
        "available",
        "available",
        "available",
        "available",
        "available",
      ),
    );
    expect(result?.startSlot).toBe(TIME_SLOTS[0]);
  });

  it("BREAKS a run on pending and on booked, not only on booked", () => {
    // Pending is somebody else's slot too. Counting through it would promise
    // hours that cannot all be had. Each side here is three slots — below the
    // six-slot threshold alone, but seven combined, which is what proves the
    // break (not just the threshold) is what makes this null.
    expect(
      longestFreeRun(
        run(
          "available",
          "available",
          "available",
          "pending",
          "available",
          "available",
          "available",
        ),
      ),
    ).toBeNull();
    expect(
      longestFreeRun(
        run("available", "available", "available", "booked", "available", "available", "available"),
      ),
    ).toBeNull();
  });

  it("badges the FIRST slot of the run, never the middle", () => {
    const result = longestFreeRun(
      run("booked", "available", "available", "available", "available", "available", "available"),
    );
    expect(result?.startSlot).toBe(TIME_SLOTS[1]);
  });

  it("counts elapsed hours as gone, because it is handed the live array", () => {
    // The contract: pass partitionSlots' `live`, never the raw response. A
    // day that already passed is not still six bookable hours — and here that
    // is load-bearing, since `elapsed` is not `available` and so breaks the
    // run. at(9) is 17:00 WITA — six hours left, exactly the minimum run.
    const { live } = partitionSlots(allAvailable, "2026-08-11", at(9));
    expect(live).toHaveLength(6);
    expect(longestFreeRun(live)?.hours).toBe(6);

    // at(11) is 19:00 WITA — four left, and four is below the threshold. The
    // badge disappears as the evening runs out, which is correct: there is no
    // longer a long block to offer.
    const late = partitionSlots(allAvailable, "2026-08-11", at(11));
    expect(late.live).toHaveLength(4);
    expect(longestFreeRun(late.live)).toBeNull();
  });

  it("returns null on an empty day rather than throwing", () => {
    expect(longestFreeRun([])).toBeNull();
  });

  it("returns null when nothing is available at all", () => {
    expect(longestFreeRun(run("booked", "pending", "booked"))).toBeNull();
  });

  it("handles a whole day free — eighteen slots, eighteen hours", () => {
    // 18 slots x 1 hour is still 18 hours total — the same span the old 9
    // slots x 2 hours covered, since the day itself did not change length.
    const { live } = partitionSlots(allAvailable, "2026-08-20", at(12));
    expect(longestFreeRun(live)).toEqual({ startSlot: TIME_SLOTS[0], slots: 18, hours: 18 });
  });
});

describe("countAvailable — feeds the scarcity line", () => {
  it("counts only available, not pending or booked", () => {
    const { live } = partitionSlots(
      [
        { slot: "18.00 - 19.00", status: "pending" },
        { slot: "20.00 - 21.00", status: "available" },
        { slot: "22.00 - 23.00", status: "booked" },
      ],
      "2026-08-11",
      at(11),
    );
    expect(countAvailable(live)).toBe(1);
  });

  it("returns 0 for an empty list rather than throwing", () => {
    expect(countAvailable([])).toBe(0);
  });
});

describe("formatFullDate — the message's date", () => {
  it("renders day, Indonesian month, and year", () => {
    expect(formatFullDate("2026-08-11")).toBe("11 Agu 2026");
    expect(formatFullDate("2026-01-01")).toBe("1 Jan 2026");
    expect(formatFullDate("2026-12-31")).toBe("31 Des 2026");
  });
});
