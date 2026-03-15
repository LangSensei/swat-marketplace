---
name: notify
version: "1.0.0"
description: Send notifications to the user via OpenClaw Gateway
dependencies:
  skills: []
  mcps: []
---

# Notify Skill

Send messages to the user through OpenClaw's messaging infrastructure. Works with any configured channel (Telegram, Discord, Signal, etc.).

## How It Works

Uses the OpenClaw Gateway `/tools/invoke` HTTP API to call the `message` tool. This keeps all messaging within OpenClaw's policy and routing layer — no direct Telegram/Discord API calls needed.

## Usage

### Shell (notify.sh)

```bash
bash path/to/notify/notify.sh "Analysis complete: valuation looks reasonable, recommend hold"
```

### curl (direct)

```bash
curl -sS "http://127.0.0.1:${OPENCLAW_GATEWAY_PORT:-18789}/tools/invoke" \
  -H "Authorization: Bearer ${OPENCLAW_GATEWAY_TOKEN}" \
  -H "Content-Type: application/json" \
  -d "{
    \"tool\": \"message\",
    \"args\": {
      \"action\": \"send\",
      \"channel\": \"telegram\",
      \"target\": \"${OPENCLAW_NOTIFY_TARGET}\",
      \"message\": \"your message here\"
    }
  }"
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENCLAW_GATEWAY_PORT` | Yes | Gateway port (default: 18789) |
| `OPENCLAW_GATEWAY_TOKEN` | Yes | Gateway auth token |
| `OPENCLAW_NOTIFY_TARGET` | Yes | Default recipient (chat ID) |
| `OPENCLAW_NOTIFY_CHANNEL` | No | Channel type (default: telegram) |

## When to Use

- **Operation complete**: notify the user with a summary of results
- **Error/failure**: alert the user that something went wrong
- **Triggered condition**: e.g., price alert, threshold reached

## When NOT to Use

- Mid-chain progress updates (just continue to the next step)
- Trivial status updates (write to OPERATION.md instead)

## Notes

- Messages are subject to OpenClaw's tool policy
- The Gateway must be running and accessible on localhost
- Keep messages concise and actionable — the user doesn't need a wall of text
