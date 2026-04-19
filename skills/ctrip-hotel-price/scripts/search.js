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
  userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
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

      const hotelId = card.getAttribute('data-hotel');
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
      let referencePrice = null;
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
      } else {
        // Extract reference price from "这些日期还可订" within this card
        const tipIdx = lines.findIndex(l => l.includes('这些日期还可订'));
        if (tipIdx >= 0) {
          let date = null;
          for (let i = tipIdx + 1; i < Math.min(tipIdx + 10, lines.length); i++) {
            const dm = lines[i].match(/(\d+月\d+日)-(\d+月\d+日)/);
            if (dm && !date) date = lines[i];
            const pm = lines[i].match(/^(\d+)$/);
            if (pm && date) { referencePrice = { dates: date, price: parseInt(pm[1]) }; break; }
          }
        }
      }

      return { name, hotelId, price, originalPrice, rating, soldOut: isSoldOut, referencePrice };
    }

    // Fallback: text-based extraction
    const allLines = document.body.innerText.split('\n').map(l => l.trim()).filter(l => l);
    const hotelIdx = allLines.findIndex(l => l.includes(kw.substring(0, 6)));
    if (hotelIdx < 0) return null;

    const name = allLines[hotelIdx];

    // Determine the range of lines belonging to this hotel (up to next hotel or +20 lines)
    let endIdx = Math.min(hotelIdx + 20, allLines.length);
    for (let i = hotelIdx + 4; i < endIdx; i++) {
      if (allLines[i].includes('酒店') && allLines[i].length > 8
          && !allLines[i].includes(kw.substring(0, 6))) {
        endIdx = i;
        break;
      }
    }
    const hotelLines = allLines.slice(hotelIdx, endIdx);

    // Check sold-out within this hotel's text range
    const isSoldOut = hotelLines.some(l => l.includes('售完') || l.includes('满房'));

    let price = null;
    let originalPrice = null;
    let referencePrice = null;

    if (!isSoldOut) {
      for (const line of hotelLines) {
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
    } else {
      // Extract reference price from "这些日期还可订" within this hotel's lines
      const tipIdx = hotelLines.findIndex(l => l.includes('这些日期还可订'));
      if (tipIdx >= 0) {
        let date = null;
        for (let i = tipIdx + 1; i < Math.min(tipIdx + 10, hotelLines.length); i++) {
          const dm = hotelLines[i].match(/(\d+月\d+日)-(\d+月\d+日)/);
          if (dm && !date) date = hotelLines[i];
          const pm = hotelLines[i].match(/^(\d+)$/);
          if (pm && date) { referencePrice = { dates: date, price: parseInt(pm[1]) }; break; }
        }
      }
    }

    return { name, hotelId: null, price, originalPrice, rating: null, soldOut: isSoldOut, referencePrice };
  }, hotelName);
}


