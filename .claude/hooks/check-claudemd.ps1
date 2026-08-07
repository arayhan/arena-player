# Stop hook - nudges once when core docs changed but CLAUDE.md did not.
#
# What it can and cannot do: detecting "PRD changed, CLAUDE.md did not" is pure git and
# fully mechanical. Judging whether the change was MAJOR enough to warrant a CLAUDE.md
# update is not automatable. So this nudges; it never gates. "Deliberate, no update
# needed" is a valid answer and a false positive costs one line of reply.
#
# Anti-loop: a Stop hook must exit 2 for its message to reach Claude, and exit 2 blocks
# the turn from ending. On the re-fire the harness passes stop_hook_active=true, and
# bailing on that is the ONLY thing preventing infinite recursion. Do not remove it.
#
# Never blocks on its own failure: any error path exits 0. A broken hook that wedges the
# session is far worse than a missed nudge.
#
# ASCII only - PowerShell 5.1 reads UTF-8 files as ANSI here, which turned em dashes into
# mojibake in inject-gotchas.ps1. Do not reintroduce non-ASCII characters.

try {
    $raw = [Console]::In.ReadToEnd()

    if ($raw) {
        try {
            $payload = $raw | ConvertFrom-Json
            # The re-fire after a previous block. Bail, or this loops forever.
            if ($payload.stop_hook_active) { exit 0 }
        }
        catch {
            # Unparseable payload is not a reason to block. Carry on with the check.
        }
    }

    Push-Location -Path $PSScriptRoot
    try {
        Set-Location (Join-Path $PSScriptRoot '..\..')

        # Whole working tree, not just staged: tracked modifications plus untracked adds.
        $changed = @(& git diff --name-only HEAD 2>$null)
        $changed += @(& git ls-files --others --exclude-standard 2>$null)

        if ($LASTEXITCODE -ne 0 -and -not $changed) { exit 0 }
    }
    finally {
        Pop-Location
    }

    $changed = $changed | Where-Object { $_ }
    if (-not $changed) { exit 0 }

    $watched = $changed | Where-Object {
        $_ -like 'docs/PRD.md' -or
        $_ -like 'docs/architecture.md' -or
        $_ -like '.claude/skills/*' -or
        $_ -like '.claude/agents/*'
    }

    if (-not $watched) { exit 0 }

    $claudeMdTouched = $changed | Where-Object { $_ -eq 'CLAUDE.md' }
    if ($claudeMdTouched) { exit 0 }

    $list = ($watched | Select-Object -Unique | ForEach-Object { "  - $_" }) -join "`n"

    $msg = @"
CLAUDE.md was not updated, but these changed:
$list

Update CLAUDE.md only if the change crossed the threshold in its "When to update this
file" section: phase structure, a hard rule, tech stack, folder structure, a
cross-cutting convention, install/run commands, or repo scope.

Task detail, DoD checkboxes, and rationale prose do NOT qualify - if this was one of
those, say "deliberate, no CLAUDE.md update needed" and finish. This nudge fires once
per turn and will not repeat.
"@

    [Console]::Error.WriteLine($msg)
    exit 2
}
catch {
    # Any unexpected failure: stay out of the way.
    exit 0
}
