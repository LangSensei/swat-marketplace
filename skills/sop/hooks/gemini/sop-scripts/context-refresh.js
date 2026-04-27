#!/usr/bin/env node
// sop: Context refresh (BeforeTool) — Gemini CLI
// Every REFRESH_INTERVAL seconds, deny once to remind re-reading GEMINI.md + .squad/
// Always exits 0.

'use strict';

const fs = require('fs');

const REFRESH_INTERVAL = parseInt(process.env.REFRESH_INTERVAL || '300', 10);
const REFRESH_TS_FILE = '.context_refresh_ts';

let input = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', (chunk) => { input += chunk; });
process.stdin.on('end', () => {
  try {
    const data = JSON.parse(input);
    const toolInput = JSON.stringify(data.tool_input || {});

    // Skip when tool targets state/infrastructure files
    if (/plan\.md|progress\.md|findings\.md|OPERATION\.md|report\.html|\.squad|\.github/.test(toolInput)) {
      process.stdout.write('{}');
      process.exit(0);
    }
  } catch (_) {
    // If input parsing fails, continue with refresh check
  }

  const nowSec = Math.floor(Date.now() / 1000);

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
      // plan.md read error — continue
    }
  }

  // First run: initialize timestamp, don't deny
  if (!fs.existsSync(REFRESH_TS_FILE)) {
    fs.writeFileSync(REFRESH_TS_FILE, String(nowSec), 'utf8');
    process.stdout.write('{}');
    process.exit(0);
  }

  let lastRefresh = 0;
  try {
    lastRefresh = parseInt(fs.readFileSync(REFRESH_TS_FILE, 'utf8').trim(), 10) || 0;
  } catch (_) {
    lastRefresh = 0;
  }

  const elapsed = nowSec - lastRefresh;
  if (elapsed > REFRESH_INTERVAL) {
    fs.writeFileSync(REFRESH_TS_FILE, String(nowSec), 'utf8');
    const msg = `CONTEXT REFRESH: ${elapsed}s since last refresh. Re-read GEMINI.md and all files under .squad/ to prevent protocol drift.`;
    process.stdout.write(JSON.stringify({ decision: 'deny', reason: msg }));
    process.exit(0);
  }

  process.stdout.write('{}');
  process.exit(0);
});
