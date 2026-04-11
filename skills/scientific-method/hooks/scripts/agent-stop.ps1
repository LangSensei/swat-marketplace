# scientific-method: Agent stop hook (PowerShell)
# Counts complete vs total cycles in plan.md Decompose table.
# If incomplete, reminds agent to continue.

$input = $Input | Out-String

$planFile = "plan.md"

if (-not (Test-Path $planFile)) {
    Write-Output '{}'
    exit 0
}

$content = Get-Content $planFile -ErrorAction SilentlyContinue

$total = ($content | Select-String '^\|[\s]*\d+' | Measure-Object).Count
$complete = ($content | Select-String '^\|.*\|[\s]*complete[\s]*\|' | Measure-Object).Count
$inProgress = ($content | Select-String '^\|.*\|[\s]*in_progress[\s]*\|' | Measure-Object).Count
$pending = ($content | Select-String '^\|.*\|[\s]*pending[\s]*\|' | Measure-Object).Count

if ($total -eq 0) { $total = 0 }
if ($complete -eq 0) { $complete = 0 }

if ($complete -eq $total -and $total -gt 0) {
    $msg = "[scientific-method] ALL CYCLES COMPLETE ($complete/$total). Fill in Synthesis and Decisions sections in plan.md before stopping."
} else {
    $msg = "[scientific-method] Task incomplete ($complete/$total cycles done, $inProgress in progress, $pending pending). Update progress.md with current status, then read plan.md and continue working on remaining cycles."
}

Write-Output "{`"hookSpecificOutput`":{`"hookEventName`":`"AgentStop`",`"additionalContext`":`"$msg`"}}"
exit 0
