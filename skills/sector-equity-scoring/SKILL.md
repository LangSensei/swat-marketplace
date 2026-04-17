---
name: sector-equity-scoring
version: "1.0.0"
description: Percentile-based equity scoring methodology — 18 indicators across 6 categories, with sector-adaptive weights and V2 cap rules
dependencies:
  skills: [eastmoney-data]
  mcps: []
---

# Sector Equity Scoring Skill

A reusable methodology for building quantitative value-scoring formulas for any A-share sector. Each formula produces a 0-100 composite score per stock, combining valuation, profitability, growth, cash flow, risk, and industry quality indicators via percentile ranking.

## When to Use

- Building a new sector scoring formula from scratch
- Reviewing or updating an existing formula
- Comparing scoring approaches across sectors

## Core Concepts

### 18-Indicator System

Every sector formula targets 18 indicators organized into 6 categories:

| Category | Standard Indicators | Typical Weight |
|----------|-------------------|----------------|
| **Valuation** (3) | PE-TTM, PB, Dividend Yield | ~15-25% |
| **Profitability** (5) | ROE, ROA, ROIC, Gross Margin, Net Margin | ~25-35% |
| **Growth** (2) | Revenue Growth YoY, Net Profit Growth YoY | ~10-25% |
| **Cash Flow** (3) | Operating CF / Net Profit, FCF Yield, Operating CF / Revenue | ~8-15% |
| **Risk** (3) | Debt-to-Asset Ratio, Current Ratio, Interest-bearing Debt Ratio | ~8-12% |
| **Industry Quality** (2) | Gross Margin YoY Change, Quick Ratio | ~5-10% |

**Sector-specific substitutions are allowed.** Financial sectors (banking, insurance, securities) replace inapplicable indicators with industry-specific ones (e.g., NPL ratio, provision coverage, net interest margin for banks; combined ratio, investment yield for insurance). The total must still target 18 indicators.

### Percentile Ranking Method

Each indicator is scored by ranking all stocks in the sector and converting to a 0-100 percentile:

```
score_i = percentile within sector (0-100)

For "lower is better" indicators (PE, D/A, etc.):
  score = 100 - percentile

For "higher is better" indicators (ROE, dividend yield, etc.):
  score = percentile

percentile = (rank - 1) / (N_valid - 1) * 100
```

The composite score is a weighted sum:

```
Value_Score = Sum(weight_i * score_i) / Sum(weight_i_participated)
```

Missing indicators are excluded — the denominator adjusts to only include weights of indicators with valid data.

### V2 Rules

These rules prevent outliers from distorting rankings:

| Rule | Description |
|------|-------------|
| **Growth ±200% cap** | Revenue and net profit growth rates are capped at ±200% before ranking. Display the capped value (e.g., 200.0, not the raw 1500%) |
| **ROE/ROIC ≤60% cap** | ROE and ROIC values exceeding 60% are capped at 60% before ranking |
| **PE<0 exclusion** | Loss-making stocks (negative PE) are excluded from PE ranking entirely (they receive no PE score) |
| **Coverage penalty** | If a stock has fewer than 10 valid indicators (out of 18), apply penalty: `score *= valid_count / 18` |
| **ST/\*ST exclusion** | All ST and \*ST stocks are excluded from the ranking universe |
| **B-share exclusion** | B-share stocks (codes starting with 9xxxxx) are excluded |

### FCF Yield Calculation

```
FCF_Yield = FCFF_BACK / f20
```

- `FCFF_BACK` = Free cash flow to firm (from datacenter-web API: RPT_F10_FINANCE_MAINFINADATA)
- `f20` = Total market capitalization (from push2 batch API)
- Do NOT use `f116` (circulating market cap) — use total market cap

## Weight Design Principles

Weights must sum to 100% and reflect sector economics. Use these guidelines:

### Base Template

| Category | Default | Range |
|----------|---------|-------|
| Valuation | 20% | 15-35% |
| Profitability | 30% | 25-35% |
| Growth | 15% | 10-25% |
| Cash Flow | 10% | 8-15% |
| Risk | 10% | 8-12% |
| Industry Quality | 8% | 5-10% |

There is no single correct weight allocation — it should be driven by sector characteristics.

