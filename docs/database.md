# Arena Player — Database & Storage Contract

Deep implementation contract for Neon Postgres + Cloudflare R2. Decision rationale is in [architecture.md](architecture.md); this doc is the exact schema and the gotchas that will bite again if not respected.

## Schema

```sql
-- Arena Player — bookings table (schema contract from docs/PRD.md, do not drift).
-- Run manually in the Neon SQL editor. Never auto-applied.
--
-- Wrapped in a transaction on purpose: a paste that fails halfway must not
-- leave the table created WITHOUT uniq_active_slot, which would silently turn
-- off anti-double-booking with no runtime error anywhere.
begin;

create table bookings (
  id uuid primary key default gen_random_uuid(),
  booking_date date not null,
  time_slot text not null,
  team_name text not null,
  phone text not null,          -- normalised to 628xxxxxxxxx, never as-typed
  notes text,
  proof_key text not null,      -- R2 object KEY in the private bucket, NOT a URL
  status text not null default 'pending',
  created_at timestamptz not null default now(),

  -- uniq_active_slot below compares time_slot as TEXT. Without this constraint
  -- '06.00 - 08.00' and '06.00-08.00' are different rows booking the same slot,
  -- and the race guard silently does nothing. src/domain/slots.ts canonicalises in app
  -- code; this enforces it in the database. Keep the two in lockstep.
  constraint time_slot_canonical check (time_slot in (
    '06.00 - 08.00','08.00 - 10.00','10.00 - 12.00','12.00 - 14.00','14.00 - 16.00',
    '16.00 - 18.00','18.00 - 20.00','20.00 - 22.00','22.00 - 24.00'
  )),
  constraint status_valid check (status in ('pending','confirmed','rejected','expired')),
  constraint notes_length check (notes is null or length(notes) <= 500)
);

-- Anti double-booking: only one ACTIVE booking per slot.
-- The API relies on this index (23505 -> HTTP 409). Never check-then-insert.
create unique index uniq_active_slot
  on bookings (booking_date, time_slot)
  where status in ('pending', 'confirmed');

-- Lazy expiry filters pending rows for one date by age; uniq_active_slot already
-- covers the availability read, so this is the only supporting index needed.
create index bookings_pending_expiry_idx
  on bookings (booking_date, created_at)
  where status = 'pending';

commit;
```

This file lives at `db/migrations/<timestamp>_create_bookings.sql` once the Phase 1 build starts. Migration files are **never auto-applied** — the user runs them manually in the Neon SQL editor. Application code must fail loudly if the table doesn't exist yet, never silently `create table if not exists`.

## Setup (3 steps, documented again in `db/README.md` at build time)

1. Create a Neon project.
2. Run the migration above in the Neon SQL editor.
3. Copy the **pooled** connection string (contains `-pooler` in the host) into `DATABASE_URL`. The direct string exhausts connections fast under concurrent serverless route invocations — this is not optional.

## Neon MCP — removed until Phase 4, deliberately

`.mcp.json` no longer wires up Neon's MCP server. It was there, it was never approved, and it was taken out during Phase 1a rather than left to be switched on by whoever reaches the backend first.

**The reason is the rule directly above.** Migrations here are run by hand in the Neon SQL editor. The MCP exists to give an agent SQL execution and migration application — the exact capability that rule forbids — and the failure it enables is the silent one this file already warns about: a `bookings` table created without `uniq_active_slot` turns off anti-double-booking with no error anywhere, and that partial index is the only race guard in the system. One helpful tool call, no exception thrown, double bookings in production.

Nothing was touched by it, because it never connected. But it was dormant by accident rather than by decision, and Phases 1a–3 run entirely against the MSW mock, so nothing needs it before Phase 4.

**Conditions for bringing it back** — on the Phase 4 agenda in [PRD.md](PRD.md):

- A written rule limiting agents to **reads**: inspect schema and connection state, never run DDL, never apply a migration.
- `NEON_API_KEY` documented in `.env.local.example`, which it never was. It is a Neon **platform API key** from the console's API Keys page — a *different* credential from `DATABASE_URL`, which is the Postgres connection itself. It is never committed; `.mcp.json` references `${NEON_API_KEY}` and the value lives in your own shell environment.
- The package name verified against current docs. The previous entry (`@neondatabase/mcp-server-neon`) was written from training knowledge and never confirmed against `https://neon.tech/docs`.

