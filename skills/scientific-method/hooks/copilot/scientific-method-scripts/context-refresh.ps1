#!/usr/bin/env pwsh
# scientific-method: Context refresh (preToolUse) — PowerShell
# Every REFRESH_INTERVAL seconds, deny once to remind re-reading AGENTS.md + .squad/
# Skips during Synthesis/Complete.

$ErrorActionPreference = "SilentlyContinue"
$hookInput = [Console]::In.ReadToEnd()

# Parse toolArgs
try {
    $parsed = $hookInput | ConvertFrom-Json
    $toolArgs = $parsed.toolArgs
} catch {
    $toolArgs = ""
}

# Skip when tool targets state/infrastructure files
if ($toolArgs -match "plan\.md|progress\.md|findings\.md|OPERATION\.md|report\.html|\.squad|\.github") {
    Write-Output '{}'
    exit 0
}

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
    $msg = "CONTEXT REFRESH: Re-read AGENTS.md and .squad/ directory now to prevent protocol drift. Do NOT modify .context_refresh_ts manually. After re-reading, your next action will proceed normally."
    $result = @{ permissionDecision = "deny"; permissionDecisionReason = $msg } | ConvertTo-Json -Compress
    Write-Output $result
    exit 0
}

Write-Output '{}'
exit 0
