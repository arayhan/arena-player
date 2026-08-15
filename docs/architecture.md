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
>
> **Step 07 built the gate rather than deferring it.** `src/app/providers.tsx` compares `process.env.NODE_ENV`, which the bundler inlines, so in a production build the branch is a literal `false` and the dynamic `import("@/mocks/browser")` is never emitted — msw is not in any page's module graph, not merely unreached. Verified against a real `pnpm build`: `grep -rl "mockServiceWorker\|setupWorker\|TEST409" .next/static/` returns nothing. A runtime flag would have shipped the mock and then trusted a value.
>
> **`curl` cannot test this mock and never could.** A service worker intercepts browser fetches only, so `curl localhost:3000/api/availability` reaches Next's router and 404s regardless. The handlers are exercised through `msw/node` in `src/mocks/handlers.test.ts`, against the same `handlers` array the browser loads.

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

**Forcing an error on demand — the mock's trigger, written down so nobody hunts for it.** Phase 3 has to build the 409, 429 and 400 states, and a mock that only ever answers 201 means three screens get built without being seen. A reserved `teamName` selects the answer:

| `teamName`    | Mock responds                                                          |
| ------------- | ---------------------------------------------------------------------- |
| `TEST409`     | `409 slot_taken` — the state that exists because of `uniq_active_slot` |
| `TEST429`     | `429 rate_limited` — deliberately NOT interchangeable with 409         |
| `TEST400`     | `400 validation_failed` with a `fields` object                         |
| anything else | normal validation, then `201`                                          |

Chosen over a URL flag because it needs no special path through `api-client.ts` that would outlive the mock, and because a reviewer can reproduce a 409 during a walkthrough by typing. `src/mocks/handlers.ts` exports `ERROR_TRIGGERS`, and the whole folder is deleted in Phase 4.

**Status mapping — the database has four states, this API has three.** Write it down or it gets guessed:

| Row state in `bookings` | API `status` | Why                                                  |
| ----------------------- | ------------ | ---------------------------------------------------- |
| no row for that slot    | `available`  | Never booked                                         |
| `pending`               | `pending`    | Awaiting admin confirmation                          |
| `confirmed`             | `booked`     | Taken                                                |
| `rejected`              | `available`  | Admin declined — **the slot is free again**          |
| `expired`               | `available`  | Pending lapsed past 24h — **the slot is free again** |

`rejected` and `expired` mapping to `available` is the half that gets guessed wrong. Guessing `booked` there blocks slots that are genuinely open, and nothing errors — the client just renders a full day that is actually empty. This matches `uniq_active_slot`, whose `WHERE status IN ('pending', 'confirmed')` clause defines the same two active states and nothing else.

**One override sits on top of the table:** for today's date, any slot whose start hour has passed returns `booked` regardless of row state.

That is a server-side simplification, not the label the user sees. The client knows the current time and the canonical starts in `src/domain/slots.ts`, so it derives "elapsed" itself and presents those hours as past rather than taken — collapsed into one `Sudah lewat (N)` row, never nine "Terisi" labels that make the day read as sold out. No `past` status is needed and this route stays FIRM. See [PRODUCT.md](PRODUCT.md) and the order-section brief in `.impeccable/surfaces/`.

**`GET /api/payment-accounts` — ADDED 2026-08-15.** The transfer destinations `/booking` shows once a visitor has arrived through the WhatsApp link.

```jsonc
// 200 — an array, possibly EMPTY
[{ "bank": "BCA", "accountNumber": "1234567890", "accountHolder": "Nama Pemilik" }]
```

**An empty array is a valid answer, not an error**, and it is the answer today: the client has never supplied an account. The form renders that in words — _"Nomor rekening & nama pemilik menyusul"_ — and reserves its failure state for a request that actually failed. Collapsing the two would tell a visitor to retry a fact, or to wait for a network that is fine.

**`Cache-Control: public, s-maxage=3600`.** Unlike the availability GET, this is a **pure read** — no lazy expiry hidden inside it — so caching it carries none of the contradiction recorded against that endpoint above. Accounts change about once a year.

**NO FABRICATED ACCOUNT MAY EXIST ANYWHERE IN THIS CODEBASE**, which is why the mock answers `[]` rather than with sample digits. Every other missing item is inert if it leaks; an invented account number is one a visitor transfers money to. The mock's two dev-only triggers (`?mock=accounts`, `?mock=accounts-error`, plus `accounts-slow` for the skeleton) exist so the other branches are reachable in a browser, and the sample row says `CONTOH` in every field for the same reason — a plausible-looking bank and number would look finished in a screenshot, and a screenshot is how a made-up account reaches somebody about to pay.

> **Phase 4 owes the SOURCE, and it is not chosen here.** A `payment_accounts` table the admin app edits, or environment configuration. The accounts would be maintained from the admin repo, and that conversation has not happened — see [database.md](database.md).

**`POST /api/bookings` — PROVISIONAL.** Shape below assumes multipart; presigned-URL upload would replace the `proof` part with a `proofKey` string and leave every other field unchanged.

Request — `multipart/form-data`. Field names are the contract: the form, the MSW handler, and the Phase 4 route handler must all use exactly these, and the `fields` keys in a 400 response are these same names.

