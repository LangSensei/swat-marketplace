#!/usr/bin/env node
// xiaohongshu-login.js — Login to Xiaohongshu via QR code
// Usage: node xiaohongshu-login.js [--state-path <path>] [--screenshot-dir <dir>] [--timeout <seconds>]

const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const args = process.argv.slice(2);
function getArg(name, defaultVal) {
  const idx = args.indexOf(name);
  return idx >= 0 && args[idx + 1] ? args[idx + 1] : defaultVal;
}

const STATE_PATH = getArg('--state-path', path.join(process.env.HOME, '.swat/browser-state-xhs.json'));
const SCREENSHOT_DIR = getArg('--screenshot-dir', '/tmp/xhs-login');
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
    // Step 1: Navigate to xiaohongshu
    await page.goto('https://www.xiaohongshu.com', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(2000);

    // Step 2: Look for login trigger — click if found
    const loginSelectors = ['text=登录', '.login-btn', '[class*="login"]', 'text=Log in'];
    for (const sel of loginSelectors) {
      const btn = await page.$(sel);
      if (btn) {
        await btn.click();
        await page.waitForTimeout(3000);
        break;
      }
    }

    // Step 3: Find QR code image
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'qr-page.png') });

    // Try to locate the QR code specifically
    const qrEl = await page.$('img[src*="qrcode"]') || await page.$('.qrcode-img') || await page.$('[class*="qr"] img');
    if (qrEl) {
      await qrEl.screenshot({ path: path.join(SCREENSHOT_DIR, 'qr-code.png') });
      console.log('QR_SCREENSHOT=' + path.join(SCREENSHOT_DIR, 'qr-code.png'));
    } else {
      console.log('QR_SCREENSHOT=' + path.join(SCREENSHOT_DIR, 'qr-page.png'));
    }
    console.log('PAGE_SCREENSHOT=' + path.join(SCREENSHOT_DIR, 'qr-page.png'));
    console.log('WAITING_FOR_SCAN');

    // Step 4: Poll for login success
    const start = Date.now();
    while (Date.now() - start < TIMEOUT) {
      await page.waitForTimeout(3000);

      // Check URL change (logged in users get redirected)
      const url = page.url();

      // Check for user-specific elements that only appear after real login
      const loggedIn = await page.evaluate(() => {
        // Look for cookie that indicates login
        const hasCookie = document.cookie.includes('customer_id') || document.cookie.includes('access-token');
        // Look for user menu that only appears when logged in
        const userMenu = document.querySelector('[class*="user-menu"]') || document.querySelector('[class*="sidebar-user"]');
        // Look for "发布" button which only shows for logged-in users
        const publishBtn = document.querySelector('[class*="publish"]');
        return hasCookie || (userMenu !== null) || (publishBtn !== null);
      });

      if (loggedIn) {
        console.log('LOGIN_SUCCESS');
        await context.storageState({ path: STATE_PATH });
        console.log('STATE_SAVED=' + STATE_PATH);
        break;
      }

      // Save periodic screenshot for debugging
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
