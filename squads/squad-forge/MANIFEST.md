---
name: squad-forge
version: "1.1.0"
description: Creates new SWAT squads and skills — generates MANIFEST.md, SKILL.md, and CHANGELOG.md, then opens a PR to the marketplace
dependencies:
  skills: [sop, git-pr]
  mcps: [swat]
---

# Squad Forge Squad

## Domain

Creating new SWAT squads and skills for the swat-marketplace repository.

## Boundary

**In scope:**
- Creating new squad MANIFEST.md from user requirements
- Creating new skill SKILL.md when needed
- Creating CHANGELOG.md for all new content
- Updating existing squad/skill files based on user requirements
- Opening PRs to swat-marketplace

**Out of scope:**
- Modifying SWAT core code (that's swat-dev)
- Installing squads (that's HQ via swat_install)
- Modifying the PROTOCOL or framework files

## Write Access

- `~/.swat/repos/swat-marketplace/` — worktree created via git-pr skill

## Squad Playbook

### Setup

1. Set up worktree using git-pr skill: bare clone to `~/.swat/repos/swat-marketplace/`, worktree into `repo/`
2. Repository: `https://github.com/LangSensei/swat-marketplace`

### References

- **[TEMPLATE.md](https://github.com/LangSensei/swat/blob/main/blueprints/squads/_framework/TEMPLATE.md)** — all new squads must follow this format exactly
- **[PROTOCOL.md](https://github.com/LangSensei/swat/blob/main/blueprints/squads/_framework/PROTOCOL.md)** — understand what the framework already provides; do not duplicate protocol behavior in MANIFEST

### Creating a Squad

1. Create `squads/<new-name>/MANIFEST.md` using the TEMPLATE.md format from the References section above
2. Study 2-3 existing squads in `squads/` for reference
3. Fill in all sections: Domain, Boundary, Write Access, Squad Playbook
4. Create `squads/<new-name>/CHANGELOG.md`

### Creating a Skill

1. Study 2-3 existing skills in `skills/` for structure reference
2. Write `skills/<new-name>/SKILL.md` with frontmatter + practical how-to guide
3. Skills are reference material for the Captain — be concise, actionable, include copy-paste-ready commands
4. Create `skills/<new-name>/CHANGELOG.md`

### Naming Conventions

- Squad names: kebab-case, must match folder name (`a-share-analyst`, `swat-dev`)
- Skill names: kebab-case, must match folder name (`eastmoney-data`, `git-pr`)
- Frontmatter `name:` field must equal the folder name exactly

### Delivery

1. Push and open PR against `main`

### Debrief Rules (mandatory)

These rules override any general debrief guidance. Follow them exactly.

**PR was opened or updated → Dispatch to squad-lint**

Every completed squad-forge operation that opens a PR (or pushes to an existing PR) must use Exit 2 (Dispatch) to hand off to squad-lint for validation. This is not optional.

Dispatch brief to squad-lint must include:
1. **PR number** — the PR to lint
2. **Repository** — full owner/repo
3. **Branch name** — the branch that was pushed
4. **Summary of changes** — what the PR does and why
5. **Files changed** — list of modified files

**No PR opened → Notify**

If the operation did not open or update a PR (e.g., the task was analysis-only, or the build failed before PR creation), use Exit 1 (Notify) to report the outcome.

### Constraints

- **All content in English** — no Chinese in source files
- **Reuse existing skills** — don't recreate what already exists
- **One PR per operation**
- **Do not duplicate PROTOCOL behavior** — seal steps, report generation instructions, and planning file setup are handled by PROTOCOL.md. MANIFEST should only contain domain-specific knowledge.
- **Write Access: squad-specific paths only** — do not list PROTOCOL defaults (operator directory, OPERATION.md). Use `(none — ...)` if no additional paths needed.
- **Report content as guidance, not instructions** — use "Report should include: ..." to describe what belongs in the report. Do not write "Generate report.html" (PROTOCOL S3 handles that).
- **Boundary format: In scope / Out of scope** — use `**In scope:**` and `**Out of scope:**` bullet groups
- **Title: human-readable** — `# {Squad Name} Squad`, can differ from kebab-case frontmatter `name:`
- **One version bump per PR** — do not bump version in multiple commits within the same PR
- **CHANGELOG format** — version headers must use `## X.Y.Z (YYYY-MM-DD)` format (parentheses around date, not em-dash). Example: `## 1.2.0 (2026-04-17)`
- **Version bump guidance** — patch (`X.Y.Z+1`) for bug fixes and minor edits; minor (`X.Y+1.0`) for new features, sections, or behavioral changes; major (`X+1.0.0`) for breaking changes or full rewrites

Report should include: design decisions, implementation approach, justifications for key choices, and a summary of changes made.
