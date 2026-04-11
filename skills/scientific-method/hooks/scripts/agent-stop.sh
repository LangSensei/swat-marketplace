#!/bin/bash
# scientific-method: Agent stop hook
# Checks if the task reached Synthesis. If not, reminds agent to continue.
# Always exits 0.

INPUT=$(cat)

PLAN_FILE="plan.md"

if [ ! -f "$PLAN_FILE" ]; then
    echo '{}'
    exit 0
fi

# Check if Current State indicates completion
if grep -q "Phase:.*Synthe" "$PLAN_FILE" 2>/dev/null; then
    echo '{"hookSpecificOutput":{"hookEventName":"AgentStop","additionalContext":"[scientific-method] Task complete. Ensure plan.md Synthesis and Decisions sections are filled before stopping."}}'
elif grep -q "Phase:.*Conclude" "$PLAN_FILE" 2>/dev/null; then
    echo '{"hookSpecificOutput":{"hookEventName":"AgentStop","additionalContext":"[scientific-method] Task complete. Ensure plan.md Synthesis and Decisions sections are filled before stopping."}}'
else
    echo '{"hookSpecificOutput":{"hookEventName":"AgentStop","additionalContext":"[scientific-method] Task NOT complete. Update progress.md with current status, then read plan.md and continue working on remaining cycles."}}'
fi

exit 0
