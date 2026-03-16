#!/usr/bin/env node
/**
 * Xiaohongshu Note Detail Script
 * Fetches full content of a note by ID.
 *
 * Usage:
 *   node detail.js --id <note_id> [--xsec-token <token>] [--output detail.json] [--screenshot detail.png]
 *
 * Requires: playwright, storage-state at ~/.swat/playwright/storage-state.json
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const os = require('os');

function getArg(name, fallback) {
  const idx = process.argv.indexOf(name);
  return idx !== -1 && process.argv[idx + 1] ? process.argv[idx + 1] : fallback;
}

const NOTE_ID = getArg('--id', '');
const XSEC_TOKEN = getArg('--xsec-token', '');
const OUTPUT = getArg('--output', '');
const SCREENSHOT = getArg('--screenshot', '');
const STORAGE_STATE = getArg('--storage-state', path.join(os.homedir(), '.swat/playwright/storage-state.json'));

if (!NOTE_ID) {
  console.error('Usage: node detail.js --id <note_id> [--xsec-token <token>] [--output detail.json]');
  process.exit(2);
}

const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

async function applyStealth(page) {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => false });
    Object.defineProperty(navigator, 'plugins', {
      get: () => [1, 2, 3, 4, 5].map(() => ({ name: 'Chrome PDF Plugin', filename: 'internal-pdf-viewer' }))
    });
    Object.defineProperty(navigator, 'languages', { get: () => ['zh-CN', 'zh', 'en'] });
    window.chrome = { runtime: {} };
  });
}

(async () => {
  if (!fs.existsSync(STORAGE_STATE)) {
    console.error(`STORAGE_STATE_MISSING: ${STORAGE_STATE}`);
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

  // Intercept captcha
  await page.route('**/*', (route) => {
    const url = route.request().url();
    if (url.includes('redcaptcha') || url.includes('captcha')) {
      route.abort();
    } else {
      route.continue();
    }
  });

  // Capture feed detail API
  let detailData = null;
  const detailPromise = new Promise((resolve) => {
    page.on('response', async (resp) => {
      const url = resp.url();
      if (url.includes('/api/sns/web/v1/feed')) {
        try {
          const json = await resp.json();
          if (json.success && json.data) {
            detailData = json.data;
            resolve();
          }
        } catch (e) {}
      }
    });
  });

  // Navigate to note page
  let noteUrl = `https://www.xiaohongshu.com/explore/${NOTE_ID}`;
  if (XSEC_TOKEN) {
    noteUrl += `?xsec_token=${encodeURIComponent(XSEC_TOKEN)}`;
  }

  await page.goto(noteUrl, { waitUntil: 'domcontentloaded', timeout: 20000 });
  await Promise.race([detailPromise, new Promise(r => setTimeout(r, 10000))]);

  // Fallback: extract from DOM if API capture missed
  if (!detailData) {
    detailData = await page.evaluate(() => {
      const title = document.querySelector('#detail-title')?.innerText || document.querySelector('.title')?.innerText || '';
      const desc = document.querySelector('#detail-desc')?.innerText || document.querySelector('.desc')?.innerText || '';
      const author = document.querySelector('.author-wrapper .name')?.innerText || '';
      const likes = document.querySelector('.like-wrapper .count')?.innerText || '0';
      const collects = document.querySelector('.collect-wrapper .count')?.innerText || '0';
      const comments = document.querySelector('.chat-wrapper .count')?.innerText || '0';
      return { fallback: true, title, desc, author, likes, collects, comments };
    });
  }

  // Screenshot before closing
  if (SCREENSHOT) {
    await page.waitForTimeout(2000);
    await page.screenshot({ path: SCREENSHOT, fullPage: true });
    console.log(`SCREENSHOT: saved to ${SCREENSHOT}`);
  }

  await browser.close();

  // Format output
  let result;
  if (detailData && !detailData.fallback) {
    // Parse API response
    const items = detailData.items || [];
    const note = items[0]?.note_card || {};
    const interact = note.interact_info || {};
    const user = note.user || {};
    const imageList = (note.image_list || []).map(img => img.url_default || img.info_list?.[0]?.url || '');
    result = {
      id: NOTE_ID,
      title: note.title || note.display_title || '',
      desc: note.desc || '',
      type: note.type || '',
      user: user.nickname || user.nick_name || '',
      user_id: user.user_id || '',
      time: note.time || '',
      liked_count: interact.liked_count || '0',
      collected_count: interact.collected_count || '0',
      comment_count: interact.comment_count || '0',
      share_count: interact.share_count || '0',
      images: imageList,
      tags: (note.tag_list || []).map(t => t.name || ''),
    };
  } else {
    result = { id: NOTE_ID, ...detailData };
  }

  const json = JSON.stringify(result, null, 2);

  if (OUTPUT) {
    fs.writeFileSync(OUTPUT, json);
    console.log(`DETAIL_COMPLETE: saved to ${OUTPUT}`);
  } else {
    console.log(json);
  }
})().catch(e => {
  console.error(`DETAIL_ERROR: ${e.message}`);
  process.exit(1);
});
