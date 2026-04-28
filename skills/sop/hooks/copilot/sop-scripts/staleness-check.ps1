[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$env:PYTHONIOENCODING = "utf-8"
# sop: Staleness check (preToolUse)
# Deny when plan.md/progress.md/findings.md not updated in MAX_STALE seconds.
# Always exits 0.

$hookInput = [Console]::In.ReadToEnd() | ConvertFrom-Json

$MAX_STALE = if ($env:MAX_STALE) { [int]$env:MAX_STALE } else { 120 }

$toolArgs = $hookInput.toolArgs

# Skip when tool targets state/infrastructure files (avoid deny loop)
if ($toolArgs -match "plan\.md|progress\.md|findings\.md|OPERATION\.md|report\.html|\.squad|\.github") {
    Write-Output '{}'; exit 0
}

# Skip during final stages — if all but last (or all) phases are complete, allow freely
if (Test-Path "plan.md") {
    $phaseCount = (Select-String -Path "plan.md" -Pattern '^### Phase' | Measure-Object).Count
    $completeCount = (Select-String -Path "plan.md" -Pattern '\*\*Status:\*\* complete' | Measure-Object).Count
    if ($phaseCount -gt 0 -and $completeCount -ge ($phaseCount - 1)) {
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
    $msg = "STALENESS: Working files not updated in over ${MAX_STALE}s: ${fileList}. Update your working files with real progress NOW. Refer to <SKILL_DIR>/templates/ for what goes where. Do NOT touch/reset file timestamps -- write actual content."
    $py = if (Get-Command python3 -ErrorAction SilentlyContinue) { "python3" } else { "python" }
    $escaped = $msg | & $py -c "import sys,json; print(json.dumps(sys.stdin.read().strip(), ensure_ascii=False))" 2>$null
    if (-not $escaped) { $escaped = "`"$msg`"" }
    Write-Output "{`"permissionDecision`":`"deny`",`"permissionDecisionReason`":$escaped}"
    exit 0
}

Write-Output '{}'
exit 0
