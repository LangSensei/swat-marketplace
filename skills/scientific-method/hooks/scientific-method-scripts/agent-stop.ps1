# scientific-method: Agent stop hook (PowerShell)

# Ensure UTF-8 encoding for cross-platform compatibility
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$env:PYTHONIOENCODING = "utf-8"
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

$python = if (Get-Command python3 -ErrorAction SilentlyContinue) { "python3" } else { "python" }
$escaped = $msg | & $python -c "import sys,json; print(json.dumps(sys.stdin.read(), ensure_ascii=False))" 2>$null
if (-not $escaped) { $escaped = '""' }

Write-Output "{`"hookSpecificOutput`":{`"hookEventName`":`"AgentStop`",`"additionalContext`":$escaped}}"
exit 0