| Field      | Type   | Required    | Rule                                                                                                                                                                                                                                                       |
| ---------- | ------ | ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `date`     | string | yes         | `YYYY-MM-DD`, inside the 14-day window                                                                                                                                                                                                                     |
| `slots`    | string | yes, 1+     | **Repeated once per hour** — `body.append("slots", …)` per slot, read with `getAll`. Each an exact member of `TIME_SLOTS` — `"18.00 - 20.00"`, not `"18.00-20.00"`. No duplicates                                                                          |
| `teamName` | string | yes         | 2–60 chars after trim                                                                                                                                                                                                                                      |
| `phone`    | string | **no**      | Indonesian mobile, `08xx` or `62xx` as typed, **or empty**. The input is hidden as of 2026-08-15 so the form sends `""`; a value that IS sent is still validated. **Server normalises to `628xxxxxxxxx` before insert.** See the reconciliation note below |
| `notes`    | string | no          | ≤ 500 chars — same number as the `notes_length` constraint in [database.md](database.md), not a second opinion                                                                                                                                             |
| `proof`    | File   | **no**      | Absent while the dropzone is hidden (2026-08-15); ≤ 2MB and mime in `image/jpeg` \| `image/png` \| `image/webp` when present. Limits live in `src/modules/booking-form/booking-form.proof.ts` — never retyped here or in the form                          |
| `website`  | string | yes (empty) | Honeypot. Must be present and empty. Non-empty → respond **201 with a fabricated id** and write nothing. A 400 tells the bot what tripped it                                                                                                               |

Every entry in `slots` is validated against `TIME_SLOTS`, not a regex. The `uniq_active_slot` index compares `time_slot` as text, so a near-miss format silently books the same slot twice — see [database.md](database.md).

**`slots`, plural, since 2026-08-15 — one booking may cover several hours.** It was a single `slot` field until the form grew its own schedule picker. Consequences that are not optional:

- **One ROW PER SLOT, inserted in ONE transaction.** The table has no multi-slot row and must not grow one: `uniq_active_slot` is a per-(date, slot) partial index, and that index is the entire anti-double-booking guard.
- **Any `23505` rolls the whole booking back and answers 409.** Never insert what fits and keep what does not — a visitor who asked for 20.00–24.00 and silently got only 20.00–22.00 arrives at a field they believe they booked for four hours. The 409 body should name the taken slot(s) so the form can say which one went.
- Hard rule 1 is unchanged and now applies per row: **insert, catch, respond — never check-then-insert.**
- **Repeated keys, not a joined string.** `FormData` carries repeated fields natively, so no separator has to be agreed on — and a separator is exactly where a value containing `" - "` would have gone wrong.

**TWO FIELDS ARE HIDDEN IN THE UI AND STILL IN THIS CONTRACT.** The form stopped rendering the phone input and the proof dropzone on 2026-08-15 (`SHOW_PHONE_FIELD` / `SHOW_PROOF_FIELD` in `BookingForm.tsx`); the keys, the schema entries and the columns all stayed, so restoring either is a one-line flip. **What Phase 4 must settle before it writes the route:** `phone not null` and `proof_key not null` in `db/migrations/` have no value to store while both fields are empty. Recorded in [database.md](database.md) as blocking, not patched here.

**The query param is `time`; the POST field is `slots`. That is deliberate, and it is written down here so nobody harmonises them.** `/booking?date=…&time=…` is a link a human admin types into WhatsApp, and `time` is the word they would guess; `slots` is the wire name that matches `TIME_SLOTS` and the `time_slot` column. Renaming the param breaks every link already pasted into a chat, which is the one place in this system with no deploy and no rollback. Phase 3 reads `time` from the URL as a STARTING selection — the picker can change it — and submits `slots`.

**The PRD's field list is UI labels — "Nama Tim", "Nomor WhatsApp" — not wire names.** The wire names live in the table above and nowhere else, on purpose. Do not "complete" the PRD by adding them; that creates the second copy this contract exists to avoid.

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

**Next.js 16, App Router.** TanStack Start was evaluated and rejected — locked, do not revisit without a new planning conversation.

TanStack Start is not the weaker framework; it lost on this project's constraints:

- **Handover.** Paid project, 14-day bug warranty, then someone else maintains it. Next.js developers are abundant; TanStack Start developers are scarce. That asymmetry outlives every technical argument.
- **`next/font` and `next/image` are load-bearing.** DESIGN.md leans on `next/font` for zero-CLS webfont loading and `next/image` for reserved space, and both feed hard rule 6 (no CLS) and hard rule 7 (LCP < 2.5s, hero _text_ as the LCP element). Switching frameworks means hand-rolling those guarantees.
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

The partial unique index `uniq_active_slot` on `(booking_date, time_slot) WHERE status IN ('pending', 'confirmed')` is the _only_ race guard. **Never check-then-insert.** Insert, catch the unique violation, return 409. Full error-code contract and SQL: [database.md](database.md).

## Known gotchas (summary — full detail in database.md)

