# Arena Player — Product Requirements Document

Booking website for a mini soccer field. Users check slot availability, pick a date and time, get redirected to the field admin's WhatsApp, then complete a booking form with payment proof upload. The admin confirms bookings manually.

Delivery is sequenced **frontend-first**. Phases 1a–3 build the UI against a mock. Phase 4 (backend) is mandatory before launch but its design is deferred to a discussion after Phase 3 — see [Phase 4 and later](#phase-4-and-later). Everything past that (WhatsApp bot, real content, deploy, handover) is genuinely optional or blocked on client input.

---

## Phase overview

| Phase | Track                   | Scope                                                                                                     | Blockers                        |
| ----- | ----------------------- | --------------------------------------------------------------------------------------------------------- | ------------------------------- |
| 1a    | Engineering foundation  | Architecture plan, scaffold, DX harness, dev rules, **API contract + mock layer**                         | None — start here               |
| 1b    | Design foundation       | **Art direction** + hero copy → design system HTML, which doubles as the prototype. **Client checkpoint** | 1a scaffold running             |
| 2     | Landing page            | `/` — layout → order → hero → content → footer. **Client checkpoint**                                     | 1b                              |
| 3     | Booking form            | `/booking` — layout → UI → validation → submission → TanStack Query + axios                               | Phase 2                         |
| 4     | Backend — **mandatory** | Neon schema, both API routes, anti-double-booking, R2 upload. **Nothing real works without it**           | Design discussion after Phase 3 |
| —     | Genuinely later         | WhatsApp bot, real content swap, deploy, handover                                                         | After Phase 4                   |

**Phases 1a–3 produce a site that looks finished but cannot take a single real booking.** It runs entirely against the MSW mock. Phase 4 is where the hardest and most expensive work sits — the race condition that [database.md](database.md) calls the most expensive bug in this project. Worth stating plainly so a convincing Phase 3 demo is not mistaken for a nearly-done product.

**Scope of this repo:** `arena-player-web` is the public-facing site only — landing page, booking form, availability API. The admin app is **out of scope for this repo** and will live in a separate repo (`arena-player-admin`) when it is built. Nothing in this repo should add auth, admin routes, or an admin UI.

---

## Phase 1a — Engineering foundation

No product UI ships here. It ends with a repo that runs, rules that are written down, and an API contract the later phases can build against.

| #   | Task                                | Output                                                                                                                                                                                                                                                                                                                                                                 |
| --- | ----------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Plan the architecture               | Folder structure, routing plan, component boundaries, state strategy — reconciled against [architecture.md](architecture.md). **Also decides the two open library choices**: date handling and the icon library, each checked against the performance budget. Confirm the route-split plan so `/` never loads `react-hook-form`, `zod`, or `axios`                     |
| 2   | Scaffolding                         | Next.js 16 + TypeScript + Tailwind v4 installed via pnpm, runs at `localhost:3000`                                                                                                                                                                                                                                                                                     |
| 3   | Developer experience                | Lint/format/typecheck scripts, Vitest wired as the `check:unit` harness, **`check:docs` doc-consistency script** (see below), editor config, commit hooks if warranted. **`check:setup` is NOT built here** — it connects to Neon and R2, neither of which exists until the backend phase                                                                              |
| 4   | Development rules                   | Written conventions the agents must follow — naming, file layout, component patterns, accessibility baseline (labels, `aria-describedby` on errors, focus management, keyboard operability), what never goes in `src/app/`                                                                                                                                             |
| 5   | Lock the API contract               | Exact request/response JSON for both routes, including the 409 shape, written into [architecture.md](architecture.md)                                                                                                                                                                                                                                                  |
| 6   | Shared primitives                   | **`src/domain/slots.ts`** (canonical `TIME_SLOTS`), **`src/domain/dates.ts`** (field-local WITA helpers, today + 13 days), **`status.ts`**, and **`phone.ts`**, each with a colocated `*.test.ts`. They live in `src/domain/` because the admin repo keeps a byte-identical copy at the same path — see the shared-code contract in [architecture.md](architecture.md) |
| 7   | Mock layer + data plumbing          | MSW handlers implementing that contract **and importing task 6's primitives**, `QueryClientProvider`, axios instance                                                                                                                                                                                                                                                   |
| 8   | Performance budget + motion wrapper | The KB/LCP budget written into [architecture.md](architecture.md), and `src/lib/motion.ts` wrapping `gsap.matchMedia()`                                                                                                                                                                                                                                                |

**`check:docs` (task 3)** automates the mechanical half of doc review. Three review rounds found that roughly half the issues were pure greps — and that mechanical edits are now the largest source of _new_ defects, so this catches the agent's own mistakes. It asserts: no `TODO(phase2)` survives anywhere, every `TODO(content)` names one of the **seven** declared categories — an allowlist rather than a headcount, since a supplied item loses its marker — no bare "Phase 1" references (only 1a/1b/4), and the phase overview table names the same phases as the detail sections. Wire it to a `Stop` hook exiting 2 so failures loop back — guard on `stop_hook_active` or it recurses forever. The judgment half of review (does a skill still match the PRD? is a rationale still true?) is **not** automatable and stays a human ask.

A `SessionStart` hook already injects the `arena-player-gotchas` trap list, so "every agent must load this once per session" is guaranteed rather than honor-system.

Task 5 is what keeps Phase 3 from dead-ending. Without a written contract, the form phase would invent response shapes that the backend phase then has to match or break.

Task 6 sits in 1a rather than Phase 2 because task 7 needs it: a mock that hardcodes its own slot strings is a second source of truth that drifts from `TIME_SLOTS` silently, and the drift only surfaces when the real backend lands. It also gives `check:unit` something real to assert from day one instead of shipping as an empty harness. Phase 2's order section then consumes primitives that are already tested.

- `GET /api/availability` — **firm**. Nothing in the deferred backend discussion changes it.
- `POST /api/bookings` — **provisional**. Presigned-URL upload (on the backend discussion agenda) turns it from multipart into JSON carrying an already-uploaded object key. Marked as such in architecture.md so nobody treats it as settled.

Task 7 mocks at the network level rather than stubbing functions, so Phases 2–3 exercise real fetch/loading/error paths and the eventual backend swap is a base-URL change, not a rewrite.

**Skills:** `/plan-eng-review` and `/plan-devex-review` on the plan before building; `/devex-review` on the scaffolded repo after.

**Done when:** `pnpm dev` serves the app, lint/typecheck run clean, rules are written, the contract is in architecture.md, `pnpm check:unit` passes with real assertions on `src/domain/slots.ts` and `src/domain/dates.ts`, the mock returns realistic availability data built from those primitives, the performance budget is written with measured install figures, and `src/lib/motion.ts` exists so no component can animate without a reduced-motion check.

## Phase 1b — Design foundation

| #   | Task                            | Output                                                                                                                                                                                                                                          |
| --- | ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **Establish the art direction** | A written direction: type scale, spacing rhythm, section-transition language, and what "surpass the benchmark, inverted to light blue-white" means concretely. Driven by `/impeccable` plus any benchmark/moodboard references                  |
| 2   | **Draft the hero copy**         | Indonesian headline, subheadline, and meta description — drafted as options, chosen by the user via `AskUserQuestion`. Decided here because copy and type scale are decided together: a 3-word headline and a 12-word one need different scales |
| 3   | Analyze design system           | Audit [DESIGN.md](DESIGN.md) against the direction and the brand tokens; resolve gaps before any pixel is drawn. Task 1's chosen direction becomes its Overview north star, which is deliberately left unset until then                         |
| 4   | Design system HTML              | One page rendering every token, type scale, and component state — including all four slot states and the date pill                                                                                                                              |
| 5   | Make it walkable                | Click handlers on that same page proving the landing → order → form journey                                                                                                                                                                     |

**Task 1 is the one that keeps Phase 2 coherent.** The tokens are already decided (navy, accent, white); what is not decided anywhere is the art direction. Without it, Phase 2 runs `/impeccable` section by section and each section improvises its own visual idea — five sections, five directions, no through-line. That is exactly how a site reads as templated despite every section being individually fine. The direction is written once here and Phase 2 executes it.

This is also where benchmark references get consumed: read them, write the findings into [DESIGN.md](DESIGN.md), then delete the files per `docs/references/README.md`.

Tasks 4 and 5 are **one artifact, not two**. The design system page _is_ the prototype; it then serves as the component reference Phase 2 builds from. Building a separate throwaway prototype would mean paying for the UI twice.

Hero copy (task 2) is drafted in-house and user-approved — unlike the Ketentuan, which is verbatim client content. If the client later supplies their own wording, that is a `TODO(content)` swap in the same bucket as the WA number and bank details.

### Client checkpoint — the cheapest rework you will ever buy

**The client sees the design system HTML before Phase 2 starts.** Art direction, type scale, colour application, all four slot states, the date pill, the hero copy.

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

| #   | Section | Notes                                                                                               |
| --- | ------- | --------------------------------------------------------------------------------------------------- |
| 1   | Layout  | Page shell, grid, spacing rhythm, responsive frame 375px → 1440px                                   |
| 2   | Order   | Anchor `#order`. Date picker (14 days) + time slot grid against the mock. **No pricing shown here** |
| 3   | Hero    | Full viewport, logo, headline, CTA "Pesan Lapangan" scrolling to `#order`                           |
| 4   | Content | Ketentuan (10 rules, verbatim Indonesian) + Location & Contact                                      |
| 5   | Footer  | Closing CTA back to `#order` + footer                                                               |

**Skills:** `/impeccable` for design, executing the art direction written in 1b rather than inventing a new one per section. GSAP does the animation — `/remotion-create` is only for producing video assets, and only if the 1b hero-video gate passed.

**Per-section gate:** Lighthouse mobile ≥ 85, `prefers-reduced-motion` verified, and keyboard navigation working — checked as each section merges, not batched to the end of the phase. Animation and accessibility debt are both far cheaper to fix one section at a time than across five.

### Client checkpoint

**The client sees the landing page on a real phone**, not a desktop browser resized. Primary traffic is the Instagram in-app browser, and that is the context the client should judge it in.

Cheaper than the 1b checkpoint was, more expensive than nothing — which is why the direction was already signed off at 1b. What is being confirmed here is execution, not direction: if the direction itself gets reopened at this point, something went wrong at the earlier checkpoint.

**Done when:** all five sections render responsively, the order section is reachable in 1–2 scrolls at 375px, every section has passed its gate, and **the client has seen the landing page on a phone and signed off.**

## Phase 3 — Booking form (`/booking`)

| #   | Task                     | Notes                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| --- | ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Layout                   | Page shell + locked summary card showing the chosen date/time                                                                                                                                                                                                                                                                                                                                                                                             |
| 2   | UI                       | Nama Tim, Nomor WhatsApp, notes, payment info card, proof upload control, honeypot                                                                                                                                                                                                                                                                                                                                                                        |
| 3   | Validation               | Required fields, Indonesian phone format (08xx/62xx), image-only ≤2MB                                                                                                                                                                                                                                                                                                                                                                                     |
| 4   | Submission               | Success state, taken-slot state, error states                                                                                                                                                                                                                                                                                                                                                                                                             |
| 5   | API integration          | TanStack Query mutation over the axios instance, against the Phase 1a mock                                                                                                                                                                                                                                                                                                                                                                                |
| 6   | End-to-end journey check | **Two legs, not one continuous flow** — WhatsApp is a deliberate break in the chain. Leg 1: landing → slot select → correct `wa.me` URL and message template. Leg 2: open `/booking?date=…&time=…` directly (as the admin's pasted link would) → fill → submit → success. Also verify all four param states from the Product Spec: valid, missing, expired, unavailable. The WA number is a `TODO(content)` placeholder — do not report that as a failure |

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

The full functional spec for everything Phases 1a–**4** build. Phase boundaries above say _when_; this section says _what_.

Note the split: the routes, sections, and form below are Phases 1a–3 and run against the mock. **The data model, API route behaviour, and anti-double-booking are Phase 4** — specified here because the contract has to be known before the UI is built against it, not because they ship earlier.

Explicitly EXCLUDED from this repo: the admin application. Deferred past Phase 4: WhatsApp bot integration, production deploy, real client content.

## Tech stack

- Next.js 16 (App Router) + TypeScript + Tailwind CSS v4
- Neon Postgres (serverless) + Cloudflare R2 (payment proofs). Both accessed only from route handlers via env vars, zero hardcoded keys. Developer's own accounts until the handover discussion; ownership transferred to the client then.
- GSAP + ScrollTrigger (with `@gsap/react`) for animation — chosen over Framer Motion for pinned and scrubbed scroll timelines, which is what the heavy scroll-driven direction below actually needs. Not both: two animation runtimes for one job is ~35KB of redundancy
- axios for frontend HTTP calls, wrapped by TanStack Query — the query layer supplies caching, request dedup, retry, and loading/error state that raw axios would otherwise be hand-rolled per component
- MSW for the mock API layer that Phases 1a–3 develop against
- **zod** for validation — one schema serving client and, later, server. Bought deliberately ahead of Phase 4 so the "which rules are shared" question on its agenda is already answered
- **react-hook-form** for `/booking` — the form has a file upload, per-field errors, `aria-describedby` wiring, and focus-on-submit, all of which are fiddly to hand-roll correctly
- **zustand** for client state. Note the scope: server state is TanStack Query's, the two selections could be `useState`, and cross-page state travels via `/booking?date=…&time=…` query params. Keep the store small — if it starts duplicating server data or URL state, that is the signal it has outgrown its purpose
- **Settled in Phase 1a task 1**: date handling is `date-fns` v4 + `@date-fns/tz`, icons are `react-icons`. Both are costed in the budget table in [architecture.md](architecture.md), and `react-icons` is provisional on step 02 measuring that its barrel actually tree-shakes — the fallback is written down there
- Fonts: **Panchang** (`next/font/local`, weights 500/700/800) for display/headings, **Plus Jakarta Sans** (`next/font/google`) for body — changed 2026-08-13, see DESIGN.md. Panchang is not on Google Fonts and has no width axis; both faces are self-hosted, never a CDN `<link>`
- No auth at all in this repo (the admin app, which is where auth belongs, lives in a separate repo)

Full architecture, database, and design-system detail lives in [architecture.md](architecture.md), [database.md](database.md), and [DESIGN.md](DESIGN.md) — this PRD is the product spec, those are the implementation contracts.

## Brand / design tokens

- Primary navy: `#011A43` (sampled from logo)
- Accent blue: `#2563EB` (interactive states, links, available-slot accents)
- Background: `#FFFFFF`, generous whitespace, clean theme
- Status colors: available = accent blue outline, PENDING = yellow, BOOKED = red/disabled
- Logo: navy "AP" mark on white (file provided by owner)
- Overall direction: light, clean, blue-and-white — the INVERSE of the dark benchmark site (bataskotapoint.com). Do not copy the benchmark's dark neon theme.

Full token table, typography, and animation budget: [DESIGN.md](DESIGN.md).

## Routes

### `/` — Landing page (single page, in rendered order — the Phase 2 build order differs deliberately)

1. **Hero** — full viewport. Logo, headline, subheadline, primary CTA button "Pesan Lapangan" (smooth-scrolls to `#order`). Scroll-driven entrance animation.
2. **Order section ("Pesan Lapangan")** — the core of the page, must be reachable within the first 1–2 scrolls on mobile. Anchor id `#order`:
   - Date picker: next 14 days, horizontal scrollable pills on mobile
   - Time slot grid: 06.00–08.00 through 22.00–24.00 (2-hour slots, 9 per day), fetched from `GET /api/availability` — the MSW mock in Phases 2–3, real Neon data once the backend lands
   - NO prices shown in this section — pricing belongs on `/booking`
   - Slot states: available (selectable), PENDING (disabled, label "Menunggu Konfirmasi"), BOOKED (disabled)
   - On submit with a selected slot: open `https://wa.me/<PLACEHOLDER_NUMBER>?text=<template>` — **WhatsApp only, one destination**. Template = "Halo, saya mau booking lapangan Arena Player tanggal {DD MMM YYYY} jam {slot}".
   - **The site does NOT navigate to `/booking` itself.** WhatsApp is the single handoff. The `/booking` link comes back to the user through WhatsApp: manually typed by the admin until the bot phase ships, automatically by the bot afterwards. Same URL either way — `/booking?date=…&time=…`.
   - Rationale for one destination rather than two: on mobile `wa.me` deep-links into the WhatsApp app rather than opening a tab, so pairing it with a same-tab navigation is exactly the combination that in-app webviews and popup blockers handle inconsistently — and the Instagram in-app browser is the primary traffic. One user action, one destination, no race between them.
3. **Rules ("Ketentuan")** — static content, exact 10 rules listed below (keep verbatim in Indonesian — it is site content).
4. **Location & Contact** — arena address (placeholder), Google Maps embed (placeholder coords), operating hours 06.00–24.00, WhatsApp contact button.
5. **CTA Footer + Footer** — big closing CTA "Pesan Lapangan" scrolling back to `#order`, then logo, copyright, minimal links. Built as one unit in Phase 2.

### `/booking` — Booking form

**Entry is always a link carrying query params** — pasted by the admin over WhatsApp, or sent by the bot later. Nothing on `/` links here directly, so malformed and stale params are the normal case, not the edge case. Handle all four:

| Params                                                 | Behaviour                                                                                               |
| ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------- |
| Valid `date` + `time`                                  | Normal — locked summary card, form enabled                                                              |
| Missing or unparseable                                 | Friendly message + button to `/#order` to pick a slot. Never a blank form or a crash                    |
| Date outside the 14-day window, or a slot already past | Same treatment as missing — the link has expired, say so plainly                                        |
| Slot no longer available                               | Allowed to proceed; the 409 on submit is the authority. Checking here would be a check-then-insert race |

- Reads `date` and `time` from query params, shown as a locked summary card (user can go back to change them, not edit inline)
- Fields: Nama Tim (required), Nomor WhatsApp (required, accepts `08xx` / `62xx` / `+62xx`, **normalised to `628xxxxxxxxx` before storage**), notes (optional, **max 500 characters**)
- Payment info card: bank account number + account holder name (placeholders), instruction text "Transfer DP 50% dari harga sewa. Nominal dikonfirmasi admin via WhatsApp."
  - **RESOLVED 2026-08-11 — a real rupiah amount renders here.** The client's answer: no price on `/`, the price appears in the form once the visitor has arrived through the WhatsApp link. `CLAUDE.md` hard rule 2 has narrowed accordingly, from "no prices anywhere" to "no prices on `/`".
  - **The rate card itself is still missing**, so the figure is `TODO(content)` — the seventh category. The client answered _where_ a price goes without answering _what_ it is: flat rate, or varying by hour, day, or weekend. **No placeholder number may be invented here.** Every other placeholder is inert if it ships by accident; an invented price is the one a visitor would act on, and it would be the developer's number attached to the client's business.
  - Until the rate card arrives the existing wording stands: "Transfer DP 50% dari harga sewa. Nominal dikonfirmasi admin via WhatsApp." That sentence is the fallback, not the destination.
- Payment proof upload: required, image only (jpg/png/webp), max 2MB, uploaded to the private R2 bucket
- Honeypot hidden field for spam protection
- On submit: POST to the API. Success screen: "Pemesanan berhasil. Menunggu konfirmasi admin via WhatsApp." Failure for a taken slot: friendly message "Yah, slot ini baru saja diambil orang lain. Silakan pilih waktu lain." with a button back to `/#order`.

## Data model (Neon Postgres)

```sql
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

  -- The unique index below compares time_slot as TEXT. Without this constraint
  -- '06.00 - 08.00' and '06.00-08.00' are different rows that book the same slot,
  -- and the race guard silently does nothing. src/domain/slots.ts canonicalises in app
  -- code; this is what enforces it in the database.
  constraint time_slot_canonical check (time_slot in (
    '06.00 - 08.00','08.00 - 10.00','10.00 - 12.00','12.00 - 14.00','14.00 - 16.00',
    '16.00 - 18.00','18.00 - 20.00','20.00 - 22.00','22.00 - 24.00'
  )),
  constraint status_valid check (status in ('pending','confirmed','rejected','expired')),
  constraint notes_length check (notes is null or length(notes) <= 500)
);

-- Anti double-booking: only one ACTIVE booking per slot.
create unique index uniq_active_slot
  on bookings (booking_date, time_slot)
  where status in ('pending', 'confirmed');
```

Three deliberate choices in that schema:

- **`time_slot_canonical`** — the race guard is a unique index on a text column, so it only protects when the string is byte-identical. This constraint is what makes the most expensive bug in the project impossible to reintroduce by formatting drift. The list must stay in lockstep with `src/domain/slots.ts`.
- **`proof_key`, not `proof_url`** — it stores an R2 object key. Naming it `_url` invites someone to write `<img src={proof_key}>` and get a broken image with no obvious cause.
- **`phone` normalised to `628xxxxxxxxx`** — accept `08xx`, `62xx`, or `+62xx` at the boundary, store one form. This is the format `wa.me` and the WhatsApp API both use, so the later bot can match an inbound number to a booking with a direct lookup instead of fuzzy matching.

Full migration file, gotchas, and error-code contract: [database.md](database.md).

Key behaviors:

- A slot becomes PENDING only AFTER the form (with proof) is successfully submitted. Selecting a slot on the landing page holds nothing.
- Insert must rely on the partial unique index; on conflict return 409 to the client. Never check-then-insert without the constraint.
- Auto-expire: pending bookings older than 24 hours become `expired` (freeing the slot). **Where that expiry runs is UNRESOLVED** — lazy-on-read was assumed, but it contradicts the 30s shared cache below. See the open question in [architecture.md](architecture.md) and the Phase 4 agenda; do not build either half before it is settled.
- Availability API: given a date, return the 9 slots with computed status. Cache no longer than 30s.
- **Cancellation is manual.** Ketentuan rule 2 grants cancellation up to 1×24h, but there is no user-facing cancel route in this repo — the user messages the admin on WhatsApp and the admin changes the status from the admin app. Stated so nobody builds a cancel flow that was never scoped.
- **The 30s cache slightly increases 409s, deliberately.** `Cache-Control: public, s-maxage=30` means a CDN may serve availability up to 30s stale, so a user can see a slot as available that was taken moments ago. That is accepted: the 409 path exists and has designed UI. The alternative — no caching — costs a database round trip on every date-pill tap. **Its second effect is not accepted and not yet resolved:** the same cache hit also skips the lazy expiry, per the row above.

### Abuse protection (specified now, built in Phase 4)

`POST /api/bookings` is public and unauthenticated by design — there is no auth in this repo. The honeypot stops naive bots and nothing else. Without the following, a trivial script can hold **all 126 slots** (9 × 14 days) in `pending` until lazy expiry releases them 24h later, and can burn unbounded R2 storage with 2MB uploads:

- **Per-IP rate limit** on submissions. A real user submits once; anything beyond a handful per hour is not a customer.
- **Reject before the R2 write** — size and MIME are validated server-side _before_ anything is uploaded, so a rejected file never costs storage. Client-side checks are UX, not protection.
- **Return 429** with a friendly Indonesian message, distinct from the 409 taken-slot path.

Not a hypothetical worth dismissing on a booking site: holding every slot costs the client real revenue for a day, and the attack needs no skill.

## API routes (Next.js route handlers)

- `GET /api/availability?date=YYYY-MM-DD` → `[{ slot, status }]` (runs lazy expiry first)
- `POST /api/bookings` → validates fields, uploads proof, inserts booking; 409 on slot conflict, 429 when rate-limited
- **Availability is one date per request, and that constrains the design.** Showing an availability hint on the date pills — "3 slot tersisa", or greying out fully-booked days — would need 14 requests on page load. Phase 1b must not specify such an indicator without also specifying a bulk endpoint, which does not currently exist. Design against this limit or change the limit deliberately; do not discover it in Phase 2.
- Neon is reachable only from server-side route handlers via `DATABASE_URL` (never `NEXT_PUBLIC_`-prefixed); there is no browser-facing database client and nothing to lock down with row-level policies — the API surface itself is the only write path. R2 credentials are equally server-only; the browser never touches Neon or R2 directly.

## Design ambition (important — and not the same thing as the direction)

**This section is the ambition, not the art direction.** Phase 1b task 1 is what converts it into one, and [DESIGN.md](DESIGN.md) records its north star as deliberately unset until that task runs. Read what follows as the bar to clear, never as a decision already taken — an agent that treats it as the direction has skipped the phase whose entire purpose is deciding it.

The design should feel like you are creating a winning Awwwards website. Create a UI/UX like a high-end animated and interactive website. Enhance and surpass the benchmark (bataskotapoint.com) but inverted to a light, clean, blue-and-white identity.

Animation level: HEAVY, but mobile-performant:

- Scroll-driven animations (section reveals tied to scroll progress), pinned and scrubbed sequences via ScrollTrigger
- Parallax layers in hero and section backgrounds
- Marquee strip (e.g. "ARENA PLAYER — MINI SOCCER — BOOK NOW —" repeating) between sections — stays CSS `@keyframes`, GSAP does not replace it
- Micro-interactions: magnetic/hover states on CTAs, slot cells animating on state change, smooth scroll
- Panchang for display type, oversized typographic moments, whitespace as a design element

Hard performance guardrails:

- CSS transforms + GSAP only; `prefers-reduced-motion` respected on every animated component via the `src/lib/motion.ts` wrapper — GSAP has no built-in equivalent of Framer's `useReducedMotion`, so the wrapper is the mechanism
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

## Placeholders — mark in code with `// TODO(content)`

Swapped in the **Real content + WhatsApp bot** phase, which comes **after Phase 4** — not during Phase 2. The marker deliberately names the work rather than a phase number: it was once `TODO(phase2)`, and the frontend-first re-cut made "Phase 2" mean the landing page, so the old name pointed at the wrong phase entirely. Naming it `content` survives any future renumbering.

Complete list — `rg "TODO\(content\)"` must find every one of these and nothing else:

- ~~WhatsApp number (wa.me link)~~ — **SUPPLIED 2026-08-11.** Lives in `src/modules/home/home.constants.ts` in wa.me form (`628…`, no `+`), verified against `normalisePhone` before being written down
- Bank account number + holder name
- Arena address + Google Maps coordinates
- Real photos/gallery assets if the client provides any
- Logo file — SVG monogram placeholder until the client supplies theirs; favicon + OG image derive from it
- Hero copy — ships drafted and user-approved; only a swap if the client wants their own wording
- **Rate card** — the rupiah figures `/booking` renders. Added 2026-08-11 when the client settled _where_ a price appears without supplying _what_ it is: flat rate, or varying by hour, day, or weekend. **This is the one placeholder that must never get a stand-in number.** The other six are inert if they ship by accident — an unswapped WhatsApp link fails visibly, a monogram logo looks like a monogram. An invented price looks exactly like a real one, a visitor transfers against it, and it is the developer's number attached to the client's business. Until the card arrives, `/booking` keeps the wording it has: "Nominal dikonfirmasi admin via WhatsApp."

## Binding clarifications

- Package manager: pnpm. Lockfile `pnpm-lock.yaml`; never commit `package-lock.json`.
- Date window: today + 13 days, timezone Asia/Makassar (WITA — the field is in Lombok). Today's slots whose start time has passed render disabled (visible, not hidden).
- Payment proofs: PRIVATE Cloudflare R2 bucket. `proof_key` column stores the object KEY (not a public URL). The admin app renders each proof through a short-lived **presigned GET** it generates itself; the bucket stays private and no public URL is ever created. That work belongs to `arena-player-admin` — this repo only ever writes to R2 and must never mint a read URL.
- Logo: generated SVG placeholder (AP monogram, navy #011A43) until the client file arrives. Favicon + OG image generated from it. Swap is a `TODO(content)` item.
- Repo shape: single flat repo, public site only. The admin app is a separate repo, so no monorepo is planned. Shareable code (slot math, date helpers, validation) lives in **`src/domain/`** and is kept **byte-identical** in both repos, enforced by `pnpm check:domain`. Not a style preference: `uniq_active_slot` compares `time_slot` as text, so a one-character drift disables anti-double-booking in both apps with no error. Full contract in [architecture.md](architecture.md). This repo owns `db/migrations/`; the admin repo reads the schema and never alters it.
- HTTP client on the frontend: TanStack Query over two transports, split by route. `/` uses native `fetch`; `/booking` uses axios, which is kept off the landing bundle — it costs 17.5KB measured, and `/` makes one GET. `/booking` earns it back with `onUploadProgress` on the 2MB proof upload, which `fetch` cannot report. Both instances and `QueryClientProvider` are **built in Phase 1a task 7**. **No bare `fetch` in a component** — that rule is about the component, not the transport; calls go through each module's `*.service.ts`, reached via its `*.queries.ts`. `src/services/api-client.ts` holds the axios instance and is `/booking`-only.

## Definition of Done — Phases 1a–3

Phase 1a:

- [x] Repo scaffolded, `pnpm dev` serves `localhost:3000`
- [x] Lint / format / typecheck scripts run clean; Vitest wired and `pnpm check:unit` passes (`check:setup` belongs to Phase 4)
- [x] Development rules written down, including the accessibility baseline
- [x] API contract for both routes written into architecture.md, with `POST /api/bookings` flagged provisional
- [x] `src/domain/slots.ts` + `src/domain/dates.ts` exist with colocated tests that actually assert — not an empty harness
- [x] `pnpm check:domain` exists and has been **proven to fail** on a planted one-character change, then reverted
- [x] MSW handlers return realistic availability data **derived from `TIME_SLOTS`, not hardcoded**; `QueryClientProvider` and the axios instance are wired
- [x] Budget table carries **measured** figures from a real `pnpm build`, `pnpm check:budget` fails on breach, and `src/lib/motion.ts` exists so no component can animate without a reduced-motion check
- [x] `/plan-eng-review`, `/plan-devex-review`, `/devex-review` all passed

Phase 1b:

- [x] **Art direction written down** — type scale, spacing rhythm, section-transition language, and what surpassing the benchmark means concretely
- [x] Hero copy chosen — Indonesian headline, subheadline, meta description
- [x] **Client has seen the design system HTML and approved the direction**, or their changes are folded in before Phase 2 starts — **approved with changes on 2026-08-11.** The world stands; six changes were requested. The four in 1b's scope are folded in (slot grid, rounded geometry, pricing, WhatsApp flow). The two remaining — the shader header and scroll/hover motion — are Phase 2 execution by construction, since the hero they attach to does not exist yet; both are specified in [DESIGN.md](DESIGN.md) so Phase 2 executes rather than re-decides. Full record in [tasks/1b-gate-client.md](tasks/1b-gate-client.md)
- [x] Any benchmark reference files read, findings captured in DESIGN.md, source files deleted — `benchmark-bataskotapoint.png` (6.8 MB) read once, findings written into DESIGN.md as a comparison table plus four falsifiable claims, then deleted. The conclusions outlive the file, which is the condition [`docs/references/README.md`](references/README.md) sets for deleting one
- [x] Design system HTML renders every token, type scale, and component state — **all four** slot states plus the date pill. Four, not three: `elapsed` was split out of `booked` in task 3, because rendering an hour that merely passed in the danger triple contradicts the system's own rule and overstates how busy the day was
- [x] The same page is clickable through the landing → order → form journey
- [x] Hero-video gate decided either way — **failed**, hero stays text and logo. Reasoning in [DESIGN.md](DESIGN.md)
- [x] `/design-review` passed — four findings fixed and verified by measurement, one accepted with its measurement recorded. **Ran degraded**: Codex was unavailable and no subagent was dispatched, so it was single-reviewer. Report in `~/.gstack/projects/arayhan-arena-player/designs/design-audit-20260811/`

Phase 2:

- [x] All 5 landing sections render, responsive 375px → 1440px — **zero horizontal overflow measured at 375 / 768 / 1024 / 1280 / 1440**
- [x] Order section reachable within 1–2 scrolls at 375px, anchor `#order` works from both CTAs — measured **exactly 1.00 viewport** (order top 812px, viewport 812px); both CTAs present
- [x] Slot grid reads the mock; **all four** states render correctly — `elapsed` was split from `booked` in Phase 1b
- [x] Slot select → `wa.me` opens with the correct number and message template, and the page does **not** also navigate — verified in-browser: a plain anchor, no handler, no `target="_blank"`
- [x] No pricing anywhere on `/` — asserted against the rendered text: no `Rp`, no `IDR`, no thousand-separated digits. The single "harga" is inside Ketentuan rule 1 and names no number
- [x] Every section executes the 1b art direction — one visual language across all five, not five improvisations — **two independent judgements, neither the builder's**: `/design-review` scored the result **B+ with AI-slop A**, and the client saw `/` and approved on 2026-08-11
- [ ] Per-section gate passed as each merged: `prefers-reduced-motion` respected, Lighthouse mobile ≥ 85, keyboard navigation working, no CLS — **three of four measured**: CLS **0.0000** (zero recorded shifts, not merely under the 0.1 bar), 28 focusable elements with zero positive `tabindex`, reduced motion gated in three independent layers. **Only Lighthouse is outstanding**, and it is the same single measurement Phase 3's gate waits on
- [x] OG meta tags + title/description + favicon generated from the logo — the client's mark landed 2026-08-11 and the AP placeholder is gone. Verified in-browser: logo renders 83×40 through `next/image`, `og:image` emits, `link[rel=icon]` present. Copy narrowed to **Lombok** per PRODUCT.md, and `summary_large_image` because a pasted link in a group chat is a real traffic path
- [ ] **Client has seen the landing page on a real phone and signed off**

Phase 3:

- [x] Form validates every field, including Indonesian phone format and ≤2MB image-only upload — verified in-browser: "Nama tim minimal 2 karakter", "Nomor tidak valid", and "Format harus JPG, PNG, atau WEBP" all render and the submit is blocked
- [x] Submission goes through a TanStack Query mutation over axios; success, taken-slot (409), and error states all render — **all four verified in-browser** via the mock's `teamName` triggers: 201 success, 409 "baru saja diambil orang lain", 429 "Tunggu sebentar… tidak ada yang salah dengan pemesananmu" in the **amber** triple, and 400 mapping `fields` back onto the input via `aria-invalid`. 409 and 429 share neither copy nor colour family
- [x] Summary card reflects the date/time query params — verified in-browser
- [x] Accessibility: labels associated, errors tied via `aria-describedby`, `inputMode="tel"` on the phone field, focus moves to the result on submit, upload control keyboard-operable — measured: **5 visible inputs, 5 labels**, `aria-describedby` present on every `aria-invalid` field, `inputmode="tel"` confirmed
- [ ] Gate passed: Lighthouse mobile ≥ 85, `prefers-reduced-motion`, keyboard navigation — **three of four measured**: CLS **0.0000** with zero recorded shifts, 28 focusable elements with zero positive `tabindex`, and reduced motion gated three layers deep (`globals.css`, `motion.ts` returning _before_ GSAP downloads, and the WebGL canvas under both reduced-motion and `saveData`). **Only Lighthouse is outstanding** — it needs throttled mobile, which this environment cannot produce honestly
- [x] End-to-end journey walks in one pass: landing → slot select → wa.me → `/booking` → success — both legs verified separately, which is the correct shape: WhatsApp is a deliberate break in the chain, not a continuous flow

Deferred to Phase 4: real Neon data replacing the mock, R2 upload actually persisting, the double-submit race test, and lazy expiry — all of these need the backend.

---

# Phase 4 and later

Phase 4 (backend) is **mandatory before launch** — only its design discussion is deferred. Everything after it is genuinely optional or blocked on client input. Listed so nothing is lost.

## Phase 4 — Backend (mandatory, design discussion deferred)

**Not optional and not "later" in the same sense as the rest of this section** — the site takes no real bookings until this ships. Only its _design_ is deferred, to a dedicated discussion held after Phase 3. Until then the Phase 2 grid and Phase 3 form run against the MSW mock from Phase 1a.

Also lands here: `scripts/check-setup.test.ts` (`pnpm check:setup`), which is deliberately not built in Phase 1a because it connects to Neon and R2 and neither exists before this phase. It is a Vitest file like the ones colocated under `src/`, kept under a separate glob so `check:unit` never requires credentials.

Agenda for the discussion:

| Topic                      | What has to be decided                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Schema + data types        | `bookings` columns, `date` vs `timestamptz`, status as enum or text, index set                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| Database structure         | Migration strategy, how manual-run migrations stay ordered and idempotent                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| Layered architecture       | Route handler → service → repository boundaries, and how those interact with the existing extraction boundary (nothing under `src/` imports from `src/app/`)                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| Validation                 | Which rules are shared client/server, which are server-only, and where the shared ones live                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| **File upload**            | **Presigned URL** — browser PUTs straight to R2, then POSTs the object key. This supersedes the multipart flow currently drawn in [architecture.md](architecture.md) and is why `POST /api/bookings` is marked provisional                                                                                                                                                                                                                                                                                                                                                                                                |
| **Where expiry runs**      | Lazy-on-read, scheduled job, or on-POST. Lazy-on-read is starved by the 30s shared cache — a cache hit never reaches the origin, so nothing frees an abandoned slot on a quiet night. Full statement of the problem and the three candidate fixes: [architecture.md](architecture.md)                                                                                                                                                                                                                                                                                                                                     |
| **Orphaned R2 objects**    | Upload succeeds before the insert, so a crash in between leaves a file no row points at and nothing ever notices. Likely an R2 lifecycle rule on the `proofs/` prefix — confirm it is configured at handover, since it lives in the R2 dashboard and not in this repo                                                                                                                                                                                                                                                                                                                                                     |
| **Security review**        | `/security-review` over the route handlers before launch, and it belongs on this agenda rather than at the end. Phase 4 is the only phase that ships something publicly reachable: an unauthenticated `POST` accepting a 2MB file upload into private storage, guarded by a honeypot and a per-IP rate limit, sitting in front of a race the whole system is built around. Phases 1a–3 have no attack surface at all — a mistake there is wrong, a mistake here is exploitable. Decide **when** it runs: before the presigned-URL work or after, since that decision moves the upload path from the server to the browser |
| **Re-adding the Neon MCP** | It was removed from `.mcp.json` during Phase 1a, deliberately. It gives an agent SQL execution and migration application, which is exactly what [database.md](database.md) forbids — migrations are run by hand in the Neon SQL editor. The failure it enables is silent: a `bookings` table created without `uniq_active_slot` turns off anti-double-booking with no error anywhere, and that index is the only race guard there is. If it comes back, it comes back **with a written rule limiting agents to reads**, and `NEON_API_KEY` gets documented in `.env.local.example` at the same time                       |

Already locked, carried in unchanged — anti-double-booking via the `uniq_active_slot` partial index with its 409 contract, and the 24h expiry _rule itself_. Non-negotiable; see [database.md](database.md). Only the **mechanism** that runs the expiry is open, per the agenda row above.

### Retiring MSW — required, not cleanup

**MSW must not survive into production.** It registers a service worker, so a stray `mockServiceWorker.js` in the production build intercepts real requests and serves fake availability — and it fails _silently_, looking like a working site showing wrong data. This is the single most likely way this project ships a broken deploy.

Required in this phase:

- Gate registration on `NODE_ENV` so the worker starts in development only
- Confirm `mockServiceWorker.js` is **absent from the production build output** — check the built artifact, not the source
- Handle the unregister path. Any browser that previously loaded the dev site still has the worker registered; it does not disappear because the file stopped shipping
- **Acceptance:** a production build issues real requests to `/api/availability` and `/api/bookings`, verified in the browser network panel. Verified, not inferred

### Definition of Done — Phase 4

The only phase whose Definition of Done includes a security gate, because it is the only phase that ships a publicly reachable endpoint.

- [ ] Migration applied by hand in the Neon SQL editor, `uniq_active_slot` confirmed present — the index is the only race guard, and a table created without it fails silently
- [ ] `pnpm check:setup` passes against live Neon and R2
- [ ] Double-submit race tested: two concurrent POSTs for the same slot produce exactly one booking and one 409
- [ ] Rate limit returns 429 with its own Indonesian copy, distinct from the 409 taken-slot message
- [ ] MSW retirement checklist above complete, verified in the network panel
- [ ] **`/security-review` passed** over the route handlers — unauthenticated POST, file upload, honeypot, rate limit, and the R2 write path
- [ ] Orphaned-proof lifecycle rule configured in the R2 dashboard, and noted for handover since it lives outside this repo

## Real content + WhatsApp bot

- Replace all six `TODO(content)` placeholders: WA number, bank account, address, maps coords, photos, logo file, hero copy (only if the client wants their own wording — it already ships drafted)
- WhatsApp bot auto-reply via Fonnte or Wablas (client's account, client's monthly cost): when a user messages the booking template, the bot replies with the `/booking` link carrying the same date/time params
- Optional: gallery section if the client provides photos
- Acceptance: full user journey works end-to-end with real data — landing → WA → bot reply → form → success

Open questions: which WA bot provider and plan; final bank account details and exact payment wording; whether photo assets exist.

## Deploy + handover

- Production deploy to the client's Sumopod account. **Confirmed: Sumopod runs Node apps**, so `next build` with `output: 'standalone'` deploys there directly. Vercel free tier is retained only as a contingency, not an expected branch
- Neon project + Cloudflare R2 account ownership transfer (or credential handover) to a client-owned account
- Handover: env var documentation, 14-day bug warranty starts at launch

Open questions: subdomain configuration on Sumopod — only Node capability was confirmed, and subdomains matter for `admin.arena-player.com` in the other repo; who holds the Neon/R2 accounts long-term.

---

# Out of scope for this repo — admin app

Tracked here for context only. Build it in a separate repo (`arena-player-admin`), on `admin.arena-player.com`, sharing the same Neon database and R2 bucket. Nothing about it is built, stubbed, or scaffolded in `arena-player-web`.

- Login: single admin account (own auth, not tied to a specific vendor)
- Bookings list with filters: pending / confirmed / rejected / expired
- View payment proof image via a short-lived presigned GET the admin generates (bucket stays private, no public URL is ever created); Confirm / Reject actions (status change reflects on this site's order section, since both read the same `bookings` table)
- Nice to have: manual slot blocking, operating-hours config
- Its own handover items: admin user guide, admin credential handover

Implication for this repo: the `bookings` table is a shared contract. Schema changes here can break the admin repo later — treat `db/migrations/` as a public interface.
