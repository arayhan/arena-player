# Arena Player — Web

Booking website for a mini soccer field. Users check slot availability, pick date + time, get redirected to the field admin's WhatsApp, then complete a booking form with payment proof upload. The admin confirms manually. Paid freelance project, tight budget — ship the current phase's Definition of Done, don't explore alternatives.

## Docs (read in this order)

| Doc                                              | Content                                                                                                                                                                                        |
| ------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [docs/PRODUCT.md](docs/PRODUCT.md)               | Product truth — who the user is, what the product is for, what must not be fabricated, and which decisions are still the client's. Upstream of the PRD                                         |
| [docs/PRD.md](docs/PRD.md)                       | Product spec — phases, routes, static content, Definition of Done                                                                                                                              |
| [docs/architecture.md](docs/architecture.md)     | System diagram, request flow, folder structure, verification-script practice                                                                                                                   |
| [docs/database.md](docs/database.md)             | Neon + R2 schema, error-code contract, every hard-won gotcha                                                                                                                                   |
| [docs/DESIGN.md](docs/DESIGN.md)                 | Visual system — tokens, typography, components, do's and don'ts. Follows the [DESIGN.md format spec](https://stitch.withgoogle.com/docs/design-md/overview/); frontmatter tokens are normative |
| [docs/design-process.md](docs/design-process.md) | How design work runs — motion approval, image sourcing, animation budget, asset locations, consulting order                                                                                    |
| [docs/rules/](docs/rules/)                       | Engineering conventions, one file per theme — naming, which folder a thing goes in, component patterns, testing, API conventions, the accessibility baseline. The layer below these hard rules |

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

| Phase | Scope                                                                                                                  | Status                           |
| ----- | ---------------------------------------------------------------------------------------------------------------------- | -------------------------------- |
| 1a    | Engineering foundation — architecture, scaffold, DX, dev rules, API contract, mock layer                               | **Done**                         |
| 1b    | Design foundation — **art direction** + hero copy, design system HTML doubling as the prototype. **Client checkpoint** | **Done** — approved with changes |
| 2     | Landing page `/` — layout → order → hero → content → footer. **Client checkpoint**                                     | **Build now**                    |
| 3     | Booking form `/booking` — layout → UI → validation → submission → TanStack Query + fetch                               | After Phase 2                    |
| 4     | Backend — **mandatory**, nothing real works without it. Design discussion deferred                                     | After Phase 3                    |
| —     | WhatsApp bot, real content, deploy, handover                                                                           | After Phase 4                    |

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

**Context7 MCP is wired up** (`.mcp.json`). Use it to check current API syntax rather than recalling it — several libraries here have breaking changes that training data gets wrong: TanStack Query v5 (`isPending`, object-form args), zod, `@gsap/react`'s `useGSAP`, and the Neon serverless driver.

## Folder structure

```
arena-player-web/
├── CLAUDE.md
├── docs/            # PRODUCT, PRD, architecture, database, DESIGN, PROGRESS.md (current phase),
│                    # progress-archive/, tasks/, rules/ (coding rules, one file per theme)
├── .claude/         # agents, skills, hooks, settings,
│                    # commands/ (agent-only tooling as slash commands)
├── db/migrations/   # SQL, run manually — outside src/ because nothing imports it
├── src/
│   ├── app/         # App Router, the composition layer — page.tsx, booking/, api/
│                    # (four DEMO routes: availability, rates, payment-accounts, bookings —
│                    # they store nothing; each says so at its top).
│   │                # The one folder where a component file is lowercase: layout/page/route
│   │                # are framework filenames and providers.tsx keeps their casing
│   ├── modules/     # named after SURFACES. home/ (renders /), booking-form/ (renders /booking).
│   │                # Modules NEVER import each other, and carry no index.ts barrel.
│   │                # Component files are PascalCase.tsx named for their export (SlotCell.tsx);
│   │                # everything else keeps <module>.<role>.ts
│   ├── domain/      # BYTE-IDENTICAL with the admin repo, same path there — slots, dates,
│   │                # status, phone. Only dates.ts has a dependency
│   ├── server/      # import "server-only" — db.ts, storage.ts, env.ts
│   ├── services/    # api-client.ts (fetch wrapper, /booking only — axios removed 2026-08-15)
│   ├── components/  # cross-module UI primitives only
│   ├── hooks/       # cross-module React hooks, use-<thing>.ts. Same one-consumer rule as
│   │                # components/. Data-fetching hooks stay in their module as *.queries.ts
│   ├── lib/         # polish for installed libraries, flat — cn, motion (lazy GSAP), query-client
│   ├── utils/       # web-only helpers — error.ts, formatter.ts
│   └── test/        # test-only shims (the server-only stub Vitest aliases)
└── scripts/         # human-facing tooling only, wired to package.json.
                     # Agent-only tooling goes in .claude/commands/ instead
```

Full detail: [docs/architecture.md](docs/architecture.md).

## Coding rules

The rules live in [`docs/rules/`](docs/rules/), one file per theme, so a session reads only the one it needs.

| Read before                         | File                                                           |
| ----------------------------------- | -------------------------------------------------------------- |
| writing any code                    | [docs/rules/code-style.md](docs/rules/code-style.md)           |
| writing or changing a test          | [docs/rules/testing.md](docs/rules/testing.md)                 |
| touching a route handler or service | [docs/rules/api-conventions.md](docs/rules/api-conventions.md) |
| writing markup or a form control    | [docs/rules/accessibility.md](docs/rules/accessibility.md)     |
| committing, or splitting large work | [docs/rules/git-workflow.md](docs/rules/git-workflow.md)       |

A hard rule below beats anything in those files. Where a rules file needs a number — a contrast ratio, a budget ceiling, a field name — it links to the owning document rather than copying the value.

## Commit conventions & DX

- **Commits and worktrees: [docs/rules/git-workflow.md](docs/rules/git-workflow.md)** — atomic commits, the six semantic types, and the rule that no commit is ever signed with an agent or tool name. Also what never gets committed, and when to propose splitting work across worktrees rather than interleaving it.
- pnpm only — never commit `package-lock.json` or `yarn.lock`.
- Never commit `.env.local`.
- **Start Claude sessions inside `arena-player-web/`** — hooks and settings load from session root; starting one level up leaves `Stop`/`Notification`/`SubagentStop` hooks silently inactive.
- **Three import rules, each enforced twice** — ESLint catches the `@/` form, `check:docs` resolves the relative form no glob can express. Nothing under `src/` imports from `src/app/` (extraction boundary). Feature modules never import each other — shared vocabulary goes in `src/domain/`. `src/domain/` imports nothing from the rest of `src/` and uses **relative** sibling imports (`./slots`), the one exception to `@/`-everywhere, so the copy resolves identically in both repos.
- **`src/domain/` is byte-identical with `arena-player-admin` at the same path** and guarded by `pnpm check:domain` — a one-character drift in `TIME_SLOTS` disables anti-double-booking in both apps with no error. Adding a dependency there obliges the admin repo to install it too, which is why three of its four files have none.
- **`scripts/` is for the human developer; `.claude/commands/` is for agents.** If a tool is only ever invoked by an agent, it is a slash command — a markdown prompt in `.claude/commands/`, not a `.ts` file and not a `package.json` entry. Commands hold no code: the instruction _is_ the tool, and the agent executes it with the tools it already has. Anything a human runs — or that a CI gate runs — stays in `scripts/` and stays wired to `package.json`. **Nothing needed to move when this rule landed**: all three scripts here are reached by `pnpm check` or `check:ship`, so the rule is forward-looking, not a migration somebody should later try to "finish".
- Questions to the user go through `AskUserQuestion`, per the global `~/.claude/CLAUDE.md`.
- **`ui-designer` owns everything a visitor can see** — components, tokens, layout, typography, motion, and `docs/DESIGN.md` — the decision and the code both. `software-engineer` owns everything behind it: route handlers, data layer, validation, tests. A form's submit path is the engineer's; the same form's markup is not.

## Hard rules (violations = rework)

1. **Race condition**: anti double-booking relies only on the partial unique index `uniq_active_slot`. Never check-then-insert. Insert, catch `23505`, return 409.
2. **No prices on `/`. `/booking` shows a real rupiah amount** — the client settled this on 2026-08-11 and the open decision is closed. The landing page renders no number of any kind, still. The booking form is the exception, and only after the visitor has arrived through the WhatsApp link. **The real hourly rate card arrived 2026-08-17** — a live, weekday/weekend/holiday-aware `rate_card` table in Supabase that `src/server/rates.ts` reads via `GET /api/rates?date=…`: **200.000 (06.00–16.00, every day), 300.000 weekday / 350.000 weekend (16.00–18.00), 400.000 weekday / 450.000 weekend (18.00–24.00)**, per hour — cross-checked against the client's own pricelist image. It is served from its own `/api/rates` rather than folded into availability, which is what keeps the no-price rule on `/` structural instead of remembered. A price that is not in the rate card is still never invented.
3. **Placeholders** marked `// TODO(content)` — seven categories in the vocabulary: WA number, bank account + holder, address + maps coords, photos, logo file, hero copy, rate card. `rg "TODO\(content\)"` must find only these categories and nothing else — an **allowlist, not a headcount**, because a supplied item loses its marker. **Five are supplied**: the WA number (2026-08-11, `src/modules/home/home.constants.ts`), the **bank accounts** (2026-08-15, `src/server/payment-accounts.ts` — two, both a.n. MARIANA ULFAH), the **address + maps coords** (2026-08-15 — the client's own embed URL in `LocationBlock.tsx` and the address beside it), and the **rate card** (arrived 2026-08-15, went back to outstanding the same day when slots became hourly, and arrived for real on **2026-08-17**: a live, per-hour, weekday/weekend-aware `rate_card` table (36 rows) that `src/server/rates.ts` reads directly, resolving `day_type` from the booking date plus an admin-managed `public_holidays` table). **Three remain outstanding**: photos, logo file, hero copy — the last of which ships drafted and only becomes a swap if the client wants their own wording. Named `content` not `phase2` because the re-cut made "Phase 2" the landing page.
4. **`DATABASE_URL` and R2 secrets** never in client code, never `NEXT_PUBLIC_*`. Browser never touches Neon or R2 — only route handlers do.
5. **Rules section** ("Ketentuan") verbatim Indonesian from the PRD. UI copy Indonesian, code/comments English.
6. **Animation guardrails**: CSS transforms + GSAP only. Every animation goes through `src/lib/motion.ts` — GSAP has no built-in `prefers-reduced-motion` handling, so a direct `gsap.to()` in a component is banned. **One** WebGL moment permitted, hero only, under the conditions in docs/architecture.md (dynamic import, static fallback, ≤ 40KB gzip, deletable in one commit) — that cap excludes three.js and pixi.js. No Lottie >100KB. No autoplay video unless the Phase 1b hero-video gate passes. No CLS. Stay inside the performance budget in docs/architecture.md.
7. **Performance**: LCP < 2.5s mobile, Lighthouse mobile Performance ≥ 85, order section reachable within 1–2 scrolls at 375px. Verified per section as it merges, not batched to the end of the phase.
8. Every non-trivial module under `src/` gets a colocated Vitest `*.test.ts`, run by `pnpm check:unit` (glob: `src/`). Never claim something works without running the check and quoting output.
9. **Stack is fixed** — Next 16, TypeScript, Tailwind v4, GSAP, TanStack Query, zod, react-hook-form, zustand, `date-fns` + `@date-fns/tz`, `react-icons`, `clsx` + `tailwind-merge`, Vitest v4. All versions are resolved and pinned in the table in docs/architecture.md. Anything else needs user approval and must clear the budget there. **Two packages are `/booking`-only and must never reach `/`**: `zod` and `react-hook-form` — the landing page uses native `fetch` from `src/modules/home/home.service.ts`. **axios was the third and was removed 2026-08-15** when the first real measurement of `/booking` put it 24.2KB over the ceiling. **GSAP loads lazily** via `src/lib/motion.ts`, and so does **zod on `/booking`** — imported at submit time, since it is 63.2KB that first load does not need. Both rules exist because the measured framework baseline is 126.5KB, not the 90 that was estimated, and without them `/` breaches the budget before a single component is written. Scope discipline on zustand: server state belongs to TanStack Query, cross-page state travels in the URL — a store duplicating either has outgrown its purpose.
10. **One writing session per worktree.** Two sessions editing this repo simultaneously shipped two defects in one day — overstated contrast ratios and a WCAG 1.4.11 failure — because neither could see the other's work. Commit before handing off, or use `claude --worktree <branch>`. And **`.impeccable/critique/` is gitignored**, so a graded review of a design artifact is invisible to `git log` and to the next session: read it before editing anything under `docs/DESIGN.*`. That exact blind spot is what produced both defects.

@AGENTS.md
