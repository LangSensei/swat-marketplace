#!/bin/bash

export PYTHONIOENCODING=utf-8
# sop: Session start hook
# If plan.md exists: inject context for session recovery
# If plan.md doesn't exist: inject SKILL.md so agent knows the framework
# Always exits 0

INPUT=$(cat)

PLAN_FILE="plan.md"
SKILL_DIR=".github/skills/sop"
PYTHON=$(command -v python3 || command -v python)

if [ -f "$PLAN_FILE" ]; then
    CONTEXT="[sop] Resuming session. Read plan.md, findings.md, and progress.md to restore context."

    GOAL=$(sed -n '/^## Goal/,/^## /{/^## Goal/d;/^## /d;p;}' "$PLAN_FILE" 2>/dev/null | head -3)
    STATE=$(sed -n '/^## Current State/,/^## /{/^## Current State/d;/^## /d;p;}' "$PLAN_FILE" 2>/dev/null | head -5)

    if [ -n "$GOAL" ] || [ -n "$STATE" ]; then
        CONTEXT="$CONTEXT

Goal: $GOAL
$STATE"
    fi
else
    if [ -f "$SKILL_DIR/SKILL.md" ]; then
        CONTEXT=$(cat "$SKILL_DIR/SKILL.md" 2>/dev/null || echo "")
    fi
fi

if [ -z "$CONTEXT" ]; then
    echo '{}'
    exit 0
fi

ESCAPED=$(echo "$CONTEXT" | $PYTHON -c "import sys,json; print(json.dumps(sys.stdin.read(), ensure_ascii=False))" 2>/dev/null || echo "\"\"")

echo "{\"hookSpecificOutput\":{\"hookEventName\":\"SessionStart\",\"additionalContext\":$ESCAPED}}"
exit 0
