# docs/tasks/

Empty until the Phase 1 build actually starts — populated with `step-01…08` files at that point, not during planning.

Each file should state a goal, a concrete deliverables list, and acceptance criteria written as runnable checks (grep patterns, commands, assertions) — not vague prose. Include `**Depends**:` / `**Blocks**:` lines and end with a `handoff:` line naming the next agent.

The old 8-step pattern (`step-01-scaffold` → `step-08-verification`) still exists as reference — see it via the preserved tag:

```bash
git show archive/neon-r2-pre-wipe:docs/tasks/step-01-scaffold.md
```

(swap the filename for any of `step-02-database`, `step-03-api-routes`, `step-04-landing`, `step-05-booking-grid`, `step-06-form`, `step-07-design-pass`, `step-08-verification`)
