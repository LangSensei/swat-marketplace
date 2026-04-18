#!/usr/bin/env node
// Ctrip hotel auth — storage state management
// Usage:
//   NODE_PATH=$(npm root -g) node auth.js --check
//   NODE_PATH=$(npm root -g) node auth.js --login --timeout 300

const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const STORAGE_PATH = path.join(
  process.env.HOME || process.env.USERPROFILE,
  '.swat', 'playwright', 'ctrip-storage-state.json'
);

const BROWSER_OPTS = {
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  locale: 'zh-CN',
  viewport: { width: 1920, height: 1080 },
};

function parseArgs() {
  const args = process.argv.slice(2);
  return {
    check: args.includes('--check'),
    login: args.includes('--login'),
    timeout: (() => {
      const idx = args.indexOf('--timeout');
      return idx >= 0 && args[idx + 1] ? parseInt(args[idx + 1], 10) : 120;
    })(),
  };
}

async function check() {
  if (!fs.existsSync(STORAGE_PATH)) {
    console.log('MISSING');
    process.exit(1);
  }

  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
      ...BROWSER_OPTS,
      storageState: STORAGE_PATH,
    });
    const page = await context.newPage();

    await page.goto('https://my.ctrip.com/myinfo/OrderCenter/MyOrder', {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    });
    await page.waitForTimeout(3000);

    const url = page.url();
    const cookies = await context.cookies();
    const hasLogin = cookies.some(
      (c) => c.name.includes('cticket') || c.name.includes('DUID')
    );

    if (hasLogin && !url.includes('passport') && !url.includes('login')) {
      console.log('OK');
      process.exit(0);
    } else {
      console.log('EXPIRED');
      process.exit(1);
    }
  } catch (err) {
    console.log('EXPIRED');
    process.exit(1);
  } finally {
    if (browser) await browser.close();
  }
}

async function login(timeout) {
  const dir = path.dirname(STORAGE_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext(BROWSER_OPTS);
  const page = await context.newPage();

  try {
    await page.goto('https://passport.ctrip.com/user/login', {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    });
    await page.waitForTimeout(3000);

    // Click QR code login tab
    const qrBtns = await page.getByText(/\u626b\u7801/).all();
    if (qrBtns.length > 0) await qrBtns[0].click();
    await page.waitForTimeout(3000);

    // Screenshot the QR code
    const qrPath = path.join(dir, 'ctrip-qr.png');
    const qrImg = await page
      .locator(
        'img[class*=qr], img[class*=code], [class*=qrcode] img, canvas, [class*=qr-code]'
      )
      .first();
    if (await qrImg.isVisible().catch(() => false)) {
      await qrImg.screenshot({ path: qrPath });
    } else {
      await page.screenshot({ path: qrPath });
    }
    console.log(`QR_SCREENSHOT=${qrPath}`);

    // Poll for login success
    const pollInterval = 2000;
    const maxPolls = Math.ceil((timeout * 1000) / pollInterval);
    for (let i = 0; i < maxPolls; i++) {
      await page.waitForTimeout(pollInterval);
      const url = page.url();
      const cookies = await context.cookies();
      const hasLogin = cookies.some(
        (c) => c.name.includes('cticket') || c.name.includes('DUID')
      );
      if (
        (url.includes('ctrip.com') &&
          !url.includes('passport') &&
          !url.includes('login')) ||
        hasLogin
      ) {
        await context.storageState({ path: STORAGE_PATH });
        console.log('LOGIN_SUCCESS');
        console.log(`STATE_SAVED=${STORAGE_PATH}`);
        return;
      }
    }

    console.log('LOGIN_TIMEOUT');
    process.exit(1);
  } finally {
    await browser.close();
  }
}

(async () => {
  const opts = parseArgs();
  if (opts.check) {
    await check();
  } else if (opts.login) {
    await login(opts.timeout);
  } else {
    console.error('Usage:');
    console.error('  node auth.js --check              # Verify login status');
    console.error(
      '  node auth.js --login --timeout 300 # QR code login flow'
    );
    process.exit(1);
  }
})();
