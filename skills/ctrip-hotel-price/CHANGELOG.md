# Changelog

## 1.1.0 (2026-04-18)

- **fix:** ngram matching now uses full hotel name (including parenthesized branch/location info) for scoring, preventing wrong-branch matches
- **feat:** sold-out hotel detection — returns `sold_out` status when hotel shows sold-out indicators
- **feat:** reference price retry — automatically checks next 3 days for available pricing when hotel is sold out

## 1.0.0 (2026-04-18)

- Initial release
- `scripts/auth.js`: QR code login and storage state management for Ctrip
- `scripts/search.js`: hotel price search with ngram fuzzy matching
- `references/SETUP.md`: prereq chain (Playwright, Chromium, fonts, auth)