## Error-code contract

```
UNIQUE_VIOLATION = "23505"
SLOT_CONSTRAINT  = "uniq_active_slot"
```

`isSlotConflict()` must check **both** the error code AND the constraint name — not just `code === '23505'`. A bare code check would misreport an unrelated unique violation (e.g. a future constraint on a different column) as "this slot is taken," which is a confusing 409 for a completely different bug. Match on the specific constraint name every time.

## Neon date/timestamptz gotcha (BLOCKER-class, found and fixed once already — do not regress)

`neon()`'s default pg-types parsers return **JS `Date` objects** for `DATE` (oid `1082`) and `TIMESTAMPTZ` (oid `1184`) columns, not strings. On an Asia/Jakarta (UTC+7) machine, this silently shifts `booking_date` back one day when serialized:

```
'2026-08-01'  →  Date object  →  JSON.stringify  →  '2026-07-31T17:00:00.000Z'
```

That's the exact -1-day corruption the date helpers in `src/domain/dates.ts` exist to prevent — except this one arrives through the driver, invisibly, where TypeScript can't catch it because driver rows are cast, not validated.

**Fix**: override both OID parsers via `CustomTypesConfig` when constructing the Neon client, so they pass the raw string through unmodified instead of parsing to a `Date`:

```ts
const customTypes: CustomTypesConfig = {
  getTypeParser: (id, format) => {
    if (id === 1082 || id === 1184) return (value: string) => value;
    return types.getTypeParser(id, format);
  },
};
```

Verify this is working with: `types.getTypeParser(1082)('2026-08-01')` must return the string `'2026-08-01'`, not a `Date` instance. Any future "simplification" of the Neon client that drops this override reintroduces a silent booking-date corruption bug — this paragraph exists so that doesn't happen quietly.

## R2 checksum gotcha

R2 rejects the AWS SDK's default flexible-checksum headers on some upload paths. The `S3Client` config must set:

```ts
requestChecksumCalculation: "WHEN_REQUIRED",
responseChecksumValidation: "WHEN_REQUIRED",
```

Without this, uploads can fail in ways that look like a credentials or network problem but aren't.

## R2 key / privacy contract

- Bucket `arena-player-proofs` is **private** — no public URL access, ever.
- `proofKey()` builds `proofs/${bookingDate}/${crypto.randomUUID()}.${extensionForMime(mime)}` — the extension comes from the **validated** mime type, never the client-supplied filename. Trusting a client filename for the extension is a path-injection surface.
- The `proof_key` column stores the R2 object **key**, never a public URL — there is no public URL to store, since the bucket has none. It was renamed from `proof_url` for exactly that reason: the old name invited someone to render it as an image `src`.

## Upload-then-insert ordering

Upload the proof to R2 **before** the database insert. If the insert then returns a 409 (lost the slot race), call `deleteProof()` to best-effort clean up the orphaned object. `deleteProof()` must swallow its own errors — a failed cleanup must never turn a clean 409 response into a 500.

## `src/domain/dates.ts` contract

- Asia/Jakarta only. `toISOString()` is banned anywhere touching `booking_date` — it shifts to UTC and can move the date across midnight, which is the same class of bug as the Neon parser issue above, just in application code instead of the driver.
- `isPastSlot()` must treat any date **strictly before today** as past, not just check whether today's slot start hour has already passed. This was a real bug, already found and fixed once: without the date check, yesterday's slots were incorrectly bookable. Don't let it regress.

## `src/modules/booking-form/booking-form.proof.ts` contract

Single shared source for the upload constraint: 2MB size limit, `jpg`/`png`/`webp` mime allowlist. Consumed by **both** the API route (authoritative — the route must re-check server-side, never trust client-side validation alone) and the form UI (as a hint, for fast feedback before upload). This file exists specifically because these numbers drifted apart between the route and the form the first time they were written separately, with no shared source.

## Env vars

Documented in `.env.local.example`. Five vars: `DATABASE_URL` (Neon, pooled), `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`. No values live in this doc — see the example file.
