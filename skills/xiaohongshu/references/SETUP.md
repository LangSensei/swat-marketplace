# Xiaohongshu Setup Guide

This guide is for OpenClaw to help users complete prerequisites before squads can use this skill.
Run checks in order — each step depends on the previous one.

## 1. Playwright

Node.js playwright library for browser automation.

### Check
```bash
node -e "require('playwright')" 2>/dev/null && echo "OK"
```

### Steps
```bash
npm install -g playwright
```

## 2. Chromium

Headless browser used by playwright.

### Check
```bash
npx playwright install --dry-run chromium 2>&1 | grep -q "already installed" && echo "OK"
```

### Steps
```bash
npx playwright install chromium
```

## 3. Chinese Fonts

Required for rendering Chinese content in screenshots.

### Check
```bash
fc-list :lang=zh | grep -q Noto && echo "OK"
```

### Steps
```bash
sudo apt-get install -y fonts-noto-cjk
```

## 4. Auth

Xiaohongshu requires QR code login via the mobile app.

### Check
```bash
NODE_PATH=$(npm root -g) node scripts/auth.js --check
```
Outputs `OK`, `EXPIRED`, or `MISSING`.

### Steps
1. Run the auth script:
   ```bash
   NODE_PATH=$(npm root -g) node scripts/auth.js --login --timeout 120
   ```
2. Script outputs `QR_SCREENSHOT=<path>` — send this image to the user
3. User scans QR code with Xiaohongshu mobile app
4. Script outputs `LOGIN_SUCCESS` and `STATE_SAVED=<path>` when done
5. If `LOGIN_TIMEOUT`, QR expired — rerun the script

### Troubleshooting
- QR code shows boxes → fonts not installed (step 3)
- QR code doesn't appear → site may have changed login flow, check `PAGE_SCREENSHOT`
- State expires → user says "小红书登录过期" → rerun login flow
