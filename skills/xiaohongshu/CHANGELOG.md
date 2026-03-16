# Changelog

## 1.1.0
- auth.js: support optional SMS verification after QR scan
- SMS popup detected via `input.r-input-inner` (no phase state machine needed)
- Code delivered via signal file (`/tmp/xhs-sms-code.txt`), auto-submits
- SETUP.md updated with full login flow documentation

## 1.0.0
- Initial release: QR code login, storage-state persistence, --check/--login modes
