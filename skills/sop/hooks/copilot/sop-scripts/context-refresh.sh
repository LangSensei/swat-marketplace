#!/bin/bash

export PYTHONIOENCODING=utf-8
# sop: Context refresh (preToolUse)
# Every REFRESH_INTERVAL seconds, deny once to remind re-reading AGENTS.md + .squad/
# Always exits 0.

INPUT=$(cat)

REFRESH_INTERVAL="${REFRESH_INTERVAL:-300}"
REFRESH_TS_FILE=".context_refresh_ts"

PYTHON=$(command -v python3 || command -v python)

# Parse toolArgs via Python
TOOL_ARGS=$($PYTHON -c "
import sys, json
data = json.loads(sys.stdin.read())
print(data.get('toolArgs', ''))
" <<< "$INPUT" 2>/dev/null)

# Skip when tool targets state/infrastructure files
case "$TOOL_ARGS" in
    *plan.md*|*progress.md*|*findings.md*|*OPERATION.md*|*report.html*|*.squad*|*.github*)
        echo '{}'; exit 0 ;;
esac

NOW=$(date +%s)

# Skip during final stages — if all but last (or all) phases are complete, allow freely
if [ -f "plan.md" ]; then
    PHASE_COUNT=$(grep -c '^### Phase' plan.md 2>/dev/null || echo "0")
    COMPLETE_COUNT=$(grep -c '\*\*Status:\*\* complete' plan.md 2>/dev/null || echo "0")
    if [ "$PHASE_COUNT" -gt 0 ] && [ "$COMPLETE_COUNT" -ge $((PHASE_COUNT - 1)) ]; then
        echo '{}'; exit 0
    fi
fi

# First run: initialize timestamp, don't deny
if [ ! -f "$REFRESH_TS_FILE" ]; then
    echo "$NOW" > "$REFRESH_TS_FILE"
    echo '{}'
    exit 0
fi

LAST_REFRESH=$(cat "$REFRESH_TS_FILE" 2>/dev/null || echo "0")

ELAPSED=$((NOW - LAST_REFRESH))
if [ "$ELAPSED" -gt "$REFRESH_INTERVAL" ]; then
    echo "$NOW" > "$REFRESH_TS_FILE"
    MSG="CONTEXT REFRESH: Re-read AGENTS.md and .squad/ directory now to prevent protocol drift. Do NOT modify .context_refresh_ts manually. After re-reading, your next action will proceed normally."
    PYTHON=$(command -v python3 || command -v python)
    ESCAPED=$($PYTHON -c "import sys,json; print(json.dumps(sys.argv[1], ensure_ascii=False))" "$MSG" 2>/dev/null || echo "\"$MSG\"")
    echo "{\"permissionDecision\":\"deny\",\"permissionDecisionReason\":$ESCAPED}"
    exit 0
fi

echo '{}'
exit 0
