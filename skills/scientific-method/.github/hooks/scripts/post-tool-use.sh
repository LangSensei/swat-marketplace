#!/bin/bash
# scientific-method: Post-tool-use hook
# Lightweight reminder to update findings after search/browse operations.
# Tracks action count for 2-Action Rule enforcement.
# Always exits 0.

INPUT=$(cat)

TOOL_NAME=$(echo "$INPUT" | grep -o '"toolName"[[:space:]]*:[[:space:]]*"[^"]*"' | head -1 | sed 's/.*"toolName"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/')

# Check if this is a search/browse/view tool
if echo "$TOOL_NAME" | grep -qiE "search|browse|web|fetch|view|screenshot|image"; then
    COUNTER_FILE=".scientific_method_action_count"
    COUNT=0
    if [ -f "$COUNTER_FILE" ]; then
        COUNT=$(cat "$COUNTER_FILE" 2>/dev/null || echo "0")
    fi
    COUNT=$((COUNT + 1))
    echo "$COUNT" > "$COUNTER_FILE"

    if [ $((COUNT % 2)) -eq 0 ]; then
        echo '{"hookSpecificOutput":{"hookEventName":"PostToolUse","additionalContext":"[scientific-method] 2-Action Rule: You have done 2+ search/browse operations. Update findings.md NOW with what you discovered. Multimodal content will be lost if not written down."}}'
        exit 0
    fi
fi

echo '{}'
exit 0
