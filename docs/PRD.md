# Arena Player — Product Requirements Document

Booking website for a mini soccer field. Users check slot availability, pick a date and time, get redirected to the field admin's WhatsApp, then complete a booking form with payment proof upload. The admin confirms bookings manually.

Work is split into three phases. **Phase 1 is fully specified and buildable now with zero external dependencies.** Phases 2–3 are outlined; details will be filled in once client inputs arrive (WhatsApp number, bank account, Sumopod hosting details).

---

## Phase overview

| Phase | Scope                                                                                                                         | Blockers                      |
| ----- | ----------------------------------------------------------------------------------------------------------------------------- | ----------------------------- |
| 1     | Landing page, booking form, database, availability API, wa.me redirect (placeholder number), anti double-booking, auto-expire | None — build now              |
| 2     | WhatsApp bot auto-reply (Fonnte/Wablas), real content swap (WA number, bank account, address, maps, photos)                   | Client inputs                 |
| 3     | Admin app on subdomain (admin.arena-player.com), production deploy, Neon + R2 ownership transfer                              | Sumopod details, Phase 2 done |

---

# Phase 1 (fully specified)

Explicitly EXCLUDED from Phase 1: WhatsApp bot/API integration, admin application, production deploy to Sumopod.

## Tech stack

- Next.js 15 (App Router) + TypeScript + Tailwind CSS
- Neon Postgres (serverless) + Cloudflare R2 (payment proofs). Both accessed only from route handlers via env vars, zero hardcoded keys. Developer's own accounts for Phase 1; ownership transferred to the client later.
- Framer Motion for animations
- Fonts: Orbitron (next/font/google) for display/headings, a clean sans (e.g. Inter) for body
- No auth in Phase 1 (admin app is Phase 3)

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

### `/` — Landing page (single page, sections in order)

1. **Hero** — full viewport. Logo, headline, subheadline, primary CTA button "Pesan Lapangan" (smooth-scrolls to the booking section). Scroll-driven entrance animation.
2. **Booking section ("Pesan Lapangan")** — the core of the page, must be reachable within the first 1–2 scrolls on mobile:
   - Date picker: next 14 days, horizontal scrollable pills on mobile
   - Time slot grid fetched live from the database: 06.00–08.00 through 22.00–24.00 (2-hour slots, 9 per day)
   - NO prices shown anywhere
   - Slot states: available (selectable), PENDING (disabled, label "Menunggu Konfirmasi"), BOOKED (disabled)
   - On submit with a selected slot: open `https://wa.me/<PLACEHOLDER_NUMBER>?text=<template>` in a new tab, where template = "Halo, saya mau booking lapangan Arena Player tanggal {DD MMM YYYY} jam {slot}". Simultaneously route the user to `/form?date=...&time=...`.
3. **Rules ("Ketentuan")** — static content, exact 10 rules listed below (keep verbatim in Indonesian — it is site content).
4. **Location & Contact** — arena address (placeholder), Google Maps embed (placeholder coords), operating hours 06.00–24.00, WhatsApp contact button.
5. **CTA Footer** — big closing CTA "Pesan Lapangan" scrolling back to the booking section.
6. **Footer** — logo, copyright, minimal links.

### `/form` — Booking form

- Reads `date` and `time` from query params, shown as a locked summary card (user can go back to change them, not edit inline)
- Fields: Nama Tim (required), Nomor WhatsApp (required, validate Indonesian format 08xx/62xx), notes (optional)
- Payment info card: bank account number + account holder name (placeholders), instruction text "Transfer DP 50% dari harga sewa. Nominal dikonfirmasi admin via WhatsApp."
- Payment proof upload: required, image only (jpg/png/webp), max 2MB, uploaded to the private R2 bucket
- Honeypot hidden field for spam protection
- On submit: POST to the API. Success screen: "Pemesanan berhasil. Menunggu konfirmasi admin via WhatsApp." Failure for a taken slot: friendly message "Yah, slot ini baru saja diambil orang lain. Silakan pilih waktu lain." with a button back to `/#booking`.

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
- Auto-expire: pending bookings older than 24 hours become `expired` (freeing the slot). Lazy expiry on read in the availability API is acceptable for Phase 1 (no cron required).
- Availability API: given a date, return the 9 slots with computed status. Cache no longer than 30s.

## API routes (Next.js route handlers)

- `GET /api/availability?date=YYYY-MM-DD` → `[{ slot, status }]` (runs lazy expiry first)
- `POST /api/bookings` → validates fields, uploads proof, inserts booking; 409 on slot conflict
- Neon is reachable only from server-side route handlers via `DATABASE_URL` (never `NEXT_PUBLIC_`-prefixed); there is no browser-facing database client and nothing to lock down with row-level policies — the API surface itself is the only write path. R2 credentials are equally server-only; the browser never touches Neon or R2 directly.