### Sector Adaptation Rules

| Sector Type | Adjustment | Rationale |
|-------------|-----------|-----------|
| **Consumer staples** (food, beverage, household) | Raise Profitability to ~35%, emphasize gross margin | Brand moat drives pricing power |
| **Heavy-asset / PPP sectors** (utilities, construction, transportation) | Raise Cash Flow to ~13-15%, raise Risk to ~12% | Capital-intensive, cash flow quality critical |
| **Cyclical sectors** (steel, coal, nonferrous, chemicals) | Lower Growth to ~10-12%, raise Valuation to ~25% | Growth is volatile and mean-reverting |
| **Growth sectors** (electronics, computer, pharma) | Raise Growth to ~20-25%, lower Valuation to ~15% | Revenue trajectory is the primary value driver |
| **Financial sectors** (banking, insurance, securities) | Replace Cash Flow/Risk with industry-specific indicators; Valuation ~30-35% | Standard cash flow metrics don't apply |

### Indicator-Level Weight Guidance

Within each category, distribute weight based on indicator importance:

- **Primary indicator** (the most important metric): 40-60% of category weight
- **Secondary indicators**: 20-30% each
- No single indicator should exceed 15% of total weight (except in financials where PB for banks can be 15%)
- Risk category: keep each indicator at 2-5%, distribute evenly across 3 indicators

## Standard Output Format

Every sector formula document follows this structure:

### Part 1: Data Audit

- API data sources used (batch API for quotes, datacenter-web for financials)
- Indicator availability table: indicator name, API source, field name, coverage rate, data quality
- List of unavailable indicators (weight = 0%)

### Part 2: Weight Table

- One table per category showing: indicator, weight, direction (higher/lower is better), notes
- Weight summary table: category, total weight, core logic explanation
- Weights must sum to exactly 100% (101% with rounding is acceptable)

### Part 3: Formula

- The scoring formula (copy the standard percentile formula)
- V2 rules applied (growth cap, ROE/ROIC cap, PE exclusion, coverage penalty)
- Any sector-specific formula adjustments

### Part 4: Ranking Table

- Full ranking table with columns: Rank, Stock Name, Code, Score, and key indicator values
- Include an indicator coverage column (X/18 format showing how many indicators had valid data)
- Data date must be stated
- Total stock count and indicator count

### Part 5: Reasonableness Checks

Perform all 7 standard checks:

| # | Check | What to Verify |
|---|-------|----------------|
| 1 | **Loss-making stocks** | All PE<0 stocks should cluster near the bottom of rankings |
| 2 | **High-score logic** | Top-ranked stocks should have strong fundamentals across multiple categories, not just one extreme metric |
| 3 | **Low-score logic** | Bottom-ranked stocks should show clear weaknesses (losses, high debt, declining revenue) |
| 4 | **Industry leader ranking** | Well-known sector leaders should appear in a reasonable range (top quartile, though not necessarily #1) |
| 5 | **Score distribution** | Mean ~49-51, median ~49-52, >70 scores <15% of total, healthy spread |
| 6 | **V2 cap validation** | Verify that capped values appear correctly in ranking table (200.0 for growth, 60.0 for ROE/ROIC) |
| 7 | **Sub-industry coverage** | Check that the formula doesn't systematically favor one sub-industry over others within the sector |

Present checks as a verification table: dimension, expected, actual, conclusion (pass/fail).

Include a **Limitations** section noting known weaknesses (e.g., YoY vs CAGR, missing indicators, cross-sectional only).

## Data Sources

| API | Endpoint | Purpose |
|-----|----------|---------|
| Batch quote API | `push2.eastmoney.com/api/qt/clist/get` | Sector stock list + basic indicators (PE, PB, market cap, dividend yield) |
| Financial data API | `datacenter-web.eastmoney.com/api/data/v1/get` | Detailed financials per stock (RPT_F10_FINANCE_MAINFINADATA) |

Refer to the `eastmoney-data` skill for API usage details, field mappings, and request patterns.

## Reference Formulas

See `reference/a-share/` for 32 completed A-share sector formulas (01-banking through 32-conglomerate). These serve as concrete examples of the methodology applied to different sector types.
