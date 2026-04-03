---
name: debrief
version: "1.2.0"
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

When your operation is the final step (no further work needed), send a concise notification to the user with your key findings.

### Why --file?

Copilot CLI's bash tool corrupts multi-byte UTF-8 characters (Chinese, Japanese, Korean, etc.) when they appear in inline command arguments or heredoc blocks. Messages containing non-ASCII text get garbled or cause exit 127. The fix: always write the message to a file first using the `create` tool, then pass the file path to `notify.sh`.

### Usage

1. Write your message to a file using the `create` tool:

```
create file: /path/to/operators/captain/debrief-msg.txt
content: "Operation complete: key findings here"
```

2. Send the notification:

```bash
bash path/to/debrief/notify.sh --file /path/to/operators/captain/debrief-msg.txt
```

With optional target and channel:

```bash
bash path/to/debrief/notify.sh --file /path/to/msg.txt --target CHAT_ID --channel telegram
```

### Notification Guidelines

- Keep it concise and actionable (2-5 sentences)
- Lead with the conclusion, not the process
- Include key numbers/data points
- No need to repeat the full analysis — the user can check findings.md for details

## Exit 2: Dispatch

When further work is needed, use the `swat_dispatch` MCP tool to hand off to the next squad.

```
Use swat_dispatch to create a new task with:
- A clear brief describing what needs to be done next
- Reference to this operation's findings if the next squad needs context
```

## Environment Variables (for notify)

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENCLAW_GATEWAY_PORT` | No | Gateway port (default: from config or 18789) |
| `OPENCLAW_GATEWAY_TOKEN` | No | Gateway auth token (default: from config) |
| `OPENCLAW_NOTIFY_TARGET` | No | Default recipient chat ID (default: from config) |
| `OPENCLAW_NOTIFY_CHANNEL` | No | Channel type (optional) |

All variables fall back to `~/.openclaw/openclaw.json` if not set.

## Protocol Integration

Add this skill to your squad's protocol or MANIFEST dependencies:

```yaml
dependencies:
  skills: [debrief]
```

Then in AGENTS.md or protocol:

```
When your work is complete, follow the debrief skill:
- If this is the final step → notify the user (write message to file, pass --file)
- If further work is needed → dispatch the next task
```
