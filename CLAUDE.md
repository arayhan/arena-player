# Arena Player — Web

Booking website for a mini soccer field. Users check slot availability, pick date + time, get redirected to the field admin's WhatsApp, then complete a booking form with payment proof upload. The admin confirms manually. Paid freelance project, tight budget — ship the current phase's Definition of Done, don't explore alternatives.

## Docs (read in this order)

| Doc | Content |
|---|---|
| [docs/PRD.md](docs/PRD.md) | Product spec — phases, routes, static content, Definition of Done |
| [docs/architecture.md](docs/architecture.md) | System diagram, request flow, folder structure, verification-script practice |
| [docs/database.md](docs/database.md) | Neon + R2 schema, error-code contract, every hard-won gotcha |
| [docs/design-system.md](docs/design-system.md) | Tokens, typography, animation budget, mobile guardrails |

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

A `Stop` hook nudges once per turn when `docs/PRD.md`, `docs/architecture.md`, `.claude/skills/**`, or `.claude/agents/**` changed and this file did not. It cannot judge whether the change crossed the threshold above — answering "deliberate, no update needed" is a valid and expected response.

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
├── docs/            # PRD, architecture, database, design-system, PROGRESS.md, tasks/
├── .claude/         # agents, skills, hooks, settings
├── db/migrations/   # SQL, run manually
├── app/             # Next.js App Router — page.tsx, booking/page.tsx, api/
├── components/
├── lib/             # db/storage clients, dates, slots, validation (zod), motion, api/ (axios + query hooks), store/ (zustand) + colocated *.test.ts
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
- `lib/` never imports from `app/` (extraction boundary — lets slot/date/validation code be shared with the separate admin repo later).
- No attribution trailers on commits.

## Asking questions

**Always use the `AskUserQuestion` tool, never a plain-text question.** The user wants to click an option rather than type a reply. This applies to every question — scope, approach, design, naming, tradeoffs, motion effects, anything.

- Give real, distinct options with the recommended one first, labelled `(Recommended)`.
- Use the `preview` field whenever the options are concrete enough to show — layouts, code shapes, motion, config.
- "Other" is added automatically, so the user can always type instead when none of the options fit.
- Batch related questions into one call (up to 4) rather than asking serially.

Two unavoidable exceptions:

1. **Plan approval uses `ExitPlanMode`**, not `AskUserQuestion` — the harness requires it.
2. **Pure free-form values** (a phone number, a bank account, a URL) have nothing to enumerate. Ask those plainly and say why there are no options.

## Hard rules (violations = rework)

1. **Race condition**: anti double-booking relies only on the partial unique index `uniq_active_slot`. Never check-then-insert. Insert, catch `23505`, return 409.
2. **No prices anywhere in the UI.** Whether `/booking` is an exception is an OPEN DECISION in the PRD — until it is answered, render no number on either page.
3. **Placeholders** marked `// TODO(content)` — six categories, complete: WA number, bank account + holder, address + maps coords, photos, logo file, hero copy. `rg "TODO\(content\)"` must find all six and nothing else. Named `content` not `phase2` because the re-cut made "Phase 2" the landing page; these swap after Phase 4.
4. **`DATABASE_URL` and R2 secrets** never in client code, never `NEXT_PUBLIC_*`. Browser never touches Neon or R2 — only route handlers do.
5. **Rules section** ("Ketentuan") verbatim Indonesian from the PRD. UI copy Indonesian, code/comments English.
6. **Animation guardrails**: CSS transforms + GSAP only. Every animation goes through `lib/motion.ts` — GSAP has no built-in `prefers-reduced-motion` handling, so a direct `gsap.to()` in a component is banned. **One** WebGL moment permitted, hero only, under the conditions in docs/architecture.md (dynamic import, static fallback, ≤ 40KB gzip, deletable in one commit) — that cap excludes three.js and pixi.js. No Lottie >100KB. No autoplay video unless the Phase 1b hero-video gate passes. No CLS. Stay inside the performance budget in docs/architecture.md.
7. **Performance**: LCP < 2.5s mobile, Lighthouse mobile Performance ≥ 85, order section reachable within 1–2 scrolls at 375px. Verified per section as it merges, not batched to the end of the phase.
8. Every non-trivial `lib/` module gets a colocated Vitest `*.test.ts`, run by `pnpm check:lib`. Never claim something works without running the check and quoting output.
9. **Stack is fixed** — Next 15, TypeScript, Tailwind, GSAP, TanStack Query + axios, MSW, zod, react-hook-form, zustand. Dates and icons are the only open choices, decided in Phase 1a task 1. Anything else needs user approval and must clear the budget in docs/architecture.md. Scope discipline on zustand: server state belongs to TanStack Query, cross-page state travels in the URL — a store duplicating either has outgrown its purpose.
