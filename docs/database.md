# Arena Player — Database & Storage Contract

Deep implementation contract for Neon Postgres + Cloudflare R2. Decision rationale is in [architecture.md](architecture.md); this doc is the exact schema and the gotchas that will bite again if not respected.

> **THE LIVE DATABASE IS SUPABASE, NOT NEON — found 2026-08-17.** The client (`adminarenaplayer@gmail.com`) had already provisioned a Supabase Postgres project (`lrelwuikjiuqvlduxzdy`) before this doc's Neon plan was ever executed, matching `TIME_SLOTS` and `BOOKING_STATUSES` byte for byte. Everything below this notice — the DDL, the error-code contract, the WITA date discipline, the R2/proof ordering — is **unchanged in substance**: it is still Postgres, `23505` still means a unique-index conflict, `uniq_active_slot` is still the entire race guard, and it is verified present on the live database. Only the **connection** and the **driver** moved: `DATABASE_URL` now points at Supabase's transaction pooler (`.env.local.example`) and the client is `postgres` (postgres.js), not `@neondatabase/serverless` — see the driver note beside the schema below. R2 vs Supabase Storage for the proof upload is a **separate, still-open** decision; nothing in this doc's R2 sections has been touched by this correction.
>
> **The live schema also has three tables this file did not previously document — `slot_blocks`, `site_settings`, `bank_accounts` — provisioned for the admin app.** `slot_blocks` is added below since `GET /api/availability` now reads it. `site_settings` and `bank_accounts` are seeded with **placeholder data that must never reach a visitor** (a fabricated address and DP percentage, and a bank account that is not either of the client's real two) — see `docs/PROGRESS.md`'s 2026-08-17 entry. Nothing in this repo reads either table.

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
  -- '06.00 - 07.00' and '06.00-07.00' are different rows booking the same slot,
  -- and the race guard silently does nothing. src/domain/slots.ts canonicalises in app
  -- code; this enforces it in the database. Keep the two in lockstep.
  constraint time_slot_canonical check (time_slot in (
    '06.00 - 07.00','07.00 - 08.00','08.00 - 09.00','09.00 - 10.00','10.00 - 11.00','11.00 - 12.00',
    '12.00 - 13.00','13.00 - 14.00','14.00 - 15.00','15.00 - 16.00','16.00 - 17.00','17.00 - 18.00',
    '18.00 - 19.00','19.00 - 20.00','20.00 - 21.00','21.00 - 22.00','22.00 - 23.00','23.00 - 24.00'
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

**`slot_blocks` — an admin-side manual block, verified live 2026-08-17, no migration file in this repo.** This repo does not write to it — `arena-player-admin` does, for maintenance windows or private hire — but `GET /api/availability` reads it, so its shape is recorded here rather than only in a query comment. Reconstructed from the live schema via the Supabase MCP connection, not from a migration this repo owns:

```sql
create table slot_blocks (
  id uuid primary key default gen_random_uuid(),
  block_date date not null,
  time_slot text not null,       -- same time_slot_canonical list as bookings
  reason text,                   -- check: reason is null or length(reason) <= 200
  created_at timestamptz not null default now()
);

-- One block per (date, slot) — unconditional, no partial WHERE. A block has
-- no "active" vs "inactive" state the way a booking's status does.
create unique index uniq_slot_block on slot_blocks (block_date, time_slot);
```

`availability.ts`'s precedence: a `slot_blocks` row wins over a `bookings` row for the same slot, unconditionally — see the comment on `computeAvailability` in that file for why.

**THIS BLOCK IS THE CURRENT SCHEMA, NOT A SINGLE MIGRATION FILE, SINCE 2026-08-15.** Until then `db/migrations/` held exactly one file and this block was byte-identical to it; that stopped being possible the day a second migration arrived. `db/migrations/20260809_create_bookings.sql` creates the table with the ORIGINAL nine 2-hour slots; `db/migrations/20260815_alter_time_slot_1h.sql` drops and re-adds `time_slot_canonical` with the eighteen 1-hour slots shown above. Never edit an applied migration — this block is what running both, in order, against a fresh database produces, kept as ONE reference rather than asking a reader to mentally apply a diff.

`pnpm check:docs`'s `schema-value-drift` holds the LATEST migration, this block, and [PRD.md](PRD.md) (which carries a shorter comment-free variant of the same DDL) to the same values: `time_slot_canonical` matches `TIME_SLOTS`, `status_valid` matches `BOOKING_STATUSES`, `uniq_active_slot`'s `WHERE` matches `ACTIVE_STATUSES`, and `notes_length` is 500. An EARLIER migration's own constraint text is not compared — it is history, and is expected to show what the schema used to require, not what it requires now. Migration files are **never auto-applied** — the user runs them manually, in filename order, in the Neon SQL editor. Application code must fail loudly if the table doesn't exist yet, never silently `create table if not exists`.

## PHASE 4 CANNOT WRITE ITS ROUTE UNTIL THESE THREE ARE SETTLED

**The form moved on 2026-08-15 and the schema did not.** Deliberately: the DDL
above is the client's database truth, nothing has been applied yet, and inventing
a migration to chase a UI decision is how the two drift apart in opposite
directions. Recorded here instead, as blocking work rather than a nice-to-have.

1. **One booking now covers SEVERAL hours.** `POST /api/bookings` takes `slots`,
   repeated once per hour (see [architecture.md](architecture.md)). There is no
   multi-slot row and there must not be one: `uniq_active_slot` is a per-(date,
   slot) partial index and it is the whole anti-double-booking guard. So the
   route inserts **one row per slot inside one transaction**, and **any `23505`
   rolls the entire booking back and answers 409** naming the slot that went.
   Partial success is the outcome to design against — a visitor who asked for
   20.00–24.00 and silently got 20.00–22.00 arrives at a field they believe is
   theirs for four hours. Hard rule 1 is unchanged and now applies per row:
   insert, catch, respond; never check-then-insert.
2. **`phone text not null` has no value to store.** The input is hidden
   (`SHOW_PHONE_FIELD` in `BookingForm.tsx`) because the visitor arrives through
   the admin's WhatsApp chat, which already carries their number. The form sends
   an empty string. Either the column becomes nullable, or the admin app writes
   the number it learns from the chat, or the field comes back. **No fabricated
   number may ever be inserted to satisfy the constraint.**
3. **`proof_key text not null` has nothing to point at.** The dropzone is hidden
   for the same reason — payment proof is handled in that chat. Same three
   options, same prohibition on inventing a value. Note the knock-on: with no
   upload there is no R2 write, so the orphaned-proof sweeper below has nothing
   to sweep **while this stays hidden** — it is not solved, only dormant.

A booking that spans several slots is also a **pricing** question the rate card
has to answer: whether four hours costs twice two hours. The picker labels every
slot `Harga menyusul` until it arrives, and no number is invented in the meantime.

## Setup (3 steps, documented again in `db/README.md` at build time)

**Superseded 2026-08-17 — the client's Supabase project already exists.** The
three steps below described creating a fresh Neon project; the client's
database is already live (`lrelwuikjiuqvlduxzdy`, provisioned for the admin
app) and the migration above is already applied — `uniq_active_slot` was
verified present via the Supabase MCP connection before this note was
written. What remains from this list: copy the **Transaction pooler**
connection string (Supabase Dashboard → Project Settings → Database →
Connection string → Transaction pooler; port `6543`, host
`...pooler.supabase.com`) into `DATABASE_URL`. The **direct** string
(`db.<ref>.supabase.co:5432`) is IPv6-only on a new project without the IPv4
add-on and exhausts connections fast under concurrent serverless route
invocations either way — the same non-optional rule the three steps below
stated for Neon, unrelated vendor.

1. ~~Create a Neon project.~~ Already exists, on Supabase.
2. ~~Run the migration above in the Neon SQL editor.~~ Already applied.
3. Copy the **pooled** connection string (contains `-pooler` in the host) into `DATABASE_URL`. The direct string exhausts connections fast under concurrent serverless route invocations — this is not optional.

## Database MCP — Supabase, connected 2026-08-17, reads only

**Superseded.** `.mcp.json` never wired up Neon's MCP server — it was there once, never approved, and taken out during Phase 1a. What is actually connected is Supabase's MCP, through claude.ai's connector rather than `.mcp.json`, authorized against the client's own Supabase account (`adminarenaplayer@gmail.com`). It is how the `slot_blocks` schema above and the placeholder data flagged in `docs/PROGRESS.md` were found, and how `uniq_active_slot`'s presence was verified rather than assumed.

**The rule this section always argued for still holds, now for Supabase instead of Neon: reads only.** `execute_sql` and `list_tables` were used to inspect schema, indexes, RLS policies and row contents. `apply_migration` has not been used and must not be, for the same reason this section originally gave — a migration applied by an agent with no human re-reading it is exactly the failure mode where `uniq_active_slot` silently fails to exist and nothing throws. Migrations against this project are still run by a human in the Supabase SQL editor.

No new credential was added to `.env.local.example` for this: the MCP connection authenticates through the connector, not through a key this repo's environment carries, so there is nothing parallel to the old `NEON_API_KEY` proposal to document here.

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

## Supabase/postgres.js date gotcha — same bug, different vendor, different fix

**`src/server/db.ts` uses `postgres` (postgres.js), not `@neondatabase/serverless`**, and it has the identical default: `date`/`timestamptz` columns parse into JS `Date` objects, which shifts `booking_date` by a day on a WITA machine exactly as described above. The fix here is NOT a global type-parser override — `src/server/availability.ts` is the only caller today, and its query casts the column at the SQL level instead: `select booking_date::text ...` (in practice `time_slot`, which is already `text`, and `block_date::text` in the `slot_blocks` read). Casting in the query is easier to verify by reading the query than a driver-level option buried in `db.ts`.

**If a second caller ever needs a date column from `sql`, it must cast it the same way.** Do not "fix this properly" with a global type-parser override without re-reading this paragraph and the comment on `sql` in `db.ts` — the two must not disagree about which mitigation is authoritative.

`postgres.js` also needs `{ prepare: false }` when the connection is Supabase's transaction-mode pooler — pgbouncer in that mode does not support prepared statements, and postgres.js uses them by default. Already set in `db.ts`; recorded here so the reason survives a future "why is this off" question.

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

- Asia/Makassar (WITA) only — the field is in Lombok, one hour ahead of Jakarta. `toISOString()` is banned anywhere touching `booking_date` — it shifts to UTC and can move the date across midnight, which is the same class of bug as the Neon parser issue above, just in application code instead of the driver.
- `isPastSlot()` must treat any date **strictly before today** as past, not just check whether today's slot start hour has already passed. This was a real bug, already found and fixed once: without the date check, yesterday's slots were incorrectly bookable. Don't let it regress.

## `src/modules/booking-form/booking-form.proof.ts` contract

Single shared source for the upload constraint: 2MB size limit, `jpg`/`png`/`webp` mime allowlist. Consumed by **both** the API route (authoritative — the route must re-check server-side, never trust client-side validation alone) and the form UI (as a hint, for fast feedback before upload). This file exists specifically because these numbers drifted apart between the route and the form the first time they were written separately, with no shared source.

## Env vars

Documented in `.env.local.example`. Five vars: `DATABASE_URL` (Supabase Postgres, transaction pooler — see the notice at the top of this file), `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`. No values live in this doc — see the example file.
