#!/bin/bash

export PYTHONIOENCODING=utf-8
# scientific-method: Staleness check (preToolUse)
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

# Skip when tool targets state files (avoid deny loop when LLM tries to update them)
case "$TOOL_ARGS" in
    *plan.md*|*progress.md*|*findings.md*)
        echo '{}'; exit 0 ;;
esac

# Final stages gate: when entering Synthesize/Complete, verify all prior steps are complete
if [ -f "plan.md" ]; then
    CURRENT_STATE=$(sed -n '/^## Current State/,/^## /{ /^\*\*Step:\*\*/s/.*\*\*Step:\*\* *//p; /^- \*\*Step:\*\*/s/.*\*\*Step:\*\* *//p; }' plan.md 2>/dev/null)
    case "$CURRENT_STATE" in
        *[Ss]ynthesize*|*[Cc]omplete*)
            # Check all **Status:** fields — all except the last must be "complete"
            STATUSES=$(grep -oP '\*\*Status:\*\*\s*\K\S+' plan.md 2>/dev/null)
            TOTAL=$(echo "$STATUSES" | wc -l)
            if [ "$TOTAL" -gt 1 ]; then
                INCOMPLETE=$(echo "$STATUSES" | head -n $((TOTAL - 1)) | grep -vn '^complete$' | sed 's/:/ /' | while read NUM VAL; do echo "Status #${NUM}: ${VAL}"; done)
                if [ -n "$INCOMPLETE" ]; then
                    INCOMPLETE_LIST=$(echo "$INCOMPLETE" | tr '\n' ';' | sed 's/;$//')
                    MSG="QUALITY GATE: Cannot proceed to ${CURRENT_STATE} — prior steps/cycles are not complete: ${INCOMPLETE_LIST}. Go back and complete all prior Cycles (Hypothesize → Predict → Test → Conclude) before synthesizing."
                    ESCAPED=$($PYTHON -c "import sys,json; print(json.dumps(sys.argv[1], ensure_ascii=False))" "$MSG" 2>/dev/null || echo "\"$MSG\"")
                    echo "{\"permissionDecision\":\"deny\",\"permissionDecisionReason\":$ESCAPED}"
                    exit 0
                fi
            fi
            # All prior steps complete — skip staleness check during synthesis
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
