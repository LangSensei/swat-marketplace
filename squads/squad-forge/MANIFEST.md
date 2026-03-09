---
name: squad-forge
version: "1.0.0"
description: Creates new SWAT squads and skills — generates MANIFEST.md, SKILL.md, and CHANGELOG.md, then opens a PR to the marketplace
dependencies:
  skills: [git-pr]
  mcps: []
---

# Squad Forge Squad

## Domain

Creating new SWAT squads and skills for the swat-marketplace repository.

## Boundary

**In scope:**
- Creating new squad MANIFEST.md from user requirements
- Creating new skill SKILL.md when needed
- Creating CHANGELOG.md for all new content
- Updating existing squad/skill files
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

- **[TEMPLATE.md](https://github.com/LangSensei/swat-v2/blob/master/blueprints/squads/_framework/TEMPLATE.md)** — all new squads must follow this format exactly
- **[PROTOCOL.md](https://github.com/LangSensei/swat-v2/blob/master/blueprints/squads/_framework/PROTOCOL.md)** — understand what the framework already provides; do not duplicate protocol behavior in MANIFEST

### Creating a Squad

1. Copy `squads/squad-forge/TEMPLATE.md` to `squads/<new-name>/MANIFEST.md`
2. Study 2-3 existing squads in `squads/` for reference
3. Fill in all sections: Domain, Boundary, Write Access, Squad Playbook, Output Schema
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

### Constraints

- **All content in English** — no Chinese in source files
- **Reuse existing skills** — don't recreate what already exists
- **One PR per operation**
- **Do not duplicate PROTOCOL behavior** — seal steps, report generation instructions, and planning file setup are handled by PROTOCOL.md. MANIFEST should only contain domain-specific knowledge.
- **Output Schema: squad-specific fields only** — do not include `summary`, `action_items`, `completed_at`, or other fields already in OPERATION.md template
- **Write Access: squad-specific paths only** — do not list PROTOCOL defaults (operator directory, OPERATION.md). Use `(none — ...)` if no additional paths needed.
- **Report content as guidance, not instructions** — use "Report should include: ..." to describe what belongs in the report. Do not write "Generate report.html" (PROTOCOL S3 handles that).
- **Boundary format: In scope / Out of scope** — use `**In scope:**` and `**Out of scope:**` bullet groups
- **Title: human-readable** — `# {Squad Name} Squad`, can differ from kebab-case frontmatter `name:`
- **One version bump per PR** — do not bump version in multiple commits within the same PR

Report should include: design decisions, implementation approach, justifications for key choices, and a summary of changes made.

## Output Schema

Captain must fill these frontmatter fields in `OPERATION.md` during the operation:

```yaml
pr_url: # GitHub PR link to marketplace
pr_number: # PR number
squads_created: [] # list of new squad names
skills_created: [] # list of new skill names
```
