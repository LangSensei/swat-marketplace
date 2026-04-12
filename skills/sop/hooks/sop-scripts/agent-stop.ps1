# sop: Agent stop hook

# Ensure UTF-8 encoding for cross-platform compatibility
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$env:PYTHONIOENCODING = "utf-8"
# Counts complete vs total phases in progress.md (Status fields).
# If incomplete, reminds agent to continue.
# Always exits 0.

$Input = $null
try { $Input = [Console]::In.ReadToEnd() } catch {}

$ProgressFile = "progress.md"

if (-not (Test-Path $ProgressFile)) {
    Write-Output '{}'
    exit 0
}

$Content = Get-Content -Path $ProgressFile -Raw -Encoding UTF8 -ErrorAction SilentlyContinue
$Total = ([regex]::Matches($Content, '\*\*Status:\*\*')).Count
$Complete = ([regex]::Matches($Content, '\*\*Status:\*\* complete')).Count
$InProgress = ([regex]::Matches($Content, '\*\*Status:\*\* in_progress')).Count
$Pending = ([regex]::Matches($Content, '\*\*Status:\*\* not_started')).Count

if ($Complete -eq $Total -and $Total -gt 0) {
    $Msg = "[sop] ALL PHASES COMPLETE ($Complete/$Total). Verify plan.md Decisions are filled and all steps checked off before stopping."
} else {
    $Msg = "[sop] Task incomplete ($Complete/$Total phases done, $InProgress in progress, $Pending not started). Complete remaining phases before stopping."
}

$Python = if (Get-Command python3 -ErrorAction SilentlyContinue) { "python3" } elseif (Get-Command python -ErrorAction SilentlyContinue) { "python" } else { $null }

if ($Python) {
    $Escaped = $Msg | & $Python -c "import sys,json; print(json.dumps(sys.stdin.read(), ensure_ascii=False))" 2>$null
} else {
    $Escaped = $Msg | ConvertTo-Json
}

Write-Output "{`"hookSpecificOutput`":{`"hookEventName`":`"AgentStop`",`"additionalContext`":$Escaped}}"
exit 0
