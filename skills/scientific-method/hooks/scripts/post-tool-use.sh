#!/bin/bash
# scientific-method: Post-tool-use hook
# Reminds the agent to update planning files after every tool use.
# Always exits 0.

INPUT=$(cat)

# Only inject if framework is active
if [ ! -f "plan.md" ] && [ ! -f "progress.md" ]; then
    echo '{}'
    exit 0
fi

echo '{"hookSpecificOutput":{"hookEventName":"PostToolUse","additionalContext":"[scientific-method] Update progress.md with what you just did. If you discovered new information, update findings.md. If a cycle step is now complete, update plan.md Current State."}}'
exit 0
