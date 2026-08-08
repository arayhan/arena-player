# 1a · step 01 — Architecture plan and the two open library choices

**Depends**: nothing. This is the first step of the build.
**Blocks**: 02 (scaffold installs what this decides), 06 (`lib/shared/dates.ts` shape depends on the date choice), 08 (both choices spend budget)
**Agent**: `engineering-lead`

## Goal

Close the two library decisions the PRD leaves open, and confirm the route-split assumption the performance budget depends on. No code ships in this step — it ends with decisions written into [architecture.md](../architecture.md), which is where the next steps read them from.

## Why it is first

The budget in `architecture.md` has roughly 18–21KB of headroom for all component code across both pages. Both open choices spend from that. Deciding them after the scaffold means discovering the overrun with code already written against the loser.

## Deliverables

1. **Date handling** — native `Intl` inside a tested `lib/shared/dates.ts`, or a library. All date logic is Asia/Jakarta, window is today + 13 days, and `toISOString()` is never used for dates. Whatever wins must make `isPastSlot` cover dates *before* today, not just today's elapsed hours — that was a real bug once.
2. **Icon library** — needs per-icon tree-shaking so unused icons cost nothing. Six icons are needed: calendar, clock, upload, check, WhatsApp, map pin. AI-generated icons are banned; see `arena-player-design`.
3. **Route split confirmed** — `/` must never load `react-hook-form` or `zod`. Those are `/booking` dependencies and together they are ~22KB gzip, which is more than the entire component headroom. Write down *how* the split is enforced, not just that it is intended.
4. **Both decisions written into `architecture.md`** — the versions table and the budget table, with the measured or published gzip cost of each choice added to the budget breakdown.

## Acceptance

```bash
# both choices are recorded, not still open
grep -n "Undecided, and settled in Phase 1a task 1" docs/PRD.md   # expect: no match, or rewritten as decided
grep -nE "date handling|icon library" docs/architecture.md         # expect: names a chosen library or Intl

# the budget table accounts for them
sed -n '/| Item | ~KB gzip |/,/^$/p' docs/architecture.md
# expect: rows for dates and icons with real numbers, and a subtotal that still respects 200KB

# the route-split rule is written somewhere enforceable
grep -rn "react-hook-form" docs/architecture.md   # expect: states how / never loads it
```

**Not done until** a reader can answer "which date library, which icon library, and what does `/` cost" from `architecture.md` alone.

## Ask the user

Both choices are dependency additions, so they go through `AskUserQuestion` per the stack rule in `arena-player-gotchas`. Present the gzip cost of each option against the remaining headroom — the budget exists so this is arithmetic rather than taste.

handoff: `software-engineer` for step 02
