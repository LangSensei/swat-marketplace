#!/bin/bash

export PYTHONIOENCODING=utf-8
# scientific-method: Context refresh (preToolUse)
# Every REFRESH_INTERVAL seconds, deny once to remind re-reading AGENTS.md + .squad/
# Skips during Synthesize/Complete.
# Always exits 0.

INPUT=$(cat)

REFRESH_INTERVAL="${REFRESH_INTERVAL:-300}"
REFRESH_TS_FILE=".context_refresh_ts"

PYTHON=$(command -v python3 || command -v python)

NOW=$(date +%s)

# Skip during Synthesize/Complete
if [ -f "plan.md" ]; then
    STEP=$($PYTHON -c "
import re, sys
with open('plan.md', 'r') as f:
    m = re.search(r'\*\*Step:\*\*\s*(.+)', f.read())
    print(m.group(1).strip() if m else '')
" 2>/dev/null)
    case "$STEP" in
        Synthesize|Synthesis|Complete)
            echo '{}'; exit 0 ;;
    esac
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
    MSG="CONTEXT REFRESH: ${ELAPSED}s since last refresh. Re-read AGENTS.md and all files under .squad/ to prevent protocol drift."
    ESCAPED=$($PYTHON -c "import sys,json; print(json.dumps(sys.argv[1], ensure_ascii=False))" "$MSG" 2>/dev/null || echo "\"$MSG\"")
    echo "{\"permissionDecision\":\"deny\",\"permissionDecisionReason\":$ESCAPED}"
    exit 0
fi

echo '{}'
exit 0
