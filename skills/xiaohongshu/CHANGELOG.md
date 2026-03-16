# Changelog

## 1.2.0
- search.js: keyword search with anti-captcha route interception, stealth patches, API response capture
- detail.js: note detail extraction (API capture + DOM fallback)
- SKILL.md: document CLI scripts usage, anti-detection features

## 1.1.1
- auth.js: screenshot dir now uses UID suffix (`xhs-auth-<uid>`) to avoid permission conflicts in multi-user environments

## 1.1.0
- auth.js: support optional SMS verification after QR scan
- SMS popup detected via `input.r-input-inner` (no phase state machine needed)
- Code delivered via signal file (`/tmp/xhs-sms-code.txt`), auto-submits
- SETUP.md updated with full login flow documentation

## 1.0.0
- Initial release: QR code login, storage-state persistence, --check/--login modes
