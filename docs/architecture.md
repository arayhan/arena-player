# Arena Player — Architecture

Implementation contract for how the pieces fit together. Product spec lives in [PRD.md](PRD.md); this doc is how, not what.

## System diagram

```
Browser (375px-first, Instagram in-app)
  │  GET /api/availability?date=YYYY-MM-DD        (cache ≤ 30s)
  │  POST /api/bookings (multipart: fields + proof image)   [PROVISIONAL]
  ▼
Next.js route handlers (DATABASE_URL + R2 secrets live ONLY here)
  │  lazy expiry: pending >24h → expired, then read slots
  │  insert booking; unique violation 23505 → HTTP 409
  ▼
Neon Postgres (bookings, reached only from route handlers) + R2 (proofs, private bucket)
```

**`POST /api/bookings` is provisional** pending the deferred backend discussion. The presigned-URL option on that agenda has the browser PUT the proof straight to R2 and then POST only the resulting object key — which removes multipart from this diagram entirely. Do not treat the multipart shape as settled.

Booking flow: select slot → open wa.me (placeholder number) in new tab AND route to `/booking?date=…&time=…` → submit form with proof → slot becomes PENDING → admin confirms via WhatsApp manually. Selecting a slot holds nothing; only a successful POST does.

## API contract

Written during Phase 1a task 5, before any UI consumes it. Phases 2–3 build against MSW handlers implementing exactly these shapes — agents must read this section rather than inventing response bodies.

**`GET /api/availability?date=YYYY-MM-DD` — FIRM.** Nothing on the backend agenda changes it.

```jsonc
// 200
[
  { "slot": "06.00 - 08.00", "status": "available" },
  { "slot": "08.00 - 10.00", "status": "pending" },
  { "slot": "10.00 - 12.00", "status": "booked" }
  // …9 entries total, always all 9, always in canonical order
]
// 400 — malformed date, or outside the 14-day window
{ "error": "invalid_date" }
```

`status` is one of `available` | `pending` | `booked`. Today's slots whose start time has passed come back as `booked` — the client renders them disabled, never hidden.

**`POST /api/bookings` — PROVISIONAL.** Shape below assumes multipart; presigned-URL upload would replace the file part with a `proofKey` string.

```jsonc
// 201
{ "id": "uuid", "status": "pending" }
// 409 — slot taken between page load and submit
{ "error": "slot_taken" }
// 400 — validation failure
{ "error": "validation_failed", "fields": { "phone": "invalid_format" } }
```

The 409 is the one the UI must handle visibly: it maps to "Yah, slot ini baru saja diambil orang lain." with a link back to `/#order`.

## Database & storage decision (FINAL)

**Neon Postgres (serverless) + Cloudflare R2.** Locked — do not revisit without a new planning conversation.

Rationale: Neon's HTTP-based serverless driver fits Next.js route handlers (no connection-pool management in application code, works over fetch-friendly infrastructure). R2 has no egress fees, which matters for private payment-proof images that only the admin ever views. Both are reached exclusively from server-side route handlers — the browser never holds a connection string or R2 credential.

## Request flow

**`GET /api/availability?date=`**
1. Validate `date` is `YYYY-MM-DD` and inside the 14-day window → 400 otherwise, never 500.
2. Lazy expiry first, same request, scoped to that date: flip pending rows older than 24h to `expired`.
3. Select active rows for the date, map onto the 9 canonical `TIME_SLOTS`.
4. Respond `[{ slot, status }]` with `Cache-Control: public, s-maxage=30`.

**`POST /api/bookings`** — steps 1–2 are **provisional**; presigned-URL upload would move the R2 write to the browser and leave this handler validating an object key instead.
1. Multipart parse → honeypot check → field validation → proof validation.
2. Upload proof to R2 first.
3. Insert the booking row. Success → 201. Unique violation → 409 (see below) + best-effort delete of the just-uploaded proof.

## Anti-double-booking (non-negotiable)

The partial unique index `uniq_active_slot` on `(booking_date, time_slot) WHERE status IN ('pending', 'confirmed')` is the *only* race guard. **Never check-then-insert.** Insert, catch the unique violation, return 409. Full error-code contract and SQL: [database.md](database.md).

