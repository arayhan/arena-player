---
name: arena-player-database
description: Use before any Neon, R2, SQL, migration, storage, or API route work in arena-player-web. Error-code contract and the Neon/R2-specific gotchas for this project.
---

# Arena Player — database gotchas

Full detail: [docs/database.md](../../../docs/database.md). This skill is the sharpest-traps quick-reference — the doc has the complete SQL, setup steps, and reasoning, this file should not drift from it.

## The three traps that will bite again if not respected

1. **Neon date parser bug (BLOCKER-class).** `neon()`'s default parsers return JS `Date` objects for `DATE`/`TIMESTAMPTZ` columns, silently shifting `booking_date` back one day on Asia/Jakarta machines. Fix: override both OID parsers (`1082`, `1184`) to pass raw strings through. Verify: `types.getTypeParser(1082)('2026-08-01')` must return the string, not a `Date`.
2. **R2 checksum headers.** `S3Client` needs `requestChecksumCalculation: "WHEN_REQUIRED"` and `responseChecksumValidation: "WHEN_REQUIRED"` or R2 rejects the AWS SDK's default flexible-checksum headers on some upload paths.
3. **`isPastSlot` must cover dates before today**, not just check today's hour — this was a real bug once (yesterday was bookable without it).

## Error-code contract

`isSlotConflict()` checks BOTH `error.code === '23505'` AND `constraint === 'uniq_active_slot'` — a bare code check would misreport an unrelated unique violation as "slot taken."

## Other rules

- **Never check-then-insert.** Insert, catch, return 409.
- Migrations run manually in the Neon SQL editor. Never auto-applied, never `create table if not exists` as a silent fallback.
- Use the **pooled** connection string (`-pooler` in host) — the direct string exhausts connections under concurrent serverless invocations.
- R2 bucket is private, no public URLs ever. `proof_key` stores the object key (renamed from `proof_url` — the old name invited treating it as a src). Upload before insert; on 409, best-effort delete the orphan (swallow its own errors).
- `src/` uses the `@/` alias normally (it resolves to `./src/*`); the one exception is `src/domain/`, which imports its own siblings relatively so the byte-identical copy resolves in both repos. The old "relative paths + explicit `.ts` extensions" rule existed only because the verification scripts ran under plain Node; they run under Vitest now, which resolves `@/`, so the rule is retired.
- Every non-trivial function under `src/` gets a colocated Vitest `*.test.ts` (`pnpm check:lib`, glob `src/`). The live Neon + R2 preflight is `scripts/check-setup.test.ts` (`pnpm check:setup`, Phase 4) — keep it under `scripts/` so `check:lib` never needs credentials.
- **The Neon MCP was removed from `.mcp.json` in Phase 1a and must not be re-added casually.** It grants an agent SQL execution and migration application — exactly what the manual-migration rule above forbids — and the failure it enables is silent: a `bookings` table created without `uniq_active_slot` turns off anti-double-booking with no error anywhere. Conditions for bringing it back are on the Phase 4 agenda in docs/PRD.md.
- **Orphaned R2 objects have no cleanup path yet.** Upload succeeds before the insert, so a process that dies between them leaves a file no row points at — and the 409 handler's `deleteProof()` cannot run in a process that already died. Nothing in the system can detect it. Likely an R2 lifecycle rule on the `proofs/` prefix; Phase 4, and it lives in the R2 dashboard rather than this repo, so it is the kind of thing that gets lost at handover.
