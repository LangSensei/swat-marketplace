---
name: git-pr
version: "1.0.0"
description: Git branch management and GitHub PR workflow using worktrees
dependencies:
  skills: []
---

# Git PR Skill

## Repository Setup

All repos are cached at `~/.swat/repos/`. First time clones, subsequent operations reuse.

```bash
REPO_NAME="<repo-name>"  # e.g. swat-v2
REPO_URL="<repo-url>"    # e.g. https://github.com/LangSensei/swat-v2
REPO_DIR="$HOME/.swat/repos/$REPO_NAME"

# First time: clone. Subsequent: fetch.
if [ -d "$REPO_DIR" ]; then
  cd "$REPO_DIR" && git fetch --all --prune
else
  git clone --bare "$REPO_URL" "$REPO_DIR"
fi
```

## Worktree Workflow

Each operation gets its own worktree — isolated branch, shared .git objects, millisecond creation.

```bash
BRANCH="swat/{operation-id}"
WORK_DIR="$(pwd)"  # operation dir

# Create worktree (operation dir must be empty or use a subdirectory)
cd "$REPO_DIR"
git worktree add -b "$BRANCH" "$WORK_DIR/repo" origin/master

# Work in the worktree
cd "$WORK_DIR/repo"
# ... make changes ...

# Cleanup after PR is opened (optional)
cd "$REPO_DIR"
git worktree remove "$WORK_DIR/repo" --force
```

## Commit & Push

```bash
git add -A
git commit -m "feat: description"
git push origin HEAD
```

## Open PR

```bash
gh pr create --title "feat: ..." --body "..." --base master
```

## Conventional Commits

Format: `<type>: <description>`

Types:
- `feat:` — New feature
- `fix:` — Bug fix
- `refactor:` — Code restructuring
- `docs:` — Documentation only
- `test:` — Tests
- `chore:` — Maintenance

## PR Description Template

```markdown
## What
Brief description of the change.

## Why
Context and motivation.

## Changes
- file1: description
- file2: description

## How to Test
Steps to verify.
```

## Rules

- **Never push directly to master** — always open a PR
- **One logical change per commit**
- **PR title follows conventional commits**
- **Always clone/fetch to `~/.swat/repos/`** — never clone into operation dir directly
