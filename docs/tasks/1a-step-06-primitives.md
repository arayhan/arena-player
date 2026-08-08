# 1a · step 06 — Shared primitives, and the drift check that guards them

**Depends**: 02 (repo runs), 03 (Vitest exists to run the tests)
**Blocks**: 07 (the mock imports these), and every later slot or date calculation in both repos
**Agent**: `software-engineer`

## Goal

`lib/shared/slots.ts` and `lib/shared/dates.ts`, each with a colocated test that actually asserts, plus `pnpm check:shared` — the check that keeps the admin repo's copy identical to this one.

## Why these live under `shared/`

`arena-player-admin` talks to the same database and needs the same constants. Both repos keep a **byte-identical copy** in `lib/shared/`, because `uniq_active_slot` compares `time_slot` as **text**: `'06.00 - 08.00'` and `'06.00-08.00'` are different slots to Postgres. A one-character drift means the admin writes rows this site cannot match, and **anti-double-booking silently stops working for both apps**. Nothing throws.

Full reasoning, and why a copy beat a workspace, a package, and a submodule: the shared-code contract in [architecture.md](../architecture.md).

## Deliverables

**`lib/shared/slots.ts`**
- `TIME_SLOTS` — nine 2-hour slots, 06.00–24.00, in canonical order and canonical string form
- Slot canonicalisation, so a near-miss format cannot reach the database
- `slotStartHour()` or equivalent, for elapsed-slot derivation

**`lib/shared/dates.ts`**
- Asia/Jakarta helpers. Never `toISOString()` for a date — that is the shape of the bug `database.md` already documents
- The booking window: today + 13 days
- `isPastSlot` — **must cover dates before today**, not only today's elapsed hours. That was a real bug once: yesterday was bookable without it

**`scripts/check-shared.mjs`** + a `check:shared` script that runs inside `check:lib`, so it cannot be skipped.

## Acceptance

```bash
# the tests assert something real, not just that the module imports
pnpm check:lib
grep -c "expect(" lib/shared/slots.test.ts lib/shared/dates.test.ts   # expect: non-trivial

# the canonical form is exactly what the database will compare
node -e "const {TIME_SLOTS}=require('./lib/shared/slots.ts');console.log(JSON.stringify(TIME_SLOTS))"
# expect: 9 entries, and the separator matches db/migrations/ exactly

# isPastSlot covers yesterday, not just this morning
grep -n "isPastSlot" lib/shared/dates.test.ts   # expect: a case with a date before today
```

### The check must be proven to fail

A check that has only ever passed is a check nobody has tested. This repo shipped a `Stop` hook that never fired once for exactly that reason.

```bash
pnpm check:shared                                    # passes
sed -i 's/06.00 - 08.00/06.00 -08.00/' lib/shared/slots.ts
pnpm check:shared ; echo "expect non-zero: $?"       # MUST fail
git checkout lib/shared/slots.ts
pnpm check:shared                                    # passes again
```

**Not done until that sequence has actually been run.** Until the admin repo exists, `check:shared` may have nothing to diff against — in that case it must **skip loudly and say so**, never pass silently. A check that reports success when it did nothing is worse than no check.

handoff: `code-reviewer`, then `software-engineer` for step 07
