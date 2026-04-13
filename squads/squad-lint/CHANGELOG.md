# Changelog

## 1.0.2 — 2026-04-13

- Phase 1: add prereq file-existence check when `prereq` is declared in SKILL.md frontmatter
- Phase 3: fix hooks paths — hooks only exist in skills (`skills/*/hooks/<name>.json`), not squads; document `<name>-scripts/` convention
- Phase 5: fix SETUP.md path from `skills/*/SETUP.md` to `skills/*/references/SETUP.md`

## 1.0.1 — 2026-04-13

- Fix: replace incorrect debrief hint (squad-lint is read-only, never opens PRs)
- Fix: add git-pr to dependencies (git-pr Mode C is used in Setup for read-only worktree)

## 1.0.0 — 2026-04-13

- Initial release
- Six validation phases: SKILL.md frontmatter, MANIFEST.md validation, hook configuration, CHANGELOG validation, SETUP.md validation, cross-file consistency
- Per-item pass/fail/warning reporting with file locations
- Summary totals in report output
