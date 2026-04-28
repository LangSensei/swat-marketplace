---
name: debrief
version: "3.2.0"
description: Operation completion gate — notify the user or dispatch the next task
dependencies:
  skills: []
  mcps: [swat]
---

# Debrief Skill

Every operation must end with a debrief. Choose exactly one exit:

1. **Notify** — this is the final step, report results to the user
2. **Dispatch** — further work is needed, hand off to the next squad

Never both. Never neither.

## Decision Tree

Use this flowchart to decide which exit to take. **Squad-specific debrief rules in the MANIFEST always override this general guidance.**

```
START
  │
  ├─ Does your squad MANIFEST have "Debrief Rules (mandatory)" section?
  │    YES → Follow those rules exactly. Stop here.
  │    NO  → Continue below.
  │
  ├─ Did your operation produce work that needs follow-up by another squad?
  │    YES → Exit 2 (Dispatch)
  │    NO  → Continue below.
  │
  ├─ Did your operation complete its assigned task successfully?
  │    YES → Exit 1 (Notify)
  │    NO  → Continue below.
  │
  ├─ Did your operation fail in a way another squad could fix?
  │    YES → Exit 2 (Dispatch) with failure context
  │    NO  → Exit 1 (Notify) with failure report
  │
  END
```

### Common Patterns

| Scenario | Exit | Target |
|----------|------|--------|
| PR opened, needs review | Dispatch | swat-review |
| PR reviewed, changes requested | Dispatch | swat-dev |
| PR reviewed, approved, zero comments | Notify | — |
| Analysis/research completed | Notify | — |
| Lint found errors, needs fix | Dispatch | swat-dev |
| All checks pass | Notify | — |
| Task failed, another squad can help | Dispatch | relevant squad |
| Task failed, no recovery path | Notify | — |

## Exit 1: Notify

Send a concise notification to the user with your key findings.

### Usage

Call the `swat_notify` MCP tool with your notification message:

```json
swat_notify({"operation_id": "<your-operation-id>", "message": "your notification message"})
```

> **`operation_id`** — read from OPERATION.md frontmatter. This enables the desktop notification to link directly to `report.html` when clicked. Optional but recommended.

### Notification Guidelines

- **Match the language of the operation brief** — if the brief is in Chinese, notify in Chinese; if in English, notify in English
- Keep it concise and actionable (2-5 sentences)
- Lead with the conclusion, not the process
- Include key numbers/data points
- No need to repeat the full analysis — the user can check the report for details

### Good Notify Examples

**Good — leads with conclusion, includes data:**
```
PR #42 on LangSensei/swat approved with no comments. Clean merge candidate.
```

**Good — failure with context:**
```
Build failed for feature/mcp-retry on LangSensei/swat. Go compilation error in mcp/client.go:128 — undefined reference to RetryConfig. This appears to require a type definition that wasn't included in the brief.
```

**Bad — too vague:**
```
Operation complete. Check the report for details.
```

## Exit 2: Dispatch

When further work is needed, use the `swat_dispatch` MCP tool to hand off to the next squad.

### Usage

Call the `swat_dispatch` MCP tool with a task brief:

```json
swat_dispatch({"brief": "your dispatch brief", "details": "additional context, file paths, specifics"})
```

> **`brief`** — concise one-line task description (used for classification). Keep it short and actionable.
> **`details`** — expanded context, constraints, file paths, code snippets, error messages. Put lengthy context here instead of cramming it into `brief`.

### Dispatch Brief Format

Every dispatch brief must be self-contained — the receiving squad has no access to your operation context. Include:

1. **What to do** — clear action statement (first sentence)
2. **Target** — repository, branch, PR number as applicable
3. **Context** — why this work is needed, what happened in the previous operation
4. **Specifics** — file paths, line numbers, error messages, categorized items
5. **Constraints** — any special requirements (e.g., "resume existing branch", "do not create new PR")

### Good Dispatch Examples

**Good — PR review dispatch (swat-dev → swat-review):**
```
Review PR #47 on LangSensei/swat (branch: swat/20260415-abc12345).

Changes: Added retry logic to MCP client with exponential backoff. Modified mcp/client.go and mcp/client_test.go.

Files changed: mcp/client.go, mcp/client_test.go, mcp/config.go
```

**Good — fix dispatch (swat-review → swat-dev):**
```
Fix review comments on PR #47, LangSensei/swat. Branch: swat/20260415-abc12345. Resume the existing branch.

Fixes needed:
[blocking] mcp/client.go:142 — retry loop does not check context cancellation, risk of infinite retry on shutdown
[blocking] mcp/client.go:156 — error wrapping loses original error type, breaks errors.Is() checks downstream
[suggestion] mcp/config.go:28 — MaxRetries default of 10 seems high, consider 3 with longer backoff

PR context: Adds retry logic to MCP client for transient network failures.
```

**Bad — missing context:**
```
Fix the PR issues.
```
