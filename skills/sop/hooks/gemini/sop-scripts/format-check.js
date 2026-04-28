#!/usr/bin/env node
// sop: Format check (BeforeTool) — Gemini CLI
// Validates plan.md structure: required section, status values, phase structure, current state.
// Always exits 0.

const fs = require('fs');

function deny(msg) {
  msg += ' Refer to <SKILL_DIR>/templates/plan.md for correct structure.';
  process.stdout.write(JSON.stringify({ decision: 'deny', reason: msg }));
  process.exit(0);
}

try {
  // Parse input
  const input = JSON.parse(fs.readFileSync('/dev/stdin', 'utf8'));
  const toolInput = input.tool_input || {};
  const toolArgs = JSON.stringify(toolInput);

  // Skip when tool targets state/infrastructure files
  if (/plan\.md|progress\.md|findings\.md|OPERATION\.md|report\.html|\.squad|\.github/.test(toolArgs)) {
    process.stdout.write('{}');
    process.exit(0);
  }

  // If plan.md doesn't exist, skip
  if (!fs.existsSync('plan.md')) {
    process.stdout.write('{}');
    process.exit(0);
  }

  const content = fs.readFileSync('plan.md', 'utf8');

  const VALID_STATUSES = new Set(['not_started', 'in_progress', 'complete']);

  // A. Required section: ## Phases must exist
  if (!/^## Phases/m.test(content)) {
    deny("FORMAT: plan.md missing required section '## Phases'.");
  }

  // B. Validate all Status values
  const allStatuses = [...content.matchAll(/\*\*Status:\*\*\s*(\S+)/g)].map(m => m[1]);
  for (const s of allStatuses) {
    if (!VALID_STATUSES.has(s)) {
      deny(`FORMAT: Invalid status '${s}' in plan.md. Must be one of: not_started, in_progress, complete.`);
    }
  }

  // C. Phase structure: each ### Phase N: must have Status, Prerequisites, and checklist item
  const phaseHeaders = [...content.matchAll(/^### Phase \d+/gm)];
  for (let i = 0; i < phaseHeaders.length; i++) {
    const phaseName = phaseHeaders[i][0];
    const start = phaseHeaders[i].index;
    let end;
    if (i < phaseHeaders.length - 1) {
      end = phaseHeaders[i + 1].index;
    } else {
      const rest = content.substring(start + phaseName.length);
      const nextH2 = rest.match(/^## /m);
      end = nextH2 ? start + phaseName.length + nextH2.index : content.length;
    }
    const phaseContent = content.substring(start, end);

    if (!/\*\*Status:\*\*/.test(phaseContent)) {
      deny(`FORMAT: ${phaseName} missing required **Status:** field.`);
    }
    if (!/\*\*Prerequisites:\*\*/.test(phaseContent)) {
      deny(`FORMAT: ${phaseName} missing required **Prerequisites:** field.`);
    }
    if (!/- \[[ x]\]/.test(phaseContent)) {
      deny(`FORMAT: ${phaseName} must have at least one checklist item (- [ ] or - [x]).`);
    }
  }

  // D. Current State: Phase and Step must be non-empty
  const csMatch = content.match(/## Current State([\s\S]*?)(?=\n## |\n*$)/);
  const csContent = csMatch ? csMatch[1] : '';

  const phaseField = csContent.match(/\*\*Phase:\*\*\s*(.+)/);
  if (phaseField) {
    const phaseVal = phaseField[1].trim();
    if (!phaseVal) {
      deny('FORMAT: Current State **Phase:** must not be empty.');
    }
  }

  const stepField = csContent.match(/\*\*Step:\*\*\s*(.+)/);
  if (stepField) {
    const stepVal = stepField[1].trim();
    if (!stepVal) {
      deny('FORMAT: Current State **Step:** must not be empty.');
    }
  }

  // E. Completion gate: if Current State Phase matches the LAST defined phase, all prior phases' Status must be complete
  if (phaseField && phaseHeaders.length > 1) {
    const phaseVal = phaseField[1].trim();
    const lastPhaseLine = phaseHeaders[phaseHeaders.length - 1][0];
    const lastPhaseName = lastPhaseLine.replace(/^### /, '').trim();

    if (lastPhaseName.includes(phaseVal) || phaseVal.includes(lastPhaseName)) {
      const priorStatuses = [];
      for (let i = 0; i < phaseHeaders.length - 1; i++) {
        const pStart = phaseHeaders[i].index;
        const pEnd = phaseHeaders[i + 1].index;
        const pContent = content.substring(pStart, pEnd);
        const sMatch = pContent.match(/\*\*Status:\*\*\s*(\S+)/);
        if (sMatch) priorStatuses.push(sMatch[1]);
      }
      const nonComplete = [];
      priorStatuses.forEach((s, idx) => {
        if (s !== 'complete') nonComplete.push(`Phase ${idx + 1}: ${s}`);
      });
      if (nonComplete.length > 0) {
        deny(`QUALITY GATE: Cannot proceed to last phase -- prior phases not complete: ${nonComplete.join('; ')}.`);
      }
    }
  }

  process.stdout.write('{}');
  process.exit(0);
} catch (e) {
  process.stdout.write('{}');
  process.exit(0);
}
