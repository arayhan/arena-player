---
name: arena-player-gotchas
description: Use before writing ANY code in arena-player-web. Project-wide gotchas — booking race condition, forbidden content, phase boundaries, placeholder conventions. Every agent must load this once per session before touching source files.
---

# Arena Player — project gotchas

Source of truth: [docs/PRD.md](../../../docs/PRD.md) and [docs/architecture.md](../../../docs/architecture.md). This skill is the condensed trap list — read those docs for full context, this is the quick-reference.

## Scope traps

- **Frontend-first phase cut**: 1a engineering foundation → 1b design foundation → 2 landing page `/` → 3 booking form `/booking`. Phases 2 and 3 ARE the work, not context.
- **Out of scope entirely**: the admin app (separate repo, `arena-player-admin`) — never add auth, admin routes, or admin UI here.
- **Phase 4 = backend, MANDATORY.** Not "later" in the optional sense — the site takes zero real bookings without it. Only its _design discussion_ is deferred, held after Phase 3. Phases 2–3 run against the MSW mock, not real Neon data. If a task needs the backend, stop and hand off to project-manager.
- **Genuinely optional / blocked on client, after Phase 4**: WhatsApp bot, real content swap, production deploy, handover.
- **Client checkpoints are DoD items, not courtesies.** 1b is not done until the client has seen the design system HTML and approved the direction; Phase 2 is not done until they have seen the landing page on a real phone. A slow client is schedule risk to escalate — never a reason to build on an unapproved direction.
- Tight-budget freelance job: ship the Definition of Done for the current phase, don't explore alternatives.
- **New dependency not already in the PRD tech stack → ask the user first**, and check it against the performance budget in docs/architecture.md.

## Content traps

- **NEVER show prices anywhere in the UI.** Not in slots, not in the form, not in meta tags. The only price-adjacent text allowed is the payment instruction string from the PRD ("Transfer DP 50% dari harga sewa..."). Whether `/booking` becomes an exception is an **OPEN DECISION** in the PRD — until it is answered, render no number on either page.
- Rules section ("Ketentuan") is **verbatim Indonesian** from the PRD — 10 rules, exact wording, do not translate or paraphrase.
- UI language is Indonesian (buttons "Pesan Lapangan", states "Menunggu Konfirmasi", etc.). Code/comments in English.
- **Hero copy is decided in Phase 1b, not invented at build time.** Headline, subheadline, and meta description are drafted and user-approved there. If you are building the hero and the copy is not in DESIGN.md, stop and ask — do not write your own.

## Placeholder convention

- Every placeholder value gets `// TODO(content)` on the same or preceding line. Six categories, complete list: WhatsApp number, bank account + holder name, arena address + maps coordinates, photos/gallery assets, logo file, hero copy.
- `rg "TODO\(content\)"` must find ALL of them and nothing else. Never inline a placeholder silently.
- **The marker is `content`, not `phase2`.** It was renamed because the frontend-first re-cut made "Phase 2" mean the landing page, so `TODO(phase2)` pointed at the wrong phase — these are swapped in the Real content phase, which comes **after Phase 4**. If you see `TODO(phase2)` anywhere in code, it is stale; fix it.

## The race condition (most expensive bug in this project)

- Anti double-booking = partial unique index `uniq_active_slot` on `(booking_date, time_slot) WHERE status IN ('pending','confirmed')`.
- **NEVER check-then-insert.** Insert, catch unique violation (Postgres code `23505`), return HTTP 409. Full contract in `arena-player-database` skill.
- Slot becomes PENDING only AFTER successful form submit with proof upload. Selecting a slot on the landing page holds nothing.
- Expiry: the **rule** is locked — pending older than 24h becomes `expired` and frees the slot. **Where it runs is UNRESOLVED.** Lazy-on-read was the original assumption and it is starved by the 30s shared cache: a cache hit never reaches the origin, so on a quiet night nothing frees an abandoned slot and it stays held. Three candidates (scheduled job, on-POST, drop the cache) are written out in docs/architecture.md. Do not build either half before it is settled.
- All of the above is **backend behaviour, Phase 4**. In Phases 2–3 the grid and form talk to the MSW mock in `src/mocks/`. Never invent response shapes — read the API contract section in docs/architecture.md.

## MSW must never reach production (Phase 4 trap)

The likeliest way this project ships a broken deploy. MSW registers a **service worker**, so a stray `mockServiceWorker.js` in a production build intercepts real requests and serves fake availability — and it fails _silently_, looking like a working site showing wrong data.

- Gate registration on `NODE_ENV` — development only.
- Confirm `mockServiceWorker.js` is absent from the **built output**, not just the source.
- Handle unregistering: browsers that already loaded the dev site keep the worker registered after the file stops shipping.
- Verify a production build makes real calls in the network panel. Verified, never inferred.

## Workflow

- Commit after each work-plan step passes, conventional-commit style (`feat:`/`fix:`/`chore:`/`docs:`). No attribution trailers.
- Append to `docs/PROGRESS.md` after every completed task (caveman format: `[date] [agent] [what] [reason]`). It holds the **current phase only** — closed phases live in `docs/progress-archive/`, which you read only when tracing why an old decision was made, never as routine context.
- Verification before completion: run the command, quote the decisive output line, then claim done. Never assert something works without evidence.
- Start Claude sessions inside `arena-player-web/` — hooks load from session root.
- **One writing session per worktree.** Two sessions editing this repo at once shipped two defects in a day — overstated contrast ratios, and a WCAG failure written into the design authority — because neither could see the other. Commit before handing off, or use `claude --worktree <branch>`.
- **`.impeccable/critique/` is gitignored**, so a graded review of a design artifact is invisible to `git log` and to the next session. Read it before editing anything under `docs/DESIGN.*`. That blind spot is what caused both defects above.
