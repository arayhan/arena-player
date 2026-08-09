# Stop hook - runs pnpm check:docs and loops the failures back to Claude.
#
# Why a hook and not just a script: check:docs catches the agent's own mechanical
# mistakes, and an agent that has just finished a doc edit is exactly the agent
# least likely to run it. Three review rounds found roughly half the issues were
# pure greps.
#
# Anti-loop: a Stop hook must exit 2 for its message to reach Claude, and exit 2
# blocks the turn from ending. On the re-fire the harness passes
# stop_hook_active=true; without that guard this recurses forever. The guard is
# not optional - check-claudemd.ps1 documents the same trap.
#
# Never blocks on its own failure: every error path exits 0. A broken hook that
# wedges the session is worse than a check that occasionally misses.

$ErrorActionPreference = 'Stop'

try {
    # ---- anti-recursion guard -------------------------------------------------
    $raw = [Console]::In.ReadToEnd()
    if ($raw) {
        try {
            $payload = $raw | ConvertFrom-Json
            if ($payload.stop_hook_active) { exit 0 }
        } catch {
            # Unparseable payload is not a reason to block the turn.
        }
    }

    if (-not (Test-Path 'scripts/check-docs.mjs')) { exit 0 }

    # ---- run it ---------------------------------------------------------------
    # node directly rather than `pnpm check:docs`: one less process, and pnpm's
    # own banner would land in the message Claude reads.
    #
    # NO 2>&1 here, deliberately. check-docs writes its findings to stdout for
    # exactly this reason: PowerShell 5.1 wraps every stderr line from a native
    # command in a NativeCommandError, which under ErrorActionPreference=Stop is
    # terminating - the catch below swallowed it and the hook exited 0 on a real
    # failure, which is what the first test of this hook actually did. Same
    # never-fires defect this repo already shipped once. Exit code carries
    # pass/fail; stdout carries the findings.
    $output = & node 'scripts/check-docs.mjs' | Out-String
    $failed = $LASTEXITCODE -ne 0

    if (-not $failed) { exit 0 }

    Write-Output @"
check:docs FAILED. These are mechanical doc defects - the class that this repo
has repeatedly shipped by hand and then found by re-reading.

$output
Fix them, then finish. If a finding is a false positive, say which and why -
do not silence the check to make it pass.
"@
    exit 2
} catch {
    exit 0
}
