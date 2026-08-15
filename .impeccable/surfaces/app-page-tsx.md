---
version: 1
slug: "app-page-tsx"
primary_target: "src/app/page.tsx"
related_targets: ["docs/DESIGN.html"]
---

# Surface brief — Order section (`#order`)

Produced by `/impeccable shape`, confirmed 2026-08-07. Covers the order section of `/` — Phase 2's first build item and the section the PRD calls "the product". This is a brief, not an implementation.

## 1. Job and audience

A team captain arrives on a mid-range Android inside the Instagram in-app browser at 375px, mid-conversation in another chat, with 8–12 people waiting on a decision. They are booking **today or tomorrow**. They need one thing: *is anything free tonight, and can I lock it before someone else does.*

Surface mode is **Persuade** — `/` is a landing page and this section is its conversion moment. But the section's interior is **Operate**: scanability and speed of comprehension outrank expression everywhere the two conflict.

## 2. Outcome and proof

**Primary action:** select a slot → `/booking?date=…&time=…` opens with both already chosen. That is the section's only job; it is the single exit.

**Success:** the organiser reaches the form with the right date and time, in under 30 seconds, without having read every row.

> **CHANGED 2026-08-15 — the exit moved.** It was `wa.me`, opened with a prefilled template, and `/booking` came back through the chat as a link the admin typed. WhatsApp is now the step *after* submitting: the admin confirms a booking that already exists rather than transcribing one that does not. The brief's shape is unchanged — one action, one exit, no reservation implied — only the destination.

**Product-specific truth a template could not claim:** the availability shown is backed by a database constraint, not by someone's memory. Selection holds nothing — only a successful POST does — so the section must never imply a reservation it has not made.

## 3. Selected direction

**Date row — today preselected, far dates behind a control.** The first two weeks as pills; the rest of the window behind a **`Pilih tanggal lain`** disclosure. Two taps covers the overwhelming majority of bookings, and the scarcest horizontal space at 375px stops being spent on the least-used dates.

> **BUILT 2026-08-15, AND THE SPLIT MOVED WHERE THE WINDOW DID.** The brief cut at day 2 against a 14-day window; the window is now 92 days, so the cut is at day 14 — the fortnight PRODUCT.md's same-day/next-day finding actually covers — and the disclosure carries 78 days rather than 12. **§7's open decision on the `Pilih tanggal` surface is CLOSED: an inline month calendar, on the plate.** Not a native `<select>` (92 options in a system dropdown is the same unreachable list in a worse control, and it cannot show a weekday column) and not a bottom sheet (a floating overlay is the one thing an enamel sign has no vocabulary for, and it costs a scroll lock, a focus trap and a dismiss gesture the plate does not otherwise need). A month grid is the shape the question already has in the visitor's head — "the Saturday after next" is a position, not an offset — and it is the only layout where the far end of the window costs the same number of taps as the near end. It is capped at `min(58svh, 420px)` and scrolls inside itself, so opening it never displaces the grid.

**Elapsed hours — collapsed, not hidden, not mislabelled.** Past slots for today fold into a single expandable `Sudah lewat (N)` row at the top of the list. The list opens on what is actually bookable; the day never reads as full; nothing is erased.

**Fill affordance — a scarcity counter, not a discount.** `Hari ini · sisa 3 slot` above the grid, derived from data the availability response already carries. Creates genuine urgency when a day is filling, implies no price, needs no new endpoint.

**Structural thesis:** the section opens on *the smallest set of things the organiser can act on right now*, and everything else — other dates, elapsed hours — is one deliberate tap away rather than in the way.

**Load-bearing implementation consequence:** elapsed slots are computed **client-side** from the current time and the canonical starts in `lib/slots.ts` / `lib/dates.ts`. `GET /api/availability` needs no `past` status and stays FIRM. This was previously recorded as a Phase 4 API dependency; it is not one.

## 4. Scope and boundaries

**In scope:** the date row and its calendar, the offer panel, the scarcity line, the slot list including the collapsed elapsed group, all slot states, the loading/error/empty states, and the `/booking` handoff that exits the section.

**Untouched:** the token system in `docs/DESIGN.md`; the one-column slot layout and its 20-character justification; the Visible-Unavailable Rule; the wa.me message template in the PRD; hero, Ketentuan, Location, footer.

