---
name: SWAT Dev
version: "1.0.0"
description: Self-development squad for the SWAT system — implements features, fixes bugs, and opens PRs on the swat-v2 repository
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
2. Clone the repository: `git clone https://github.com/LangSensei/swat-v2.git repo && cd repo`
3. Create a feature branch: `git checkout -b swat/{operation-id}`
4. Understand the codebase structure (read main.go, commander/, mcp/)
5. Plan the changes (use planning-with-files skill for complex tasks)
6. Implement changes
7. Verify: `PATH=/usr/local/go/bin:$PATH go build -o /dev/null .`
8. Commit with conventional commit messages
9. Push and open PR: `git push origin HEAD && gh pr create --title "..." --body "..." --base master`
10. Record PR link in OPERATION.md summary

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
