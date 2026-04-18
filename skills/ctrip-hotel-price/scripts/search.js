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

// City name → Ctrip city ID (verified 2026-04-18 via live search)
// To find a new city ID: open hotels.ctrip.com, search the city, check the redirected URL cityId=NNN
const CITY_MAP = {
  '北京': 1, '上海': 2, '天津': 3, '重庆': 4, '哈尔滨': 5,
  '大连': 6, '青岛': 7, '西安': 10, '南京': 12, '无锡': 13,
  '苏州': 14, '杭州': 17, '厦门': 25, '成都': 28, '深圳': 30,
  '珠海': 31, '广州': 32, '桂林': 33, '昆明': 34, '丽江': 37,
  '拉萨': 41, '三亚': 43, '济南': 144, '长沙': 206, '常州': 213,
  '东莞': 223, '福州': 258, '合肥': 278, '宁波': 375, '沈阳': 451,
  '武汉': 477, '温州': 491, '郑州': 559,
};

function parseArgs() {
  const args = process.argv.slice(2);
  const getOpt = (name) => {
    const idx = args.indexOf(`--${name}`);
    return idx >= 0 && args[idx + 1] ? args[idx + 1] : null;
  };
  return {
    hotel: getOpt('hotel'),
    city: getOpt('city') || '苏州',
    checkin: getOpt('checkin') || '',
    checkout: getOpt('checkout') || '',
  };
}

// Compute default checkin (today) and checkout (tomorrow) in YYYY-MM-DD
// Uses UTC+8 (China Standard Time) since hotel check-in is local time
function defaultDates(checkin, checkout) {
  const fmt = (d) => d.toISOString().split('T')[0];
  if (!checkin) {
    // UTC+8: add 8 hours to UTC
    const now = new Date(Date.now() + 8 * 3600 * 1000);
    checkin = fmt(now);
  }
  if (!checkout) {
    const next = new Date(checkin + 'T00:00:00Z');
    next.setDate(next.getDate() + 1);
    checkout = fmt(next);
  }
  return { checkin, checkout };
}

function randomDelay(min = 1500, max = 3500) {
  return min + Math.random() * (max - min);
}

// Extract short brand keyword for the search box (≤6 Chinese chars)
// Removes parenthesized content and generic suffixes like 酒店/宾馆
function shortKeyword(kw) {
  let s = kw
    .replace(/[（(][^）)]*[）)]/g, '')
    .replace(/酒店|宾馆|店$/g, '')
    .trim();
  if (s.length > 6) s = s.substring(0, 6);
  return s;
}

// Output structured JSON result — always exits cleanly for callers
function output(obj) {
  console.log(JSON.stringify(obj, null, 2));
}

