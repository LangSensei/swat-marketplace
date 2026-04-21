#!/usr/bin/env pwsh
# scientific-method: Context refresh (preToolUse) — PowerShell
# Every REFRESH_INTERVAL seconds, deny once to remind re-reading AGENTS.md + .squad/
# Skips during Synthesis/Complete.

$ErrorActionPreference = "SilentlyContinue"

$REFRESH_INTERVAL = if ($env:REFRESH_INTERVAL) { [int]$env:REFRESH_INTERVAL } else { 300 }
$REFRESH_TS_FILE = ".context_refresh_ts"

# Skip during Synthesis/Complete
if (Test-Path "plan.md") {
    $content = [System.IO.File]::ReadAllText("plan.md", [System.Text.Encoding]::UTF8)
    $csMatch = [regex]::Match($content, "(?s)## Current State(.*?)(?=\r?\n## |\z)")
    $csContent = if ($csMatch.Success) { $csMatch.Groups[1].Value } else { "" }
    $stepM = [regex]::Match($csContent, "\*\*Step:\*\*\s*(.+)")
    if ($stepM.Success) {
        $step = $stepM.Groups[1].Value.Trim()
        if ($step -in @("Synthesis", "Complete")) {
            Write-Output '{}'
            exit 0
        }
    }
}

$now = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()

# First run: initialize
if (-not (Test-Path $REFRESH_TS_FILE)) {
    [System.IO.File]::WriteAllText($REFRESH_TS_FILE, "$now")
    Write-Output '{}'
    exit 0
}

$lastRefresh = [long]([System.IO.File]::ReadAllText($REFRESH_TS_FILE).Trim())
$elapsed = $now - $lastRefresh

if ($elapsed -gt $REFRESH_INTERVAL) {
    [System.IO.File]::WriteAllText($REFRESH_TS_FILE, "$now")
    $msg = "CONTEXT REFRESH: ${elapsed}s since last refresh. Re-read AGENTS.md and all files under .squad/ to prevent protocol drift."
    $result = @{ permissionDecision = "deny"; permissionDecisionReason = $msg } | ConvertTo-Json -Compress
    Write-Output $result
    exit 0
}

Write-Output '{}'
exit 0
