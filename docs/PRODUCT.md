# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Decided and locked before this record existed — see [docs/architecture.md](docs/architecture.md), which marks both the framework and the datastore as FINAL.

Next.js 15 (App Router) + TypeScript + Tailwind. GSAP + ScrollTrigger for motion, TanStack Query over axios for server state, zustand for client state, zod for validation, react-hook-form on the booking form, MSW as the mock API layer, Vitest for verification. Neon Postgres + Cloudflare R2, both reachable only from route handlers. Deploys to the client's Sumopod account, confirmed Node-capable.

Two choices remain open and are Phase 1a task 1 decisions: date handling and the icon library.

## Users

**Primary: the team captain / group organiser.** One person books on behalf of a group of roughly 8–12 players. They are usually mid-conversation in another chat while deciding, coordinating people who are not looking at the site. What they need from the product is a fast, unambiguous read of what is actually free, and then something concrete they can take back to the group.

That situation drives two things already in the build: the order section sits within 1–2 scrolls of the top, and unavailable slots stay visible rather than hidden — an organiser needs to see that 18.00 is gone, not wonder why the list skips it.

**They book same-day or next-day.** Confirmed. Planning happens hours ahead, not weeks — the group decides tonight and plays tonight. This is the single most shaping fact about the primary journey, and the current design does not yet reflect it.

Second audience: the field admin, who is not a user of this site at all. They receive a WhatsApp message and confirm bookings by hand. Their tooling is a separate repo (`arena-player-admin`) and explicitly out of scope here.

## Product Purpose

Let someone see real availability for the field and commit to a slot, without having to ask a human first.

Today the exchange starts with "jam berapa yang kosong?" and takes a round trip before anything is decided. The product moves that question to a page that can answer it, so the WhatsApp conversation begins at "I want 18.00" instead.

**Success is filling empty slots.** Confirmed. The client measures this product by whether dead hours get booked — revenue, not admin convenience. Reducing WhatsApp back-and-forth is a welcome side effect, not the goal.

That has a consequence the current design does not serve: **all nine slots are presented as equals.** If the objective is filling quiet hours, the design needs some way to make an empty off-peak slot more attractive than a blank row — without inventing a discount, since no pricing is confirmed. This affordance does not exist anywhere in the plan today and is the clearest gap between the goal and the build.

## Positioning

A neighbouring field can copy the visual design. What it cannot copy without building the same thing is **live availability that is trustworthy at the moment of asking** — backed by a database constraint rather than a person remembering.

The mechanism is the anti-double-booking guarantee: a partial unique index is the sole race guard, so two people submitting the same slot simultaneously produce exactly one booking and one honest "someone just took it" message. Most small-venue booking pages are a contact form with a calendar picture; the difference is that this one cannot silently double-book.

## Operating Context

- **Single field.** Confirmed. The `bookings` schema keys on `(booking_date, time_slot)` with no field identifier, and `uniq_active_slot` is correct as written. A second field would change the schema, the API contract, the mock, and the order section — it is not a small later addition.
- Nine 2-hour slots per day, 06.00–24.00. Booking window is today + 13 days, Asia/Jakarta.
- **Demand is same-day and next-day.** The 14-day window exists in the spec, but days 3–14 are rarely the reason someone opens the page. At 375px the date row is the first thing in the order section, so fourteen equal-weight pills spend the scarcest horizontal space on the least-used dates.
- The booking journey deliberately breaks in the middle: the site hands off to WhatsApp, and the `/booking` link comes back through WhatsApp — typed by the admin today, sent by a bot later. `/booking` is therefore only ever reached by a pasted link.
- Confirmation is manual and human. A slot becomes pending on form submit and only a person moves it to confirmed.
- Payment is a 50% DP by bank transfer, evidenced by an uploaded image. The exact amount is quoted by the admin over WhatsApp.
- Cancellation exists as a rule (up to 1×24h) but has no route in this product. It happens by messaging the admin.

## Capabilities and Constraints

- No authentication anywhere in this repo. The public site never needs a login, and the admin app that would is a separate codebase.
- UI language is Indonesian. Code and comments are English.
- The "Ketentuan" section is verbatim client content — 10 rules, exact wording, never paraphrased or translated.
- **Open decision — pricing.** No price renders anywhere today. Whether `/booking` becomes an exception needs the client's rate card (flat vs peak/off-peak vs weekend). Until answered, no number appears on either page.
- **Open decision — subdomain configuration on Sumopod.** Node capability is confirmed; subdomain support is not, and it matters for the separate admin app.
- **Open decision — does the git repository transfer to the client at handover?** Not abstract: it decides whether internal-facing material is client-visible. `docs/PROGRESS.md` carries candid working notes, the plan documents record rejected approaches, and `/impeccable critique` writes graded self-assessments of the work. Until it is answered the conservative default applies — critique snapshots are gitignored. Sits alongside the open "who holds the Neon/R2 accounts long-term" question; both are handover-scope.
- Performance is a product constraint, not a preference: the order section must be usable fast on a mid-range Android inside an in-app browser.

