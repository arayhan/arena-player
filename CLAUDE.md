# Arena Player — Web

Booking website for a mini soccer field. Users check slot availability, pick date + time, get redirected to the field admin's WhatsApp, then complete a booking form with payment proof upload. The admin confirms manually. Paid freelance project, tight budget — ship the Phase 1 Definition of Done, don't explore alternatives.

## Docs (read in this order)

| Doc | Content |
|---|---|
| [docs/PRD.md](docs/PRD.md) | Product spec — phases, routes, static content, Definition of Done |
| [docs/architecture.md](docs/architecture.md) | System diagram, request flow, folder structure, verification-script practice |
| [docs/database.md](docs/database.md) | Neon + R2 schema, error-code contract, every hard-won gotcha |
| [docs/design-system.md](docs/design-system.md) | Tokens, typography, animation budget, mobile guardrails |

## Phases

| Phase | Scope | Status |
|---|---|---|
| 1 | Landing, booking grid, form, availability API, anti double-booking, auto-expire | Build now |
| 2 | WhatsApp bot auto-reply, real content swap | Blocked on client inputs |
| 3 | Admin app, production deploy, Neon+R2 handover | Blocked on Phase 2 + Sumopod |

## Install & run

```bash
pnpm install
cp .env.local.example .env.local   # fill: DATABASE_URL, R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET
pnpm dev                           # http://localhost:3000
```

Migrations in `db/migrations/` are run **manually** by the user in the Neon SQL editor — never assume one is applied.

## Folder structure

```
arena-player-web/
├── CLAUDE.md
├── docs/            # PRD, architecture, database, design-system, PROGRESS.md, tasks/
├── .claude/         # agents, skills, hooks, settings
├── db/migrations/   # SQL, run manually
├── app/             # Next.js App Router
├── components/
├── lib/             # db/storage clients, dates, slots, validation
└── scripts/         # check-lib.ts, check-setup.ts
```

Full detail: [docs/architecture.md](docs/architecture.md).

## Commit conventions & DX

- Conventional-Commits-flavored: `feat:`, `fix:`, `chore:`, `docs:`, `revert:`. Commit after each work step passes, not one giant commit.
- pnpm only — never commit `package-lock.json` or `yarn.lock`.
- Never commit `.env.local`.
- **Start Claude sessions inside `arena-player-web/`** — hooks and settings load from session root; starting one level up leaves `Stop`/`Notification`/`SubagentStop` hooks silently inactive.
- Parallel sessions: `claude --worktree <branch-name>`.
- `lib/` never imports from `app/` (extraction boundary — keeps a future `packages/shared` possible if Phase 3 goes monorepo).
- No attribution trailers on commits.

## Hard rules (violations = rework)

1. **Race condition**: anti double-booking relies only on the partial unique index `uniq_active_slot`. Never check-then-insert. Insert, catch `23505`, return 409.
2. **No prices anywhere in the UI.**
3. **Placeholders** marked `// TODO(phase2)`, greppable: WA number, bank account + holder, address + maps coords, photos.
4. **`DATABASE_URL` and R2 secrets** never in client code, never `NEXT_PUBLIC_*`. Browser never touches Neon or R2 — only route handlers do.
5. **Rules section** ("Ketentuan") verbatim Indonesian from the PRD. UI copy Indonesian, code/comments English.
6. **Animation guardrails**: no WebGL/three.js/Lottie>100KB/autoplay video. Framer Motion + CSS transforms only. Every animation respects `prefers-reduced-motion`. No CLS.
7. **Performance**: LCP < 2.5s mobile, Lighthouse mobile Performance ≥ 85, booking grid reachable within 1–2 scrolls at 375px.
8. Every non-trivial `lib/` module gets a `check-lib.ts` assertion. Never claim something works without running the check and quoting output.
