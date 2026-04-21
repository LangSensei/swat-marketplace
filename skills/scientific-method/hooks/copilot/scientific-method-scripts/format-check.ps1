#!/usr/bin/env pwsh
# scientific-method: Format check (preToolUse) — PowerShell runtime
# Validates plan.md structure: required sections, status values, cycle completeness, current state.

$ErrorActionPreference = "SilentlyContinue"
$input_data = $input | Out-String

# Parse toolArgs
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

# If plan.md doesn't exist, skip
if (-not (Test-Path "plan.md")) {
    Write-Output '{}'
    exit 0
}

$content = [System.IO.File]::ReadAllText("plan.md", [System.Text.Encoding]::UTF8)

$VALID_STATUSES = @("not_started", "in_progress", "complete")

function Deny($msg) {
    $escaped = $msg | ConvertTo-Json
    $result = @{ permissionDecision = "deny"; permissionDecisionReason = $msg } | ConvertTo-Json -Compress
    Write-Output $result
    exit 0
}

# A. Check required sections
if ($content -notmatch "(?m)^## Understand") { Deny "FORMAT: plan.md missing required section '## Understand'." }
if ($content -notmatch "(?m)^## Decompose") { Deny "FORMAT: plan.md missing required section '## Decompose'." }
if ($content -notmatch "(?m)^## Synthes") { Deny "FORMAT: plan.md missing required section '## Synthesis' (or '## Synthesize')." }

# B. Validate all Status values
$allStatuses = [regex]::Matches($content, "\*\*Status:\*\*\s*(\S+)") | ForEach-Object { $_.Groups[1].Value }
foreach ($s in $allStatuses) {
    if ($s -notin $VALID_STATUSES) {
        Deny "FORMAT: Invalid status '$s' in plan.md. Must be one of: not_started, in_progress, complete."
    }
}

# C. If Decompose complete, check Cycles
$decomposeMatch = [regex]::Match($content, "(?s)## Decompose\s*\n(.*?)(?=\n## |\z)")
if ($decomposeMatch.Success) {
    $decomposeContent = $decomposeMatch.Groups[1].Value
    $dsMatch = [regex]::Match($decomposeContent, "\*\*Status:\*\*\s*(\S+)")
    $decomposeStatus = if ($dsMatch.Success) { $dsMatch.Groups[1].Value } else { "not_started" }

    if ($decomposeStatus -eq "complete") {
        $cycleMatches = [regex]::Matches($content, "(?m)^## (Cycle \d+)")
        if ($cycleMatches.Count -eq 0) {
            Deny "FORMAT: Decompose is complete but no '## Cycle N' sections found in plan.md."
        }
    }
}

# D. Current State validation
# D. Current State validation — extract Step from ## Current State section only
$csMatch = [regex]::Match($content, "(?s)## Current State(.*?)(?=\r?\n## |\z)")
$csContent = if ($csMatch.Success) { $csMatch.Groups[1].Value } else { "" }
$stepMatch = [regex]::Match($csContent, "\*\*Step:\*\*\s*(.+)")
if ($stepMatch.Success) {
    $step = $stepMatch.Groups[1].Value.Trim()
    $validTop = @("Understand", "Decompose", "Synthesize", "Synthesis", "Complete")
    $cyclePattern = $step -match "^Cycle \d+ - (Hypothesize|Predict|Test|Conclude)$"
    if ($step -notin $validTop -and -not $cyclePattern) {
        Deny "FORMAT: Invalid Current State Step '$step'. Must be Understand, Decompose, Synthesize, Complete, or 'Cycle N - Hypothesize/Predict/Test/Conclude'."
    }

    # E. Synthesize gate
    if ($step -in @("Synthesize", "Synthesis", "Complete")) {
        $nonComplete = @()
        for ($i = 0; $i -lt $allStatuses.Count; $i++) {
            if ($allStatuses[$i] -ne "complete") {
                $nonComplete += "Status #$($i+1): $($allStatuses[$i])"
            }
        }
        if ($nonComplete.Count -gt 0) {
            Deny "QUALITY GATE: Cannot proceed to $step - prior steps not complete: $($nonComplete -join '; ')."
        }
    }
}

Write-Output '{}'
exit 0
