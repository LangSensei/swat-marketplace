#!/usr/bin/env pwsh
# scientific-method: Format check (preToolUse) — PowerShell runtime
# Validates plan.md structure: required sections, status values, cycle completeness, current state.

$ErrorActionPreference = "SilentlyContinue"
$hookInput = $Input | Out-String

# Parse toolArgs
try {
    $parsed = $hookInput | ConvertFrom-Json
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
    $result = @{ permissionDecision = "deny"; permissionDecisionReason = $msg } | ConvertTo-Json -Compress
    Write-Output $result
    exit 0
}

# A. Check required sections
if ($content -notmatch "(?m)^## Observation") { Deny "FORMAT: plan.md missing required section '## Observation'." }
if ($content -notmatch "(?m)^## Decomposition") { Deny "FORMAT: plan.md missing required section '## Decomposition'." }
if ($content -notmatch "(?m)^## Synthes") { Deny "FORMAT: plan.md missing required section '## Synthesis'." }

# B. Validate all Status values
$allStatuses = [regex]::Matches($content, "\*\*Status:\*\*\s*(\S+)") | ForEach-Object { $_.Groups[1].Value }
foreach ($s in $allStatuses) {
    if ($s -notin $VALID_STATUSES) {
        Deny "FORMAT: Invalid status '$s' in plan.md. Must be one of: not_started, in_progress, complete."
    }
}

# C. If Decomposition complete, check Cycles
$decomposeMatch = [regex]::Match($content, "(?s)## Decomposition\s*\n(.*?)(?=\n## |\z)")
if ($decomposeMatch.Success) {
    $decomposeContent = $decomposeMatch.Groups[1].Value
    $dsMatch = [regex]::Match($decomposeContent, "\*\*Status:\*\*\s*(\S+)")
    $decomposeStatus = if ($dsMatch.Success) { $dsMatch.Groups[1].Value } else { "not_started" }

    if ($decomposeStatus -eq "complete") {
        $cycleMatches = [regex]::Matches($content, "(?m)^## (Cycle \d+)")
        if ($cycleMatches.Count -eq 0) {
            Deny "FORMAT: Decomposition is complete but no '## Cycle N' sections found in plan.md."
        }

        # Check each cycle has required subsections and status fields
        $requiredSubs = @("Hypothesis", "Prediction", "Test", "Conclusion")
        for ($ci = 0; $ci -lt $cycleMatches.Count; $ci++) {
            $cycleName = $cycleMatches[$ci].Groups[1].Value
            $cycleStart = $cycleMatches[$ci].Index
            if ($ci -lt $cycleMatches.Count - 1) {
                $cycleEnd = $cycleMatches[$ci + 1].Index
            } else {
                $nextH2 = [regex]::Match($content.Substring($cycleStart + $cycleMatches[$ci].Length), "(?m)^## ")
                if ($nextH2.Success) {
                    $cycleEnd = $cycleStart + $cycleMatches[$ci].Length + $nextH2.Index
                } else {
                    $cycleEnd = $content.Length
                }
            }
            $cycleContent = $content.Substring($cycleStart, $cycleEnd - $cycleStart)

            $subs = [regex]::Matches($cycleContent, "(?m)^### (\w+)") | ForEach-Object { $_.Groups[1].Value }
            foreach ($req in $requiredSubs) {
                if ($req -notin $subs) {
                    Deny "FORMAT: $cycleName missing required subsection '### $req'."
                }
            }

            $subStatuses = [regex]::Matches($cycleContent, "\*\*Status:\*\*\s*(\S+)")
            if ($subStatuses.Count -lt $requiredSubs.Count) {
                Deny "FORMAT: $cycleName has subsections without **Status:** fields."
            }
        }
    }
}

# D. Current State validation — extract Step from ## Current State section only
$csMatch = [regex]::Match($content, "(?s)## Current State(.*?)(?=\r?\n## |\z)")
$csContent = if ($csMatch.Success) { $csMatch.Groups[1].Value } else { "" }
$stepMatch = [regex]::Match($csContent, "\*\*Step:\*\*\s*(.+)")
if ($stepMatch.Success) {
    $step = $stepMatch.Groups[1].Value.Trim()
    $validTop = @("Observation", "Decomposition", "Synthesis", "Complete")
    $cyclePattern = $step -match "^Cycle \d+ - (Hypothesis|Prediction|Test|Conclusion)$"
    if ($step -notin $validTop -and -not $cyclePattern) {
        Deny "FORMAT: Invalid Current State Step '$step'. Must be Observation, Decomposition, Synthesis, Complete, or 'Cycle N - Hypothesis/Prediction/Test/Conclusion'."
    }

    # E. Synthesis gate
    if ($step -in @("Synthesis", "Complete")) {
        $nonComplete = @()
        for ($i = 0; $i -lt $allStatuses.Count; $i++) {
            if ($allStatuses[$i] -ne "complete") {
                $nonComplete += "Status #$($i+1): $($allStatuses[$i])"
            }
        }
        if ($nonComplete.Count -gt 0) {
            Deny "QUALITY GATE: Cannot proceed to $step \u2014 prior steps not complete: $($nonComplete -join '; ')."
        }
    }
}

Write-Output '{}'
exit 0
