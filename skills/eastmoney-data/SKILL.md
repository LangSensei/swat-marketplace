---
name: eastmoney-data
version: "1.0.0"
description: Fetch A-share stock data from East Money (东方财富) public APIs
dependencies:
  skills: []
  mcps: []
---

# East Money Data Skill

Access A-share (中国A股) market data via East Money's public HTTP APIs. No API key or registration required.

## Available APIs

### 1. K-Line (日K线数据)

```
GET https://push2his.eastmoney.com/api/qt/stock/kline/get

Parameters:
  secid     = {market}.{code}    # 0.{code} for SZ, 1.{code} for SH
  fields1   = f1,f2,f3,f4,f5,f6
  fields2   = f51,f52,f53,f54,f55,f56,f57,f58,f59,f60,f61
  klt       = 101                # 101=daily, 102=weekly, 103=monthly
  fqt       = 1                  # 1=forward adj, 2=backward adj
  end       = 20261231
  lmt       = 120                # number of records
```

Response `data.klines` array, each line: `date,open,close,high,low,volume,amount,amplitude,change_pct,change_amt,turnover`

**Market codes:**
- Shanghai (SH): secid=1.{code} (e.g., 1.600519 for 贵州茅台)
- Shenzhen (SZ): secid=0.{code} (e.g., 0.000858 for 五粮液)
- ChiNext (创业板): secid=0.{code} (e.g., 0.300750 for 宁德时代)
- STAR (科创板): secid=1.{code} (e.g., 1.688981)

### 2. Real-time Quote (实时行情)

```
GET https://push2.eastmoney.com/api/qt/stock/get

Parameters:
  secid     = {market}.{code}
  fields    = f43,f44,f45,f46,f47,f48,f50,f51,f52,f55,f57,f58,f116,f117,f162,f167,f170
```

Key fields: f43=latest, f44=high, f45=low, f46=open, f47=volume, f48=amount, f116=market_cap, f117=float_cap, f162=PE, f167=PB

### 3. Stock List (全部A股列表)

```
GET https://push2.eastmoney.com/api/qt/clist/get

Parameters:
  pn    = 1                      # page number
  pz    = 5000                   # page size
  fs    = m:0+t:6,m:0+t:80,m:1+t:2,m:1+t:23   # A-share filter
  fields = f12,f14,f2,f3,f4,f5,f6,f7,f15,f16,f17,f18
```

Fields: f12=code, f14=name, f2=latest, f3=change_pct, f4=change, f5=volume, f6=amount

### 4. Financial Summary (财务摘要)

```
GET https://push2.eastmoney.com/api/qt/stock/get

Parameters:
  secid  = {market}.{code}
  fields = f162,f167,f164,f168,f170,f171,f173,f183,f184,f185,f186,f187
```

Fields: f162=PE(TTM), f167=PB, f164=ROE, f168=total_revenue, f170=net_profit, f173=gross_margin

### 5. Search Stock by Name/Code

```
GET https://searchapi.eastmoney.com/api/suggest/get

Parameters:
  input = {keyword}              # stock name or code fragment
  type  = 14
  count = 5
```

## Usage Pattern

```python
import requests

def get_kline(code, market=1, days=60):
    """Fetch daily K-line data. market: 0=SZ, 1=SH"""
    url = "https://push2his.eastmoney.com/api/qt/stock/kline/get"
    params = {
        "secid": f"{market}.{code}",
        "fields1": "f1,f2,f3,f4,f5,f6",
        "fields2": "f51,f52,f53,f54,f55,f56,f57,f58,f59,f60,f61",
        "klt": 101, "fqt": 1, "end": "20261231", "lmt": days
    }
    r = requests.get(url, params=params)
    data = r.json()["data"]
    return data["name"], data["klines"]

# Example: 贵州茅台 (600519, SH)
name, klines = get_kline("600519", market=1, days=30)
for k in klines[-3:]:
    print(k)
```

## Notes

- All APIs are public, no authentication needed
- Data is real-time during trading hours (9:30-15:00 CST)
- Amounts are in CNY (人民币)
- Volume unit: 手 (lots of 100 shares)

## ⚠️ Rate Limiting (IMPORTANT)

Eastmoney APIs will **drop connections** (`RemoteDisconnected`) if you send requests too fast. This is the #1 cause of failures.

**Mandatory rules:**
- Add **1 second delay** between every request (`time.sleep(1)`)
- For batch operations (e.g., fetching data for 10 stocks), use **1.5 second delay**
- Always wrap requests in retry logic (3 retries with exponential backoff)
- If `push2.eastmoney.com` returns empty response for ETFs, use sina-quote skill instead

**Example retry pattern:**
```python
import time
import requests

def fetch_with_retry(url, params, max_retries=3):
    for i in range(max_retries):
        try:
            r = requests.get(url, params=params, timeout=10)
            return r.json()
        except Exception as e:
            if i < max_retries - 1:
                time.sleep(2 ** i)  # 1s, 2s, 4s
            else:
                raise e
    return None
```

**Known limitations:**
- `push2.eastmoney.com/api/qt/stock/get` returns empty response for ETFs (use sina-quote)
- Batch requests for >5 stocks often trigger connection drops — always add delays
