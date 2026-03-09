---
name: fund-holdings
version: "1.0.0"
description: Fetch ETF/fund holding details from Eastmoney (天天基金)
dependencies:
  skills: []
  mcps: []
---

# Fund Holdings Skill

Fetch ETF and fund portfolio holding details via Eastmoney's Tiantian Fund (天天基金) public API. No API key required.

## Available APIs

### 1. Fund Holdings (基金持仓明细)

```
GET https://fundf10.eastmoney.com/FundArchivesDatas.aspx

Parameters:
  type    = jjcc              # 股票投资明细
  code    = {fund_code}       # e.g. 512800
  topline = 20                # number of top holdings to return

Headers:
  Referer: https://fundf10.eastmoney.com
```

Response is JavaScript variable assignment containing HTML table. Parse the HTML to extract holdings data.

### Parsing Guide

The response format is:
```javascript
var apidata={ content:"<div>...</div>", arryear:[2025,2024,...], curyear:2025 };
```

Each quarter's holdings are in a separate `<table>` within the HTML. Key fields per row:
- Stock code (链接中提取)
- Stock name
- 占净值比例 (% of NAV)
- 持股数（万股）
- 持仓市值（万元）

### Usage Pattern

```python
import requests
import re

def get_fund_holdings(fund_code, top=20):
    """Fetch top holdings for an ETF/fund."""
    url = "https://fundf10.eastmoney.com/FundArchivesDatas.aspx"
    params = {"type": "jjcc", "code": fund_code, "topline": top}
    headers = {"Referer": "https://fundf10.eastmoney.com"}
    r = requests.get(url, params=params, headers=headers)

    # Extract first quarter's data (most recent)
    # Parse HTML table rows for holdings
    content = r.text
    # Find all <tr> rows with stock data
    rows = re.findall(
        r'<td>(\d+)</td>.*?r/(\d\.\d+)\'?>(\d{6})</a>.*?'
        r'class=\'tol\'.*?>(.+?)</a>.*?'
        r"class='tor'>(\d+\.\d+%)</td>",
        content, re.DOTALL
    )
    holdings = []
    for row in rows:
        seq, market, code, name, weight = row
        holdings.append({
            "seq": int(seq),
            "code": code,
            "name": name,
            "market": int(market.split(".")[0]),  # 0=SZ, 1=SH
            "weight": weight
        })
    return holdings

# Example: 银行ETF (512800)
holdings = get_fund_holdings("512800")
for h in holdings[:10]:
    print(f"{h['name']} ({h['code']}) — {h['weight']}")
```

## Notes

- Data updates quarterly (with some funds reporting monthly)
- The API returns multiple quarters in one response; parse the first table for the latest
- Holdings with 0.00% weight are new IPO allocations, can be ignored
- Rate limit: add 0.5s delay between requests
- Referer header is required or the request will be rejected
