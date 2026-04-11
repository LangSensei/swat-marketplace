# scientific-method: Post-tool-use hook (PowerShell)
# Reminds the agent to update planning files after every tool use.

$input = $Input | Out-String

Write-Output '{"hookSpecificOutput":{"hookEventName":"PostToolUse","additionalContext":"[scientific-method] Update progress.md with what you just did. If you discovered new information, update findings.md. If a cycle node is now complete, update plan.md Current State."}}'
exit 0
