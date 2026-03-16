#!/usr/bin/env node
// auth.js — Xiaohongshu authentication helper
// Usage:
//   node auth.js --check                    Check if storage state is valid
//   node auth.js --login [--timeout 120]    QR code login flow

const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const args = process.argv.slice(2);
function hasFlag(name) { return args.includes(name); }
function getArg(name, defaultVal) {
  const idx = args.indexOf(name);
  return idx >= 0 && args[idx + 1] ? args[idx + 1] : defaultVal;
}

const STATE_PATH = getArg('--state-path', path.join(process.env.HOME, '.swat/playwright/storage-state.json'));

// --- Check mode ---
if (hasFlag('--check')) {
  if (!fs.existsSync(STATE_PATH)) {
    console.log('MISSING');
    process.exit(1);
  }
  try {
    const state = JSON.parse(fs.readFileSync(STATE_PATH, 'utf8'));
    const now = Date.now() / 1000;
    const valid = (state.cookies || []).filter(c =>
      c.domain.includes('xiaohongshu') && (c.expires === -1 || c.expires > now)
    );
    if (valid.length > 0) {
      console.log('OK');
      process.exit(0);
    } else {
      console.log('EXPIRED');
      process.exit(1);
    }
  } catch (e) {
    console.log('INVALID');
    process.exit(1);
  }
}

// --- Login mode ---
if (!hasFlag('--login')) {
  console.error('Usage: node auth.js --check | --login [--timeout 120] [--state-path <path>]');
  process.exit(1);
}

const SCREENSHOT_DIR = getArg('--screenshot-dir', '/tmp/xhs-auth');
const TIMEOUT = parseInt(getArg('--timeout', '120')) * 1000;

fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  });
  const page = await context.newPage();

  try {
    await page.goto('https://www.xiaohongshu.com', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(2000);

    // Click login button if present
    for (const sel of ['text=登录', '.login-btn', '[class*="login"]', 'text=Log in']) {
      const btn = await page.$(sel);
      if (btn) { await btn.click(); await page.waitForTimeout(3000); break; }
    }

    // Capture QR code
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'qr-page.png') });
    const qrEl = await page.$('img[src*="qrcode"]') || await page.$('.qrcode-img') || await page.$('[class*="qr"] img');
    if (qrEl) {
      await qrEl.screenshot({ path: path.join(SCREENSHOT_DIR, 'qr-code.png') });
      console.log('QR_SCREENSHOT=' + path.join(SCREENSHOT_DIR, 'qr-code.png'));
    } else {
      console.log('QR_SCREENSHOT=' + path.join(SCREENSHOT_DIR, 'qr-page.png'));
    }
    console.log('PAGE_SCREENSHOT=' + path.join(SCREENSHOT_DIR, 'qr-page.png'));
    console.log('WAITING_FOR_SCAN');

    // Poll for login success
    const start = Date.now();
    while (Date.now() - start < TIMEOUT) {
      await page.waitForTimeout(3000);
      const loggedIn = await page.evaluate(() => {
        const hasCookie = document.cookie.includes('customer_id') || document.cookie.includes('access-token');
        const userMenu = document.querySelector('[class*="user-menu"]') || document.querySelector('[class*="sidebar-user"]');
        const publishBtn = document.querySelector('[class*="publish"]');
        return hasCookie || (userMenu !== null) || (publishBtn !== null);
      });
      if (loggedIn) {
        console.log('LOGIN_SUCCESS');
        fs.mkdirSync(path.dirname(STATE_PATH), { recursive: true });
        await context.storageState({ path: STATE_PATH });
        console.log('STATE_SAVED=' + STATE_PATH);
        break;
      }
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'current.png') });
    }
    if (Date.now() - start >= TIMEOUT) {
      console.log('LOGIN_TIMEOUT');
    }
  } catch (err) {
    console.error('ERROR=' + err.message);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'error.png') }).catch(() => {});
  } finally {
    await browser.close();
  }
})();
