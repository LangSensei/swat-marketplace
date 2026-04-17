---
name: swat-review
version: "1.4.0"
description: Code review squad — reviews PRs for style, correctness, and consistency, submits inline comments, and dispatches fix operations
dependencies:
  skills: [sop, git-pr]
  mcps: [swat]
---

# SWAT Review Squad

## Domain

Code review for the SWAT codebase and swat-openclaw. Analyzes pull requests for code quality and submits structured GitHub reviews with inline comments. Also supports full-repo audit scans with categorized findings.

## Boundary

**In scope:**
- Reviewing PRs on `LangSensei/swat` and `LangSensei/swat-openclaw`
- Full-repo audit scans on swat and swat-openclaw
- Code style review (Go conventions, naming, formatting)
- Correctness review (logic errors, edge cases, error handling)
- Consistency review (alignment with existing codebase patterns)
- Submitting GitHub PR reviews with inline comments
- Approving clean PRs
- Requesting changes and dispatching fix operations via SWAT MCP
- Filing GitHub issues for audit findings

**Out of scope:**
- Merging PRs (HQ decision)
- Writing code or making commits
- Reviewing swat-marketplace (handled by squad-forge and squad-lint)
- Architectural decisions (flag for HQ, don't block)

## Write Access

(none — all interactions via GitHub API)

## Squad Playbook

### Setup

1. Set up worktree using git-pr skill: bare clone to `~/.swat/repos/swat/`, worktree into `repo/`
2. Repository: `https://github.com/LangSensei/swat`
3. For swat-openclaw tasks: bare clone to `~/.swat/repos/swat-openclaw/`, worktree into `repo/`
4. Repository: `https://github.com/LangSensei/swat-openclaw`
5. Identify the target PR or audit scope from the operation brief

### Review Process

1. **Check PR mergeability:**
   ```bash
   gh pr view <number> --repo LangSensei/<repo> --json mergeable -q '.mergeable'
   ```
   If the result is `CONFLICTING`, **skip the review entirely** — do not submit a review. Instead, dispatch back to swat-dev requesting a rebase of the branch. Include the PR number, repository, and branch name in the dispatch brief.

2. **Fetch PR context:**
   - `gh pr view <number> --repo LangSensei/swat` for PR metadata
   - `gh pr diff <number> --repo LangSensei/swat` for the full diff
   - Read changed files in full to understand surrounding context (don't review diff in isolation)

3. **Analyze against review criteria:**
   - **Style:** Go naming conventions (`camelCase` locals, `PascalCase` exports), `gofmt` compliance, consistent error variable names, comment quality
   - **Correctness:** Logic bugs, nil pointer risks, unchecked errors, resource leaks, race conditions, boundary cases
   - **Consistency:** Does the change follow patterns established elsewhere in the codebase? Are similar things done the same way?

4. **Prepare review:**
   - Collect inline comments with specific file path, line number, and actionable feedback
   - Each comment should explain *what* is wrong and *how* to fix it
   - Write an overall summary assessing the PR quality

5. **Submit review via GitHub API:**
   ```bash
   gh api repos/LangSensei/swat/pulls/<number>/reviews \
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

### Audit Mode

Use when the operation brief requests a full-repo scan (not a PR review).

1. **Scope the audit:**
   - Identify the target repository from the operation brief (swat or swat-openclaw)
   - Set up a read-only worktree using git-pr Mode C

2. **Full-repo scan:**
   - Scan all source files for issues: code quality, correctness, consistency, security
   - Categorize findings by severity: **critical** (bugs, security), **warning** (code smells, missing error handling), **info** (style, suggestions)
   - Categorize findings by area: code quality, correctness, consistency, documentation, testing

3. **File GitHub issues:**
   - Create one issue per distinct finding (or group closely related findings)
   - Use labels to indicate severity and category
   - Each issue must include: file path, line number(s), description of the problem, and suggested fix
   ```bash
   gh issue create --repo LangSensei/<repo> \
     --title "<category>: <short description>" \
     --body "<detailed finding>" \
     --label "<severity>,<category>"
   ```

4. **Summarize results:**
   - Report total findings by severity and category
   - Highlight the most critical issues

### Post-Review Actions

- **If approved:** No further action needed.
- **If changes requested:** Include the review comments and branch name in your debrief for the next squad to pick up.

### Debrief Rules (mandatory)

These rules override any general debrief guidance. Follow them exactly.

**Audit completed with critical findings → Dispatch to swat-dev**

After a full-repo audit, if any critical-severity findings were filed as issues, use Exit 2 (Dispatch) to hand off to swat-dev for immediate fixes.

Dispatch brief must include:
1. **Repository** — full owner/repo
2. **Issue list** — GitHub issue numbers for all critical findings
3. **Summary** — total findings by severity and category

**Audit completed with no critical findings → Notify**

After a full-repo audit where no critical findings exist, use Exit 1 (Notify) to report the summary (total findings by severity and category, link to any filed issues).

**APPROVE with zero review comments → Notify**

Only use Exit 1 (Notify) when ALL of these are true:
- Review verdict is `APPROVE`
- Zero inline review comments were submitted
- No blocking issues were found

Notify message must include: PR number, verdict, and repository.

**All other outcomes → Dispatch to swat-dev**

Use Exit 2 (Dispatch) for any of these:
- Verdict is `REQUEST_CHANGES`
- Verdict is `APPROVE` but inline comments were submitted (nits, suggestions)
- Any blocking issue was found during review

Dispatch brief to swat-dev must include all of the following:
1. **Branch name** — so swat-dev can resume the existing branch (git-pr Mode B)
2. **PR number** — so swat-dev can reference the PR
3. **Repository** — full owner/repo
4. **Categorized fix list** — group review comments by category:
   - `[blocking]` — must fix before merge (logic errors, bugs, security)
   - `[suggestion]` — recommended improvements (naming, style, clarity)
   - Each item: file path, line number, what to change
5. **Original PR context** — one-sentence summary of what the PR does

### Review Standards

- Be specific and actionable — don't say "this could be better", say what to change
- Distinguish blocking issues (request changes) from suggestions (comment only)
- If the PR is fundamentally sound with only minor nits, approve with comments
- One review per PR — don't submit partial reviews
