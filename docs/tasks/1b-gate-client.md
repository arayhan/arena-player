# Client checkpoint — Phase 1b (design foundation)

**Decided by:** the client. Nobody on the build side can answer these.
**Blocks:** Phase 2 (question 1, WhatsApp-only flow) · Phase 3 (question 2, pricing on `/booking`)
**Status:** not yet held
**Format:** live walkthrough / screen share. `docs/DESIGN.html` is in English; it is narrated in Indonesian.
**Date held:** _____

This is a **Definition-of-Done item**, not a courtesy. Phase 1b is not complete until this
checkpoint has happened and the outcome is written down below. Phase 2 must not start on an
unapproved direction — the PRD calls this _"the cheapest rework you will ever buy"_, because
rejecting a direction here costs one HTML page and rejecting it in Phase 2 costs five rebuilt
sections.

If the client is slow to schedule, that is **schedule risk to raise with them**, not a reason
to proceed without them.

---

## What to show, in this order

Open `docs/DESIGN.html` and walk down it. **Skip steps 01, 02 and 08** — token tables and
failure states, written for developers, and they will lose the client.

The page is laid out as a build manual: a parts inventory, then numbered assembly steps, then
the finished model. Say that once at the start and the rest explains itself.

1. **The decisions block, before step 00.** Start here, not at the end. Four things are open and
   two of them block work. Walking in with the questions already on screen is what makes this a
   decision meeting rather than a demo.
2. **The direction.** Light, blue-and-white, built from the navy in their own logo. Say plainly
   that it is the deliberate opposite of the dark neon site they referenced.
3. **Step 04, the slot list.** Tap an available slot; show pending and booked. This is the product.
4. **The finished model — `Alur`.** The whole journey end to end at real phone width — pick a
   slot → the WhatsApp message they receive → the booking form → success. Then the **409 screen**.
5. **Stop on the 409 screen and explain it.** Two people picked the same slot; one gets told it
   is gone. This is the single most important thing on the page and the reason the system is
   built the way it is. If they react to one thing, this should be it.

If they ask why the documentation looks like an instruction manual: because the system genuinely
is an assembly, and the manual form makes the parts and their order visible. It is the
documentation's own look — **the booking site is the three phone frames in the finished model**,
and that is what their customers will see.

---

## Questions to ask — do not leave without these

Ordered by how much they block. The first two stop work if unanswered.

### 1. Is WhatsApp-only correct? — **BLOCKS PHASE 2**

The site sends them to WhatsApp and stops. It does **not** open the booking form. The customer
gets the form link back through WhatsApp — typed by the admin now, sent by a bot later.

**The client has never been asked about this and the whole flow was redesigned around it.**
Confirm it matches how they actually want to work. Specifically: is someone available to reply
with the link during opening hours?

- Answer: _____

### 2. Pricing on the booking form — **BLOCKS PHASE 3**

No price appears anywhere right now. The form says "Transfer DP 50% dari harga sewa. Nominal
dikonfirmasi admin via WhatsApp."

Should a real rupiah amount appear instead? If yes, we need the rate card — flat rate, or does
it change by hour, day, or weekend?

- Answer: _____

### 3. The six things we do not have

None of these can be invented. The site ships with placeholders until they arrive.

| Item                                          | Status |
| --------------------------------------------- | ------ |
| WhatsApp number                               | _____  |
| Bank account + account holder name            | _____  |
| Address + Google Maps location                | _____  |
| Photos of the field                           | _____  |
| Logo file                                     | _____  |
| Headline wording (we can draft; they approve) | _____  |

On photos specifically: we will not generate fake images of a football field. A customer
booking a venue they have not actually seen is a real problem. Real photos or none.

### 4. How do customers find the site?

Instagram bio link, WhatsApp shares between friends, or Google search? It changes what gets
prioritised — if the link gets pasted into group chats, the preview image matters far more than
it currently does.

- Answer: _____

### 5. The motion — confirm where it is deliberately absent

They asked for many animations, transitions, and micro-interactions. Show them, then explain
the one place motion is **withheld on purpose**: the slot-picking section stays fast and calm,
because that is where someone decides quickly with eight to twelve people waiting on them.

Frame it as care rather than a shortfall — "everything else moves; we kept this part quick on
purpose" — and check they agree. If they want motion there too, that is their call to make
knowingly, and it changes what Phase 2 builds.

- Answer: _____

### 6. Confirm: one field, and these hours?

The entire system assumes **one** field and nine 2-hour slots, 06.00–24.00. A second field
would change the database, the API, and the booking screen. Worth confirming out loud.

- Answer: _____

---

## Outcome — fill in during or immediately after

### Decisions taken

| Decision | Outcome | Decided by |
| -------- | ------- | ---------- |
|          |         |            |

### Changes requested

| Change | In 1b scope, or defers to Phase 2? |
| ------ | ---------------------------------- |
|        |                                    |

### Sign-off

- [ ] **Approved** — direction confirmed, Phase 2 may start
- [ ] **Approved with changes** — changes listed above are folded in first
- [ ] **Redirect** — direction rejected, return to Phase 1b task 1 (art direction)

**Signed off by:** _____
**Date:** _____

---

## After the meeting

1. Record the outcome in `docs/PROGRESS.md` under Phase 1b.
2. Any answer that changes product truth (pricing, WhatsApp flow, field count, traffic channel)
   goes into `docs/PRODUCT.md` — several of these are currently marked as open decisions there.
3. Supplied content goes to `public/` and its `TODO(content)` marker gets removed. All six
   categories are listed in `CLAUDE.md` hard rule 3.
