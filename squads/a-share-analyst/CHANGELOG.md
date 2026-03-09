# Changelog

## 1.3.0

- Remove PROTOCOL-redundant content (seal steps, report generation instructions, Write Access duplication)
- Report content described inline instead of as separate generation steps
- Boundary: remove "Generate analysis reports" (covered by PROTOCOL S3)

## 1.2.0

- Standardize to TEMPLATE format (Domain, Boundary, Write Access, Squad Playbook, Output Schema)
- Frontmatter name to kebab-case (`a-share-analyst`)
- General rules moved into Squad Playbook
- Added Output Schema with expected OPERATION.md fields

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
