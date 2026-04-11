# scientific-method: Agent stop hook (PowerShell)
# Checks if the task reached Synthesis. If not, reminds agent to continue.

$input = $Input | Out-String

$planFile = "plan.md"

if (-not (Test-Path $planFile)) {
    Write-Output '{}'
    exit 0
}

$content = Get-Content $planFile -Raw -ErrorAction SilentlyContinue

if ($content -match 'Phase:.*Synthe' -or $content -match 'Phase:.*Conclude') {
    Write-Output '{"hookSpecificOutput":{"hookEventName":"AgentStop","additionalContext":"[scientific-method] Task complete. Ensure plan.md Synthesis and Decisions sections are filled before stopping."}}'
} else {
    Write-Output '{"hookSpecificOutput":{"hookEventName":"AgentStop","additionalContext":"[scientific-method] Task NOT complete. Update progress.md with current status, then read plan.md and continue working on remaining cycles."}}'
}

exit 0
