#!/usr/bin/env node
// scientific-method: Staleness check (BeforeTool) — Gemini CLI
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

    // Skip when tool targets state files (avoid deny loop)
    if (/plan\.md|progress\.md|findings\.md/.test(toolInput)) {
      process.stdout.write('{}');
      process.exit(0);
    }
  } catch (_) {
    // If input parsing fails, continue with staleness check
  }

  // Final stages gate: Synthesize/Complete — verify all prior steps complete
  if (fs.existsSync('plan.md')) {
    try {
      const content = fs.readFileSync('plan.md', 'utf8');
      const stepMatch = content.match(/\*\*Step:\*\*\s*(\S+)/);
      if (stepMatch) {
        const currentState = stepMatch[1];
        if (/[Ss]ynthesize|[Cc]omplete/.test(currentState)) {
          // Check all **Status:** fields — all except the last must be "complete"
          const statuses = [];
          const statusRe = /\*\*Status:\*\*\s*(\S+)/g;
          let m;
          while ((m = statusRe.exec(content)) !== null) {
            statuses.push(m[1]);
          }
          if (statuses.length > 1) {
            const prior = statuses.slice(0, -1);
            const issues = [];
            prior.forEach((val, i) => {
              if (val !== 'complete') {
                issues.push(`Status #${i + 1}: ${val}`);
              }
            });
            if (issues.length > 0) {
              const msg = `QUALITY GATE: Cannot proceed to ${currentState} \u2014 prior steps/cycles are not complete: ${issues.join(';')}. Go back and complete all prior Cycles (Hypothesize -> Predict -> Test -> Conclude) before synthesizing.`;
              process.stdout.write(JSON.stringify({ decision: 'deny', reason: msg }));
              process.exit(0);
            }
          }
          // All prior steps complete — skip staleness check during synthesis
          process.stdout.write('{}');
          process.exit(0);
        }
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
    const msg = `STALENESS: Not updated in over ${MAX_STALE}s: ${staleFiles.join(' ')}. Re-read SKILL.md, then check plan.md, progress.md, and findings.md for sections that need updating.`;
    process.stdout.write(JSON.stringify({ decision: 'deny', reason: msg }));
    process.exit(0);
  }

  process.stdout.write('{}');
  process.exit(0);
});
