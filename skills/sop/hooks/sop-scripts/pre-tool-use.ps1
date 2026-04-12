# sop: Pre-tool-use hook

# Ensure UTF-8 encoding for cross-platform compatibility
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$env:PYTHONIOENCODING = "utf-8"
# Injects the first 30 lines of plan.md to keep goals in context.
# Never blocks tools — always allows.
# Always exits 0.

$Input = $null
try { $Input = [Console]::In.ReadToEnd() } catch {}

$PlanFile = "plan.md"

if (-not (Test-Path $PlanFile)) {
    Write-Output '{}'
    exit 0
}

$Context = Get-Content -Path $PlanFile -TotalCount 30 -Encoding UTF8 -ErrorAction SilentlyContinue | Out-String

if (-not $Context) {
    Write-Output '{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"allow"}}'
    exit 0
}

$Python = if (Get-Command python3 -ErrorAction SilentlyContinue) { "python3" } elseif (Get-Command python -ErrorAction SilentlyContinue) { "python" } else { $null }

if ($Python) {
    $Escaped = $Context | & $Python -c "import sys,json; print(json.dumps(sys.stdin.read(), ensure_ascii=False))" 2>$null
} else {
    $Escaped = $Context | ConvertTo-Json
}

Write-Output "{`"hookSpecificOutput`":{`"hookEventName`":`"PreToolUse`",`"permissionDecision`":`"allow`",`"additionalContext`":$Escaped}}"
exit 0
