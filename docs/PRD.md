# Arena Player — Product Requirements Document

Booking website for a mini soccer field. Users check slot availability, pick a date and time, get redirected to the field admin's WhatsApp, then complete a booking form with payment proof upload. The admin confirms bookings manually.

Delivery is sequenced **frontend-first**. Phases 1a–3 build the UI against a mock. Phase 4 (backend) is mandatory before launch but its design is deferred to a discussion after Phase 3 — see [Phase 4 and later](#phase-4-and-later). Everything past that (WhatsApp bot, real content, deploy, handover) is genuinely optional or blocked on client input.

---

## Phase overview

| Phase | Track                   | Scope                                                                            | Blockers                |
| ----- | ----------------------- | -------------------------------------------------------------------------------- | ----------------------- |
| 1a    | Engineering foundation  | Architecture plan, scaffold, DX harness, dev rules, **API contract + mock layer** | None — start here       |
| 1b    | Design foundation       | **Art direction** + hero copy → design system HTML, which doubles as the prototype. **Client checkpoint** | 1a scaffold running |
| 2     | Landing page            | `/` — layout → order → hero → content → footer. **Client checkpoint**            | 1b                      |
| 3     | Booking form            | `/booking` — layout → UI → validation → submission → TanStack Query + axios       | Phase 2                 |
| 4     | Backend — **mandatory** | Neon schema, both API routes, anti-double-booking, R2 upload. **Nothing real works without it** | Design discussion after Phase 3 |
| —     | Genuinely later         | WhatsApp bot, real content swap, deploy, handover                                | After Phase 4           |

**Phases 1a–3 produce a site that looks finished but cannot take a single real booking.** It runs entirely against the MSW mock. Phase 4 is where the hardest and most expensive work sits — the race condition that [database.md](database.md) calls the most expensive bug in this project. Worth stating plainly so a convincing Phase 3 demo is not mistaken for a nearly-done product.

**Scope of this repo:** `arena-player-web` is the public-facing site only — landing page, booking form, availability API. The admin app is **out of scope for this repo** and will live in a separate repo (`arena-player-admin`) when it is built. Nothing in this repo should add auth, admin routes, or an admin UI.

---

## Phase 1a — Engineering foundation

No product UI ships here. It ends with a repo that runs, rules that are written down, and an API contract the later phases can build against.

| # | Task | Output |
|---|------|--------|
| 1 | Plan the architecture | Folder structure, routing plan, component boundaries, state strategy — reconciled against [architecture.md](architecture.md) |
| 2 | Scaffolding | Next.js 15 + TypeScript + Tailwind installed via pnpm, runs at `localhost:3000` |
| 3 | Developer experience | Lint/format/typecheck scripts, Vitest wired as the `check:lib` harness, editor config, commit hooks if warranted. **`check:setup` is NOT built here** — it connects to Neon and R2, neither of which exists until the backend phase |
| 4 | Development rules | Written conventions the agents must follow — naming, file layout, component patterns, accessibility baseline (labels, `aria-describedby` on errors, focus management, keyboard operability), what never goes in `app/` |
| 5 | Lock the API contract | Exact request/response JSON for both routes, including the 409 shape, written into [architecture.md](architecture.md) |
| 6 | Slot + date primitives | `lib/slots.ts` (canonical `TIME_SLOTS`) and `lib/dates.ts` (Asia/Jakarta helpers, today + 13 days), each with its colocated `*.test.ts` |
| 7 | Mock layer + data plumbing | MSW handlers implementing that contract **and importing task 6's primitives**, `QueryClientProvider`, axios instance |
| 8 | Performance budget + motion wrapper | The KB/LCP budget written into [architecture.md](architecture.md), and `lib/motion.ts` wrapping `gsap.matchMedia()` |

Task 5 is what keeps Phase 3 from dead-ending. Without a written contract, the form phase would invent response shapes that the backend phase then has to match or break.

Task 6 sits in 1a rather than Phase 2 because task 7 needs it: a mock that hardcodes its own slot strings is a second source of truth that drifts from `TIME_SLOTS` silently, and the drift only surfaces when the real backend lands. It also gives `check:lib` something real to assert from day one instead of shipping as an empty harness. Phase 2's order section then consumes primitives that are already tested.

- `GET /api/availability` — **firm**. Nothing in the deferred backend discussion changes it.
- `POST /api/bookings` — **provisional**. Presigned-URL upload (on the backend discussion agenda) turns it from multipart into JSON carrying an already-uploaded object key. Marked as such in architecture.md so nobody treats it as settled.

Task 7 mocks at the network level rather than stubbing functions, so Phases 2–3 exercise real fetch/loading/error paths and the eventual backend swap is a base-URL change, not a rewrite.

**Skills:** `/plan-eng-review` and `/plan-devex-review` on the plan before building; `/devex-review` on the scaffolded repo after.

**Done when:** `pnpm dev` serves the app, lint/typecheck run clean, rules are written, the contract is in architecture.md, `pnpm check:lib` passes with real assertions on `lib/slots.ts` and `lib/dates.ts`, the mock returns realistic availability data built from those primitives, the performance budget is written with measured install figures, and `lib/motion.ts` exists so no component can animate without a reduced-motion check.

## Phase 1b — Design foundation

| # | Task | Output |
|---|------|--------|
| 1 | **Establish the art direction** | A written direction: type scale, spacing rhythm, section-transition language, and what "surpass the benchmark, inverted to light blue-white" means concretely. Driven by `/impeccable` plus any benchmark/moodboard references |
| 2 | **Draft the hero copy** | Indonesian headline, subheadline, and meta description — drafted as options, chosen by the user via `AskUserQuestion`. Decided here because copy and type scale are decided together: a 3-word headline and a 12-word one need different scales |
| 3 | Analyze design system | Audit [design-system.md](design-system.md) against the direction and the brand tokens; resolve gaps before any pixel is drawn |
| 4 | Design system HTML | One page rendering every token, type scale, and component state — including all three slot states and the date pill |
| 5 | Make it walkable | Click handlers on that same page proving the landing → order → form journey |

**Task 1 is the one that keeps Phase 2 coherent.** The tokens are already decided (navy, accent, white); what is not decided anywhere is the art direction. Without it, Phase 2 runs `/impeccable` section by section and each section improvises its own visual idea — five sections, five directions, no through-line. That is exactly how a site reads as templated despite every section being individually fine. The direction is written once here and Phase 2 executes it.

This is also where benchmark references get consumed: read them, write the findings into [design-system.md](design-system.md), then delete the files per `docs/references/README.md`.

Tasks 4 and 5 are **one artifact, not two**. The design system page *is* the prototype; it then serves as the component reference Phase 2 builds from. Building a separate throwaway prototype would mean paying for the UI twice.

Hero copy (task 2) is drafted in-house and user-approved — unlike the Ketentuan, which is verbatim client content. If the client later supplies their own wording, that is a `TODO(phase2)` swap in the same bucket as the WA number and bank details.

### Client checkpoint — the cheapest rework you will ever buy

**The client sees the design system HTML before Phase 2 starts.** Art direction, type scale, colour application, all three slot states, the date pill, the hero copy.

This is the highest-leverage checkpoint in the project. Rejecting a direction here costs **one HTML page**. The same rejection during Phase 2 costs five rebuilt sections; after Phase 2 it costs the landing page. Moving that conversation left is the entire point.

Treat it as a **blocking input**, not a courtesy. If the client is slow to respond, that is schedule risk to raise immediately — not a reason to start Phase 2 against an unapproved direction and hope.

### Hero-video decision gate (decide here, before anything is produced)

Whether the hero gets a `/remotion-create` video is settled in this phase — **before** production starts, not after. Deciding afterwards would mean paying for a video that then gets rejected.

Passes only if all three hold:

1. Measured LCP stays **< 2.5s** on throttled mid-range mobile with the video in place
2. The poster-only path still looks intentional — iOS Low Power Mode and in-app webviews block autoplay outright, so a real share of visitors see nothing else
3. Video weight plus lazy chunk clears the performance budget in [architecture.md](architecture.md)

**Pass** → `/remotion-create` produces the hero video, and the "no autoplaying video" guardrail is amended to name this one exception.
**Fail** → hero stays text/logo LCP, and `/remotion-create` is used only for off-site social assets (Instagram Reel, social preview), which cost the landing page nothing.

**Skills:** `/impeccable` to set the direction; `/design-review` on the result.

**Done when:** the art direction is written down, the hero copy is chosen, every token and component state is visible on one page, the journey is clickable end to end, the hero-video gate has been decided either way, and **the client has seen the design system HTML and approved the direction — or their changes are folded in before Phase 2 starts.**

## Phase 2 — Landing page (`/`)

Built in this order — each section merges before the next starts. **Order section comes first**: it is the product, it carries all the state and data-fetching risk, and building it first gives it the most iteration time instead of the least.

| # | Section | Notes |
|---|---------|-------|
| 1 | Layout | Page shell, grid, spacing rhythm, responsive frame 375px → 1440px |
| 2 | Order | Anchor `#order`. Date picker (14 days) + time slot grid against the mock. **No pricing shown here** |
| 3 | Hero | Full viewport, logo, headline, CTA "Pesan Lapangan" scrolling to `#order` |
| 4 | Content | Ketentuan (10 rules, verbatim Indonesian) + Location & Contact |
| 5 | Footer | Closing CTA back to `#order` + footer |

**Skills:** `/impeccable` for design, executing the art direction written in 1b rather than inventing a new one per section. GSAP does the animation — `/remotion-create` is only for producing video assets, and only if the 1b hero-video gate passed.

**Per-section gate:** Lighthouse mobile ≥ 85, `prefers-reduced-motion` verified, and keyboard navigation working — checked as each section merges, not batched to the end of the phase. Animation and accessibility debt are both far cheaper to fix one section at a time than across five.

### Client checkpoint

**The client sees the landing page on a real phone**, not a desktop browser resized. Primary traffic is the Instagram in-app browser, and that is the context the client should judge it in.

Cheaper than the 1b checkpoint was, more expensive than nothing — which is why the direction was already signed off at 1b. What is being confirmed here is execution, not direction: if the direction itself gets reopened at this point, something went wrong at the earlier checkpoint.

**Done when:** all five sections render responsively, the order section is reachable in 1–2 scrolls at 375px, every section has passed its gate, and **the client has seen the landing page on a phone and signed off.**

## Phase 3 — Booking form (`/booking`)

| # | Task | Notes |
|---|------|-------|
| 1 | Layout | Page shell + locked summary card showing the chosen date/time |
| 2 | UI | Nama Tim, Nomor WhatsApp, notes, payment info card, proof upload control, honeypot |
| 3 | Validation | Required fields, Indonesian phone format (08xx/62xx), image-only ≤2MB |
| 4 | Submission | Success state, taken-slot state, error states |
| 5 | API integration | TanStack Query mutation over the axios instance, against the Phase 1a mock |
| 6 | End-to-end journey check | Walk landing → slot select → wa.me → `/booking` → success as one continuous flow. The WA number is still a `TODO(phase2)` placeholder, so this verifies **link construction, the message template, and the params handed to `/booking`** — not a real conversation. Do not report the placeholder as a failure |

**Skills:** `/impeccable` for design — the form is the conversion point, and a polished landing page handing off to a plain form is where the quality gap shows. `/qa` for task 6.

**Gate:** same as Phase 2 — Lighthouse mobile ≥ 85, `prefers-reduced-motion`, keyboard navigation.

**Accessibility is load-bearing here**, more than anywhere else on the site:

- Every input has an associated `<label>`; error messages are tied to their field via `aria-describedby` so screen readers announce them
- `inputMode="tel"` on the WhatsApp field — a mis-associated label means the wrong keyboard appears on the Instagram in-app browser, which is most of the traffic
- Focus moves to the success or error message on submit, not left on a dead button
- The file upload control is reachable and operable by keyboard, not click-only

**Done when:** the form validates, submits, renders every response state including 409, passes the gate, meets the accessibility points above, and the end-to-end journey works in one pass.

---

# Product spec

The full functional spec for everything Phases 1a–3 build. Phase boundaries above say *when*; this section says *what*.

Explicitly EXCLUDED from this repo: the admin application. Excluded until later phases: WhatsApp bot integration, production deploy, real client content.

## Tech stack

- Next.js 15 (App Router) + TypeScript + Tailwind CSS
- Neon Postgres (serverless) + Cloudflare R2 (payment proofs). Both accessed only from route handlers via env vars, zero hardcoded keys. Developer's own accounts for Phase 1; ownership transferred to the client later.
- GSAP + ScrollTrigger (with `@gsap/react`) for animation — chosen over Framer Motion for pinned and scrubbed scroll timelines, which is what the heavy scroll-driven direction below actually needs. Not both: two animation runtimes for one job is ~35KB of redundancy
- axios for frontend HTTP calls, wrapped by TanStack Query — the query layer supplies caching, request dedup, retry, and loading/error state that raw axios would otherwise be hand-rolled per component
- MSW for the mock API layer that Phases 1a–3 develop against
- Fonts: Orbitron (next/font/google) for display/headings, a clean sans (e.g. Inter) for body
- No auth at all in this repo (the admin app, which is where auth belongs, lives in a separate repo)

Full architecture, database, and design-system detail lives in [architecture.md](architecture.md), [database.md](database.md), and [design-system.md](design-system.md) — this PRD is the product spec, those are the implementation contracts.

## Brand / design tokens

- Primary navy: `#011A43` (sampled from logo)
- Accent blue: `#2563EB` (interactive states, links, available-slot accents)
- Background: `#FFFFFF`, generous whitespace, clean theme
- Status colors: available = accent blue outline, PENDING = yellow, BOOKED = red/disabled
- Logo: navy "AP" mark on white (file provided by owner)
- Overall direction: light, clean, blue-and-white — the INVERSE of the dark benchmark site (bataskotapoint.com). Do not copy the benchmark's dark neon theme.

Full token table, typography, and animation budget: [design-system.md](design-system.md).

## Routes

### `/` — Landing page (single page, in rendered order — the Phase 2 build order differs deliberately)

1. **Hero** — full viewport. Logo, headline, subheadline, primary CTA button "Pesan Lapangan" (smooth-scrolls to `#order`). Scroll-driven entrance animation.
2. **Order section ("Pesan Lapangan")** — the core of the page, must be reachable within the first 1–2 scrolls on mobile. Anchor id `#order`:
   - Date picker: next 14 days, horizontal scrollable pills on mobile
   - Time slot grid: 06.00–08.00 through 22.00–24.00 (2-hour slots, 9 per day), fetched from `GET /api/availability` — the MSW mock in Phases 2–3, real Neon data once the backend lands
   - NO prices shown in this section — pricing belongs on `/booking`
   - Slot states: available (selectable), PENDING (disabled, label "Menunggu Konfirmasi"), BOOKED (disabled)
   - On submit with a selected slot: open `https://wa.me/<PLACEHOLDER_NUMBER>?text=<template>` in a new tab, where template = "Halo, saya mau booking lapangan Arena Player tanggal {DD MMM YYYY} jam {slot}". Simultaneously route the user to `/booking?date=...&time=...`.
3. **Rules ("Ketentuan")** — static content, exact 10 rules listed below (keep verbatim in Indonesian — it is site content).
4. **Location & Contact** — arena address (placeholder), Google Maps embed (placeholder coords), operating hours 06.00–24.00, WhatsApp contact button.
5. **CTA Footer + Footer** — big closing CTA "Pesan Lapangan" scrolling back to `#order`, then logo, copyright, minimal links. Built as one unit in Phase 2.

### `/booking` — Booking form

- Reads `date` and `time` from query params, shown as a locked summary card (user can go back to change them, not edit inline)
- Fields: Nama Tim (required), Nomor WhatsApp (required, validate Indonesian format 08xx/62xx), notes (optional)
- Payment info card: bank account number + account holder name (placeholders), instruction text "Transfer DP 50% dari harga sewa. Nominal dikonfirmasi admin via WhatsApp."
  - **OPEN DECISION** — pricing on this page. The current wording shows no number at all; the admin quotes it over WhatsApp. If an actual rupiah amount should render here instead, the client must supply the rate card (flat rate vs peak/off-peak vs weekend), and the "no prices in the UI" hard rule in CLAUDE.md narrows to "no prices on `/`". Unresolved — do not render a number until it is.
- Payment proof upload: required, image only (jpg/png/webp), max 2MB, uploaded to the private R2 bucket
- Honeypot hidden field for spam protection
- On submit: POST to the API. Success screen: "Pemesanan berhasil. Menunggu konfirmasi admin via WhatsApp." Failure for a taken slot: friendly message "Yah, slot ini baru saja diambil orang lain. Silakan pilih waktu lain." with a button back to `/#order`.

## Data model (Neon Postgres)

```sql
create table bookings (
  id uuid primary key default gen_random_uuid(),
  booking_date date not null,
  time_slot text not null, -- e.g. '06.00 - 08.00'
  team_name text not null,
  phone text not null,
  notes text,
  proof_url text not null, -- R2 object KEY in the private bucket, not a URL
  status text not null default 'pending', -- pending | confirmed | rejected | expired
  created_at timestamptz not null default now()
);

-- Anti double-booking: only one ACTIVE booking per slot.
create unique index uniq_active_slot
  on bookings (booking_date, time_slot)
  where status in ('pending', 'confirmed');
```

Full migration file, gotchas, and error-code contract: [database.md](database.md).

Key behaviors:

- A slot becomes PENDING only AFTER the form (with proof) is successfully submitted. Selecting a slot on the landing page holds nothing.
- Insert must rely on the partial unique index; on conflict return 409 to the client. Never check-then-insert without the constraint.
- Auto-expire: pending bookings older than 24 hours become `expired` (freeing the slot). Lazy expiry on read in the availability API is acceptable — no cron required.
- Availability API: given a date, return the 9 slots with computed status. Cache no longer than 30s.

## API routes (Next.js route handlers)

- `GET /api/availability?date=YYYY-MM-DD` → `[{ slot, status }]` (runs lazy expiry first)
- `POST /api/bookings` → validates fields, uploads proof, inserts booking; 409 on slot conflict
- Neon is reachable only from server-side route handlers via `DATABASE_URL` (never `NEXT_PUBLIC_`-prefixed); there is no browser-facing database client and nothing to lock down with row-level policies — the API surface itself is the only write path. R2 credentials are equally server-only; the browser never touches Neon or R2 directly.

## Design direction (important)

The design should feel like you are creating a winning Awwwards website. Create a UI/UX like a high-end animated and interactive website. Enhance and surpass the benchmark (bataskotapoint.com) but inverted to a light, clean, blue-and-white identity.

Animation level: HEAVY, but mobile-performant:

- Scroll-driven animations (section reveals tied to scroll progress), pinned and scrubbed sequences via ScrollTrigger
- Parallax layers in hero and section backgrounds
- Marquee strip (e.g. "ARENA PLAYER — MINI SOCCER — BOOK NOW —" repeating) between sections — stays CSS `@keyframes`, GSAP does not replace it
- Micro-interactions: magnetic/hover states on CTAs, slot cells animating on state change, smooth scroll
- Orbitron for display type, oversized typographic moments, whitespace as a design element

Hard performance guardrails:

- CSS transforms + GSAP only; `prefers-reduced-motion` respected on every animated component via the `lib/motion.ts` wrapper — GSAP has no built-in equivalent of Framer's `useReducedMotion`, so the wrapper is the mechanism
- **One** WebGL moment permitted, hero only, under the conditions in [architecture.md](architecture.md) — dynamically imported, static fallback, ≤ 40KB gzip, deletable in one commit. That cap excludes three.js and pixi.js
- No Lottie files over 100KB. No autoplaying video unless the Phase 1b hero-video gate passes
- Everything stays inside the performance budget in [architecture.md](architecture.md) — that table is the single source, do not restate its numbers here
- LCP under 2.5s on mid-range mobile; the order section must become interactive fast — it is the product
- Design at 375px width first; primary traffic is the Instagram in-app browser

## Static content — Rules section (verbatim, Indonesian)

PERATURAN SEWA LAPANGAN

1. Booking, wajib DP sebesar 50% (harga sewa lapangan)
2. Pembatalan sewa dilakukan sebelum 1 x 24 jam. Diluar itu DP dianggap hangus
3. Jika terjadi hujan, waktu bermain dapat di-reschedule atau DP di-refund
4. Wajib menggunakan sepatu sepak bola (turf atau pull plastik)
5. Dilarang menggunakan sepatu sepak bola dengan pull besi
6. Dilarang merokok, makan, dan membuang sampah ke dalam area lapangan
7. Dilarang membawa alkohol, narkoba, senjata tajam, dan benda terlarang lainnya ke area Arena Player
8. Dilarang membuat keributan atau berkelahi di lapangan
9. Luka, cidera, dan kecelakaan yang dialami pemain bukan tanggung jawab Arena Player
10. Perhatikan barang bawaan. Segala kerusakan atau kehilangan bukan tanggung jawab pihak Arena Player

## Placeholders to swap in Phase 2 (mark clearly in code with `// TODO(phase2)`)

- WhatsApp number (wa.me link)
- Bank account number + holder name
- Arena address + Google Maps coordinates
- Real photos/gallery assets if the client provides any

## Binding clarifications

- Package manager: pnpm. Lockfile `pnpm-lock.yaml`; never commit `package-lock.json`.
- Date window: today + 13 days, timezone Asia/Jakarta. Today's slots whose start time has passed render disabled (visible, not hidden).
- Payment proofs: PRIVATE Cloudflare R2 bucket. `proof_url` column stores the object KEY (not a public URL). Admin views proofs via the Cloudflare dashboard; signed URLs are the admin repo's problem, not this one's.
- Logo: generated SVG placeholder (AP monogram, navy #011A43) until the client file arrives. Favicon + OG image generated from it. Swap is a `TODO(phase2)` item.
- Repo shape: single flat repo, public site only. The admin app is a separate repo, so no monorepo is planned. Prep rule still stands: shareable code (slot math, date helpers, validation) lives in `lib/` and never imports from `app/`, so it can be extracted and shared with the admin repo later without a rewrite.
- HTTP client on the frontend: axios (Phase 3 decision — the form talks to the API through it).

## Definition of Done — Phases 1a–3

Phase 1a:

- [ ] Repo scaffolded, `pnpm dev` serves `localhost:3000`
- [ ] Lint / format / typecheck scripts run clean; Vitest wired and `pnpm check:lib` passes (`check:setup` belongs to Phase 4)
- [ ] Development rules written down, including the accessibility baseline
- [ ] API contract for both routes written into architecture.md, with `POST /api/bookings` flagged provisional
- [ ] `lib/slots.ts` + `lib/dates.ts` exist with colocated tests that actually assert — not an empty harness
- [ ] MSW handlers return realistic availability data **derived from `TIME_SLOTS`, not hardcoded**; `QueryClientProvider` and the axios instance are wired
- [ ] `/plan-eng-review`, `/plan-devex-review`, `/devex-review` all passed

Phase 1b:

- [ ] **Art direction written down** — type scale, spacing rhythm, section-transition language, and what surpassing the benchmark means concretely
- [ ] Any benchmark reference files read, findings captured in design-system.md, source files deleted
- [ ] Design system HTML renders every token, type scale, and component state — all three slot states plus the date pill
- [ ] The same page is clickable through the landing → order → form journey
- [ ] Hero-video gate decided either way
- [ ] `/design-review` passed

Phase 2:

- [ ] All 5 landing sections render, responsive 375px → 1440px
- [ ] Order section reachable within 1–2 scrolls at 375px, anchor `#order` works from both CTAs
- [ ] Slot grid reads the mock; all three states render correctly
- [ ] Slot select → wa.me opens with the correct template AND `/booking` receives params
- [ ] No pricing anywhere on `/`
- [ ] Every section executes the 1b art direction — one visual language across all five, not five improvisations
- [ ] Per-section gate passed as each merged: `prefers-reduced-motion` respected, Lighthouse mobile ≥ 85, keyboard navigation working, no CLS
- [ ] OG meta tags + title/description + favicon generated from the logo

Phase 3:

- [ ] Form validates every field, including Indonesian phone format and ≤2MB image-only upload
- [ ] Submission goes through a TanStack Query mutation over axios; success, taken-slot (409), and error states all render
- [ ] Summary card reflects the date/time query params
- [ ] Accessibility: labels associated, errors tied via `aria-describedby`, `inputMode="tel"` on the phone field, focus moves to the result on submit, upload control keyboard-operable
- [ ] Gate passed: Lighthouse mobile ≥ 85, `prefers-reduced-motion`, keyboard navigation
- [ ] End-to-end journey walks in one pass: landing → slot select → wa.me → `/booking` → success

Deferred to Phase 4: real Neon data replacing the mock, R2 upload actually persisting, the double-submit race test, and lazy expiry — all of these need the backend.

---

# Phase 4 and later

Phase 4 (backend) is **mandatory before launch** — only its design discussion is deferred. Everything after it is genuinely optional or blocked on client input. Listed so nothing is lost.

## Phase 4 — Backend (mandatory, design discussion deferred)

**Not optional and not "later" in the same sense as the rest of this section** — the site takes no real bookings until this ships. Only its *design* is deferred, to a dedicated discussion held after Phase 3. Until then the Phase 2 grid and Phase 3 form run against the MSW mock from Phase 1a.

Also lands here: `scripts/check-setup.test.ts` (`pnpm check:setup`), which is deliberately not built in Phase 1a because it connects to Neon and R2 and neither exists before this phase. It is a Vitest file like the `lib/` ones, kept under a separate glob so `check:lib` never requires credentials.

Agenda for the discussion:

| Topic | What has to be decided |
|---|---|
| Schema + data types | `bookings` columns, `date` vs `timestamptz`, status as enum or text, index set |
| Database structure | Migration strategy, how manual-run migrations stay ordered and idempotent |
| Layered architecture | Route handler → service → repository boundaries, and how those interact with the existing `lib/` extraction boundary |
| Validation | Which rules are shared client/server, which are server-only, and where the shared ones live |
| **File upload** | **Presigned URL** — browser PUTs straight to R2, then POSTs the object key. This supersedes the multipart flow currently drawn in [architecture.md](architecture.md) and is why `POST /api/bookings` is marked provisional |

Already locked, carried in unchanged — anti-double-booking via the `uniq_active_slot` partial index with its 409 contract, and lazy expiry of pending bookings older than 24h. Both are non-negotiable; see [database.md](database.md).

### Retiring MSW — required, not cleanup

**MSW must not survive into production.** It registers a service worker, so a stray `mockServiceWorker.js` in the production build intercepts real requests and serves fake availability — and it fails *silently*, looking like a working site showing wrong data. This is the single most likely way this project ships a broken deploy.

Required in this phase:

- Gate registration on `NODE_ENV` so the worker starts in development only
- Confirm `mockServiceWorker.js` is **absent from the production build output** — check the built artifact, not the source
- Handle the unregister path. Any browser that previously loaded the dev site still has the worker registered; it does not disappear because the file stopped shipping
- **Acceptance:** a production build issues real requests to `/api/availability` and `/api/bookings`, verified in the browser network panel. Verified, not inferred

## Real content + WhatsApp bot

- Replace all `TODO(phase2)` placeholders: WA number, bank account, address, maps coords, photos
- WhatsApp bot auto-reply via Fonnte or Wablas (client's account, client's monthly cost): when a user messages the booking template, the bot replies with the `/booking` link carrying the same date/time params
- Optional: gallery section if the client provides photos
- Acceptance: full user journey works end-to-end with real data — landing → WA → bot reply → form → success

Open questions: which WA bot provider and plan; final bank account details and exact payment wording; whether photo assets exist.

## Deploy + handover

- Production deploy. Target is the client's Sumopod account; fallback is Vercel free tier if Sumopod cannot run Next.js (to be confirmed)
- Neon project + Cloudflare R2 account ownership transfer (or credential handover) to a client-owned account
- Handover: env var documentation, 14-day bug warranty starts at launch

Open questions: Sumopod plan capabilities (Node.js/Next.js support, subdomain config); who holds the Neon/R2 accounts long-term.

---

# Out of scope for this repo — admin app

Tracked here for context only. Build it in a separate repo (`arena-player-admin`), on `admin.arena-player.com`, sharing the same Neon database and R2 bucket. Nothing about it is built, stubbed, or scaffolded in `arena-player-web`.

- Login: single admin account (own auth, not tied to a specific vendor)
- Bookings list with filters: pending / confirmed / rejected / expired
- View payment proof image via signed R2 URL; Confirm / Reject actions (status change reflects on this site's order section, since both read the same `bookings` table)
- Nice to have: manual slot blocking, operating-hours config
- Its own handover items: admin user guide, admin credential handover

Implication for this repo: the `bookings` table is a shared contract. Schema changes here can break the admin repo later — treat `db/migrations/` as a public interface.