**Anti-goals:**

- No price, anywhere, in any form. Pricing is an unresolved client decision.
- No implied reservation. No "held for 5 minutes", no countdown, no soft-lock.
- No false scarcity. The counter reports real remaining availability or it does not appear.
- No second visual system. This executes `DESIGN.md`; it does not extend it.

## 5. States and ranges

| State | Condition | Behaviour |
|---|---|---|
| Loading | availability in flight | Skeleton rows at the real row height, so nothing shifts when data lands |
| Error | fetch failed | Message + retry. Never an empty grid that reads as "fully booked" |
| Normal | ≥1 available | Date row, scarcity line if applicable, slot list |
| All booked | 0 available, none elapsed | "Hari ini penuh." + a direct path to tomorrow |
| **All elapsed** | viewing today late, every slot past | "Semua slot hari ini sudah lewat." + direct path to tomorrow. Distinct from "penuh" — the day was not full, it is over. After 24.00 this is the only state the page can be in |
| Mixed | some elapsed, some available | `Sudah lewat (N)` collapsed at top, bookable rows below |
| Selected | a slot chosen | Exactly one at a time; reversible before the handoff |

**Scarcity counter rule.** Appears only when **1–3** slots remain. Above that it is suppressed — "sisa 8 slot" is not scarcity, it advertises an empty venue, which works directly against the client's goal. Counts genuinely available slots only; elapsed slots are never counted.

**Ranges:** 18 slots/day fixed since 2026-08-15 (was 9). Elapsed today ranges 0–18. Date window today + 91 (92 days), Asia/Makassar — the brief said today + 13 and Asia/Jakarta, and both were corrected before this section was built.

## 6. Interaction and layout

- **Hierarchy:** scarcity line → date row → bookable slots → collapsed elapsed group → CTA. The elapsed group is a summary, not a section; it must not dominate.
- **Topology:** single column throughout, 375px-first. The date row is the only horizontally scrolling element and keeps `overscroll-behavior-x: contain`.
- **Affordances:** `Sudah lewat (N)` must read as expandable before it is tapped. `Pilih tanggal` must read as opening something, not as a third date.
- **Feedback:** selecting a slot changes it and only it; the CTA becomes enabled and names the next step explicitly in Indonesian — `Lanjut isi data →`. It named WhatsApp until 2026-08-15 and stopped when the destination did: the rule was never "say WhatsApp", it was that the user should never be surprised by where a button takes them.
- **Reversibility:** a selected slot can be deselected, not merely replaced.
- **Accessibility:** selection state must be exposed to assistive tech. Elapsed and unavailable rows stay in the tab order via `aria-disabled`, never native `disabled` — the date pill's current use of native `disabled` in `docs/DESIGN.html` contradicts the Visible-Unavailable Rule and must not be copied.

**Motion is deliberately unspecified.** Project rule: every animation and micro-interaction is chosen by the user via `AskUserQuestion` before code is written, batched by section. Collapse/expand, slot state change, and pill selection are one such batch — asked at build time, not decided here.

## 7. Constraints and open decisions

**Binding:** `docs/DESIGN.md` tokens; the ~26KB JS headroom in `docs/architecture.md`; Lighthouse mobile ≥85 and LCP <2.5s; `lib/motion.ts` for all animation; Indonesian UI copy, English code; MSW mock in Phases 2–3 with response shapes read from `architecture.md`, never invented.

**A builder must not invent:**

- ~~The `Pilih tanggal` surface.~~ **CLOSED 2026-08-15** — inline month calendar, reasoning in §3. A builder must not reopen it without a reason the §3 note does not already answer.
- Any Indonesian copy beyond what is specified here.
- The scarcity threshold. It is 1–3, stated above, for a reason.

**Open, owned elsewhere:** pricing on `/booking`; whether the git repo transfers at handover.

## Confirmation checks

1. Every state in §5 has a defined behaviour, including the two the current design lacks (all-elapsed, error).
2. Nothing in §3 contradicts `DESIGN.md` or the PRD's route definition for `/`.
3. Anti-goals are checkable at build time: grep for any price string, any timer or "held" copy, and any scarcity string rendered above 3 remaining.
4. The per-section Phase 2 gate applies unchanged: Lighthouse mobile ≥85, `prefers-reduced-motion` respected, keyboard navigation working.
