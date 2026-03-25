# Amap Web Service Key Setup Guide

This guide is for OpenClaw to help users complete prerequisites before squads can use this skill.
Run checks in order — each step depends on the previous one.

## 1. Node.js 18+

Native `fetch` is required — available in Node.js 18 and later.

### Check
```bash
node -e "console.log(typeof fetch === 'function' ? 'OK' : 'MISSING')"
```

### Steps
Install Node.js 18+ via your package manager or from https://nodejs.org

## 2. Amap Web Service Key

An API key from the Amap developer console is required for all API calls.

### Check
```bash
grep -q 'AMAP_WEBSERVICE_KEY=' ~/.swat/.env 2>/dev/null && echo "OK" || echo "MISSING"
```

### Steps
1. Go to https://lbs.amap.com and sign in (or create an account)
2. Navigate to Console (控制台) → My Apps (我的应用)
3. Click "Create App" (创建新应用):
   - App name: any name (e.g., "SWAT")
   - Platform: choose any
4. Under your app, click "Add Key" (添加Key):
   - Key name: any name (e.g., "webservice")
   - Service type: **Web Service** (Web服务) — this is critical, not "Web端" or "Android"
   - Submit and copy the generated key
5. Add the key to the SWAT env file:
   ```bash
   mkdir -p ~/.swat
   echo 'AMAP_WEBSERVICE_KEY=your_key_here' >> ~/.swat/.env
   ```

### Verify
```bash
node -e "
const fs = require('fs');
const env = fs.readFileSync(process.env.HOME + '/.swat/.env', 'utf8');
const match = env.match(/AMAP_WEBSERVICE_KEY=(\S+)/);
if (!match) { console.log('MISSING'); process.exit(1); }
const key = match[1];
fetch('https://restapi.amap.com/v3/weather/weatherInfo?key=' + key + '&city=110000')
  .then(r => r.json())
  .then(d => console.log(d.status === '1' ? 'OK' : 'INVALID_KEY'))
  .catch(() => console.log('NETWORK_ERROR'));
"
```
Outputs `OK`, `MISSING`, `INVALID_KEY`, or `NETWORK_ERROR`.

### Troubleshooting
- Key returns "INVALID_USER_KEY" → verify the key type is "Web Service", not "Web端 (JS API)"
- Key returns "DAILY_QUERY_OVER_LIMIT" → free tier quota exceeded, wait 24h or upgrade plan
- Cannot create account → Amap requires a Chinese phone number for registration; use an existing team account if available
