# SOP Skill — Changelog

## 1.1.0 (2026-04-28)

### Added
- Hooks: format-check preToolUse hook (3 runtimes: PS1, bash, JS) — validates plan.md structure: required `## Phases` section, valid Status values, Phase sections with Status/Prerequisites/checklist items, non-empty Current State Phase/Step, completion gate for last phase
- SKILL.md: Critical Rules section with 4 rules: When a Hook Denies Your Action, Hook-Managed Files, Preserve Template Structure, Keep Files Fresh
- Hook configs: format-check added as first preToolUse/BeforeTool entry in both Copilot and Gemini sop.json

### Changed
- Hooks: staleness-check deny message optimized across all 3 runtimes — now references `<SKILL_DIR>/templates/` and explicitly forbids timestamp manipulation
- Hooks: context-refresh deny message optimized (Copilot PS1 + bash) — clearer instructions, warns against modifying `.context_refresh_ts`
- SKILL.md: Quick Start step 3 updated to mention setting Current State after copying templates
- SKILL.md: version bump from 1.0.7 to 1.1.0

## 1.0.7 (2026-04-27)
- Hooks: unify whitelist across all 6 hook scripts (2 PS1 + 2 bash + 2 JS) — skip when tool targets `plan.md`, `progress.md`, `findings.md`, `OPERATION.md`, `report.html`, `.squad/`, or `.github/`
- Hooks: add stdin parsing and whitelist to context-refresh.ps1 and context-refresh.sh (previously missing)

## 1.0.6 (2026-04-20)
- Frontmatter: update description to clarify mandatory execution methodology
- Remove "When to Use" section — skill selection is handled by squad MANIFEST dependencies
- Quick Start: strengthen step 1 — copying templates is the FIRST action, no other tool calls allowed before files exist

## 1.0.5 (2026-04-14)
- Hooks: restructure into `copilot/` and `gemini/` subdirectories for multi-runtime support
- Hooks: add Gemini CLI hooks with adapted I/O schema (`tool_input`/`decision`/`reason`)
- Hooks: Gemini scripts as cross-platform Node.js (.js) — no bash/Python dependency (Gemini CLI guarantees Node.js)

## 1.0.4 (2026-04-14)
- Quick Start: replace hardcoded `.github/skills/sop/` paths with `<SKILL_DIR>` placeholder for runtime-agnostic portability across CLI environments

## 1.0.3 (2026-04-12)
- Quick Start: explicit cp commands — "Do NOT create from scratch", "If already exist, skip"
- Remove redundant Templates section
- Hooks: skip staleness-check + context-refresh when completed phases >= total - 1
- plan.md: add Phase/Step guidance in Current State comments; remove redundant Status/Blockers from Current State
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

## 1.0.0 (2026-04-12)

### Added
- Initial release of SOP skill
- SKILL.md with phase-based execution rules, 2-Action Rule, Phase Gate, 3-Strike Protocol
- Templates: plan.md (phase/step checklists), findings.md (discoveries), progress.md (execution log)
- Hooks: session-start, post-tool-use (2-Action Rule), error-occurred, agent-stop
