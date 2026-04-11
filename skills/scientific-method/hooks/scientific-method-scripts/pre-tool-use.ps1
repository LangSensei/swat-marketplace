# scientific-method: Pre-tool-use hook (PowerShell)
# Injects the first 30 lines of plan.md to keep goals in context.
# Never blocks tools — always allows.

$input = $Input | Out-String

$planFile = "plan.md"

if (-not (Test-Path $planFile)) {
    Write-Output '{}'
    exit 0
}

$context = Get-Content $planFile -TotalCount 30 -ErrorAction SilentlyContinue | Out-String

if (-not $context) {
    Write-Output '{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"allow"}}'
    exit 0
}

$python = if (Get-Command python3 -ErrorAction SilentlyContinue) { "python3" } else { "python" }
$escaped = $context | & $python -c "import sys,json; print(json.dumps(sys.stdin.read(), ensure_ascii=False))" 2>$null
if (-not $escaped) { $escaped = '""' }

Write-Output "{`"hookSpecificOutput`":{`"hookEventName`":`"PreToolUse`",`"permissionDecision`":`"allow`",`"additionalContext`":$escaped}}"
exit 0
