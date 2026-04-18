#!/usr/bin/env node
// Ctrip hotel price search
// Usage:
//   NODE_PATH=$(npm root -g) node search.js --hotel "name" --city city
//   NODE_PATH=$(npm root -g) node search.js --hotel "name" --city city --checkin 2026-04-19 --checkout 2026-04-20

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

const CITY_MAP = {
  '\u5317\u4eac': 1,
  '\u4e0a\u6d77': 2,
  '\u897f\u5b89': 7,
  '\u5357\u4eac': 9,
  '\u676d\u5dde': 14,
  '\u82cf\u5dde': 17,
  '\u53a6\u95e8': 21,
  '\u6df1\u5733': 26,
  '\u6210\u90fd': 28,
  '\u6606\u660e': 31,
  '\u5e7f\u5dde': 32,
  '\u73e0\u6d77': 33,
  '\u4e09\u4e9a': 43,
  '\u5927\u8fde': 122,
  '\u957f\u6c99': 148,
  '\u5929\u6d25': 154,
  '\u91cd\u5e86': 158,
  '\u90d1\u5dde': 184,
  '\u9752\u5c9b': 223,
  '\u5408\u80a5': 452,
  '\u6b66\u6c49': 477,
};

function parseArgs() {
  const args = process.argv.slice(2);
  const getOpt = (name) => {
    const idx = args.indexOf(`--${name}`);
    return idx >= 0 && args[idx + 1] ? args[idx + 1] : null;
  };
  return {
    hotel: getOpt('hotel'),
    city: getOpt('city') || '\u82cf\u5dde',
    checkin: getOpt('checkin') || '',
    checkout: getOpt('checkout') || '',
  };
}

function randomDelay(min = 1500, max = 3500) {
  return min + Math.random() * (max - min);
}

function shortKeyword(kw) {
  let s = kw
    .replace(/[\uff08\u0028][^\uff09\u0029]*[\uff09\u0029]/g, '')
    .replace(/\u9152\u5e97|\u5bbe\u9986|\u5e97$/g, '')
    .trim();
  if (s.length > 6) s = s.substring(0, 6);
  return s;
}

