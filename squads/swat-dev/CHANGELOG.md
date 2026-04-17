# Changelog

## 1.6.0 (2026-04-17)

### Changed
- Add mandatory "Debrief Rules" section requiring dispatch to swat-review after every PR open/update
- Dispatch brief must include PR number, repository, branch name, summary of changes, and files changed
- No-PR operations use Notify instead

## 1.5.0 (2026-04-12)

### Changed
- Add `scientific-method` skill dependency
- Remove Output Schema section

## 1.4.0 (2026-03-15)

### Changed
- Replace hardcoded swat_dispatch calls with debrief hints — let protocol debrief phase handle notify/dispatch

## 1.3.0 (2026-03-09)

- Auto-dispatch to swat-review after every PR push (new or fix)

## 1.2.0 (2026-03-09)

- Add SWAT MCP dependency for cross-squad dispatch
- Support resuming existing branches (git-pr Mode B) for fixing review comments
- Mandatory worktree cleanup in delivery phase
- Handle open PR resume: push and comment instead of creating new PR

## 1.1.0 (2026-03-09)

- Standardize to TEMPLATE format (In scope/Out of scope, human-readable title)
- Remove PROTOCOL-redundant content (seal steps, report generation)
- Output Schema: squad-specific fields (pr_url, pr_number, branch, files_changed)
- Write Access: specific worktree path
- Report includes design decisions and justifications

## 1.0.0 (2026-03-09)

- Initial release
- SWAT v2 self-development squad
- Skills: go-dev, git-pr
