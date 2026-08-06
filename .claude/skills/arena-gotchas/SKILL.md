---
name: arena-gotchas
description: Use before writing ANY code in arena-player-web. Project-wide gotchas — booking race condition, forbidden content, phase boundaries, placeholder conventions. Every agent must load this once per session before touching source files.
---

# Arena Player — project gotchas

Source of truth: [docs/PRD.md](../../../docs/PRD.md) and [docs/architecture.md](../../../docs/architecture.md). This skill is the condensed trap list — read those docs for full context, this is the quick-reference.

## Scope traps

- **Phase 1 ONLY.** No WhatsApp bot/API, no admin app, no production deploy. Phases 2–3 in the PRD are context, not tasks. If a task smells like Phase 2, stop and hand off to project-manager.
- Tight-budget freelance job: ship the Phase 1 Definition of Done checklist, don't explore alternatives.
- **New dependency not already in the PRD tech stack → ask the user first.**

## Content traps

- **NEVER show prices anywhere in the UI.** Not in slots, not in the form, not in meta tags. The only price-adjacent text allowed is the payment instruction string from the PRD ("Transfer DP 50% dari harga sewa...").
- Rules section ("Ketentuan") is **verbatim Indonesian** from the PRD — 10 rules, exact wording, do not translate or paraphrase.
- UI language is Indonesian (buttons "Pesan Lapangan", states "Menunggu Konfirmasi", etc.). Code/comments in English.

## Placeholder convention

- Every placeholder value gets `// TODO(phase2)` on the same or preceding line. Greppable categories: WhatsApp number, bank account + holder name, arena address + maps coordinates, photos/gallery assets.
- `rg "TODO\(phase2\)"` must find ALL of them. Never inline a placeholder silently.

## The race condition (most expensive bug in this project)

- Anti double-booking = partial unique index `uniq_active_slot` on `(booking_date, time_slot) WHERE status IN ('pending','confirmed')`.
- **NEVER check-then-insert.** Insert, catch unique violation (Postgres code `23505`), return HTTP 409. Full contract in `arena-database` skill.
- Slot becomes PENDING only AFTER successful form submit with proof upload. Selecting a slot on the landing page holds nothing.
- Lazy expiry: availability API flips pending>24h to `expired` BEFORE computing slot status. No cron in Phase 1.

## Workflow

- Commit after each work-plan step passes, conventional-commit style (`feat:`/`fix:`/`chore:`/`docs:`). No attribution trailers.
- Append to `docs/PROGRESS.md` after every completed task (caveman format: `[date] [agent] [what] [reason]`).
- Verification before completion: run the command, quote the decisive output line, then claim done. Never assert something works without evidence.
- Start Claude sessions inside `arena-player-web/` — hooks load from session root.
