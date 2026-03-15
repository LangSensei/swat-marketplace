#!/bin/bash
# notify.sh — Send a notification to the user via OpenClaw Gateway
# Usage: bash notify.sh "your message"

set -euo pipefail

MESSAGE="${1:?Usage: notify.sh \"message\"}"
PORT="${OPENCLAW_GATEWAY_PORT:-18789}"
TOKEN="${OPENCLAW_GATEWAY_TOKEN:?OPENCLAW_GATEWAY_TOKEN not set}"
TARGET="${OPENCLAW_NOTIFY_TARGET:?OPENCLAW_NOTIFY_TARGET not set}"
CHANNEL="${OPENCLAW_NOTIFY_CHANNEL:-telegram}"

# Escape message for JSON
JSON_MESSAGE=$(printf '%s' "$MESSAGE" | python3 -c 'import json,sys; print(json.dumps(sys.stdin.read()))')

RESPONSE=$(curl -sS "http://127.0.0.1:${PORT}/tools/invoke" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d "{
    \"tool\": \"message\",
    \"args\": {
      \"action\": \"send\",
      \"channel\": \"${CHANNEL}\",
      \"target\": \"${TARGET}\",
      \"message\": ${JSON_MESSAGE}
    }
  }")

# Check result
if echo "$RESPONSE" | grep -q '"ok":true'; then
  echo "✅ Notification sent"
else
  echo "❌ Failed to send notification: $RESPONSE" >&2
  exit 1
fi
