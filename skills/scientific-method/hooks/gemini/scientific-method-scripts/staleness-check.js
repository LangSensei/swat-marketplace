#!/usr/bin/env node
// scientific-method: Staleness check (preToolUse) — Gemini runtime
// Deny when plan.md/progress.md/findings.md not updated in MAX_STALE seconds.
// Skips during Synthesize/Complete.

const fs = require('fs');

const MAX_STALE = parseInt(process.env.MAX_STALE || '120', 10);

try {
  const input = JSON.parse(fs.readFileSync('/dev/stdin', 'utf8'));
  const toolArgs = JSON.stringify(input.tool_input || {});

  // Skip when tool targets state files
  if (/plan\.md|progress\.md|findings\.md/.test(toolArgs)) {
    console.log(JSON.stringify({ decision: 'ALLOW' }));
    process.exit(0);
  }

  // Skip during Synthesize/Complete
  if (fs.existsSync('plan.md')) {
    const content = fs.readFileSync('plan.md', 'utf8');
    const stepM = content.match(/\*\*Step:\*\*\s*(.+)/);
    if (stepM) {
      const step = stepM[1].trim();
      if (['Synthesize', 'Synthesis', 'Complete'].includes(step)) {
        console.log(JSON.stringify({ decision: 'ALLOW' }));
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
    console.log(JSON.stringify({ decision: 'BLOCK', reason: msg }));
    process.exit(0);
  }

  console.log(JSON.stringify({ decision: 'ALLOW' }));
} catch (e) {
  console.log(JSON.stringify({ decision: 'ALLOW' }));
}
