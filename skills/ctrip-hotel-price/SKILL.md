---
name: ctrip-hotel-price
version: "1.1.0"
description: Ctrip (携程) hotel price query tool. Use when checking hotel prices, comparing rates, or monitoring price changes on Ctrip via Playwright browser automation. Requires pre-authenticated storage state.
dependencies:
  mcps: []
prereq: references/SETUP.md
---

# Ctrip Hotel Price Skill

## Storage State

This skill requires a pre-authenticated browser state at `~/.swat/playwright/ctrip-storage-state.json`. If missing or expired, fail the operation — debrief will notify the user to re-authenticate.

## CLI Scripts

All scripts require `NODE_PATH=$(npm root -g)` to resolve playwright.

### Auth Check

```bash
NODE_PATH=$(npm root -g) node scripts/auth.js --check
```

Always exits 0. Outputs one of:
- `OK` — storage state exists and login is valid
- `EXPIRED` — storage state exists but login has expired
- `MISSING` — no storage state file found

Parse stdout to determine status. If expired or missing, fail the operation — debrief will notify the user to re-authenticate.

### Login

```bash
NODE_PATH=$(npm root -g) node scripts/auth.js --login --timeout 300
```

1. Opens Ctrip login page, screenshots QR code
2. Outputs `QR_SCREENSHOT=<path>` — send this image to the user to scan with Ctrip app
3. Waits for user to scan (up to `--timeout` seconds)
4. On success: outputs `LOGIN_SUCCESS` + `STATE_SAVED=<path>`
5. On timeout: outputs `LOGIN_TIMEOUT`

### Search Hotel Price

```bash
NODE_PATH=$(npm root -g) node scripts/search.js \
  --hotel "维也纳国际酒店苏州新区高铁站" \
  --city 苏州 \
  --checkin 2026-04-18 \
  --checkout 2026-04-19
```

**Arguments:**
- `--hotel` (required) — full hotel name as shown on Ctrip (must match search suggestion exactly)
- `--city` (required) — Chinese city name (see supported cities below)
- `--checkin` (optional) — check-in date, YYYY-MM-DD format (defaults to today; during 00:00-05:00 CST defaults to yesterday per Ctrip's 凌晨 convention)
- `--checkout` (optional) — check-out date, YYYY-MM-DD format (defaults to checkin + 1 day)

**Flow:** Opens m.ctrip.com mobile search → types hotel name → clicks matching suggestion → lands on list page → adjusts URL date params (c-in/c-out) → extracts price from reloaded page.

**Output:** JSON object:
```json
{
  "status": "success",
  "query": { "hotel": "...", "city": "...", "checkin": "...", "checkout": "..." },
  "date": "2026-04-18",
  "hotel": {
    "name": "维也纳国际酒店(苏州新区高铁站店)",
    "rating": 4.6,
    "price": 299,
    "originalPrice": 458
  }
}
```

Status values: `success`, `not_found`, `sold_out`, `error`. On error, the `message` field contains details. The script always outputs valid JSON, even on unexpected failures.

**Sold-out output** (`status: "sold_out"`):

When the matched hotel is sold out for the requested dates, the script extracts a reference price from the page's "这些日期还可订" suggestion if available.

```json
{
  "status": "sold_out",
  "query": { "hotel": "...", "city": "...", "checkin": "...", "checkout": "..." },
  "date": "2026-04-18",
  "hotel": {
    "name": "matched hotel name",
    "rating": 4.6,
    "price": null,
    "originalPrice": null,
    "soldOut": true,
    "referencePrice": { "dates": "4月19日-4月20日", "price": 299 }
  }
}
```

The `referencePrice` field is `null` if no alternative dates are suggested.

**Supported cities:** 北京, 上海, 广州, 深圳, 杭州, 苏州, 南京, 成都, 武汉, 西安, 重庆, 长沙, 厦门, 青岛, 大连, 天津, 三亚, 珠海, 昆明, 郑州, 合肥, 哈尔滨, 丽江, 桂林, 拉萨, 沈阳, 济南, 福州, 无锡, 宁波, 常州, 温州, 东莞

To add a new city: open m.ctrip.com, search the city, check the list page URL `d-city=NNN` for its ID, and add it to `CITY_MAP` in `search.js`.

## Anti-Detection

The scripts include:
- Random delays (1500–3500ms) between actions
- Realistic user agent and mobile viewport (375×812)
- Chinese locale (`zh-CN`)

## Hotel Matching

The search script types the full hotel name into the search box and clicks the matching suggestion from Ctrip's autocomplete. The hotel name must match exactly as shown on Ctrip. On the results list page, the script uses substring matching (first 6 chars) to locate the hotel card and extract pricing.

## Notes

- Storage state expires after days/weeks — fail and debrief if auth errors occur
- Add delays between requests to avoid rate limiting
- All content is Chinese — requires `fonts-noto-cjk` on the system
- Price extraction looks for `¥NNN` patterns: first match = current price, second = original/strikethrough price
- During 凌晨 (00:00-05:00 CST), Ctrip treats the previous calendar day as check-in date — the script handles this automatically
