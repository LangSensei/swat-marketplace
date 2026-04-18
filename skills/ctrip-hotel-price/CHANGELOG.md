# Changelog

## 1.1.0 (2026-04-18)

- **refactor:** switch from PC web (hotels.ctrip.com) to mobile web (m.ctrip.com) — more reliable rendering in headless
- **refactor:** remove calendar interaction, use URL date params (c-in/c-out) for date control
- **feat:** sold-out hotel detection — returns `sold_out` status with reference price from page suggestions
- **feat:** 凌晨 (00:00-05:00 CST) date handling — auto-adjusts check-in to previous day per Ctrip convention
- **fix:** hotel matching uses search suggestion click instead of ngram fuzzy scoring

## 1.0.0 (2026-04-18)

- Initial release
