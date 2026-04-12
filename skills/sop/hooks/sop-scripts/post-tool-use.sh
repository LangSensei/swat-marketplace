#!/bin/bash
# sop: Post-tool-use hook
# Reminds the agent to update planning files after every tool use.
# Always exits 0.

INPUT=$(cat)

echo '{"hookSpecificOutput":{"hookEventName":"PostToolUse","additionalContext":"[sop] Update progress.md with what you just did. If you discovered new information, update findings.md. If a step is now complete, check it off in plan.md and update Current State."}}'
exit 0