- **Neon date/timestamptz parsing**: the driver's default type parsers return JS `Date` objects for `DATE`/`TIMESTAMPTZ` columns, which silently corrupts `booking_date` by one day on an Asia/Jakarta machine when serialized. Must override both OID parsers to pass raw strings through. This is a blocker-class bug, found and fixed once already — see database.md for the exact fix.
- **R2 checksum headers**: the AWS SDK's default flexible-checksum behavior gets rejected by R2 on some upload paths. The `S3Client` config needs explicit checksum settings.
- **`server-only` is how hard rule 4 stops being honour-system.** `import "server-only"` at the top of every file in `src/server/` — `db.ts`, `storage.ts`, `env.ts` — makes the **build fail** the moment any client component imports either one, directly or through a chain. Without it, a stray import inlines `DATABASE_URL` or an R2 secret into the client bundle and nothing complains — the site works, and the credential ships to every visitor. A written rule is a request; this is enforcement. It is listed in the package table for this reason alone.

### GSAP gotchas (the cost of dropping Framer Motion)

Framer Motion handled `prefers-reduced-motion` for free via `useReducedMotion`. GSAP does not, and [design-process.md](design-process.md) mandates that check on **every** animated component — so the swap is only safe if the mechanism below replaces it. These are blocker-class if skipped.

- **Reduced motion is manual.** All animation goes through a single `gsap.matchMedia()` wrapper in `src/lib/motion.ts`. Calling `gsap.to()` directly inside a component is **banned** — that is precisely how the rule gets silently skipped on one component and ships.
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

**That instruction is now mechanical, not a request.** `scripts/check-budget.mjs` parses the "Initial JS, first load" row below and enforces whatever it says; editing that number changes what the check allows. If the row stops being parseable the check fails rather than falling back to a default, because a budget check guessing its own budget is worse than no check.

Written during Phase 1a task 8. Its purpose is to make every future "can we add library X?" a question of arithmetic rather than taste.

| Budget line                             | Limit                                                    |
| --------------------------------------- | -------------------------------------------------------- |
| Initial JS, first load                  | **≤ 240KB gzip** — raised from 200 in step 02, see below |
| Lazy WebGL chunk (hero only, see below) | **≤ 40KB gzip**                                          |
| LCP, mid-range mobile                   | **< 2.5s**                                               |
| Lighthouse mobile Performance           | **≥ 85**                                                 |

### What `/` actually costs — measured, Phase 1a step 02

Every figure below came from `node scripts/check-budget.mjs --report` against a real `pnpm build`, one library at a time. **The estimates this table replaced were 30% low**, so nothing here is carried forward from a guess.

Excludes the 38.7KB polyfill chunk, which Next emits with `noModule` — only legacy browsers fetch it, and the target device does not.

| Item                                                            | KB gzip on `/`                 |
| --------------------------------------------------------------- | ------------------------------ |
| Next 16 + React 19 framework baseline                           | **126.5**                      |
| TanStack Query                                                  | 10.7 — see below               |
| `date-fns` + `@date-fns/tz`                                     | 8.1                            |
| `clsx` + `tailwind-merge` (`cn()`)                              | 8.2                            |
| `react-icons`, six icons                                        | 2.2                            |
| zustand                                                         | 0.7                            |
| GSAP + ScrollTrigger + `@gsap/react` — **lazy, off first load** | (43.6)                         |
| axios — **`/booking` only**                                     | (17.5)                         |
| zod — **`/booking` only**                                       | **63.2** — measured, see below |
| react-hook-form — `/booking` only                               | not yet measured, Phase 3      |
| **Projected subtotal on `/` once all of the above is imported** | **156.4**                      |
| **Headroom for every component on the landing page**            | **~84**                        |

#### zod costs 63.2KB on `/`, and that number is why the route split exists

Measured during the Phase 1a engineering review, not estimated: a probe client
component doing `z.array(z.object({ … }))` and one `safeParse`, rendered from
`src/app/page.tsx`, built for real.

```
/  without zod   137.0 KB      headroom 103.0
/  with zod      200.2 KB      headroom  39.8
                  ────────
zod               +63.2 KB     26% of the entire 240 ceiling
```

Nothing fails at 200.2 — it is under the ceiling. That is exactly what makes it
dangerous: adding zod to `/` would quietly consume 61% of the headroom that five
landing sections have to share, and `check:budget` would report green while it
happened.

**This is what `src/modules/home/home.service.ts` buys by hand-writing
`assertContract`.** Twenty lines of explicit validation instead of three lines of
zod, in exchange for a quarter of the page's budget. Anyone who looks at that
function and reaches for zod to "clean it up" should read this number first.

`react-hook-form` remains unmeasured; it is `/booking`-only for the same reason
and gets its number in Phase 3.

**What `/` costs TODAY, as opposed to projected — measured after step 07.** The
projection above is what the page will weigh once every listed library is
actually reached. Only two are so far:

```
126.5 KB  framework baseline (shared, excluding the 38.7KB noModule polyfill)
 10.7 KB  route chunk for / — QueryClientProvider, its defaults, the client boundary
-------
137.2 KB  measured on a real `pnpm build`
```

`date-fns`, `cn()`, `react-icons` and `zustand` are installed and written but
not yet imported by anything a page renders, so they cost nothing yet. The gap
between 137.2 and 156.4 is not headroom — it is the bill for code that already
exists.

TanStack Query's row moved from 10.0 to **10.7** for the same reason it is now
honest: 10.0 came from an isolated probe route, and 10.7 is what actually ships
— the library plus `providers.tsx` and the query defaults. The isolated number
was not wrong; it was measuring a smaller thing.

