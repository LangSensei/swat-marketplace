#!/bin/bash

export PYTHONIOENCODING=utf-8
# scientific-method: Format check (preToolUse)
# Validates plan.md structure: required sections, status values, cycle completeness, current state.
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
    print(json.dumps({"permissionDecision": "deny", "permissionDecisionReason": msg}))
    sys.exit(0)

try:
    with open("plan.md", "r", encoding="utf-8") as f:
        content = f.read()
except Exception:
    print("{}")
    sys.exit(0)

# --- A. Extract top-level sections and their statuses ---
VALID_STATUSES = {"not_started", "in_progress", "complete"}
REQUIRED_SECTIONS = ["Observation", "Decomposition", "Synthesis"]

# Find all ## headings and their content
sections = {}
current_section = None
current_content = []
for line in content.split("\n"):
    m = re.match(r"^## (.+)$", line)
    if m:
        if current_section:
            sections[current_section] = "\n".join(current_content)
        current_section = m.group(1).strip()
        current_content = []
    elif current_section:
        current_content.append(line)
if current_section:
    sections[current_section] = "\n".join(current_content)

# Check required sections exist
# Check for Synthesis section for the synthesis section
synthesis_found = False
for name in sections:
    if name.startswith("Synthes"):
        synthesis_found = True
        break

for req in ["Observation", "Decomposition"]:
    if req not in sections:
        deny(f"FORMAT: plan.md missing required section '## {req}'.")

if not synthesis_found:
    deny("FORMAT: plan.md missing required section '## Synthesis'.")

# --- B. Validate all Status values ---
all_statuses = re.findall(r"\*\*Status:\*\*\s*(\S+)", content)
for s in all_statuses:
    if s not in VALID_STATUSES:
        deny(f"FORMAT: Invalid status '{s}' in plan.md. Must be one of: not_started, in_progress, complete.")

# --- C. If Decomposition is complete, check Cycles ---
decompose_content = sections.get("Decomposition", "")
decompose_status_m = re.search(r"\*\*Status:\*\*\s*(\S+)", decompose_content)
decompose_status = decompose_status_m.group(1) if decompose_status_m else "not_started"

if decompose_status == "complete":
    # Find all Cycle sections
    cycle_sections = {k: v for k, v in sections.items() if re.match(r"Cycle \d+", k)}
    if not cycle_sections:
        deny("FORMAT: Decomposition is complete but no '## Cycle N' sections found in plan.md.")

    # Check each cycle has required subsections
    REQUIRED_CYCLE_SUBS = ["Hypothesis", "Prediction", "Test", "Conclusion"]
    for cycle_name, cycle_content in cycle_sections.items():
        # Find ### subsections within this cycle
        subs = re.findall(r"^### (\w+)", cycle_content, re.MULTILINE)

        for req in REQUIRED_CYCLE_SUBS:
            if req not in subs:
                deny(f"FORMAT: {cycle_name} missing required subsection '### {req}'.")

        # Check each subsection has a Status
        sub_statuses = re.findall(r"\*\*Status:\*\*\s*(\S+)", cycle_content)
        if len(sub_statuses) < len(REQUIRED_CYCLE_SUBS):
            deny(f"FORMAT: {cycle_name} has subsections without **Status:** fields.")

# --- D. Current State validation ---
cs_match = re.search(r"(?s)## Current State(.*?)(?=\n## |\Z)", content)
cs_content = cs_match.group(1) if cs_match else ""
step_m = re.search(r"\*\*Step:\*\*\s*(.+)", cs_content)
if step_m:
    step = step_m.group(1).strip()
    # Valid patterns
    valid_top = {"Observation", "Decomposition", "Synthesis", "Complete"}
    cycle_pattern = re.match(r"Cycle (\d+) - (Hypothesis|Prediction|Test|Conclusion)", step)
    if step not in valid_top and not cycle_pattern:
        deny(f"FORMAT: Invalid Current State Step '{step}'. Must be Observation, Decomposition, Synthesis, Complete, or 'Cycle N - Hypothesis/Prediction/Test/Conclusion'.")

# --- E. Synthesis gate — check only statuses BEFORE ## Synthesis to avoid deadlock ---
if step_m:
    step = step_m.group(1).strip()
    if step in ("Synthesis", "Complete"):
        synth_idx = content.find("## Synthesis")
        pre_synth = content[:synth_idx] if synth_idx >= 0 else content
        pre_synth_statuses = re.findall(r"\*\*Status:\*\*\s*(\S+)", pre_synth)
        non_complete = []
        for i, s in enumerate(pre_synth_statuses):
            if s != "complete":
                non_complete.append(f"Status #{i+1}: {s}")
        if non_complete:
            deny(f"QUALITY GATE: Cannot proceed to {step} \u2014 prior steps not complete: {'; '.join(non_complete)}.")

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
