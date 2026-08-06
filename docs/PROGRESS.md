# PROGRESS — shared agent log

Cross-agent communication file. Every agent reads this before working, appends after.
Format (caveman-compact): `[YYYY-MM-DD] [agent] [what] [reason]`

Agents: instructor | pm | eng-lead | senior | fe | be

---

[2026-07-31] [user] Project re-planned from scratch after prior build got messy (agents/hooks/skills built before planning, DB pivoted mid-build Supabase->Neon+R2->revert). DB re-locked as Neon+R2, final.
[2026-07-31] [setup] Scaffolding order this time: PRD -> architecture -> design-system/database -> CLAUDE.md -> settings/hooks -> MCP -> skills -> agents (last). See archive/neon-r2-pre-wipe git tag for the fuller pre-reset build if old code needs referencing.
[2026-07-31] [setup] Agent team + skills built. Ready for Phase 1 execution via docs/tasks/ (currently empty, populated when build starts).
