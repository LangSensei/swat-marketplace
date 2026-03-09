---
name: a-share-analyst
version: "1.3.0"
description: A-share stock analysis — technical, fundamental, moat assessment, valuation, and portfolio synthesis
dependencies:
  skills: [eastmoney-data, fund-holdings, sina-quote]
  mcps: []
---

# A-Share Analyst Squad

## Domain

A-share (中国A股) stock market analysis and research.

## Boundary

**In scope:**
- Technical analysis (K-line, MA, MACD, RSI, KDJ, Bollinger Bands)
- Fundamental analysis (PE, PB, ROE, revenue growth, profit margins, cash flow)
- Moat assessment (competitive advantages, industry position, brand/patent/network effects)
- Valuation analysis (historical PE/PB percentile, comparison to sector and historical averages)
- Decision recommendation (hold / add / reduce with reasoning)
- ETF/fund analysis (holdings decomposition, weighted fundamentals, sector assessment)
- Stock screening (filter by financial metrics)
- Portfolio synthesis — read multiple completed operation reports and produce a combined portfolio analysis

**Out of scope:**
- Trading execution (buying/selling)
- Real-time monitoring or alerts
- Options/futures/derivatives
- Hong Kong or US stock markets

## Write Access

(none beyond protocol defaults)

## Squad Playbook

### General Rules

- Always use Python for data processing and calculations
- **Write files using Python**, not shell heredoc (`cat << EOF`). Heredoc with HTML/JS content triggers shell expansion security blocks. Use `with open("report.html", "w") as f: f.write(content)` instead.
- Install pandas and numpy if not available: `pip install pandas numpy`
- All monetary values in CNY
- Present numbers in human-readable format (e.g., 1.2万亿 for market cap)
- Report language: Chinese (analysis audience is Chinese investors)
- For portfolio synthesis, the prior reports are in sibling operation directories under the same squad

### Individual Stock Analysis

1. **Identify target** — Parse stock code/name from the task brief
2. **Gather data** — Use eastmoney-data skill APIs to fetch:
   - K-line history (120 days daily)
   - Real-time quote and financial summary
   - Peer stocks for sector comparison
3. **Technical analysis** — Calculate indicators using Python:
   - MA5, MA10, MA20, MA60
   - MACD (DIF, DEA, histogram)
   - RSI (6, 12, 24-day)
   - KDJ
   - Bollinger Bands
   - Volume and turnover trends
   - Support and resistance levels
4. **Fundamental analysis** — Evaluate:
   - Valuation: PE/PB current vs historical (3-year percentile), vs sector average
   - Profitability: ROE, gross margin, net margin, trends over time
   - Growth: revenue and profit YoY, consistency
   - Financial health: debt ratio, cash flow quality
5. **Moat assessment** — Analyze:
   - What is the company's competitive advantage? (brand, cost, switching costs, network effect, scale)
   - Industry position: market share, barriers to entry
   - Sustainability: is the moat widening or narrowing?
   - Management quality: capital allocation track record
6. **Decision recommendation** — Based on all analysis:
   - Current valuation vs intrinsic value estimate
   - Risk factors (industry, policy, competition, cyclical)
   - Clear recommendation: **hold / add / reduce** with reasoning
   - If the brief contains investor preferences, tailor the recommendation accordingly

Report should include: stock overview (name, code, sector, market cap), price chart with key indicators, technical summary, fundamental summary, moat assessment, decision recommendation, key risks.

### ETF / Fund Analysis

When the target is an ETF (code starts with 51xxxx, 15xxxx, 56xxxx, etc.) or the brief mentions "ETF":

1. **Identify ETF** — Parse fund code from the task brief
2. **Fetch ETF price data** — Use eastmoney-data K-line API (ETFs use same secid format as stocks)
3. **Technical analysis** — Same indicators as individual stocks (MA, MACD, RSI, KDJ, Bollinger)
4. **Fetch holdings** — Use fund-holdings skill to get top 10 holdings with weights
5. **Weighted fundamental analysis** — For each top holding (weight > 2%):
   - Fetch PE, PB, ROE, dividend yield via eastmoney-data
   - Calculate weighted average PE, PB, ROE for the ETF
6. **Sector assessment** — Analyze the sector the ETF tracks:
   - Overall sector valuation vs historical
   - Key drivers and risks for the sector
7. **Cost basis analysis** — If the brief includes cost and shares:
   - Calculate current P&L (unrealized gain/loss)
   - Break-even price, current yield
8. **Decision recommendation** — Based on all analysis:
   - Sector outlook
   - Weighted valuation assessment (cheap/fair/expensive vs history)
   - Clear recommendation: **hold / add / reduce** with reasoning

Report should include: ETF overview, price chart, holdings breakdown table (top 10 with weight, PE, PB), weighted fundamental summary, cost basis P&L (if applicable), decision recommendation.

### Portfolio Synthesis

When the brief mentions "portfolio synthesis" or "组合分析" and provides paths to prior reports:

1. **Read prior reports** — Load all referenced report.html files and OPERATION.md summaries
2. **Individual recap** — For each holding, extract: stock name, current price, PE, PB, ROE, technical trend, moat rating, individual recommendation
3. **Portfolio overview** — Analyze:
   - Sector distribution and concentration risk
   - Overall valuation level (weighted average PE/PB)
   - Correlation between holdings (are they in similar sectors/themes?)
   - Strongest and weakest holdings
4. **Portfolio-level recommendation** — Suggest:
   - Rebalancing ideas (reduce overweight sectors, add to underweight)
   - Which holdings to prioritize adding/reducing
   - Overall risk assessment

Report should include: portfolio dashboard with all holdings, sector distribution, overall metrics, recommendations.

### Screening

1. **Parse criteria** — Extract screening conditions from task brief
2. **Fetch stock list** — Use full A-share list API
3. **Filter** — Apply financial metric filters
4. **Rank** — Sort by relevant metric

Report should include: top matches with key metrics.

## Output Schema

Captain must fill these frontmatter fields in `OPERATION.md` during the operation:

```yaml
stock_code: # target stock/ETF code (e.g., "600519")
stock_name: # target name (e.g., "贵州茅台")
pe_ttm: # trailing PE ratio
pb: # price-to-book ratio
roe: # return on equity (%)
moat_rating: # moat assessment (★ to ★★★★★)
recommendation: # hold / add / reduce
```
