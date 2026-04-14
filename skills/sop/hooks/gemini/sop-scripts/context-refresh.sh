#!/bin/bash

export PYTHONIOENCODING=utf-8
# sop: Context refresh (BeforeTool) — Gemini CLI
# Every REFRESH_INTERVAL seconds, deny once to remind re-reading AGENTS.md + .squad/
# Always exits 0.

INPUT=$(cat)

REFRESH_INTERVAL="${REFRESH_INTERVAL:-300}"
REFRESH_TS_FILE=".context_refresh_ts"

PYTHON=$(command -v python3 || command -v python)

NOW=$(date +%s)

# Skip during final stages — if all but last (or all) phases are complete, allow freely
if [ -f "plan.md" ]; then
    PHASE_COUNT=$($PYTHON -c "
import re
with open('plan.md') as f:
    print(len(re.findall(r'^### Phase', f.read(), re.MULTILINE)))
" 2>/dev/null || echo "0")
    COMPLETE_COUNT=$($PYTHON -c "
import re
with open('plan.md') as f:
    print(len(re.findall(r'\*\*Status:\*\* complete', f.read())))
" 2>/dev/null || echo "0")
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
    MSG="CONTEXT REFRESH: ${ELAPSED}s since last refresh. Re-read AGENTS.md and all files under .squad/ to prevent protocol drift."
    ESCAPED=$($PYTHON -c "import sys,json; print(json.dumps(sys.argv[1], ensure_ascii=False))" "$MSG" 2>/dev/null || echo "\"$MSG\"")
    echo "{\"decision\":\"deny\",\"reason\":$ESCAPED}"
    exit 0
fi

echo '{}'
exit 0
