# 1a · step 05 — Lock the API contract

**Depends**: nothing — it is prose, and it was written during planning
**Blocks**: 07 (the mock implements it), Phase 3 (the form consumes it), Phase 4 (the route handlers must match it)
**Agent**: `engineering-lead`

## Status: substantially already done — verify, do not rewrite

The contract lives in the **API contract** section of [architecture.md](../architecture.md) and was written during planning. [README.md](README.md) warns about exactly this: two Phase 1a tasks were finished before the board existed while their Definition-of-Done boxes stayed unticked.

**Rewriting it would be the expensive mistake here.** It already carries the four-state-to-three-state mapping table, the honeypot's deliberate fake 201, the request-flow ordering, and the FIRM/PROVISIONAL split. Re-deriving that from scratch loses detail that took three review rounds to find.

## What actually remains

1. **The `notes` contradiction — fixed in the pre-flight pass.** `architecture.md` said `≤ 280` while the PRD field list and the `notes_length` SQL constraint both said 500. Two sources agreed and one of them was the database, so 500 won. Confirm it stayed fixed.
2. **Verify nothing else drifted** between the contract, the PRD field list, and the migration SQL. They are three copies of the same truth and only the SQL is enforced.
3. **Tick the Definition-of-Done box** in [PRD.md](../PRD.md).

## What must stay true

- `GET /api/availability` is **FIRM**. Nothing on the deferred backend agenda changes it, including the elapsed-slot question — the client derives elapsed itself from `src/domain/slots.ts`, so no `past` status is needed
- `POST /api/bookings` is **PROVISIONAL** and labelled so. Presigned-URL upload would replace the `proof` part with a `proofKey` string and change nothing else
- `rejected` and `expired` map to `available`. This is the half that gets guessed wrong, and guessing `booked` blocks slots that are genuinely open with nothing erroring
- 409 and 429 are **not interchangeable in the UI**. Showing 409 copy on a 429 tells a legitimate user their slot was taken when it was not

## Acceptance

```bash
# the three copies of notes agree
grep -rn "280" docs/architecture.md docs/PRD.md docs/database.md   # expect: no match

# field names are identical between the contract and the PRD form spec
grep -nE "teamName|proofKey|website" docs/architecture.md

# both routes still carry their firmness label
grep -n "FIRM\|PROVISIONAL" docs/architecture.md   # expect: both, unchanged

# all four response codes are specified, or step 07 mocks states it has never seen
grep -cE "^// (201|400|409|429)" docs/architecture.md
```

**Not done until** the `notes` number is the same in all three files and the DoD box is ticked with that verified, not assumed.

handoff: `software-engineer` for step 06
