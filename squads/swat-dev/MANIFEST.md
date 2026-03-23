---
name: swat-dev
version: "1.4.0"
description: Self-development squad for the SWAT system — implements features, fixes bugs, and opens PRs on the swat-v2 repository
dependencies:
  skills: [go-dev, git-pr]
  mcps: [swat]
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
3. If the brief specifies an existing branch (e.g. fixing review comments), use git-pr Mode B (resume existing branch) instead of creating a new one

### Development

1. Read the codebase structure: `main.go`, `commander/`, `mcp/`, `plugin/`
2. Implement changes following go-dev skill conventions
3. Verify compilation: `PATH=/usr/local/go/bin:$PATH go build -o /dev/null .`
4. Commit with conventional commit messages (see git-pr skill)

### Delivery

1. Push and open PR: `git push origin HEAD && gh pr create --title "..." --body "..." --base main`
   - If resuming an existing branch with an open PR, push and comment on the existing PR instead of creating a new one
2. PR description must include: What, Why, Changes, How to Test
3. Clean up worktree (mandatory): `cd ~/.swat/repos/swat-v2 && git worktree remove "$(pwd)/repo" --force`

**Debrief hint:** Opening a PR typically means review is needed — prefer dispatch over notify.

### Constraints

- **Never push directly to the default branch** — always open a PR
- **All code and markdown in English** — no Chinese in source files
- **Go module**: `github.com/LangSensei/swat`
- **Commit style**: conventional commits (feat:, fix:, refactor:, docs:, etc.)
- **One PR per operation** — keep changes focused

### Best Practices

- **Minimal change** — one PR solves one problem, don't bundle unrelated changes
- **Read before write** — understand existing architecture and conventions before making changes
- **Compile check** — run `go build` after every change, commit only when it passes
- **Backward compatible** — new features must not break existing operations or squads
- **OPERATION.MD is a contract** — template field changes affect all squads, consider impact carefully

Report should include: design decisions, implementation approach, justifications for key choices, and a summary of changes made.

## Output Schema

Captain must fill these frontmatter fields in `OPERATION.md` during the operation:

```yaml
pr_url: # GitHub PR link
pr_number: # PR number
branch: # feature branch name
files_changed: # number of files changed
```
