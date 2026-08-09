# 1a · step 04 — Development rules and the accessibility baseline

**Depends**: 02 (rules describe a repo that exists), 03 (`check:docs` is what stops these rules from rotting)
**Blocks**: nothing mechanically — but every step from here reads them, and a rule written after the code it governs is a rewrite request
**Agent**: `engineering-lead`

## Goal

The conventions an agent must follow that it cannot infer from the code, written into `docs/dev-rules.md`. No code ships in this step.

## Why it is separate from CLAUDE.md

`CLAUDE.md` is deliberately short — every line costs attention on every future session, and at ~300 lines it gets skimmed. It carries hard rules whose violation means rework. This file carries the layer below: the conventions that make the codebase consistent, where getting one wrong costs a review comment rather than a phase.

Do not duplicate. If a rule already lives in `CLAUDE.md` or `architecture.md`, point at it.

## Deliverables

**Naming and file layout**

- Component files, hooks, module files, test files, and route handlers — one convention each, with an example. Modules use `<module>.<role>.ts`: `home.service.ts`, `booking-form.schema.ts`
- Where a thing goes when it could plausibly go in two places. The eight `src/` folders each have one job, and the ambiguous pairs are worth writing down: `src/components/` versus a module's own `components/` (one consumer means it belongs to the module); `src/lib/` versus `src/utils/` (lib polishes an installed library, utils is our own helper); `src/utils/` versus `src/domain/` (does the admin repo need it?); `src/services/` versus a module's `*.service.ts` (the shared axios instance versus the calls that use it)

**What never goes in `src/app/`**

- `src/app/` holds routes, layouts, and composition. Business logic, data shaping, and reusable UI live in modules
- Nothing under `src/` imports from `src/app/` — the extraction boundary that lets slot and date code stay shareable with the admin repo
- **Feature modules never import each other.** Shared vocabulary goes in `src/domain/`. One `home` → `booking-form` import is all it takes for a later `import { z }` there to ship zod to `/` with nothing failing
- **No `index.ts` barrels under `src/modules/`** — a barrel re-exporting the form drags zod, react-hook-form, and axios along with any import from that module

**Component patterns**

- Server Component by default; `"use client"` is a decision that gets justified, not a reflex
- Props typing, and where the boundary sits between a presentational component and one that fetches
- No bare `fetch` in a component — axios through TanStack Query, per the PRD

**Accessibility baseline** — the part of this file with the most teeth, because it is the part that silently does not happen:

- Every input has a real `<label>`, not a placeholder standing in for one
- Every error message is wired to its field with `aria-describedby`, and the field carries `aria-invalid`
- Focus is managed on route change and on form submission — a 409 must move focus to the message, or a screen-reader user never learns their slot was taken
- Everything operable by keyboard, in a visible focus order. The Visible-Boundary Rule in [DESIGN.md](../DESIGN.md) already forbids colour as the only signal
- Touch targets ≥ 44px, which the order-section slot grid at 375px will test hardest

**Indonesian/English split** — UI copy Indonesian, code and comments English. Already a hard rule; restate where the seam falls in a component that contains both.

## Acceptance

```bash
test -f docs/dev-rules.md

# it does not duplicate what CLAUDE.md already says
grep -c "uniq_active_slot\|23505" docs/dev-rules.md   # expect: 0 or a pointer, not a restatement

# the a11y baseline is specific enough to check code against
grep -nE "aria-describedby|aria-invalid|44px|focus" docs/dev-rules.md   # expect: all four present

# the extraction boundary is stated
grep -n "never imports from" docs/dev-rules.md
```

**Not done until** an agent could open a new component file and answer "where does this go, what is it called, and what must it do for a keyboard user" without asking.

handoff: `code-reviewer` for the 03 + 04 checkpoint, then `software-engineer` for step 06
