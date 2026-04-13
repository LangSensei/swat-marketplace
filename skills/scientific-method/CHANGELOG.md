# Changelog

## 1.0.4 (2026-04-13)
- plan.md template: add missing `### Test` section to Cycle 1 and Cycle 2, matching SKILL.md's Hypothesize → Predict → Test → Conclude framework
- plan.md template: add `### Test (Attempt 2)` to rejected-hypothesis comment block

## 1.0.3 (2026-04-12)
- Quick Start: explicit cp commands — "Do NOT create from scratch", "If already exist, skip"
- Remove redundant Templates section
- Hooks: skip staleness-check + context-refresh during final stages (Step = Synthesize or Complete)
- plan.md: add Step/Cycle OPTIONS, Cycle default `0`, Status fields for all sections (Understand/Decompose/Cycle H/P/T/C/Synthesize)
- progress.md: remove all Status fields — status tracking consolidated in plan.md
- progress.md: 5-Question Check points to plan.md

## 1.0.2 (2026-04-12)
- Rewrite hooks to preToolUse only (postToolUse/sessionStart/errorOccurred/agentStop outputs are ignored by Copilot CLI)
- Add staleness check: deny when plan.md/progress.md/findings.md not updated in 120s
- Add context refresh: deny every 5 minutes with reminder to re-read AGENTS.md + .squad/
- Remove 8 unused hook scripts (session-start, post-tool-use, error-occurred, agent-stop)

## 1.0.1 (2026-04-12)
- Fix Windows encoding: ensure UTF-8 for PowerShell→Python pipe (fixes Chinese garbled output)
- Add PYTHONIOENCODING=utf-8 to all hook scripts

## 1.0.0

Initial release.

- Hypothesis-driven cognitive framework: Understand → Decompose → Cycle (H→P→T→C) → Synthesize
- Three working files: `plan.md` (thinking), `findings.md` (discoveries), `progress.md` (actions + status)
- Per-step status tracking including within-Cycle sub-steps
- 5 hooks: session-start, pre-tool-use (staleness check), post-tool-use, agent-stop, error-occurred
- Cross-platform: bash + PowerShell for all hooks
- Templates with inline documentation comments
