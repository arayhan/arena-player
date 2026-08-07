---
name: arena-gotchas
description: Use before writing ANY code in arena-player-web. Project-wide gotchas — booking race condition, forbidden content, phase boundaries, placeholder conventions. Every agent must load this once per session before touching source files.
---

# Arena Player — project gotchas

Source of truth: [docs/PRD.md](../../../docs/PRD.md) and [docs/architecture.md](../../../docs/architecture.md). This skill is the condensed trap list — read those docs for full context, this is the quick-reference.

## Scope traps

- **Frontend-first phase cut**: 1a engineering foundation → 1b design foundation → 2 landing page `/` → 3 booking form `/booking`. Phases 2 and 3 ARE the work, not context.
- **Out of scope entirely**: the admin app (separate repo, `arena-player-admin`) — never add auth, admin routes, or admin UI here.
- **Deferred to a later discussion**: backend/database, WhatsApp bot, real content swap, production deploy. Phases 2–3 run against the MSW mock, not real Neon data. If a task needs the backend, stop and hand off to project-manager.
- Tight-budget freelance job: ship the Definition of Done for the current phase, don't explore alternatives.
- **New dependency not already in the PRD tech stack → ask the user first**, and check it against the performance budget in docs/architecture.md.

## Content traps

- **NEVER show prices anywhere in the UI.** Not in slots, not in the form, not in meta tags. The only price-adjacent text allowed is the payment instruction string from the PRD ("Transfer DP 50% dari harga sewa..."). Whether `/booking` becomes an exception is an **OPEN DECISION** in the PRD — until it is answered, render no number on either page.
- Rules section ("Ketentuan") is **verbatim Indonesian** from the PRD — 10 rules, exact wording, do not translate or paraphrase.
- UI language is Indonesian (buttons "Pesan Lapangan", states "Menunggu Konfirmasi", etc.). Code/comments in English.

## Placeholder convention

- Every placeholder value gets `// TODO(phase2)` on the same or preceding line. Greppable categories: WhatsApp number, bank account + holder name, arena address + maps coordinates, photos/gallery assets.
- `rg "TODO\(phase2\)"` must find ALL of them. Never inline a placeholder silently.

## The race condition (most expensive bug in this project)

- Anti double-booking = partial unique index `uniq_active_slot` on `(booking_date, time_slot) WHERE status IN ('pending','confirmed')`.
- **NEVER check-then-insert.** Insert, catch unique violation (Postgres code `23505`), return HTTP 409. Full contract in `arena-database` skill.
- Slot becomes PENDING only AFTER successful form submit with proof upload. Selecting a slot on the landing page holds nothing.
- Lazy expiry: availability API flips pending>24h to `expired` BEFORE computing slot status. No cron.
- All of the above is **backend behaviour, deferred**. In Phases 2–3 the grid and form talk to the MSW mock in `mocks/`. Never invent response shapes — read the API contract section in docs/architecture.md.

## Workflow

- Commit after each work-plan step passes, conventional-commit style (`feat:`/`fix:`/`chore:`/`docs:`). No attribution trailers.
- Append to `docs/PROGRESS.md` after every completed task (caveman format: `[date] [agent] [what] [reason]`).
- Verification before completion: run the command, quote the decisive output line, then claim done. Never assert something works without evidence.
- Start Claude sessions inside `arena-player-web/` — hooks load from session root.
