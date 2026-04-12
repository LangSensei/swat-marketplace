---
name: debrief
version: "2.0.0"
description: Operation completion gate — notify the user or dispatch the next task
dependencies:
  skills: []
  mcps: [swat]
---

# Debrief Skill

Every operation must end with a debrief. Choose exactly one exit:

1. **Notify** — this is the final step, report results to the user
2. **Dispatch** — further work is needed, hand off to the next squad

Never both. Never neither.

## Exit 1: Notify

Send a concise notification to the user with your key findings.

### How it works

1. Write your message to a file using the `create` tool (2-5 sentences, lead with the conclusion)
2. Run the notify script — it auto-detects whether OpenClaw is installed:
   - **OpenClaw installed** → sends via Gateway API
   - **OpenClaw not installed** → prints the message to stdout (Commander handles delivery)

### Usage

Write your message to a file first. **Do not pass inline message arguments** — shell tools corrupt multi-byte UTF-8 characters (CJK, etc.).

**Linux/macOS:**
```bash
bash path/to/debrief/notify.sh --file /path/to/msg.txt
```

**Windows:**
```powershell
pwsh path/to/debrief/notify.ps1 -File /path/to/msg.txt
```

With optional target and channel:
```bash
bash path/to/debrief/notify.sh --file /path/to/msg.txt --target CHAT_ID --channel telegram
```

### Notification Guidelines

- **Match the language of the operation brief** — if the brief is in Chinese, notify in Chinese; if in English, notify in English
- Keep it concise and actionable (2-5 sentences)
- Lead with the conclusion, not the process
- Include key numbers/data points
- No need to repeat the full analysis — the user can check the report for details

## Exit 2: Dispatch

When further work is needed, use the `swat_dispatch` MCP tool to hand off to the next squad.

Provide a clear brief describing what needs to be done next, with reference to this operation's findings if the next squad needs context.

## Environment Variables (for notify)

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENCLAW_GATEWAY_PORT` | No | Gateway port (default: from config or 18789) |
| `OPENCLAW_GATEWAY_TOKEN` | No | Gateway auth token (default: from config) |
| `OPENCLAW_NOTIFY_TARGET` | No | Default recipient chat ID (default: from config) |
| `OPENCLAW_NOTIFY_CHANNEL` | No | Channel type (optional) |

All variables fall back to `~/.openclaw/openclaw.json` if not set. If OpenClaw is not installed, these are ignored.
