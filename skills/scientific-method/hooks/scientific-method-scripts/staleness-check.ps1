[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$env:PYTHONIOENCODING = "utf-8"
# scientific-method: Staleness check (preToolUse)
# Deny when plan.md/progress.md/findings.md not updated in MAX_STALE seconds.
# Always exits 0.

$hookInput = [Console]::In.ReadToEnd() | ConvertFrom-Json

$MAX_STALE = if ($env:MAX_STALE) { [int]$env:MAX_STALE } else { 120 }

$toolArgs = $hookInput.toolArgs

# Skip when tool targets state files (avoid deny loop when LLM tries to update them)
if ($toolArgs -like "*plan.md*" -or $toolArgs -like "*progress.md*" -or $toolArgs -like "*findings.md*") {
    Write-Output '{}'; exit 0
}

# Final stages gate: when entering Synthesize/Complete, verify all prior steps are complete
if (Test-Path "plan.md") {
    $currentState = (Select-String -Path "plan.md" -Pattern '\*\*Step:\*\*\s*(\S+)' -List | Select-Object -First 1).Matches.Groups[1].Value
    if ($currentState -match '(?i)(synthesize|complete)') {
        $statuses = Select-String -Path "plan.md" -Pattern '\*\*Status:\*\*\s*(\S+)' -AllMatches |
            ForEach-Object { $_.Matches.Groups[1].Value }
        if ($statuses.Count -gt 1) {
            $prior = $statuses[0..($statuses.Count - 2)]
            $incList = @()
            for ($i = 0; $i -lt $prior.Count; $i++) {
                if ($prior[$i] -ne 'complete') {
                    $incList += "Status #$($i+1): $($prior[$i])"
                }
            }
            if ($incList.Count -gt 0) {
                $incStr = $incList -join '; '
                $msg = "QUALITY GATE: Cannot proceed to Synthesize — prior steps/cycles are not complete: ${incStr}. Go back and complete all prior Cycles (Hypothesize -> Predict -> Test -> Conclude) before synthesizing."
                $py = if (Get-Command python3 -ErrorAction SilentlyContinue) { "python3" } else { "python" }
                $escaped = $msg | & $py -c "import sys,json; print(json.dumps(sys.stdin.read().strip(), ensure_ascii=False))" 2>$null
                if (-not $escaped) { $escaped = "`"$msg`"" }
                Write-Output "{`"permissionDecision`":`"deny`",`"permissionDecisionReason`":$escaped}"
                exit 0
            }
        }
        # All prior steps complete — skip staleness check during synthesis
        Write-Output '{}'; exit 0
    }
}

$now = [int][double]::Parse((Get-Date -UFormat %s))

$staleFiles = @()
foreach ($f in @("plan.md", "progress.md", "findings.md")) {
    if (-not (Test-Path $f)) { continue }
    $mtime = [int][double]::Parse((Get-Item $f).LastWriteTimeUtc.Subtract([datetime]'1970-01-01').TotalSeconds.ToString())
    $age = $now - $mtime
    if ($age -gt $MAX_STALE) {
        $staleFiles += "$f(${age}s)"
    }
}

if ($staleFiles.Count -gt 0) {
    $fileList = $staleFiles -join " "
    $msg = "STALENESS: The following files have not been updated in over ${MAX_STALE}s: ${fileList}. Re-read SKILL.md, then check plan.md, progress.md, and findings.md for sections that need updating."
    $py = if (Get-Command python3 -ErrorAction SilentlyContinue) { "python3" } else { "python" }
    $escaped = $msg | & $py -c "import sys,json; print(json.dumps(sys.stdin.read().strip(), ensure_ascii=False))" 2>$null
    if (-not $escaped) { $escaped = "`"$msg`"" }
    Write-Output "{`"permissionDecision`":`"deny`",`"permissionDecisionReason`":$escaped}"
    exit 0
}

Write-Output '{}'
exit 0
