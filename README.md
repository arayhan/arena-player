# Arena Player — Web

Booking website for a mini soccer field. A visitor checks slot availability, picks
a date and time, gets handed to the field admin on WhatsApp, then completes a
booking form with a payment-proof upload. The admin confirms by hand.

Public-facing site only. The admin application lives in a separate repo
(`arena-player-admin`) sharing the same database and storage bucket.

## Run it

```bash
pnpm install
pnpm dev            # http://localhost:3000
```

**No credentials needed.** Nothing under `src/` reads an environment variable
other than `NODE_ENV`, because every API call is served by an in-browser mock
until the backend phase. `.env.local` only matters from Phase 4 onward — see
[db/README.md](db/README.md) when you get there.

If `pnpm dev` shows a blank page, the mock service worker did not start. The
console says so and names the fix.

## Commands

| Command                              | What it does                                                                                                    |
| ------------------------------------ | --------------------------------------------------------------------------------------------------------------- |
| `pnpm dev` / `build` / `start`       | Next.js, as usual                                                                                               |
| **`pnpm check`**                     | **The gate.** Lint, typecheck, format, domain drift, docs, unit tests. Run this before you claim anything works |
| `pnpm check:ship`                    | `check` + a real build + the per-route bundle budget. Run before merging                                        |
| `pnpm check:unit`                    | Vitest over `src/`. Never needs credentials                                                                     |
| `pnpm check:domain`                  | Diffs `src/domain/` against the admin repo's copy. Skips loudly when that repo is absent                        |
| `pnpm check:docs`                    | 13 assertions that the docs still describe reality                                                              |
| `pnpm check:budget`                  | Per-route gzipped JS against the ceiling. `--report` prints the per-chunk table                                 |
| `pnpm lint` / `typecheck` / `format` | Individually, if you want them one at a time                                                                    |

## Where to read next

Everything below is the authority on its subject. This file deliberately
restates none of it.

| If you need                                                        | Read                                                                                        |
| ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------- |
| What the product is for, and what must not be invented             | [docs/PRODUCT.md](docs/PRODUCT.md)                                                          |
| Phases, routes, static content, Definition of Done                 | [docs/PRD.md](docs/PRD.md)                                                                  |
| System design, API contract, folder boundaries, performance budget | [docs/architecture.md](docs/architecture.md)                                                |
| Database schema, and every gotcha that has already bitten          | [docs/database.md](docs/database.md)                                                        |
| Naming, where a file goes, the accessibility baseline              | [docs/dev-rules.md](docs/dev-rules.md)                                                      |
| Colour, type, spacing, contrast ratios                             | [docs/DESIGN.md](docs/DESIGN.md)                                                            |
| Why a past decision was made                                       | [docs/PROGRESS.md](docs/PROGRESS.md), then [docs/progress-archive/](docs/progress-archive/) |

**[CLAUDE.md](CLAUDE.md) carries the hard rules** — the ones whose violation
means rework rather than a review comment. Read it before changing code, whether
you are a person or an agent.

## Three things that will surprise you

**Anti-double-booking is one database index.** A partial unique index named
`uniq_active_slot` is the only thing preventing two teams booking the same slot.
The application never checks-then-inserts; it inserts, catches Postgres error
`23505`, and returns HTTP 409. Reasoning in [docs/database.md](docs/database.md).

**`src/domain/` is byte-identical with the admin repo** and is guarded by
`pnpm check:domain`. Editing it here is editing it there. The contract is in
[docs/architecture.md](docs/architecture.md).

**The site takes no real bookings yet.** Phases 1–3 run entirely against a mock,
so the app will look finished while writing nothing to a database. The backend is
Phase 4 and it is mandatory.
