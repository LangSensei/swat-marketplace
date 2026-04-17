# Changelog

## 1.4.0 (2026-04-17)

### Added
- Add swat-openclaw as in-scope repository for PR reviews and audits
- Add Audit Mode to playbook: full-repo scan, categorize findings, file GitHub issues
- Add swat-openclaw setup instructions to playbook

### Changed
- Expand domain to cover swat and swat-openclaw
- Clarify out-of-scope: swat-marketplace handled by squad-forge and squad-lint

## 1.3.0 (2026-04-17)

### Changed
- Replace debrief hint with mandatory "Debrief Rules" section
- APPROVE with zero comments → Notify; all other outcomes → Dispatch to swat-dev
- Dispatch brief must include branch name, PR number, repository, categorized fix list, and original PR context

## 1.2.0 (2026-04-12)
### Changed
- Add `sop` skill dependency
- Remove Output Schema section

## 1.1.0 (2026-03-15)

### Changed
- Replace hardcoded swat_dispatch calls with debrief hints — let protocol debrief phase handle notify/dispatch

## 1.0.0 (2026-03-09)

- Initial release
- PR review for style, correctness, and consistency
- GitHub PR inline comments via API
- Cross-squad dispatch via SWAT MCP for fix operations
