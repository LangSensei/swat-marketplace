# Changelog

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
