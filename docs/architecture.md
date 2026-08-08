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

Booking flow: select slot → open `wa.me` (placeholder number) — **WhatsApp only, the site does not also navigate**. The `/booking?date=…&time=…` link comes back through WhatsApp: typed by the admin until the bot phase ships, sent by the bot after. Then submit form with proof → slot becomes PENDING → admin confirms manually.

Two consequences that shape the code: selecting a slot **holds nothing** — only a successful POST does. And `/booking` is **only ever reached by a pasted link**, so malformed or stale query params are the normal case, not an edge case (all four states are spec'd in [PRD.md](PRD.md)).

## API contract

Written during Phase 1a task 5, before any UI consumes it. Phases 2–3 build against MSW handlers implementing exactly these shapes — agents must read this section rather than inventing response bodies.

> **MSW must be retired in Phase 4.** It registers a service worker, so a stray `mockServiceWorker.js` in a production build intercepts real requests and serves fake availability — failing silently, as a working-looking site showing wrong data. Gate registration on `NODE_ENV`, confirm the file is absent from the built output, handle unregistering for browsers that already loaded the dev site, and verify in the network panel that production makes real calls. Full checklist in [PRD.md](PRD.md) Phase 4.

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

`status` is one of `available` | `pending` | `booked`.

**Status mapping — the database has four states, this API has three.** Write it down or it gets guessed:

| Row state in `bookings` | API `status` | Why |
|---|---|---|
| no row for that slot | `available` | Never booked |
| `pending` | `pending` | Awaiting admin confirmation |
| `confirmed` | `booked` | Taken |
| `rejected` | `available` | Admin declined — **the slot is free again** |
| `expired` | `available` | Pending lapsed past 24h — **the slot is free again** |

`rejected` and `expired` mapping to `available` is the half that gets guessed wrong. Guessing `booked` there blocks slots that are genuinely open, and nothing errors — the client just renders a full day that is actually empty. This matches `uniq_active_slot`, whose `WHERE status IN ('pending', 'confirmed')` clause defines the same two active states and nothing else.

**One override sits on top of the table:** for today's date, any slot whose start hour has passed returns `booked` regardless of row state.

That is a server-side simplification, not the label the user sees. The client knows the current time and the canonical starts in `lib/shared/slots.ts`, so it derives "elapsed" itself and presents those hours as past rather than taken — collapsed into one `Sudah lewat (N)` row, never nine "Terisi" labels that make the day read as sold out. No `past` status is needed and this route stays FIRM. See [PRODUCT.md](PRODUCT.md) and the order-section brief in `.impeccable/surfaces/`.

**`POST /api/bookings` — PROVISIONAL.** Shape below assumes multipart; presigned-URL upload would replace the `proof` part with a `proofKey` string and leave every other field unchanged.

Request — `multipart/form-data`. Field names are the contract: the form, the MSW handler, and the Phase 4 route handler must all use exactly these, and the `fields` keys in a 400 response are these same names.

| Field | Type | Required | Rule |
|---|---|---|---|
| `date` | string | yes | `YYYY-MM-DD`, inside the 14-day window |
| `slot` | string | yes | Exact member of `TIME_SLOTS` — `"18.00 - 20.00"`, not `"18.00-20.00"` |
| `teamName` | string | yes | 2–60 chars after trim |
| `phone` | string | yes | Indonesian mobile, `08xx` or `62xx` as typed. **Server normalises to `628xxxxxxxxx` before insert** — the client sends what the user typed |
| `notes` | string | no | ≤ 280 chars |
| `proof` | File | yes | ≤ 2MB, mime in `image/jpeg` \| `image/png` \| `image/webp`. Limits live in `lib/proof.ts` — never retyped here or in the form |
| `website` | string | yes (empty) | Honeypot. Must be present and empty. Non-empty → respond **201 with a fabricated id** and write nothing. A 400 tells the bot what tripped it |

`slot` is validated against `TIME_SLOTS`, not a regex. The `uniq_active_slot` index compares `time_slot` as text, so a near-miss format silently books the same slot twice — see [database.md](database.md).

The honeypot's fake 201 is the one place this API lies on purpose. Everywhere else, a status code means what it says.

```jsonc
// 201
{ "id": "uuid", "status": "pending" }
// 409 — slot taken between page load and submit
{ "error": "slot_taken" }
// 400 — validation failure
{ "error": "validation_failed", "fields": { "phone": "invalid_format" } }
// 429 — rate limited (see abuse protection in PRD.md)
{ "error": "rate_limited" }
```

Two error states the UI must handle visibly, and they are **not** interchangeable:

- **409** → "Yah, slot ini baru saja diambil orang lain." with a link back to `/#order`. The slot is gone; offer another.
- **429** → a distinct Indonesian message saying to wait and retry. Nothing is wrong with their booking. Showing the 409 copy here would tell a legitimate user their slot was taken when it was not.

MSW must mock all four codes, or Phase 3 builds UI for states it has never seen.

## Framework decision (FINAL)

**Next.js 15, App Router.** TanStack Start was evaluated and rejected — locked, do not revisit without a new planning conversation.

TanStack Start is not the weaker framework; it lost on this project's constraints:

- **Handover.** Paid project, 14-day bug warranty, then someone else maintains it. Next.js developers are abundant; TanStack Start developers are scarce. That asymmetry outlives every technical argument.
- **`next/font` and `next/image` are load-bearing.** DESIGN.md leans on `next/font` for zero-CLS webfont loading and `next/image` for reserved space, and both feed hard rule 6 (no CLS) and hard rule 7 (LCP < 2.5s, hero *text* as the LCP element). Switching frameworks means hand-rolling those guarantees.
- **Maturity** matters during a warranty period on a tight budget.

Its one real advantage here — TanStack Router's type-safe `validateSearch` mapping neatly onto the four `/booking` param states — is worth roughly 15 lines of zod parsing in Next. Not enough.

**Corollary: `next/font` and `next/image` are not freely swappable.** They are the mechanism by which two hard rules are satisfied. Replacing either means proposing a replacement for the CLS and LCP guarantees, not just a different import.

The one thing that would have justified revisiting — a deploy target unable to run Next.js — is now ruled out: Sumopod runs Node apps.

## Database & storage decision (FINAL)

**Neon Postgres (serverless) + Cloudflare R2.** Locked — do not revisit without a new planning conversation.

Rationale: Neon's HTTP-based serverless driver fits Next.js route handlers (no connection-pool management in application code, works over fetch-friendly infrastructure). R2 has no egress fees, which matters for private payment-proof images that only the admin ever views. Both are reached exclusively from server-side route handlers — the browser never holds a connection string or R2 credential.

## Request flow

**`GET /api/availability?date=`**
1. Validate `date` is `YYYY-MM-DD` and inside the 14-day window → 400 otherwise, never 500.
2. Lazy expiry first, same request, scoped to that date: flip pending rows older than 24h to `expired`.
3. Select active rows for the date, map onto the 9 canonical `TIME_SLOTS` (mapping table above).
4. Respond `[{ slot, status }]` with `Cache-Control: public, s-maxage=30`.

> **UNRESOLVED — steps 2 and 4 undercut each other. On the Phase 4 agenda; do not implement either half without settling it.**
>
> Step 2 makes this a **write**. Step 4 makes it **cacheable by shared caches**. A cache hit never reaches the origin, so it never runs the expiry — the only mechanism that frees an abandoned slot is starved exactly when nobody is browsing.
>
> Concretely: a pending booking due to expire at 03:00 on a quiet night stays `pending` until the next request that misses the cache. The slot is held by a booking nobody paid for, and it looks correct from every angle — no error, no log line, no failing test. It costs the client bookable hours.
>
> Secondary issue: HTTP defines GET as safe. A GET that writes misbehaves under browser prefetch, link scanners, and repeated back-navigation, all of which fire without a user intending anything.
>
> Three candidate resolutions, none chosen yet:
>
> 1. **Move expiry to a scheduled job.** GET becomes a pure read and cacheable without contradiction. Costs a cron surface the project does not have yet.
> 2. **Run expiry on POST instead**, where a write already happens and caching never applies. Free, but expiry then only runs when someone books.
> 3. **Drop `s-maxage`**, keeping expiry inline. Simplest, and costs origin load the 30s cache exists to avoid.
>
> Whoever settles this must also confirm the deployment target actually has a shared cache in front of it — on Sumopod it may not, which shrinks the problem to browser caching but does not remove it.

**`POST /api/bookings`** — steps 2–3 are **provisional**; presigned-URL upload would move the R2 write to the browser and leave this handler validating an object key instead.

1. **Rate limit check first — before parsing anything.** Over limit → 429 and return. Parsing a 2MB multipart body before deciding to reject is most of the cost the limit exists to avoid, so ordering here is the whole point, not a detail.
2. Multipart parse → honeypot → field validation → proof validation (size and MIME server-side; client checks are UX, not protection). Any failure → 400, **before** anything reaches R2.
3. Upload proof to R2.
4. Insert the booking row. Success → 201. Unique violation → 409 + best-effort delete of the just-uploaded proof.

The ordering is cheapest-rejection-first throughout: refuse abusers before parsing, refuse invalid input before paying for storage, and only then touch the database.

**Orphaned proofs need a sweeper, and best-effort delete is not one.** Step 3 succeeds before step 4 runs, so any death in between — serverless timeout, redeploy mid-request, process crash — leaves an object in R2 that no row points at. The 409 path calls `deleteProof()`, but a process that died cannot call anything.

Nothing in this system ever notices. R2 has no orphan report, and the admin app queries the database, which has no record of the file. It accumulates quietly for the lifetime of the bucket, and this bucket gets handed to the client.

Fix costs no code: an **R2 lifecycle rule** deleting objects under the `proofs/` prefix older than 48h that were never referenced. Since `proofKey()` already namespaces by date, an age-based rule is enough. Confirm at handover that it is configured — it lives in the R2 dashboard, not in this repo, so it is exactly the kind of thing that gets lost between the two.

## Anti-double-booking (non-negotiable)

The partial unique index `uniq_active_slot` on `(booking_date, time_slot) WHERE status IN ('pending', 'confirmed')` is the *only* race guard. **Never check-then-insert.** Insert, catch the unique violation, return 409. Full error-code contract and SQL: [database.md](database.md).

## Known gotchas (summary — full detail in database.md)

- **Neon date/timestamptz parsing**: the driver's default type parsers return JS `Date` objects for `DATE`/`TIMESTAMPTZ` columns, which silently corrupts `booking_date` by one day on an Asia/Jakarta machine when serialized. Must override both OID parsers to pass raw strings through. This is a blocker-class bug, found and fixed once already — see database.md for the exact fix.
- **R2 checksum headers**: the AWS SDK's default flexible-checksum behavior gets rejected by R2 on some upload paths. The `S3Client` config needs explicit checksum settings.
- **`server-only` is how hard rule 4 stops being honour-system.** `import "server-only"` at the top of `lib/db/client.ts` and `lib/storage/r2.ts` makes the **build fail** the moment any client component imports either one, directly or through a chain. Without it, a stray import inlines `DATABASE_URL` or an R2 secret into the client bundle and nothing complains — the site works, and the credential ships to every visitor. A written rule is a request; this is enforcement. It is listed in the package table for this reason alone.

### GSAP gotchas (the cost of dropping Framer Motion)

Framer Motion handled `prefers-reduced-motion` for free via `useReducedMotion`. GSAP does not, and [design-process.md](design-process.md) mandates that check on **every** animated component — so the swap is only safe if the mechanism below replaces it. These are blocker-class if skipped.

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
| zod | ~13 |
| react-hook-form | ~9 |
| zustand | ~1 |
| Dates + icons — libraries unchosen, decided in 1a task 1 | ~5–8 |
| **Subtotal before any app code** | **~179–182** |
| **Headroom left for every component on both pages** | **~18–21** |

**This is tight and must be re-measured before it is trusted.** ~18–21KB for all component code across a 5-section landing page plus a form is not obviously enough. Every figure above is an estimate; the first real `pnpm build` in Phase 1a is what settles it.

**A budget nothing measures is a wish.** Phase 1a task 8 must land the enforcement alongside the numbers: a `pnpm check:budget` that fails on breach, so a dependency added in Phase 2 is rejected by a command rather than by whoever happens to remember this table. Next.js already prints per-route First Load JS on every build; the check is reading that output and comparing it, not new tooling. If the measured subtotal breaches the budget, the resolution is a deliberate decision at that point — raise the 200KB ceiling with evidence, drop a library, or `next/dynamic` the form page's dependencies off the landing route so `/` never pays for `react-hook-form` and `zod`. **That last option is the most likely fix** and costs nothing to plan for now: the form libraries are only needed on `/booking`.

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
│   ├── PRODUCT.md             # product truth + open decisions; NOT visual design
│   ├── PRD.md
│   ├── architecture.md        # this file
│   ├── DESIGN.md              # visual system — DESIGN.md format spec, tokens are normative
│   ├── DESIGN.html            # live render of DESIGN.md; reference artifact, NOT production
│   ├── design-process.md      # how design work runs — motion approval, images, asset locations
│   ├── database.md
│   ├── PROGRESS.md            # shared agent log — CURRENT PHASE ONLY, append-only
│   ├── progress-archive/      # closed phases; read only when tracing an old decision
│   ├── references/            # gitignored scratch — deleted after use, README only
│   └── tasks/                 # <phase>-<step|gate>-<slug>.md, sorts into build order
│       ├── 1b-gate-client.md  # client sign-off for the 1b checkpoint; blocks Phases 2 and 3
│       └── …                  # step files land when each phase's build starts
├── .claude/
│   ├── agents/
│   ├── skills/                # arena-player-gotchas, arena-player-database, arena-player-design
│   ├── hooks/
│   │   ├── notify.ps1             # Stop/Notification/SubagentStop toast
│   │   ├── inject-gotchas.ps1     # SessionStart — injects the trap list
│   │   └── check-claudemd.ps1     # Stop — nudges when CLAUDE.md drifts
│   └── settings.json
├── public/                     # served as-is; nothing secret ever goes here
│   ├── logo.svg                # AP monogram placeholder — TODO(content)
│   ├── favicon.ico             # derived from the logo
│   ├── og-image.png            # derived from the logo
│   └── mockServiceWorker.js    # MSW, dev only — MUST be absent from prod builds
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
├── mocks/                      # MSW handlers — dev only, retired in Phase 4
├── lib/                        # *.test.ts colocated beside the module each one covers
│   ├── api/                    # axios instance + TanStack Query hooks
│   ├── db/client.ts            # Neon client, OID parser override
│   ├── storage/r2.ts           # R2 client, checksum config
│   ├── motion.ts               # gsap.matchMedia() wrapper — ALL animation goes through it
│   ├── dates.ts                # Asia/Jakarta date helpers
│   ├── dates.test.ts
│   ├── slots.ts                # canonical TIME_SLOTS
│   ├── slots.test.ts
│   ├── store/                  # zustand — client state only, see the scope rule in CLAUDE.md
│   ├── proof.ts                # shared upload constraints (MIME + size)
│   ├── proof.test.ts
│   ├── validation.ts           # zod schemas, shared client/server
│   ├── validation.test.ts
│   └── env.ts
├── scripts/
│   └── check-setup.test.ts     # live Neon + R2 preflight — Phase 4, needs .env.local
└── vitest.config.ts
```

All of the above except `docs/`, `CLAUDE.md`, and `.claude/` gets created during **Phase 1a** — not part of this scaffolding pass.

## Package versions — resolve every one at install

**No pinned versions here, deliberately.** An earlier draft pinned `next`, `react`, `@aws-sdk/client-s3`, and `pnpm` to exact figures that were never verified against the registry. A wrong pin fails `pnpm install` on day one of Phase 1a with a confusing error, and false precision reads as "someone checked this" when nobody did.

Resolve each at install, then **record the actual resolved versions back into this table** — same moment the performance budget above gets replaced with measured figures. Both are estimates waiting on the same first `pnpm install`.

| Package | Version |
|---|---|
| `next` | latest 15.x — resolve at install |
| `react` / `react-dom` | latest 19.x — resolve at install |
| `gsap` | latest — resolve at install, verify license |
| `@gsap/react` | latest — resolve at install |
| `axios` | latest — resolve at install |
| `zod` | latest — resolve at install |
| `react-hook-form` | latest — resolve at install |
| `zustand` | latest — resolve at install |
| `@tanstack/react-query` | latest v5 — resolve at install |
| `msw` (dev) | latest v2 — resolve at install |
| `vitest` (dev) | latest v3 — resolve at install |
| `@neondatabase/serverless` | latest v1 — resolve at install |
| `@aws-sdk/client-s3` | latest v3 — resolve at install |
| `server-only` | latest — resolve at install |
| pnpm (`packageManager`) | resolve at install, then pin the exact version |

## `lib/` import convention

`lib/` modules use the `@/` alias like everything else (`from "@/lib/shared/dates"`). Vitest resolves it through `tsconfig` paths, so there is no separate resolution mode to satisfy and no `allowImportingTsExtensions` anywhere.

The one rule that still binds is the [extraction boundary](#extraction-boundary) below: `lib/` never imports from `app/`.

## Extraction boundary, and the shared-code contract

`lib/` never imports from `app/`. The admin app lives in its own repo (`arena-player-admin`) and talks to the same database, so this boundary is what keeps slot math, date helpers, and validation shareable rather than reimplemented.

### `lib/shared/` is a contract, not a convenience

Everything both repos must agree on lives in **`lib/shared/`** and is **byte-identical in both**:

| Module | Why both repos need it |
|---|---|
| `slots.ts` | `TIME_SLOTS` and slot canonicalisation |
| `dates.ts` | Asia/Jakarta helpers, the booking window, `isPastSlot` |
| `validation.ts` | Phone normalisation, proof constraints, status values |

**Why byte-identical and not merely equivalent.** `uniq_active_slot` compares `time_slot` as **text**. `'06.00 - 08.00'` and `'06.00-08.00'` are two different slots to Postgres, so a one-character drift between the repos means the admin writes rows the site cannot match — and **anti-double-booking silently stops working for both**. Nothing throws. The index is the only race guard there is, and a drifted string disables it without a symptom.

**Mechanism: a plain copy in both repos, guarded by `pnpm check:shared`.** No workspace, no published package, no submodule — the shared surface is ~150 lines and this project is handed to a client at the end. A workspace reverses the separate-repo decision; a package makes the client inherit registry credentials; a submodule turns a plain `git clone` into an empty directory that fails confusingly.

The copy is only defensible because the check exists:

```bash
pnpm check:shared     # diffs lib/shared/ against the other repo's copy, exits non-zero on any difference
```

`scripts/check-shared.mjs` fetches the sibling repo and diffs each file. It runs inside `check:lib`, so it cannot be forgotten.

**The check must be proven to fail before it is trusted.** Change one character in a `lib/shared/` file, watch it exit non-zero, revert. A check that has only ever passed is a check nobody has tested — this repo shipped a `Stop` hook that never fired once for exactly that reason.

**Web owns `db/migrations/`.** The admin repo reads the schema and never alters it. Two repos migrating one database is a conflict with no owner to resolve it.
