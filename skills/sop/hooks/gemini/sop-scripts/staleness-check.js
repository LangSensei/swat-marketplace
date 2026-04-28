#!/usr/bin/env node
// sop: Staleness check (BeforeTool) — Gemini CLI
// Deny when plan.md/progress.md/findings.md not updated in MAX_STALE seconds.
// Always exits 0.

'use strict';

const fs = require('fs');

const MAX_STALE = parseInt(process.env.MAX_STALE || '120', 10);
const STATE_FILES = ['plan.md', 'progress.md', 'findings.md'];

let input = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', (chunk) => { input += chunk; });
process.stdin.on('end', () => {
  try {
    const data = JSON.parse(input);
    const toolInput = JSON.stringify(data.tool_input || {});

    // Skip when tool targets state/infrastructure files (avoid deny loop)
    if (/plan\.md|progress\.md|findings\.md|OPERATION\.md|report\.html|\.squad|\.github/.test(toolInput)) {
      process.stdout.write('{}');
      process.exit(0);
    }
  } catch (_) {
    // If input parsing fails, continue with staleness check
  }

  // Skip during final stages — if all but last (or all) phases are complete, allow freely
  if (fs.existsSync('plan.md')) {
    try {
      const content = fs.readFileSync('plan.md', 'utf8');
      const phaseCount = (content.match(/^### Phase/gm) || []).length;
      const completeCount = (content.match(/\*\*Status:\*\* complete/g) || []).length;
      if (phaseCount > 0 && completeCount >= phaseCount - 1) {
        process.stdout.write('{}');
        process.exit(0);
      }
    } catch (_) {
      // plan.md read error — continue with staleness check
    }
  }

  // Staleness check
  const nowSec = Math.floor(Date.now() / 1000);
  const staleFiles = [];

  for (const f of STATE_FILES) {
    try {
      const stat = fs.statSync(f);
      const mtime = Math.floor(stat.mtimeMs / 1000);
      const age = nowSec - mtime;
      if (age > MAX_STALE) {
        staleFiles.push(`${f}(${age}s)`);
      }
    } catch (_) {
      // File doesn't exist — skip
    }
  }

  if (staleFiles.length > 0) {
    const msg = `STALENESS: Working files not updated in over ${MAX_STALE}s: ${staleFiles.join(' ')}. Update your working files with real progress NOW. Refer to <SKILL_DIR>/templates/ for what goes where. Do NOT touch/reset file timestamps -- write actual content.`;
    process.stdout.write(JSON.stringify({ decision: 'deny', reason: msg }));
    process.exit(0);
  }

  process.stdout.write('{}');
  process.exit(0);
});
