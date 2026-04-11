# scientific-method: Post-tool-use hook (PowerShell)
# Reminds the agent to update progress.md and plan.md after every tool use.
# Additionally enforces 2-Action Rule for search/browse operations.

$input = $Input | Out-String

try {
    $data = $input | ConvertFrom-Json -ErrorAction SilentlyContinue
    $toolName = $data.toolName
} catch {
    $toolName = ""
}

$msg = "[scientific-method] Update progress.md with what you just did. If a cycle node is now complete, update plan.md Current State."

if ($toolName -match 'search|browse|web|fetch|view|screenshot|image') {
    $counterFile = ".scientific_method_action_count"
    $count = 0
    if (Test-Path $counterFile) {
        $count = [int](Get-Content $counterFile -ErrorAction SilentlyContinue)
    }
    $count++
    Set-Content $counterFile $count

    if ($count % 2 -eq 0) {
        $msg += " Also update findings.md — you have done $count search/browse operations. Write down what you discovered before it's lost from context."
    }
}

$python = if (Get-Command python3 -ErrorAction SilentlyContinue) { "python3" } else { "python" }
$escaped = $msg | & $python -c "import sys,json; print(json.dumps(sys.stdin.read(), ensure_ascii=False))" 2>$null
if (-not $escaped) { $escaped = '""' }

Write-Output "{`"hookSpecificOutput`":{`"hookEventName`":`"PostToolUse`",`"additionalContext`":$escaped}}"
exit 0
