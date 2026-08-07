# docs/tasks/

Work orders, one file per unit of work. Two kinds live here and they are not interchangeable:
a **step** is something an agent does, a **gate** is something a human decides.

## Naming

`<phase>-<kind>-<slug>.md`

```
1a-step-01-architecture.md
1a-step-02-scaffold.md
…
1b-gate-client.md
1b-step-01-art-direction.md
2-gate-client.md
```

The folder sorts into build order on its own, so no index needs maintaining, and the filename
says who acts before anyone opens it.

**Step files land when their phase's build actually starts**, not during planning. Gates land as
soon as the questions exist, because a gate whose questions are written late is a gate that gets
held late — and client response time is the longest lead item in this project.

## Steps

State a goal, a concrete deliverables list, and **acceptance criteria written as runnable checks**
— grep patterns, commands, assertions — not vague prose. Include `**Depends**:` / `**Blocks**:`
lines and end with a `handoff:` line naming the next agent.

The old 8-step pattern (`step-01-scaffold` → `step-08-verification`) is still the best example of
a well-formed step. Read one via the preserved tag:

```bash
git show archive/neon-r2-pre-wipe:docs/tasks/step-01-scaffold.md
```

(swap the filename for any of `step-02-database`, `step-03-api-routes`, `step-04-landing`,
`step-05-booking-grid`, `step-06-form`, `step-07-design-pass`, `step-08-verification`)

Before writing a step file, **check whether its work is already done**. Two Phase 1a tasks were
completed during planning — the API contract is in [architecture.md](../architecture.md) and so is
the performance budget — while the PRD's Definition-of-Done checkboxes still show both unticked.

## Gates

A gate names **who decides**, **what it unblocks**, the questions that must not be left unasked,
and a sign-off block with room for the outcome. It carries a `**Blocks**:` line like a step.

It deliberately does **not** carry runnable acceptance criteria or a `handoff:` agent line. Its
acceptance criterion is a human signature and no agent picks it up; forcing it into the step
shape would mean writing checks that cannot be run.

Fill a gate in **during or immediately after** the meeting, not from memory afterwards. The
outcome is the durable half — a gate with blank answers is a meeting that has not happened yet,
whatever the calendar says.
