---
name: squad-forge
version: "1.0.0"
description: Creates new SWAT squads and skills — generates MANIFEST.md, SKILL.md, and CHANGELOG.md, then opens a PR to the marketplace
dependencies:
  skills: [git-pr]
  mcps: []
---

# Squad Forge

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

## Workflow

1. Read OPERATION.md for the requirement (what squad/skill to create)
2. Set up worktree to `swat-marketplace` using git-pr skill
3. Study existing examples:
   - Read 2-3 existing squad MANIFESTs in `squads/` for structure reference
   - Read 2-3 existing skills in `skills/` if creating skills
4. Design the squad:
   - Identify domain and boundary (in scope / out of scope)
   - Determine skill dependencies (reuse existing skills when possible)
   - Define workflow steps
   - Define constraints and output format
5. Write the files:
   - `squads/<name>/MANIFEST.md` — frontmatter + full squad definition
   - `squads/<name>/CHANGELOG.md`
   - `skills/<name>/SKILL.md` if new skills needed
   - `skills/<name>/CHANGELOG.md` for each new skill
6. Push and open PR against `main`
7. Record PR link in OPERATION.md summary

## MANIFEST Structure

Every squad MANIFEST.md must follow this structure:

```yaml
---
name: Human Readable Name
version: "1.0.0"
description: One-line description
dependencies:
  skills: [skill-a, skill-b]
  mcps: []
---
```

Body sections:
- **Domain** — What area this squad covers
- **Boundary** — In scope / Out of scope (be explicit)
- **Workflow** — Numbered steps Captain follows
- **Constraints** — Hard rules and limitations
- **Output** — What the squad produces
- **Report** — Whether report.html is needed and completion criteria

## SKILL Structure

Every skill SKILL.md must follow this structure:

```yaml
---
name: skill-name
version: "1.0.0"
description: One-line description
dependencies:
  skills: []
---
```

Body: practical how-to guide with code examples. Skills are reference material for the Captain — be concise, actionable, and include copy-paste-ready commands.

## Naming Conventions

- Squad names: kebab-case, must match folder name (`a-share-analyst`, `swat-dev`)
- Skill names: kebab-case, must match folder name (`eastmoney-data`, `git-pr`)
- Frontmatter `name:` field must equal the folder name exactly

## Constraints

- **All content in English** — no Chinese in source files
- **Reuse existing skills** — don't recreate what already exists
- **One PR per operation** — keep changes focused
- **Marketplace repo**: `https://github.com/LangSensei/swat-marketplace`
- **Base branch**: `main`

## Output

- A pull request on swat-marketplace
- PR link recorded in OPERATION.md summary
- `status: completed` set after PR is opened

## Report

No report.html needed. The PR itself is the deliverable.