`cn()` was measured in step 02b over three builds, each probe isolated against a
control route so the `"use client"` boundary is subtracted rather than blamed on
the library: control 0.5KB, clsx alone 0.2KB, clsx + `tailwind-merge` 8.2KB —
so `tailwind-merge` accounts for 8.0 of it. Kept deliberately, with the
clsx-only fallback (0.2KB) already measured and a one-file swap away, because
`cn()`'s signature does not change between them.

#### Why the ceiling is 240 and not 200, and why not 400

Raised deliberately in step 02, with the measured numbers in hand rather than ahead of them.

200 was never breached after the two route-split fixes — `/` sat at 147.5KB, which left ~52KB. The raise buys margin for a 5-section landing page plus the form, not permission to stop caring. Step 02b spent 8.2KB of that margin on `cn()`, deliberately and against a measured number; the subtotal is now 155.7KB.

**400 was considered and rejected.** The binding cost on this project's target device is CPU, not download. 400KB gzip is roughly 1.6MB of JavaScript to parse and compile, which is about two seconds on a mid-range Android _before anything renders_ — and the visitor is inside the Instagram in-app browser, which is slower than Chrome. That breaks two constraints this document also owns: LCP < 2.5s and Lighthouse mobile ≥ 85, whose TBT metric measures exactly that stall. A budget that contradicts two other rules is not a budget.

For scale: Next 15's build output coloured First Load JS red above **128KB**. 240 is already generous against the framework's own guidance; it is the last raise that does not cost a different guarantee.

**The framework is the overrun, and it is not negotiable.** 126.5KB against an estimated 90 is Next 16 plus React 19 with nothing imported. React Compiler, which Next 16 enables by default, was measured separately and costs **0KB** — it stays on.

Two things went better than feared. `react-icons` is a re-export barrel and was flagged as a gamble; it tree-shakes correctly at **2.2KB for six icons**, so the fallback in step 02 was never needed. TanStack Query came in _under_ estimate.

### Two libraries are kept off `/` to pay for that overrun

Closing the gap needed ~30KB. These two found 61:

**GSAP loads lazily, through `src/lib/motion.ts`.** Hard rule 6 already forbids a direct `gsap.to()` in a component and routes every animation through that one file, so making it dynamic-import GSAP is a single-file change rather than a sweep. The constraint it creates: nothing can animate before the chunk arrives, so a hero _entrance_ must be CSS. Scroll-triggered work below the fold is unaffected — the chunk lands long before the user scrolls to it.

**axios is a `/booking` dependency, not a shared one.** `/` makes one GET for availability and native `fetch` does that in 0KB. `/booking` keeps axios because `onUploadProgress` reports progress on the 2MB proof upload and `fetch` cannot — on Indonesian mobile data, an upload with no progress indicator reads as a frozen page.

This is the same rule zod and react-hook-form already live under, now with a third member. "No bare `fetch` in a component" still holds: `/` calls through `src/modules/home/home.service.ts`.

**A budget nothing measures is a wish.** Phase 1a task 8 must land the enforcement alongside the numbers: a `pnpm check:budget` that fails on breach, so a dependency added in Phase 2 is rejected by a command rather than by whoever happens to remember this table.

**Next 16 removed the source that check was going to read.** Next 15 printed a per-route First Load JS table on every build; Next 16 prints route names only, and Turbopack emits no `app-build-manifest.json`. There is no output left to parse — `--experimental-analyze` prints a route count and nothing sized.

So the check measures the emitted bytes instead. **`scripts/check-budget.mjs` is the one measurement**, in two modes: bare, it enforces the ceiling per route; `--report` prints the per-chunk table. Both read the same route script list out of each prerendered HTML and exclude the legacy polyfill by consulting `build-manifest.json`'s own `polyfillFiles`, never by guessing at a filename.

It was two scripts until the Phase 1a engineering review, and the split had already produced a defect: the enforcing copy identified the polyfill by the hash prefix `static/chunks/0cz`, which is Turbopack **content-addressed** output. The next dependency bump would rehash that chunk, the prefix would stop matching, and 38.7KB would silently count as shipped on every route — 137.0 becomes 175.7, still inside 240, so nothing would have failed. It would only have eaten a third of the headroom and made the table wrong. This is more honest than parsing a printed table anyway: it counts what ships. If the measured subtotal breaches the budget, the resolution is a deliberate decision at that point — raise the 240KB ceiling with evidence, drop a library, or `next/dynamic` the form page's dependencies off the landing route so `/` never pays for `react-hook-form` and `zod`. **That last option is the most likely fix** and costs nothing to plan for now: the form libraries are only needed on `/booking`.

The 40KB WebGL cap is what excludes three.js (~150KB gzip) and pixi.js (~140KB) — by arithmetic, not by naming them. It still permits the effect: a hand-written GLSL fragment shader on a fullscreen quad costs ~3–5KB with no library at all, and OGL is ~10KB. A gradient-mesh or noise-field hero — which is what most light-theme Awwwards heroes actually are — fits comfortably. Reach for the shader, not the engine.

### The two library choices, settled — dates and icons

**Dates: `date-fns` v4 + `@date-fns/tz`.** Tree-shaken per function, so only the handful this project uses is paid for. v4's timezone support is the `{ in: tz('Asia/Makassar') }` option — **newer than reliable recall, so verify it against Context7 at install rather than writing it from memory.** The rules in [database.md](database.md) still bind whatever library is used: `toISOString()` never appears in a date path, and `isPastSlot` treats any date strictly before today as past.

