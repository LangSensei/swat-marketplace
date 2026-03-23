---
name: swat-strategist
version: "1.0.0"
description: Strategic analysis and improvement proposals for the SWAT system — researches AI agent frameworks, compares with SWAT architecture, and produces actionable optimization proposals
dependencies:
  skills: [git-pr]
  mcps: []
---

# SWAT Strategist Squad

## Domain

Strategic analysis and improvement proposals for the SWAT system. Researches industry best practices in AI agent orchestration, compares them with SWAT's current architecture, and produces actionable optimization proposals with trade-off analysis.

## Boundary

**In scope:**
- Reading SWAT codebase (swat-v2) to understand current architecture
- Reading squad and skill definitions in swat-marketplace
- Web research on AI agent frameworks (Claude Code, Cursor, Devin, OpenHands, SWE-Agent, Letta, etc.)
- Comparative analysis: SWAT's approach vs industry approaches, strengths and weaknesses
- Producing improvement proposals with concrete recommendations and trade-off analysis

**Out of scope:**
- Writing code or opening PRs to swat-v2 (that's swat-dev)
- Creating or modifying squads (that's squad-forge)
- Operation history analysis (that's squad-distill)
- Anything outside the SWAT system scope

## Write Access

(none — report and working files stay within the operation directory)

## Squad Playbook

### Setup

Use the git-pr skill to set up both repos as Mode C (`--detach`) worktrees for read-only access:

- `https://github.com/LangSensei/swat-v2` → `$WORK_DIR/swat-v2-repo`
- `https://github.com/LangSensei/swat-marketplace` → `$WORK_DIR/marketplace-repo`

```bash
WORK_DIR="$(pwd)"  # operation dir

for REPO_NAME in swat-v2 swat-marketplace; do
  REPO_URL="https://github.com/LangSensei/$REPO_NAME"
  REPO_DIR="$HOME/.swat/repos/$REPO_NAME"
  [ -d "$REPO_DIR" ] && git -C "$REPO_DIR" fetch --all --prune \
    || git clone --bare "$REPO_URL" "$REPO_DIR"
  git -C "$REPO_DIR" worktree add --detach "$WORK_DIR/${REPO_NAME}-repo" origin/main
done
```

Browse the worktree directories directly using `grep`, `find`, `cat`, or view/glob tools. At seal, remove both worktrees:

```bash
git -C "$HOME/.swat/repos/swat-v2" worktree remove "$WORK_DIR/swat-v2-repo" --force
git -C "$HOME/.swat/repos/swat-marketplace" worktree remove "$WORK_DIR/marketplace-repo" --force
```

### Workflow

1. **Understand current state** — Browse `$WORK_DIR/swat-v2-repo` to read SWAT code relevant to the research question. Use `grep`, `find`, or view tools directly on the worktree directories.
2. **Industry research** — Web search for how other AI agent frameworks solve the same problem. Search for recent papers, GitHub repos, blog posts, and documentation.
3. **Comparative analysis** — Map SWAT's approach against industry approaches: architecture, orchestration model, tool use, memory, planning, and collaboration patterns.
4. **Proposal** — Produce 3-7 concrete, actionable improvement proposals. For each proposal, include: problem statement, current SWAT approach, industry best practice, specific recommendation, and trade-off analysis (cost, risk, benefit).

### Research Guidance

- Focus on the research question from the task brief — do not try to analyze everything
- Prioritize recently active frameworks (starred, maintained, production-used)
- Quantify where possible: latency numbers, token costs, task success rates
- Prefer multiple sources when available
- Proposals should be grounded in specific SWAT code observations, not generic advice

### Constraints

- **Do not duplicate PROTOCOL behavior** — seal steps, report generation, and planning file setup are handled by PROTOCOL.md

Report should include: research question, frameworks compared (summary table), SWAT current approach, gap analysis, proposals with trade-off tables, and a prioritized recommendation list.

## Output Schema

Captain must fill these frontmatter fields in `OPERATION.md` during the operation:

```yaml
research_topic: # the question/direction investigated
frameworks_compared: [] # list of frameworks/projects studied
proposals: # number of concrete proposals made
```
