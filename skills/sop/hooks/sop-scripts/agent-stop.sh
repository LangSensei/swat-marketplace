#!/bin/bash
# sop: Agent stop hook
# Counts complete vs total phases in progress.md (Status fields).
# If incomplete, reminds agent to continue.
# Always exits 0.

INPUT=$(cat)

PROGRESS_FILE="progress.md"

if [ ! -f "$PROGRESS_FILE" ]; then
    echo '{}'
    exit 0
fi

TOTAL=$(grep -c '\*\*Status:\*\*' "$PROGRESS_FILE" 2>/dev/null || echo "0")
COMPLETE=$(grep -c '\*\*Status:\*\* complete' "$PROGRESS_FILE" 2>/dev/null || echo "0")
IN_PROGRESS=$(grep -c '\*\*Status:\*\* in_progress' "$PROGRESS_FILE" 2>/dev/null || echo "0")
PENDING=$(grep -c '\*\*Status:\*\* not_started' "$PROGRESS_FILE" 2>/dev/null || echo "0")

: "${TOTAL:=0}"
: "${COMPLETE:=0}"

if [ "$COMPLETE" -eq "$TOTAL" ] && [ "$TOTAL" -gt 0 ]; then
    MSG="[sop] ALL PHASES COMPLETE ($COMPLETE/$TOTAL). Verify plan.md Decisions are filled and all steps checked off before stopping."
else
    MSG="[sop] Task incomplete ($COMPLETE/$TOTAL phases done, $IN_PROGRESS in progress, $PENDING not started). Complete remaining phases before stopping."
fi

PYTHON=$(command -v python3 || command -v python)
ESCAPED=$(echo "$MSG" | $PYTHON -c "import sys,json; print(json.dumps(sys.stdin.read(), ensure_ascii=False))" 2>/dev/null || echo "\"\"")
echo "{\"hookSpecificOutput\":{\"hookEventName\":\"AgentStop\",\"additionalContext\":$ESCAPED}}"
exit 0
