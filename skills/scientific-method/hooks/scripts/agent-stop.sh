#!/bin/bash
# scientific-method: Agent stop hook
# Counts complete vs total cycles in plan.md Decompose table.
# If incomplete, reminds agent to continue.
# Always exits 0.

INPUT=$(cat)

PLAN_FILE="plan.md"

if [ ! -f "$PLAN_FILE" ]; then
    echo '{}'
    exit 0
fi

# Count cycle statuses from the Decompose table
TOTAL=$(grep -cE '^\|[[:space:]]*[0-9]+' "$PLAN_FILE" 2>/dev/null || echo "0")
COMPLETE=$(grep -cE '^\|.*\|[[:space:]]*complete[[:space:]]*\|' "$PLAN_FILE" 2>/dev/null || echo "0")
IN_PROGRESS=$(grep -cE '^\|.*\|[[:space:]]*in_progress[[:space:]]*\|' "$PLAN_FILE" 2>/dev/null || echo "0")
PENDING=$(grep -cE '^\|.*\|[[:space:]]*pending[[:space:]]*\|' "$PLAN_FILE" 2>/dev/null || echo "0")

: "${TOTAL:=0}"
: "${COMPLETE:=0}"

if [ "$COMPLETE" -eq "$TOTAL" ] && [ "$TOTAL" -gt 0 ]; then
    MSG="[scientific-method] ALL CYCLES COMPLETE ($COMPLETE/$TOTAL). Fill in Synthesis and Decisions sections in plan.md before stopping."
else
    MSG="[scientific-method] Task incomplete ($COMPLETE/$TOTAL cycles done, $IN_PROGRESS in progress, $PENDING pending). Update progress.md with current status, then read plan.md and continue working on remaining cycles."
fi

echo "{\"hookSpecificOutput\":{\"hookEventName\":\"AgentStop\",\"additionalContext\":\"$MSG\"}}"
exit 0