## Known gotchas (summary — full detail in database.md)

- **Neon date/timestamptz parsing**: the driver's default type parsers return JS `Date` objects for `DATE`/`TIMESTAMPTZ` columns, which silently corrupts `booking_date` by one day on an Asia/Jakarta machine when serialized. Must override both OID parsers to pass raw strings through. This is a blocker-class bug, found and fixed once already — see database.md for the exact fix.
- **R2 checksum headers**: the AWS SDK's default flexible-checksum behavior gets rejected by R2 on some upload paths. The `S3Client` config needs explicit checksum settings.
- ~~**`@/` alias is bundler-only**~~ — **no longer applies.** This was true while the verification scripts ran under plain Node. They run under Vitest now, which resolves `@/` via `tsconfig` paths, so `lib/` imports normally. Kept here struck through because the old rule is quoted in several places and anyone who remembers it needs to see that it was retired, not forgotten.

### GSAP gotchas (the cost of dropping Framer Motion)

Framer Motion handled `prefers-reduced-motion` for free via `useReducedMotion`. GSAP does not, and design-system.md mandates that check on **every** animated component — so the swap is only safe if the mechanism below replaces it. These are blocker-class if skipped.

- **Reduced motion is manual.** All animation goes through a single `gsap.matchMedia()` wrapper in `lib/motion.ts`. Calling `gsap.to()` directly inside a component is **banned** — that is precisely how the rule gets silently skipped on one component and ships.
- **React cleanup needs `useGSAP()`** from `@gsap/react`. A bare `gsap.to()` inside `useEffect` leaks animations on remount under React 19 Strict Mode; the double-invoke in development makes this look intermittent rather than broken.
- **ScrollTrigger registration is client-only.** Register under `'use client'` with `gsap.registerPlugin(ScrollTrigger)`, and refresh on navigation between `/` and `/booking` — App Router client-side transitions do not recalculate trigger positions on their own.
- **Licensing must be verified at install.** This is a paid client project, so confirming GSAP's current terms for commercial use is a commercial check, not an academic one. Do not assume from memory.

### WebGL hero moment (permitted exception, conditions are the whole point)

Exactly one WebGL effect is allowed, in the hero only. It is permitted because it is built to be deletable:

- **Hero only** — never in, above, or adjacent to the order section.
- **`next/dynamic` with `ssr: false`**, mounted only after the order section is interactive. Never in the critical path, never the LCP element.
- **Static fallback renders first** and stays if WebGL context creation fails.
- **Disabled** under `prefers-reduced-motion` and under `navigator.connection.saveData`.
- **≤ 40KB gzip** for the lazy chunk (see the performance budget above).
- **Removable in one commit** — no other component may import from it.

## Performance budget (the single source — reference it, never copy the numbers)

Written during Phase 1a task 7. Its purpose is to make every future "can we add library X?" a question of arithmetic rather than taste.

| Budget line | Limit |
|---|---|
| Initial JS, first load | **≤ 200KB gzip** |
| Lazy WebGL chunk (hero only, see below) | **≤ 40KB gzip** |
| LCP, mid-range mobile | **< 2.5s** |
| Lighthouse mobile Performance | **≥ 85** |

Where the initial-load number comes from — all figures approximate, **replace with measured values once `pnpm install` and a production build have actually run**:

| Item | ~KB gzip |
|---|---|
| Next.js 15 + React 19 baseline | ~90 |
| GSAP + ScrollTrigger + `@gsap/react` | ~35 |
| TanStack Query | ~13 |
| axios | ~13 |
| **Subtotal before any app code** | **~151** |
| Headroom for components | ~50 |

The 40KB WebGL cap is what excludes three.js (~150KB gzip) and pixi.js (~140KB) — by arithmetic, not by naming them. It still permits the effect: a hand-written GLSL fragment shader on a fullscreen quad costs ~3–5KB with no library at all, and OGL is ~10KB. A gradient-mesh or noise-field hero — which is what most light-theme Awwwards heroes actually are — fits comfortably. Reach for the shader, not the engine.

## Verification practice (required, not incidental)

Every `lib/` module that has non-trivial logic gets covered by one of two Vitest runs:

