# 1a · step 03 — Developer experience harness

**Depends**: 02
**Blocks**: 06 (its tests need a runner), and every later claim of "done"
**Agent**: `software-engineer`

## Goal

The commands that let anyone — human or agent — prove a claim instead of asserting it. Lint, format, typecheck, `check:lib`, and `check:docs`.

**`check:setup` is not built here.** It connects to Neon and R2, neither of which exists before Phase 4, so writing it now produces a script that can only fail.

## Deliverables

- Lint, format, typecheck scripts, all running clean on the scaffold
- **Vitest** wired as `pnpm check:lib` → `vitest run lib`. Tests are colocated `*.test.ts` beside the module they cover. It must never need credentials — that is why the Phase 4 preflight lives under a separate glob
- **`pnpm check:docs`** — the mechanical half of doc review, spec'd in [PRD.md](../PRD.md) Phase 1a. It asserts: no `TODO(phase2)` survives anywhere; `TODO(content)` finds exactly the six declared categories; no bare "Phase 1" references, only 1a/1b/4; and the phase overview table names the same phases as the detail sections
- Editor config
- Optionally commit hooks, if they earn their keep

## Why check:docs exists

Three review rounds found roughly half the issues were pure greps — and that mechanical edits became the largest source of *new* defects. It catches the agent's own mistakes. Wire it to a `Stop` hook exiting 2 so failures loop back, and **guard on `stop_hook_active` or it recurses forever**. That guard is not optional; the existing `check-claudemd.ps1` hook documents why.

## A check worth adding while you are here

The repo has now lost time three separate ways to the same failure: a value copied out of a source doc, with nothing checking the copy. It hit the skills, the agents, and the hooks. Consider asserting in `check:docs` that every hex code and contrast ratio appearing under `.claude/skills/**` also appears in `docs/DESIGN.md`.

## Acceptance

```bash
pnpm lint && pnpm typecheck        # both exit 0 on the scaffold
pnpm check:lib                     # runs; passes trivially until step 06 adds real tests
pnpm check:docs                    # exits 0 today, and exits non-zero if you plant a TODO(phase2)

# prove check:docs actually fails rather than always passing
echo "// TODO(phase2)" > /tmp/probe.ts && cp /tmp/probe.ts lib/_probe.ts
pnpm check:docs ; echo "expect non-zero: $?"
rm lib/_probe.ts

# check:lib must not require credentials
mv .env.local .env.local.bak && pnpm check:lib ; echo "expect 0: $?" ; mv .env.local.bak .env.local
```

**Not done until** `check:docs` has been proven to *fail* on a planted violation. A check that has only ever passed is a check nobody has tested — this repo shipped a `Stop` hook that never fired once for exactly that reason.

handoff: `code-reviewer` — checkpoint before step 04
