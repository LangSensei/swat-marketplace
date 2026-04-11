#!/bin/bash
# scientific-method: Agent stop hook
# Counts complete vs total steps in progress.md (Status fields).
# If incomplete, reminds agent to continue.
# Always exits 0.

INPUT=$(cat)

PROGRESS_FILE="progress.md"

if [ ! -f "$PROGRESS_FILE" ]; then
    echo '{}'
    exit 0
fi

# Count status from **Status:** fields in progress.md
TOTAL=$(grep -c '\*\*Status:\*\*' "$PROGRESS_FILE" 2>/dev/null || echo "0")
COMPLETE=$(grep -c '\*\*Status:\*\* complete' "$PROGRESS_FILE" 2>/dev/null || echo "0")
IN_PROGRESS=$(grep -c '\*\*Status:\*\* in_progress' "$PROGRESS_FILE" 2>/dev/null || echo "0")
PENDING=$(grep -c '\*\*Status:\*\* pending' "$PROGRESS_FILE" 2>/dev/null || echo "0")

: "${TOTAL:=0}"
: "${COMPLETE:=0}"

if [ "$COMPLETE" -eq "$TOTAL" ] && [ "$TOTAL" -gt 0 ]; then
    MSG="[scientific-method] ALL STEPS COMPLETE ($COMPLETE/$TOTAL). Ensure plan.md Synthesis and Decisions are filled before stopping."
else
    MSG="[scientific-method] Task incomplete ($COMPLETE/$TOTAL steps done, $IN_PROGRESS in progress, $PENDING pending). Update progress.md, then read plan.md and continue."
fi

PYTHON=$(command -v python3 || command -v python)
ESCAPED=$(echo "$MSG" | $PYTHON -c "import sys,json; print(json.dumps(sys.stdin.read(), ensure_ascii=False))" 2>/dev/null || echo "\"\"")
echo "{\"hookSpecificOutput\":{\"hookEventName\":\"AgentStop\",\"additionalContext\":$ESCAPED}}"
exit 0
