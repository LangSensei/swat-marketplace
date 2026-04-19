---
name: hotel-scout
version: "1.4.0"
description: Batch hotel price comparison via Ctrip — queries multiple hotels and produces a structured comparison report with optional email delivery
dependencies:
  skills: [sop, ctrip-hotel-price, qq-email]
  mcps: []
---

# Hotel Scout Squad

## Domain

Batch hotel price comparison for Chinese domestic travel. Accepts a list of hotels with city and date range, queries each hotel's price via the ctrip-hotel-price skill, and produces a structured Chinese-language comparison report.

## Boundary

**In scope:**
- Querying hotel prices from Ctrip for a list of hotel names in a given city
- Comparing current prices, original/strikethrough prices, and discount rates across hotels
- Producing a structured markdown comparison table in Chinese
- Handling query failures gracefully (marking failed hotels in the report)
- Rate-limited sequential querying to avoid detection

**Out of scope:**
- Booking hotels or making reservations
- Price tracking over time or alerting on price changes
- Multi-city comparisons in a single operation (one city per run)
- Venue quality assessment, reviews, or recommendations beyond price data
- Modifying or extending the ctrip-hotel-price skill itself

## Write Access

(none — report and working files stay within the operation directory)

## Squad Playbook

### Prerequisites

Before any hotel queries, verify Ctrip authentication:

```bash
NODE_PATH=$(npm root -g) node <SKILL_DIR>/scripts/auth.js --check
```

If the output is not `OK`, stop immediately and debrief with an auth failure message. Do not attempt to run search queries without valid authentication.

> **NODE_PATH portability:** If `npm root -g` returns an incorrect path, set NODE_PATH manually to the directory containing the playwright module.

`<SKILL_DIR>` is the installed skill directory for `ctrip-hotel-price`. Resolve from your runtime context.

### Query Workflow

1. **Parse the brief** — Extract the hotel list, city name, check-in date, and check-out date from the operation brief. If the brief does not specify checkin/checkout dates, default to today→tomorrow (the search script handles this automatically when dates are omitted).

2. **Run auth check** — Execute the auth check command above. If it fails, stop and debrief.

3. **Query hotels sequentially** — For each hotel in the list, run:

   ```bash
   NODE_PATH=$(npm root -g) node <SKILL_DIR>/scripts/search.js \
     --hotel "<hotel-name>" --city "<city>" \
     [--checkin <YYYY-MM-DD>] [--checkout <YYYY-MM-DD>]
   ```

   - Wait a random delay of **5-10 seconds** between each query to avoid rate limiting and detection.
   - Capture the JSON output from each query.
   - If a query fails (non-zero exit, timeout, or error in JSON status), record it as failed and continue with the next hotel.

4. **Compile results** — Aggregate all successful and failed results into a structured dataset.

### Report Content

Report should include a Chinese-language comparison table. The table is **mandatory** — all queried hotels MUST appear in it regardless of success or failure.

```markdown
# 酒店价格查询报告
- 城市: <city>
- 日期: <checkin> → <checkout>
- 查询时间: <YYYY-MM-DD HH:MM>

| 酒店 | 当前价 | 划线价 | 折扣 | 优惠券 | 备注 |
|------|--------|--------|------|--------|------|
| 酒店名称 | ¥287 | ¥314 | 91% | 94折券(限额50元) | 3种房型可选 |
| 售罄酒店 | — | — | — | — | 售罄（参考: ¥242, 4月19日-20日） |
| 查询失败酒店 | — | — | — | — | 查询失败 |

共查询 N 家酒店，成功 M 家，售罄 S 家，失败 K 家，最低价: ¥XXX（酒店名）
```

**Table rules:**
- All queried hotels MUST appear in the table — no omissions
- Columns: 酒店 | 当前价 | 划线价 | 折扣 | 优惠券 | 备注
- Failed hotels show "—" for price columns (当前价, 划线价, 折扣, 优惠券) and "查询失败" in 备注
- Sold-out hotels (`status: "sold_out"`) show "—" for price columns and "售罄" in 备注; if `referencePrice` is available, append it: "售罄（参考: ¥242, 4月19日-20日）"
- Successful hotels show "—" in 备注 when there are no special notes
- Sort by current price ascending (cheapest first); sold-out hotels go after priced hotels; failed hotels go to the bottom
- Calculate discount as `round(current_price / original_price * 100)`
- **Promotions column:** If the hotel has `promotions` in the query result, summarize the coupons briefly (e.g. "94折券(限额50元)"). If no promotions, show "—"
- **Room types:** If the hotel has `rooms` in the query result, include the count in 备注 (e.g. "3种房型可选"). Optionally list the cheapest room type and price

**Summary line (mandatory):** After the table, include exactly one summary line in the format:
`共查询 N 家酒店，成功 M 家，售罄 S 家，失败 K 家，最低价: ¥XXX（酒店名）`
If all queries failed, replace the price portion with: `最低价: 无（全部失败）`

### Error Handling

- **Auth failure** — Stop immediately. Do not attempt any searches. Debrief with auth error.
- **Individual query failure** — Log the error, mark the hotel as "查询失败", continue with remaining hotels.
- **All queries fail** — Report the failure pattern. Check if it is an auth expiration (retry auth check) or a systemic issue.
- **Rate limiting detected** — Increase delay between queries. If persistent, stop and report partial results.

### Constraints

- One city per operation — do not mix cities in a single run
- Sequential queries only — do not parallelize Ctrip requests
- Minimum 5-second delay between queries
- All report output in Chinese
- All squad/skill configuration files in English

### Detail Section (per hotel)

For each successful hotel, include a detail section below the summary table:

```markdown
## <酒店名称>

**优惠券:**
- 优惠券 | 94折 | 无金额门槛 | 限额50元 | 春日酒店特惠券
（如无优惠券显示"无可用优惠券"）

**可订房型:**
| 房型 | 床型 | 面积 | 价格 | 划线价 | 标签 |
|------|------|------|------|--------|------|
| 高级大床房 | 1张1.8米大床 | 20-25㎡ | ¥296 | ¥312 | 十亿豪补 |
（如无房型数据显示"房型数据未获取"）
```

The detail section uses data from the `promotions` and `rooms` fields returned by ctrip-hotel-price v1.2.0. If these fields are `null`, display the fallback text as shown above.

### Email Delivery (Optional)

If the brief specifies an email recipient (e.g. "发送到 xxx@qq.com"), send the report via email after generating `report.html`:

```bash
NODE_PATH=$(npm root -g) node <QQ_EMAIL_SKILL_DIR>/scripts/send.js \
  --to "<recipient>" \
  --subject "酒店价格报告 - <city> <checkin>" \
  --body "共查询 N 家酒店，最低价 ¥XXX（酒店名）" \
  --html report.html
```

`<QQ_EMAIL_SKILL_DIR>` is the installed skill directory for `qq-email`. Resolve from your runtime context.

- The `--body` should contain the summary line (plain text fallback)
- The `--html` should point to the generated `report.html`
- If email sending fails, log the error but do NOT fail the operation — the report is still valid
- Email delivery is best-effort; Ctrip query results are the primary deliverable
