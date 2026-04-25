# Changelog

## 1.2.0 (2026-04-25)

### Added
- Phase 6: Semantic Code Review — six advisory-only checks for code-level semantic issues:
  - Cross-platform hook consistency (logical equivalence across copilot/gemini runtimes)
  - CHANGELOG text vs code alignment (quoted identifiers and renamed sections)
  - Template comment consistency (HTML comments vs current section headings)
  - PowerShell reserved variable names (`$input` detection in `.ps1` files)
  - Duplicate comments in hook scripts
  - String literal hygiene (stray spaces before punctuation, consecutive punctuation)

### Changed
- Domain and Boundary updated to include static semantic review of hook scripts, templates, and code text patterns
- Description updated to reflect both structural and semantic validation

## 1.1.1 (2026-04-17)

### Changed
- Phase 5: relax Steps requirement — sections now need a `### Check` plus at least one other `###` subsection (not strictly `### Steps`)
- Phase 5: relax platform label rule — standard names (`Linux`, `macOS`, `Windows`) required, but specific variants like `Linux (amd64)` are acceptable

## 1.1.0 (2026-04-17)

### Added
- Mandatory Debrief Rules section — all checks pass dispatches notify; failures dispatch to squad-forge
- Mergeable pre-check — check PR mergeability before linting; CONFLICTING status skips lint and dispatches rebase request
- Incremental PR mode — when PR number is specified, only lint changed files plus cross-references; fall back to full scan otherwise
- Phase 7: Semantic Checks — duplicate consecutive lines, conflicting debrief patterns, empty section bodies, orphaned squad/skill references

### Changed
- Phase 4: same-date CHANGELOG warning now only triggers when both entries appear in the PR diff (pre-existing same-date entries no longer warn)

### Removed
- Debrief hint (replaced by mandatory Debrief Rules)

## 1.0.1 (2026-04-14)

### Added
- `swat` MCP dependency — enables `swat_dispatch` during debrief for dispatch pipeline

## 1.0.0 (2026-04-13)

- Initial release
- Six validation phases: SKILL.md frontmatter, MANIFEST.md validation, hook configuration, CHANGELOG validation, SETUP.md validation, cross-file consistency
- Per-item pass/fail/warning reporting with file locations
- Summary totals in report output
- Debrief hint corrected (squad-lint is read-only, never opens PRs)
- Added git-pr to dependencies (git-pr Mode C is used in Setup for read-only worktree)
- Phase 1: add prereq file-existence check when `prereq` is declared in SKILL.md frontmatter
- Phase 3: fix hooks paths — hooks only exist in skills (`skills/*/hooks/<name>.json`), not squads; document `<name>-scripts/` convention
- Phase 5: fix SETUP.md path from `skills/*/SETUP.md` to `skills/*/references/SETUP.md`
