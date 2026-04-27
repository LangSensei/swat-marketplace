#!/usr/bin/env pwsh
# scientific-method: Staleness check (preToolUse) — PowerShell
# Deny when plan.md/progress.md/findings.md not updated in MAX_STALE seconds.
# Skips during Synthesis/Complete.

$ErrorActionPreference = "SilentlyContinue"
$hookInput = [Console]::In.ReadToEnd()

$MAX_STALE = if ($env:MAX_STALE) { [int]$env:MAX_STALE } else { 120 }

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
$staleFiles = @()

foreach ($f in @("plan.md", "progress.md", "findings.md")) {
    if (-not (Test-Path $f)) { continue }
    $mtime = [DateTimeOffset]::new((Get-Item $f).LastWriteTimeUtc).ToUnixTimeSeconds()
    $age = $now - $mtime
    if ($age -gt $MAX_STALE) {
        $staleFiles += "$f(${age}s)"
    }
}

if ($staleFiles.Count -gt 0) {
    $msg = "STALENESS: Working files not updated in over ${MAX_STALE}s: $($staleFiles -join ' '). Update your working files with real progress NOW. Refer to <SKILL_DIR>/templates/ for what goes where. Do NOT touch/reset file timestamps — write actual content."
    $result = @{ permissionDecision = "deny"; permissionDecisionReason = $msg } | ConvertTo-Json -Compress
    Write-Output $result
    exit 0
}

Write-Output '{}'
exit 0
