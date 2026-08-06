# Arena Player — Architecture

Implementation contract for how the pieces fit together. Product spec lives in [PRD.md](PRD.md); this doc is how, not what.

## System diagram

```
Browser (375px-first, Instagram in-app)
  │  GET /api/availability?date=YYYY-MM-DD        (cache ≤ 30s)
  │  POST /api/bookings (multipart: fields + proof image)
  ▼
Next.js route handlers (DATABASE_URL + R2 secrets live ONLY here)
  │  lazy expiry: pending >24h → expired, then read slots
  │  insert booking; unique violation 23505 → HTTP 409
  ▼
Neon Postgres (bookings, reached only from route handlers) + R2 (proofs, private bucket)
```

Booking flow: select slot → open wa.me (placeholder number) in new tab AND route to `/form?date=…&time=…` → submit form with proof → slot becomes PENDING → admin confirms via WhatsApp manually. Selecting a slot holds nothing; only a successful POST does.

## Database & storage decision (FINAL)

**Neon Postgres (serverless) + Cloudflare R2.** Locked — do not revisit without a new planning conversation.

Rationale: Neon's HTTP-based serverless driver fits Next.js route handlers (no connection-pool management in application code, works over fetch-friendly infrastructure). R2 has no egress fees, which matters for private payment-proof images that only the admin ever views. Both are reached exclusively from server-side route handlers — the browser never holds a connection string or R2 credential.

## Request flow

**`GET /api/availability?date=`**
1. Validate `date` is `YYYY-MM-DD` and inside the 14-day window → 400 otherwise, never 500.
2. Lazy expiry first, same request, scoped to that date: flip pending rows older than 24h to `expired`.
3. Select active rows for the date, map onto the 9 canonical `TIME_SLOTS`.
4. Respond `[{ slot, status }]` with `Cache-Control: public, s-maxage=30`.

**`POST /api/bookings`**
1. Multipart parse → honeypot check → field validation → proof validation.
2. Upload proof to R2 first.
3. Insert the booking row. Success → 201. Unique violation → 409 (see below) + best-effort delete of the just-uploaded proof.

## Anti-double-booking (non-negotiable)

The partial unique index `uniq_active_slot` on `(booking_date, time_slot) WHERE status IN ('pending', 'confirmed')` is the *only* race guard. **Never check-then-insert.** Insert, catch the unique violation, return 409. Full error-code contract and SQL: [database.md](database.md).

## Known gotchas (summary — full detail in database.md)

- **Neon date/timestamptz parsing**: the driver's default type parsers return JS `Date` objects for `DATE`/`TIMESTAMPTZ` columns, which silently corrupts `booking_date` by one day on an Asia/Jakarta machine when serialized. Must override both OID parsers to pass raw strings through. This is a blocker-class bug, found and fixed once already — see database.md for the exact fix.
- **R2 checksum headers**: the AWS SDK's default flexible-checksum behavior gets rejected by R2 on some upload paths. The `S3Client` config needs explicit checksum settings.
- **`@/` alias is bundler-only**: plain Node (used by the verification scripts below) cannot resolve it. `lib/` imports its own siblings with relative paths and explicit `.ts` extensions instead.

## Verification-script practice (required, not incidental)

Every `lib/` module that has non-trivial logic gets covered by one of two scripts, both runnable via plain `node --experimental-strip-types` with no build step:

- **`scripts/check-lib.ts`** — pure unit assertions on `lib/` functions (date math, validation, slot logic). No DB, no network. Run via `pnpm check:lib`.
- **`scripts/check-setup.ts`** — a preflight that actually connects to Neon and R2 to confirm the migration ran and credentials work, before any feature work starts on top of them. Run via `pnpm check:setup`.

This is how "Never claim done without running the command and quoting output" gets enforced mechanically instead of relying on memory. Both scripts are written as part of `docs/tasks/step-02` (execution phase, not this scaffolding pass).

## Folder structure

```
arena-player-web/
├── CLAUDE.md
├── docs/
│   ├── PRD.md
│   ├── architecture.md        # this file
│   ├── design-system.md
│   ├── database.md
│   ├── PROGRESS.md            # shared agent log, append-only
│   └── tasks/                 # empty until Phase 1 build starts
├── .claude/
│   ├── agents/
│   ├── skills/                # arena-gotchas, arena-database, arena-design
│   ├── hooks/notify.ps1
│   └── settings.json
├── db/
│   ├── migrations/            # SQL run manually in the Neon SQL editor
│   └── README.md
├── app/                        # Next.js App Router
│   ├── page.tsx
│   ├── form/page.tsx
│   └── api/
│       ├── availability/route.ts
│       └── bookings/route.ts
├── components/
├── lib/
│   ├── db/client.ts            # Neon client, OID parser override
│   ├── storage/r2.ts           # R2 client, checksum config
│   ├── dates.ts                # Asia/Jakarta date helpers
│   ├── slots.ts                # canonical TIME_SLOTS
│   ├── proof.ts                # shared upload constraints
│   ├── validation.ts
│   └── env.ts
└── scripts/
    ├── check-lib.ts
    └── check-setup.ts
```

All of the above except `docs/`, `CLAUDE.md`, and `.claude/` gets created during the Phase 1 build (`docs/tasks/step-01` onward) — not part of this scaffolding pass.

## Package versions (starting point — check for patch updates when step-01 actually runs)

| Package | Version |
|---|---|
| `next` | `^15.5.22` |
| `react` / `react-dom` | `^19.2.8` |
| `framer-motion` | `^12.43.0` |
| `@neondatabase/serverless` | `^1.1.0` |
| `@aws-sdk/client-s3` | `^3.1098.0` |
| `server-only` | `^0.0.1` |
| pnpm (`packageManager`) | `pnpm@11.17.0` |

## `lib/` import convention

`lib/` modules import their own siblings with **relative paths and explicit `.ts` extensions** (e.g. `from "./dates.ts"`), not the `@/` bundler alias — because `scripts/check-lib.ts` and `scripts/check-setup.ts` run under plain Node, which can't resolve `@/`. Both `tsconfig.json` and `scripts/tsconfig.json` need `allowImportingTsExtensions: true`. `app/` and `components/` may use `@/` normally since they only ever run through the Next.js bundler.

## Extraction boundary

`lib/` never imports from `app/`. This keeps the door open for a future `packages/shared` if Phase 3 ends up needing a monorepo (undecided, deferred until Sumopod's capabilities are known).
