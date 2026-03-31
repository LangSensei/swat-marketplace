# BaZi Skill — Setup Guide

## Prerequisites

- Python 3.8 or later
- `pip3` (Python package manager)
- `git` (to clone the bazi calculation engine)
- `git-pr` skill (for shared repository management)

## Installation

### 1. Install Python Dependencies

```bash
pip3 install lunar-python colorama bidict --break-system-packages
```

**Package purposes:**
- `lunar-python` — Solar-Lunar calendar conversion (handles all date math)
- `colorama` — Terminal color output (used by the upstream bazi library)
- `bidict` — Bidirectional dictionary (used for stem/branch/zodiac lookups)

### 2. Clone the BaZi Calculation Engine

The scripts rely on the `china-testing/bazi` repository for core calculation modules (`datas.py`, `ganzhi.py`, `common.py`, etc.).

Use git-pr skill Mode C (read-only) to set up a shared clone pinned to a known-good commit:

```bash
REPO_NAME="china-testing-bazi"
REPO_URL="https://github.com/china-testing/bazi"
REPO_DIR="$HOME/.swat/repos/$REPO_NAME"
WORKTREE_DIR="$REPO_DIR/worktrees/readonly"
PINNED_COMMIT="c425f0c"

# Clone or fetch
if [ -d "$REPO_DIR" ]; then
  cd "$REPO_DIR" && git fetch --all --prune
else
  git clone --bare "$REPO_URL" "$REPO_DIR"
fi

# Create detached worktree pinned to specific commit
cd "$REPO_DIR"
mkdir -p worktrees
git worktree add --detach "$WORKTREE_DIR" "$PINNED_COMMIT"
```

The scripts will find the bazi modules at `~/.swat/repos/china-testing-bazi/worktrees/readonly/`.

### 3. Verify Installation

```bash
# Test that dependencies are importable
python3 -c "from lunar_python import Solar; print(Solar.fromYmd(2026, 1, 1).getLunar())"

# Test a script
python3 scripts/bazi-analysis.py --help
```

## Cleanup

When done with the worktree (at operation seal time):

```bash
cd "$HOME/.swat/repos/china-testing-bazi"
git worktree remove worktrees/readonly --force
```

## Troubleshooting

- **ModuleNotFoundError: No module named 'lunar_python'** — Run `pip3 install lunar-python --break-system-packages`
- **ModuleNotFoundError: No module named 'datas'** — Ensure the worktree at `~/.swat/repos/china-testing-bazi/worktrees/readonly/` exists and contains `datas.py`. Re-run the setup steps.
- **Permission denied on pip** — Use `--break-system-packages` flag or install in a virtual environment.
