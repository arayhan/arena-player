---
description: Draft the PROGRESS.md entry for this session's work, safely
---

Draft the `docs/PROGRESS.md` entry covering this session, then append it.

## Before writing anything — check for another session

[CLAUDE.md](../../CLAUDE.md) hard rule 10: **one writing session per worktree.** Two sessions editing this repo at once shipped two defects in a single day, and it has since happened again — a domain re-copy into the admin repo was silently reverted mid-flight by a concurrent session restoring its tree.

Run `git status --short` and `git worktree list`. If the tree carries changes this session did not make, **stop and report** rather than appending. Say what you found and let the human decide.

Also read `.impeccable/critique/` if it exists. It is gitignored, so a graded review of a design artifact is invisible to `git log` and to you — and that exact blind spot produced two shipped defects.

## Gather

- `git log --oneline` since the session started (the `.claude/.session-head` marker holds the starting SHA if present)
- Uncommitted changes in the tree
- Any check that is currently red, and why

## Format

`[YYYY-MM-DD] [agent] [what] [why]` — one paragraph, dense, no bullet lists. Match the surrounding entries: they are written to be re-read by an agent months later, not skimmed.

Agent tags in use: `pm`, `lead`, `engineer`, `reviewer`, `build`, `decision`, `gotcha`, `setup`, `review`.

## What earns a place in the entry

- **A decision and the alternative rejected**, with the reason. "Chose X" is worth nothing; "chose X because Y starves on the quiet night the problem describes" is the whole value.
- **A trap that cost time**, so the next session does not re-learn it.
- **A check that was proven to fail**, with what was planted.
- **Work owed but not done**, named explicitly — especially anything crossing into the admin repo.

## What does not

- Restating a rule that lives in PRD, architecture, DESIGN or PRODUCT. This log records _how it got that way_, not what is true now. Distilling standing decisions into here creates a fifth drift surface.
- Narrating files touched. `git log` already has that.

## After appending

State plainly whether `pnpm check` passes. If a check is red, say which and why — a handoff entry that omits a red check hands over a trap.
