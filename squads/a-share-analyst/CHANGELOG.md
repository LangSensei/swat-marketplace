# Changelog

## 1.3.0 (2026-03-25)

Evidence-based playbook optimization from 33 completed operations analysis (squad-distill operation 20260325-e29e01d6).

### Added
- **Holding Review / Tracking (持仓复核) workflow** — new playbook section formalizing the 8-step workflow used in 14 out of 33 operations (42% of all ops). Includes prior context loading, P&L calculation with transaction costs, trigger condition checking, and support/resistance recalibration. (Evidence: ops 20260315-f0050543 through 20260325-ecba6dd0)
- **Data Sourcing Strategy section** — documents the proven fallback chain: sina-quote → yfinance → eastmoney. Includes bank PE/PB scaling fix and HK stock code format. (Evidence: ×11 INTEL entry "eastmoney API在本环境可低频单标访问", confirmed across all 33 ops)
- **P&L tracking with transaction costs** in both Individual Stock and Holding Review sections — 万一佣金 (min ¥5) + 千一印花税. (Evidence: consistently computed in all holding review ops)
- **Cost basis verification** step in Portfolio Synthesis — prevents distorted P&L from inconsistent cost data. (Evidence: ×1 INTEL "组合调仓前必须核对成本口径")
- **Portfolio concentration thresholds** — flag single-stock >25%, single-sector >40%. (Evidence: ×1 INTEL "仓位管理原则", validated in portfolio ops)
- Insurance-specific P/EV guidance in fundamentals. (Evidence: ×1 INTEL "保险股复核需补充P/EV口径")
- ETF "core holdings" outlier-exclusion metric. (Evidence: ×1 INTEL "港股ETF估值应同时给核心权重口径")

### Changed
- K-line fetch period: 120 days → 240 trading days (~1 year) to match actual practice (Evidence: all 33 ops fetch ~242 days via yfinance)
- `python` → `python3` in General Rules (Evidence: every operation requires `python3`, `python` is not available)
- Data sourcing: "Use eastmoney-data skill APIs" → tiered fallback strategy (Evidence: eastmoney fails on batch requests in 100% of operations)
- Report description: removed "price chart with key indicators" — reports are now structured text/tables HTML (15-32KB) instead of chart-embedded (500KB-1.1MB). (Evidence: report size evolution across 33 ops)
- Portfolio Synthesis: added "Refresh prices only" step — reuse prior operation data instead of re-running analyses. (Evidence: ×3 INTEL "组合综合分析复用已完成操作报告")
- Output Schema: added explicit "at seal time" instruction and guidance for portfolio operations. (Evidence: 0/33 operations filled schema fields — now more actionable)
- Screening section: marked as optional — 0 operations used it across 33 completed ops
- ETF price data: changed from "eastmoney-data K-line API" to "sina-quote for real-time; yfinance for K-line"

### Not Changed
- Domain, Boundary, Dependencies — no evidence-based reason to modify
- Output Schema fields — kept as-is but added clearer filling instructions

## 1.2.0 (2026-03-09)

- Standardize to TEMPLATE format (In scope/Out of scope, human-readable title)
- Remove PROTOCOL-redundant content (seal steps, report generation, Write Access duplication)
- Output Schema: squad-specific fields (stock_code, stock_name, pe_ttm, pb, roe, moat_rating, recommendation)
- Report content described inline instead of as separate generation steps

## 1.1.0 (2026-03-09)

- Add ETF/fund analysis playbook (holdings decomposition, weighted PE/PB/ROE, sector assessment)
- Add moat assessment and valuation depth analysis (historical percentile, sector comparison)
- Add decision recommendations (hold/add/reduce with reasoning)
- Add portfolio synthesis task (multi-operation report aggregation, rebalancing suggestions)
- Add cost basis P&L analysis for holdings with cost data
- New dependencies: fund-holdings, sina-quote

## 1.0.0 (2026-03-08)

- Initial release
- A-share stock analysis squad (technical + fundamental)
- Depends on eastmoney-data skill for market data
- Supports: single stock analysis, peer comparison, screening
