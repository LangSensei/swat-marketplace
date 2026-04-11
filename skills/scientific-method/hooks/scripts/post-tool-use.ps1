# scientific-method: Post-tool-use hook (PowerShell)
# Reminds the agent to update planning files after every tool use.

$input = $Input | Out-String

# Only inject if framework is active
if (-not (Test-Path "plan.md") -and -not (Test-Path "progress.md")) {
    Write-Output '{}'
    exit 0
}

Write-Output '{"hookSpecificOutput":{"hookEventName":"PostToolUse","additionalContext":"[scientific-method] Update progress.md with what you just did. If you discovered new information, update findings.md. If a cycle step is now complete, update plan.md Current State."}}'
exit 0
