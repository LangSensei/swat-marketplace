# SOP Skill — Changelog

## 1.0.1 (2026-04-12)
- Fix Windows encoding: ensure UTF-8 for PowerShell→Python pipe (fixes Chinese garbled output)
- Add PYTHONIOENCODING=utf-8 to all hook scripts

## 1.0.0 — 2026-04-12

### Added
- Initial release of SOP skill
- SKILL.md with phase-based execution rules, 2-Action Rule, Phase Gate, 3-Strike Protocol
- Templates: plan.md (phase/step checklists), findings.md (discoveries), progress.md (execution log)
- Hooks: session-start, post-tool-use (2-Action Rule), error-occurred, agent-stop
