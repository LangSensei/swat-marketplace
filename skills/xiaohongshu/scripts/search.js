#!/usr/bin/env node
/**
 * Xiaohongshu Search Script
 * Searches posts with anti-captcha route interception.
 *
 * Usage:
 *   node search.js --keyword "独墅湖租房" [--sort general|time_descending|popularity_descending] [--type all|normal|video] [--pages 1] [--output results.json] [--screenshot search.png]
 *
 * Requires: playwright, storage-state at ~/.swat/playwright/storage-state.json
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const os = require('os');

// --- Arg parsing ---
function getArg(name, fallback) {
  const idx = process.argv.indexOf(name);
  return idx !== -1 && process.argv[idx + 1] ? process.argv[idx + 1] : fallback;
}

const KEYWORD = getArg('--keyword', '');
const SORT = getArg('--sort', 'general');
const NOTE_TYPE = getArg('--type', 'all'); // all | normal (图文) | video
const PAGES = parseInt(getArg('--pages', '1'), 10);
const OUTPUT = getArg('--output', '');
const SCREENSHOT = getArg('--screenshot', '');
const STORAGE_STATE = getArg('--storage-state', path.join(os.homedir(), '.swat/playwright/storage-state.json'));

if (!KEYWORD) {
  console.error('Usage: node search.js --keyword "关键词" [--sort general] [--type all] [--pages 1] [--output results.json]');
  process.exit(2);
}

// --- Stealth helpers ---
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

async function applyStealth(page) {
  await page.addInitScript(() => {
    // Hide webdriver flag
    Object.defineProperty(navigator, 'webdriver', { get: () => false });
    // Fake plugins
    Object.defineProperty(navigator, 'plugins', {
      get: () => [1, 2, 3, 4, 5].map(() => ({ name: 'Chrome PDF Plugin', filename: 'internal-pdf-viewer' }))
    });
    // Fake languages
    Object.defineProperty(navigator, 'languages', { get: () => ['zh-CN', 'zh', 'en'] });
    // Chrome runtime
    window.chrome = { runtime: {} };
  });
}

function randomDelay(min = 500, max = 1500) {
  return new Promise(r => setTimeout(r, min + Math.random() * (max - min)));
}

// --- Main ---
(async () => {
  if (!fs.existsSync(STORAGE_STATE)) {
    console.error(`STORAGE_STATE_MISSING: ${STORAGE_STATE}`);
    console.error('Run auth.js --login first');
    process.exit(1);
  }

  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({
    storageState: STORAGE_STATE,
    viewport: { width: 1280, height: 800 },
    userAgent: USER_AGENT,
    locale: 'zh-CN',
  });

  const page = await ctx.newPage();
  await applyStealth(page);

  // Intercept captcha/security redirects
  await page.route('**/*', (route) => {
    const url = route.request().url();
    if (url.includes('redcaptcha') || url.includes('captcha')) {
      route.abort();
    } else {
      route.continue();
    }
  });

  // Collect search API responses
  const allItems = [];
  let searchResponsePromise = null;

  function setupSearchCapture() {
    searchResponsePromise = new Promise((resolve) => {
      const handler = async (resp) => {
        const url = resp.url();
        if (url.includes('/api/sns/web/v1/search/notes')) {
          try {
            const json = await resp.json();
            if (json.success && json.data && json.data.items) {
              for (const item of json.data.items) {
                allItems.push(item);
              }
            }
            page.off('response', handler);
            resolve(json.data);
          } catch (e) {
            // ignore parse errors
          }
        }
      };
      page.on('response', handler);
    });
  }

  // Build search URL
  let noteTypeParam = '';
  if (NOTE_TYPE === 'normal') noteTypeParam = '&note_type=0';
  else if (NOTE_TYPE === 'video') noteTypeParam = '&note_type=1';

  const searchUrl = `https://www.xiaohongshu.com/search_result?keyword=${encodeURIComponent(KEYWORD)}&type=1&sort=${SORT}${noteTypeParam}`;

  // Page 1
  setupSearchCapture();
  await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 20000 });
  await Promise.race([
    searchResponsePromise,
    new Promise(r => setTimeout(r, 10000))
  ]);

  // Additional pages
  for (let p = 1; p < PAGES; p++) {
    await randomDelay(1500, 3000);
    setupSearchCapture();
    // Scroll to bottom to trigger next page load
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await Promise.race([
      searchResponsePromise,
      new Promise(r => setTimeout(r, 8000))
    ]);
  }

  // Screenshot before closing
  if (SCREENSHOT) {
    await page.waitForTimeout(2000); // let images load
    await page.screenshot({ path: SCREENSHOT, fullPage: true });
    console.log(`SCREENSHOT: saved to ${SCREENSHOT}`);
  }

  await browser.close();

  // Parse and format results
  const results = allItems.map((item) => {
    const card = item.note_card || {};
    const user = card.user || {};
    const interact = card.interact_info || {};
    return {
      id: item.id,
      title: card.display_title || '',
      type: card.type || '',
      user: user.nickname || user.nick_name || '',
      user_id: user.user_id || '',
      cover: card.cover?.url || card.cover?.info_list?.[0]?.url || '',
      liked_count: interact.liked_count || '0',
      xsec_token: item.xsec_token || '',
    };
  });

  const output = {
    keyword: KEYWORD,
    sort: SORT,
    note_type: NOTE_TYPE,
    total: results.length,
    items: results,
  };

  const json = JSON.stringify(output, null, 2);

  if (OUTPUT) {
    fs.writeFileSync(OUTPUT, json);
    console.log(`SEARCH_COMPLETE: ${results.length} results saved to ${OUTPUT}`);
  } else {
    console.log(json);
  }
})().catch(e => {
  console.error(`SEARCH_ERROR: ${e.message}`);
  process.exit(1);
});
