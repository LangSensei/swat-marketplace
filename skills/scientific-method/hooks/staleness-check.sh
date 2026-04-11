#!/bin/bash
# scientific-method: Staleness check (preToolUse)
# If plan.md or progress.md haven't been updated in MAX_STALE seconds,
# deny the tool call and remind the agent to update files.
# Skips check for read/view of planning files themselves.
# Always exits 0.

INPUT=$(cat)
MAX_STALE=${MAX_STALE:-120}

# Extract tool name from input
TOOL_NAME=$(echo "$INPUT" | grep -o '"toolName"[[:space:]]*:[[:space:]]*"[^"]*"' | head -1 | sed 's/.*"toolName"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/')

# Whitelist: allow reading planning files without triggering staleness
PLAN_FILES="plan\.md|findings\.md|progress\.md|SKILL\.md|PROTOCOL\.md|OPERATOR\.md|CAPTAIN\.md|MANIFEST\.md"
FILE_ARG=$(echo "$INPUT" | grep -oE '"(file_path|path|filePath)"[[:space:]]*:[[:space:]]*"[^"]*"' | head -1 | sed 's/.*:[[:space:]]*"\([^"]*\)".*/\1/')

if [ -n "$FILE_ARG" ]; then
    BASENAME=$(basename "$FILE_ARG")
    if echo "$BASENAME" | grep -qiE "^($PLAN_FILES)$"; then
        echo '{}'
        exit 0
    fi
fi

# Check staleness of plan.md and progress.md
NOW=$(date +%s)
STALE_FILES=""

for f in plan.md progress.md; do
    if [ -f "$f" ]; then
        MTIME=$(stat -c %Y "$f" 2>/dev/null || stat -f %m "$f" 2>/dev/null || echo "$NOW")
        AGE=$(( NOW - MTIME ))
        if [ "$AGE" -gt "$MAX_STALE" ]; then
            STALE_FILES="$STALE_FILES $f(${AGE}s)"
        fi
    fi
done

if [ -n "$STALE_FILES" ]; then
    MSG="[scientific-method] Planning files are stale:$STALE_FILES. Update plan.md (Current State, Cycle status) and progress.md (actions taken) before continuing. Re-read plan.md to refresh your goals."
    ESCAPED_MSG=$(echo "$MSG" | sed 's/"/\\"/g')
    echo "{\"permissionDecision\":\"deny\",\"permissionDecisionReason\":\"$ESCAPED_MSG\"}"
    exit 0
fi

echo '{}'
exit 0
