---
name: squad-distill
version: "1.0.0"
description: Analyzes squad operation history to optimize MANIFEST playbooks, distill reusable skills, and prune stale INTEL — opens PRs to the marketplace
dependencies:
  skills: [git-pr]
  mcps: []
---

# Squad Distill Squad

## Domain

Cross-operation analysis and optimization of existing squads and skills in swat-marketplace.

## Boundary

**In scope:**
- Reading a target squad's operation history (findings, reports, knowledge, INTEL)
- Identifying repeated patterns, recurring failures, and unused steps
- Optimizing a target squad's MANIFEST playbook based on evidence
- Extracting reusable knowledge from INTEL/findings into new skills
- Pruning stale or never-referenced INTEL entries
- Updating CHANGELOG and opening PRs to swat-marketplace

**Out of scope:**
- Creating squads from scratch (that's squad-forge)
- Modifying squad/skill based on user feature requests without operation history (that's squad-forge)
- Executing domain tasks (stock analysis, code review, etc.)
- Modifying SWAT core code (that's swat-dev)
- Verifying INTEL accuracy by running live tests (that's the target squad's job)

## Write Access

- `~/.swat/repos/swat-marketplace/` — worktree created via git-pr skill

## Squad Playbook

### Setup

1. Set up worktree using git-pr skill: bare clone to `~/.swat/repos/swat-marketplace/`, worktree into `repo/`
2. Repository: `https://github.com/LangSensei/swat-marketplace`

### Input Resolution

The brief must specify:
- **Target squad name** — which squad to analyze
- **Scope** — one or more of: `optimize-manifest`, `extract-skill`, `prune-intel`, or `full` (all three)
- **Operation range** — "last N operations" or "all" (default: last 10)

Resolve the target squad's paths:
- Blueprint: `~/.swat/blueprints/squads/{target}/`
- Operations: `~/.swat/squads/{target}/operations/`
- Installed INTEL: `~/.swat/squads/{target}/INTEL.md`

### Analysis Phase

1. **Read target squad context:**
   - MANIFEST.md (understand the squad's domain, boundary, and playbook)
   - INTEL.md (current accumulated experience)

2. **Read operation history** — for each operation in scope:
   - `OPERATION.md` — task brief and outcome
   - `operators/captain/findings.md` — what was discovered
   - `operators/captain/knowledge.md` — distilled knowledge (if exists)
   - `report.html` — final output (fallback only if findings/knowledge are missing)
   - Skip failed/cancelled operations unless analyzing failure patterns

3. **Pattern identification** — look for:
   - **Repeated workarounds** — same problem solved the same way 3+ times → should be in Playbook
   - **Recurring failures** — same error across operations → needs a guard in Playbook or a fix
   - **Skipped steps** — Playbook steps that are consistently skipped → remove or mark optional
   - **Missing steps** — actions Captain consistently does that aren't in Playbook → add them
   - **Stale INTEL** — entries that haven't been referenced or relevant in recent operations → candidate for removal
   - **Reusable knowledge** — domain-agnostic techniques or API patterns that other squads could benefit from → candidate for new skill

### Optimization Phase

Based on analysis, make changes to marketplace files:

#### Optimize MANIFEST (`optimize-manifest`)

- Update Squad Playbook section with evidence-backed changes
- Every change must cite the operation(s) that justify it
- Do NOT change Domain, Boundary, or Output Schema unless explicitly requested
- Bump version (patch for small fixes, minor for significant playbook changes)

#### Extract Skill (`extract-skill`)

- Create new `skills/{name}/SKILL.md` with frontmatter + actionable content
- Skill must be squad-agnostic — usable by any squad that needs this capability
- Add the skill to target squad's `dependencies.skills` in MANIFEST
- Create `skills/{name}/CHANGELOG.md`

#### Prune INTEL (`prune-intel`)

- List INTEL entries with last-referenced operation and reference count
- Entries referenced 0 times in the analysis window → recommend deletion
- Entries contradicted by recent findings → recommend update or deletion
- Do NOT directly modify the installed INTEL file — include pruning recommendations in the report for human review

### Delivery

1. Update CHANGELOG.md for every modified squad/skill
2. One PR per distill operation — title format: `distill({target-squad}): {summary}`
3. PR body must include:
   - Evidence summary: which operations were analyzed
   - Changes made with justification
   - INTEL entries pruned (if any)

### Constraints

- **Evidence-based only** — every change must trace back to specific operation(s). No speculative improvements.
- **Conservative by default** — when unsure if a pattern is real, leave it in INTEL rather than promoting to Playbook. Premature optimization is worse than no optimization.
- **Do not execute domain tasks** — you analyze history, you don't re-run analyses or call domain APIs.
- **One version bump per PR**
- **All content in English**
- **Do not duplicate PROTOCOL behavior** — seal steps, report generation, and planning file setup are handled by PROTOCOL.md. Changes to MANIFEST should only touch domain-specific knowledge in the Squad Playbook.

Report should include: operations analyzed, patterns identified, changes made (with evidence), INTEL entries pruned, and recommendations for future distill cycles.

## Output Schema

Captain must fill these frontmatter fields in `OPERATION.md` during the operation:

```yaml
target_squad: # squad being analyzed
operations_analyzed: # number of operations reviewed
manifest_changes: # number of playbook changes made
skills_extracted: [] # list of new skill names (if any)
intel_pruned: # number of INTEL entries removed
pr_url: # GitHub PR link to marketplace
pr_number: # PR number
```