// ── Extract detail page: promotions + room types ──
// After finding the hotel on the list page, navigate to its detail page
// to extract booking promotions and room type information.
async function extractDetail(page, hotelId, checkin, checkout, cityId) {
  if (!hotelId) return { promotions: null, rooms: null };

  const url = `https://m.ctrip.com/webapp/hotel/hoteldetail/${hotelId}.html?checkIn=${checkin}&checkOut=${checkout}&cityId=${cityId}`;
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(8000);

  // Extract promotions summary text (visible before clicking 订房优惠)
  const promoSummary = await page.evaluate(() => {
    const allText = document.body.innerText;
    const lines = allText.split('\n').map(l => l.trim()).filter(l => l);
    const idx = lines.findIndex(l => l === '订房优惠');
    if (idx < 0) return null;
    return lines[idx + 1] || null;
  });

  // Click 订房优惠 to open detailed promotion popup
  let promoDetails = [];
  const promoEl = page.locator('text=订房优惠').first();
  if (await promoEl.isVisible().catch(() => false)) {
    await promoEl.click();
    await page.waitForTimeout(3000);

    // Extract each coupon from the popup.
    // Ctrip uses Private Use Area Unicode chars (U+E000-U+F8FF) for icon fonts —
    // we strip these to get clean text.
    // Each coupon ends with "立即领取" (booking coupons) or "去领取" (external/天降 coupons).
    // We only collect booking coupons (立即领取).
    promoDetails = await page.evaluate(() => {
      const text = document.body.innerText;
      const clean = (s) => s.replace(/[\uE000-\uF8FF\u200B-\u200D\uFEFF\u00A0\uFFFC]/g, '').replace(/\s+/g, ' ').trim();
      const lines = text.split('\n').map(clean).filter(l => l.length > 0);
      const detailIdx = lines.findIndex(l => l === '优惠详情');
      if (detailIdx < 0) return [];

      const coupons = [];
      let current = [];
      let i = detailIdx + 1;
      while (i < lines.length && i < detailIdx + 50) {
        const line = lines[i];
        if (line === '查看房型' || line === '问酒店' || line.startsWith('携程酒店')) break;

        if (line === '立即领取') {
          // End of a booking coupon — join fields with pipe separator
          if (current.length > 0) {
            coupons.push(current.join(' | '));
          }
          current = [];
        } else if (line === '去领取') {
          // Skip 天降/external coupons — only collect 订房优惠 popup coupons
          current = [];
        } else if (line && line !== '优惠详情') {
          current.push(line);
        }
        i++;
      }
      if (current.length > 0) {
        const text = current.join(' | ');
        if (text) coupons.push(text);
      }
      return coupons.filter(c => c);
    });

    // Close popup
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(1000);
  }

  // Scroll through room section to load all rooms
  for (let i = 0; i < 5; i++) {
    await page.evaluate(() => window.scrollBy(0, 600));
    await page.waitForTimeout(1000);
  }

  // Extract room types from the detail page
  const rooms = await page.evaluate(() => {
    const text = document.body.innerText;
    const lines = text.split('\n').map(l => l.trim()).filter(l => l);

    const rooms = [];
    let i = 0;

    // Room type keywords for matching room name lines
    const roomKeywords = ['大床房', '双床房', '家庭房', '套房', '标准间', '商务房', '豪华房', '行政房', '影院房', '露台房', '亲子房', '主题房', '圆床房', '榻榻米房', '水床房', '钟点房', '特价房', '单人房', '三人房', '四人房', '高低床房', '胶囊房'];
    const isRoomName = (line) => roomKeywords.some(k => line.includes(k)) && line.length < 30;

    // Find the boundary where room listings end (footer/SEO sections)
    const footerKeywords = ['价格说明', '携程酒店官网', '快速链接', '品牌酒店', '欢迎光临'];
    const footerIdx = lines.findIndex(l => footerKeywords.some(k => l.includes(k)));
    const roomEndIdx = footerIdx > 0 ? footerIdx : lines.length;

    while (i < roomEndIdx) {
      if (!isRoomName(lines[i])) { i++; continue; }

      const room = { name: lines[i], bed: null, area: null, price: null, originalPrice: null, discount: null, tags: [], soldOut: false };
      i++;

      // Parse following lines for this room's attributes
      let lineCount = 0;
      while (i < roomEndIdx && lineCount < 25) {
        const l = lines[i];
        // Stop if next room starts
        if (isRoomName(l)) break;
        // Stop at non-room sections
        if (['住客点评', '设施服务', '位置周边', '订房必读', '酒店政策', '钟点房', '价格说明', '携程酒店', '快速链接', '问酒店'].some(s => l.startsWith(s))) break;

        // Bed info (must be short to avoid SEO text matching)
        if (l.match(/张.*床/) && l.length < 40) { room.bed = l; }
        // Room area
        else if (l.match(/^\d+[-\d]*㎡$/)) { room.area = l; }
        // Sold out marker
        else if (l === '已订完') { room.soldOut = true; }
        // Price (standalone number on its own line)
        else if (l.match(/^\d+$/) && parseInt(l) > 50 && parseInt(l) < 100000) {
          const p = parseInt(l);
          if (!room.originalPrice && !room.price) { room.originalPrice = p; }
          else if (room.originalPrice && !room.price) {
            if (p < room.originalPrice) room.price = p;
            else { room.price = room.originalPrice; room.originalPrice = p; }
          }
        }
        // Discount tags
        else if (l.match(/^\d+项优惠\d+$/) || l.match(/^优惠\d+$/)) { room.discount = l; }
        else if (l === '十亿豪补') { room.tags.push(l); }
        // Promotion tags
        else if (['新客体验钻石', '门店首单', '品牌首单'].includes(l)) { room.tags.push(l); }
        else if (l.match(/^\d+\.\d折$/)) { room.tags.push(l); }
        // Remaining stock
        else if (l.match(/^仅剩\d+间$/)) { room.tags.push(l); }

        i++;
        lineCount++;
      }

      // Only add if we got meaningful data
      if (room.price || room.soldOut) {
        rooms.push(room);
      }
    }
    return rooms;
  });

  return {
    promotions: promoDetails.length > 0 ? promoDetails : (promoSummary ? [promoSummary] : null),
    rooms: rooms.length > 0 ? rooms : null,
  };
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

    // Step 4: Extract basic info from list page (price + hotel ID)
    const result = await extractResult(page, opts.hotel);

    if (!result) {
      await context.storageState({ path: STORAGE_PATH });
      output({
        status: 'not_found',
        query: { hotel: opts.hotel, city: opts.city, checkin, checkout },
        date: new Date(Date.now() + 8 * 3600 * 1000).toISOString().split('T')[0],
        hotel: null,
      });
    } else if (result.soldOut) {
      await context.storageState({ path: STORAGE_PATH });
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
          referencePrice: result.referencePrice,
          promotions: null,
          rooms: null,
        },
      });
    } else {
      // Step 5: Visit detail page for promotions + room types
      await page.waitForTimeout(randomDelay());
      const detail = await extractDetail(page, result.hotelId, checkin, checkout, cityId);

      // Save session state after all page interactions are done
      await context.storageState({ path: STORAGE_PATH });

      output({
        status: 'success',
        query: { hotel: opts.hotel, city: opts.city, checkin, checkout },
        date: new Date(Date.now() + 8 * 3600 * 1000).toISOString().split('T')[0],
        hotel: {
          name: result.name,
          rating: result.rating,
          price: result.price,
          originalPrice: result.originalPrice,
          promotions: detail.promotions,
          rooms: detail.rooms,
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