**Icons: `react-icons`.** Six are needed — calendar, clock, upload, check, map pin, and WhatsApp. The last one decided it: no mainstream icon set still ships a WhatsApp brand mark, and `react-icons` carries all six.

It is a re-export barrel, so tree-shaking is the risk, and against ~17–21KB of headroom a barrel that does not shake is not a rounding error. **The `~1–2` figure in the table above is a hope until step 02 measures it**, with a throwaway probe page importing all six against a baseline build. `experimental.optimizePackageImports: ['react-icons']` is the first mitigation.

**That fallback is retired — the gamble paid off.** Step 02 measured 2.2KB for six icons, so the plan to extract the glyphs into `src/components/icons/*.tsx` and drop the dependency was never needed. Recorded here because a retired fallback that still reads as live gets implemented by someone tidying up.

## The route split — how `/` is kept from paying for the form

Three packages are `/booking`-only: `react-hook-form`, `zod`, and **axios** (17.5KB measured, added to this list in step 02 to pay for the framework overrun). `/` must never load any of them.

Intent is not a mechanism. Three layers, in the order they catch a mistake:

**1. Structure.** The module split does the work. `src/modules/booking-form/**` owns the form and everything it needs; `src/modules/home/**` renders `/` and imports none of it.

| Package           | May be imported from                                             |
| ----------------- | ---------------------------------------------------------------- |
| `axios`           | `src/services/api-client.ts`, `src/modules/booking-form/**`      |
| `react-hook-form` | `src/modules/booking-form/**`                                    |
| `zod`             | `src/modules/booking-form/**`, `src/app/api/**`, `src/server/**` |

Route handlers and `src/server/` run server-side, so `zod` there costs the client bundle nothing — the rule is about client code, not about the package.

`/` calls the availability endpoint with native `fetch` from `src/modules/home/home.service.ts`. The PRD's "no bare `fetch` in a component" rule is about the _component_, not the transport: the component calls `home.queries.ts`, which calls the service. `src/services/api-client.ts` is the axios instance and is `/booking`-only.

**Feature modules never import each other.** That rule is load-bearing here, not stylistic: one `home` → `booking-form` import is all it takes for a later `import { z }` inside `booking-form` to ship zod to `/` with nothing failing. Shared vocabulary goes in `src/domain/`, which is why that folder exists instead of living inside the booking module.

**No `index.ts` barrels under `src/modules/`.** A barrel re-exporting the form drags zod, react-hook-form, and axios along with any single import from that module. Import deep paths.

**2. Lint, at author time.** An ESLint `no-restricted-imports` zone rule enforces the table above, plus `@/server/*` importable only from `src/app/api/**`. Everything not listed — `src/app/page.tsx`, `src/modules/home/**`, `src/components/**`, `src/domain/**`, `src/lib/**`, `src/utils/**` — is barred from all three packages. This is the layer that gives a useful error message, naming the rule instead of a byte count.

**3. `pnpm check:budget`, at build time.** Reads Next's **per-route** First Load JS and fails on breach. Per-route matters: a single global total hides exactly the case this section exists to prevent. This is the backstop for the path lint cannot see — a transitive import through a shared module.

The failure this prevents is quiet. Nothing errors when `/` grows 22KB; the page just gets slower on the mid-range Android the whole budget was written for.

## Verification practice (required, not incidental)

Every module with non-trivial logic — anything under `src/` that is not a component — gets covered by one of two Vitest runs:

- **`pnpm check:unit`** → `vitest run src` — pure unit assertions on non-component logic (date math, validation, slot logic), in `*.test.ts` files colocated beside the module they cover. No DB, no network, no credentials. Runs in CI and on any machine that has only cloned the repo.
- **`pnpm check:setup`** → `vitest run scripts` — a preflight that actually connects to Neon and R2 to confirm the migration ran and credentials work, before any feature work starts on top of them. Needs `.env.local`. **Built in Phase 4, not Phase 1a** — there is no Neon project and no R2 bucket before the backend phase, so writing it earlier produces a check that can only fail.

The two are kept as separate globs on purpose: `check:unit` must never need credentials, or it stops being runnable at the moment it is most useful.

**`pnpm check` runs the whole gate** — lint, typecheck, `format:check`, `check:domain`, `check:docs`, `check:unit` — cheapest first, so a syntax error fails in a second rather than after the test run. It exists because the alternative was folding one check inside another to stop it being skipped, which bought the guarantee at the cost of a command that lied about what it did. One command that runs everything is the honest version of the same idea.

**`pnpm check:ship` is the second, slower one**: `pnpm check && pnpm build && pnpm check:budget`. The budget needs a fresh build, and putting a build inside `pnpm check` would turn a ten-second command into a forty-second one. A fast command that stays fast is a command people keep running — the same reasoning that unbundled `check:domain` from the test run.

- **`pnpm check:budget`** → per-route enforcement of the budget below. Reads the ceiling **out of this file**, so the number in the table is the number enforced and there is no second copy to drift. Details and the two findings behind its implementation are in [tasks/1a-step-08-budget-motion.md](tasks/1a-step-08-budget-motion.md).

This is how "Never claim done without running the command and quoting output" gets enforced mechanically instead of relying on memory.

### Why Vitest and not a hand-rolled Node script

