---
name: squad-lint
version: "1.0.1"
description: Validates structural compliance of squads and skills in swat-marketplace
dependencies:
  skills: [sop, git-pr]
  mcps: [swat]
---

# Squad Lint Squad

## Domain

Structural validation of squads and skills in the swat-marketplace repository. Checks frontmatter, dependencies, cross-file consistency, and hook configuration to ensure all marketplace content meets quality standards.

## Boundary

**In scope:**
- Validating SKILL.md and MANIFEST.md frontmatter (required fields, semver format)
- Checking dependency references (skills, MCPs) exist in the marketplace
- Verifying hook configuration (hooks.json validity, script pairing)
- Checking CHANGELOG.md existence and version consistency
- Validating SETUP.md structure (if present)
- Cross-file consistency checks (version match, orphan file detection)

**Out of scope:**
- Modifying any files (lint is read-only)
- Validating code logic or runtime behavior
- Installing or testing squads/skills
- Reviewing prose quality or documentation style

## Write Access

(none — all output stays in operation directory)

## Squad Playbook

### Setup

1. Set up worktree using git-pr skill: bare clone to `~/.swat/repos/swat-marketplace/`, worktree into `repo/`
2. Repository: `https://github.com/LangSensei/swat-marketplace`
3. Use git-pr Mode C (read-only) — squad-lint does not push changes

### Lint Checks

Execute each check phase in order. For each item checked, record pass/fail/warning with the file location.

#### Phase 1: SKILL.md Frontmatter

For each `skills/*/SKILL.md`:
- Required fields present: `name`, `version`, `description`
- `name` matches the folder name (kebab-case)
- `version` follows semver format (`X.Y.Z`)
- If `dependencies.skills` is declared, each referenced skill exists in `skills/`
- If `dependencies.mcps` is declared, each referenced MCP exists in `mcps/`
- If `prereq` is declared in frontmatter, the referenced file must exist (e.g. `prereq: references/SETUP.md` means `skills/<name>/references/SETUP.md` must exist)

#### Phase 2: MANIFEST.md Validation

For each `squads/*/MANIFEST.md`:
- Required fields present: `name`, `version`, `description`
- `name` matches the folder name (kebab-case)
- `version` follows semver format (`X.Y.Z`)
- `dependencies.skills` includes at least one methodology skill (`sop` or `scientific-method`)
- Each skill in `dependencies.skills` exists in `skills/`
- Each MCP in `dependencies.mcps` exists in `mcps/`
- Required sections present: `## Domain`, `## Boundary`, `## Write Access`, `## Squad Playbook`

#### Phase 3: Hook Configuration

For each `skills/*/hooks/` directory:
- Hook JSON lives at `skills/<name>/hooks/<name>.json` (e.g. `skills/sop/hooks/sop.json`)
- Hook scripts live at `skills/<name>/hooks/<name>-scripts/` (e.g. `skills/sop/hooks/sop-scripts/staleness-check.sh`)
- If a hook JSON file exists, validate it is well-formed JSON
- Each script referenced in the hook JSON exists in the corresponding scripts directory
- Bash scripts (`.sh`) have a paired PowerShell script (`.ps1`) and vice versa

#### Phase 4: CHANGELOG Validation

For each squad or skill directory:
- `CHANGELOG.md` exists
- Latest version entry in CHANGELOG matches the frontmatter `version`
- CHANGELOG follows Keep a Changelog format (version header with date)
- One PR should have at most one version bump per squad/skill — multiple version entries with the same date in CHANGELOG suggest unnecessary intermediate bumps

#### Phase 5: SETUP.md Validation

For each `skills/*/references/SETUP.md` (if present):
- Each section has both a `Check` and `Steps` subsection
- Platform labels are consistent (`Linux/macOS`, `Windows`)
- No empty sections

#### Phase 6: Cross-File Consistency

- Frontmatter `version` matches the latest CHANGELOG version for every squad and skill
- All files referenced in MANIFEST.md or SKILL.md exist (no broken links)
- No orphan files in `references/` subdirectories (if present)
- Folder names match frontmatter `name` fields across the repository

### Delivery

1. Compile all check results into a structured report
2. Clean up worktree (mandatory): `cd ~/.swat/repos/swat-marketplace && git worktree remove "$(pwd)/repo" --force`

**Debrief hint:** All checks pass → notify. Failures found → dispatch fix operation (include file paths and failure details so squad-forge can address them).

### Constraints

- **Read-only** — never modify marketplace files
- **All output in English**
- **One operation per lint run** — lint the entire marketplace in a single pass
- **Fail loudly** — every check must produce a clear pass/fail/warning result with file path

Report should include: per-skill/squad results grouped, each check marked pass/fail/warning with file location, summary with totals (X passed, Y failed, Z warnings).
