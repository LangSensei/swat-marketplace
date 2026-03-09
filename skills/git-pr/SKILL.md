---
name: git-pr
version: "1.0.0"
description: Git branch management and GitHub PR workflow
dependencies:
  skills: []
---

# Git PR Skill

## Branch Workflow

1. **Check current branch**: `git branch --show-current`
2. **Create feature branch**: Branch is already created by SWAT worktree (`swat/{operation-id}`)
3. **Stage changes**: `git add -A` or `git add <specific-files>`
4. **Commit**: Use conventional commits format
5. **Push**: `git push origin HEAD`
6. **Open PR**: `gh pr create --title "..." --body "..." --base master`

## Conventional Commits

Format: `<type>: <description>`

Types:
- `feat:` — New feature
- `fix:` — Bug fix
- `refactor:` — Code restructuring (no behavior change)
- `docs:` — Documentation only
- `test:` — Adding or fixing tests
- `chore:` — Maintenance (deps, CI, etc.)

Examples:
```
feat: add scheduler with cron expressions
fix: use syscall.Kill for process liveness check
refactor: split dispatch.go into 4 files
docs: update README for 10 tools
```

## PR Description Template

```markdown
## What

Brief description of the change.

## Why

Context and motivation.

## Changes

- file1.go: description
- file2.go: description

## How to Test

Steps to verify the change works.
```

## GitHub CLI Commands

```bash
# Create PR
gh pr create --title "feat: ..." --body "..." --base master

# Check PR status
gh pr status

# View PR
gh pr view <number>
```

## Rules

- **Never push directly to master** — always open a PR
- **One logical change per commit** — keep commits focused
- **PR title follows conventional commits** format
- **Include "How to Test" in PR body** when applicable
