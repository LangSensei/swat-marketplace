#!/usr/bin/env node
// scientific-method: Context refresh (BeforeTool) — Gemini CLI
// Every REFRESH_INTERVAL seconds, deny once to remind re-reading AGENTS.md + .squad/
// Skips during Synthesize/Complete.

const fs = require('fs');

const REFRESH_INTERVAL = parseInt(process.env.REFRESH_INTERVAL || '300', 10);
const REFRESH_TS_FILE = '.context_refresh_ts';

try {
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

  const now = Math.floor(Date.now() / 1000);

  // First run: initialize timestamp
  if (!fs.existsSync(REFRESH_TS_FILE)) {
    fs.writeFileSync(REFRESH_TS_FILE, String(now));
    console.log(JSON.stringify({ decision: 'ALLOW' }));
    process.exit(0);
  }

  const lastRefresh = parseInt(fs.readFileSync(REFRESH_TS_FILE, 'utf8').trim() || '0', 10);
  const elapsed = now - lastRefresh;

  if (elapsed > REFRESH_INTERVAL) {
    fs.writeFileSync(REFRESH_TS_FILE, String(now));
    const msg = `CONTEXT REFRESH: ${elapsed}s since last refresh. Re-read AGENTS.md and all files under .squad/ to prevent protocol drift.`;
    console.log(JSON.stringify({ decision: 'BLOCK', reason: msg }));
    process.exit(0);
  }

  console.log(JSON.stringify({ decision: 'ALLOW' }));
} catch (e) {
  console.log(JSON.stringify({ decision: 'ALLOW' }));
}