async function search(opts) {
  if (!fs.existsSync(STORAGE_PATH)) {
    console.log(JSON.stringify({
      status: 'error',
      message: 'Not logged in. Run: NODE_PATH=$(npm root -g) node auth.js --login',
    }));
    process.exit(1);
  }

  const cityId = CITY_MAP[opts.city];
  if (!cityId) {
    console.log(JSON.stringify({
      status: 'error',
      message: `Unsupported city: ${opts.city}. Supported: ${Object.keys(CITY_MAP).join(', ')}`,
    }));
    process.exit(1);
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    ...BROWSER_OPTS,
    storageState: STORAGE_PATH,
  });
  const page = await context.newPage();

  try {
    await page.waitForTimeout(randomDelay());

    // Navigate to city hotel list
    await page.goto(
      `https://hotels.ctrip.com/hotels/list?countryId=1&city=${cityId}`,
      { waitUntil: 'domcontentloaded', timeout: 30000 }
    );
    await page.waitForTimeout(4000 + Math.random() * 2000);

    // Select destination city via dropdown
    const destInput = page.locator('input[placeholder="\u76ee\u7684\u5730"]');
    if (await destInput.isVisible().catch(() => false)) {
      await destInput.click({ clickCount: 3 });
      await destInput.fill(opts.city);
      await page.waitForTimeout(2000);
      const citySpan = page.locator(`span:text-is("${opts.city}")`).first();
      await citySpan.click().catch(async () => {
        await destInput.press('Enter');
      });
      await page.waitForTimeout(1500);
    }

    // Extract short keyword and fill hotel search input
    const shortKw = shortKeyword(opts.hotel);
    const hotelInput = page.locator('input[placeholder*="\u9152\u5e97"]');
    if (await hotelInput.isVisible().catch(() => false)) {
      await hotelInput.click();
      await page.waitForTimeout(300);
      await hotelInput.fill(shortKw);
      await page.waitForTimeout(randomDelay(1000, 2000));
      const searchBtn = page
        .locator('button:has-text("\u641c\u7d22"), [class*=search-btn]')
        .first();
      if (await searchBtn.isVisible().catch(() => false)) {
        await searchBtn.click();
      } else {
        await hotelInput.press('Enter');
      }
    }

    await page.waitForTimeout(6000 + Math.random() * 2000);

    // Scroll to trigger lazy loading
    await page.evaluate(() => window.scrollBy(0, 600));
    await page.waitForTimeout(2000);

    // Extract hotel name and price using ngram fuzzy matching
    const result = await page.evaluate((kw) => {
      const body = document.body.innerText;
      const lines = body.split('\n').map((l) => l.trim()).filter((l) => l);

      // Build ngram segments from hotel keyword
      const clean = kw
        .replace(/[\uff08\u0028][^\uff09\u0029]*[\uff09\u0029]/g, '')
        .replace(/\u9152\u5e97|\u5bbe\u9986|\u5e97/g, '');
      const chars = clean.match(/[\u4e00-\u9fff]/g) || [];
      const segments = new Set();
      for (let i = 0; i < chars.length - 1; i++)
        segments.add(chars[i] + chars[i + 1]);
      for (let i = 0; i < chars.length - 2; i++)
        segments.add(chars[i] + chars[i + 1] + chars[i + 2]);
      const segs = [...segments];

      // Find best matching hotel line by ngram score
      let hotelName = null;
      let hotelIdx = -1;
      let bestScore = 0;

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line.length < 4 || line.length > 60) continue;
        if (line.startsWith('\u00a5') || line.match(/^\d/)) continue;
        if (!line.includes('\u9152\u5e97') && !line.includes('\u5bbe\u9986'))
          continue;

        let score = 0;
        for (const seg of segs) {
          if (line.includes(seg)) score += seg.length;
        }
        if (score > bestScore) {
          bestScore = score;
          hotelName = line;
          hotelIdx = i;
        }
      }

      if (!hotelName || hotelIdx < 0) return null;

      // Scan lines below matched hotel for price patterns
      let price = null;
      let originalPrice = null;
      for (
        let i = hotelIdx + 1;
        i < Math.min(hotelIdx + 20, lines.length);
        i++
      ) {
        const m = lines[i].match(/^\u00a5(\d+)$/);
        if (m) {
          const p = parseInt(m[1]);
          if (!price) {
            price = p;
          } else if (!originalPrice && p !== price) {
            if (p > price) {
              originalPrice = p;
            } else {
              originalPrice = price;
              price = p;
            }
            break;
          }
        }
        // Stop if we hit another hotel listing
        if (
          i > hotelIdx + 3 &&
          lines[i].includes('\u9152\u5e97') &&
          lines[i].length > 8 &&
          !lines[i].includes('\u00a5') &&
          !lines[i].includes(hotelName.substring(0, 4))
        ) {
          break;
        }
      }

      return { name: hotelName, price, originalPrice };
    }, opts.hotel);

    // Update storage state to keep session alive
    await context.storageState({ path: STORAGE_PATH });

    const output = {
      status: result ? 'success' : 'not_found',
      query: {
        hotel: opts.hotel,
        city: opts.city,
        checkin: opts.checkin || 'today',
        checkout: opts.checkout || 'tomorrow',
      },
      date: new Date().toISOString().split('T')[0],
      hotel: result,
    };

    console.log(JSON.stringify(output, null, 2));
  } finally {
    await browser.close();
  }
}

(async () => {
  const opts = parseArgs();
  if (!opts.hotel) {
    console.error('Usage:');
    console.error(
      '  node search.js --hotel "hotel name" --city city [--checkin YYYY-MM-DD] [--checkout YYYY-MM-DD]'
    );
    console.error('');
    console.error(
      'Supported cities: ' + Object.keys(CITY_MAP).join(', ')
    );
    process.exit(1);
  }
  await search(opts);
})();
