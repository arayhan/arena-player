# 1a · step 06 — Shared primitives, and the drift check that guards them

**Depends**: 02b (the `src/` layout exists), 03 (Vitest exists to run the tests)
**Blocks**: 07 (the mock imports these), and every later slot or date calculation in both repos
**Agent**: `software-engineer`

## Goal

Four files in `src/domain/` — `slots.ts`, `dates.ts`, `status.ts`, `phone.ts` — each with a colocated test that actually asserts, plus `pnpm check:domain`, the check that keeps the admin repo's copy identical to this one.

**Keep three of the four dependency-free.** Only `dates.ts` may import `date-fns` / `@date-fns/tz`. Every package added here is one the admin repo is obliged to install, and merging the four into one file would make a date library mandatory for anyone who only wants `TIME_SLOTS`.

**Import siblings relatively** — `from "./slots"`, never `from "@/domain/slots"`. A byte-identical copy must resolve the same in both repos regardless of either `tsconfig`. This is the one documented exception to `@/`-everywhere.

## Why these live in `src/domain/`

`arena-player-admin` talks to the same database and needs the same constants. Both repos keep a **byte-identical copy** in `src/domain/`, because `uniq_active_slot` compares `time_slot` as **text**: `'06.00 - 08.00'` and `'06.00-08.00'` are different slots to Postgres. A one-character drift means the admin writes rows this site cannot match, and **anti-double-booking silently stops working for both apps**. Nothing throws.

Full reasoning, and why a copy beat a workspace, a package, and a submodule: the shared-code contract in [architecture.md](../architecture.md).

## Deliverables

**`src/domain/slots.ts`**

- `TIME_SLOTS` — nine 2-hour slots, 06.00–24.00, in canonical order and canonical string form
- Slot canonicalisation, so a near-miss format cannot reach the database
- `slotStartHour()` or equivalent, for elapsed-slot derivation

**`src/domain/dates.ts`** — the only file here with dependencies

- Asia/Jakarta helpers. Never `toISOString()` for a date — that is the shape of the bug `database.md` already documents
- The booking window: today + 13 days
- `isPastSlot` — **must cover dates before today**, not only today's elapsed hours. That was a real bug once: yesterday was bookable without it. It needs `slotStartHour()`, so this is the one file that imports a sibling (`from "./slots"`)

**`src/domain/status.ts`** — zero dependencies

- `BOOKING_STATUSES` — the four row states: `pending`, `confirmed`, `rejected`, `expired`
- `SLOT_STATUSES` — the three API states: `available`, `pending`, `booked`
- `ACTIVE_STATUSES` — `pending` and `confirmed`, mirroring `uniq_active_slot`'s `WHERE` clause. **If this drifts from the index, the race guard changes meaning silently**
- `toSlotStatus()` — the 4→3 mapping as code. `rejected` and `expired` map to **`available`**, which architecture.md calls the half that gets guessed wrong: guessing `booked` there renders a full day that is actually empty, and nothing errors

**`src/domain/phone.ts`** — zero dependencies

- `normalisePhone()` — `08xx` or `62xx` as typed → `628xxxxxxxxx`. Shared because the site stores it and the admin searches it; two implementations means one person looks like two
- `isValidIndonesianMobile()`

**Not here, deliberately**: the booking form's zod schema (`booking-form.schema.ts` — the admin never creates a booking, and zod here would oblige the admin repo to install it) and the proof upload limits (`booking-form.proof.ts` — the admin only reads proofs).

### Two findings from Context7, verified before this step runs

Queried against `/date-fns/tz` during step 02 rather than written from recall.

**Build the timezone context once, then reuse it.** The `{ in: tz(...) }` option is correct, but the documented form hoists the context instead of re-creating it per call:

```ts
const jakarta = tz("Asia/Jakarta");
format(add(date, { days: 13 }, { in: jakarta }), "yyyy-MM-dd", { in: jakarta });
```

**Prefer `TZDateMini` over `TZDate`, and check what it saves.** The docs describe it as _"recommended for internal use when string formatting is not needed"_, and list what it drops: `toString()`, `toDateString()`, `toTimeString()`, `toISOString()`, and the three `toLocale*` methods. Same constructors, same `withTimeZone()`, same getters and setters.

Two reasons that matters here, in order of importance:

1. **It cannot break the `toISOString()` rule, because the method does not exist.** This project bans `toISOString()` anywhere near `booking_date` — it shifts to UTC and can move the date across midnight. A ban enforced by absence beats a ban enforced by review.
2. `date-fns` + `@date-fns/tz` measured **8.1KB** on `/`. `TZDateMini` may reduce that. **Measure it with `node scripts/measure-bundle.mjs`, do not assume it** — every estimate in this project so far has been wrong by 30%.

**`scripts/check-domain.mjs`** + a `check:domain` script. It was originally specified as running _inside_ `check:unit` so it could not be skipped; that bundling was replaced by `pnpm check`, which runs the whole gate and covers five checks rather than two.

## Acceptance

```bash
# all four have tests that assert something real, not just that the module imports
pnpm check:unit
grep -c "expect(" src/domain/{slots,dates,status,phone}.test.ts   # expect: non-trivial, all four

# the canonical form is exactly what the database will compare
node -e "const {TIME_SLOTS}=require('./src/domain/slots.ts');console.log(JSON.stringify(TIME_SLOTS))"
# expect: 9 entries, and the separator matches db/migrations/ exactly

# isPastSlot covers yesterday, not just this morning
grep -n "isPastSlot" src/domain/dates.test.ts   # expect: a case with a date before today

# rejected and expired map to available — the half that gets guessed wrong
grep -n "rejected\|expired" src/domain/status.test.ts   # expect: both asserted as available

# ACTIVE_STATUSES still matches the index's WHERE clause
grep -rn "pending.*confirmed" src/domain/status.ts db/migrations/

# three of the four stay dependency-free
grep -ln "date-fns\|from \"zod\"" src/domain/*.ts   # expect: dates.ts and nothing else

# the frozen copy is alias-agnostic
grep -n '@/domain' src/domain/                      # expect: no match
```

### The check must be proven to fail

A check that has only ever passed is a check nobody has tested. This repo shipped a `Stop` hook that never fired once for exactly that reason.

```bash
pnpm check:domain                                    # passes
sed -i 's/06.00 - 08.00/06.00 -08.00/' src/domain/slots.ts
pnpm check:domain ; echo "expect non-zero: $?"       # MUST fail
git checkout src/domain/slots.ts
pnpm check:domain                                    # passes again
```

**Not done until that sequence has actually been run.** Until the admin repo exists, `check:domain` may have nothing to diff against — in that case it must **skip loudly and say so**, never pass silently. A check that reports success when it did nothing is worse than no check.

handoff: `code-reviewer`, then `software-engineer` for step 07
