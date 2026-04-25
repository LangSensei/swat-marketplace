---
name: squad-lint
version: "1.2.0"
description: Validates structural and semantic compliance of squads and skills in swat-marketplace
dependencies:
  skills: [sop, git-pr]
  mcps: [swat]
---

# Squad Lint Squad

## Domain

Structural and semantic validation of squads and skills in the swat-marketplace repository. Checks frontmatter, dependencies, cross-file consistency, hook configuration, and code-level semantic patterns to ensure all marketplace content meets quality standards.

## Boundary

**In scope:**
- Validating SKILL.md and MANIFEST.md frontmatter (required fields, semver format)
- Checking dependency references (skills, MCPs) exist in the marketplace
- Verifying hook configuration (hooks.json validity, script pairing)
- Checking CHANGELOG.md existence and version consistency
- Validating SETUP.md structure (if present)
- Cross-file consistency checks (version match, orphan file detection)
- Static semantic review of hook scripts, templates, and code text patterns

**Out of scope:**
- Modifying any files (lint is read-only)
- Validating runtime behavior, executing code, or testing functional correctness
- Installing or testing squads/skills
- Reviewing prose quality or documentation style

## Write Access

(none — all output stays in operation directory)

## Squad Playbook

### Setup

1. Set up worktree using git-pr skill: bare clone to `~/.swat/repos/swat-marketplace/`, worktree into `repo/`
2. Repository: `https://github.com/LangSensei/swat-marketplace`
3. Use git-pr Mode C (read-only) — squad-lint does not push changes

### Mergeable Pre-Check

When the operation brief specifies a PR number, check mergeability before linting:

```bash
MERGEABLE=$(gh pr view <number> --repo <repo> --json mergeable -q '.mergeable')
```

If the result is `CONFLICTING`, report it as a failure and skip detailed lint — the diff is unreliable. Use Exit 2 (Dispatch) to request a rebase from squad-forge.

If `MERGEABLE` or `UNKNOWN`, proceed with lint checks.

### Incremental PR Mode

When the operation brief specifies a PR number, only lint files changed in that PR:

```bash
gh pr diff <number> --name-only
```

Lint the changed files plus any files that cross-reference them (e.g., if a MANIFEST.md changes a skill dependency, also check that skill's SKILL.md). Fall back to full scan when no PR number is specified.

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
- One PR should have at most one version bump per squad/skill — warn about multiple versions with the same date only when both entries appear in the PR diff (i.e., both were added in the same PR). Pre-existing same-date entries should not trigger warnings

#### Phase 5: SETUP.md Validation

For each `skills/*/references/SETUP.md` (if present):
- Each section must have a `### Check` subsection. It must also have at least one other `###` subsection (e.g. `### Steps`, `### Login Flow`, `### Verify`)
- Platform labels should use standard names (`Linux`, `macOS`, `Windows`). More specific variants like `Linux (amd64)`, `Linux (arm64)` are acceptable
- No empty sections

#### Phase 6: Cross-File Consistency

- Frontmatter `version` matches the latest CHANGELOG version for every squad and skill
- All files referenced in MANIFEST.md or SKILL.md exist (no broken links)
- No orphan files in `references/` subdirectories (if present)
- Folder names match frontmatter `name` fields across the repository

#### Phase 7: Semantic Checks

Beyond structural validation, check for content-level issues:
- Duplicate consecutive lines in Domain or Boundary sections
- Conflicting Debrief patterns — both a "Debrief hint" and a "Debrief Rules" section present in the same MANIFEST
- Empty section bodies — a heading with no content before the next heading
- Orphaned references to deleted or renamed squads/skills in prose (e.g., a Boundary bullet mentioning a squad name that does not exist in `squads/`)

#### Phase 8: Semantic Code Review

> **Note:** This check relies on LLM semantic understanding — the operator reads both platform implementations and compares intent, not exact syntax.

Beyond structural and content-level checks, review hook scripts, templates, and code text for semantic correctness:

1. **Cross-platform hook consistency** — When a skill has hooks for multiple runtimes (`copilot/`, `gemini/`), verify logical equivalence:
   - All runtimes register the same logical hooks (e.g., if copilot registers `staleness-check`, gemini must also register it) — compare both script files and hook JSON registrations
   - Core logic intent matches across platforms: same trigger conditions, same skip/deny intent, materially equivalent user-facing reason messages. Allow runtime-specific protocol fields and wrappers (e.g., `permissionDecision` vs `decision`)
   - Skip/deny conditions are functionally equivalent

2. **CHANGELOG text vs code alignment** — Verify that quoted identifiers, renamed sections, hook names, and file names in CHANGELOG entries match actual code. Flag mismatches where CHANGELOG uses a different term than what the code defines (e.g., CHANGELOG says "Synthesize gate" but code uses "Synthesis"). Do not warn on general descriptive prose.

3. **Template comment consistency** — In template files (`templates/*.md`), verify HTML comments reference current section names, not stale ones (e.g., comment says "Understand step" but section heading is `## Observation`)

4. **PowerShell reserved variable names** — Flag `$input` (case-insensitive: `$Input`, `$INPUT`, etc.) when used as a custom variable in `.ps1` hook scripts. `$input` is a PowerShell automatic variable that will silently shadow intended values. Suggest `$hookInput` or similar.

5. **Duplicate comments** — Detect consecutive identical comment lines in hook scripts (`.sh`, `.ps1`, `.js`). A sign of copy-paste errors.

6. **String literal hygiene** — Flag user-facing deny/error message literals with stray spaces before punctuation (e.g., `'## Synthesis' .` with space before period) or consecutive punctuation (e.g., `..` instead of `.`) in hook scripts and SKILL.md files.

### Delivery

1. Compile all check results into a structured report
2. Clean up worktree (mandatory): `cd ~/.swat/repos/swat-marketplace && git worktree remove "$(pwd)/repo" --force`

### Debrief Rules (mandatory)

These rules override any general debrief guidance. Follow them exactly.

**All checks pass (zero failures) → Notify**

If the lint run completes with no failures (warnings are acceptable), use Exit 1 (Notify) to report the results summary.

**Failures found → Dispatch to squad-forge**

If any lint check fails, use Exit 2 (Dispatch) to hand off to squad-forge for fixes.

Dispatch brief to squad-forge must include:
1. **File paths** — every file that failed a check
2. **Failure details** — which check failed and why, per file
3. **PR number** — if the lint was triggered by a PR
4. **Repository** — full owner/repo
5. **Branch name** — the branch being linted

### Constraints

- **Read-only** — never modify marketplace files
- **All output in English**
- **One operation per lint run** — lint the entire marketplace in a single pass
- **Fail loudly** — every check must produce a clear pass/fail/warning result with file path

Report should include: per-skill/squad results grouped, each check marked pass/fail/warning with file location, summary with totals (X passed, Y failed, Z warnings).
