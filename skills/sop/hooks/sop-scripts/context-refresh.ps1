[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$env:PYTHONIOENCODING = "utf-8"
# sop: Context refresh (preToolUse)
# Every REFRESH_INTERVAL seconds, deny once to remind re-reading AGENTS.md + .squad/
# Always exits 0.

$hookInput = [Console]::In.ReadToEnd() | ConvertFrom-Json

$REFRESH_INTERVAL = if ($env:REFRESH_INTERVAL) { [int]$env:REFRESH_INTERVAL } else { 300 }
$REFRESH_TS_FILE = ".context_refresh_ts"

$now = [int][double]::Parse((Get-Date -UFormat %s))

# Skip during final stages — if all but last (or all) phases are complete, allow freely
if (Test-Path "plan.md") {
    $phaseCount = (Select-String -Path "plan.md" -Pattern '^### Phase' | Measure-Object).Count
    $completeCount = (Select-String -Path "plan.md" -Pattern '\*\*Status:\*\* complete' | Measure-Object).Count
    if ($phaseCount -gt 0 -and $completeCount -ge ($phaseCount - 1)) {
        Write-Output '{}'; exit 0
    }
}

# First run: initialize timestamp, don't deny
if (-not (Test-Path $REFRESH_TS_FILE)) {
    Set-Content -Path $REFRESH_TS_FILE -Value $now -NoNewline
    Write-Output '{}'
    exit 0
}

$lastRefresh = [int](Get-Content $REFRESH_TS_FILE -ErrorAction SilentlyContinue)

$elapsed = $now - $lastRefresh
if ($elapsed -gt $REFRESH_INTERVAL) {
    Set-Content -Path $REFRESH_TS_FILE -Value $now -NoNewline
    $msg = "CONTEXT REFRESH: ${elapsed}s since last refresh. Re-read AGENTS.md and all files under .squad/ to prevent protocol drift."
    $py = if (Get-Command python3 -ErrorAction SilentlyContinue) { "python3" } else { "python" }
    $escaped = $msg | & $py -c "import sys,json; print(json.dumps(sys.stdin.read().strip(), ensure_ascii=False))" 2>$null
    if (-not $escaped) { $escaped = "`"$msg`"" }
    Write-Output "{`"permissionDecision`":`"deny`",`"permissionDecisionReason`":$escaped}"
    exit 0
}

Write-Output '{}'
exit 0
