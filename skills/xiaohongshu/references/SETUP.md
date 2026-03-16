# Xiaohongshu Setup Guide

This guide is for OpenClaw to help users complete prerequisites before squads can use this skill.
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

Xiaohongshu requires QR code login via the mobile app. SMS verification may or may not be required depending on Xiaohongshu's risk assessment (new device, IP, account history, etc).

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

2. Script outputs `QR_SCREENSHOT=<path>` — send this image to the user to scan with Xiaohongshu app.

3. User scans QR code and confirms login on their phone.

4. **Two possible outcomes after scan:**
   - **Direct success**: Script outputs `LOGIN_SUCCESS` + `STATE_SAVED=<path>`. Done.
   - **SMS verification required**: Script outputs `SMS_VERIFICATION_NEEDED` + `SMS_SCREENSHOT=<path>`. Continue to step 5.

5. **If SMS verification needed:**
   - Send `SMS_SCREENSHOT` to user so they can see the verification page
   - Ask user for the SMS verification code they received
   - Write the code to the signal file:
     ```bash
     echo "<code>" > /tmp/xhs-sms-code.txt
     ```
   - Script auto-detects the file, fills the code, clicks verify
   - On success: `LOGIN_SUCCESS` + `STATE_SAVED=<path>`

6. If `LOGIN_TIMEOUT`: QR expired or verification failed — rerun the script.

### Troubleshooting
- QR code shows boxes → fonts not installed (step 3)
- QR code doesn't appear → site may have changed login flow, check `PAGE_SCREENSHOT`
- Stuck on "扫码成功" → user needs to confirm on phone, or SMS verification appeared
- State expires → user says "小红书登录过期" → rerun login flow
- SMS code not working → code may have expired, ask user for a new one
