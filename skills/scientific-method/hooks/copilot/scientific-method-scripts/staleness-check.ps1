#!/usr/bin/env pwsh
# scientific-method: Staleness check (preToolUse) — PowerShell
# Deny when plan.md/progress.md/findings.md not updated in MAX_STALE seconds.
# Skips during Synthesize/Complete.

$ErrorActionPreference = "SilentlyContinue"
$input_data = $input | Out-String

$MAX_STALE = if ($env:MAX_STALE) { [int]$env:MAX_STALE } else { 120 }

try {
    $parsed = $input_data | ConvertFrom-Json
    $toolArgs = $parsed.toolArgs
} catch {
    $toolArgs = ""
}

# Skip when tool targets state files
if ($toolArgs -match "plan\.md|progress\.md|findings\.md") {
    Write-Output '{}'
    exit 0
}

# Skip during Synthesize/Complete
if (Test-Path "plan.md") {
    $content = [System.IO.File]::ReadAllText("plan.md", [System.Text.Encoding]::UTF8)
    $csMatch = [regex]::Match($content, "(?s)## Current State(.*?)(?=\r?\n## |\z)")
    $csContent = if ($csMatch.Success) { $csMatch.Groups[1].Value } else { "" }
    $stepM = [regex]::Match($csContent, "\*\*Step:\*\*\s*(.+)")
    if ($stepM.Success) {
        $step = $stepM.Groups[1].Value.Trim()
        if ($step -in @("Synthesize", "Synthesis", "Complete")) {
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
    $msg = "STALENESS: Not updated in over ${MAX_STALE}s: $($staleFiles -join ' '). Re-read SKILL.md, then check plan.md, progress.md, and findings.md for sections that need updating."
    $result = @{ permissionDecision = "deny"; permissionDecisionReason = $msg } | ConvertTo-Json -Compress
    Write-Output $result
    exit 0
}

Write-Output '{}'
exit 0
