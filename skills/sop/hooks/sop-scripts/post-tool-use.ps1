# sop: Post-tool-use hook

# Ensure UTF-8 encoding for cross-platform compatibility
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$env:PYTHONIOENCODING = "utf-8"
# Reminds the agent to update planning files after every tool use.
# Always exits 0.

$Input = $null
try { $Input = [Console]::In.ReadToEnd() } catch {}

Write-Output '{"hookSpecificOutput":{"hookEventName":"PostToolUse","additionalContext":"[sop] Update progress.md with what you just did. If you discovered new information, update findings.md. If a step is now complete, check it off in plan.md and update Current State."}}'
exit 0
