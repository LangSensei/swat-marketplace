#!/usr/bin/env pwsh
# sop: Format check (preToolUse) — PowerShell runtime
# Validates plan.md structure: required section, status values, phase structure, current state.

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

# If plan.md doesn't exist, skip
if (-not (Test-Path "plan.md")) {
    Write-Output '{}'
    exit 0
}

$content = [System.IO.File]::ReadAllText("plan.md", [System.Text.Encoding]::UTF8)

$VALID_STATUSES = @("not_started", "in_progress", "complete")

function Deny($msg) {
    $msg += " Refer to <SKILL_DIR>/templates/plan.md for correct structure."
    $result = @{ permissionDecision = "deny"; permissionDecisionReason = $msg } | ConvertTo-Json -Compress
    Write-Output $result
    exit 0
}

# A. Required section: ## Phases must exist
if ($content -notmatch "(?m)^## Phases") { Deny "FORMAT: plan.md missing required section '## Phases'." }

# B. Validate all Status values
$allStatuses = [regex]::Matches($content, "\*\*Status:\*\*\s*(\S+)") | ForEach-Object { $_.Groups[1].Value }
foreach ($s in $allStatuses) {
    if ($s -notin $VALID_STATUSES) {
        Deny "FORMAT: Invalid status '$s' in plan.md. Must be one of: not_started, in_progress, complete."
    }
}

# C. Phase structure: each ### Phase N: must have Status, Prerequisites, and at least one checklist item
$phaseMatches = [regex]::Matches($content, "(?m)^### Phase \d+")
for ($pi = 0; $pi -lt $phaseMatches.Count; $pi++) {
    $phaseLine = $phaseMatches[$pi].Value
    $phaseStart = $phaseMatches[$pi].Index
    if ($pi -lt $phaseMatches.Count - 1) {
        $phaseEnd = $phaseMatches[$pi + 1].Index
    } else {
        $nextH2 = [regex]::Match($content.Substring($phaseStart + $phaseMatches[$pi].Length), "(?m)^## ")
        if ($nextH2.Success) {
            $phaseEnd = $phaseStart + $phaseMatches[$pi].Length + $nextH2.Index
        } else {
            $phaseEnd = $content.Length
        }
    }
    $phaseContent = $content.Substring($phaseStart, $phaseEnd - $phaseStart)

    if ($phaseContent -notmatch "\*\*Status:\*\*") {
        Deny "FORMAT: $phaseLine missing required **Status:** field."
    }
    if ($phaseContent -notmatch "\*\*Prerequisites:\*\*") {
        Deny "FORMAT: $phaseLine missing required **Prerequisites:** field."
    }
    if ($phaseContent -notmatch "- \[[ x]\]") {
        Deny "FORMAT: $phaseLine must have at least one checklist item (- [ ] or - [x])."
    }
}

# D. Current State: Phase and Step must be non-empty
$csMatch = [regex]::Match($content, "(?s)## Current State(.*?)(?=\r?\n## |\z)")
$csContent = if ($csMatch.Success) { $csMatch.Groups[1].Value } else { "" }

$phaseField = [regex]::Match($csContent, "\*\*Phase:\*\*\s*(.+)")
if ($phaseField.Success) {
    $phaseVal = $phaseField.Groups[1].Value.Trim()
    if ([string]::IsNullOrWhiteSpace($phaseVal)) {
        Deny "FORMAT: Current State **Phase:** must not be empty."
    }
}

$stepField = [regex]::Match($csContent, "\*\*Step:\*\*\s*(.+)")
if ($stepField.Success) {
    $stepVal = $stepField.Groups[1].Value.Trim()
    if ([string]::IsNullOrWhiteSpace($stepVal)) {
        Deny "FORMAT: Current State **Step:** must not be empty."
    }
}

# E. Completion gate: if Current State Phase matches the LAST defined phase, all prior phases' Status must be complete
if ($phaseField.Success -and $phaseMatches.Count -gt 1) {
    $phaseVal = $phaseField.Groups[1].Value.Trim()
    $lastPhaseLine = $phaseMatches[$phaseMatches.Count - 1].Value
    $lastPhaseName = [regex]::Match($lastPhaseLine, "### (.+)").Groups[1].Value.Trim()

    if ($phaseVal -match [regex]::Escape($lastPhaseName) -or $lastPhaseName -match [regex]::Escape($phaseVal)) {
        $priorStatuses = @()
        for ($pi = 0; $pi -lt $phaseMatches.Count - 1; $pi++) {
            $pStart = $phaseMatches[$pi].Index
            $pEnd = $phaseMatches[$pi + 1].Index
            $pContent = $content.Substring($pStart, $pEnd - $pStart)
            $sMatch = [regex]::Match($pContent, "\*\*Status:\*\*\s*(\S+)")
            if ($sMatch.Success) {
                $priorStatuses += $sMatch.Groups[1].Value
            }
        }
        $nonComplete = @()
        for ($i = 0; $i -lt $priorStatuses.Count; $i++) {
            if ($priorStatuses[$i] -ne "complete") {
                $nonComplete += "Phase $($i+1): $($priorStatuses[$i])"
            }
        }
        if ($nonComplete.Count -gt 0) {
            Deny "QUALITY GATE: Cannot proceed to last phase -- prior phases not complete: $($nonComplete -join '; ')."
        }
    }
}

Write-Output '{}'
exit 0
