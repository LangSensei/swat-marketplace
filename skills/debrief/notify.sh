#!/bin/bash
# notify.sh — Send a notification to the user via OpenClaw Gateway
# Usage: bash notify.sh "your message" [--target CHAT_ID] [--channel telegram]

set -euo pipefail

# --- Parse arguments ---
MESSAGE=""
TARGET=""
CHANNEL=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --target)  TARGET="$2"; shift 2 ;;
    --channel) CHANNEL="$2"; shift 2 ;;
    --help|-h)
      echo "Usage: notify.sh \"message\" [--target CHAT_ID] [--channel CHANNEL]"
      echo ""
      echo "Environment variables (all optional — falls back to ~/.openclaw/openclaw.json):"
      echo "  OPENCLAW_GATEWAY_PORT   Gateway port (default: from config or 18789)"
      echo "  OPENCLAW_GATEWAY_TOKEN  Gateway auth token (default: from config)"
      echo "  OPENCLAW_NOTIFY_TARGET  Default recipient chat ID (default: first allowFrom in config)"
      echo "  OPENCLAW_NOTIFY_CHANNEL Default channel (optional)"
      exit 0
      ;;
    *) MESSAGE="$1"; shift ;;
  esac
done

if [[ -z "$MESSAGE" ]]; then
  echo "❌ Usage: notify.sh \"message\" [--target CHAT_ID] [--channel CHANNEL]" >&2
  exit 1
fi

# --- Resolve config from env or ~/.openclaw/openclaw.json ---
OC_CONFIG="$HOME/.openclaw/openclaw.json"

read_oc_config() {
  # Extract a value from openclaw.json using node (always available in CC sessions)
  local key="$1"
  if [[ -f "$OC_CONFIG" ]] && command -v node &>/dev/null; then
    node -e "
      const fs = require('fs');
      const raw = fs.readFileSync('$OC_CONFIG', 'utf8');
      // openclaw.json uses JS object syntax (unquoted keys), eval it
      const cfg = eval('(' + raw + ')');
      const val = key => key.split('.').reduce((o,k) => o && o[k], cfg);
      process.stdout.write(String(val('$key') || ''));
    " 2>/dev/null
  fi
}

PORT="${OPENCLAW_GATEWAY_PORT:-$(read_oc_config 'gateway.port')}"
PORT="${PORT:-18789}"
TOKEN="${OPENCLAW_GATEWAY_TOKEN:-$(read_oc_config 'gateway.auth.token')}"
if [[ -z "$TOKEN" ]]; then
  echo "❌ Cannot resolve gateway token from env or $OC_CONFIG" >&2
  exit 1
fi
TARGET="${TARGET:-${OPENCLAW_NOTIFY_TARGET:-$(read_oc_config 'channels.telegram.allowFrom.0')}}"
if [[ -z "$TARGET" ]]; then
  echo "❌ Cannot resolve notify target from env, args, or $OC_CONFIG" >&2
  exit 1
fi
CHANNEL="${CHANNEL:-${OPENCLAW_NOTIFY_CHANNEL:-}}"

# --- JSON escape (pure bash + jq fallback) ---
json_escape() {
  if command -v jq &>/dev/null; then
    printf '%s' "$1" | jq -Rs .
  elif command -v python3 &>/dev/null; then
    printf '%s' "$1" | python3 -c 'import json,sys; print(json.dumps(sys.stdin.read()))'
  else
    # Basic escape: backslash, quotes, newlines, tabs
    local s="$1"
    s="${s//\\/\\\\}"
    s="${s//\"/\\\"}"
    s="${s//$'\n'/\\n}"
    s="${s//$'\t'/\\t}"
    printf '"%s"' "$s"
  fi
}

JSON_MESSAGE=$(json_escape "$MESSAGE")

# --- Build JSON payload (channel is optional) ---
CHANNEL_FIELD=""
if [[ -n "$CHANNEL" ]]; then
  CHANNEL_FIELD="\"channel\": \"${CHANNEL}\","
fi

# --- Send with timeout and retry ---
MAX_RETRIES=2
RETRY=0

while [[ $RETRY -le $MAX_RETRIES ]]; do
  RESPONSE=$(curl -sS --max-time 10 "http://127.0.0.1:${PORT}/tools/invoke" \
    -H "Authorization: Bearer ${TOKEN}" \
    -H "Content-Type: application/json" \
    -d "{
      \"tool\": \"message\",
      \"args\": {
        \"action\": \"send\",
        ${CHANNEL_FIELD}
        \"target\": \"${TARGET}\",
        \"message\": ${JSON_MESSAGE}
      }
    }" 2>&1) && break

  RETRY=$((RETRY + 1))
  if [[ $RETRY -le $MAX_RETRIES ]]; then
    echo "⚠️  Retry ${RETRY}/${MAX_RETRIES}..." >&2
    sleep 2
  fi
done

# --- Check result ---
if echo "$RESPONSE" | grep -q '"ok":true'; then
  echo "✅ Notification sent"
else
  echo "❌ Failed to send notification: $RESPONSE" >&2
  exit 1
fi
