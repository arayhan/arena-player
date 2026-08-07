# SessionStart hook — injects the project's non-negotiable traps into context.
#
# Why this exists: .claude/skills/arena-player-gotchas/SKILL.md says "every agent must load
# this once per session before touching source files." That was honor-system, and an
# honor-system rule is one nobody notices being skipped. This makes it guaranteed.
#
# Deliberately a SUMMARY, not the whole skill. It is the trap list plus a pointer;
# anything needing full context still reads the skill and the docs. Keeping it short
# means it stays cheap enough to fire on every session without bloating context.
#
# Output on stdout becomes additionalContext. Exit 0 always — a broken hook must never
# block a session from starting.

$ErrorActionPreference = 'Stop'

try {
    $lines = @(
        'ARENA PLAYER - non-negotiable traps (full detail: .claude/skills/arena-player-gotchas, docs/PRD.md, docs/architecture.md)',
        '',
        'PHASES: 1a engineering foundation -> 1b design foundation -> 2 landing / -> 3 form /booking -> 4 backend (MANDATORY, nothing real works without it).',
        'Phases 2-3 run against the MSW mock, never real Neon data. Admin app is a separate repo - never add auth or admin routes here.',
        '',
        'RACE CONDITION (most expensive bug here): anti-double-booking is ONLY the partial unique index uniq_active_slot.',
        'NEVER check-then-insert. Insert, catch Postgres 23505, return HTTP 409.',
        '',
        'CONTENT: no prices anywhere (whether /booking is an exception is an OPEN DECISION - until answered, render no number).',
        'Ketentuan is verbatim Indonesian, 10 rules, do not paraphrase. UI copy Indonesian, code and comments English.',
        'Hero copy is decided in Phase 1b - if you are building the hero and it is not in DESIGN.md, ask rather than invent.',
        '',
        'PLACEHOLDERS: marker is TODO(content), NOT TODO(phase2) - the re-cut made "Phase 2" mean the landing page.',
        'Six categories: WA number, bank account + holder, address + maps coords, photos, logo file, hero copy.',
        '',
        'ANIMATION: CSS transforms + GSAP only. All animation goes through lib/motion.ts (GSAP has no built-in reduced-motion).',
        'One capped WebGL moment permitted, hero only, max 40KB gzip lazy chunk. Stay inside the perf budget in architecture.md.',
        'Ask the user via AskUserQuestion which effect they want BEFORE writing any animation.',
        '',
        'MSW MUST NOT REACH PRODUCTION (Phase 4): it registers a service worker; a stray mockServiceWorker.js in a prod build',
        'intercepts real requests and serves fake availability, failing silently.',
        '',
        'VERIFICATION: run the command, quote the decisive output line, then claim done. Never assert without evidence.',
        'Append to docs/PROGRESS.md after every completed task.'
    )

    $lines -join "`n" | Write-Output
}
catch {
    # Never block a session over a context-injection failure.
}

exit 0
