#!/bin/bash
# sop: Pre-tool-use hook
# Injects the first 30 lines of plan.md to keep goals in context.
# Never blocks tools — always allows.
# Always exits 0.

INPUT=$(cat)

PLAN_FILE="plan.md"

if [ ! -f "$PLAN_FILE" ]; then
    echo '{}'
    exit 0
fi

CONTEXT=$(head -30 "$PLAN_FILE" 2>/dev/null || echo "")

if [ -z "$CONTEXT" ]; then
    echo '{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"allow"}}'
    exit 0
fi

PYTHON=$(command -v python3 || command -v python)
ESCAPED=$(echo "$CONTEXT" | $PYTHON -c "import sys,json; print(json.dumps(sys.stdin.read(), ensure_ascii=False))" 2>/dev/null || echo "\"\"")

echo "{\"hookSpecificOutput\":{\"hookEventName\":\"PreToolUse\",\"permissionDecision\":\"allow\",\"additionalContext\":$ESCAPED}}"
exit 0
