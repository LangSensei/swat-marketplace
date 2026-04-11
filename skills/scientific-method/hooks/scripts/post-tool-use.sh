#!/bin/bash
# scientific-method: Post-tool-use hook
# Reminds the agent to update progress.md and plan.md after every tool use.
# Additionally enforces 2-Action Rule for search/browse operations.
# Always exits 0.

INPUT=$(cat)

TOOL_NAME=$(echo "$INPUT" | grep -o '"toolName"[[:space:]]*:[[:space:]]*"[^"]*"' | head -1 | sed 's/.*"toolName"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/')

MSG="[scientific-method] Update progress.md with what you just did. If a cycle node is now complete, update plan.md Current State."

# Extra reminder for search/browse tools (2-Action Rule)
if echo "$TOOL_NAME" | grep -qiE "search|browse|web|fetch|view|screenshot|image"; then
    COUNTER_FILE=".scientific_method_action_count"
    COUNT=0
    if [ -f "$COUNTER_FILE" ]; then
        COUNT=$(cat "$COUNTER_FILE" 2>/dev/null || echo "0")
    fi
    COUNT=$((COUNT + 1))
    echo "$COUNT" > "$COUNTER_FILE"

    if [ $((COUNT % 2)) -eq 0 ]; then
        MSG="$MSG Also update findings.md — you have done $COUNT search/browse operations. Write down what you discovered before it's lost from context."
    fi
fi

PYTHON=$(command -v python3 || command -v python)
ESCAPED=$(echo "$MSG" | $PYTHON -c "import sys,json; print(json.dumps(sys.stdin.read(), ensure_ascii=False))" 2>/dev/null || echo "\"\"")

echo "{\"hookSpecificOutput\":{\"hookEventName\":\"PostToolUse\",\"additionalContext\":$ESCAPED}}"
exit 0