- **`pnpm check:lib`** → `vitest run lib` — pure unit assertions on `lib/` functions (date math, validation, slot logic), in `*.test.ts` files colocated beside the module they cover. No DB, no network, no credentials. Runs in CI and on any machine that has only cloned the repo.
- **`pnpm check:setup`** → `vitest run scripts` — a preflight that actually connects to Neon and R2 to confirm the migration ran and credentials work, before any feature work starts on top of them. Needs `.env.local`. **Built in Phase 4, not Phase 1a** — there is no Neon project and no R2 bucket before the backend phase, so writing it earlier produces a check that can only fail.

The two are kept as separate globs on purpose: `check:lib` must never need credentials, or it stops being runnable at the moment it is most useful.

This is how "Never claim done without running the command and quoting output" gets enforced mechanically instead of relying on memory.

### Why Vitest and not a hand-rolled Node script

An earlier draft of this document specified two plain scripts run under `node --experimental-strip-types`, chosen for zero dependencies. That version has a hidden cost that outweighs the saved dependency: plain Node cannot resolve the `@/` bundler alias, so **every** `lib/` module would have been forced to import its siblings by relative path with explicit `.ts` extensions, and both `tsconfig.json` and `scripts/tsconfig.json` would have needed `allowImportingTsExtensions: true`. That is production import style being bent to suit a test harness.

Vitest resolves `@/` through `tsconfig` paths, which removes that constraint entirely, and adds per-test isolation (one failing assertion no longer aborts the rest of the run), real failure diffs, and watch mode. `check:setup` goes through Vitest too rather than staying a plain script — otherwise the `@/` restriction survives in `lib/db/` and `lib/storage/` and the whole trade is lost for nothing.

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
│   ├── booking/page.tsx
│   └── api/
│       ├── availability/route.ts
│       └── bookings/route.ts
├── components/
├── mocks/                      # MSW handlers implementing the API contract above
├── lib/                        # *.test.ts colocated beside the module each one covers
│   ├── api/                    # axios instance + TanStack Query hooks
│   ├── db/client.ts            # Neon client, OID parser override
│   ├── storage/r2.ts           # R2 client, checksum config
│   ├── motion.ts               # gsap.matchMedia() wrapper — ALL animation goes through it
│   ├── dates.ts                # Asia/Jakarta date helpers
│   ├── dates.test.ts
│   ├── slots.ts                # canonical TIME_SLOTS
│   ├── slots.test.ts
│   ├── proof.ts                # shared upload constraints
│   ├── validation.ts
│   ├── validation.test.ts
│   └── env.ts
├── scripts/
│   └── check-setup.test.ts     # live Neon + R2 preflight — Phase 4, needs .env.local
└── vitest.config.ts
```

All of the above except `docs/`, `CLAUDE.md`, and `.claude/` gets created during the Phase 1 build (`docs/tasks/step-01` onward) — not part of this scaffolding pass.

## Package versions (starting point — check for patch updates when step-01 actually runs)

| Package | Version |
|---|---|
| `next` | `^15.5.22` |
| `react` / `react-dom` | `^19.2.8` |
| `gsap` | latest — resolve at install, verify license |
| `@gsap/react` | latest — resolve at install |
| `axios` | latest — resolve at install |
| `@tanstack/react-query` | latest v5 — resolve at install |
| `msw` (dev) | latest v2 — resolve at install |
| `vitest` (dev) | latest v3 — resolve at install |
| `@neondatabase/serverless` | `^1.1.0` |
| `@aws-sdk/client-s3` | `^3.1098.0` |
| `server-only` | `^0.0.1` |
| pnpm (`packageManager`) | `pnpm@11.17.0` |

## `lib/` import convention

`lib/` modules use the `@/` alias like everything else (`from "@/lib/dates"`). Vitest resolves it through `tsconfig` paths, so there is no separate resolution mode to satisfy and no `allowImportingTsExtensions` anywhere.

The one rule that still binds is the [extraction boundary](#extraction-boundary) below: `lib/` never imports from `app/`.

## Extraction boundary

`lib/` never imports from `app/`. The admin app lives in its own repo (`arena-player-admin`), so this boundary is what makes slot math, date helpers, and validation extractable into a shared package later instead of being reimplemented there.
