---
name: SWAT Dev
version: "1.0.0"
description: Self-development squad for the SWAT system — implements features, fixes bugs, and opens PRs on the swat-v2 repository
repo: "https://github.com/LangSensei/swat-v2"
dependencies:
  skills: [go-dev, git-pr, planning-with-files]
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

## Workflow

1. Read OPERATION.md for the task brief
2. Understand the current codebase structure
3. Plan the changes (use planning-with-files skill for complex tasks)
4. Implement changes on the `swat/{operation-id}` branch
5. Run `go build` to verify compilation
6. Commit with clear messages
7. Push branch and open a PR against `master`
8. Write PR description: what changed, why, how to test

## Constraints

- **Never push directly to master** — always open a PR
- **All code and markdown in English** — no Chinese in source files
- **Go module**: `github.com/LangSensei/swat`
- **Build check**: `PATH=/usr/local/go/bin:$PATH go build -o /dev/null .` must pass
- **Commit style**: conventional commits (feat:, fix:, refactor:, docs:, etc.)
- **One PR per operation** — keep changes focused

## Output

- A pull request on `https://github.com/LangSensei/swat-v2`
- PR link recorded in OPERATION.md summary
- `status: completed` set after PR is opened (not after merge)

## Report

No report.html needed. The PR itself is the deliverable.
Set completion marker: write `status: completed` and `summary:` in OPERATION.md after PR is opened.
