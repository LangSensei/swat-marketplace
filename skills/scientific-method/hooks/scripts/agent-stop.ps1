# scientific-method: Agent stop hook (PowerShell)
# Counts complete vs total steps in progress.md (Status fields).
# If incomplete, reminds agent to continue.

$input = $Input | Out-String

$progressFile = "progress.md"

if (-not (Test-Path $progressFile)) {
    Write-Output '{}'
    exit 0
}

$content = Get-Content $progressFile -ErrorAction SilentlyContinue

$total = ($content | Select-String '\*\*Status:\*\*' | Measure-Object).Count
$complete = ($content | Select-String '\*\*Status:\*\* complete' | Measure-Object).Count
$inProgress = ($content | Select-String '\*\*Status:\*\* in_progress' | Measure-Object).Count
$pending = ($content | Select-String '\*\*Status:\*\* pending' | Measure-Object).Count

if ($complete -eq $total -and $total -gt 0) {
    $msg = "[scientific-method] ALL STEPS COMPLETE ($complete/$total). Ensure plan.md Synthesis and Decisions are filled before stopping."
} else {
    $msg = "[scientific-method] Task incomplete ($complete/$total steps done, $inProgress in progress, $pending pending). Update progress.md, then read plan.md and continue."
}

Write-Output "{`"hookSpecificOutput`":{`"hookEventName`":`"AgentStop`",`"additionalContext`":`"$msg`"}}"
exit 0
