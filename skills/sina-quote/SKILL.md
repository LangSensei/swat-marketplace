---
name: sina-quote
version: "1.0.0"
description: Real-time stock/ETF/index quotes from Sina Finance (新浪财经)
dependencies:
  skills: []
  mcps: []
---

# Sina Quote Skill

Fetch real-time quotes for A-share stocks, ETFs, and indices via Sina Finance HTTP API. No API key required. Fast and lightweight — ideal for batch price lookups.

## API

### Real-time Quote (实时行情)

```
GET https://hq.sinajs.cn/list={codes}

Headers:
  Referer: https://finance.sina.com.cn

Parameters:
  codes = comma-separated list of stock codes with market prefix
```

**Market prefixes:**
- `sh` — Shanghai (SH stocks, SH ETFs, SH indices)
- `sz` — Shenzhen (SZ stocks, SZ ETFs)

**Examples:**
- Stock: `sh600519` (贵州茅台), `sz000858` (五粮液)
- ETF: `sh512800` (银行ETF), `sz159919` (沪深300ETF)
- Index: `sh000001` (上证指数), `sz399001` (深证成指)
- Batch: `sh600519,sz000858,sh512800`

### Response Format

```
var hq_str_sh512800="银行ETF,0.780,0.784,0.784,0.786,0.779,0.783,0.784,501041698,392116009.000,...,2026-03-09,10:52:40,00,";
```

Fields (comma-separated):
1. Name (中文名)
2. Today open (今开)
3. Yesterday close (昨收)
4. Current price (当前价)
5. Today high (最高)
6. Today low (最低)
7. Bid price (买一价)
8. Ask price (卖一价)
9. Volume in shares (成交量/股)
10. Amount in CNY (成交额/元)
11-20. Buy 1-5 volume + price pairs
21-30. Sell 1-5 volume + price pairs
31. Date
32. Time

### Usage Pattern

```python
import requests

def get_quotes(codes):
    """Fetch real-time quotes. codes: list of 'sh600519', 'sz000858', etc."""
    url = f"https://hq.sinajs.cn/list={','.join(codes)}"
    headers = {"Referer": "https://finance.sina.com.cn"}
    r = requests.get(url, headers=headers)

    results = {}
    for line in r.text.strip().split("\n"):
        if "=" not in line:
            continue
        var_name, data = line.split("=", 1)
        code = var_name.split("_")[-1]  # e.g. sh512800
        fields = data.strip('";\n').split(",")
        if len(fields) < 32:
            continue
        results[code] = {
            "name": fields[0],
            "open": float(fields[1]),
            "prev_close": float(fields[2]),
            "price": float(fields[3]),
            "high": float(fields[4]),
            "low": float(fields[5]),
            "volume": int(fields[8]),
            "amount": float(fields[9]),
            "date": fields[30],
            "time": fields[31],
        }
    return results

# Single quote
quotes = get_quotes(["sh512800"])
print(quotes["sh512800"]["price"])

# Batch quotes (up to ~100 codes per request)
quotes = get_quotes(["sh600519", "sz000858", "sh512800", "sh000001"])
for code, q in quotes.items():
    print(f"{q['name']} ({code}): {q['price']}")
```

## Notes

- Referer header is required
- Data is real-time during trading hours (9:30-15:00 CST), last close price otherwise
- Batch requests: up to ~100 codes per call
- Rate limit: be reasonable, 1 request per second for batch
- Encoding may be GBK for Chinese characters; use `r.encoding = 'gbk'` if names show garbled
- Volume unit: shares (股), not lots (手)
