#!/usr/bin/env node
// Ctrip hotel price search (m.ctrip.com mobile web)
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
  viewport: { width: 375, height: 812 },
};

// City name → Ctrip city ID (verified 2026-04-18 via live search)
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

// Compute default checkin/checkout in YYYY-MM-DD (UTC+8).
//
// Ctrip mobile web date semantics:
//   Between 00:00-05:00 CST (凌晨), the site treats the previous calendar day
//   as "today" for check-in. So default c-in = yesterday, c-out = today.
//   After 05:00, normal: c-in = today, c-out = tomorrow.
function defaultDates(checkin, checkout) {
  const fmt = (d) => d.toISOString().split('T')[0];
  const nowCST = new Date(Date.now() + 8 * 3600 * 1000);
  const hour = nowCST.getUTCHours();
  const isLingchen = hour >= 0 && hour < 5;

  if (!checkin) {
    if (isLingchen) {
      const yesterday = new Date(nowCST);
      yesterday.setUTCDate(yesterday.getUTCDate() - 1);
      checkin = fmt(yesterday);
    } else {
      checkin = fmt(nowCST);
    }
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

function output(obj) {
  console.log(JSON.stringify(obj, null, 2));
}

// ── Search flow ──
// 1. Open search page (dates ignored by search page — it uses its own defaults)
// 2. Type hotel name → click suggestion → lands on list page
// 3. Modify the list page URL to inject our desired c-in / c-out
// 4. Extract price from the reloaded list page
async function searchHotel(page, hotelName) {
  await page.locator('text=位置/品牌/酒店').first().click();
  await page.waitForTimeout(2000);

  const input = page.locator('input:not([type=hidden]):visible').first();
  await input.fill(hotelName);
  await page.waitForTimeout(3000);

  const suggestion = page.locator(`text=${hotelName}`).first();
  if (!(await suggestion.isVisible().catch(() => false))) {
    return { found: false, reason: 'no_suggestion' };
  }
  await suggestion.click();
  await page.waitForTimeout(8000);

  return { found: true };
}

// Rewrite c-in and c-out in the current list page URL and navigate
async function adjustDates(page, checkin, checkout) {
  const currentUrl = page.url();
  let newUrl = currentUrl
    .replace(/c-in=[^&]+/, `c-in=${checkin}`)
    .replace(/c-out=[^&]+/, `c-out=${checkout}`);
  // If c-in/c-out not in URL, append them
  if (!newUrl.includes('c-in=')) newUrl += `&c-in=${checkin}`;
  if (!newUrl.includes('c-out=')) newUrl += `&c-out=${checkout}`;

  await page.goto(newUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(6000);
}

// ── Extract result from hotel list page ──
async function extractResult(page, hotelName) {
  await page.evaluate(() => window.scrollBy(0, 600));
  await page.waitForTimeout(2000);

  return page.evaluate((kw) => {
    // Try .hotel-card elements first
    const cards = document.querySelectorAll('.hotel-card');
    for (const card of cards) {
      const text = card.innerText || '';
      if (!text.includes(kw.substring(0, 6))) continue;

      const soldOutImg = card.querySelector('img[src*=fullbooking]');
      const soldOutDiv = card.querySelector('[class*=noStock]');
      const isSoldOut = !!(soldOutImg || soldOutDiv);

      const lines = text.split('\n').map(l => l.trim()).filter(l => l);
      const name = lines[0] || kw;

      let rating = null;
      for (const line of lines) {
        const m = line.match(/^(\d\.\d)$/);
        if (m) { rating = parseFloat(m[1]); break; }
      }

      let price = null;
      let originalPrice = null;
      if (!isSoldOut) {
        for (const line of lines) {
          const m = line.match(/^¥?(\d+)$/);
          if (m) {
            const p = parseInt(m[1]);
            if (p > 10 && p < 100000) {
              if (!price) { price = p; }
              else if (!originalPrice && p !== price) {
                if (p > price) originalPrice = p;
                else { originalPrice = price; price = p; }
                break;
              }
            }
          }
        }
      }

      return { name, price, originalPrice, rating, soldOut: isSoldOut };
    }

    // Fallback: text-based extraction
    const allLines = document.body.innerText.split('\n').map(l => l.trim()).filter(l => l);
    const hotelIdx = allLines.findIndex(l => l.includes(kw.substring(0, 6)));
    if (hotelIdx < 0) return null;

    const name = allLines[hotelIdx];

    let isSoldOut = false;
    const fbImg = document.querySelector('img[src*=fullbooking]');
    const noStockEl = document.querySelector('[class*=noStock]');
    if (fbImg || noStockEl) {
      let parent = (fbImg || noStockEl).parentElement;
      for (let i = 0; i < 5; i++) {
        if (parent && parent.innerText?.includes(kw.substring(0, 6))) {
          isSoldOut = true;
          break;
        }
        parent = parent?.parentElement;
      }
    }

    let price = null;
    let originalPrice = null;
    if (!isSoldOut) {
      for (let i = hotelIdx + 1; i < Math.min(hotelIdx + 20, allLines.length); i++) {
        const m = allLines[i].match(/^¥?(\d+)$/);
        if (m) {
          const p = parseInt(m[1]);
          if (p > 10 && p < 100000) {
            if (!price) { price = p; }
            else if (!originalPrice && p !== price) {
              if (p > price) originalPrice = p;
              else { originalPrice = price; price = p; }
              break;
            }
          }
        }
        if (i > hotelIdx + 3 && allLines[i].includes('酒店') && allLines[i].length > 8
            && !allLines[i].includes(kw.substring(0, 6))) break;
      }
    }

    return { name, price, originalPrice, rating: null, soldOut: isSoldOut };
  }, hotelName);
}

// ── Main ──
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

    // Step 1: Open search page (no date params — they're ignored here)
    await page.goto('https://m.ctrip.com/webapp/hotels/hotelsearch/search', {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    });
    await page.waitForTimeout(6000);

    // Step 2: Search hotel → lands on list page with default dates
    const searchResult = await searchHotel(page, opts.hotel);
    if (!searchResult.found) {
      output({
        status: 'not_found',
        query: { hotel: opts.hotel, city: opts.city, checkin, checkout },
        date: new Date(Date.now() + 8 * 3600 * 1000).toISOString().split('T')[0],
        hotel: null,
        message: `No search suggestion found for "${opts.hotel}"`,
      });
      await context.storageState({ path: STORAGE_PATH });
      return;
    }

    // Step 3: Adjust dates by rewriting URL c-in/c-out and reloading
    await adjustDates(page, checkin, checkout);

    // Step 4: Extract result
    const result = await extractResult(page, opts.hotel);
    await context.storageState({ path: STORAGE_PATH });

    if (!result) {
      output({
        status: 'not_found',
        query: { hotel: opts.hotel, city: opts.city, checkin, checkout },
        date: new Date(Date.now() + 8 * 3600 * 1000).toISOString().split('T')[0],
        hotel: null,
      });
    } else if (result.soldOut) {
      // Try to extract a reference price for nearby available dates
      const referencePrice = await page.evaluate(() => {
          const lines = document.body.innerText.split('\n').map(l => l.trim()).filter(l => l);
          const tipIdx = lines.findIndex(l => l.includes('这些日期还可订'));
          if (tipIdx < 0) return null;
          let date = null;
          let price = null;
          for (let i = tipIdx + 1; i < Math.min(tipIdx + 10, lines.length); i++) {
            const dm = lines[i].match(/(\d+月\d+日)-(\d+月\d+日)/);
            if (dm && !date) date = lines[i];
            const pm = lines[i].match(/^(\d+)$/);
            if (pm && date && !price) {
              price = parseInt(pm[1]);
              break;
            }
          }
          if (date && price) return { dates: date, price };
          return null;
        });

      output({
        status: 'sold_out',
        query: { hotel: opts.hotel, city: opts.city, checkin, checkout },
        date: new Date(Date.now() + 8 * 3600 * 1000).toISOString().split('T')[0],
        hotel: {
          name: result.name,
          rating: result.rating,
          price: null,
          originalPrice: null,
          soldOut: true,
          referencePrice,
        },
      });
    } else {
      output({
        status: 'success',
        query: { hotel: opts.hotel, city: opts.city, checkin, checkout },
        date: new Date(Date.now() + 8 * 3600 * 1000).toISOString().split('T')[0],
        hotel: {
          name: result.name,
          rating: result.rating,
          price: result.price,
          originalPrice: result.originalPrice,
        },
      });
    }
  } catch (err) {
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
    console.error('  node search.js --hotel "hotel name" --city city [--checkin YYYY-MM-DD] [--checkout YYYY-MM-DD]');
    console.error('');
    console.error('Supported cities: ' + Object.keys(CITY_MAP).join(', '));
    process.exit(1);
  }
  await search(opts);
})();
