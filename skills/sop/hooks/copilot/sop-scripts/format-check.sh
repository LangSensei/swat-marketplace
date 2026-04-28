#!/bin/bash

export PYTHONIOENCODING=utf-8
# sop: Format check (preToolUse)
# Validates plan.md structure: required section, status values, phase structure, current state.
# Always exits 0.

INPUT=$(cat)

PYTHON=$(command -v python3 || command -v python)

# Skip when tool targets state files (avoid deny loop)
TOOL_ARGS=$($PYTHON -c "
import sys, json
data = json.loads(sys.stdin.read())
print(data.get('toolArgs', ''))
" <<< "$INPUT" 2>/dev/null)

case "$TOOL_ARGS" in
    *plan.md*|*progress.md*|*findings.md*|*OPERATION.md*|*report.html*|*.squad*|*.github*)
        echo '{}'; exit 0 ;;
esac

# If plan.md doesn't exist yet, skip (operator hasn't started)
if [ ! -f "plan.md" ]; then
    echo '{}'; exit 0
fi

# Run validation via Python for reliable parsing
RESULT=$($PYTHON << 'PYEOF'
import re, sys, json

def deny(msg):
    msg += " Refer to <SKILL_DIR>/templates/plan.md for correct structure."
    print(json.dumps({"permissionDecision": "deny", "permissionDecisionReason": msg}))
    sys.exit(0)

try:
    with open("plan.md", "r", encoding="utf-8") as f:
        content = f.read()
except Exception:
    print("{}")
    sys.exit(0)

VALID_STATUSES = {"not_started", "in_progress", "complete"}

# A. Required section: ## Phases must exist
if not re.search(r"^## Phases", content, re.MULTILINE):
    deny("FORMAT: plan.md missing required section '## Phases'.")

# B. Validate all Status values
all_statuses = re.findall(r"\*\*Status:\*\*\s*(\S+)", content)
for s in all_statuses:
    if s not in VALID_STATUSES:
        deny(f"FORMAT: Invalid status '{s}' in plan.md. Must be one of: not_started, in_progress, complete.")

# C. Phase structure: each ### Phase N: must have Status, Prerequisites, and at least one checklist item
phase_headers = list(re.finditer(r"^### Phase \d+", content, re.MULTILINE))
for i, pm in enumerate(phase_headers):
    phase_name = pm.group(0)
    start = pm.start()
    if i < len(phase_headers) - 1:
        end = phase_headers[i + 1].start()
    else:
        next_h2 = re.search(r"^## ", content[start + len(phase_name):], re.MULTILINE)
        end = start + len(phase_name) + next_h2.start() if next_h2 else len(content)
    phase_content = content[start:end]

    if not re.search(r"\*\*Status:\*\*", phase_content):
        deny(f"FORMAT: {phase_name} missing required **Status:** field.")
    if not re.search(r"\*\*Prerequisites:\*\*", phase_content):
        deny(f"FORMAT: {phase_name} missing required **Prerequisites:** field.")
    if not re.search(r"- \[[ x]\]", phase_content):
        deny(f"FORMAT: {phase_name} must have at least one checklist item (- [ ] or - [x]).")

# D. Current State: Phase and Step must be non-empty
cs_match = re.search(r"(?s)## Current State(.*?)(?=\n## |\Z)", content)
cs_content = cs_match.group(1) if cs_match else ""

phase_m = re.search(r"\*\*Phase:\*\*\s*(.+)", cs_content)
if phase_m:
    phase_val = phase_m.group(1).strip()
    if not phase_val:
        deny("FORMAT: Current State **Phase:** must not be empty.")

step_m = re.search(r"\*\*Step:\*\*\s*(.+)", cs_content)
if step_m:
    step_val = step_m.group(1).strip()
    if not step_val:
        deny("FORMAT: Current State **Step:** must not be empty.")

# E. Completion gate: if Current State Phase matches the LAST defined phase, all prior phases' Status must be complete
if phase_m and len(phase_headers) > 1:
    phase_val = phase_m.group(1).strip()
    last_phase_line = phase_headers[-1].group(0)
    last_phase_name = re.match(r"### (.+)", last_phase_line).group(1).strip()

    if last_phase_name in phase_val or phase_val in last_phase_name:
        prior_statuses = []
        for i in range(len(phase_headers) - 1):
            p_start = phase_headers[i].start()
            p_end = phase_headers[i + 1].start()
            p_content = content[p_start:p_end]
            s_m = re.search(r"\*\*Status:\*\*\s*(\S+)", p_content)
            if s_m:
                prior_statuses.append(s_m.group(1))

        non_complete = []
        for idx, s in enumerate(prior_statuses):
            if s != "complete":
                non_complete.append(f"Phase {idx+1}: {s}")

        if non_complete:
            deny(f"QUALITY GATE: Cannot proceed to last phase -- prior phases not complete: {'; '.join(non_complete)}.")

print("{}")
PYEOF
)

# If Python failed, pass through
if [ -z "$RESULT" ]; then
    echo '{}'
else
    echo "$RESULT"
fi
exit 0
