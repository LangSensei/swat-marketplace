# Changelog

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
