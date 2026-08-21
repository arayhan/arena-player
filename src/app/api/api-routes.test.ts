/**
 * The four demo routes, tested by calling them directly.
 *
 * THESE REPLACE THE MSW HANDLER TESTS, and the change is a simplification
 * rather than a port: a route handler is a plain function from `Request` to
 * `Response`, so there is no worker to start, no server to listen, and no
 * interception layer between the assertion and the code. The old suite needed
 * `msw/node` and a lifecycle; this one needs `fetch`'s own types.
 *
 * WHAT THEY DO NOT PROVE. That a booking is stored — nothing is. The POST route
 * is a demo stub and says so at its top; these tests pin the CONTRACT it must
 * keep when Phase 4 puts a database behind it.
 */
import { describe, expect, it } from "vitest";

import { bookingWindow, todayAtField } from "@/domain/dates";
import { TIME_SLOTS } from "@/domain/slots";

import { GET as availability } from "./availability/route";
import { POST as bookings } from "./bookings/route";
import { GET as paymentAccounts } from "./payment-accounts/route";
import { GET as rates } from "./rates/route";

const BASE = "http://localhost:3000";
const TODAY = todayAtField();

function bookingForm(
  overrides: Record<string, string | Blob> = {},
  slots: readonly string[] = [TIME_SLOTS[4]],
): FormData {
  const form = new FormData();
  form.set("date", bookingWindow()[1]);
  // REPEATED KEY, one per hour — `set` would keep only the last, which is
  // exactly the bug this helper would hide from every test below it.
  for (const slot of slots) form.append("slots", slot);
  form.set("teamName", "Rajawali FC");
  form.set("phone", "081234567890");
  form.set("website", ""); // honeypot: present and empty
  for (const [key, value] of Object.entries(overrides)) form.set(key, value);
  return form;
}

const post = (form: FormData) =>
  bookings(new Request(`${BASE}/api/bookings`, { method: "POST", body: form }));

describe("GET /api/availability", () => {
  it("returns eighteen entries in canonical order", async () => {
    const res = await availability(new Request(`${BASE}/api/availability?date=${TODAY}`));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveLength(TIME_SLOTS.length);
    expect(body.map((r: { slot: string }) => r.slot)).toEqual([...TIME_SLOTS]);
  });

  it("400s outside the window, on a malformed date, and on a missing one", async () => {
    const at = (query: string) => availability(new Request(`${BASE}/api/availability${query}`));
    expect((await at("?date=2030-01-01")).status).toBe(400);
    expect((await at("?date=9-8-2026")).status).toBe(400);
    expect((await at("?date=2026-02-31")).status).toBe(400);
    expect((await at("")).status).toBe(400);
  });
});

describe("GET /api/rates", () => {
  // NO HAPPY-PATH TEST HERE. `rateCard(date)` queries the client's real
  // `rate_card` table via src/server/db.ts, which needs a live
  // `DATABASE_URL` this suite does not have — the same live-credential
  // dependency vitest.config.ts's `check:setup` comment reserves a separate,
  // `check:unit`-excluded home for. The pure weekday/weekend boundary logic
  // (`isWeekendDate`) is unit-tested with no database in
  // `src/server/rates.test.ts`. What stays here is the route's own
  // responsibility — the `date` param's 400 contract, which this route
  // shares this exact shape with `GET /api/availability`.
  it("400s outside the window, on a malformed date, and on a missing one", async () => {
    const at = (query: string) => rates(new Request(`${BASE}/api/rates${query}`));
    expect((await at("?date=2030-01-01")).status).toBe(400);
    expect((await at("?date=9-8-2026")).status).toBe(400);
    expect((await at("?date=2026-02-31")).status).toBe(400);
    expect((await at("")).status).toBe(400);
  });
});

describe("GET /api/payment-accounts", () => {
  it("returns active payment accounts", async () => {
    const res = await paymentAccounts();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBeGreaterThanOrEqual(1);
    expect(body[0]).toHaveProperty("bank");
    expect(body[0]).toHaveProperty("accountNumber");
    expect(body[0]).toHaveProperty("accountHolder");
  });
});

describe("POST /api/bookings — every code the UI must be able to show", () => {
  it("201 on a good booking", async () => {
    const res = await post(bookingForm());
    expect(res.status).toBe(201);
    expect(await res.json()).toMatchObject({ status: "pending" });
  });

  it("409 on the reserved team name", async () => {
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
    expect((await post(bookingForm({}, [TIME_SLOTS[4], TIME_SLOTS[7]]))).status).toBe(201);
  });

  it("rejects an empty selection and a repeated hour", async () => {
    expect((await post(bookingForm({}, []))).status).toBe(400);
    const repeated = await post(bookingForm({}, [TIME_SLOTS[4], TIME_SLOTS[4]]));
    expect(repeated.status).toBe(400);
    expect((await repeated.json()).fields).toMatchObject({ slots: "duplicate_slot" });
  });

  it("accepts a booking with NO proof, because the dropzone is hidden", async () => {
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
