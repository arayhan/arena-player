import { isWithinBookingWindow } from "@/domain/dates";
import { isTimeSlot } from "@/domain/slots";

/**
 * `POST /api/bookings` — A DEMO STUB. IT STORES NOTHING.
 *
 * READ THIS BEFORE TRUSTING A 201 FROM THIS ROUTE. It validates, it answers with
 * a generated id, and **no row is written anywhere** — there is no database in
 * this project yet. A visitor who books here has told nobody anything. The
 * client is being shown a working-looking flow on purpose, and this comment is
 * the thing standing between that and somebody believing a booking landed.
 *
 * WHAT PHASE 4 MUST ADD, AND WHY IT CANNOT BE APPROXIMATED HERE:
 *
 *   1. INSERT ONE ROW PER SLOT IN ONE TRANSACTION. A booking may cover several
 *      hours; partial success is the outcome to design against.
 *   2. NEVER CHECK-THEN-INSERT. Insert, catch Postgres `23505`, answer 409.
 *      `uniq_active_slot` is the entire anti-double-booking guard, and a route
 *      that asks "is this free?" before writing has already lost the race.
 *   3. RATE LIMIT BEFORE PARSING, and upload the proof before the insert, in
 *      the order architecture.md sets out.
 *
 * This file does none of that, because a stub that half-implements a race guard
 * is worse than one that visibly implements none: the first invites trust.
 *
 * THE ERROR TRIGGERS SURVIVE THE MOVE FROM MSW. Typing one of three team names
 * reaches the 409, 429 and 400 states with no devtools and no URL editing, so a
 * reviewer can reproduce each by hand during a walkthrough. They are unreachable
 * for a real team name, which is the property that makes them safe — not the
 * fact that they were once in a mock folder.
 */
const ERROR_TRIGGERS = {
  TEST409: 409,
  TEST429: 429,
  TEST400: 400,
} as const;

export async function POST(request: Request): Promise<Response> {
  const form = await request.formData();
  const teamName = String(form.get("teamName") ?? "");
  // REPEATED KEYS, NOT A JOINED STRING. One booking may cover several hours, and
  // FormData carries repeated fields natively — so neither side has to agree on
  // a separator, which matters when the values themselves contain " - ".
  const slots = form.getAll("slots").map(String);
  const date = String(form.get("date") ?? "");

  // Honeypot first, before anything else can reject the request for a reason a
  // bot could learn from. Non-empty means bot: answer 201 with a fabricated id
  // and write nothing. The one place this API lies on purpose — and today the
  // only difference from the honest path is the id.
  if (String(form.get("website") ?? "") !== "") {
    return Response.json({ id: crypto.randomUUID(), status: "pending" }, { status: 201 });
  }

  const triggered = ERROR_TRIGGERS[teamName as keyof typeof ERROR_TRIGGERS];
  if (triggered === 409) return Response.json({ error: "slot_taken" }, { status: 409 });
  if (triggered === 429) return Response.json({ error: "rate_limited" }, { status: 429 });
  if (triggered === 400) {
    // Targets a RENDERED field. A 400 naming an input the form does not render
    // marks nothing and focuses nothing, which reads as a broken submit button.
    return Response.json(
      { error: "validation_failed", fields: { teamName: "invalid_format" } },
      { status: 400 },
    );
  }

  // Real validation, so the form cannot pass something the Phase 4 route would
  // reject. `isTimeSlot`, NOT a repairing helper: the contract says each entry
  // is an EXACT member of TIME_SLOTS, and an API that silently fixes
  // "18.00-20.00" means a caller sending the wrong format never finds out —
  // while `uniq_active_slot` compares `time_slot` as TEXT and would treat the
  // near miss as a different hour.
  const fields: Record<string, string> = {};
  if (!isWithinBookingWindow(date)) fields.date = "invalid_date";
  if (slots.length === 0) fields.slots = "required";
  else if (!slots.every(isTimeSlot)) fields.slots = "invalid_slot";
  else if (new Set(slots).size !== slots.length) fields.slots = "duplicate_slot";
  if (teamName.trim().length < 2) fields.teamName = "too_short";

  // Proof is optional while the dropzone is hidden, and still type-checked when
  // it arrives. Requiring it would refuse every booking the current form can
  // produce; dropping the check would let the field return with nothing
  // rehearsing the Phase 4 route's own validation.
  const proof = form.get("proof");
  if (proof !== null && !(proof instanceof File)) fields.proof = "invalid";

  if (Object.keys(fields).length > 0) {
    return Response.json({ error: "validation_failed", fields }, { status: 400 });
  }

  return Response.json({ id: crypto.randomUUID(), status: "pending" }, { status: 201 });
}
