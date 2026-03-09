# Changelog

## 1.2.0

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
