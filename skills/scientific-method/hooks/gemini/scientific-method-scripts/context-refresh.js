#!/usr/bin/env node
// scientific-method: Context refresh (BeforeTool) — Gemini CLI
// Every REFRESH_INTERVAL seconds, deny once to remind re-reading AGENTS.md + .squad/
// Skips during Synthesis/Complete.

const fs = require('fs');

const REFRESH_INTERVAL = parseInt(process.env.REFRESH_INTERVAL || '300', 10);
const REFRESH_TS_FILE = '.context_refresh_ts';

try {
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

  const now = Math.floor(Date.now() / 1000);

  // First run: initialize timestamp
  if (!fs.existsSync(REFRESH_TS_FILE)) {
    fs.writeFileSync(REFRESH_TS_FILE, String(now));
    process.stdout.write('{}');
    process.exit(0);
  }

  const lastRefresh = parseInt(fs.readFileSync(REFRESH_TS_FILE, 'utf8').trim() || '0', 10);
  const elapsed = now - lastRefresh;

  if (elapsed > REFRESH_INTERVAL) {
    fs.writeFileSync(REFRESH_TS_FILE, String(now));
    const msg = `CONTEXT REFRESH: ${elapsed}s since last refresh. Re-read AGENTS.md and all files under .squad/ to prevent protocol drift.`;
    process.stdout.write(JSON.stringify({ decision: 'deny', reason: msg }));
    process.exit(0);
  }

  process.stdout.write('{}');
} catch (e) {
  process.stdout.write('{}');
}
