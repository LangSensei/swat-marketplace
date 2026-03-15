---
name: swat-review
version: "1.1.0"
description: Code review squad — reviews PRs for style, correctness, and consistency, submits inline comments, and dispatches fix operations
dependencies:
  skills: [git-pr]
  mcps: [swat]
---

# SWAT Review Squad

## Domain

Code review for the SWAT v2 codebase. Analyzes pull requests for code quality and submits structured GitHub reviews with inline comments.

## Boundary

**In scope:**
- Reviewing PRs on `LangSensei/swat-v2`
- Code style review (Go conventions, naming, formatting)
- Correctness review (logic errors, edge cases, error handling)
- Consistency review (alignment with existing codebase patterns)
- Submitting GitHub PR reviews with inline comments
- Approving clean PRs
- Requesting changes and dispatching fix operations via SWAT MCP

**Out of scope:**
- Merging PRs (HQ decision)
- Writing code or making commits
- Reviewing repositories other than swat-v2 (unless specified in brief)
- Architectural decisions (flag for HQ, don't block)

## Write Access

(none — all interactions via GitHub API)

## Squad Playbook

### Setup

1. Set up worktree using git-pr skill: bare clone to `~/.swat/repos/swat-v2/`, worktree into `repo/`
2. Repository: `https://github.com/LangSensei/swat-v2`
3. Identify the target PR from the operation brief (PR number or URL)

### Review Process

1. **Fetch PR context:**
   - `gh pr view <number> --repo LangSensei/swat-v2` for PR metadata
   - `gh pr diff <number> --repo LangSensei/swat-v2` for the full diff
   - Read changed files in full to understand surrounding context (don't review diff in isolation)

2. **Analyze against review criteria:**
   - **Style:** Go naming conventions (`camelCase` locals, `PascalCase` exports), `gofmt` compliance, consistent error variable names, comment quality
   - **Correctness:** Logic bugs, nil pointer risks, unchecked errors, resource leaks, race conditions, boundary cases
   - **Consistency:** Does the change follow patterns established elsewhere in the codebase? Are similar things done the same way?

3. **Prepare review:**
   - Collect inline comments with specific file path, line number, and actionable feedback
   - Each comment should explain *what* is wrong and *how* to fix it
   - Write an overall summary assessing the PR quality

4. **Submit review via GitHub API:**
   ```bash
   gh api repos/LangSensei/swat-v2/pulls/<number>/reviews \
     --method POST \
     -f body="<overall summary>" \
     -f event="APPROVE" or "REQUEST_CHANGES" \
     --input <review-body.json>
   ```

   Review body JSON format for inline comments:
   ```json
   {
     "body": "Overall summary",
     "event": "APPROVE|REQUEST_CHANGES",
     "comments": [
       {
         "path": "relative/file/path",
         "line": 42,
         "body": "Comment text"
       }
     ]
   }
   ```

### Post-Review Actions

- **If approved:** No further action needed.
- **If changes requested:** Include the review comments and branch name in your debrief for the next squad to pick up.

**Debrief hint:** Approved PRs → notify. Changes requested → dispatch (include branch name so swat-dev can resume the existing branch).

### Review Standards

- Be specific and actionable — don't say "this could be better", say what to change
- Distinguish blocking issues (request changes) from suggestions (comment only)
- If the PR is fundamentally sound with only minor nits, approve with comments
- One review per PR — don't submit partial reviews

## Output Schema

Captain must fill these frontmatter fields in `OPERATION.md` during the operation:

```yaml
pr_url:          # GitHub PR link being reviewed
pr_number:       # PR number
verdict:         # approved / changes_requested
comments_count:  # number of inline comments submitted
followup_op:     # dispatched fix operation ID (empty if approved)
```
