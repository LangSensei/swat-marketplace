---
name: hotel-scout
version: "1.0.0"
description: Batch hotel price comparison via Ctrip — queries multiple hotels and produces a structured comparison report
dependencies:
  skills: [sop, ctrip-hotel-price]
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

`<SKILL_DIR>` is the installed skill directory for `ctrip-hotel-price`. Resolve from your runtime context.

### Query Workflow

1. **Parse the brief** — Extract the hotel list, city name, check-in date, and check-out date from the operation brief.

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

Report should include a Chinese-language comparison table with the following structure:

```markdown
# 酒店价格查询报告
- 城市: <city>
- 日期: <checkin> → <checkout>
- 查询时间: <YYYY-MM-DD HH:MM>

| 酒店 | 当前价 | 划线价 | 折扣 | 备注 |
|------|--------|--------|------|------|
| 酒店名称 | ¥287 | ¥314 | 91% | — |
| 查询失败酒店 | — | — | — | 查询失败 |
```

- Sort by current price ascending (cheapest first)
- Calculate discount as `round(current_price / original_price * 100)`
- Mark failed queries with "查询失败" in the notes column
- Include a summary line with the cheapest option highlighted

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
