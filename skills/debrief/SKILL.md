---
name: debrief
version: "3.0.0"
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

### Usage

Call the `swat_notify` MCP tool with your notification message:

```json
swat_notify({"message": "your notification message"})
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
