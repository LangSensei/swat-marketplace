#!/bin/bash

export PYTHONIOENCODING=utf-8
# sop: Error hook
# Reminds the agent to log errors in progress.md
# Always exits 0

INPUT=$(cat)

PROGRESS_FILE="progress.md"

if [ ! -f "$PROGRESS_FILE" ]; then
    echo '{}'
    exit 0
fi

PYTHON=$(command -v python3 || command -v python)
ERROR_MSG=$($PYTHON -c "
import sys, json
try:
    data = json.load(sys.stdin)
    msg = data.get('error', {}).get('message', '') if isinstance(data.get('error'), dict) else str(data.get('error', ''))
    print(msg[:200])
except:
    print('')
" <<< "$INPUT" 2>/dev/null || echo "")

if [ -n "$ERROR_MSG" ]; then
    CONTEXT="[sop] Error detected: ${ERROR_MSG}. Log this in progress.md under ## Errors with the resolution."
    ESCAPED=$($PYTHON -c "import sys,json; print(json.dumps(sys.stdin.read(), ensure_ascii=False))" <<< "$CONTEXT" 2>/dev/null || echo "\"\"")
    echo "{\"hookSpecificOutput\":{\"hookEventName\":\"ErrorOccurred\",\"additionalContext\":$ESCAPED}}"
else
    echo '{}'
fi

exit 0
