# Xiaohongshu Setup Guide

This guide is for OpenClaw to help users complete prerequisites before squads can use this skill.

## Auth

Xiaohongshu requires QR code login via the mobile app.

### Check
```bash
stat ~/.swat/browser-state-xhs.json
```
If the file exists, auth is likely valid (may still be expired — squads will detect and fail if so).

### Steps
1. Run the login script:
   ```bash
   NODE_PATH=$(npm root -g) node scripts/login.js --timeout 120
   ```
2. Script outputs `QR_SCREENSHOT=<path>` — send this image to the user
3. User scans QR code with Xiaohongshu mobile app
4. Script outputs `LOGIN_SUCCESS` and `STATE_SAVED=<path>` when done
5. If `LOGIN_TIMEOUT`, QR expired — rerun the script

### Troubleshooting
- QR code shows boxes instead of Chinese text → fonts not installed (see below)
- QR code doesn't appear → site may have changed login flow, check `PAGE_SCREENSHOT`
- State expires → user says "小红书登录过期" → rerun login flow

## Fonts

Chinese font rendering is required for screenshots and content extraction.

### Check
```bash
fc-list :lang=zh | grep -q Noto && echo "OK"
```

### Steps
```bash
sudo apt-get install -y fonts-noto-cjk
```

## Playwright

Headless Chromium is required for browser automation.

### Check
```bash
npx playwright install --dry-run chromium 2>&1 | grep -q "already installed" && echo "OK"
```

### Steps
```bash
npm install -g playwright
npx playwright install chromium
```
