#!/bin/bash

export PYTHONIOENCODING=utf-8
# sop: Staleness check (preToolUse)
# Deny when plan.md/progress.md/findings.md not updated in MAX_STALE seconds.
# Always exits 0.

INPUT=$(cat)

MAX_STALE="${MAX_STALE:-120}"

PYTHON=$(command -v python3 || command -v python)

# Parse toolArgs via Python (escaped JSON, grep can't handle it)
TOOL_ARGS=$($PYTHON -c "
import sys, json
data = json.loads(sys.stdin.read())
print(data.get('toolArgs', ''))
" <<< "$INPUT" 2>/dev/null)

# Skip when tool targets state/infrastructure files (avoid deny loop)
case "$TOOL_ARGS" in
    *plan.md*|*progress.md*|*findings.md*|*OPERATION.md*|*report.html*|*.squad*|*.github*)
        echo '{}'; exit 0 ;;
esac

# Skip during final stages — if all but last (or all) phases are complete, allow freely
if [ -f "plan.md" ]; then
    PHASE_COUNT=$(grep -c '^### Phase' plan.md 2>/dev/null || echo "0")
    COMPLETE_COUNT=$(grep -c '\*\*Status:\*\* complete' plan.md 2>/dev/null || echo "0")
    if [ "$PHASE_COUNT" -gt 0 ] && [ "$COMPLETE_COUNT" -ge $((PHASE_COUNT - 1)) ]; then
        echo '{}'; exit 0
    fi
fi

NOW=$(date +%s)
STALE_FILES=""
for f in plan.md progress.md findings.md; do
    [ ! -f "$f" ] && continue
    MTIME=$(stat -c %Y "$f" 2>/dev/null || stat -f %m "$f" 2>/dev/null)
    if [ -n "$MTIME" ]; then
        AGE=$((NOW - MTIME))
        [ "$AGE" -gt "$MAX_STALE" ] && STALE_FILES="$STALE_FILES $f(${AGE}s)"
    fi
done

if [ -n "$STALE_FILES" ]; then
    MSG="STALENESS: Not updated in over ${MAX_STALE}s:${STALE_FILES}. Re-read SKILL.md, then check plan.md, progress.md, and findings.md for sections that need updating."
    ESCAPED=$($PYTHON -c "import sys,json; print(json.dumps(sys.argv[1], ensure_ascii=False))" "$MSG" 2>/dev/null || echo "\"$MSG\"")
    echo "{\"permissionDecision\":\"deny\",\"permissionDecisionReason\":$ESCAPED}"
    exit 0
fi

echo '{}'
exit 0
