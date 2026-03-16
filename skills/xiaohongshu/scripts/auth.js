#!/usr/bin/env node
// auth.js — Xiaohongshu authentication helper
// Usage:
//   node auth.js --check                    Check if storage state is valid
//   node auth.js --login [--timeout 300]    QR code login flow (interactive)
//
// Login flow:
//   1. Opens xiaohongshu.com, clicks login, captures QR code screenshot
//   2. Outputs QR_SCREENSHOT=<path> — operator sends this to user to scan
//   3. User scans QR with Xiaohongshu app and confirms on phone
//   4. Either:
//      a) Direct success — cookies set, done
//      b) SMS verification popup appears (overlay on top of login modal)
//         Script outputs SMS_VERIFICATION_NEEDED
//         Write 6-digit code to --sms-code-path (default /tmp/xhs-sms-code.txt)
//         Code auto-submits after filling (no button click needed)
//   5. On success: saves storage state and outputs LOGIN_SUCCESS + STATE_SAVED=<path>

const path = require('path');
const fs = require('fs');

const args = process.argv.slice(2);
function hasFlag(name) { return args.includes(name); }
function getArg(name, defaultVal) {
  const idx = args.indexOf(name);
  return idx >= 0 && args[idx + 1] ? args[idx + 1] : defaultVal;
}

const STATE_PATH = getArg('--state-path', path.join(process.env.HOME, '.swat/playwright/storage-state.json'));
const SMS_CODE_PATH = getArg('--sms-code-path', '/tmp/xhs-sms-code.txt');

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
  console.error('Usage: node auth.js --check | --login [--timeout 300] [--state-path <path>] [--sms-code-path <path>]');
  process.exit(1);
}

const { chromium } = require('playwright');

const SCREENSHOT_DIR = getArg('--screenshot-dir', path.join(require('os').tmpdir(), `xhs-auth-${process.getuid()}`));
const TIMEOUT = parseInt(getArg('--timeout', '300')) * 1000;

fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
if (fs.existsSync(SMS_CODE_PATH)) fs.unlinkSync(SMS_CODE_PATH);

(async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  });
  const page = await ctx.newPage();

  try {
    // Step 1: Navigate
    await page.goto('https://www.xiaohongshu.com', { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(3000);

    // Step 2: Click login
    for (const sel of ['text=登录', '.login-btn', '[class*="login"]']) {
      const btn = await page.$(sel);
      if (btn) { await btn.click(); await page.waitForTimeout(3000); break; }
    }

    // Step 3: Capture QR code
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

    // Step 4: Poll for auth success or SMS verification
    const start = Date.now();
    let smsNotified = false;

    while (Date.now() - start < TIMEOUT) {
      await page.waitForTimeout(3000);
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'current.png') });

      // Check login success
      const cookies = await ctx.cookies();
      const hasAuth = cookies.some(c =>
        c.domain.includes('xiaohongshu') &&
        (c.name.includes('customer') || c.name.includes('access') || c.name.includes('token'))
      );
      if (hasAuth) {
        console.log('LOGIN_SUCCESS');
        fs.mkdirSync(path.dirname(STATE_PATH), { recursive: true });
        await ctx.storageState({ path: STATE_PATH });
        console.log('STATE_SAVED=' + STATE_PATH);
        break;
      }

      // Detect SMS verification popup (class="r-input-inner", English placeholder)
      // This popup overlays on top of the login modal after QR scan + app confirm
      const smsInput = await page.$('input.r-input-inner');
      if (smsInput && !smsNotified) {
        const visible = await smsInput.isVisible().catch(() => false);
        if (visible) {
          smsNotified = true;
          console.log('SMS_VERIFICATION_NEEDED');
          console.log('SMS_SCREENSHOT=' + path.join(SCREENSHOT_DIR, 'current.png'));
        }
      }

      // Poll for SMS code file
      if (smsNotified && fs.existsSync(SMS_CODE_PATH)) {
        const code = fs.readFileSync(SMS_CODE_PATH, 'utf8').trim();
        if (code.length >= 4) {
          console.log('SMS_CODE_RECEIVED=' + code);
          const input = await page.$('input.r-input-inner');
          if (input) {
            await input.fill(code);
            console.log('SMS_CODE_FILLED');
            // No button click needed — auto-submits after filling
          }
          try { fs.unlinkSync(SMS_CODE_PATH); } catch {}
          await page.waitForTimeout(5000);
        }
      }
    }

    if (Date.now() - start >= TIMEOUT) {
      console.log('LOGIN_TIMEOUT');
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'timeout.png') });
    }
  } catch (err) {
    console.error('ERROR=' + err.message);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'error.png') }).catch(() => {});
  } finally {
    await browser.close();
  }
})();
