# Testing and verification

Read before writing or changing a test, and before claiming anything works.

**Authority:** this file is the single source for how verification is done here. The requirement that non-trivial modules carry tests is [CLAUDE.md](../../CLAUDE.md) hard rule 8 — that rule wins; this file says how to satisfy it. Verification _practice_ rationale (why Vitest, why the two-run split) is in [architecture.md](../../docs/architecture.md).

---

## The one rule that outranks the rest

**Never claim something works without running the check and quoting the decisive output line.**

Not "tests pass" — the line that says so. Not "the build is clean" — the summary. A claim without evidence is the failure mode this repo has paid for repeatedly, and it is why every task file here writes its acceptance criteria as runnable commands rather than prose.

---

## Commands

| Command             | Proves                                                                   |
| ------------------- | ------------------------------------------------------------------------ |
| `pnpm check`        | all of the below except ship/budget, cheapest first — the whole gate     |
| `pnpm lint`         | banned APIs, route-split zones, the `@/` form of all three import rules  |
| `pnpm typecheck`    | types resolve                                                            |
| `pnpm format:check` | formatting is settled, not argued                                        |
| `pnpm check:unit`   | logic gives the right answers — **no credentials, ever**                 |
| `pnpm check:domain` | `src/domain/` has not drifted from the admin repo's copy                 |
| `pnpm check:docs`   | the docs still describe reality, and the relative form of the same rules |
| `pnpm check:ship`   | all of `check`, plus a build and the per-route budget                    |
| `pnpm check:budget` | no route breaches the ceiling in architecture.md                         |

`check:unit` runs `vitest run src` — the glob is `src/`, so **a test outside `src/` is never run by the gate.** Anything needing credentials lives outside that glob on purpose (`check:setup` arrives in Phase 4), because a unit gate that cannot run on a fresh clone is a gate people stop running.

---

## Writing tests

**Colocate.** `slots.ts` → `slots.test.ts`, beside it. Never a parallel `__tests__` tree.

**Every non-trivial module under `src/` gets one.** "Non-trivial" means it can be wrong in a way that compiles. `cn()` qualified; a re-export does not.

**Assert behaviour, not implementation.** A test that mirrors the code line for line fails when you rename something and passes when the logic breaks.

### Pin the clock, never read it

`vitest.config.ts` pins `TZ=UTC`, and that pin is what makes the date tests mean anything. Tests use fixed instants:

```ts
// RIGHT — a fixed instant, and one chosen to be decisive
const LATE_EVENING = new Date("2026-08-09T16:30:00Z");

// WRONG — passes on the author's machine, fails in CI, or worse: passes everywhere
const now = new Date();
```

**Choose the instant so it can only pass for the right reason.** The field runs on WITA (UTC+8). `16:30Z` is 23:30 the previous day in WIB and 00:30 the next day in WITA — so a helper that quietly reverted to `Asia/Jakarta` _fails_. An earlier instant (`18:30Z`) distinguished the timezone from UTC but not from WIB, and would have passed either way. That is the difference between a test and a decoration.

Demonstrated, not argued: removing the timezone context from `todayAtField` turned three tests red under the pin, while the same broken helper returned the _expected_ answer on a developer machine already set to the field's zone.

---

## A check that has only ever passed is a check nobody has tested

**When you add a check, plant a violation, watch it fail, then revert.** Quote the failure.

This is not ceremony. This repo shipped:

- a `Stop` hook that exited 0 on a real violation and never fired once, all session
- a `check:docs` assertion that passed against a value the target file does not contain
- a `slot-canonical-drift` check that compared three prose mentions against nine real constraints — a checker taken in by the exact confusion it exists to catch

Each was found by planting a failure, none by reading the code.

**No `passWithNoTests`.** A run that matched zero files and exited 0 is the same defect wearing a different hat: the glob breaks, the gate goes green, and nothing raises.

---

## Two assertions per bug you fix

When a test catches a real defect, pin **the boundary**, not just the case:

- `isPastSlot` at exactly `12:00` — a slot starting this second cannot be sold to a team that has to travel, so the boundary is inclusive by decision and named in a test.
- `normalisePhone` at 10 and 13 digits — the true Indonesian mobile range is `8` plus 8–11 more, and both ends are asserted.

Both of those started as _wrong expectations in the test_, corrected against the code. Write down which side won and why, or the next session re-litigates it.
