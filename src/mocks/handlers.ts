/**
 * MSW v2 handlers implementing the API contract in docs/architecture.md.
 *
 * v2, NOT v1 — `http.get` and `HttpResponse.json`, never `rest.get` or
 * `res(ctx.json())`. The v1 forms are also banned by eslint.config.mjs, since
 * training data reaches for them.
 *
 * These are the only backend Phases 2 and 3 have. The site will look finished
 * while taking zero real bookings.
 */
import { HttpResponse, http } from "msw";

import { isWithinBookingWindow } from "@/domain/dates";
import { isTimeSlot } from "@/domain/slots";

import { availabilityFor } from "./availability";

/**
 * The deliberate error triggers, chosen so Phase 3 can exercise every failure
 * state on demand rather than waiting for luck. Typing the team name is the
 * whole mechanism — no devtools, no URL editing, and a reviewer can reproduce
 * a 409 by hand during a walkthrough.
 *
 * These strings are unreachable for a real team, and the entire folder is
 * deleted in Phase 4 — but the reason they are safe is the first property,
 * not the second.
 */
export const ERROR_TRIGGERS = {
  TEST409: 409,
  TEST429: 429,
  TEST400: 400,
} as const;

export const handlers = [
  // GET /api/availability?date=YYYY-MM-DD — FIRM contract.
  http.get("*/api/availability", ({ request }) => {
    const date = new URL(request.url).searchParams.get("date");

    if (!date || !isWithinBookingWindow(date)) {
      return HttpResponse.json({ error: "invalid_date" }, { status: 400 });
    }

    return HttpResponse.json(availabilityFor(date));
  }),

  // POST /api/bookings — PROVISIONAL shape, multipart.
  http.post("*/api/bookings", async ({ request }) => {
    const form = await request.formData();
    const teamName = String(form.get("teamName") ?? "");
    // REPEATED KEYS, NOT A JOINED STRING. One booking may cover several hours
    // since 2026-08-15, and FormData carries repeated fields natively — so
    // neither side has to agree on a separator, which matters when the values
    // themselves contain " - ".
    const slots = form.getAll("slots").map(String);
    const date = String(form.get("date") ?? "");

    // Honeypot first, before anything else can reject the request for a
    // reason a bot could learn from. Non-empty means bot: answer 201 with a
    // fabricated id and write nothing. The one place this API lies on purpose.
    if (String(form.get("website") ?? "") !== "") {
      return HttpResponse.json({ id: crypto.randomUUID(), status: "pending" }, { status: 201 });
    }

    const triggered = ERROR_TRIGGERS[teamName as keyof typeof ERROR_TRIGGERS];

    if (triggered === 409) {
      return HttpResponse.json({ error: "slot_taken" }, { status: 409 });
    }
    if (triggered === 429) {
      return HttpResponse.json({ error: "rate_limited" }, { status: 429 });
    }
    if (triggered === 400) {
      // TARGETS A RENDERED FIELD. This named `phone` until 2026-08-15, when the
      // phone input was hidden — a 400 pointing at a field the form does not
      // render marks nothing, focuses nothing, and reads as a submit button
      // that does nothing at all. The client now falls back to the form-level
      // alert for exactly that case, and this trigger still has to demonstrate
      // the normal path: a field error landing on its own input.
      return HttpResponse.json(
        { error: "validation_failed", fields: { teamName: "invalid_format" } },
        { status: 400 },
      );
    }

    // Real validation, so the form cannot pass something the Phase 4 route
    // would reject.
    //
    // isTimeSlot, NOT canonicalSlot — and the difference is the point. The
    // contract says `slot` is an EXACT member of TIME_SLOTS. canonicalSlot
    // repairs a near miss, which is right where user or URL text enters the
    // client, and wrong here: an API that silently fixes '18.00-20.00' means
    // a caller sending the wrong format never finds out, and the Phase 4 route
    // becomes the only place the format is ever enforced. This handler is the
    // rehearsal for that route, so it has to be as strict as the route must be.
    const fields: Record<string, string> = {};
    if (!isWithinBookingWindow(date)) fields.date = "invalid_date";
    if (slots.length === 0) fields.slots = "required";
    else if (!slots.every(isTimeSlot)) fields.slots = "invalid_slot";
    else if (new Set(slots).size !== slots.length) fields.slots = "duplicate_slot";
    if (teamName.trim().length < 2) fields.teamName = "too_short";

    // PROOF IS OPTIONAL WHILE THE DROPZONE IS HIDDEN, and still type-checked
    // when it arrives. Requiring it here would refuse every booking the current
    // form can produce; dropping the check entirely would let the field come
    // back with nothing rehearsing the Phase 4 route's own validation.
    const proof = form.get("proof");
    if (proof !== null && !(proof instanceof File)) fields.proof = "invalid";

    if (Object.keys(fields).length > 0) {
      return HttpResponse.json({ error: "validation_failed", fields }, { status: 400 });
    }

    return HttpResponse.json({ id: crypto.randomUUID(), status: "pending" }, { status: 201 });
  }),
];
