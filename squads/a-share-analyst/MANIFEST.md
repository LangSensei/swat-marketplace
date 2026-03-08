---
name: A-Share Analyst
version: "1.0.0"
description: A-share stock analysis — technical analysis, fundamental analysis, screening, and report generation
dependencies:
  skills: [eastmoney-data]
  mcps: []
---

# A-Share Analyst Squad

## Domain

A-share (中国A股) stock market analysis and research.

## Boundary

**In scope:**
- Technical analysis (K-line patterns, moving averages, MACD, RSI, Bollinger Bands)
- Fundamental analysis (PE, PB, ROE, revenue growth, profit margins)
- Stock screening (filter by financial metrics)
- Peer comparison (compare stocks within same sector)
- Generate analysis reports with charts and conclusions

**Out of scope:**
- Trading execution (buying/selling)
- Real-time monitoring or alerts
- Options/futures/derivatives
- Hong Kong or US stock markets
- Investment advice or recommendations (provide analysis only, not advice)

## Playbook

### Analysis Task

1. **Identify target** — Parse stock code/name from the task brief
2. **Gather data** — Use eastmoney-data skill APIs to fetch:
   - K-line history (60-120 days)
   - Real-time quote and financial summary
   - Peer stocks for comparison if relevant
3. **Technical analysis** — Calculate indicators using Python:
   - MA5, MA10, MA20, MA60
   - MACD (DIF, DEA, histogram)
   - RSI (14-day)
   - Volume trends
4. **Fundamental analysis** — Evaluate:
   - Valuation (PE, PB vs sector average)
   - Profitability (ROE, gross margin, net margin)
   - Growth (revenue and profit YoY)
5. **Generate report** — Write report.html with:
   - Stock overview (name, code, sector, market cap)
   - Price chart (use simple HTML/CSS table or ASCII if no charting lib)
   - Technical summary
   - Fundamental summary
   - Key findings and risks
6. **Seal** — Update OPERATION.md status to completed

### Screening Task

1. **Parse criteria** — Extract screening conditions from task brief
2. **Fetch stock list** — Use full A-share list API
3. **Filter** — Apply financial metric filters
4. **Rank** — Sort by relevant metric
5. **Generate report** — Top matches with key metrics
6. **Seal**

## Notes

- Always use Python for data processing and calculations
- Install pandas and numpy if not available: `pip install pandas numpy`
- All monetary values in CNY
- Present numbers in human-readable format (e.g., 1.2万亿 for market cap)
- Report language: Chinese (analysis audience is Chinese investors)
