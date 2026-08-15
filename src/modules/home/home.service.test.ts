/**
 * Tests for the only runtime contract validator in the codebase.
 *
 * `assertContract` exists to survive a change it cannot see: the route handler
 * behind `fetchAvailability` gets a real database in Phase 4 without this file
 * being touched. That is exactly when a nine-entry contract quietly becoming
 * eight would surface — as a missing row in the grid and nothing else.
 *
 * So the malformed cases below are the point. The happy path is the easy half.
 *
 * IT STUBS `fetch` DIRECTLY, since MSW was retired on 2026-08-15. That is a
 * simplification rather than a loss: the old suite started a node server and
 * an interception layer to control one response, where four lines of
 * `vi.stubGlobal` do it with nothing between the assertion and the code. The
 * REAL route is covered separately, in src/app/api/api-routes.test.ts.
 */
import { afterEach, describe, expect, it, vi } from "vitest";

import { TIME_SLOTS } from "@/domain/slots";
import { todayAtField } from "@/domain/dates";

import { AvailabilityRequestError, fetchAvailability } from "./home.service";

const TODAY = todayAtField();

/** Answer the next availability request with this body and status. */
function respondWith(body: unknown, status = 200) {
  vi.stubGlobal(
    "fetch",
    vi.fn(async (_input: unknown, init?: { signal?: AbortSignal }) => {
      // The service passes TanStack Query's signal through; an already-aborted
      // one must reject here exactly as the platform would.
      init?.signal?.throwIfAborted();
      return new Response(JSON.stringify(body), {
        status,
        headers: { "content-type": "application/json" },
      });
    }),
  );
}

/** Answer with a body that is not JSON at all — a proxy's HTML error page. */
function respondWithHtml(status: number) {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => new Response("<html>502</html>", { status })),
  );
}

afterEach(() => vi.unstubAllGlobals());

const wellFormed = TIME_SLOTS.map((slot) => ({ slot, status: "available" as const }));

describe("fetchAvailability — the happy path", () => {
  it("returns all nine entries, in canonical order", async () => {
    respondWith(wellFormed);
    const rows = await fetchAvailability(TODAY);
    expect(rows).toHaveLength(9);
    expect(rows.map((r) => r.slot)).toEqual([...TIME_SLOTS]);
  });

  it("accepts a well-formed body unchanged", async () => {
    respondWith(wellFormed);
    await expect(fetchAvailability(TODAY)).resolves.toEqual(wellFormed);
  });
});

describe("fetchAvailability — HTTP failures carry the server's code", () => {
  it("surfaces a 400 with the contract's error string", async () => {
    respondWith({ error: "invalid_date" }, 400);
    const error = await fetchAvailability("2030-01-01").catch((e: unknown) => e);
    expect(error).toBeInstanceOf(AvailabilityRequestError);
    expect(error).toMatchObject({ status: 400, code: "invalid_date" });
  });

  it("surfaces a 500 rather than treating it as data", async () => {
    respondWith({ error: "boom" }, 500);
    await expect(fetchAvailability(TODAY)).rejects.toMatchObject({ status: 500, code: "boom" });
  });

  it("does not throw a parse error when an error body is not JSON", async () => {
    // The .catch(() => ({ error: "unknown" })) branch. Without it, a 502 from a
    // proxy returning HTML would surface as a SyntaxError, which tells the UI
    // nothing about what happened.
    respondWithHtml(502);
    await expect(fetchAvailability(TODAY)).rejects.toMatchObject({
      status: 502,
      code: "unknown",
    });
  });
});

describe("assertContract — the branches that exist for Phase 4", () => {
  const malformed = (label: string, body: unknown) =>
    it(label, async () => {
      respondWith(body);
      await expect(fetchAvailability(TODAY)).rejects.toMatchObject({
        code: "malformed_availability",
      });
    });

  malformed("rejects an empty array", []);
  malformed("rejects eight entries — the silent-missing-row case", wellFormed.slice(0, 8));
  malformed("rejects ten entries", [...wellFormed, wellFormed[0]]);
  malformed("rejects a body that is not an array", { slots: wellFormed });
  malformed("rejects a string body", "nine slots");
  malformed("rejects null", null);

  malformed("rejects slots out of canonical order", [
    wellFormed[1],
    wellFormed[0],
    ...wellFormed.slice(2),
  ]);

  malformed(
    "rejects an unknown status",
    wellFormed.map((r, i) => (i === 3 ? { ...r, status: "past" } : r)),
  );

  malformed(
    "rejects a null entry among valid ones",
    wellFormed.map((r, i) => (i === 5 ? null : r)),
  );

  malformed(
    "rejects a slot string that is a near miss",
    // '06.00-08.00' is a DIFFERENT slot to uniq_active_slot, which compares
    // time_slot as text. It must not be silently accepted as slot zero.
    [{ slot: "06.00-08.00", status: "available" }, ...wellFormed.slice(1)],
  );
});

describe("fetchAvailability — cancellation", () => {
  it("rejects when the signal is already aborted", async () => {
    // TanStack Query passes a signal and aborts it when a query is superseded —
    // which happens on every date-pill change in the order section.
    respondWith(wellFormed);
    const controller = new AbortController();
    controller.abort();
    await expect(fetchAvailability(TODAY, controller.signal)).rejects.toThrow();
  });
});
