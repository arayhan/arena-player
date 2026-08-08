# Arena Player — Web

Booking website for a mini soccer field. Users check slot availability, pick date + time, get redirected to the field admin's WhatsApp, then complete a booking form with payment proof upload. The admin confirms manually. Paid freelance project, tight budget — ship the current phase's Definition of Done, don't explore alternatives.

## Docs (read in this order)

| Doc | Content |
|---|---|
| [docs/PRODUCT.md](docs/PRODUCT.md) | Product truth — who the user is, what the product is for, what must not be fabricated, and which decisions are still the client's. Upstream of the PRD |
| [docs/PRD.md](docs/PRD.md) | Product spec — phases, routes, static content, Definition of Done |
| [docs/architecture.md](docs/architecture.md) | System diagram, request flow, folder structure, verification-script practice |
| [docs/database.md](docs/database.md) | Neon + R2 schema, error-code contract, every hard-won gotcha |
| [docs/DESIGN.md](docs/DESIGN.md) | Visual system — tokens, typography, components, do's and don'ts. Follows the [DESIGN.md format spec](https://stitch.withgoogle.com/docs/design-md/overview/); frontmatter tokens are normative |
| [docs/design-process.md](docs/design-process.md) | How design work runs — motion approval, image sourcing, animation budget, asset locations, consulting order |

## When to update this file

This file is **what an agent must know before touching code and cannot discover from the code itself** — a pointer document plus hard rules, not a spec. Every line added costs attention on every future session, so length is a real cost: at ~95 lines it gets read, at 300 it gets skimmed, and a CLAUDE.md nobody reads is worse than a short one.

**Update it when any of these change:**

- Phase structure — a phase added, removed, or renumbered
- A hard rule added, removed, or materially changed
- Tech stack — a library swapped in or out
- Folder structure
- A cross-cutting convention every agent must follow (e.g. the `TODO(content)` marker)
- Install/run commands
- Repo scope — what belongs here versus the admin repo

**Do NOT update it for:**

- Task-level detail inside a phase
- Definition-of-Done checkbox changes
- Rationale or explanation prose
- Anything an agent can look up in the PRD at the moment they need it

A `Stop` hook nudges **once per session** when `docs/PRD.md`, `docs/architecture.md`, `.claude/skills/**`, `.claude/agents/**`, `.claude/hooks/**`, or `.claude/settings.json` changed and this file did not. It counts work **committed since the session started** as well as the working tree — an earlier version checked only uncommitted changes and therefore never fired once, because the commit-after-every-step convention above leaves the tree clean by the time a turn ends. It cannot judge whether a change crossed the threshold above; answering "deliberate, no update needed" is valid and expected.

## Phases

Frontend-first. See [docs/PRD.md](docs/PRD.md) for the task breakdown per phase.

| Phase | Scope | Status |
|---|---|---|
| 1a | Engineering foundation — architecture, scaffold, DX, dev rules, API contract, MSW mock | Build now |
| 1b | Design foundation — **art direction** + hero copy, design system HTML doubling as the prototype. **Client checkpoint** | After 1a scaffold |
| 2 | Landing page `/` — layout → order → hero → content → footer. **Client checkpoint** | After 1b |
| 3 | Booking form `/booking` — layout → UI → validation → submission → TanStack Query + axios | After Phase 2 |
| 4 | Backend — **mandatory**, nothing real works without it. Design discussion deferred | After Phase 3 |
| — | WhatsApp bot, real content, deploy, handover | After Phase 4 |

**Phases 1a–3 run entirely against a mock — the site will look finished while taking zero real bookings.** Phase 4 holds the race condition, the most expensive bug in this project.

Order section is built before hero in Phase 2 — it carries the state and data-fetching risk, so it gets the most iteration time. Its anchor is `#order`, deliberately not `#booking`, so it never shadows the `/booking` route.

**Repo scope**: public-facing site only — landing, booking form, availability API. The admin app is out of scope here and belongs in a separate repo (`arena-player-admin`) sharing the same Neon DB and R2 bucket. Never add auth, admin routes, or admin UI to this repo.

## Install & run

```bash
pnpm install
cp .env.local.example .env.local   # fill: DATABASE_URL, R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET
pnpm dev                           # http://localhost:3000
```

Migrations in `db/migrations/` are run **manually** by the user in the Neon SQL editor — never assume one is applied.

**Context7 MCP is wired up** (`.mcp.json`). Use it to check current API syntax rather than recalling it — several libraries here have breaking changes that training data gets wrong: MSW v2 (`http.get` / `HttpResponse.json`, not v1's `rest.get` / `res(ctx.json())`), TanStack Query v5 (`isPending`, object-form args), zod, `@gsap/react`'s `useGSAP`, and the Neon serverless driver.

## Folder structure

```
arena-player-web/
├── CLAUDE.md
├── docs/            # PRODUCT, PRD, architecture, database, DESIGN, PROGRESS.md (current phase), progress-archive/, tasks/
├── .claude/         # agents, skills, hooks, settings
├── db/migrations/   # SQL, run manually
├── app/             # Next.js App Router — page.tsx, booking/page.tsx, api/
├── components/
├── lib/             # shared/ (slots, dates, validation — BYTE-IDENTICAL with the admin repo), db/storage clients,
│                    # proof.ts (web-only upload limits), motion.ts (lazy GSAP), api/ (fetch on /, axios on /booking),
│                    # store/ (zustand) + colocated *.test.ts
├── mocks/           # MSW handlers implementing the API contract
└── scripts/         # check-setup.test.ts — live Neon + R2 preflight, Phase 4
```

Full detail: [docs/architecture.md](docs/architecture.md).

## Commit conventions & DX

- Conventional-Commits-flavored: `feat:`, `fix:`, `chore:`, `docs:`, `revert:`. Commit after each work step passes, not one giant commit.
- pnpm only — never commit `package-lock.json` or `yarn.lock`.
- Never commit `.env.local`.
- **Start Claude sessions inside `arena-player-web/`** — hooks and settings load from session root; starting one level up leaves `Stop`/`Notification`/`SubagentStop` hooks silently inactive.
- Parallel sessions: `claude --worktree <branch-name>`.
- `lib/` never imports from `app/` (extraction boundary). **`lib/shared/` is byte-identical with `arena-player-admin`** and guarded by `pnpm check:shared` — a one-character drift in `TIME_SLOTS` disables anti-double-booking in both apps with no error. Adding a dependency there obliges the admin repo to install it too.
- No attribution trailers on commits.
- Questions to the user go through `AskUserQuestion`, per the global `~/.claude/CLAUDE.md`.

## Hard rules (violations = rework)

1. **Race condition**: anti double-booking relies only on the partial unique index `uniq_active_slot`. Never check-then-insert. Insert, catch `23505`, return 409.
2. **No prices anywhere in the UI.** Whether `/booking` is an exception is an OPEN DECISION in the PRD — until it is answered, render no number on either page.
3. **Placeholders** marked `// TODO(content)` — six categories, complete: WA number, bank account + holder, address + maps coords, photos, logo file, hero copy. `rg "TODO\(content\)"` must find all six and nothing else. Named `content` not `phase2` because the re-cut made "Phase 2" the landing page; these swap after Phase 4.
4. **`DATABASE_URL` and R2 secrets** never in client code, never `NEXT_PUBLIC_*`. Browser never touches Neon or R2 — only route handlers do.
5. **Rules section** ("Ketentuan") verbatim Indonesian from the PRD. UI copy Indonesian, code/comments English.
6. **Animation guardrails**: CSS transforms + GSAP only. Every animation goes through `lib/motion.ts` — GSAP has no built-in `prefers-reduced-motion` handling, so a direct `gsap.to()` in a component is banned. **One** WebGL moment permitted, hero only, under the conditions in docs/architecture.md (dynamic import, static fallback, ≤ 40KB gzip, deletable in one commit) — that cap excludes three.js and pixi.js. No Lottie >100KB. No autoplay video unless the Phase 1b hero-video gate passes. No CLS. Stay inside the performance budget in docs/architecture.md.
7. **Performance**: LCP < 2.5s mobile, Lighthouse mobile Performance ≥ 85, order section reachable within 1–2 scrolls at 375px. Verified per section as it merges, not batched to the end of the phase.
8. Every non-trivial `lib/` module gets a colocated Vitest `*.test.ts`, run by `pnpm check:lib`. Never claim something works without running the check and quoting output.
9. **Stack is fixed** — Next 16, TypeScript, Tailwind v4, GSAP, TanStack Query, MSW, zod, react-hook-form, zustand, `date-fns` + `@date-fns/tz`, `react-icons`, Vitest v4. All versions are resolved and pinned in the table in docs/architecture.md. Anything else needs user approval and must clear the budget there. **Three packages are `/booking`-only and must never reach `/`**: `axios`, `zod`, `react-hook-form` — the landing page uses native `fetch` through `lib/api/`. **GSAP loads lazily** via `lib/motion.ts`. Both rules exist because the measured framework baseline is 126.5KB, not the 90 that was estimated, and without them `/` breaches the budget before a single component is written. Scope discipline on zustand: server state belongs to TanStack Query, cross-page state travels in the URL — a store duplicating either has outgrown its purpose.
10. **One writing session per worktree.** Two sessions editing this repo simultaneously shipped two defects in one day — overstated contrast ratios and a WCAG 1.4.11 failure — because neither could see the other's work. Commit before handing off, or use `claude --worktree <branch>`. And **`.impeccable/critique/` is gitignored**, so a graded review of a design artifact is invisible to `git log` and to the next session: read it before editing anything under `docs/DESIGN.*`. That exact blind spot is what produced both defects.

@AGENTS.md
