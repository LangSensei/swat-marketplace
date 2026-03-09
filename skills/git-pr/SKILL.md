---
name: git-pr
version: "1.1.0"
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

### Mode A: New Branch (default)

Use when starting a fresh PR from master.

```bash
BRANCH="swat/{operation-id}"
WORK_DIR="$(pwd)"  # operation dir

cd "$REPO_DIR"
git worktree add -b "$BRANCH" "$WORK_DIR/repo" origin/master

cd "$WORK_DIR/repo"
# ... make changes ...
```

### Mode B: Resume Existing Branch

Use when the brief specifies an existing branch (e.g. fixing review comments on an open PR).

```bash
EXISTING_BRANCH="<branch-from-brief>"  # e.g. feat/mcp-only-flag
WORK_DIR="$(pwd)"

cd "$REPO_DIR"
git fetch origin
git worktree add "$WORK_DIR/repo" "origin/$EXISTING_BRANCH"
cd "$WORK_DIR/repo"
git checkout -B "$EXISTING_BRANCH" "origin/$EXISTING_BRANCH"

# ... make changes, commit, push ...
```

**How to decide:** If the operation brief contains a branch name or PR reference with an existing branch, use Mode B. Otherwise use Mode A.

## Worktree Cleanup

**Mandatory at seal time.** After push, the worktree has no purpose — the remote branch is the source of truth. Squads using this skill must clean up in their playbook's seal/delivery phase.

```bash
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
- **Always clean up worktree at seal** — do not leave orphaned worktrees
