/**
 * The handlers exercised through msw/node.
 *
 * This is the only way they CAN be exercised: the browser worker is a service
 * worker, so it intercepts nothing outside a real browser — which is why
 * `curl localhost:3000/api/availability` can never reach this mock, whatever
 * the step file's acceptance block claimed.
 */
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";

import { TIME_SLOTS } from "@/domain/slots";
import { bookingWindow, todayAtField } from "@/domain/dates";

import { server } from "./server";

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const BASE = "http://localhost:3000";
const TODAY = todayAtField();

function bookingForm(
  overrides: Record<string, string | Blob> = {},
  slots: readonly string[] = [TIME_SLOTS[4]],
): FormData {
  const form = new FormData();
  form.set("date", bookingWindow()[1]);
  // REPEATED KEY, one per hour. A booking may cover several since 2026-08-15,
  // and `set` would keep only the last — which is exactly the bug this helper
  // would hide from every test below it.
  for (const slot of slots) form.append("slots", slot);
  form.set("teamName", "Rajawali FC");
  form.set("phone", "081234567890");
  form.set("website", ""); // honeypot: present and empty
  form.set("proof", new File(["x"], "bukti.jpg", { type: "image/jpeg" }));
  for (const [key, value] of Object.entries(overrides)) form.set(key, value);
  return form;
}

const post = (form: FormData) => fetch(`${BASE}/api/bookings`, { method: "POST", body: form });

describe("GET /api/availability", () => {
  it("returns nine entries in canonical order", async () => {
    const res = await fetch(`${BASE}/api/availability?date=${TODAY}`);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveLength(9);
    expect(body.map((r: { slot: string }) => r.slot)).toEqual([...TIME_SLOTS]);
  });

  it("400s on a date outside the 14-day window", async () => {
    const res = await fetch(`${BASE}/api/availability?date=2030-01-01`);
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "invalid_date" });
  });

  it("400s on a malformed date and on a missing one", async () => {
    expect((await fetch(`${BASE}/api/availability?date=9-8-2026`)).status).toBe(400);
    expect((await fetch(`${BASE}/api/availability`)).status).toBe(400);
  });

  it("400s on a date that looks valid but is not a real day", async () => {
    expect((await fetch(`${BASE}/api/availability?date=2026-02-31`)).status).toBe(400);
  });
});

describe("GET /api/payment-accounts", () => {
  it("answers with an EMPTY list, because no account has been supplied", async () => {
    // The assertion that matters most in this file. An account number nobody
    // verified is the one placeholder a visitor acts on — they transfer money to
    // it. Empty is the honest answer and the form says so in words.
    const res = await fetch(`${BASE}/api/payment-accounts`);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual([]);
  });

  it("returns one CONTOH row behind the dev-only trigger", async () => {
    const res = await fetch(`${BASE}/api/payment-accounts?mock=accounts`);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveLength(1);
    // Every field says CONTOH on purpose: a plausible-looking bank and number
    // would look finished in a screenshot, and a screenshot is how a made-up
    // account reaches somebody about to pay.
    expect(body[0].bank).toContain("CONTOH");
    expect(body[0].accountHolder).toContain("CONTOH");
    expect(body[0].accountNumber).toBe("0000000000");
  });

  it("500s behind the error trigger, so the retry path is reachable in a browser", async () => {
    const res = await fetch(`${BASE}/api/payment-accounts?mock=accounts-error`);
    expect(res.status).toBe(500);
  });
});

describe("POST /api/bookings — all four codes are reachable", () => {
  it("201 on a good booking", async () => {
    const res = await post(bookingForm());
    expect(res.status).toBe(201);
    expect(await res.json()).toMatchObject({ status: "pending" });
  });

  it("409 on the reserved team name — the state Phase 3 must be able to rehearse", async () => {
    const res = await post(bookingForm({ teamName: "TEST409" }));
    expect(res.status).toBe(409);
    expect(await res.json()).toEqual({ error: "slot_taken" });
  });

  it("429 is distinct from 409, because the UI copy is not interchangeable", async () => {
    // Telling a rate-limited visitor their slot is gone sends them elsewhere
    // when nothing was wrong with their booking.
    const res = await post(bookingForm({ teamName: "TEST429" }));
    expect(res.status).toBe(429);
    expect(await res.json()).toEqual({ error: "rate_limited" });
  });

  it("400 carries a `fields` object keyed by the contract's field names", async () => {
    const res = await post(bookingForm({ teamName: "TEST400" }));
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({
      error: "validation_failed",
      fields: { teamName: "invalid_format" },
    });
  });
});

describe("POST /api/bookings — real validation, not only the triggers", () => {
  it("rejects a near-miss slot format rather than accepting it", async () => {
    // '18.00-20.00' is a DIFFERENT slot to uniq_active_slot, which compares
    // time_slot as text. Accepting it books the same hour twice.
    const res = await post(bookingForm({}, ["18.00-20.00"]));
    expect(res.status).toBe(400);
    expect((await res.json()).fields).toMatchObject({ slots: "invalid_slot" });
  });

  it("takes several hours in one booking", async () => {
    const res = await post(bookingForm({}, [TIME_SLOTS[4], TIME_SLOTS[7]]));
    expect(res.status).toBe(201);
  });

  it("rejects an empty selection and a repeated hour", async () => {
    // A booking with no hours is not a booking, and the same hour twice would
    // become two rows racing each other for one slot.
    expect((await post(bookingForm({}, []))).status).toBe(400);
    const repeated = await post(bookingForm({}, [TIME_SLOTS[4], TIME_SLOTS[4]]));
    expect(repeated.status).toBe(400);
    expect((await repeated.json()).fields).toMatchObject({ slots: "duplicate_slot" });
  });

  it("accepts a booking with NO proof, because the dropzone is hidden", async () => {
    // Optional here mirrors the schema, which went optional when the field was
    // hidden on 2026-08-15. Requiring it would refuse every booking the current
    // form can produce.
    const noProof = bookingForm();
    noProof.delete("proof");
    expect((await post(noProof)).status).toBe(201);
  });

  it("rejects a date outside the window", async () => {
    expect((await post(bookingForm({ date: "2030-01-01" }))).status).toBe(400);
  });

  it("answers the honeypot with a fabricated 201 and no error", async () => {
    // The one place this API lies on purpose: a 400 tells the bot what tripped
    // it. Note the deliberately invalid slot — the honeypot is checked FIRST,
    // so a bot cannot learn anything from a validation message either.
    const res = await post(bookingForm({ website: "https://spam.example" }, ["nonsense"]));
    expect(res.status).toBe(201);
    expect(await res.json()).toMatchObject({ status: "pending" });
  });
});
