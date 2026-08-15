import { isTimeSlot, TIME_SLOTS, type TimeSlot } from "@/domain/slots";
import { SLOT_STATUSES } from "@/domain/status";
import type { AvailabilityRow } from "@/utils/slot-display";

/**
 * Hand-written response validators for `/booking`'s three GETs.
 *
 * THEY WERE ZOD SCHEMAS UNTIL 2026-08-15, AND THE REASON THEY ARE NOT IS A
 * MEASUREMENT. `check:budget` could not size this route until that day — it
 * reads `?date=&time=`, so it is dynamic and emits no prerendered HTML — and the
 * first real measurement put `/booking` at **264.2KB against a 240KB ceiling**.
 * zod is 63.2KB of that, and it was on the critical path purely because these
 * three checks ran the moment the page mounted.
 *
 * zod IS STILL IN THE STACK AND STILL VALIDATES THE FORM. It is now imported
 * dynamically at submit time (see `booking-form.schema.ts`), which is the same
 * device `src/lib/motion.ts` uses for GSAP: the library arrives when the visitor
 * does something, not when the page opens.
 *
 * THE PRECEDENT IS `/`'s OWN `assertContract`, in home.service.ts, written for
 * exactly this trade-off. These twenty-odd lines are not a shortcut around a
 * validation library; they are what buys a quarter of this route's budget back.
 * If you are about to "clean this up" with zod, read the number above first.
 *
 * WHAT THEY MUST KEEP CATCHING. A nine-entry contract that quietly becomes
 * eight, a slot string that is a NEAR MISS (`18.00-20.00` is a different slot to
 * `uniq_active_slot`, which compares text), and a status word outside the three
 * the contract defines. Each of those renders as a missing row or a wrong state
 * and nothing else — no error, no crash.
 */
export class ContractError extends Error {
  constructor(readonly what: string) {
    super(`malformed ${what} response`);
    this.name = "ContractError";
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

/** Nine entries, canonical order, a known status on each. */
export function assertAvailability(body: unknown): asserts body is AvailabilityRow[] {
  if (!Array.isArray(body) || body.length !== TIME_SLOTS.length) {
    throw new ContractError("availability");
  }
  body.forEach((entry, index) => {
    const valid =
      isRecord(entry) &&
      entry.slot === TIME_SLOTS[index] &&
      typeof entry.status === "string" &&
      (SLOT_STATUSES as readonly string[]).includes(entry.status);
    if (!valid) throw new ContractError("availability");
  });
}

/** Any number of rows, each a canonical slot with a non-negative integer price. */
export function assertRates(body: unknown): asserts body is { slot: TimeSlot; price: number }[] {
  if (!Array.isArray(body)) throw new ContractError("rates");
  for (const entry of body) {
    const valid =
      isRecord(entry) &&
      typeof entry.slot === "string" &&
      isTimeSlot(entry.slot) &&
      typeof entry.price === "number" &&
      Number.isInteger(entry.price) &&
      entry.price >= 0;
    if (!valid) throw new ContractError("rates");
  }
}

/**
 * Any number of accounts, each with three non-empty strings.
 *
 * AN EMPTY ARRAY IS VALID. "The field has not given us an account yet" is a
 * state this project lived in for its whole life, and the form says so in words;
 * a validator that demanded at least one would turn that into a red failure,
 * which is a different and wrong thing to tell a visitor.
 */
export function assertPaymentAccounts(body: unknown): asserts body is {
  bank: string;
  accountNumber: string;
  accountHolder: string;
}[] {
  if (!Array.isArray(body)) throw new ContractError("payment accounts");
  for (const entry of body) {
    const valid =
      isRecord(entry) &&
      typeof entry.bank === "string" &&
      entry.bank.length > 0 &&
      typeof entry.accountNumber === "string" &&
      entry.accountNumber.length > 0 &&
      typeof entry.accountHolder === "string" &&
      entry.accountHolder.length > 0;
    if (!valid) throw new ContractError("payment accounts");
  }
}
