# Changelog

## 1.0.1 (2026-03-09)

- Strengthen rate limiting guidance: 1-1.5s delays between requests, mandatory retry with exponential backoff
- Document push2 ETF limitation (returns empty data for ETF codes)

## 1.0.0 (2026-03-08)

- Initial release
- East Money HTTP API wrapper for A-share market data
- Endpoints: K-line history, real-time quotes, financial summary, stock search
- No API key required
