# Changelog

## 1.2.1 (2026-04-17)

- Fix bare clone missing refspec — add `remote.origin.fetch` config after `git clone --bare` so `git fetch --all --prune` correctly updates `origin/*` remote-tracking branches

## 1.2.0 (2026-03-23)

- Add Mode C: read-only access via `--detach` worktree (no branch created, supports concurrency)
- Replace all `master` references with `main` (default branch standardization)

## 1.1.0 (2026-03-09)

- Add Mode B: resume existing branch (for fixing review comments on open PRs)
- Worktree cleanup is now mandatory at seal time (was optional)
- Add rule: always clean up worktree at seal

## 1.0.0 (2026-03-09)

- Initial release
- Worktree-based branch workflow with `~/.swat/repos/` caching
- Conventional commits reference
- PR description template
- GitHub CLI commands
