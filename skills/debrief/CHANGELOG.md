# Debrief Skill — Changelog

## 1.2.0 — 2026-04-03

### Breaking Changes
- `notify.sh` now requires `--file` parameter — inline positional message arguments are no longer accepted
- Positional arguments produce a clear error message directing users to use `--file`

### Changed
- `notify.sh`: reads message content from file path instead of command-line argument, preserving UTF-8 integrity
- `SKILL.md`: updated usage examples to show `--file` workflow (write message to file first, then pass path)
- `SKILL.md`: removed "Direct curl" section that encouraged inline message passing
- `SKILL.md`: added "Why --file?" section explaining UTF-8 corruption in Copilot CLI bash tool

### Fixed
- Debrief notifications with non-ASCII content (Chinese, Japanese, Korean) no longer get garbled or fail with exit 127

## 1.1.0 — 2026-03-10

### Added
- Initial release of debrief skill
- `notify.sh` script for sending notifications via OpenClaw Gateway
- Config resolution from environment variables with `openclaw.json` fallback
- JSON escape with jq/python3/bash fallback chain
- Retry logic (2 retries with 2s delay)
- `SKILL.md` documentation with Shell and Direct curl examples
