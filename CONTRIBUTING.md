# Contributing to SWAT Marketplace

We welcome new capabilities! Here's how to structure your contribution.

## 1. Skills

Skills are PowerShell modules (`.psm1`) that export functions. They live in `skills/<skill-name>/`.

- **Structure:**
  ```
  skills/
    my-skill/
      my-skill.psm1    # The main logic
      README.md        # Documentation
  ```
- **Rules:**
  - Export functions as `Verb-Noun` (e.g., `Get-MyData`, `Invoke-MyAction`).
  - Use `Write-Host` sparingly; return objects whenever possible.
  - Include `SYNOPSIS` and `EXAMPLE` in your function comments.

## 2. Squads

Squads are agent definitions. They live in `squads/<squad-name>/`.

- **Structure:**
  ```
  squads/
    my-squad/
      manifest.json    # The definition
      instructions.md  # The system prompt
  ```
- **Manifest:**
  See existing squads for examples. Define required skills and MCP servers.

## 3. Submission

1. Fork this repo.
2. Create a branch (`feat/add-my-skill`).
3. Test locally by symlinking into `~/.swat/skills/`.
4. Submit a PR.
