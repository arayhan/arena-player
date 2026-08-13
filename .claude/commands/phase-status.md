---
description: Checklist every phase in both repos, with what is blocking each
argument-hint: "[web|admin|all]"
---

Report the Definition-of-Done state of every phase. Scope: `$ARGUMENTS` — default to `all` if empty.

## Where the truth is

- Web: `docs/PRD.md`, section `## Definition of Done — Phases 1a–3`, then `### Definition of Done — Phase 4`, then the `## Real content + WhatsApp bot` and `## Deploy + handover` sections.
- Admin: `../arena-player-admin/docs/PRD.md`, sections `### Definition of Done — Phase 1a` through `Phase 5`.

Read the checkbox lines directly. **Do not infer state from commit messages or from `docs/PROGRESS.md`** — PRD checkboxes are the record, PROGRESS is the narrative, and they have disagreed before.

## Output

One section per phase, in order, each item as `- [x]` or `- [ ]` with its short label. Then per phase, an `n/total` count.

End with a **Blockers** section listing only the unchecked items, each annotated with why it is not done if the PRD says so — some carry an explanation inline (e.g. an item may be three-of-four measured with one measurement outstanding). Distinguish:

- **blocked on a human** — client sign-off, credentials, content the client owes
- **blocked on a phase** — cannot start until an earlier phase ships
- **actionable now** — nothing external is missing

Keep the whole thing scannable. Tables per phase are fine; prose paragraphs are not.

## Two things to state, not silently omit

1. If the PRD's checkboxes are older than the code — e.g. a redesign landed that reopens a phase whose boxes are still ticked — say so explicitly at the top. A checklist that reads complete while the work was invalidated is worse than no checklist.
2. If a phase has no step files in `docs/tasks/` yet, note that the phase is specified but not broken down.
