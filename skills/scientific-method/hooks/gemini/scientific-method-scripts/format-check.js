#!/usr/bin/env node
// scientific-method: Format check (BeforeTool) — Gemini CLI
// Validates plan.md structure: required sections, status values, cycle completeness, current state.

const fs = require('fs');

function deny(msg) {
  process.stdout.write(JSON.stringify({ decision: 'deny', reason: msg }));
  process.exit(0);
}

try {
  // Parse input
  const input = JSON.parse(fs.readFileSync('/dev/stdin', 'utf8'));
  const toolInput = input.tool_input || {};
  const toolArgs = JSON.stringify(toolInput);

  // Skip when tool targets state files
  if (/plan\.md|progress\.md|findings\.md/.test(toolArgs)) {
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

  // Extract ## sections
  const sections = {};
  let currentSection = null;
  let currentContent = [];
  for (const line of content.split('\n')) {
    const m = line.match(/^## (.+)$/);
    if (m) {
      if (currentSection) sections[currentSection] = currentContent.join('\n');
      currentSection = m[1].trim();
      currentContent = [];
    } else if (currentSection) {
      currentContent.push(line);
    }
  }
  if (currentSection) sections[currentSection] = currentContent.join('\n');

  // A. Check required sections
  if (!sections['Observation']) deny("FORMAT: plan.md missing required section '## Observation'.");
  if (!sections['Decomposition']) deny("FORMAT: plan.md missing required section '## Decomposition'.");

  const synthesisFound = Object.keys(sections).some(k => k.startsWith('Synthes'));
  if (!synthesisFound) deny("FORMAT: plan.md missing required section '## Synthesis'.");

  // B. Validate all Status values
  const allStatuses = [...content.matchAll(/\*\*Status:\*\*\s*(\S+)/g)].map(m => m[1]);
  for (const s of allStatuses) {
    if (!VALID_STATUSES.has(s)) {
      deny(`FORMAT: Invalid status '${s}' in plan.md. Must be one of: not_started, in_progress, complete.`);
    }
  }

  // C. If Decomposition complete, check Cycles
  const decomposeContent = sections['Decomposition'] || '';
  const decomposeStatusM = decomposeContent.match(/\*\*Status:\*\*\s*(\S+)/);
  const decomposeStatus = decomposeStatusM ? decomposeStatusM[1] : 'not_started';

  if (decomposeStatus === 'complete') {
    const cycleSections = Object.entries(sections).filter(([k]) => /^Cycle \d+/.test(k));
    if (cycleSections.length === 0) {
      deny("FORMAT: Decomposition is complete but no '## Cycle N' sections found in plan.md.");
    }

    const REQUIRED_SUBS = ['Hypothesis', 'Prediction', 'Test', 'Conclusion'];
    for (const [cycleName, cycleContent] of cycleSections) {
      const subs = [...cycleContent.matchAll(/^### (\w+)/gm)].map(m => m[1]);
      const normalized = new Set();
      for (const s of subs) {
        if (s.startsWith('Hypothes')) normalized.add('Hypothesis');
        else if (s.startsWith('Predict')) normalized.add('Prediction');
        else if (s === 'Test') normalized.add('Test');
        else if (s.startsWith('Conclu')) normalized.add('Conclusion');
        else normalized.add(s);
      }
      for (const req of REQUIRED_SUBS) {
        if (!normalized.has(req)) {
          deny(`FORMAT: ${cycleName} missing required subsection '### ${req}'.`);
        }
      }
      const subStatuses = [...cycleContent.matchAll(/\*\*Status:\*\*\s*(\S+)/g)];
      if (subStatuses.length < REQUIRED_SUBS.length) {
        deny(`FORMAT: ${cycleName} has subsections without **Status:** fields.`);
      }
    }
  }

  // D. Current State validation
  // D. Current State validation — extract Step from ## Current State section only
  const csMatch = content.match(/## Current State([\s\S]*?)(?=\n## |\n*$)/);
  const csContent = csMatch ? csMatch[1] : '';
  const stepM = csContent.match(/\*\*Step:\*\*\s*(.+)/);
  if (stepM) {
    const step = stepM[1].trim();
    const validTop = new Set(['Observation', 'Decomposition', 'Synthesis', 'Complete']);
    const cyclePattern = /^Cycle \d+ - (Hypothesis|Prediction|Test|Conclusion)$/.test(step);
    if (!validTop.has(step) && !cyclePattern) {
      deny(`FORMAT: Invalid Current State Step '${step}'. Must be Observation, Decomposition, Synthesis, Complete, or 'Cycle N - Hypothesis/Prediction/Test/Conclusion'.`);
    }

    // E. Synthesis gate
    if (['Synthesis', 'Complete'].includes(step)) {
      const nonComplete = [];
      allStatuses.forEach((s, i) => {
        if (s !== 'complete') nonComplete.push(`Status #${i + 1}: ${s}`);
      });
      if (nonComplete.length > 0) {
        deny(`QUALITY GATE: Cannot proceed to ${step} — prior steps not complete: ${nonComplete.join('; ')}.`);
      }
    }
  }

  process.stdout.write('{}');
} catch (e) {
  process.stdout.write('{}');
}
