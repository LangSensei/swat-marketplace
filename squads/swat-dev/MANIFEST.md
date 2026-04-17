---
name: swat-dev
version: "1.7.0"
description: Self-development squad for the SWAT system — implements features, fixes bugs, and opens PRs on the swat repository
dependencies:
  skills: [scientific-method, go-dev, git-pr]
  mcps: [swat]
---

# SWAT Dev Squad

## Domain

Development and maintenance of the SWAT codebase.
Development and maintenance of the SWAT codebase and swat-openclaw (Go module in the same ecosystem).

## Boundary

**In scope:**
- Bug fixes based on issue descriptions or error reports
- Feature implementation based on task briefs
- Code refactoring and cleanup
- Go code changes (commander, mcp, main) in swat and swat-openclaw
- Plugin TypeScript changes (plugin/index.ts)
- Blueprint and skill markdown changes
- Shell script changes (install.sh, uninstall.sh)
- Writing tests
- Opening pull requests with clear descriptions

**Out of scope:**
- Merging PRs (HQ decision)
- Releasing new versions (HQ decision)
- Changing CI/CD workflows without explicit request
- Modifying repositories outside swat and swat-openclaw

## Write Access

- `~/.swat/repos/swat/` — worktree created via git-pr skill
- `~/.swat/repos/swat-openclaw/` — worktree created via git-pr skill

## Squad Playbook

### Setup

1. Set up worktree using git-pr skill: bare clone to `~/.swat/repos/swat/`, worktree into `repo/`
2. Repository: `https://github.com/LangSensei/swat`
3. For swat-openclaw tasks: bare clone to `~/.swat/repos/swat-openclaw/`, worktree into `repo/`
4. Repository: `https://github.com/LangSensei/swat-openclaw`
5. If the brief specifies an existing branch (e.g. fixing review comments), use git-pr Mode B (resume existing branch) instead of creating a new one

### Development

1. Read the codebase structure: `main.go`, `commander/`, `mcp/`, `plugin/`
2. Implement changes following go-dev skill conventions
3. Verify compilation: `PATH=/usr/local/go/bin:$PATH go build -o /dev/null .`
4. Commit with conventional commit messages (see git-pr skill)

### Delivery

1. Push and open PR: `git push origin HEAD && gh pr create --title "..." --body "..." --base main`
   - If resuming an existing branch with an open PR, push and comment on the existing PR instead of creating a new one
2. PR description must include: What, Why, Changes, How to Test
3. Clean up worktree (mandatory): `cd ~/.swat/repos/swat && git worktree remove "$(pwd)/repo" --force`

### Debrief Rules (mandatory)

These rules override any general debrief guidance. Follow them exactly.

**PR was opened or updated → Dispatch to swat-review**

Every completed swat-dev operation that opens a PR (or pushes to an existing PR) must use Exit 2 (Dispatch) to hand off to swat-review for code review. This is not optional.

Dispatch brief to swat-review must include:
1. **PR number** — the PR to review
2. **Repository** — full owner/repo
3. **Branch name** — the branch that was pushed
4. **Summary of changes** — what the PR does and why
5. **Files changed** — list of modified files

**No PR opened → Notify**

If the operation did not open or update a PR (e.g., the task was analysis-only, or the build failed before PR creation), use Exit 1 (Notify) to report the outcome.

### Constraints

- **Never push directly to the default branch** — always open a PR
- **All code and markdown in English** — no Chinese in source files
- **Go modules**: `github.com/LangSensei/swat`, `github.com/LangSensei/swat-openclaw`
- **Commit style**: conventional commits (feat:, fix:, refactor:, docs:, etc.)
- **One PR per operation** — keep changes focused

### Best Practices

- **Minimal change** — one PR solves one problem, don't bundle unrelated changes
- **Read before write** — understand existing architecture and conventions before making changes
- **Compile check** — run `go build` after every change, commit only when it passes
- **Backward compatible** — new features must not break existing operations or squads
- **OPERATION.MD is a contract** — template field changes affect all squads, consider impact carefully

Report should include: design decisions, implementation approach, justifications for key choices, and a summary of changes made.
