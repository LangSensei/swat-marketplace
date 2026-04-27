# Changelog

## 1.0.9 (2026-04-27)
- Hooks: fix PS1 stdin deadlock — replace `$Input | Out-String` with `[Console]::In.ReadToEnd()` in format-check.ps1 and staleness-check.ps1
- Hooks: unify whitelist across all 6 Copilot hook scripts (3 PS1 + 3 bash) — skip when tool targets `plan.md`, `progress.md`, `findings.md`, `OPERATION.md`, `report.html`, `.squad/`, or `.github/`
- Hooks: add stdin parsing and whitelist to context-refresh.ps1 and context-refresh.sh (previously missing)
- Hooks: align Gemini JS hooks (format-check.js, staleness-check.js, context-refresh.js) with same expanded whitelist

## 1.0.8 (2026-04-21)
- Hooks: add `format-check` script — validates plan.md structure (required sections, status values, cycle completeness, Current State format, Synthesis gate)
- Hooks: simplify `staleness-check` — remove Synthesis gate logic (moved to format-check), skip during Synthesis/Complete
- Hooks: simplify `context-refresh` — skip during Synthesis/Complete
- Hooks: remove `grep -oP` dependency — all parsing via Python (bash/PowerShell) or Node.js (Gemini) for cross-platform compatibility
- Template: change Current State format from separate Step + Cycle fields to single `**Step:**` field with values like `Cycle 1 - Hypothesis`
- Rename all phases to nouns for consistency: Understand→Observation, Decompose→Decomposition, Hypothesize→Hypothesis, Predict→Prediction, Conclude→Conclusion, Synthesize→Synthesis
- Step values and section headings are now identical — zero normalization needed in hooks
- Remove legacy verb aliases from hook validation (no more Synthesize/Hypothesize/etc fallbacks)

## 1.0.7 (2026-04-20)
- Frontmatter: update description to clarify mandatory execution methodology
- Remove "When to Use" / "Don't use for" section — skill selection is handled by squad MANIFEST dependencies
- Quick Start: strengthen step 1 — copying templates is the FIRST action, no other tool calls allowed before files exist

## 1.0.6 (2026-04-14)
- Hooks: restructure into `copilot/` and `gemini/` subdirectories for multi-runtime support
- Hooks: add Gemini CLI hooks with adapted I/O schema (`tool_input`/`decision`/`reason`)
- Hooks: Gemini scripts as cross-platform Node.js (.js) — no bash/Python dependency (Gemini CLI guarantees Node.js)

## 1.0.5 (2026-04-14)
- Quick Start: replace hardcoded `.github/skills/scientific-method/` paths with `<SKILL_DIR>` placeholder for runtime-agnostic portability across CLI environments

## 1.0.4 (2026-04-13)
- plan.md template: add missing `### Test` section to Cycle 1 and Cycle 2, matching SKILL.md's Hypothesize → Predict → Test → Conclude framework
- plan.md template: add `### Test (Attempt 2)` to rejected-hypothesis comment block
- SKILL.md: add "Don't Skip Cycles" rule — each Cycle must be completed in order
- Hooks: quality gate at Synthesize/Complete — deny tool use if prior steps/cycles have non-complete Status

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

## 1.0.0 (2026-04-12)

Initial release.

- Hypothesis-driven cognitive framework: Understand → Decompose → Cycle (H→P→T→C) → Synthesize
- Three working files: `plan.md` (thinking), `findings.md` (discoveries), `progress.md` (actions + status)
- Per-step status tracking including within-Cycle sub-steps
- 5 hooks: session-start, pre-tool-use (staleness check), post-tool-use, agent-stop, error-occurred
- Cross-platform: bash + PowerShell for all hooks
- Templates with inline documentation comments
