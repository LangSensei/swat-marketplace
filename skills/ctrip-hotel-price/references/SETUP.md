# Ctrip Hotel Price Setup Guide

This guide helps users complete prerequisites before squads can use this skill.
Run checks in order — each step depends on the previous one.

## 1. Playwright

Node.js playwright library for browser automation.

### Check
```bash
NODE_PATH=$(npm root -g) node -e "require('playwright')" 2>/dev/null && echo "OK"
```

### Steps
```bash
npm install -g playwright
```

## 2. Chromium

Headless browser used by playwright.

### Check
```bash
ls ~/.cache/ms-playwright/chromium-*/chrome-linux/chrome 2>/dev/null && echo "OK"
```

### Steps
```bash
npx playwright install chromium
```

## 3. Chinese Fonts

Required for rendering Chinese content in screenshots and correct page layout.

### Check
```bash
fc-list :lang=zh | grep -q Noto && echo "OK"
```

### Steps
```bash
sudo apt-get install -y fonts-noto-cjk
```

## 4. Auth

Ctrip requires QR code login via the mobile app.

### Check
```bash
NODE_PATH=$(npm root -g) node scripts/auth.js --check
```
Outputs `OK`, `EXPIRED`, or `MISSING`.

### Login Flow

1. Run the auth script:
   ```bash
   NODE_PATH=$(npm root -g) node scripts/auth.js --login --timeout 300
   ```

2. Script outputs `QR_SCREENSHOT=<path>` — send this image to the user to scan with the Ctrip mobile app.

3. User scans QR code and confirms login on their phone.

4. On success: script outputs `LOGIN_SUCCESS` + `STATE_SAVED=<path>`. Done.

5. On timeout: script outputs `LOGIN_TIMEOUT`. Re-run the login flow.
