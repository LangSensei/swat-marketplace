#!/usr/bin/env node
// scientific-method: Staleness check (BeforeTool) — Gemini CLI
// Deny when plan.md/progress.md/findings.md not updated in MAX_STALE seconds.
// Always exits 0.
// Skips during Synthesis/Complete.

const fs = require('fs');

const MAX_STALE = parseInt(process.env.MAX_STALE || '120', 10);

try {
  const input = JSON.parse(fs.readFileSync('/dev/stdin', 'utf8'));
  const toolArgs = JSON.stringify(input.tool_input || {});

  // Skip when tool targets state/infrastructure files
  if (/plan\.md|progress\.md|findings\.md|OPERATION\.md|report\.html|\.squad|\.github/.test(toolArgs)) {
    process.stdout.write('{}');
    process.exit(0);
  }

  // Skip during Synthesis/Complete
  if (fs.existsSync('plan.md')) {
    const content = fs.readFileSync('plan.md', 'utf8');
    const csMatch = content.match(/## Current State([\s\S]*?)(?=\n## |\n*$)/);
    const csContent = csMatch ? csMatch[1] : '';
    const stepM = csContent.match(/\*\*Step:\*\*\s*(.+)/);
    if (stepM) {
      const step = stepM[1].trim();
      if (['Synthesis', 'Complete'].includes(step)) {
        process.stdout.write('{}');
        process.exit(0);
      }
    }
  }

  const now = Date.now() / 1000;
  const staleFiles = [];
  for (const f of ['plan.md', 'progress.md', 'findings.md']) {
    if (!fs.existsSync(f)) continue;
    const mtime = fs.statSync(f).mtimeMs / 1000;
    const age = Math.floor(now - mtime);
    if (age > MAX_STALE) staleFiles.push(`${f}(${age}s)`);
  }

  if (staleFiles.length > 0) {
    const msg = `STALENESS: Not updated in over ${MAX_STALE}s: ${staleFiles.join(' ')}. Re-read SKILL.md, then check plan.md, progress.md, and findings.md for sections that need updating.`;
    process.stdout.write(JSON.stringify({ decision: 'deny', reason: msg }));
    process.exit(0);
  }

  process.stdout.write('{}');
  process.exit(0);
} catch (e) {
  process.stdout.write('{}');
  process.exit(0);
}