### Conflict to resolve — elapsed slots read as "fully booked"

`GET /api/availability` returns `booked` for today's slots whose start time has passed, and the design renders those identically to genuinely taken slots. That was a reasonable simplification when nobody knew the demand pattern.

With same-day booking confirmed as the primary journey, it becomes a direct conflict with the success goal. Someone opening the page at 19.00 sees 06.00 through 18.00 all labelled **"Terisi"** — the day looks sold out when six of those hours were simply never available to them. A page that makes today look full is the worst possible outcome for a product measured on filling empty slots.

**Resolved in the order-section brief — and it needs no API change.** The client already knows the current time and the canonical slot starts from `lib/shared/slots.ts` / `lib/shared/dates.ts`, so it can compute "elapsed" locally and stop *displaying* those hours as "Terisi". `GET /api/availability` returning `booked` is harmless once the client owns the label. The contract stays FIRM.

The design response: elapsed hours for today collapse into a single expandable `Sudah lewat (N)` row at the top of the list, so the section opens on what is actually bookable, the day never reads as sold out, and nothing is hidden. See `.impeccable/surfaces/app-page-tsx.md`.

Worth noting what this corrects: it was recorded here as a Phase 4 blocker on a contract marked FIRM. It was never a backend problem — it was a display problem wearing a backend costume.

## Brand Commitments

Recorded as given, not expanded — the visual world is not decided here.

- Name: Arena Player.
- Navy `#011A43` sampled from the client's logo; accent blue `#2563EB`.
- Orbitron for display type, Inter for body.
- `bataskotapoint.com` is a binding reference **as an anti-reference**: the direction is explicitly its inverse — light, clean, blue-and-white, never dark neon.
- The client asked for a **minimalist UI, but modern — with many animations, transitions, and micro-interactions.** Recorded here as stated; how the two halves reconcile, and where the motion is deliberately withheld, is resolved in [DESIGN.md](DESIGN.md).

## Evidence on Hand

Very little is real yet, and that matters more than usual because this page represents a physical venue people pay to visit.

**Confirmed real:** the brand colours (sampled from the client's logo), the 10 Ketentuan rules, the slot structure and operating hours, and the Neon + R2 accounts (developer-owned until handover).

**Not yet supplied — must not be fabricated:** WhatsApp number, bank account number and holder name, street address and map coordinates, the logo file itself, and any photograph of the field. All six are tracked as `TODO(content)` placeholders.

The photography absence has a hard rule attached: AI-generated imagery may be abstract or decorative, but nothing may depict something a customer would read as *this specific field*. A generated photo of "a mini soccer field" would mislead someone into booking a venue they have not actually seen. Real venue photos come from the client or the site ships without them.

## Product Principles

1. **Answer the question before it is asked.** The product exists to replace a round trip. Anything that makes availability slower or less certain to read works against the whole point.
2. **Never claim a slot the database has not granted.** Selecting holds nothing; only a successful insert does. Optimistic UI that implies otherwise would produce a promise the system cannot keep.
3. **Unavailable is information, not absence.** Disabled slots stay visible and legibly labelled. "Menunggu Konfirmasi" is something the organiser needs to read, not decoration to grey out.
4. **The organiser is mid-conversation.** They are deciding fast, on a phone, with people waiting on them. Optimise for speed of comprehension over completeness of information.
5. **Today is the default, not one of fourteen.** Demand is same-day. The design should open on the day people actually want and treat the far end of the window as a secondary path — spending the scarcest screen space on the least-used dates is backwards.
6. **An empty slot is an opportunity, not blank space.** Success is measured on filling dead hours, so the design owes quiet slots more than absence of a label. Whatever that affordance becomes, it cannot imply a discount — no pricing is confirmed.
5. **Placeholders are visibly placeholders.** With six unsupplied content items, the honest failure mode is an obvious gap the client can fill — never plausible-looking invented detail that ships unnoticed.

## Accessibility & Inclusion

The primary device is a mid-range Android phone inside the Instagram in-app browser at 375px. That is the design target, not a fallback.

Established requirements: every input has an associated label; error messages tie to their field via `aria-describedby`; `inputMode="tel"` on the WhatsApp field so the right keyboard appears; focus moves to the result on submit rather than staying on a dead button; the file upload is keyboard-operable; focus rings are restyled but never removed.

Status colours are surface + border + text triples chosen so every state label passes AA — because a booking state the user cannot read is a booking state they will get wrong.

**Traffic is a mix with no dominant channel.** Confirmed: Instagram bio link, WhatsApp shares, and organic search are all live and none leads. The consequence is that no channel-specific optimisation may be prioritised over the others — the OG image and link preview matter (WhatsApp sharing is exactly what a team captain does), and page metadata matters (search is real), but neither earns disproportionate effort. Build all three to a competent baseline rather than making one excellent.