An earlier draft of this document specified two plain scripts run under `node --experimental-strip-types`, chosen for zero dependencies. That version has a hidden cost that outweighs the saved dependency: plain Node cannot resolve the `@/` bundler alias, so **every** module would have been forced to import its siblings by relative path with explicit `.ts` extensions, and both `tsconfig.json` and `scripts/tsconfig.json` would have needed `allowImportingTsExtensions: true`. That is production import style being bent to suit a test harness.

Vitest resolves `@/` through `tsconfig` paths, which removes that constraint entirely, and adds per-test isolation (one failing assertion no longer aborts the rest of the run), real failure diffs, and watch mode. `check:setup` goes through Vitest too rather than staying a plain script — otherwise the `@/` restriction survives in `src/server/` and the whole trade is lost for nothing.

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
│   ├── agents/                # project-manager, engineering-lead, ui-designer,
│   │                          # software-engineer, code-reviewer. ui-designer owns
│   │                          # everything a visitor can see, code included
│   ├── skills/                # arena-player-gotchas, arena-player-database, arena-player-design
│   ├── hooks/
│   │   ├── notify.ps1             # Stop/Notification/SubagentStop toast
│   │   ├── inject-gotchas.ps1     # SessionStart — injects the trap list
│   │   ├── check-claudemd.ps1     # Stop — nudges when CLAUDE.md drifts
│   │   └── check-docs.ps1         # Stop — runs scripts/check-docs.mjs, exits 2 on failure
│   └── settings.json
├── public/                     # served as-is; nothing secret ever goes here
│   ├── logo.svg                # AP monogram placeholder — TODO(content)
│   ├── favicon.ico             # derived from the logo
│   ├── og-image.png            # derived from the logo
│   └── mockServiceWorker.js    # MSW, dev only — MUST be absent from prod builds
├── db/                         # NOT under src/ — SQL run by hand, never imported
│   ├── migrations/            # run manually in the Neon SQL editor
│   └── README.md
├── src/                        # *.test.ts colocated beside the module each one covers
│   ├── app/                    # Next.js App Router — the composition layer.
│   │   │                       # The one lowercase-component folder: layout/page/route
│   │   │                       # are framework filenames and providers.tsx keeps their casing
│   │   ├── page.tsx
│   │   ├── providers.tsx       # QueryClientProvider, client component
│   │   ├── booking/page.tsx
│   │   └── api/
│   │       ├── availability/route.ts
│   │       └── bookings/route.ts
│   ├── modules/                # named after SURFACES. Modules never import each other.
│   │   │                       # No index.ts barrels — see the route split.
│   │   │                       # Components are PascalCase.tsx, named for their export;
│   │   │                       # everything else keeps <module>.<role>.ts
│   │   ├── home/               # renders /
│   │   │   ├── HomePage.tsx    # the page composition
│   │   │   ├── components/     # Hero, HeroCanvas, OrderSection, Section, DatePills, SlotCell
│   │   │   ├── home.service.ts # native fetch — the availability GET
│   │   │   ├── home.queries.ts # TanStack Query hooks
│   │   │   └── home.types.ts
│   │   └── booking-form/       # renders /booking. Named booking-FORM because / is
│   │       │                   # also about booking — its product is the slot grid
│   │       ├── BookingEntry.tsx        # decides which of the entry states renders
│   │       ├── BookingForm.tsx         # the form itself
│   │       ├── components/
│   │       ├── booking-form.schema.ts  # zod
│   │       ├── booking-form.service.ts # axios, via services/api-client
│   │       ├── booking-form.proof.ts   # upload MIME + size — web only, admin never uploads
│   │       ├── booking-form.queries.ts
│   │       └── booking-form.types.ts
│   ├── domain/                 # BYTE-IDENTICAL with arena-player-admin — see the contract below
│   │   ├── slots.ts            # 0 deps — TIME_SLOTS, canonicalisation, slotStartHour()
│   │   ├── dates.ts            # date-fns — field-local WITA (Asia/Makassar) helpers, booking window, isPastSlot
│   │   ├── status.ts           # 0 deps — the two status vocabularies and the 4→3 mapping
│   │   ├── phone.ts            # 0 deps — normalisation, Indonesian mobile check
│   │   └── *.test.ts           # one beside each
│   ├── server/                 # every file opens with import "server-only"
│   │   ├── db.ts               # Neon client, OID parser override
│   │   ├── storage.ts          # R2 client, checksum config
│   │   └── env.ts              # zod-validated process.env
│   ├── services/api-client.ts  # axios instance — /booking ONLY
│   ├── components/             # cross-module UI primitives only. One consumer = it
│   │                           # belongs in that module's components/ instead
│   ├── hooks/                  # cross-module React hooks, same one-consumer rule.
│   │                           # use-<thing>.ts. A module's own hooks stay in the
│   │                           # module as <module>.queries.ts — data-fetching hooks
│   │                           # are never promoted here, they belong to a surface
│   ├── lib/                    # polish for installed libraries, flat, no subfolders
│   │   ├── cn.ts               # clsx + tailwind-merge
│   │   ├── motion.ts           # gsap.matchMedia() wrapper, LAZY-imports GSAP
│   │   └── query-client.ts
│   ├── utils/                  # web-only helpers
│   │   ├── error.ts            # isNetworkError/isServerError/isClientError, apiErrorMessage()
│   │   └── formatter.ts        # date, phone, and file-size display formatting
│   └── mocks/                  # MSW handlers — dev only, retired in Phase 4
├── scripts/
│   └── check-setup.test.ts     # live Neon + R2 preflight — Phase 4, needs .env.local
└── vitest.config.ts
```

`db/` stays outside `src/` deliberately: it holds SQL executed by hand in the Neon
console, not source anything imports. `public/` stays at the root because Next
requires it there even with a `src/` root.

All of the above except `docs/`, `CLAUDE.md`, and `.claude/` gets created during **Phase 1a** — not part of this scaffolding pass.

## Package versions — resolved and pinned, Phase 1a step 02

Every version below was resolved against the registry on 2026-08-08 and is pinned exactly in `package.json`. An earlier draft pinned figures from memory; a wrong pin fails `pnpm install` on day one with a confusing error, and false precision reads as "someone checked this" when nobody did.

| Package                                | Version                                                                                                                     |
| -------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `next`                                 | 16.3.0                                                                                                                      |
| `react` / `react-dom`                  | 19.2.8                                                                                                                      |
| `gsap`                                 | 3.15.0 — Standard "no charge" licence, verified at install                                                                  |
| `@gsap/react`                          | 2.1.2                                                                                                                       |
| `axios`                                | 1.19.0 — `/booking` only                                                                                                    |
| `zod`                                  | 4.4.3 — `/booking`, `src/app/api/`, and `src/server/` only                                                                  |
| `clsx`                                 | 2.1.1 — measured at 0.2KB                                                                                                   |
| `tailwind-merge`                       | 3.6.0 — measured at 8.0KB. The v3 line targets Tailwind v4; a separate `tailwind-merge-2` dist-tag still serves the v3 line |
| `react-hook-form`                      | 7.84.0 — `/booking` only. **Not 7.85.0**, see the release-age policy below                                                  |
| `zustand`                              | 5.0.14                                                                                                                      |
| `@tanstack/react-query`                | 5.101.4                                                                                                                     |
| `date-fns`                             | 4.4.0 — **also a peer requirement of the admin repo**, see the shared-code contract                                         |
| `@date-fns/tz`                         | 1.5.0 — same peer requirement                                                                                               |
| `react-icons`                          | 5.7.0 — barrel package; measured at 2.2KB for six icons, tree-shaking confirmed                                             |
| `tailwindcss` / `@tailwindcss/postcss` | 4.3.3                                                                                                                       |
| `typescript` (dev)                     | 5.9.3                                                                                                                       |
| `eslint` (dev)                         | 9.39.5                                                                                                                      |
| `msw` (dev)                            | 2.15.0                                                                                                                      |
| `vitest` (dev)                         | 4.1.10                                                                                                                      |
| `@neondatabase/serverless`             | **not installed** — Phase 4                                                                                                 |
| `@aws-sdk/client-s3`                   | **not installed** — Phase 4                                                                                                 |
| `server-only`                          | 0.0.1                                                                                                                       |
| pnpm (`packageManager`)                | 11.17.0                                                                                                                     |

### Three resolution traps this hit, so the next person does not

**`latest` is not the newest version.** `pnpm view <pkg> version` returns the `latest` dist-tag; sorting the versions array by publish order returns whatever shipped most recently, which for `react` is `19.0.8` on the `backport` tag rather than `19.2.8`. **Read `dist-tags`.** That same read is what caught `next@15.5.23` sitting on `backport` — Next 15 is in maintenance — which is why this project is on Next 16.

**`latest` is not always supported.** TypeScript's `latest` is 7.0.2 and ESLint's is 10.8.1, but `create-next-app@16.3.0` pins `^5` and `^9`. The peer ranges are permissive enough to allow the newer majors (`typescript >=3.3.1`), and permissive is not the same as tested. This repo takes the combination Vercel ships.

**A release-age policy will reject a same-day publish.** `react-hook-form@7.85.0` was published hours before install and pnpm's `minimumReleaseAge` check refused the lockfile. The fix is the newest version that clears the cutoff — 7.84.0 — not relaxing the policy. Editing `package.json` alone is not enough; the lockfile keeps the old resolution until `pnpm clean --lockfile`.

### pnpm 11 blocks install scripts

An unapproved dependency build script fails the whole install. Decisions live in `pnpm-workspace.yaml` under `allowBuilds`, each with the reason inline. `msw` is allowed: its postinstall re-copies `mockServiceWorker.js` so the worker cannot drift from the installed library version.

## Import conventions

`"@/*"` resolves to `./src/*`. Everything uses it — `from "@/domain/dates"`, `from "@/lib/cn"`. Vitest resolves the same alias through `tsconfig` paths, so there is no separate resolution mode to satisfy and no `allowImportingTsExtensions` anywhere.

**One documented exception: `src/domain/` imports its own siblings relatively** — `from "./slots"`, never `from "@/domain/slots"`. Those files are byte-identical copies living in two repos, and a relative import resolves the same in both no matter what either `tsconfig` aliases. The alias form would silently tie the frozen copy to one repo's path config.

Three directional rules, all enforced by the ESLint zones in [the route split](#the-route-split--how--is-kept-from-paying-for-the-form):

- **Nothing under `src/` imports from `src/app/`** — the extraction boundary, below.
- **Feature modules never import each other.** `src/app/` composes them; shared vocabulary lives in `src/domain/`.
- **`src/components/` and `src/hooks/` never import a module.** They sit below modules, which consume them. A shared hook reaching into `@/modules/home` is not shared — it is a home hook in the wrong folder, and it pulls whatever that module imports onto every surface that uses it.
- **`src/domain/` imports nothing from the rest of `src/`.** It is the bottom of the graph.

## Extraction boundary, and the shared-code contract

Nothing under `src/` imports from `src/app/`. The admin app lives in its own repo (`arena-player-admin`) and talks to the same database, so this boundary is what keeps slot math, date helpers, and validation shareable rather than reimplemented.

### `src/domain/` is a contract, not a convenience

Everything both repos must agree on lives in **`src/domain/`**, at **the same path in both**, and is **byte-identical**:

| Module      | Dependencies               | Why both repos need it                                                                                                                                 |
| ----------- | -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `slots.ts`  | none                       | `TIME_SLOTS` and slot canonicalisation                                                                                                                 |
| `dates.ts`  | `date-fns`, `@date-fns/tz` | Field-local WITA (Asia/Makassar) helpers, the booking window, `isPastSlot`                                                                             |
| `status.ts` | none                       | The two status vocabularies, `ACTIVE_STATUSES` mirroring `uniq_active_slot`'s `WHERE` clause, and the 4→3 mapping the admin mutates and the site reads |
| `phone.ts`  | none                       | Normalisation to `628xxxxxxxxx`, so a number the site stores and a number the admin searches for are the same string                                   |

**Named `domain/`, not `shared/`.** Not DDD — there are no aggregates or repositories here, just business rules. The name was chosen over `shared/` because once `src/modules/` exists, "shared" reads as _shared between modules_ and attracts the first cross-module button component into a folder that can never accept one.

**Three of the four have no dependencies, and that is deliberate** — see the peer-dependency section below. Only `dates.ts` reaches for `date-fns`, so importing `TIME_SLOTS` costs no date library.

**The booking form's zod schema is _not_ here.** It lives in `src/modules/booking-form/booking-form.schema.ts`, because the admin never creates a booking and putting zod in the frozen folder would oblige the admin repo to install it.

**`booking-form.proof.ts` is deliberately _not_ here either.** The 2MB limit and the MIME allowlist govern uploading, and the admin only ever reads proofs. Putting upload-only constants under a byte-identical drift check buys the admin repo nothing and gives the check a file it has no reason to care about.

**Why byte-identical and not merely equivalent.** `uniq_active_slot` compares `time_slot` as **text**. `'06.00 - 08.00'` and `'06.00-08.00'` are two different slots to Postgres, so a one-character drift between the repos means the admin writes rows the site cannot match — and **anti-double-booking silently stops working for both**. Nothing throws. The index is the only race guard there is, and a drifted string disables it without a symptom.

**Mechanism: a plain copy in both repos, guarded by `pnpm check:domain`.** No workspace, no published package, no submodule — the shared surface is ~150 lines and this project is handed to a client at the end. A workspace reverses the separate-repo decision; a package makes the client inherit registry credentials; a submodule turns a plain `git clone` into an empty directory that fails confusingly.

The copy is only defensible because the check exists:

```bash
pnpm check:domain     # diffs src/domain/ against the other repo's copy, exits non-zero on any difference
```

`scripts/check-domain.mjs` reads the sibling repo from `../arena-player-admin`, overridable with `ARENA_ADMIN_PATH`, and diffs each file **in both directions** — a one-way walk cannot see a file present on the far side and absent here. `pnpm check` runs it, so it is not something to remember.

**Tests are diffed too, not only the four modules.** The admin repo inherits the proof, not just the code: its copy is verified to _behave_ identically rather than merely to look identical. The price is a third obligation — vitest, alongside `date-fns` and `@date-fns/tz`.

**Until the admin repo has a `src/`, the check skips and says so loudly**, naming how many files are unguarded. A check that reports success when it compared nothing is worse than no check.

**The check must be proven to fail before it is trusted.** Change one character in a `src/domain/` file, watch it exit non-zero, revert. A check that has only ever passed is a check nobody has tested — this repo shipped a `Stop` hook that never fired once for exactly that reason.

### A byte-identical copy carries its dependencies with it

`src/domain/dates.ts` imports `date-fns` and `@date-fns/tz`, so **the admin repo must install both at the same major version** or the copy passes `check:domain` and then fails to build. This is a real cost of choosing a date library over native `Intl`, which would have left `src/domain/` dependency-free — worth naming rather than discovering in the admin repo's first install.

`check-domain.mjs` therefore diffs two things, not one:

1. Every file under `src/domain/`, byte for byte
2. The version range of each shared peer dependency in both `package.json` files

The second check is not decoration. `date-fns` v3 and v4 differ in exactly the timezone API this project relies on, so two repos on different majors produce a byte-identical `dates.ts` that computes different dates — the same silent-wrong-answer failure the first check exists to prevent, arriving through the lockfile instead of the source.

**Keep the shared surface's dependency list as short as it is.** Every package added to `src/domain/` is a package the admin repo is now obliged to carry.

**Web owns `db/migrations/`.** The admin repo reads the schema and never alters it. Two repos migrating one database is a conflict with no owner to resolve it.