## Design direction (important)

The design should feel like you are creating a winning Awwwards website. Create a UI/UX like a high-end animated and interactive website. Enhance and surpass the benchmark (bataskotapoint.com) but inverted to a light, clean, blue-and-white identity.

Animation level: HEAVY, but mobile-performant:

- Scroll-driven animations (section reveals tied to scroll progress)
- Parallax layers in hero and section backgrounds
- Marquee strip (e.g. "ARENA PLAYER — MINI SOCCER — BOOK NOW —" repeating) between sections
- Micro-interactions: magnetic/hover states on CTAs, slot cells animating on state change, smooth scroll
- Orbitron for display type, oversized typographic moments, whitespace as a design element

Hard performance guardrails:

- No WebGL/three.js, no Lottie files over 100KB, no autoplaying video
- CSS transforms + Framer Motion only; respect `prefers-reduced-motion`
- LCP under 2.5s on mid-range mobile; the booking grid must become interactive fast — it is the product
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

## Phase 1 clarifications (binding)

- Package manager: pnpm. Lockfile `pnpm-lock.yaml`; never commit `package-lock.json`.
- Date window: today + 13 days, timezone Asia/Jakarta. Today's slots whose start time has passed render disabled (visible, not hidden).
- Payment proofs: PRIVATE Cloudflare R2 bucket. `proof_url` column stores the object KEY (not a public URL). Admin views proofs via the Cloudflare dashboard in Phase 1–2; signed URLs come with the Phase 3 admin app.
- Logo: generated SVG placeholder (AP monogram, navy #011A43) until the client file arrives. Favicon + OG image generated from it. Swap is a Phase 2 `TODO(phase2)` item.
- Repo shape: single flat repo for Phase 1. Monorepo (turborepo) decision deferred to Phase 3 when Sumopod capabilities are known. Prep rule: shareable code lives in `lib/` and never imports from `app/`, so it can be extracted to `packages/shared` later.

## Phase 1 Definition of Done

- [ ] Landing renders all 6 sections, responsive 375px → 1440px
- [ ] Availability grid reads real Neon data; all three states render correctly
- [ ] Slot select → wa.me opens with the correct template AND `/form` receives params
- [ ] Form validates, uploads proof to R2, creates a pending booking
- [ ] Double-submit race: second submitter gets 409 + friendly UI (verified by a concurrent test)
- [ ] Pending bookings older than 24h show as available again (lazy expiry works)
- [ ] `prefers-reduced-motion` disables heavy animation
- [ ] Lighthouse mobile: Performance ≥ 85, no CLS from animations
- [ ] OG meta tags + title/description + favicon generated from the logo
- [ ] `pnpm check:lib` and `pnpm check:setup` both pass

---

# Phase 2 (outline — details TBD when client inputs arrive)

Goal: swap placeholders for real data and automate the WhatsApp touchpoint.

- Replace all `TODO(phase2)` placeholders: WA number, bank account, address, maps coords, photos
- WhatsApp bot auto-reply via Fonnte or Wablas (client's account, client's monthly cost): when a user messages the booking template, the bot replies with the `/form` link carrying the same date/time params
- Optional: gallery section if the client provides photos
- Acceptance: full user journey works end-to-end with real data — landing → WA → bot reply → form → success

Open questions to resolve before starting:

- Which WA bot provider (Fonnte vs Wablas) and which plan
- Final bank account details and exact payment instruction wording
- Photo assets: available or not

# Phase 3 (outline — details TBD after Sumopod is clarified)

Goal: admin operations and production launch.

- Admin app as a separate Next.js app, deployed to `admin.arena-player.com`
  - Login: single admin account (own auth, not tied to a specific vendor)
  - Bookings list with filters: pending / confirmed / rejected / expired
  - View payment proof image; Confirm / Reject actions (status change reflects on the landing grid)
  - Nice to have (only if budget allows): manual slot blocking, operating-hours config
- Production deploy: main app + admin app. Target is the client's Sumopod account; fallback is Vercel free tier if Sumopod cannot run Next.js (to be confirmed)
- Neon project + Cloudflare R2 account ownership transfer (or credential handover) to a client-owned account
- Handover: env var documentation, admin user guide (1 page), 14-day bug warranty starts at launch

Open questions to resolve before starting:

- Sumopod plan capabilities (Node.js/Next.js support, subdomain config)
- Who holds the Neon/R2 accounts long-term
- Admin credential handover process