async function search(opts) {
  if (!fs.existsSync(STORAGE_PATH)) {
    output({
      status: 'error',
      message: 'Not logged in. Run: NODE_PATH=$(npm root -g) node auth.js --login',
    });
    process.exit(1);
  }

  const cityId = CITY_MAP[opts.city];
  if (!cityId) {
    output({
      status: 'error',
      message: `Unsupported city: ${opts.city}. Supported: ${Object.keys(CITY_MAP).join(', ')}`,
    });
    process.exit(1);
  }

  const { checkin, checkout } = defaultDates(opts.checkin, opts.checkout);

  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
      ...BROWSER_OPTS,
      storageState: STORAGE_PATH,
    });
    const page = await context.newPage();

    await page.waitForTimeout(randomDelay());

    // Navigate to city hotel list with checkin/checkout in URL
    const listUrl = `https://hotels.ctrip.com/hotels/list?countryId=1&city=${cityId}&checkin=${checkin}&checkout=${checkout}`;
    await page.goto(listUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(4000 + Math.random() * 2000);

    // Select destination city via dropdown (cookie may override URL city param)
    const destInput = page.locator('input[placeholder="目的地"]');
    if (await destInput.isVisible().catch(() => false)) {
      await destInput.click({ clickCount: 3 });
      await destInput.fill(opts.city);
      await page.waitForTimeout(2000);
      // Must use span:text-is() — getByText matches too many elements
      const citySpan = page.locator(`span:text-is("${opts.city}")`).first();
      await citySpan.click().catch(async () => {
        await destInput.press('Enter');
      });
      await page.waitForTimeout(1500);
    }

    // Fill hotel search input with short keyword
    const shortKw = shortKeyword(opts.hotel);
    const hotelInput = page.locator('input[placeholder*="酒店"]');
    if (await hotelInput.isVisible().catch(() => false)) {
      await hotelInput.click();
      await page.waitForTimeout(300);
      await hotelInput.fill(shortKw);
      await page.waitForTimeout(randomDelay(1000, 2000));
      const searchBtn = page
        .locator('button:has-text("搜索"), [class*=search-btn]')
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

    // Extract hotel name, price, and sold-out status using ngram fuzzy matching
    const result = await page.evaluate((kw) => {
      const body = document.body.innerText;
      const lines = body.split('\n').map((l) => l.trim()).filter((l) => l);

      // Build ngram segments from full keyword (including parenthesized branch name)
      // Only strip generic suffixes — keep branch/location info for accurate matching
      const clean = kw.replace(/酒店|宾馆/g, '');
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
        if (line.startsWith('¥') || line.match(/^\d/)) continue;
        if (!line.includes('酒店') && !line.includes('宾馆')) continue;

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

      // Check for sold-out indicators near the matched hotel
      let soldOut = false;
      for (let i = hotelIdx; i < Math.min(hotelIdx + 15, lines.length); i++) {
        if (lines[i].includes('售罄') || lines[i].includes('已订完')) {
          soldOut = true;
          break;
        }
        // Stop if we hit another hotel listing
        if (
          i > hotelIdx + 3 &&
          lines[i].includes('酒店') &&
          lines[i].length > 8 &&
          !lines[i].includes('¥') &&
          !lines[i].includes(hotelName.substring(0, 4))
        ) {
          break;
        }
      }

      // Scan lines below matched hotel for ¥NNN price patterns
      // First match = current price, second (if higher) = original/strikethrough price
      let price = null;
      let originalPrice = null;
      if (!soldOut) {
        for (let i = hotelIdx + 1; i < Math.min(hotelIdx + 20, lines.length); i++) {
          const m = lines[i].match(/^¥(\d+)$/);
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
            lines[i].includes('酒店') &&
            lines[i].length > 8 &&
            !lines[i].includes('¥') &&
            !lines[i].includes(hotelName.substring(0, 4))
          ) {
            break;
          }
        }
      }

      return { name: hotelName, price, originalPrice, soldOut };
    }, opts.hotel);

    // If hotel is sold out, retry next 3 days for a reference price
    let referencePrice = null;
    if (result && result.soldOut) {
      const baseDate = new Date(checkin + 'T00:00:00Z');
      for (let offset = 1; offset <= 3; offset++) {
        const retryCheckin = new Date(baseDate);
        retryCheckin.setDate(retryCheckin.getDate() + offset);
        const retryCheckout = new Date(retryCheckin);
        retryCheckout.setDate(retryCheckout.getDate() + 1);
        const retryCI = retryCheckin.toISOString().split('T')[0];
        const retryCO = retryCheckout.toISOString().split('T')[0];

        await page.waitForTimeout(randomDelay());

        const retryUrl = `https://hotels.ctrip.com/hotels/list?countryId=1&city=${cityId}&checkin=${retryCI}&checkout=${retryCO}&keyword=${encodeURIComponent(shortKeyword(opts.hotel))}`;
        await page.goto(retryUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
        await page.waitForTimeout(4000 + Math.random() * 2000);
        await page.evaluate(() => window.scrollBy(0, 600));
        await page.waitForTimeout(2000);

        const retryResult = await page.evaluate((kw) => {
          const body = document.body.innerText;
          const lines = body.split('\n').map((l) => l.trim()).filter((l) => l);

          const clean = kw.replace(/酒店|宾馆/g, '');
          const chars = clean.match(/[\u4e00-\u9fff]/g) || [];
          const segments = new Set();
          for (let i = 0; i < chars.length - 1; i++)
            segments.add(chars[i] + chars[i + 1]);
          for (let i = 0; i < chars.length - 2; i++)
            segments.add(chars[i] + chars[i + 1] + chars[i + 2]);
          const segs = [...segments];

          let hotelName = null;
          let hotelIdx = -1;
          let bestScore = 0;
          for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            if (line.length < 4 || line.length > 60) continue;
            if (line.startsWith('¥') || line.match(/^\d/)) continue;
            if (!line.includes('酒店') && !line.includes('宾馆')) continue;
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

          // Check if still sold out on this date
          for (let i = hotelIdx; i < Math.min(hotelIdx + 15, lines.length); i++) {
            if (lines[i].includes('售罄') || lines[i].includes('已订完')) return null;
            if (
              i > hotelIdx + 3 &&
              lines[i].includes('酒店') &&
              lines[i].length > 8 &&
              !lines[i].includes('¥') &&
              !lines[i].includes(hotelName.substring(0, 4))
            ) break;
          }

          let price = null;
          for (let i = hotelIdx + 1; i < Math.min(hotelIdx + 20, lines.length); i++) {
            const m = lines[i].match(/^¥(\d+)$/);
            if (m) { price = parseInt(m[1]); break; }
            if (
              i > hotelIdx + 3 &&
              lines[i].includes('酒店') &&
              lines[i].length > 8 &&
              !lines[i].includes('¥') &&
              !lines[i].includes(hotelName.substring(0, 4))
            ) break;
          }
          return price;
        }, opts.hotel);

        if (retryResult) {
          referencePrice = { checkin: retryCI, checkout: retryCO, price: retryResult };
          break;
        }
      }
    }

    // Update storage state to keep session alive
    await context.storageState({ path: STORAGE_PATH });

    if (result && result.soldOut) {
      output({
        status: 'sold_out',
        query: { hotel: opts.hotel, city: opts.city, checkin, checkout },
        date: new Date(Date.now() + 8 * 3600 * 1000).toISOString().split('T')[0],
        hotel: {
          name: result.name,
          price: null,
          originalPrice: null,
          soldOut: true,
          referencePrice,
        },
      });
    } else {
      output({
        status: result ? 'success' : 'not_found',
        query: { hotel: opts.hotel, city: opts.city, checkin, checkout },
        date: new Date(Date.now() + 8 * 3600 * 1000).toISOString().split('T')[0],
        hotel: result ? { name: result.name, price: result.price, originalPrice: result.originalPrice } : null,
      });
    }
  } catch (err) {
    // Structured error output so callers always get parseable JSON
    output({
      status: 'error',
      message: err.message || String(err),
      query: { hotel: opts.hotel, city: opts.city },
    });
    process.exit(1);
  } finally {
    if (browser) await browser.close();
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
    console.error('Supported cities: ' + Object.keys(CITY_MAP).join(', '));
    process.exit(1);
  }
  await search(opts);
})();
