#!/bin/bash

export PYTHONIOENCODING=utf-8
# scientific-method: Staleness check (preToolUse)
# Deny when plan.md/progress.md/findings.md not updated in MAX_STALE seconds.
# Skips during Synthesis/Complete (format-check handles that gate).
# Always exits 0.

INPUT=$(cat)

MAX_STALE="${MAX_STALE:-120}"

PYTHON=$(command -v python3 || command -v python)

# Parse toolArgs via Python
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

# Skip during Synthesis/Complete — no staleness pressure needed
if [ -f "plan.md" ]; then
    STEP=$($PYTHON -c "
import re
with open('plan.md', 'r') as f:
    content = f.read()
cs = re.search(r'(?s)## Current State(.*?)(?=\n## |\Z)', content)
m = re.search(r'\*\*Step:\*\*\s*(.+)', cs.group(1)) if cs else None
print(m.group(1).strip() if m else '')
" 2>/dev/null)
    case "$STEP" in
        Synthesis|Complete)
            echo '{}'; exit 0 ;;
    esac
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
