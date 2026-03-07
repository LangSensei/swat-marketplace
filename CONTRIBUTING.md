# Contributing to SWAT Marketplace

We welcome new capabilities! Here's how to structure your contribution.

## 1. Skills

Skills are tools that extend the agent's capabilities. **They can be written in any language** (PowerShell, Python, Node.js, Go, Rust, etc.).

- **Structure:**
  ```
  skills/
    my-skill/
      SKILL.md         # Manifest (YAML frontmatter) & Documentation
      CHANGELOG.md     # Version history
      ...              # Your implementation files
  ```

- **Manifest (SKILL.md):**
  Must include `name`, `version`, `description` in the YAML frontmatter.

## 2. Squads

Squads are specialized agent configurations.

- **Structure:**
  ```
  squads/
    my-squad/
      MANIFEST.md      # Squad definition (YAML frontmatter) & Overview
      CHANGELOG.md     # Version history
      ...
  ```

- **Manifest (MANIFEST.md):**
  Must include `name`, `version`, `description` in the YAML frontmatter.

## 3. Submission

1. Fork this repo.
2. Create a branch (`feat/add-my-skill`).
3. Test locally by symlinking into `~/.swat/skills/` or `~/.swat/squads/`.
4. Submit a PR.
