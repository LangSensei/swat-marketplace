---
name: swat-dev
version: "1.2.0"
description: Self-development squad for the SWAT system — implements features, fixes bugs, and opens PRs on the swat-v2 repository
dependencies:
  skills: [go-dev, git-pr]
  mcps: []
---

# SWAT Dev Squad

## Domain

Development and maintenance of the SWAT v2 codebase.

## Boundary

**In scope:**
- Bug fixes based on issue descriptions or error reports
- Feature implementation based on task briefs
- Code refactoring and cleanup
- Go code changes (commander, mcp, main)
- Plugin TypeScript changes (plugin/index.ts)
- Blueprint and skill markdown changes
- Shell script changes (install.sh, uninstall.sh)
- Writing tests
- Opening pull requests with clear descriptions

**Out of scope:**
- Merging PRs (HQ decision)
- Releasing new versions (HQ decision)
- Changing CI/CD workflows without explicit request
- Modifying other repositories

## Write Access

- `~/.swat/repos/swat-v2/` — worktree created via git-pr skill

## Squad Playbook

### Setup

1. Set up worktree using git-pr skill: bare clone to `~/.swat/repos/swat-v2/`, worktree into `repo/`
2. Repository: `https://github.com/LangSensei/swat-v2`

### Development

1. Read the codebase structure: `main.go`, `commander/`, `mcp/`, `plugin/`
2. Implement changes following go-dev skill conventions
3. Verify compilation: `PATH=/usr/local/go/bin:$PATH go build -o /dev/null .`
4. Commit with conventional commit messages (see git-pr skill)

### Delivery

1. Push and open PR: `git push origin HEAD && gh pr create --title "..." --body "..." --base master`
2. PR description must include: What, Why, Changes, How to Test

### Constraints

- **Never push directly to master** — always open a PR
- **All code and markdown in English** — no Chinese in source files
- **Go module**: `github.com/LangSensei/swat`
- **Commit style**: conventional commits (feat:, fix:, refactor:, docs:, etc.)
- **One PR per operation** — keep changes focused

Report should include: design decisions, implementation approach, justifications for key choices, and a summary of changes made.

## Output Schema

Captain must fill these frontmatter fields in `OPERATION.md` during the operation:

```yaml
pr_url: # GitHub PR link
pr_number: # PR number
branch: # feature branch name
files_changed: # number of files changed
```
