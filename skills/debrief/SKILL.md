---
name: debrief
version: "1.1.0"
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

### Shell

```bash
bash path/to/debrief/notify.sh "Operation complete: key findings here"
```

### Direct curl

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
| `OPENCLAW_GATEWAY_PORT` | Yes | Gateway port (default: 18789) |
| `OPENCLAW_GATEWAY_TOKEN` | Yes | Gateway auth token |
| `OPENCLAW_NOTIFY_TARGET` | Yes | Default recipient (chat ID) |
| `OPENCLAW_NOTIFY_CHANNEL` | No | Channel type (default: telegram) |

## Protocol Integration

Add this skill to your squad's protocol or MANIFEST dependencies:

```yaml
dependencies:
  skills: [debrief]
```

Then in AGENTS.md or protocol:

```
When your work is complete, follow the debrief skill:
- If this is the final step → notify the user
- If further work is needed → dispatch the next task
```
